import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/sign-in", "/sign-up", "/sso-callback", "/__clerk"];
const authEntryRoutes = ["/", "/sign-in", "/sign-up"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) =>
    route === "/"
      ? pathname === route
      : pathname === route || pathname.startsWith(`${route}/`),
  );
}

function isAuthEntryRoute(pathname: string) {
  return authEntryRoutes.some((route) =>
    route === "/"
      ? pathname === route
      : pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default clerkMiddleware(async (auth, request) => {
  const pathname = request.nextUrl.pathname;

  if (!isPublicRoute(pathname)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", request.url).toString(),
    });
    return;
  }

  if (isAuthEntryRoute(pathname)) {
    const { userId } = await auth();
    if (userId) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
