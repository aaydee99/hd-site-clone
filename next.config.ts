import type { NextConfig } from 'next';

// Caching, cookies, response headers and pattern redirects are handled by Cloudflare rules
// (see ../cloudflare/). The origin only serves pages and manifest-dependent routing.
const config: NextConfig = {
  outputFileTracingIncludes: { '/**': ['./data/**'] },
  poweredByHeader: false,
  skipTrailingSlashRedirect: true, // trailing-slash 308 is a Cloudflare redirect rule
  turbopack: { root: import.meta.dirname },
};
export default config;
