import { describe, expect, it } from "vitest";
import type { MessageTimelineResponse } from "./platformReports";
import { resolveStatusReason, resolveTimelineStep } from "./messageDetail";

function buildTimeline(
  overrides: Partial<MessageTimelineResponse>,
): MessageTimelineResponse {
  return {
    requestReceivedAt: "2026-08-01T10:00:00.000Z",
    sentAt: "2026-08-01T10:00:05.000Z",
    deliveredAt: null,
    bouncedAt: null,
    failedAt: null,
    firstOpenedAt: null,
    deliveryStatus: "delivered",
    toAddress: "user@test.com",
    subject: "Hola",
    errorCode: null,
    errorDetail: null,
    htmlBody: null,
    textBody: null,
    cc: [],
    bcc: [],
    processLog: null,
    ...overrides,
  };
}

describe("resolveTimelineStep", () => {
  it("maps bounced to error step with bouncedAt", () => {
    const timeline = buildTimeline({
      deliveryStatus: "bounced",
      bouncedAt: "2026-08-01T10:00:10.000Z",
    });
    const view = resolveTimelineStep("deliveredAt", "Confirmación", timeline);
    expect(view.label).toBe("Rebotado");
    expect(view.tone).toBe("error");
    expect(view.value).toBe("2026-08-01T10:00:10.000Z");
  });

  it("maps failed to error step", () => {
    const view = resolveTimelineStep(
      "deliveredAt",
      "Confirmación",
      buildTimeline({ deliveryStatus: "failed", failedAt: "x" }),
    );
    expect(view.label).toBe("Falló");
    expect(view.tone).toBe("error");
  });

  it("maps blacklisted to terminal 'No enviado' with no date", () => {
    const view = resolveTimelineStep(
      "deliveredAt",
      "Confirmación",
      buildTimeline({ deliveryStatus: "blacklisted" }),
    );
    expect(view.label).toBe("No enviado");
    expect(view.tone).toBe("error");
    expect(view.value).toBeNull();
    expect(view.terminal).toBe(true);
  });

  it("returns base label for normal statuses", () => {
    const view = resolveTimelineStep(
      "deliveredAt",
      "Confirmación",
      buildTimeline({ deliveryStatus: "delivered", deliveredAt: "d" }),
    );
    expect(view.label).toBe("Confirmación");
    expect(view.tone).toBe("normal");
    expect(view.value).toBe("d");
  });
});

describe("resolveStatusReason", () => {
  it("combines errorCode and errorDetail for bounced", () => {
    expect(
      resolveStatusReason(
        buildTimeline({
          deliveryStatus: "bounced",
          errorCode: "DSN",
          errorDetail: "554 5.7.7 Email policy violation",
        }),
      ),
    ).toBe("DSN: 554 5.7.7 Email policy violation");
  });

  it("uses suppression note for blacklisted without detail", () => {
    const reason = resolveStatusReason(
      buildTimeline({ deliveryStatus: "blacklisted" }),
    );
    expect(reason).toContain("supresión");
  });

  it("returns null when there is no reason (delivered)", () => {
    expect(resolveStatusReason(buildTimeline({}))).toBeNull();
  });
});
