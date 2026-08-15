/**
 * Migração one-shot do redesenho financeiro (expand → migrate).
 *
 * Uso:
 *   yarn migrate:fluxo-financeiro:dry
 *   yarn migrate:fluxo-financeiro --user=<ObjectId>
 *   yarn migrate:fluxo-financeiro
 */
import mongoose, { Types } from 'mongoose';

const NOME_ORIGEM = 'Salário';
const NOME_ORIGEM_FALLBACK = 'Receitas';

interface CliOptions {
  dryRun: boolean;
  userId?: string;
}

function parseArgs(argv: string[]): CliOptions {
  const dryRun = argv.includes('--dry-run');
  const userFlag = argv.find((arg) => arg.startsWith('--user='));
  const userId = userFlag?.slice('--user='.length)?.trim() || undefined;
  return { dryRun, userId };
}

function requireMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim() || process.env.MONGO_URI?.trim();
  if (!uri) {
    throw new Error('Defina MONGODB_URI (ou MONGO_URI) no ambiente / .env');
  }
  return uri;
}

async function listUserIds(onlyUserId?: string): Promise<Types.ObjectId[]> {
  if (onlyUserId) {
    if (!Types.ObjectId.isValid(onlyUserId)) {
      throw new Error(`userId inválido: ${onlyUserId}`);
    }
    return [new Types.ObjectId(onlyUserId)];
  }
  const users = await mongoose.connection
    .collection('users')
    .find({}, { projection: { _id: 1 } })
    .toArray();
  return users.map((user) => user._id as Types.ObjectId);
}

async function sumSaldos(userId: Types.ObjectId): Promise<number> {
  const caixas = await mongoose.connection
    .collection('caixas')
    .find({ user: userId }, { projection: { saldo: 1 } })
    .toArray();
  return caixas.reduce((sum, caixa) => sum + (Number(caixa.saldo) || 0), 0);
}

async function ensureOrigemCaixa(
  userId: Types.ObjectId,
  dryRun: boolean,
): Promise<Types.ObjectId> {
  const caixas = mongoose.connection.collection('caixas');
  const existentes = await caixas.find({ user: userId, tipo: 'origem' }).toArray();
  if (existentes[0]?._id) {
    return existentes[0]._id as Types.ObjectId;
  }

  const nomeConflito = await caixas.findOne({ user: userId, nome: NOME_ORIGEM });
  const nome = nomeConflito ? NOME_ORIGEM_FALLBACK : NOME_ORIGEM;

  console.log(`  + criar caixa origem "${nome}" (saldo 0)`);
  if (dryRun) {
    return new Types.ObjectId();
  }

  const inserted = await caixas.insertOne({
    user: userId,
    nome,
    saldo: 0,
    comprometido: 0,
    tipo: 'origem',
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return inserted.insertedId;
}

async function competenciaAtualMes(): Promise<string> {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
}

async function recalcularComprometidos(
  userId: Types.ObjectId,
  dryRun: boolean,
): Promise<void> {
  const caixasCol = mongoose.connection.collection('caixas');
  const contasCol = mongoose.connection.collection('contas');
  const caixas = await caixasCol.find({ user: userId }).toArray();
  const mesAtual = await competenciaAtualMes();

  for (const caixa of caixas) {
    const caixaId = caixa._id as Types.ObjectId;
    const contas = await contasCol
      .find({
        user: userId,
        caixaId,
        tipo: 'a_pagar',
        status: 'aberta',
        competencia: mesAtual,
      })
      .toArray();
    const comprometido = contas.reduce(
      (sum, conta) => sum + (Number(conta.valor) || 0),
      0,
    );
    const atual = Number(caixa.comprometido) || 0;
    if (atual === comprometido) continue;
    console.log(
      `  ~ caixa ${String(caixa.nome)}: comprometido ${atual} → ${comprometido}`,
    );
    if (!dryRun) {
      await caixasCol.updateOne(
        { _id: caixaId },
        { $set: { comprometido, updatedAt: new Date() } },
      );
    }
  }
}

async function alinharRecorrentesEntrada(
  userId: Types.ObjectId,
  origemId: Types.ObjectId,
  dryRun: boolean,
): Promise<void> {
  const lancamentos = mongoose.connection.collection('lancamentos');
  const contas = mongoose.connection.collection('contas');
  const recorrentes = await lancamentos
    .find({
      user: userId,
      tipo: 'entrada',
      recorrente: true,
      ativo: { $ne: false },
    })
    .toArray();

  for (const recorrente of recorrentes) {
    const atual = recorrente.caixaOrigem?.toString();
    if (atual === origemId.toString()) continue;
    console.log(
      `  ~ recorrente entrada ${String(recorrente.descricao)}: caixaOrigem → origem`,
    );
    if (!dryRun) {
      await lancamentos.updateOne(
        { _id: recorrente._id },
        { $set: { caixaOrigem: origemId, updatedAt: new Date() } },
      );
    }

    const abertas = await contas
      .find({
        user: userId,
        tipo: 'a_receber',
        status: 'aberta',
        recorrenteId: recorrente._id,
      })
      .toArray();
    for (const conta of abertas) {
      if (conta.caixaId?.toString() === origemId.toString()) continue;
      console.log(
        `  ~ a_receber ${String(conta.descricao)} (${String(conta.competencia)}): caixaId → origem`,
      );
      if (!dryRun) {
        await contas.updateOne(
          { _id: conta._id },
          { $set: { caixaId: origemId, updatedAt: new Date() } },
        );
      }
    }
  }
}

async function migrateUser(
  userId: Types.ObjectId,
  dryRun: boolean,
): Promise<void> {
  console.log(`\nUsuário ${userId.toString()}`);
  const saldoAntes = await sumSaldos(userId);

  const origemId = await ensureOrigemCaixa(userId, dryRun);
  await recalcularComprometidos(userId, dryRun);
  await alinharRecorrentesEntrada(userId, origemId, dryRun);

  const saldoDepois = dryRun ? saldoAntes : await sumSaldos(userId);
  if (Math.abs(saldoAntes - saldoDepois) > 0.001) {
    throw new Error(
      `Invariante quebrada: saldo antes=${saldoAntes} depois=${saldoDepois}`,
    );
  }
  console.log(`  OK soma saldos=${saldoAntes}`);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const uri = requireMongoUri();

  console.log(
    options.dryRun
      ? '=== DRY-RUN migrate-fluxo-financeiro ==='
      : '=== APPLY migrate-fluxo-financeiro ===',
  );

  await mongoose.connect(uri);
  try {
    const userIds = await listUserIds(options.userId);
    console.log(`Usuários a processar: ${userIds.length}`);
    for (const userId of userIds) {
      await migrateUser(userId, options.dryRun);
    }
    console.log('\nConcluído.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
