#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_worker.py - unified worker for the AI dev harness (template docs/spec.md section 8). Standard library only.

    python .harness/run_worker.py docs/tasks/012-carousel.md
    python .harness/run_worker.py docs/tasks/012-carousel.fix-1.md --model qwen3.8-27b
    python .harness/run_worker.py --list-models
    python .harness/run_worker.py docs/tasks/012-carousel.md --dry-run
    python .harness/run_worker.py --watch        # in a second terminal: live progress of a running worker
    python .harness/run_worker.py --calibrate [--accept-calibration]

What it does for one task:
  1. picks the branch and, for the local tier, the model (asks via exit code 3 when there is no keyboard);
  2. runs the escalation ladder from .harness/harness.toml (local -> claude-haiku -> claude-sonnet -> main-claude);
     the local tier gets several attempts before escalating;
  3. after every attempt: scope guard (deletes obvious temp files, flags files outside the task scope) and the fast
     gates; failures go back to the same worker with a retry prompt (hardened after an overflow or empty result);
  4. when everything passes: commits on the task branch and prints a REVIEW BRIEF for Claude.

Exit codes: 0 delivered | 2 local server unreachable | 3 a model must be chosen (list printed) |
            4 ladder exhausted (the main Claude session takes over) | 5 usage or configuration error.
"""
import argparse
import fnmatch
import http.server
import json
import math
import os
import re
import shutil
import subprocess
import sys
import threading
import time
import tomllib
import urllib.error
import urllib.request
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

EXIT_OK, EXIT_SERVER, EXIT_NEEDS_MODEL, EXIT_LADDER, EXIT_CONFIG = 0, 2, 3, 4, 5

DEFAULTS = {
    "project": {"base_branch": "main"},
    "workers": {
        "ladder": ["local", "claude-haiku", "claude-sonnet", "main-claude"],
        "local": {"kind": "anthropic-compatible-server", "url": "http://localhost:1234", "model": "",
                  "attempts": 3, "max_output_tokens": 16000, "strip_thinking": False, "max_turns": 40},
        "claude-haiku": {"kind": "claude-cli", "model": "haiku", "attempts": 2, "max_turns": 40},
        "claude-sonnet": {"kind": "claude-cli", "model": "sonnet", "attempts": 1, "max_turns": 40},
    },
    "scope": {"protected": [], "temp_patterns": ["_tmp*", "*.tmp", "scratch", "scripts-tmp", "__pycache__"]},
    "gates": {"fast": [], "full": []},
    "timing": {"worker_minutes": 10, "worker_floor_minutes": 3, "worker_ceiling_minutes": 30,
               "gate_minutes": 5, "gate_floor_minutes": 1, "gate_ceiling_minutes": 20},
}

# Files that a package manager rewrites next to a manifest that is in scope.
COMPANIONS = {"package.json": ["package-lock.json"], "Cargo.toml": ["Cargo.lock"],
              "pyproject.toml": ["poetry.lock", "uv.lock"]}

SCOPE_HEADINGS = r"^##\s+(Archivos en alcance|Files in scope)"


# ----------------------------------------------------------------------------- configuration
def deep_merge(base, extra):
    out = dict(base)
    for key, value in (extra or {}).items():
        out[key] = deep_merge(out[key], value) if isinstance(value, dict) and isinstance(out.get(key), dict) else value
    return out


def load_config(root):
    path = Path(root) / ".harness" / "harness.toml"
    data = {}
    if path.exists():
        with open(path, "rb") as fh:
            data = tomllib.load(fh)
    return deep_merge(DEFAULTS, data)


# ----------------------------------------------------------------------------- tasks
def base_task_path(path):
    """A correction file (NNN-name.fix-K.md) uses the scope of its original task."""
    p = Path(path)
    return p.with_name(re.sub(r"\.fix-\d+\.md$", ".md", p.name))


def parse_task(path):
    text = Path(path).read_text(encoding="utf-8")
    front = {}
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.S)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                front[k.strip()] = v.split("#", 1)[0].strip()
    return {"text": text, "front": front}


def parse_scope(path):
    """Files listed under 'Archivos en alcance' / 'Files in scope' (first token of each bullet)."""
    allowed, inside = [], False
    p = base_task_path(path)
    if not p.exists():
        return allowed
    for line in p.read_text(encoding="utf-8").splitlines():
        if re.match(SCOPE_HEADINGS, line):
            inside = True
            continue
        if inside and re.match(r"^##\s", line):
            break
        m = re.match(r"^-\s+(\S+)", line) if inside else None
        if m:
            allowed.append(m.group(1).strip("`"))
    return allowed


# ----------------------------------------------------------------------------- git helpers
def git(root, *args, check=False):
    r = subprocess.run(["git", *args], cwd=str(root), capture_output=True, text=True, encoding="utf-8", errors="replace")
    if check and r.returncode != 0:
        raise RuntimeError(f"git {' '.join(args)} failed: {r.stderr.strip()}")
    return r


def changed_files(root):
    """[(flag, path)] from `git status --porcelain`, untracked files listed one by one."""
    out = []
    for line in git(root, "status", "--porcelain", "--untracked-files=all").stdout.splitlines():
        if len(line) < 4:
            continue
        path = line[3:]
        if " -> " in path:
            path = path.split(" -> ", 1)[1]
        path = path.strip('"')
        if path.startswith(".harness/state/"):
            continue  # per-machine worker state (live progress, timings, chosen model), never part of a task
        out.append((line[:2], path))
    return out


def current_branch(root):
    return git(root, "branch", "--show-current").stdout.strip()


def branch_exists(root, name):
    return git(root, "show-ref", "--verify", "--quiet", f"refs/heads/{name}").returncode == 0


def ensure_branch(root, branch, base):
    if current_branch(root) == branch:
        return
    if branch_exists(root, branch):
        git(root, "switch", branch, check=True)
        return
    if changed_files(root):
        raise RuntimeError("the working tree is not clean; commit or stash before starting a new task branch")
    git(root, "switch", "-c", branch, base, check=True)


# ----------------------------------------------------------------------------- scope guard
def glob_to_regex(pattern):
    pattern = pattern.replace("\\", "/")
    out, i = "", 0
    while i < len(pattern):
        c = pattern[i]
        if pattern.startswith("**", i):
            out += ".*"
            i += 2
            continue
        out += "[^/]*" if c == "*" else ("[^/]" if c == "?" else re.escape(c))
        i += 1
    return re.compile("^" + out + "$")


def path_matches(path, pattern):
    path = path.replace("\\", "/")
    pattern = pattern.replace("\\", "/")
    if pattern.endswith("/"):
        return path.startswith(pattern)
    if any(ch in pattern for ch in "*?"):
        return bool(glob_to_regex(pattern).match(path))
    return path == pattern


def is_temp(path, patterns):
    return any(fnmatch.fnmatch(seg, pat) for seg in path.replace("\\", "/").split("/") for pat in patterns)


def scope_check(root, allowed, protected, temp_patterns, clean=True):
    """Returns {'removed': [...], 'outside': [...], 'protected': [...], 'unknown': bool}."""
    root = Path(root)
    allowed_all = list(allowed)
    for a in allowed:
        allowed_all += COMPANIONS.get(a, [])
    removed, outside, prot = [], [], []
    for flag, path in changed_files(root):
        if path.startswith("docs/tasks/logs/"):
            continue
        if any(path_matches(path, pat) for pat in protected):
            prot.append(path)
            continue
        if allowed and any(path_matches(path, a) for a in allowed_all):
            continue
        if flag == "??" and is_temp(path, temp_patterns):
            if clean:
                try:
                    (root / path).unlink()
                    removed.append(path)
                    parent = (root / path).parent
                    while parent != root and not any(parent.iterdir()):
                        parent.rmdir()
                        parent = parent.parent
                    continue
                except OSError:
                    pass
            outside.append(path)
            continue
        if allowed:
            outside.append(path)
    return {"removed": removed, "outside": outside, "protected": prot, "unknown": not allowed}


# ----------------------------------------------------------------------------- gates
def tail(text, lines=40, chars=4000):
    t = "\n".join((text or "").strip().splitlines()[-lines:])
    return t[-chars:]


def run_command(cmd, cwd, timeout_s):
    # Gate commands come from the project's own .harness/harness.toml (written by the author), never from task text,
    # and they are plain command lines such as "npm test", so they run through the shell.
    t0 = time.time()
    try:
        r = subprocess.run(cmd, cwd=str(cwd), shell=True, capture_output=True, text=True, encoding="utf-8",
                           errors="replace", timeout=timeout_s)
        return {"cmd": cmd, "ok": r.returncode == 0, "seconds": round(time.time() - t0, 1), "timed_out": False,
                "output": tail((r.stdout or "") + (r.stderr or ""))}
    except subprocess.TimeoutExpired as e:
        partial = e.stdout if isinstance(e.stdout, str) else (e.stdout or b"").decode("utf-8", "replace")
        return {"cmd": cmd, "ok": False, "seconds": round(time.time() - t0, 1), "timed_out": True,
                "output": tail(partial) + f"\n(timed out after {int(timeout_s)} s)"}


def run_gates(commands, cwd, timeout_s):
    """Runs the commands in order and stops at the first failure."""
    results = []
    for cmd in commands:
        res = run_command(cmd, cwd, timeout_s)
        results.append(res)
        if not res["ok"]:
            break
    return results


def gates_ok(results):
    return all(r["ok"] for r in results)


# ----------------------------------------------------------------------------- timings and calibration
def p90(values):
    if not values:
        return None
    s = sorted(values)
    return s[max(0, math.ceil(0.9 * len(s)) - 1)]


def clamp(x, lo, hi):
    return max(lo, min(hi, x))


class Timings:
    """Durations per machine in .harness/state/timings.json (git-ignored)."""

    def __init__(self, path):
        self.path = Path(path)
        self.data = {"samples": {}, "limits": {}}
        if self.path.exists():
            try:
                self.data = json.loads(self.path.read_text(encoding="utf-8"))
            except Exception:
                pass

    def save(self):
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.path.write_text(json.dumps(self.data, indent=1), encoding="utf-8")

    def record(self, key, seconds):
        s = self.data["samples"].setdefault(key, [])
        s.append(round(seconds, 1))
        del s[:-30]

    def timeout_s(self, key, default_s, floor_s, ceiling_s, margin):
        """p90 of the last 10 samples times a margin, clamped; rises quickly and falls slowly."""
        samples = self.data["samples"].get(key, [])[-10:]
        candidate = default_s if not samples else p90(samples) * margin
        candidate = clamp(candidate, floor_s, ceiling_s)
        current = self.data["limits"].get(key)
        new = candidate if current is None or candidate >= current else current - (current - candidate) * 0.25
        new = clamp(new, floor_s, ceiling_s)
        self.data["limits"][key] = round(new, 1)
        return new

    def bump(self, key, default_s, ceiling_s):
        """After a timed-out run: raise the limit x1.5 up to the ceiling."""
        cur = self.data["limits"].get(key, default_s)
        self.data["limits"][key] = round(min(ceiling_s, cur * 1.5), 1)
        return self.data["limits"][key]


def timing_limits(cfg):
    t = cfg["timing"]
    return {
        "worker": (t["worker_minutes"] * 60, t["worker_floor_minutes"] * 60, t["worker_ceiling_minutes"] * 60, 1.5),
        "gate": (t["gate_minutes"] * 60, t["gate_floor_minutes"] * 60, t["gate_ceiling_minutes"] * 60, 3.0),
    }


# ----------------------------------------------------------------------------- proxy (normalises Claude Code requests)
STRIP_KEYS = ("thinking", "output_config", "context_management")


def _text_of(content):
    if isinstance(content, str):
        return content
    return "\n".join(b.get("text", "") for b in (content or []) if isinstance(b, dict) and b.get("type") == "text")


def normalize(payload, strip_thinking=False):
    """Moves role 'system' entries out of `messages` into `system` (some chat templates reject them)."""
    if strip_thinking:
        for key in STRIP_KEYS:
            payload.pop(key, None)
    messages = payload.get("messages")
    if not isinstance(messages, list):
        return payload
    moved = [_text_of(m.get("content")) for m in messages if isinstance(m, dict) and m.get("role") == "system"]
    if not moved:
        return payload
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


# ----------------------------------------------------------------------------- live feedback
class Live:
    """Counters of the current run, fed by the proxy. Saved to .harness/state/live.json and drawn on screen."""

    def __init__(self, path=None):
        self.path = Path(path) if path else None
        self.lock = threading.Lock()
        self.s = {"task": "", "model": "", "tier": "", "attempt": 0, "attempts": 0, "phase": "idle", "timeout_s": 0,
                  "started": 0.0, "requests": 0, "active": False, "in_tokens": 0, "out_tokens": 0, "cur_out": 0, "cur_in": 0,
                  "prefill_tps": None, "gen_tps": None, "tools": {}, "updated": 0.0, "pid": os.getpid()}
        self._req = None

    def set(self, **kw):
        with self.lock:
            self.s.update(kw)

    def begin_request(self):
        with self.lock:
            self.s["requests"] += 1
            self.s["active"] = True
            self.s["cur_out"] = 0
            self.s["cur_in"] = 0
            self._req = {"t0": time.time(), "first": None, "inp": 0, "out_est": 0.0, "out": None}

    def on_event(self, ev):
        """One decoded Anthropic stream event (a dict)."""
        with self.lock:
            r = self._req
            if r is None or not isinstance(ev, dict):
                return
            kind = ev.get("type")
            if kind == "message_start":
                u = (ev.get("message") or {}).get("usage") or {}
                r["inp"] = int(u.get("input_tokens") or 0) + int(u.get("cache_read_input_tokens") or 0)
                self.s["cur_in"] = r["inp"]
            elif kind == "content_block_start":
                block = ev.get("content_block") or {}
                if block.get("type") == "tool_use" and block.get("name"):
                    tools = self.s["tools"]
                    tools[block["name"]] = tools.get(block["name"], 0) + 1
            elif kind == "content_block_delta":
                d = ev.get("delta") or {}
                text = d.get("text") or d.get("thinking") or d.get("partial_json") or ""
                if r["first"] is None:
                    r["first"] = time.time()
                r["out_est"] += len(text) / 3.5
                self.s["cur_out"] = int(r["out"] if r["out"] is not None else r["out_est"])
            elif kind == "message_delta":
                u = ev.get("usage") or {}
                if u.get("output_tokens") is not None:
                    r["out"] = int(u["output_tokens"])
                    self.s["cur_out"] = r["out"]
                if u.get("input_tokens"):
                    r["inp"] = max(r["inp"], int(u["input_tokens"]))

    def on_usage(self, usage):
        """Usage block of a non-streamed reply."""
        with self.lock:
            if self._req is not None and isinstance(usage, dict):
                self._req["inp"] = int(usage.get("input_tokens") or 0) + int(usage.get("cache_read_input_tokens") or 0)
                self._req["out"] = int(usage.get("output_tokens") or 0)

    def end_request(self):
        with self.lock:
            r, self._req = self._req, None
            self.s["active"] = False
            if r is None:
                return
            now = time.time()
            out = r["out"] if r["out"] is not None else int(r["out_est"])
            self.s["in_tokens"] += r["inp"]
            self.s["out_tokens"] += out
            self.s["cur_out"] = 0
            self.s["cur_in"] = 0
            first = r["first"] or now
            if r["inp"] and first - r["t0"] > 0.2:
                self.s["prefill_tps"] = r["inp"] / (first - r["t0"])
            if out >= 10 and now - first >= 0.5:  # shorter bursts give meaningless speeds
                self.s["gen_tps"] = out / (now - first)

    def snapshot(self):
        with self.lock:
            snap = dict(self.s, tools=dict(self.s["tools"]))
            r = self._req
            if r is not None and r["first"] is not None and snap["cur_out"] and time.time() - r["first"] > 0.5:
                snap["gen_tps"] = snap["cur_out"] / (time.time() - r["first"])
            snap["now"] = time.time()
            return snap

    def save(self):
        if not self.path:
            return
        snap = self.snapshot()
        snap["updated"] = snap["now"]
        try:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            tmp = self.path.with_suffix(".tmp")
            tmp.write_text(json.dumps(snap), encoding="utf-8")
            os.replace(tmp, self.path)
        except OSError:
            pass


class SSETracker:
    """Feeds raw bytes of a server-sent-events stream to Live without changing them."""

    def __init__(self, live):
        self.live, self.buf = live, b""

    def feed(self, chunk):
        self.buf += chunk.replace(b"\r\n", b"\n")
        while b"\n\n" in self.buf:
            raw, self.buf = self.buf.split(b"\n\n", 1)
            for line in raw.split(b"\n"):
                if line.startswith(b"data:"):
                    try:
                        self.live.on_event(json.loads(line[5:].strip()))
                    except ValueError:
                        pass


def fmt_clock(seconds):
    seconds = max(0, int(seconds))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def fmt_rate(v):
    return "-" if not v else f"{v:.0f}" if v >= 100 else f"{v:.1f}"


def render_live(snap, width=160):
    """One status line (plain ASCII) from a Live snapshot."""
    if snap.get("phase") == "done":
        return "worker finished"
    if snap.get("phase") == "idle" and not snap.get("started"):
        return "waiting for the worker ..."
    elapsed = snap["now"] - snap["started"] if snap.get("started") else 0
    budget = snap.get("timeout_s") or 0
    bar = ""
    if budget and snap["phase"] == "worker":
        filled = min(10, int(10 * elapsed / budget))
        bar = " [" + "#" * filled + "-" * (10 - filled) + "]"
    who = snap["tier"] + (f" {snap['model']}" if snap["tier"] == "local" and snap.get("model") else "")
    parts = [f"{who} try {snap['attempt']}/{snap['attempts']}"]
    if snap["phase"] == "gates":
        parts.append(f"checks running {fmt_clock(elapsed)}")
    else:
        parts.append(f"{fmt_clock(elapsed)}" + (f"/{fmt_clock(budget)}" if budget else "") + bar)
    if snap["tier"] == "local":
        state = "gen" if snap["active"] and snap["cur_out"] else ("wait" if snap["active"] else "idle")
        out_total = snap["out_tokens"] + snap["cur_out"]
        parts.append(f"req {snap['requests']} {state}")
        parts.append(f"in {snap['in_tokens'] + snap.get('cur_in', 0)} tok ({fmt_rate(snap['prefill_tps'])} t/s)")
        parts.append(f"out {out_total} tok ({fmt_rate(snap['gen_tps'])} t/s)")
    else:
        parts.append("cloud worker (no token stats)")
    if snap.get("tools"):
        parts.append(" ".join(f"{k}x{v}" for k, v in sorted(snap["tools"].items())))
    line = " | ".join(parts)
    return line if len(line) <= width else line[: max(10, width - 3)] + "..."


class Display:
    """Background thread: saves live.json every second and draws the line on a terminal (or a log line every 30 s)."""

    def __init__(self, live, stream=None):
        self.live, self.stream = live, stream or sys.stdout
        self.tty = bool(getattr(self.stream, "isatty", lambda: False)())
        self.stop_ev = threading.Event()
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.last_plain = 0.0
        self.shown = 0

    def start(self):
        self.thread.start()

    def _loop(self):
        while not self.stop_ev.wait(1.0):
            self.live.save()
            snap = self.live.snapshot()
            if snap["phase"] in ("idle", "done"):
                continue
            if self.tty:
                width = max(40, shutil.get_terminal_size((100, 20)).columns - 1)
                text = render_live(snap, width)
                self.stream.write("\r" + text.ljust(self.shown))
                self.stream.flush()
                self.shown = len(text)
            elif time.time() - self.last_plain >= 30:
                self.last_plain = time.time()
                self.stream.write("   " + render_live(snap) + "\n")
                self.stream.flush()

    def clear(self):
        if self.tty and self.shown:
            self.stream.write("\r" + " " * self.shown + "\r")
            self.stream.flush()
            self.shown = 0

    def stop(self):
        self.stop_ev.set()
        self.thread.join(timeout=2)
        self.clear()
        self.live.set(phase="done")
        self.live.save()


def cmd_watch(root):
    """Second terminal: shows the live line of a run started elsewhere (Ctrl+C to leave)."""
    path = state_dir(root) / "live.json"
    tty = sys.stdout.isatty()
    last, seen = "", False
    try:
        while True:
            try:
                snap = json.loads(path.read_text(encoding="utf-8"))
                stale = time.time() - snap.get("updated", 0) > 15
            except (OSError, ValueError):
                snap, stale = None, True
            if snap and snap.get("phase") not in ("done", "idle") and not stale:
                seen = True
            if snap is None or (stale and snap.get("phase") != "done"):
                text = "no worker running (waiting) ..."
            elif snap.get("phase") == "done" and not seen:
                text = "the last run is finished; waiting for a new one ..."
            else:
                snap["now"] = time.time() if not stale else snap.get("updated", 0)
                width = max(40, shutil.get_terminal_size((100, 20)).columns - 1) if tty else 200
                text = render_live(snap, width)
            try:
                if tty:
                    sys.stdout.write("\r" + text.ljust(len(last)))
                    sys.stdout.flush()
                elif text != last:
                    print(text, flush=True)
            except OSError:
                return EXIT_OK  # the reader went away (for example `| head`)
            last = text
            if snap and snap.get("phase") == "done" and seen:
                print()
                return EXIT_OK
            time.sleep(1)
    except KeyboardInterrupt:
        print()
        return EXIT_OK


class _QuietServer(http.server.ThreadingHTTPServer):
    """Clients that drop the connection (Claude Code closing a request) are normal, not errors."""

    def handle_error(self, request, client_address):
        if not isinstance(sys.exc_info()[1], (ConnectionError, BrokenPipeError)):
            super().handle_error(request, client_address)


class Proxy:
    def __init__(self, target, strip_thinking=False, live=None):
        self.target = target.rstrip("/")
        self.strip = strip_thinking
        self.live = live
        self.server = None
        self.port = None

    def start(self):
        target, strip, live = self.target, self.strip, self.live

        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = "HTTP/1.1"

            def _send(self, code, ctype, out):
                self.send_response(code)
                self.send_header("content-type", ctype)
                self.send_header("content-length", str(len(out)))
                self.end_headers()
                self.wfile.write(out)

            def _forward(self, body):
                headers = {k: v for k, v in self.headers.items() if k.lower() not in ("host", "content-length")}
                req = urllib.request.Request(target + self.path, data=body, method=self.command, headers=headers)
                tracked = live is not None and self.command == "POST"
                if tracked:
                    live.begin_request()
                try:
                    try:
                        resp = urllib.request.urlopen(req, timeout=1800)
                    except urllib.error.HTTPError as e:
                        return self._send(e.code, e.headers.get("content-type", "application/json"), e.read())
                    except Exception as e:  # noqa: BLE001
                        err = {"type": "error", "error": {"type": "api_error", "message": f"proxy: {e}"}}
                        return self._send(502, "application/json", json.dumps(err).encode())
                    ctype = resp.headers.get("content-type", "application/json")
                    if "text/event-stream" not in ctype:
                        out = resp.read()
                        if tracked:
                            try:
                                live.on_usage(json.loads(out).get("usage"))
                            except (ValueError, AttributeError):
                                pass
                        return self._send(resp.status, ctype, out)
                    # Streamed reply: pass the bytes on as they arrive and let Live watch them.
                    self.send_response(resp.status)
                    self.send_header("content-type", ctype)
                    self.send_header("cache-control", "no-cache")
                    self.send_header("transfer-encoding", "chunked")
                    self.end_headers()
                    tracker = SSETracker(live) if tracked else None
                    read = getattr(resp, "read1", resp.read)
                    while True:
                        chunk = read(8192)
                        if not chunk:
                            break
                        if tracker:
                            tracker.feed(chunk)
                        self.wfile.write(b"%x\r\n%s\r\n" % (len(chunk), chunk))
                        self.wfile.flush()
                    self.wfile.write(b"0\r\n\r\n")
                    self.wfile.flush()
                finally:
                    if tracked:
                        live.end_request()

            def do_POST(self):
                body = self.rfile.read(int(self.headers.get("content-length", 0)))
                try:
                    body = json.dumps(normalize(json.loads(body), strip), ensure_ascii=False).encode("utf-8")
                except Exception:
                    pass
                self._forward(body)

            def do_GET(self):
                self._forward(None)

            def log_message(self, *args):
                pass

        self.server = _QuietServer(("127.0.0.1", 0), Handler)
        self.port = self.server.server_address[1]
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        return self.port

    def stop(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            self.server = None


# ----------------------------------------------------------------------------- local server and model discovery
class NeedsModel(Exception):
    def __init__(self, models):
        super().__init__("a model must be chosen")
        self.models = models


NON_CHAT = ("embed", "rerank", "whisper", "tts", "clip-", "vae")


def http_json(url, payload=None, timeout=30):
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, method="POST" if payload is not None else "GET",
                                 headers={"Content-Type": "application/json", "Authorization": "Bearer lm-studio"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def list_models(base):
    """Chat models downloaded on the server, with their state (/api/v0/models; falls back to /v1/models)."""
    data, last = None, None
    for path in ("/api/v0/models", "/v1/models"):
        try:
            data = http_json(base.rstrip("/") + path, timeout=15)
            break
        except Exception as e:  # noqa: BLE001
            last = e
    if data is None:
        raise ConnectionError(str(last))
    out = []
    for m in data.get("data") or data.get("models") or []:
        mid = m.get("id") or m.get("key")
        kind = str(m.get("type", "llm")).lower()
        if not mid or kind not in ("llm", "vlm") or any(x in mid.lower() for x in NON_CHAT):
            continue
        out.append({"id": mid, "state": m.get("state", "unknown"), "type": kind, "quantization": m.get("quantization", "")})
    return out


def resolve_model(models, wanted=None, interactive=False, ask=input):
    """wanted: exact id or a unique substring. Otherwise the single loaded model; otherwise ask (or raise NeedsModel)."""
    if wanted:
        low = wanted.lower()
        exact = [m for m in models if m["id"].lower() == low]
        part = [m for m in models if low in m["id"].lower()]
        found = exact or part
        if len(found) == 1:
            return found[0]
        if not found:
            raise ValueError(f"no model matches '{wanted}'")
        raise NeedsModel(found)
    loaded = [m for m in models if m["state"] == "loaded"]
    if len(loaded) == 1:
        return loaded[0]
    pool = loaded or models
    if not interactive:
        raise NeedsModel(pool)
    for i, m in enumerate(pool, 1):
        print(f"  {i}. {m['id']}  ({m['quantization']}, {m['state']})")
    while True:
        s = ask("Which model? number: ").strip()
        if s.isdigit() and 1 <= int(s) <= len(pool):
            return pool[int(s) - 1]


def ensure_loaded(base, model):
    if model["state"] == "loaded":
        return "already loaded"
    try:
        http_json(base.rstrip("/") + "/api/v1/models/load", {"model": model["id"]}, timeout=900)
        return "loaded by the API"
    except urllib.error.HTTPError as e:
        if e.code in (404, 405):
            return "no load endpoint: the server loads it on first use"
        raise


# ----------------------------------------------------------------------------- workers
def claude_exe():
    return shutil.which("claude") or shutil.which("claude.exe")


def allowed_bash_from_gates(cfg):
    firsts = []
    for cmd in cfg["gates"].get("fast", []) + cfg["gates"].get("full", []):
        word = cmd.split()[0] if cmd.split() else ""
        if word and word not in firsts:
            firsts.append(word)
    return firsts


def build_worker_cmd(claude, model, role, allowed_bash, max_turns):
    allowed = ["Read", "Edit", "Write", "Glob", "Grep"] + [f"Bash({b} *)" for b in allowed_bash]
    return [claude, "-p", "--model", model, "--max-turns", str(max_turns), "--permission-mode", "acceptEdits",
            "--tools", "Read,Edit,Write,Glob,Grep,Bash", "--allowedTools", ",".join(allowed),
            "--strict-mcp-config", "--system-prompt", role]


def classify_output(output):
    return {"overflow": "output token maximum" in output,
            "max_turns": "Reached max turns" in output,
            "api_error": bool(re.match(r"\s*(API Error|Error:)", output))}


def run_claude(cmd, prompt, env, cwd, timeout_s):
    t0 = time.time()
    try:
        r = subprocess.run(cmd, input=prompt, capture_output=True, text=True, encoding="utf-8", errors="replace",
                           cwd=str(cwd), env=env, timeout=timeout_s)
        out, timed_out = (r.stdout or "") + (r.stderr or ""), False
    except subprocess.TimeoutExpired as e:
        raw = e.stdout
        out = raw if isinstance(raw, str) else (raw or b"").decode("utf-8", "replace")
        timed_out = True
    return {"output": out.strip(), "timed_out": timed_out, "seconds": round(time.time() - t0, 1),
            "flags": classify_output(out)}


# ----------------------------------------------------------------------------- prompts
HARDEN = ("The previous attempt produced no usable result ({reason}). Retry under these rules: write ONE file per tool call; "
          "keep code compact; do not reason at length or explain; do not create temporary or debug files; start by "
          "writing the first file now.")


def retry_prompt(task_text, kind, details):
    if kind == "first":
        return task_text
    if kind in ("overflow", "no_output", "timeout"):
        reason = {"overflow": "the answer exceeded the output limit", "no_output": "no files were changed",
                  "timeout": "it ran out of time"}[kind]
        extra = " Files you already wrote are kept: continue from them instead of starting over." if kind == "timeout" else ""
        return task_text + "\n\n## Retry\n" + HARDEN.format(reason=reason) + extra
    return task_text + "\n\n## Retry: fix these problems\n" + details + "\n\nChange only what is needed to fix them."


def next_retry(res, chk):
    return chk["kind"], chk["details"]


# ----------------------------------------------------------------------------- the ladder
def run_ladder(ladder, tiers, attempt_fn, check_fn):
    """attempt_fn(tier, n, kind, details) -> result dict; check_fn(result) -> {'ok','kind','details'}."""
    history, kind, details, last = [], "first", "", None
    for tier in ladder:
        if tier == "main-claude":
            break
        attempts = int(tiers.get(tier, {}).get("attempts", 1))
        for n in range(1, attempts + 1):
            res = attempt_fn(tier, n, kind, details)
            chk = check_fn(res)
            history.append({"tier": tier, "attempt": n, "kind": kind, "seconds": res["seconds"],
                            "flags": res["flags"], "timed_out": res["timed_out"], "ok": chk["ok"],
                            "failure": None if chk["ok"] else chk["kind"]})
            last = res
            if chk["ok"]:
                return {"status": "ok", "tier": tier, "history": history, "check": chk, "last": res}
            kind, details = next_retry(res, chk)
    return {"status": "exhausted", "history": history, "check": None, "last": last}


def make_checker(root, cfg, allowed, gate_timeout_s):
    def check(res):
        scope = scope_check(root, allowed, cfg["scope"]["protected"], cfg["scope"]["temp_patterns"], clean=True)
        changed = [p for f, p in changed_files(root) if not p.startswith("docs/tasks/logs/")]
        gates = run_gates(cfg["gates"]["fast"], root, gate_timeout_s) if changed else []
        res["scope"], res["gates"] = scope, gates
        problems = []
        if scope["outside"]:
            problems.append("Files outside the task scope (revert or delete them): " + ", ".join(scope["outside"]))
        if scope["protected"]:
            problems.append("Protected files were modified (revert them): " + ", ".join(scope["protected"]))
        if gates and not gates_ok(gates):
            bad = next(g for g in gates if not g["ok"])
            problems.append(f"The check `{bad['cmd']}` failed:\n{bad['output']}")
        if problems:
            return {"ok": False, "kind": "gates", "details": "\n\n".join(problems)}
        if res["flags"]["overflow"] and not changed:
            return {"ok": False, "kind": "overflow", "details": ""}
        if res["timed_out"] and not changed:
            return {"ok": False, "kind": "timeout", "details": ""}
        if not changed:
            return {"ok": False, "kind": "no_output", "details": ""}
        return {"ok": True, "kind": "ok", "details": ""}
    return check


# ----------------------------------------------------------------------------- brief and log
def make_brief(task, branch, outcome, model, scope, gates, diffstat, log_path, escalated, totals=None):
    lines = ["=== REVIEW BRIEF ===", f"task:   {task}", f"branch: {branch}"]
    if outcome["status"] == "ok":
        n = sum(1 for h in outcome["history"])
        lines.append(f"worker: {outcome['tier']}" + (f" ({model})" if outcome["tier"] == "local" and model else "")
                     + f" after {n} attempt(s)" + (" - ESCALATED" if escalated else ""))
    else:
        lines.append("worker: ladder exhausted - the main Claude session must take over (changes stay uncommitted on the branch)")
    if scope:
        s = []
        if scope.get("removed"):
            s.append("temp files removed: " + ", ".join(scope["removed"]))
        if scope.get("outside"):
            s.append("OUTSIDE SCOPE: " + ", ".join(scope["outside"]))
        if scope.get("protected"):
            s.append("PROTECTED TOUCHED: " + ", ".join(scope["protected"]))
        if scope.get("unknown"):
            s.append("scope unknown (no 'Files in scope' found)")
        lines.append("scope:  " + ("; ".join(s) if s else "OK"))
    for g in gates or []:
        lines.append(f"gate:   `{g['cmd']}` {'OK' if g['ok'] else 'FAILED'} ({g['seconds']} s)")
    if not gates:
        lines.append("gate:   (none configured or nothing changed)")
    lines.append("attempts: " + "; ".join(f"{h['tier']}#{h['attempt']} {h['kind']} -> " + ("ok" if h["ok"] else str(h["failure"]))
                                          + f" ({h['seconds']} s)" for h in outcome["history"]))
    if totals and totals.get("requests"):
        lines.append(f"tokens: in {totals['in_tokens']}, out {totals['out_tokens']} over {totals['requests']} request(s); "
                     f"last speeds: prefill {fmt_rate(totals['prefill_tps'])} t/s, generation {fmt_rate(totals['gen_tps'])} t/s")
    if diffstat:
        lines += ["files:", diffstat]
    lines.append(f"log:    {log_path}")
    return "\n".join(lines)


# ----------------------------------------------------------------------------- main flow
def read_role(root):
    p = Path(root) / ".harness" / "roles" / "implementer.md"
    if p.exists():
        return re.sub(r"<!--.*?-->", "", p.read_text(encoding="utf-8"), flags=re.S).strip()
    return ("You are a careful engineer. Do ONLY what the task asks, in the listed files. No refactors, no new dependencies, "
            "no temporary files. Run the project checks before finishing. Final answer: at most 10 lines.")


def state_dir(root):
    return Path(root) / ".harness" / "state"


def cmd_list_models(cfg):
    base = cfg["workers"]["local"]["url"]
    try:
        for m in list_models(base):
            print(f"{m['id']}\t{m['state']}\t{m['quantization']}")
    except ConnectionError as e:
        print(f"cannot reach the local server at {base}: {e}", file=sys.stderr)
        return EXIT_SERVER
    return EXIT_OK


def cmd_calibrate(root, cfg, accept):
    fast = cfg["gates"]["fast"]
    if not fast:
        print("no fast gates configured in .harness/harness.toml [gates]", file=sys.stderr)
        return EXIT_CONFIG
    lim = timing_limits(cfg)["gate"]
    cold = sum(g["seconds"] for g in run_gates(fast, root, lim[2]))
    warm = sum(g["seconds"] for g in run_gates(fast, root, lim[2]))
    print(f"fast gates: cold {cold:.1f} s, warm {warm:.1f} s (table: {lim[0] / 60:.0f} min)")
    if max(cold, warm) > 5 * lim[0] and not accept:
        print("This is more than 5x the table value. Check it is expected, then run again with --accept-calibration.")
        return EXIT_CONFIG
    timings = Timings(state_dir(root) / "timings.json")
    timings.record("gate", cold)
    timings.record("gate", warm)
    limit = clamp(3 * max(cold, warm), lim[1], lim[2])
    timings.data["limits"]["gate"] = round(limit, 1)
    timings.save()
    print(f"gate timeout set to {limit:.0f} s")
    return EXIT_OK


def main(argv=None):
    ap = argparse.ArgumentParser(description="Unified worker for the AI dev harness.")
    ap.add_argument("task", nargs="?", help="task file (docs/tasks/NNN-name.md or a .fix-K.md correction file)")
    ap.add_argument("--root", default=".", help="project root (default: current folder)")
    ap.add_argument("--branch", help="task branch (default: task/<task file stem>)")
    ap.add_argument("--model", help="local model id (or a unique part of it)")
    ap.add_argument("--start", help="start the ladder at this tier (e.g. claude-haiku)")
    ap.add_argument("--max-turns", type=int)
    ap.add_argument("--list-models", action="store_true")
    ap.add_argument("--calibrate", action="store_true")
    ap.add_argument("--accept-calibration", action="store_true")
    ap.add_argument("--dry-run", action="store_true", help="print the plan and change nothing")
    ap.add_argument("--watch", action="store_true", help="show the live progress of a worker run started elsewhere")
    args = ap.parse_args(argv)

    root = Path(args.root).resolve()
    cfg = load_config(root)
    if args.watch:
        return cmd_watch(root)
    if args.list_models:
        return cmd_list_models(cfg)
    if args.calibrate:
        return cmd_calibrate(root, cfg, args.accept_calibration)
    if not args.task:
        ap.print_usage()
        print("error: a task file is required", file=sys.stderr)
        return EXIT_CONFIG
    task_path = (root / args.task) if not Path(args.task).is_absolute() else Path(args.task)
    if not task_path.exists():
        print(f"error: task file not found: {task_path}", file=sys.stderr)
        return EXIT_CONFIG

    task = parse_task(task_path)
    allowed = parse_scope(task_path)
    stem = base_task_path(task_path).stem
    branch = args.branch or f"task/{stem}"
    base_branch = cfg["project"]["base_branch"]
    ladder = list(cfg["workers"]["ladder"])
    if args.start:
        if args.start not in ladder:
            print(f"error: tier '{args.start}' is not in the ladder {ladder}", file=sys.stderr)
            return EXIT_CONFIG
        ladder = ladder[ladder.index(args.start):]
    tiers = {t: cfg["workers"].get(t, {}) for t in ladder}
    timings = Timings(state_dir(root) / "timings.json")
    lim = timing_limits(cfg)
    worker_s = timings.timeout_s("worker", *lim["worker"])
    gate_s = timings.timeout_s("gate", *lim["gate"])
    role = read_role(root)

    print(f"task {task_path.name} | branch {branch} | ladder {' > '.join(ladder)}")
    print(f"scope: {', '.join(allowed) if allowed else '(unknown)'} | fast gates: {cfg['gates']['fast'] or '(none)'}")
    print(f"timeouts: worker {worker_s:.0f} s per attempt, gates {gate_s:.0f} s per pass")
    if args.dry_run:
        return EXIT_OK

    try:
        ensure_branch(root, branch, base_branch)
    except RuntimeError as e:
        print(f"error: {e}", file=sys.stderr)
        return EXIT_CONFIG

    proxy, model, local_cfg = None, "", cfg["workers"]["local"]
    live = Live(state_dir(root) / "live.json")
    live.set(task=task_path.name)
    display = Display(live)
    display.start()
    claude = claude_exe()
    if not claude:
        print("error: the `claude` command was not found in PATH", file=sys.stderr)
        return EXIT_CONFIG
    if "local" in ladder:
        base = local_cfg["url"]
        try:
            models = list_models(base)
        except ConnectionError as e:
            print(f"cannot reach the local server at {base}: {e}", file=sys.stderr)
            return EXIT_SERVER
        saved = ""
        sfile = state_dir(root) / "model.txt"
        if sfile.exists():
            saved = sfile.read_text(encoding="utf-8").strip()
        wanted = args.model or local_cfg.get("model") or saved
        try:
            chosen = resolve_model(models, wanted or None, interactive=sys.stdin.isatty())
        except NeedsModel as e:
            print("NEEDS_MODEL: choose one and run again with --model <id>")
            for m in e.models:
                print(f"  {m['id']}\t{m['state']}\t{m['quantization']}")
            return EXIT_NEEDS_MODEL
        except ValueError as e:
            print(f"error: {e}", file=sys.stderr)
            return EXIT_CONFIG
        print(f"model: {chosen['id']} ({ensure_loaded(base, chosen)})")
        model = chosen["id"]
        sfile.parent.mkdir(parents=True, exist_ok=True)
        sfile.write_text(model, encoding="utf-8")
        proxy = Proxy(base, bool(local_cfg.get("strip_thinking")), live)
        proxy.start()

    allowed_bash = allowed_bash_from_gates(cfg)
    log = []

    def attempt(tier, n, kind, details):
        tcfg = cfg["workers"].get(tier, {})
        env = dict(os.environ)
        if tier == "local":
            env.update(ANTHROPIC_BASE_URL=f"http://127.0.0.1:{proxy.port}", ANTHROPIC_AUTH_TOKEN="lmstudio",
                       CLAUDE_CODE_ATTRIBUTION_HEADER="0",
                       CLAUDE_CODE_MAX_OUTPUT_TOKENS=str(tcfg.get("max_output_tokens", 16000)))
            use_model = model
        else:
            for k in ("ANTHROPIC_BASE_URL", "ANTHROPIC_AUTH_TOKEN"):
                env.pop(k, None)
            use_model = tcfg.get("model", "haiku")
        cmd = build_worker_cmd(claude, use_model, role, allowed_bash, args.max_turns or tcfg.get("max_turns", 40))
        prompt = retry_prompt(task["text"], kind, details)
        display.clear()
        print(f"-> {tier} attempt {n} ({kind}) ...", flush=True)
        live.set(tier=tier, model=model if tier == "local" else "", attempt=n, attempts=int(tcfg.get("attempts", 1)),
                 phase="worker", timeout_s=worker_s, started=time.time(), tools={})
        res = run_claude(cmd, prompt, env, root, worker_s)
        live.set(phase="gates", started=time.time())
        if res["timed_out"]:
            timings.bump("worker", lim["worker"][0], lim["worker"][2])
        else:
            timings.record("worker", res["seconds"])
        log.append(f"--- {tier} attempt {n} ({kind}), {res['seconds']} s ---\n{res['output']}")
        return res

    checker = make_checker(root, cfg, allowed, gate_s)
    try:
        outcome = run_ladder(ladder, tiers, attempt, lambda r: record_gates(checker(r), r, timings, lim))
    finally:
        display.stop()
        if proxy:
            proxy.stop()
        timings.save()
    totals = live.snapshot()

    stem_log = Path(root) / "docs" / "tasks" / "logs" / (task_path.stem + ".txt")
    stem_log.parent.mkdir(parents=True, exist_ok=True)
    escalated = outcome["status"] == "ok" and outcome["tier"] != ladder[0]
    if outcome["status"] == "ok":
        git(root, "add", "-A", "--", ".", ":(exclude).harness/state")
        git(root, "commit", "-m", f"worker({outcome['tier']}/{model or 'claude'}): {task_path.name}")
        base_ref = base_branch if branch_exists(root, base_branch) else "HEAD~1"
        diffstat = git(root, "diff", "--stat", f"{base_ref}...HEAD").stdout.strip()
    else:
        diffstat = "\n".join(f"{f} {p}" for f, p in changed_files(root))
    last = outcome.get("last") or {}
    brief = make_brief(task_path.name, branch, outcome, model, last.get("scope"), last.get("gates"), diffstat,
                       stem_log.relative_to(root).as_posix(), escalated, totals)
    stem_log.write_text("\n\n".join(log) + "\n\n" + brief + "\n", encoding="utf-8")
    print(brief)
    return EXIT_OK if outcome["status"] == "ok" else EXIT_LADDER


def record_gates(chk, res, timings, lim):
    """Feeds the gate durations of an attempt into the calibration data and returns the check result."""
    for g in res.get("gates", []):
        if g["timed_out"]:
            timings.bump("gate", lim["gate"][0], lim["gate"][2])
        elif g["ok"]:
            timings.record("gate", g["seconds"])
    return chk


if __name__ == "__main__":
    sys.exit(main())
