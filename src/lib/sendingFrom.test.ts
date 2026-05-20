import { describe, expect, it } from "vitest";
import {
  buildFromHeader,
  parseDefaultFrom,
  resolveInitialSendDomain,
  validateDisplayName,
  validateLocalPart,
} from "./sendingFrom";

describe("sendingFrom", () => {
  it("parseDefaultFrom extracts parts from angle format", () => {
    const p = parseDefaultFrom("Team <hello@mail.example.com>");
    expect(p.displayName).toBe("Team");
    expect(p.localPart).toBe("hello");
    expect(p.domain).toBe("mail.example.com");
  });

  it("buildFromHeader composes address with or without display name", () => {
    expect(buildFromHeader("Notif", "ventas", "cliente.pe")).toBe(
      "Notif <ventas@cliente.pe>",
    );
    expect(buildFromHeader("", "ventas", "cliente.pe")).toBe("ventas@cliente.pe");
  });

  it("validateLocalPart rejects @", () => {
    expect(validateLocalPart("a@b")).not.toBeNull();
    expect(validateLocalPart("ventas")).toBeNull();
  });

  it("validateDisplayName rejects angle brackets", () => {
    expect(validateDisplayName("Bad <name")).not.toBeNull();
    expect(validateDisplayName("")).toBeNull();
  });

  it("resolveInitialSendDomain uses first listed domain", () => {
    expect(resolveInitialSendDomain(["first.com", "second.com"])).toBe("first.com");
  });
});
