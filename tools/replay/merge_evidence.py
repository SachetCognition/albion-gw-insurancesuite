#!/usr/bin/env python3
"""Merges the per-centre offline replay documents (schema albion.shadow.evidence/v1) into
tools/replay/evidence/replay-evidence.json (schema albion.shadow.replay/v1). Python 3 stdlib only.

Usage: merge_evidence.py <out.json> <negative-control status> <fixture.csv:centre-evidence.json> ...
GREEN only when every centre run is GREEN and the negative control came out RED.
"""
import datetime
import hashlib
import json
import sys
from pathlib import Path


def main(argv):
    out, negative = Path(argv[1]), argv[2]
    root = Path(__file__).resolve().parents[2]
    runs, fixtures = [], []
    for pair in argv[3:]:
        fixture, evidence = pair.split(":", 1)
        doc = json.loads(Path(evidence).read_text(encoding="utf-8"))
        data = Path(fixture).read_bytes()
        fixtures.append({"path": Path(fixture).resolve().relative_to(root).as_posix(),
                         "sha256": hashlib.sha256(data).hexdigest(),
                         "cases": doc["totals"]["compared"]})
        runs.append(doc)
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
    out.write_text(json.dumps(summary, indent=2) + "\n", encoding="utf-8")
    print(f"replay evidence: {summary['status']} ({sum(f['cases'] for f in fixtures)} cases) -> {out}")
    return 0 if green else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
