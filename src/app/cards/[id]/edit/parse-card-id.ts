/** URL の id を正の整数に直す。整数として読めなければ null を返す。 */
export function parseCardId(raw: string): number | null {
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const id = Number(raw);
  return Number.isSafeInteger(id) ? id : null;
}
