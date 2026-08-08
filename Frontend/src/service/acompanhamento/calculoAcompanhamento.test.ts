import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calcEvolucaoRiscoMes } from "./calculoAcompanhamento";
import type { Lancamento } from "@/types/flux";

function lancamentoBase(
  parcial: Partial<Lancamento> & Pick<Lancamento, "id" | "tipo" | "valor" | "competencia">
): Lancamento {
  return {
    horizonte: "presente",
    descricao: parcial.descricao ?? "item",
    recorrente: parcial.recorrente ?? false,
    ...parcial,
  };
}

describe("calcEvolucaoRiscoMes", () => {
  describe("when there is a non-recurring entry on day 5", () => {
    it("should keep expected risk flat and lower real risk from day 5", () => {
      const lancamentos: Lancamento[] = [
        lancamentoBase({
          id: "salario",
          tipo: "entrada",
          valor: 1000,
          competencia: "2026-08-01",
          competenciaInicial: "2026-08-01",
          recorrente: true,
          duracaoMeses: 12,
          ativo: true,
          descricao: "Salário",
        }),
        lancamentoBase({
          id: "aluguel",
          tipo: "saida",
          valor: 500,
          competencia: "2026-08-01",
          competenciaInicial: "2026-08-01",
          recorrente: true,
          duracaoMeses: 12,
          ativo: true,
          descricao: "Aluguel",
        }),
        lancamentoBase({
          id: "extra",
          tipo: "entrada",
          valor: 200,
          competencia: "2026-08-05",
          recorrente: false,
          descricao: "Renda extra",
        }),
      ];

      const pontos = calcEvolucaoRiscoMes("2026-08", lancamentos);
      const dia4 = pontos.find((ponto) => ponto.dia === 4);
      const dia5 = pontos.find((ponto) => ponto.dia === 5);

      assert.ok(dia4);
      assert.ok(dia5);
      assert.equal(dia4.riscoEsperado, 50);
      assert.equal(dia5.riscoEsperado, 50);
      assert.equal(dia4.riscoReal, 50);
      assert.ok(dia5.riscoReal < dia4.riscoReal);
      assert.equal(dia5.riscoReal, 30);
    });
  });

  describe("when there is a non-recurring exit on day 5", () => {
    it("should raise real risk from day 5 while expected stays flat", () => {
      const lancamentos: Lancamento[] = [
        lancamentoBase({
          id: "salario",
          tipo: "entrada",
          valor: 1000,
          competencia: "2026-08-01",
          competenciaInicial: "2026-08-01",
          recorrente: true,
          duracaoMeses: 12,
          ativo: true,
          descricao: "Salário",
        }),
        lancamentoBase({
          id: "aluguel",
          tipo: "saida",
          valor: 400,
          competencia: "2026-08-01",
          competenciaInicial: "2026-08-01",
          recorrente: true,
          duracaoMeses: 12,
          ativo: true,
          descricao: "Aluguel",
        }),
        lancamentoBase({
          id: "avulso",
          tipo: "saida",
          valor: 100,
          competencia: "2026-08-05",
          recorrente: false,
          descricao: "Compra",
        }),
      ];

      const pontos = calcEvolucaoRiscoMes("2026-08", lancamentos);
      const dia4 = pontos.find((ponto) => ponto.dia === 4);
      const dia5 = pontos.find((ponto) => ponto.dia === 5);

      assert.ok(dia4);
      assert.ok(dia5);
      assert.equal(dia4.riscoEsperado, 40);
      assert.equal(dia5.riscoEsperado, 40);
      assert.equal(dia4.riscoReal, 40);
      assert.ok(dia5.riscoReal > dia4.riscoReal);
      assert.equal(dia5.riscoReal, 50);
    });
  });
});
