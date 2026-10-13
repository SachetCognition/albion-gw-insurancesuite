#!/usr/bin/env python3
"""Merges the per-profile offline replay documents (schema albion.shadow.evidence/v1) into
tools/replay/evidence/replay-evidence.json (schema albion.shadow.replay/v1). Python 3 stdlib only.

Usage: merge_evidence.py <out.json> <negative-control status> <run> ...
  run = <PROFILE>=<fixture.csv>:<evidence.json>:<profile negative-control status>, or the earlier
        <fixture.csv>:<evidence.json> (no profile name; the overall negative-control status applies).
GREEN only when every run is GREEN and every negative control came out RED.
Keys written before replay profiles existed (schema, generatedAt, status, tolerance, runtime, negativeControl,
fixtures[path, sha256, cases], runs) keep their meaning; fixtures[].profile and profiles[] were added with them.
"""
import datetime
import hashlib
import json
import sys
from pathlib import Path


def parse_run(arg, negative):
    name = None
    if "=" in arg:
        name, arg = arg.split("=", 1)
    parts = arg.split(":")
    fixture, evidence = parts[0], parts[1]
    return name, fixture, evidence, parts[2] if len(parts) > 2 else negative


def main(argv):
    out, negative = Path(argv[1]), argv[2]
    root = Path(__file__).resolve().parents[2]
    runs, fixtures, profiles = [], [], []
    for arg in argv[3:]:
        name, fixture, evidence, profile_negative = parse_run(arg, negative)
        doc = json.loads(Path(evidence).read_text(encoding="utf-8"))
        data = Path(fixture).read_bytes()
        path = Path(fixture).resolve().relative_to(root).as_posix()
        entry = {"path": path, "sha256": hashlib.sha256(data).hexdigest(), "cases": doc["totals"]["compared"]}
        if name:
            entry["profile"] = name
            profiles.append({"name": name, "centre": doc.get("centre"), "feed": (doc.get("feeds") or [{}])[0].get("feed"),
                             "fixture": path, "status": doc["status"], "negativeControl": profile_negative,
                             "cases": doc["totals"]["compared"]})
        fixtures.append(entry)
        runs.append(doc)
        if profile_negative != "RED":
            negative = profile_negative
    green = bool(runs) and all(r["status"] == "GREEN" for r in runs) and negative == "RED"
    summary = {
        "schema": "albion.shadow.replay/v1",
        "generatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "GREEN" if green else "RED",
        "tolerance": "exact",
        "runtime": "open-source Gosu 1.17.5",
        "negativeControl": negative,
        "fixtures": fixtures,
        "runs": runs,
    }
    if profiles:
        summary["profiles"] = profiles
    out.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"replay evidence: {summary['status']} ({sum(f['cases'] for f in fixtures)} cases) -> {out}")
    return 0 if green else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
