"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import type { ComboboxOption } from "./FilterCombobox";

type FilterMultiComboboxProps = {
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  options: ComboboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  emptyMessage?: string;
};

export function FilterMultiCombobox({
  label,
  placeholder,
  searchPlaceholder = "Search…",
  options,
  values,
  onChange,
  emptyMessage = "No results",
}: FilterMultiComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function toggle(id: string) {
    onChange(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id]
    );
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation();
    onChange([]);
  }

  const triggerLabel =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} selected`;

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-3 text-left text-sm shadow-sm transition ${
          open
            ? "border-gray-900 ring-2 ring-gray-900/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span
          className={
            selectedLabels.length > 0 ? "font-medium text-gray-900" : "text-gray-400"
          }
        >
          {triggerLabel}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-gray-400">
          {values.length > 0 && (
            <span
              role="button"
              tabIndex={0}
              onClick={clearAll}
              onKeyDown={(e) =>
                e.key === "Enter" && clearAll(e as unknown as React.MouseEvent)
              }
              className="rounded p-0.5 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl sm:min-w-[280px]"
          id={listId}
          role="listbox"
          aria-multiselectable
        >
          <div className="border-b border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                autoFocus
              />
            </div>
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">{emptyMessage}</li>
            ) : (
              filtered.map((option) => {
                const active = values.includes(option.value);
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => toggle(option.value)}
                      className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition ${
                        active ? "bg-gray-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                          active
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      <span className="text-gray-800">{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          {values.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
