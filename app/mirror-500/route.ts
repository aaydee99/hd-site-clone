// Target of the proxy rewrite for /{cc}/{ll}/errors/500.html (source returns HTTP 500 there).
export async function GET() {
  return new Response('<!doctype html><title>Server error</title><h1>Something went wrong</h1><p>Placeholder 500 page.</p>', {
    status: 500, headers: { 'content-type': 'text/html;charset=utf-8' },
  });
}
