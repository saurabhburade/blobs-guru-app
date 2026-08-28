export const ZERO_BD = 0;
export const ZERO_BI = 0;
export const ONE_BD = 1;
export const ONE_BI = 1;
export const BYTES_PER_BLOB = 1024 * 128;

export function fakeExponential(
  factor: number,
  numerator: number,
  denominator: number
): number {
  let i = Number(1);
  let output = Number(0);
  let numeratorAccum = Number(factor) * Number(denominator);

  while (numeratorAccum > Number(0)) {
    output += numeratorAccum;
    numeratorAccum = (numeratorAccum * numerator) / (denominator * i);
    i += 1;
  }

  return output / denominator;
}