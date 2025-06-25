import { Decimal } from "decimal.js";

export function hasValidatedSufficientCredits(
  currentCredits: string,
  requiredCredits: string,
  buffer: string = "0.0001", // Small buffer for precision
): boolean {
  const current = new Decimal(currentCredits);
  const required = new Decimal(requiredCredits);
  const bufferAmount = new Decimal(buffer);

  return current.greaterThanOrEqualTo(required.plus(bufferAmount));
}

export function formatCredits(credits: string): string {
  return new Decimal(credits).toFixed(4);
}

export function addCredits(credits1: string, credits2: string): string {
  return new Decimal(credits1).plus(credits2).toFixed(4);
}

export function subtractCredits(credits1: string, credits2: string): string {
  return new Decimal(credits1).minus(credits2).toFixed(4);
}
