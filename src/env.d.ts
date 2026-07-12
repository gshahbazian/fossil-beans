export {}

declare global {
  namespace Cloudflare {
    interface Env {
      PURGE_SECRET?: string
    }
  }
}
