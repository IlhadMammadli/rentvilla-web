"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export type ComboboxOption = { value: string; label: string };

type FilterComboboxProps = {
  label: string;
  placeholder: string;
  searchPlaceholder?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  emptyMessage?: string;
};

export function FilterCombobox({
  label,
  placeholder,
  searchPlaceholder = "Search…",
  options,
  value,
  onChange,
  disabled = false,
  emptyMessage = "No results",
}: FilterComboboxProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);
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

  function select(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        className={`flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 py-3 text-left text-sm shadow-sm transition ${
          disabled
            ? "cursor-not-allowed border-gray-100 text-gray-400"
            : open
              ? "border-gray-900 ring-2 ring-gray-900/10"
              : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <span className={selected ? "font-medium text-gray-900" : "text-gray-400"}>
          {selected?.label ?? placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-0.5 text-gray-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={clear}
              onKeyDown={(e) => e.key === "Enter" && clear(e as unknown as React.MouseEvent)}
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
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          id={listId}
          role="listbox"
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
          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-gray-400">{emptyMessage}</li>
            ) : (
              filtered.map((option) => {
                const active = option.value === value;
                return (
                  <li key={option.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => select(option.value)}
                      className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition ${
                        active
                          ? "bg-gray-900 text-white"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{option.label}</span>
                      {active && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
