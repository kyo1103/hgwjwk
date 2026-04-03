#!/usr/bin/env python3
import argparse
from pathlib import Path


EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".css", ".mjs"}
IGNORE_PARTS = {"node_modules", ".git", "dist", "build"}
PATTERNS = {
    "sort_in_render": ".sort(",
    "filter_calls": ".filter(",
    "map_calls": ".map(",
    "find_calls": ".find(",
    "reduce_calls": ".reduce(",
    "new_date_calls": "new Date(",
}


def should_scan(path: Path) -> bool:
    return path.suffix in EXTENSIONS and not any(
        part in IGNORE_PARTS or part.startswith(".next") for part in path.parts
    )


def scan_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    counts = {name: text.count(token) for name, token in PATTERNS.items()}
    score = (
        counts["sort_in_render"] * 6
        + counts["filter_calls"] * 3
        + counts["reduce_calls"] * 4
        + counts["map_calls"]
        + counts["find_calls"] * 2
        + counts["new_date_calls"] * 2
        + max(0, len(lines) - 250) / 40
    )
    return {
        "path": str(path),
        "line_count": len(lines),
        "counts": counts,
        "score": round(score, 2),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Scan a repo for likely performance hotspots.")
    parser.add_argument("repo", nargs="?", default=".", help="Target repository path")
    args = parser.parse_args()

    repo = Path(args.repo).resolve()
    files = [path for path in repo.rglob("*") if path.is_file() and should_scan(path)]
    reports = [scan_file(path) for path in files]

    biggest = sorted(reports, key=lambda item: item["line_count"], reverse=True)[:12]
    hottest = sorted(reports, key=lambda item: item["score"], reverse=True)[:12]

    print(f"repo: {repo}")
    print("\nbiggest_files:")
    for item in biggest:
        print(f"  - {Path(item['path']).relative_to(repo)}: {item['line_count']} lines")

    print("\nperf_hotspots:")
    for item in hottest:
        counts = item["counts"]
        print(
            "  - "
            f"{Path(item['path']).relative_to(repo)}: "
            f"score={item['score']}, "
            f"lines={item['line_count']}, "
            f"sort={counts['sort_in_render']}, "
            f"filter={counts['filter_calls']}, "
            f"map={counts['map_calls']}, "
            f"reduce={counts['reduce_calls']}, "
            f"find={counts['find_calls']}, "
            f"newDate={counts['new_date_calls']}"
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
