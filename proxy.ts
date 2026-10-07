import { clerkMiddleware } from "@clerk/nextjs/server";

const publicRoutes = ["/", "/login", "/signup", "/sso-callback", "/__clerk"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) =>
    route === "/"
      ? pathname === route
      : pathname === route || pathname.startsWith(`${route}/`),
  );
}

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request.nextUrl.pathname)) {
    await auth.protect({ unauthenticatedUrl: "/login" });
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
