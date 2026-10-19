"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/jadwal", label: "Jadwal", icon: "📚" },
  { href: "/tugas", label: "Tugas", icon: "✅" },
];

// Nav horizontal untuk desktop
export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden md:flex items-center gap-1">
      {ITEMS.map((i) => {
        const active = pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

// Bottom nav untuk mobile
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 grid grid-cols-3">
      {ITEMS.map((i) => {
        const active = pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`flex flex-col items-center py-2 text-xs ${
              active ? "text-indigo-600 font-semibold" : "text-slate-500"
            }`}
          >
            <span className="text-lg leading-none">{i.icon}</span>
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
