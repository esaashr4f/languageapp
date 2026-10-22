// Small helpers for the Vercel functions in /api (web-standard Request/Response).

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export function bearer(request: Request): string | null {
  const header = request.headers.get('authorization') ?? '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
}

/** Reject oversized player messages before they cost anything. */
export const MAX_REPLY_CHARS = 400;
export const MAX_HISTORY = 40;
