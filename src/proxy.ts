import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const isAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = req.nextUrl.pathname.startsWith("/api/v1/admin");
  const isLoginPage = req.nextUrl.pathname === "/admin/login";

  if ((isAdmin || isAdminApi) && !isLoginPage && !req.auth) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/v1/admin/:path*"],
};

