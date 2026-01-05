import React, { useMemo, useCallback } from "react";
import { FilterButton, FilterField, FilterValues } from "./FilterButton";
import { useFilters } from "../contexts/FilterContext";

/**
 * Connects FilterButton to FilterContext (URL-backed).
 *
 * K: filter keys (e.g. "day" | "meal" | "location")
 * V: option values (string literals)
 */
type Props<K extends string, V extends string> = {
  label?: string;
  fields: FilterField<K, V>[];
  className?: string;
  disabled?: boolean;
  clearLabel?: string;
  allLabel?: string;

  /**
   * If provided, only these keys will be written back to context/URL when the filter changes.
   * Useful if multiple pages share the same FilterProvider but should not override each other's params.
   */
  allowedKeys?: readonly K[];

  /**
   * Whether to keep unrelated query params (like "q") when applying filter changes.
   * Default: true (recommended).
   */
  preserveUnknownKeys?: boolean;
};

export function FilterButtonConnected<K extends string, V extends string>({
  label,
  fields,
  className,
  disabled,
  clearLabel,
  allLabel,
  allowedKeys,
  preserveUnknownKeys = true,
}: Props<K, V>) {
  const { filters, setFilters } = useFilters();

  // Context (URL params) -> FilterButton.values
  const values = useMemo<FilterValues<K, V>>(() => {
    const out: Partial<Record<K, V>> = {};
    for (const f of fields) {
      const raw = filters[f.key];
      if (!raw) continue;

      // Only accept values that exist in the field's options.
      const isValid = f.options.some((o) => o.value === raw);
      if (isValid) out[f.key] = raw as V;
    }
    return out;
  }, [filters, fields]);

  // FilterButton.values -> Context (URL params)
  const onChange = useCallback(
    (nextValues: FilterValues<K, V>) => {
      const base: Record<string, string> = {};

      if (preserveUnknownKeys) {
        // Start from existing URL params so we don't wipe things like "q"
        // (and any other unrelated query params your app may use).
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") base[k] = v;
        });
      }

      // Remove keys we manage (fields), then re-apply from nextValues.
      for (const f of fields) {
        // If allowedKeys is provided, only manage those keys.
        if (allowedKeys && !allowedKeys.includes(f.key)) continue;
        delete base[f.key];
      }

      for (const [k, v] of Object.entries(nextValues) as Array<[K, V | undefined]>) {
        if (allowedKeys && !allowedKeys.includes(k)) continue;
        if (v) base[k] = v;
      }

      setFilters(base);
    },
    [filters, setFilters, fields, allowedKeys, preserveUnknownKeys]
  );

  return (
    <FilterButton<K, V>
      label={label}
      fields={fields}
      values={values}
      onChange={onChange}
      className={className}
      disabled={disabled}
      clearLabel={clearLabel}
      allLabel={allLabel}
    />
  );
}
