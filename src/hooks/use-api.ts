import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

import { fetchAccuracy, fetchForecast, fetchHorizon, fetchMeta } from "@/lib/api";
import { FALLBACK_CUTOFF, FALLBACK_DATE, clampDate, isValidCutoff, isValidDate } from "@/lib/filters";

// Query keys include every filter, so React Query discards stale responses when filters change
// and aborts superseded requests through the signal.
export const useMeta = () =>
  useQuery({ queryKey: ["meta"], queryFn: ({ signal }) => fetchMeta(signal), staleTime: Infinity });

export const useForecast = (date: string | undefined, cutoff: string | undefined) =>
  useQuery({
    queryKey: ["forecast", date, cutoff],
    queryFn: ({ signal }) => fetchForecast(date!, cutoff!, signal),
    enabled: !!date && !!cutoff,
    placeholderData: keepPreviousData,
  });

export const useAccuracy = (start: string | undefined, end: string | undefined, cutoff: string | undefined) =>
  useQuery({
    queryKey: ["accuracy", start, end, cutoff],
    queryFn: ({ signal }) => fetchAccuracy(start!, end!, cutoff!, signal),
    enabled: !!start && !!end && !!cutoff,
    placeholderData: keepPreviousData,
  });

export const useHorizon = (start: string | undefined, end: string | undefined, bucketHours = 6) =>
  useQuery({
    queryKey: ["horizon", start, end, bucketHours],
    queryFn: ({ signal }) => fetchHorizon(start!, end!, bucketHours, signal),
    enabled: !!start && !!end,
    placeholderData: keepPreviousData,
  });

/** Effective global filters: URL first, then /api/meta defaults, then static fallbacks. */
export function useFilters() {
  const search = useSearch({ strict: false }) as { date?: string; cutoff?: string };
  const meta = useMeta();
  const navigate = useNavigate();

  const metaReady = meta.isSuccess || meta.isError;
  const metaDefaultCutoff = meta.data && isValidCutoff(meta.data.default_cutoff) ? meta.data.default_cutoff : undefined;
  const metaEnd = meta.data && isValidDate(meta.data.default_range.end) ? meta.data.default_range.end : undefined;
  const metaStart = meta.data && isValidDate(meta.data.default_range.start) ? meta.data.default_range.start : undefined;

  const cutoff = search.cutoff ?? (metaReady ? metaDefaultCutoff ?? FALLBACK_CUTOFF : undefined);
  const date = search.date ?? (metaReady ? FALLBACK_DATE : undefined);
  const rangeStart = metaStart ?? (metaReady ? "2026-01-01" : undefined);
  const rangeEnd = metaEnd ?? (metaReady ? "2026-01-31" : undefined);

  const setSearch = useCallback(
    (patch: Record<string, string | undefined>) =>
      navigate({ to: ".", search: ((prev: Record<string, unknown>) => ({ ...prev, ...patch })) as never }),
    [navigate],
  );

  return {
    date,
    cutoff,
    rangeStart,
    rangeEnd,
    meta,
    setDate: (d: string) => setSearch({ date: clampDate(d) }),
    setCutoff: (c: string) => setSearch({ cutoff: c }),
    setSearch,
  };
}
