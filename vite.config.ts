import type { IncomingMessage } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';

/** Runs the Vercel functions in /api during `npm run dev`, so the whole game works locally. */
function devApi(): Plugin {
  return {
    name: 'zaban-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res, next) => {
        const match = req.url?.match(/^\/api\/([a-z-]+)/);
        if (!match || req.method !== 'POST') return next();
        try {
          const mod = await server.ssrLoadModule(`/api/${match[1]}.ts`);
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) if (typeof v === 'string') headers.set(k, v);
          const response: Response = await mod.POST(
            new Request(`http://localhost${req.url}`, { method: 'POST', headers, body: Buffer.concat(chunks) }),
          );
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (error) {
          server.config.logger.error(String(error));
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'dev_api_error' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Make non-VITE_ variables (ANTHROPIC_API_KEY, SUPABASE_SERVICE_ROLE_KEY...) visible to /api in dev.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    base: './',
    build: { chunkSizeWarningLimit: 1600 },
    plugins: [devApi()],
  };
});
