import { describe, expect, it } from "vitest";
import { getDeliveryStatusMeta } from "./deliveryStatusMeta";

describe("getDeliveryStatusMeta", () => {
  it("returns label and tone for known statuses", () => {
    expect(getDeliveryStatusMeta("sent")).toEqual({
      value: "sent",
      label: "Enviado",
      tone: "info",
    });
    expect(getDeliveryStatusMeta("delivered")).toEqual({
      value: "delivered",
      label: "Entregado",
      tone: "success",
    });
    expect(getDeliveryStatusMeta("bounced")).toEqual({
      value: "bounced",
      label: "Rebotado",
      tone: "destructive",
    });
  });

  it("falls back to muted tone and raw value for unknown statuses", () => {
    expect(getDeliveryStatusMeta("weird")).toEqual({
      value: "weird",
      label: "weird",
      tone: "muted",
    });
  });
});
