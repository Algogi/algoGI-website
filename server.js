// Custom Next.js server with gzip compression
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const compression = require("compression");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

const compressionMiddleware = compression({
  // Only compress textual responses
  filter: (req, res) => {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
  },
});

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      compressionMiddleware(req, res, () => {
        handle(req, res, parsedUrl);
      });
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://localhost:${port} - compression enabled`);
    });
  })
  .catch((err) => {
    console.error("Error starting server with compression:", err);
    process.exit(1);
  });

