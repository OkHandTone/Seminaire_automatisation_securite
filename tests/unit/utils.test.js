import { describe, it, expect } from "vitest";
import { addition, estPair, inverser, slugifier } from "../../src/utils.mjs";

describe("addition", () => {
  it("additionne deux nombres positifs", () => {
    expect(addition(2, 3)).toBe(5);
  });

  it("gère les nombres négatifs", () => {
    expect(addition(-4, 1)).toBe(-3);
  });
});

describe("estPair", () => {
  it("renvoie true pour un nombre pair", () => {
    expect(estPair(10)).toBe(true);
  });

  it("renvoie false pour un nombre impair", () => {
    expect(estPair(7)).toBe(false);
  });
});

describe("inverser", () => {
  it("inverse une chaîne de caractères", () => {
    expect(inverser("vitest")).toBe("tsetiv");
  });

  it("renvoie une chaîne vide pour une entrée vide", () => {
    expect(inverser("")).toBe("");
  });
});

describe("slugifier", () => {
  it("transforme un titre en slug", () => {
    expect(slugifier("Bonjour le Monde !")).toBe("bonjour-le-monde");
  });

  it("supprime les tirets superflus", () => {
    expect(slugifier("  --Test-- ")).toBe("test");
  });

  it("gère une longue suite de tirets sans ralentir (non-régression ReDoS)", () => {
    expect(slugifier("-".repeat(10000) + "x")).toBe("x");
  });
});
