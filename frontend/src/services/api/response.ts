import type { PaginationLinks, PaginationMeta } from '@/interfaces/muscle';

type ApiCollectionPayload<T> = {
  data?: T[];
  meta?: PaginationMeta | null;
  links?: PaginationLinks | null;
  message?: string;
};

type ApiItemPayload<T> = {
  data?: T;
  message?: string;
};

export function normalizeCollectionResponse<T>(payload: ApiCollectionPayload<T>) {
  return {
    items: Array.isArray(payload.data) ? payload.data : [],
    meta: payload.meta ?? null,
    links: payload.links ?? null,
    message: payload.message,
  };
}

export function normalizeItemResponse<T>(payload: ApiItemPayload<T>) {
  return {
    item: payload.data ?? null,
    message: payload.message,
  };
}
