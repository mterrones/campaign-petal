export type ClientDeliveryErrorView = {
  title: string;
  message: string;
};

const DELIVERY_ERRORS: Record<string, ClientDeliveryErrorView> = {
  MAIL_DELIVERY_NOT_CONFIGURED: {
    title: "Envío no disponible",
    message:
      "Tu cuenta aún no está habilitada para enviar correos. Contacta al administrador de tu organización.",
  },
  MAIL_DELIVERY_INACTIVE: {
    title: "Envío temporalmente suspendido",
    message:
      "No es posible enviar correos en este momento. Contacta al administrador de tu organización.",
  },
};

export function getClientDeliveryErrorView(
  code: string | null | undefined,
): ClientDeliveryErrorView {
  if (code && DELIVERY_ERRORS[code]) {
    return DELIVERY_ERRORS[code];
  }
  return {
    title: "No se pudo enviar",
    message:
      "No se pudo completar el envío. Intenta nuevamente o contacta soporte.",
  };
}

export function getClientDeliveryErrorMessage(
  code: string | null | undefined,
): string {
  const view = getClientDeliveryErrorView(code);
  return view.message;
}

export function extractErrorCodeFromBody(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const record = body as Record<string, unknown>;
  const code = record.errorCode ?? record.code;
  return typeof code === "string" ? code : null;
}

export function resolveClientSendErrorMessage(body: unknown): string {
  const code = extractErrorCodeFromBody(body);
  if (code) {
    return getClientDeliveryErrorMessage(code);
  }
  if (typeof body === "object" && body !== null) {
    const error = (body as { error?: unknown }).error;
    if (typeof error === "string") {
      if (error.includes("domain") || error.includes("Sending domain")) {
        return "El remitente no está permitido para tu cuenta. Usa un dominio registrado.";
      }
    }
  }
  return getClientDeliveryErrorMessage(null);
}
