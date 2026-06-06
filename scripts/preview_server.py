#!/usr/bin/env python3
"""Static preview server for the storefront repo.

Serves the repo ROOT so both the storefront (design/...) and the new
canonical client views (clients/monti-trentini/report.html) are reachable.
Sets the serve directory explicitly to avoid os.getcwd() (blocked under the
preview sandbox).
"""
import http.server, socketserver, functools

ROOT = "/Users/richardposada/Downloads/design_handoff_shopify_storefront"
PORT = 8123

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()
    def log_message(self, *a):  # quiet
        pass

Handler = functools.partial(Handler, directory=ROOT)
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Preview server on http://127.0.0.1:{PORT}  (root: {ROOT})")
    httpd.serve_forever()
