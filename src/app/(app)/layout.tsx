import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { BottomNav, TopNav } from "@/components/Nav";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Guard: tanpa session -> /login
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <span className="font-bold text-indigo-600">KuliahKu</span>
            <TopNav />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 truncate max-w-[40vw]">{session.name}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
