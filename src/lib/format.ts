export function formatSom(value: number): string {
  const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value).replace(/,/g, " ");
  return n + " so'm";
}

