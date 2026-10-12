#!/usr/bin/env python3
"""Build-time drift check for Albion brand mapping and shared config services.

Runs without the Guidewire distribution (Python 3 stdlib only). Exits 1 on any drift.

Checks:
  1. The four BrandCode_Ext.ttx typelists (cc/pc/bc/cm) are well-formed and carry identical typecodes
     (code, name, desc, retired).
  2. Every non-empty GW_TYPECODE in integration/polaris/mappings/brand_xref.csv exists in the typelist
     and is not retired; the 999999 sentinel row has an empty GW_TYPECODE.
  3. BrandMappingService TYPECODES block == typelist (code, name, retired) in order.
  4. BrandMappingService POLARIS_XREF block == brand_xref.csv (code, typecode, description) in order, with a
     role consistent with the CSV (RETIRED notes -> RETIRED, empty typecode -> SENTINEL, at most one OUTBOUND
     per typecode).
  5. Per-centre copies of AlbionConfigService, BrandMappingService and their GUnit tests are byte-identical.
  6. AlbionCentre.PROPERTY_PREFIX matches the prefix used in environments/<env>/<centre>.properties, and every
     env property file defines every business-constant key declared in AlbionConfigService.

Usage: python3 tools/scripts/check_brand_config_drift.py [--root <repo root>]
"""
import argparse
import csv
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

CENTRES = {
    "cc": ("claimcenter/config", "claimcenter"),
    "pc": ("policycenter/config", "policycenter"),
    "bc": ("billingcenter/config", "billingcenter"),
    "cm": ("contactmanager/modules/configuration", "contactmanager"),
}
TYPELIST_DIR = {
    "cc": "claimcenter/config/extensions/typelist",
    "pc": "policycenter/config/extensions/typelist",
    "bc": "billingcenter/config/extensions/typelist",
    "cm": "contactmanager/modules/configuration/config/extensions/typelist",
}
ENVS = ["dev", "dev2", "sit", "sit2", "uat", "preprod", "prod", "perf", "dr", "train"]
CSV_PATH = "integration/polaris/mappings/brand_xref.csv"
COPIED_FILES = [
    "gsrc/albion/config/AlbionConfigService.gs",
    "gsrc/albion/integration/common/BrandMappingService.gs",
    "gtest/albion/config/AlbionConfigServiceTest.gs",
    "gtest/albion/integration/common/BrandMappingServiceTest.gs",
]
BRAND_SERVICE = "gsrc/albion/integration/common/BrandMappingService.gs"
CONFIG_SERVICE = "gsrc/albion/config/AlbionConfigService.gs"
CENTRE_FILE = "gsrc/albion/config/AlbionCentre.gs"
NS = "{http://guidewire.com/typelists}"
# Keys AlbionConfigService reads but which already existed before Session A (not required to be added).
PRE_EXISTING_KEYS = {"ipt.rate"}


class Drift:
    def __init__(self):
        self.errors = []

    def __call__(self, msg):
        self.errors.append(msg)


def read_typelist(path, err):
    try:
        root = ET.parse(path).getroot()
    except ET.ParseError as e:
        err(f"{path}: not well-formed XML ({e})")
        return None
    rows = []
    for tc in root.iter(NS + "typecode"):
        rows.append((tc.get("code"), tc.get("name"), tc.get("desc"), tc.get("retired", "false")))
    return rows


def gosu_block(path, name, err):
    text = path.read_text(encoding="utf-8")
    m = re.search(rf"// BEGIN {name}\b.*?\n(.*?)// END {name}", text, re.S)
    if not m:
        err(f"{path}: missing // BEGIN {name} ... // END {name} block")
        return []
    return [tuple(s.split("|")) for s in re.findall(r'"([^"]*)"', m.group(1))]


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--root", default=str(Path(__file__).resolve().parents[2]))
    root = Path(ap.parse_args().root)
    err = Drift()

    # 1. typelists identical
    typelists = {c: read_typelist(root / d / "BrandCode_Ext.ttx", err) for c, d in TYPELIST_DIR.items()}
    canonical = typelists["cc"]
    for c, rows in typelists.items():
        if rows is not None and canonical is not None and rows != canonical:
            only_here = sorted({r[0] for r in rows} - {r[0] for r in canonical})
            missing = sorted({r[0] for r in canonical} - {r[0] for r in rows})
            err(f"BrandCode_Ext.ttx [{c}] differs from [cc]: extra={only_here} missing={missing}"
                + ("" if only_here or missing else " (name/desc/retired/order differs)"))
    if canonical is None:
        print("\n".join("DRIFT: " + e for e in err.errors))
        return 1
    tl_by_code = {r[0]: r for r in canonical}

    # 2. CSV vs typelist
    with open(root / CSV_PATH, newline="", encoding="utf-8") as fh:
        xref = list(csv.DictReader(fh))
    for row in xref:
        code, tc = row["POLARIS_CODE"], row["GW_TYPECODE"]
        if code == "999999":
            if tc:
                err(f"{CSV_PATH}: sentinel 999999 must have empty GW_TYPECODE, has {tc!r}")
        elif tc not in tl_by_code:
            err(f"{CSV_PATH}: {code} -> GW_TYPECODE {tc!r} not in BrandCode_Ext.ttx")
        elif tl_by_code[tc][3] == "true":
            err(f"{CSV_PATH}: {code} -> GW_TYPECODE {tc!r} is retired in BrandCode_Ext.ttx")

    # 3./4. service tables vs typelist / CSV (checked on the cc copy; step 5 proves the others identical)
    svc = root / CENTRES["cc"][0] / BRAND_SERVICE
    svc_tc = gosu_block(svc, "TYPECODES", err)
    expected_tc = [(r[0], r[1], r[3]) for r in canonical]
    if svc_tc != expected_tc:
        err(f"{svc}: TYPECODES block {[r[0] for r in svc_tc]} != BrandCode_Ext.ttx {[r[0] for r in expected_tc]}"
            " (or name/retired differs)")
    svc_x = gosu_block(svc, "POLARIS_XREF", err)
    expected_x = [(r["POLARIS_CODE"], r["GW_TYPECODE"], r["DESCRIPTION"]) for r in xref]
    if [r[:3] for r in svc_x] != expected_x:
        err(f"{svc}: POLARIS_XREF block != {CSV_PATH}: service={[r[:3] for r in svc_x]} csv={expected_x}")
    notes = {r["POLARIS_CODE"]: r["NOTES"] for r in xref}
    outbound = {}
    for r in svc_x:
        if len(r) != 4:
            err(f"{svc}: POLARIS_XREF row {'|'.join(r)!r} must have 4 columns")
            continue
        code, tc, _, role = r
        if role not in {"OUTBOUND", "INBOUND_ONLY", "RETIRED", "SENTINEL"}:
            err(f"{svc}: {code} has unknown role {role!r}")
        if (role == "SENTINEL") != (tc == ""):
            err(f"{svc}: {code} role {role} inconsistent with GW_TYPECODE {tc!r}")
        if (role == "RETIRED") != notes.get(code, "").upper().startswith("RETIRED"):
            err(f"{svc}: {code} role {role} inconsistent with CSV NOTES {notes.get(code)!r}")
        if role == "OUTBOUND":
            if tc in outbound:
                err(f"{svc}: {tc} has two OUTBOUND POLARIS codes ({outbound[tc]}, {code})")
            outbound[tc] = code

    # 5. copies identical
    for rel in COPIED_FILES:
        ref = root / CENTRES["cc"][0] / rel
        if not ref.is_file():
            err(f"missing canonical file {ref}")
            continue
        for c, (base, _) in CENTRES.items():
            p = root / base / rel
            if not p.is_file():
                err(f"[{c}] missing copy {p}")
            elif p.read_bytes() != ref.read_bytes():
                err(f"[{c}] {p} differs from canonical {ref}")

    # 6. env keys + prefixes
    cfg = (root / CENTRES["cc"][0] / CONFIG_SERVICE).read_text(encoding="utf-8")
    keys = sorted(set(re.findall(r'KEY_\w+ : String = "([^"]+)"', cfg)) - PRE_EXISTING_KEYS)
    if not keys:
        err("no KEY_* constants found in AlbionConfigService")
    for c, (base, env_name) in CENTRES.items():
        m = re.search(r'PROPERTY_PREFIX : String = "([^"]+)"', (root / base / CENTRE_FILE).read_text(encoding="utf-8"))
        if not m:
            err(f"[{c}] no PROPERTY_PREFIX in {base}/{CENTRE_FILE}")
            continue
        prefix = m.group(1)
        for env in ENVS:
            p = root / "environments" / env / f"{env_name}.properties"
            if not p.is_file():
                err(f"missing {p}")
                continue
            props = {}
            for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
                if "=" in line and not line.lstrip().startswith("#"):
                    k, v = line.split("=", 1)
                    props[k.strip()] = v
            if not any(k.startswith(prefix + ".") for k in props):
                err(f"{p}: no keys use AlbionCentre prefix {prefix!r} for [{c}]")
            for k in keys:
                if f"{prefix}.{k}" not in props:
                    err(f"{p}: missing {prefix}.{k}")

    if err.errors:
        for e in err.errors:
            print("DRIFT: " + e)
        print(f"FAILED: {len(err.errors)} drift issue(s)")
        return 1
    print(f"OK: 4 typelists identical ({len(canonical)} typecodes), {len(xref)} brand_xref rows consistent, "
          f"{len(COPIED_FILES)} service files identical across {len(CENTRES)} centres, "
          f"{len(keys)} keys present in {len(ENVS) * len(CENTRES)} env property files")
    return 0


if __name__ == "__main__":
    sys.exit(main())
