"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "@/i18n/client";

type Item = { id: string; name: string; isActive?: boolean };

type AdminListManagerProps = {
  items: Item[];
  apiPath: string;
  title: string;
  placeholder?: string;
};

export function AdminListManager({
  items: initialItems,
  apiPath,
  title,
  placeholder,
}: AdminListManagerProps) {
  const t = useTranslations();
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch(apiPath, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? t("common.errorGeneric"));
      setLoading(false);
      return;
    }

    const created = await res.json();
    setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm(t("common.remove") + "?")) return;
    const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

      <form onSubmit={handleAdd} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {t("common.add")}
        </button>
      </form>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <ul className="mt-6 divide-y divide-gray-100 rounded-xl border border-gray-100">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="text-gray-900">{item.name}</span>
            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              className="text-red-500 hover:text-red-700"
            >
              {t("common.remove")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
