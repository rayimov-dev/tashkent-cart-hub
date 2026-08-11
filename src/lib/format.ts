export function formatSom(value: number): string {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(value) + " so'm";
}
