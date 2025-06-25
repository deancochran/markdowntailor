import * as Sentry from "@sentry/nextjs";
import { User } from "next-auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withSentry<T extends (...args: any[]) => Promise<any>>(
  operationName: string,
  fn: T,
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return Sentry.startSpan(
      {
        name: operationName,
        op: "function.execute",
      },
      async () => {
        try {
          const result = await fn(...args);
          return result as ReturnType<T>;
        } catch (error) {
          Sentry.captureException(error, {
            extra: {
              functionName: operationName,
              arguments: args,
            },
          });
          throw error;
        }
      },
    );
  }) as T;
}

export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function setUserContext(user: User) {
  Sentry.setUser(user ?? null);
}
