import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calcularParcelaMensal,
  round2,
  validarFormularioSimulacao,
} from "./index";

describe("service/simulacao", () => {
  describe("when calculating monthly installment", () => {
    it("should round value to two decimal places", () => {
      const parcela = calcularParcelaMensal("1000", "3");
      assert.equal(parcela, 333.33);
    });
  });

  describe("when declared compensation sources do not match installment", () => {
    it("should return mismatch validation error", () => {
      const erros = validarFormularioSimulacao(
        {
          valorTotal: 4800,
          duracaoMeses: 12,
          dataPrimeiroPagamento: "2026-09-10",
          modoCompensacao: "declarada",
          fontesDeCompensacao: [
            {
              id: "f1",
              tipoOrigem: "orcamento",
              origemId: "caixa-1",
              valorMensalDestinado: 200,
            },
          ],
        },
        400,
      );

      assert.ok(
        erros.includes("A soma das fontes deve ser igual ao valor da parcela mensal."),
      );
    });
  });

  describe("when declared source has negative value", () => {
    it("should return source validation error", () => {
      const erros = validarFormularioSimulacao(
        {
          valorTotal: 1000,
          duracaoMeses: 2,
          dataPrimeiroPagamento: "2026-09-10",
          modoCompensacao: "declarada",
          fontesDeCompensacao: [
            {
              id: "f1",
              tipoOrigem: "objetivo",
              origemId: "obj-1",
              valorMensalDestinado: -10,
            },
          ],
        },
        500,
      );

      assert.ok(
        erros.includes(
          "Revise as fontes: origem obrigatória e valor mensal não pode ser negativo.",
        ),
      );
    });
  });

  describe("when value has many decimal places", () => {
    it("should keep deterministic round2 behavior", () => {
      assert.equal(round2(19.999999), 20);
    });
  });
});
