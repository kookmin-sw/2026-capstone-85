"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchJobFilterPreference, saveJobFilterPreference } from "@/lib/api";
import {
  defaultJobFilters,
  jobFiltersToPreference,
  jobFiltersToQueryString,
  normalizeJobFilterPreference,
  parseJobFiltersFromParams,
  type JobFilterState,
} from "@/lib/job-filters";

export function useJobFilterState() {
  const [initialUrl] = useState(readInitialUrlFilters);
  const [filters, setFilters] = useState<JobFilterState>(initialUrl.filters);
  const [ready, setReady] = useState(initialUrl.hasAnyQuery);
  const [canPersist, setCanPersist] = useState(false);
  const lastSaved = useRef("");

  useEffect(() => {
    let ignore = false;
    fetchJobFilterPreference()
      .then((data) => {
        if (ignore) return;
        setCanPersist(data.authenticated);
        if (!initialUrl.hasAnyQuery) {
          const restored = normalizeJobFilterPreference(data.filter);
          setFilters(restored);
          setReady(true);
        }
      })
      .catch(() => {
        if (ignore) return;
        setCanPersist(false);
        if (!initialUrl.hasAnyQuery) setReady(true);
      });

    return () => {
      ignore = true;
    };
  }, [initialUrl.hasAnyQuery]);

  const queryString = useMemo(() => jobFiltersToQueryString(filters), [filters]);

  useEffect(() => {
    if (!ready) return;
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    const current = `${window.location.pathname}${window.location.search}`;
    if (current !== nextUrl) {
      window.history.replaceState(null, "", nextUrl);
    }
  }, [queryString, ready]);

  useEffect(() => {
    if (!ready || !canPersist) return;
    const payload = JSON.stringify(jobFiltersToPreference(filters));
    if (payload === lastSaved.current) return;
    const timer = window.setTimeout(() => {
      saveJobFilterPreference(jobFiltersToPreference(filters))
        .then(() => {
          lastSaved.current = payload;
        })
        .catch(() => {
          setCanPersist(false);
        });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [canPersist, filters, ready]);

  const updateFilters = useCallback((next: JobFilterState) => {
    setFilters(next);
  }, []);

  return {
    filters,
    setFilters: updateFilters,
    ready,
    queryString,
    canPersist,
  };
}

function readInitialUrlFilters() {
  if (typeof window === "undefined") {
    return { filters: defaultJobFilters, hasAnyQuery: false };
  }
  return parseJobFiltersFromParams(new URLSearchParams(window.location.search));
}
