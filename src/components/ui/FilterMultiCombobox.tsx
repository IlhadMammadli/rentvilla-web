"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { useTranslations } from "@/i18n/client";
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

function useMobileLayout() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

export function FilterMultiCombobox({
  label,
  placeholder,
  searchPlaceholder = "Search…",
  options,
  values,
  onChange,
  emptyMessage = "No results",
}: FilterMultiComboboxProps) {
  const t = useTranslations();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileLayout();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const selectedLabels = options
    .filter((o) => values.includes(o.value))
    .map((o) => o.label);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  useEffect(() => {
    if (!open || isMobile) return;
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, isMobile]);

  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  function toggle(id: string) {
    onChange(
      values.includes(id) ? values.filter((v) => v !== id) : [...values, id]
    );
  }

  function clearAll(e?: React.MouseEvent) {
    e?.stopPropagation();
    onChange([]);
  }

  function closePicker() {
    setOpen(false);
    setQuery("");
  }

  const triggerLabel =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length === 1
        ? selectedLabels[0]
        : `${selectedLabels.length} selected`;

  function renderOptions(largeTouch = false) {
    if (filtered.length === 0) {
      return (
        <li className="px-4 py-4 text-center text-sm text-gray-400">{emptyMessage}</li>
      );
    }

    return filtered.map((option) => {
      const active = values.includes(option.value);
      return (
        <li key={option.value}>
          <button
            type="button"
            role="option"
            aria-selected={active}
            onClick={() => toggle(option.value)}
            className={`flex w-full items-center gap-3 text-left transition active:bg-gray-100 ${
              largeTouch
                ? "min-h-[48px] px-4 py-3 text-base"
                : "px-4 py-2.5 text-sm hover:bg-gray-50"
            } ${active && !largeTouch ? "bg-gray-50" : ""}`}
          >
            <span
              className={`flex shrink-0 items-center justify-center rounded-md border ${
                largeTouch ? "h-5 w-5" : "h-4 w-4 rounded"
              } ${
                active
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {active && <Check className={largeTouch ? "h-3.5 w-3.5" : "h-3 w-3"} />}
            </span>
            <span className={largeTouch ? "text-gray-900" : "text-gray-800"}>
              {option.label}
            </span>
          </button>
        </li>
      );
    });
  }

  const mobileSheet =
    mounted && open && isMobile
      ? createPortal(
          <div className="fixed inset-0 z-[70] flex flex-col justify-end lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label={t("home.closeFilters")}
              onClick={closePicker}
            />
            <div
              className="relative flex max-h-[min(85dvh,640px)] flex-col rounded-t-2xl bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label={label}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
                <h3 className="text-base font-semibold text-gray-900">{label}</h3>
                <button
                  type="button"
                  onClick={closePicker}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                  aria-label={t("home.closeFilters")}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="shrink-0 border-b border-gray-100 p-3">
                <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3">
                  <Search className="h-5 w-5 shrink-0 text-gray-400" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-base text-gray-900 outline-none placeholder:text-gray-400"
                    autoFocus
                  />
                </div>
                {values.length > 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    {t("home.facilitiesSelectedCount", { count: values.length })}
                  </p>
                )}
              </div>

              <ul
                className="min-h-0 flex-1 list-none overflow-y-auto overscroll-contain py-1"
                style={{ WebkitOverflowScrolling: "touch" }}
                role="listbox"
                aria-multiselectable
              >
                {renderOptions(true)}
              </ul>

              <div
                className="shrink-0 border-t border-gray-100 bg-white p-3"
                style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
              >
                <div className="flex gap-2">
                  {values.length > 0 && (
                    <button
                      type="button"
                      onClick={() => clearAll()}
                      className="min-h-[48px] flex-1 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 active:bg-gray-50"
                    >
                      {t("home.facilitiesClearAll")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={closePicker}
                    className="min-h-[48px] flex-1 rounded-xl bg-gray-900 text-sm font-medium text-white active:bg-gray-800"
                  >
                    {t("home.facilitiesDone")}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

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
        aria-controls={!isMobile ? listId : undefined}
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

      {open && !isMobile && (
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
          <ul className="max-h-60 list-none overflow-y-auto py-1">{renderOptions()}</ul>
          {values.length > 0 && (
            <div className="border-t border-gray-100 px-3 py-2">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                {t("home.facilitiesClearAll")}
              </button>
            </div>
          )}
        </div>
      )}

      {mobileSheet}
    </div>
  );
}
