import { Router } from 'express';
import helmet from 'helmet';
import { swaggerSpec } from './swagger';

const CDN = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.33.1';

export const docsRouter: Router = Router();

// Route-scoped CSP: allows the CDN only on /api/docs
docsRouter.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://cdn.jsdelivr.net'],
        connectSrc: ["'self'"],
      },
    },
  }),
);

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(swaggerSpec);
});

// Served as an external file so CSP doesn't need 'unsafe-inline' for scripts
docsRouter.get('/init.js', (_req, res) => {
  res.type('application/javascript').send(`
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        layout: 'StandaloneLayout',
      });
    };
  `);
});

docsRouter.get('/', (_req, res) => {
  res.type('html').send(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>API Docs</title>
  <link rel="stylesheet" href="${CDN}/swagger-ui.css" />
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="${CDN}/swagger-ui-bundle.js"></script>
  <script src="${CDN}/swagger-ui-standalone-preset.js"></script>
  <script src="/api/docs/init.js"></script>
</body>
</html>`);
});
