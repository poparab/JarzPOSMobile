export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string | undefined = undefined,
): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    value,
  );
}
