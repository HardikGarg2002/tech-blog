import { ReactNode } from "react";

/** Root admin layout: no auth here so `/admin/login` can render without a redirect loop. */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
