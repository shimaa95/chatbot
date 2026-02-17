import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  '/(admin)(.*)',
  // Removed '/api(.*)' — the send-message and graphql APIs must be
  // publicly accessible when the chatbot is embedded in other apps.
  // Admin-only API routes should be protected at the handler level instead.
]);

// Routes that should NEVER trigger auth redirects (chatbot embed + its APIs)
const isPublicRoute = createRouteMatcher([
  '/chatbot(.*)',
  '/api/send-message(.*)',
  '/api/graphql(.*)',
  '/login(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  // Skip auth entirely for public/embeddable routes
  if (isPublicRoute(req)) return;

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};