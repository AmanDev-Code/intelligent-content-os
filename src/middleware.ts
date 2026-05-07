import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, Next.js internals, API routes, admin, and auth routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname === "/maintenance"
  ) {
    return NextResponse.next();
  }

  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
    const res = await fetch(`${backendUrl}/maintenance/status`, {
      next: { revalidate: 10 },
    });

    if (res.ok) {
      const data = (await res.json()) as {
        active: boolean;
        message?: string;
        scheduledEnd?: string;
      };

      if (data.active) {
        const rewriteUrl = new URL("/maintenance", request.url);
        if (data.message) {
          rewriteUrl.searchParams.set("message", data.message);
        }
        if (data.scheduledEnd) {
          rewriteUrl.searchParams.set("scheduledEnd", data.scheduledEnd);
        }
        return NextResponse.rewrite(rewriteUrl);
      }
    }
  } catch {
    // Fail open on network error — don't block users if backend is unreachable
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files, _next, and api
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
  ],
};
