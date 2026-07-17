import { describe, expect, it } from "vitest";
import {
  getClientDeliveryErrorMessage,
  extractErrorCodeFromBody,
  resolveClientSendErrorMessage,
} from "./clientDeliveryErrors";

describe("clientDeliveryErrors", () => {
  it("maps MAIL_DELIVERY_NOT_CONFIGURED without provider wording", () => {
    const msg = getClientDeliveryErrorMessage("MAIL_DELIVERY_NOT_CONFIGURED");
    expect(msg).toMatch(/habilitada para enviar/i);
    expect(msg).not.toMatch(/proveedor|smtp/i);
  });

  it("extracts errorCode from API body", () => {
    expect(
      extractErrorCodeFromBody({ errorCode: "MAIL_DELIVERY_INACTIVE" }),
    ).toBe("MAIL_DELIVERY_INACTIVE");
  });

  it("prefers errorCode over raw error text", () => {
    const msg = resolveClientSendErrorMessage({
      error: "Mail delivery channel not configured for client",
      errorCode: "MAIL_DELIVERY_NOT_CONFIGURED",
    });
    expect(msg).toMatch(/administrador de tu organización/i);
  });
});
