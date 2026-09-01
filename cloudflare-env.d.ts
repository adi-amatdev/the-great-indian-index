// Import only the binding types we need — importing (rather than a global
// triple-slash reference) avoids pulling all Workers globals into scope, which
// would clobber the DOM lib's fetch/Response typings used across the app.
import type { D1Database, Fetcher } from "@cloudflare/workers-types";

declare global {
  // getCloudflareContext().env is typed as CloudflareEnv (see wrangler.jsonc).
  interface CloudflareEnv {
    DB: D1Database;
    ASSETS: Fetcher;
  }
}

export {};
