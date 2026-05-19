import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/villas", label: "Villas" },
  { href: "/admin/cities", label: "Cities" },
  { href: "/admin/facilities", label: "Facilities" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <aside className="hidden w-48 shrink-0 md:block">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Admin panel
        </p>
        <nav className="space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="mt-8 text-xs text-gray-400">
          View database visually: run{" "}
          <code className="rounded bg-gray-100 px-1">npm run db:studio</code>
        </p>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
