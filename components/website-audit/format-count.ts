export function pluralLabel(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return count === 1 ? singular : plural;
}

export function formatCount(
  count: number,
  singular: string,
  plural = `${singular}s`,
) {
  return `${new Intl.NumberFormat("en-US").format(count)} ${pluralLabel(
    count,
    singular,
    plural,
  ).toLowerCase()}`;
}
