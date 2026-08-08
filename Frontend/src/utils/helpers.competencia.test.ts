import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCompetenciasFuturas,
  montarCompetenciaComDia,
  temDiaNaCompetencia,
} from "./helpers";

describe("helpers competencia com dia", () => {
  describe("when competencia has day", () => {
    it("should detect day presence", () => {
      assert.equal(temDiaNaCompetencia("2026-08-05"), true);
      assert.equal(temDiaNaCompetencia("2026-08"), false);
    });
  });

  describe("when building future competencias with day", () => {
    it("should preserve day across months and clamp February", () => {
      assert.deepEqual(getCompetenciasFuturas("2026-01-31", 2), [
        "2026-01-31",
        "2026-02-28",
      ]);
      assert.equal(montarCompetenciaComDia("2026-02", 31), "2026-02-28");
    });
  });
});
