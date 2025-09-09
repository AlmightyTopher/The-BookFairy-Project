// src/lib/pagination.ts
export type PageResult<T> = {
  items: T[];
  page: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
  label: string; // "Page X of Y"
};

export function paginate<T>(items: T[], page: number, perPage = 5): PageResult<T> {
  const safePer = Math.max(1, perPage | 0);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePer));
  const clamped = Math.min(Math.max(1, page | 0), totalPages);
  const start = (clamped - 1) * safePer;
  const end = start + safePer;

  const slice = items.slice(start, end);
  return {
    items: slice,
    page: clamped,
    totalPages,
    hasPrev: clamped > 1,
    hasNext: clamped < totalPages,
    label: `Page ${clamped} of ${totalPages}`,
  };
}