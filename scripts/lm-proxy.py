#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Proxy minimo entre Claude Code y el servidor local (LM Studio / Bionic).

Problema: Claude Code incluye en `messages` un mensaje con role "system" (despues del mensaje del usuario).
La plantilla Jinja de algunos modelos (p. ej. qwen3.8-27b) lo rechaza con
"System message must be at the beginning" (HTTP 500).

Solucion: este proxy mueve el contenido de esos mensajes al campo `system` de la peticion y reenvia todo lo
demas sin cambios. Lo lanza scripts/delegar-local.ps1 y lo detiene al terminar.

Uso:  python scripts/lm-proxy.py [--port 1235] [--target http://localhost:1234]
"""
import argparse
import http.server
import json
import sys
import urllib.error
import urllib.request

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass


def _text_of(content):
    if isinstance(content, str):
        return content
    parts = []
    for block in content or []:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(block.get("text", ""))
    return "\n".join(p for p in parts if p)


def normalize(payload):
    """Saca los mensajes con role 'system' de `messages` y los agrega al campo `system`."""
    messages = payload.get("messages")
    if not isinstance(messages, list) or not any(isinstance(m, dict) and m.get("role") == "system" for m in messages):
        return payload
    moved = [_text_of(m.get("content")) for m in messages if isinstance(m, dict) and m.get("role") == "system"]
    payload["messages"] = [m for m in messages if not (isinstance(m, dict) and m.get("role") == "system")]
    extra = "\n\n".join(t for t in moved if t.strip())
    if extra:
        system = payload.get("system")
        if isinstance(system, list):
            payload["system"] = system + [{"type": "text", "text": extra}]
        elif isinstance(system, str) and system:
            payload["system"] = system + "\n\n" + extra
        else:
            payload["system"] = extra
    return payload


def make_handler(target):
    class Handler(http.server.BaseHTTPRequestHandler):
        protocol_version = "HTTP/1.1"

        def _forward(self, body):
            headers = {k: v for k, v in self.headers.items() if k.lower() not in ("host", "content-length")}
            req = urllib.request.Request(target + self.path, data=body, method=self.command, headers=headers)
            try:
                resp = urllib.request.urlopen(req, timeout=1800)
                code, ctype, out = resp.status, resp.headers.get("content-type", "application/json"), resp.read()
            except urllib.error.HTTPError as e:
                code, ctype, out = e.code, e.headers.get("content-type", "application/json"), e.read()
            except Exception as e:  # noqa: BLE001
                code, ctype = 502, "application/json"
                out = json.dumps({"type": "error", "error": {"type": "api_error", "message": f"proxy: {e}"}}).encode("utf-8")
            self.send_response(code)
            self.send_header("content-type", ctype)
            self.send_header("content-length", str(len(out)))
            self.end_headers()
            self.wfile.write(out)

        def do_POST(self):
            body = self.rfile.read(int(self.headers.get("content-length", 0)))
            try:
                body = json.dumps(normalize(json.loads(body)), ensure_ascii=False).encode("utf-8")
            except Exception:
                pass  # si no es JSON, se reenvia tal cual
            self._forward(body)

        def do_GET(self):
            self._forward(None)

        def log_message(self, *args):
            pass

    return Handler


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=1235)
    ap.add_argument("--target", default="http://localhost:1234")
    args = ap.parse_args()
    server = http.server.ThreadingHTTPServer(("127.0.0.1", args.port), make_handler(args.target.rstrip("/")))
    print(f"lm-proxy en http://127.0.0.1:{args.port} -> {args.target}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
