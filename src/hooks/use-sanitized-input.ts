import {
  sanitizeCSS,
  sanitizeMarkdown,
  sanitizeText,
} from "@/lib/utils/sanitization";
import { useCallback, useMemo } from "react";

type SanitizationType = "markdown" | "css" | "text";

export function useSanitizedInput(
  value: string,
  type: SanitizationType,
  onError?: (error: string) => void,
) {
  const sanitizedValue = useMemo(() => {
    if (!value) return "";

    try {
      switch (type) {
        case "markdown":
          return sanitizeMarkdown(value);
        case "css":
          return sanitizeCSS(value);
        case "text":
          return sanitizeText(value);
        default:
          return value;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sanitization failed";
      onError?.(errorMessage);
      return value; // Return original value if sanitization fails
    }
  }, [value, type, onError]);

  const sanitize = useCallback(
    (input: string) => {
      try {
        switch (type) {
          case "markdown":
            return sanitizeMarkdown(input);
          case "css":
            return sanitizeCSS(input);
          case "text":
            return sanitizeText(input);
          default:
            return input;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Sanitization failed";
        onError?.(errorMessage);
        return input;
      }
    },
    [type, onError],
  );

  return { sanitizedValue, sanitize };
}
