import errorMessages from "@/data/error-messages.json";
import { useToast } from "@/hooks/use-toast";

type ErrorCode = keyof typeof errorMessages.errorCodes;
type StatusCode = keyof typeof errorMessages.statusCodes;

interface ErrorResponse {
  message?: string;
  code?: string;
  error?: string;
  statusCode?: number;
  action?: string;
}

function isValidErrorCode(code: string): code is ErrorCode {
  return code in errorMessages.errorCodes;
}

function isValidStatusCode(code: number): code is number {
  return code.toString() in errorMessages.statusCodes;
}

/**
 * Get a user-friendly error message from an error response
 */
export function getErrorMessage(error: unknown): string {
  // Handle API error responses
  if (error && typeof error === "object") {
    const err = error as ErrorResponse;

    const statusCode =
      err.statusCode ??
      (error as { status?: number }).status ??
      (error as { statusCode?: number }).statusCode;

    // Credits / paywall — always show the server message (e.g. "requires 6 credits")
    if (err.message) {
      const lowerMessage = err.message.toLowerCase();
      if (
        lowerMessage.includes("insufficient credits") ||
        lowerMessage.includes("upgrade your plan")
      ) {
        return err.message;
      }
    }
    if (statusCode === 402) {
      return (
        err.message ||
        errorMessages.errorCodes.credits_exhausted
      );
    }

    // First check for explicit error code
    if (err.code && isValidErrorCode(err.code)) {
      return errorMessages.errorCodes[err.code];
    }

    // Check for message-based error code detection
    if (err.message) {
      const lowerMessage = err.message.toLowerCase();
      for (const [code, message] of Object.entries(errorMessages.errorCodes)) {
        if (
          lowerMessage.includes(code.replace(/_/g, " ")) ||
          lowerMessage.includes(code.replace(/_/g, "-"))
        ) {
          return message;
        }
      }

      // Check for specific error patterns in messages
      if (
        lowerMessage.includes("discount") ||
        lowerMessage.includes("promo")
      ) {
        if (lowerMessage.includes("no longer active") || lowerMessage.includes("inactive")) {
          return errorMessages.errorCodes.discount_inactive;
        }
        if (lowerMessage.includes("expired")) {
          return errorMessages.errorCodes.discount_expired;
        }
        if (lowerMessage.includes("limit") || lowerMessage.includes("redeemed")) {
          return errorMessages.errorCodes.discount_at_limit;
        }
        if (lowerMessage.includes("not found") || lowerMessage.includes("doesn't exist")) {
          return errorMessages.errorCodes.discount_not_found;
        }
      }

      if (lowerMessage.includes("subscription")) {
        if (lowerMessage.includes("not found")) {
          return errorMessages.errorCodes.subscription_not_found;
        }
        if (lowerMessage.includes("environment") || lowerMessage.includes("sandbox")) {
          return errorMessages.errorCodes.subscription_environment_mismatch;
        }
      }

      if (lowerMessage.includes("resource") && lowerMessage.includes("not found")) {
        return errorMessages.statusCodes["404"];
      }
    }

    // Fall back to status code lookup
    if (statusCode && isValidStatusCode(statusCode)) {
      return errorMessages.statusCodes[String(statusCode) as StatusCode];
    }
  }

  // Handle string errors
  if (typeof error === "string") {
    const lowerError = error.toLowerCase();

    if (lowerError.includes("insufficient credits")) {
      return error;
    }

    // Check for HTTP status codes in the error string
    const statusMatch = error.match(/\b(400|401|402|403|404|409|422|429|500|502|503)\b/);
    if (statusMatch) {
      const code = statusMatch[1] as StatusCode;
      if (isValidStatusCode(Number(code))) {
        return errorMessages.statusCodes[code];
      }
    }

    // Check for error code patterns
    if (lowerError.includes("discount")) {
      return errorMessages.errorCodes.discount_inactive;
    }
    if (lowerError.includes("network")) {
      return errorMessages.errorCodes.network_error;
    }
    if (lowerError.includes("no longer active")) {
      return errorMessages.errorCodes.discount_inactive;
    }

    return error;
  }

  // Default fallback
  return errorMessages.errorCodes.unknown_error;
}

/**
 * Determine if the error is user-recoverable (can be shown as toast)
 * vs. a system error that needs logging but not necessarily a toast
 */
export function isUserRecoverableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;

  const err = error as ErrorResponse;
  const statusCode = err.statusCode ?? (error as { status?: number }).status;

  // 4xx errors are typically recoverable
  if (statusCode && statusCode >= 400 && statusCode < 500) {
    return true;
  }

  // Check for known error codes
  if (err.code && err.code in errorMessages.errorCodes) {
    return true;
  }

  return false;
}

/**
 * Format error for display
 */
export function formatErrorForDisplay(error: unknown): {
  message: string;
  isRecoverable: boolean;
  shouldLog: boolean;
} {
  const message = getErrorMessage(error);
  const isRecoverable = isUserRecoverableError(error);

  // Log non-recoverable errors or 5xx errors for monitoring
  const err = error as ErrorResponse;
  const statusCode = err.statusCode ?? (error as { status?: number }).status;
  const shouldLog = !isRecoverable || (statusCode !== undefined && statusCode >= 500);

  return { message, isRecoverable, shouldLog };
}

/**
 * Hook for centralized error handling with toast notifications
 */
export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown, options?: { title?: string; silent?: boolean }) => {
    const { message, isRecoverable, shouldLog } = formatErrorForDisplay(error);

    if (shouldLog && process.env.NODE_ENV === "development") {
      console.error("[ErrorHandler]", error);
    }

    if (!options?.silent && (process.env.NODE_ENV === "development" || isRecoverable)) {
      toast({
        title: options?.title || "Error",
        description: message,
        variant: "destructive",
      });
    }

    return message;
  };

  const handleApiError = async (
    response: Response,
    options?: { title?: string; silent?: boolean }
  ): Promise<string> => {
    let errorData: ErrorResponse | null = null;

    try {
      errorData = await response.json();
    } catch {
      // If we can't parse JSON, fall back to status text
      errorData = {
        message: response.statusText,
        statusCode: response.status,
      };
    }

    return handleError(errorData || { statusCode: response.status }, options);
  };

  return { handleError, handleApiError, getErrorMessage };
}
