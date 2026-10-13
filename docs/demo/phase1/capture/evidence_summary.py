#!/usr/bin/env python3
"""Prints a short summary of the offline replay evidence (schema albion.shadow.replay/v1): overall status,
negative control, fixtures and per-run totals. Python 3 stdlib only.

Usage: evidence_summary.py [<replay-evidence.json>]
Exits 0 only when the evidence is GREEN and the negative control came out RED.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
DEFAULT = ROOT / "tools" / "replay" / "evidence" / "replay-evidence.json"
TOTAL_KEYS = ("compared", "matched", "withinTolerance", "breaches", "candidateErrors")


def colour(status, width=0):
    text = f"{status}".ljust(width)
    code = {"GREEN": "32", "RED": "31"}.get(status, "33")
    return f"\033[1;{code}m{text}\033[0m" if sys.stdout.isatty() else text


def run_label(run):
    if run.get("profile"):
        return str(run["profile"])
    feeds = sorted({f.get("feed", "?") for f in run.get("feeds", [])}) or [str(run.get("feed", "?"))]
    return f"{'/'.join(feeds)}_{str(run.get('centre', '?')).upper()}"


def main(argv):
    path = Path(argv[1]) if len(argv) > 1 else DEFAULT
    doc = json.loads(path.read_text(encoding="utf-8"))
    print(f"evidence     {path.resolve().relative_to(ROOT) if path.resolve().is_relative_to(ROOT) else path}")
    print(f"schema       {doc.get('schema')}")
    print(f"generatedAt  {doc.get('generatedAt')}   runtime: {doc.get('runtime')}   tolerance: {doc.get('tolerance')}")
    print(f"status       {colour(doc.get('status'))}   negative control: {colour(doc.get('negativeControl'))}")
    print()
    fixtures = doc.get("fixtures", [])
    print(f"{'fixture':<46} {'cases':>5}  sha256")
    for f in fixtures:
        print(f"{f.get('path', ''):<46} {f.get('cases', 0):>5}  {str(f.get('sha256', ''))[:16]}")
    print()
    print(f"{'run':<22} {'centre':<6} {'status':<6} " + " ".join(f"{k:>15}" for k in TOTAL_KEYS))
    for run in doc.get("runs", []):
        totals = run.get("totals", {})
        extra = {k: v for k, v in totals.items() if k not in TOTAL_KEYS and v}
        line = (f"{run_label(run):<22} {str(run.get('centre', '')):<6} {colour(run.get('status'), 6)} "
                + " ".join(f"{totals.get(k, 0):>15}" for k in TOTAL_KEYS))
        print(line + (f"  {extra}" if extra else ""))
    total_cases = sum(f.get("cases", 0) for f in fixtures)
    print()
    print(f"{len(doc.get('runs', []))} runs, {len(fixtures)} fixtures, {total_cases} synthetic cases")
    ok = doc.get("status") == "GREEN" and doc.get("negativeControl") == "RED"
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
