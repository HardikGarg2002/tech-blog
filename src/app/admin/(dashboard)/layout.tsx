import { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r bg-muted/30 flex flex-col">
        <div className="p-4 border-b">
          <Link href="/admin" className="font-bold text-lg tracking-tight">
            Admin
          </Link>
          <p className="text-xs text-muted-foreground mt-0.5">Content Manager</p>
        </div>

        <AdminSidebarNav />
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
