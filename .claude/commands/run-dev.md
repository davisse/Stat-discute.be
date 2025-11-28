---
name: run-dev
description: "Run the Next.js frontend development server locally"
---

# /run-dev - Start Development Server

Start the Next.js frontend development server at http://localhost:3000

## Instructions

1. **Start the dev server:**
   ```bash
   npm --prefix /Users/chapirou/dev/perso/stat-discute.be/frontend run dev
   ```

2. **The server will be available at:** http://localhost:3000 (or next available port)

3. **Keep the server running in background** so you can continue working while it runs.

## Notes

- Uses Next.js 16 with Turbopack for fast hot reloading
- Server Components are enabled by default
- Database connection requires `.env.local` to be configured in the frontend directory

## Related Commands

- `npm run build` - Production build (checks TypeScript types)
- `npm run lint` - Run ESLint
