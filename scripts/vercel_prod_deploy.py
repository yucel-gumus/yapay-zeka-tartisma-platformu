#!/usr/bin/env python3
import base64
import os
import subprocess
from pathlib import Path

token = Path.home().joinpath(".hermes/secrets/vercel_token").read_text().strip()
wd = Path(__file__).resolve().parent.parent
os.chdir(wd)

def run(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw)

def ssh_env():
    key = run(["ssh", "yucel@192.168.1.106", "grep '^CLIENT_API_KEYS=' ~/python_backend/.env | head -1"]).stdout.strip()
    if not key:
        raise SystemExit("CLIENT_API_KEYS not found on gateway")
    val = key.split("=", 1)[1].strip().strip('"').strip("'")
    first = val.split(",")[0].strip()
    return base64.b64encode(first.encode()).decode()

b64 = ssh_env()
for name in ("AI_API_URL", "GATEWAY_CLIENT_API_KEY"):
    run(["npx", "vercel", "env", "rm", name, "production", "--yes", "--token", token], cwd=wd)
    run(["npx", "vercel", "env", "add", name, "production", "--token", token], cwd=wd, input=("https://api.yucelgumus.dev\n" if name == "AI_API_URL" else f"{b64}\n").encode())

run(["npx", "vercel", "--prod", "--yes", "--token", token], cwd=wd)
print("OK", run(["npx", "vercel", "ls", "--token", token], cwd=wd).stdout.split("\n")[4] if True else "")