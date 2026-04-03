#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
import sys
import time
from pathlib import Path


ROUTE_RE = re.compile(
    r"^[├└┌│]\s+[ƒ○●]\s+(\S+)\s+([0-9.]+\s*(?:B|kB|MB))\s+([0-9.]+\s*(?:B|kB|MB))$"
)
SHARED_RE = re.compile(r"^\+\s+First Load JS shared by all\s+([0-9.]+\s*(?:B|kB|MB))$")


def size_to_kb(value: str) -> float:
    number, unit = value.split()
    amount = float(number)
    if unit == "B":
        return amount / 1024
    if unit == "kB":
        return amount
    if unit == "MB":
        return amount * 1024
    return amount


def main() -> int:
    parser = argparse.ArgumentParser(description="Run `npm run build` and summarize Next.js route sizes.")
    parser.add_argument("repo", nargs="?", default=".", help="Target repository path")
    parser.add_argument("--json-out", dest="json_out", default="perf-results/latest-build.json")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    started = time.time()
    proc = subprocess.run(
        ["npm", "run", "build"],
        cwd=repo,
        text=True,
        capture_output=True,
        check=False,
    )
    duration = round(time.time() - started, 2)

    routes = []
    shared_first_load_js = None
    output = proc.stdout + proc.stderr
    for line in output.splitlines():
        route_match = ROUTE_RE.match(line.strip())
        if route_match:
            route, size, first_load = route_match.groups()
            routes.append(
                {
                    "route": route,
                    "route_size": size,
                    "first_load_js": first_load,
                    "first_load_js_kb": round(size_to_kb(first_load), 2),
                }
            )
            continue

        shared_match = SHARED_RE.match(line.strip())
        if shared_match:
            shared_first_load_js = shared_match.group(1)

    routes.sort(key=lambda item: item["first_load_js_kb"], reverse=True)

    payload = {
        "repo": str(repo),
        "build_success": proc.returncode == 0,
        "duration_seconds": duration,
        "shared_first_load_js": shared_first_load_js,
        "top_routes": routes[:10],
    }

    out_path = (repo / args.json_out).resolve()
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n")

    print(f"repo: {repo}")
    print(f"build_success: {'yes' if proc.returncode == 0 else 'no'}")
    print(f"duration_seconds: {duration}")
    print(f"shared_first_load_js: {shared_first_load_js or '-'}")
    print("top_routes:")
    if routes:
        for route in routes[:10]:
            print(f"  - {route['route']}: route={route['route_size']}, first_load={route['first_load_js']}")
    else:
        print("  - none parsed")
    print(f"json: {out_path.relative_to(repo)}")

    if proc.returncode != 0:
        print("\n[build output tail]")
        for line in output.splitlines()[-40:]:
            print(line)

    return proc.returncode


if __name__ == "__main__":
    raise SystemExit(main())
