#!/usr/bin/env python3
"""Static dev server for the portfolio.

Identical to `python3 -m http.server` except that it sends no-store on every
response. The stock handler sends no cache headers at all, which leaves the
browser free to apply heuristic caching — and because the site is a graph of
ES modules, a cached js/main.js pins every module it imports at the old
version too. The result is edits that appear to do nothing until a manual
hard reload, which is a bad way to lose ten minutes.

Usage: python3 scripts/dev-server.py [port]
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class PortfolioServer(ThreadingHTTPServer):
    # CSS imports and ES modules arrive in a burst on a cold browser load.
    request_queue_size = 128


class NoCacheHandler(SimpleHTTPRequestHandler):
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Keep the console readable: report failures, drop the 200 firehose.
        if args and str(args[1]).startswith(("4", "5")):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    handler = partial(NoCacheHandler, directory=str(ROOT))
    with PortfolioServer(("127.0.0.1", port), handler) as httpd:
        print(f"serving {ROOT} at http://localhost:{port} (no-store)")
        httpd.serve_forever()


if __name__ == "__main__":
    main()
