#!/usr/bin/env python3
"""
Simple HTTP server for serving the frontend files.
"""

import http.server
import socketserver
import os
import sys

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

def run_server():
    # Change to the directory containing the script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Create the server
    handler = MyHTTPRequestHandler
    httpd = socketserver.TCPServer(("", PORT), handler)
    
    print(f"Serving at http://localhost:{PORT}")
    print("Press Ctrl+C to stop the server")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")
        httpd.server_close()
        sys.exit(0)

if __name__ == "__main__":
    run_server() 