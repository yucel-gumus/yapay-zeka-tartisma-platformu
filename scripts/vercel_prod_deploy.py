#!/usr/bin/env python3
"""Set gateway env on Vercel and deploy production."""
import os
import subprocess
from pathlib import Path

token = Path.home().joinpath(".hermes/secrets/vercel_token").read_text().strip()
wd = Path(__file__).resolve().parent.parent
os.chdir(wd)


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, text=True, capture_output=True, **kw)


def gateway_client_key_plain() -> str:
    pw = os.environ.get("GATEWAY_SSH_PASS", "6137")
    r = run(
        [
            "sshpass",
            "-p",
            pw,
            "ssh",
            "-o",
            "StrictHostKeyChecking=no",
            "yucel@192.168.1.106",
            "grep CLIENT_API_KEYS ~/python_backend/.env | head -1",
        ]
    )
    line = r.stdout.strip()
    if not line:
        raise SystemExit("CLIENT_API_KEYS not found on gateway")
    val = line.split("=", 1)[1].strip().strip('"').strip("'")
    return val.split(",")[0].strip()


client_key = gateway_client_key_plain()

for name, val in (
    ("AI_API_URL", "https://python-backend-270384591051.europe-west3.run.app"),
    ("GATEWAY_CLIENT_API_KEY", client_key),
):
    subprocess.run(
        ["npx", "vercel", "env", "rm", name, "production", "--yes", "--token", token],
        cwd=wd,
        capture_output=True,
    )
    run(
        ["npx", "vercel", "env", "add", name, "production", "--token", token],
        cwd=wd,
        input=val + "\n",
    )
    print(f"set {name}")

run(["npx", "vercel", "--prod", "--yes", "--token", token], cwd=wd)
print("production deploy OK")