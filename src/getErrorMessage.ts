import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";

export const getErrorMessage = (err: unknown, fallback: string): string => {
  const fetchError = err as FetchBaseQueryError & {
    data?: { message?: string; error?: string };
  };

  if (fetchError?.data) {
    // check 'error' first, then 'message'
    return fetchError.data.error ?? fetchError.data.message ?? fallback;
  }

  const serializedError = err as SerializedError;
  if (serializedError?.message) return serializedError.message;

  return fallback;
};
