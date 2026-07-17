import { describe, expect, it } from "vitest";
import { classifyTestDeliveryStatus } from "./platformSendStatus";

describe("classifyTestDeliveryStatus", () => {
  it("treats enqueued and delayed as pending", () => {
    expect(classifyTestDeliveryStatus("enqueued")).toBe("pending");
    expect(classifyTestDeliveryStatus("delayed")).toBe("pending");
  });

  it("treats sent, delivered and sandbox as success", () => {
    expect(classifyTestDeliveryStatus("sent")).toBe("success");
    expect(classifyTestDeliveryStatus("delivered")).toBe("success");
    expect(classifyTestDeliveryStatus("sandbox")).toBe("success");
  });

  it("treats failed, bounced and blacklisted as failure", () => {
    expect(classifyTestDeliveryStatus("failed")).toBe("failure");
    expect(classifyTestDeliveryStatus("bounced")).toBe("failure");
    expect(classifyTestDeliveryStatus("blacklisted")).toBe("failure");
  });

  it("defaults unknown statuses to pending", () => {
    expect(classifyTestDeliveryStatus("unknown")).toBe("pending");
  });
});
