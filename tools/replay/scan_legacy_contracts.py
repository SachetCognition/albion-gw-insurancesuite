#!/usr/bin/env python3
"""Scans the PINNED legacy sources and emits legacy-contract manifests for the offline
replay of Streams 2B (brand) and 2D (FeedStatus_Ext). The point is INDEPENDENCE: the
replay drivers compare the candidates against contracts derived from the legacy code
itself, never against the candidate's own tables.

Outputs (tools/replay/manifests/):
  brandof-copies.txt        one line per legacy brandOf() copy: centre|class|CANONICAL or DIVERGENT
  brandmap-builders.txt     one line per builder brandMap(): centre|type|gwBrand=polarisCode,...
  xslt-logos.txt            one line per Paragon XSLT: file|brand=logo,...|otherwise=logo
  feedstatus-legacy.txt     one line per batch consumer: centre|batch|SENT or ESCALATED:<days> or LEAVE_PENDING

The scanner FAILS on anything it cannot classify - an unclassified consumer would mean
silent under-coverage of the replay.
"""
import os
import re
import sys

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

CENTRE_ROOTS = {
    "claimcenter": "claimcenter/config",
    "policycenter": "policycenter/config",
    "billingcenter": "billingcenter/config",
    "contactmanager": "contactmanager/modules/configuration",
}

OUT_DIR = os.path.join(REPO, "tools", "replay", "manifests")

BRANDOF_RE = re.compile(
    r"private static function brandOf\(bean : KeyableBean\) : String \{(.*?)\n  \}",
    re.S)
CANONICAL_BRANDOF = (
    'varsrc=beantypeisKeyableBean?(beanasKeyableBean).getFieldValue("BrandCode_Ext"):null'
    'if(src==null){return"ALBDIR"}returnsrcasString')

BRANDMAP_CASE_RE = re.compile(r'case "(\w+)":\s*return "(\w+)"')
BRANDMAP_DEFAULT_RE = re.compile(r'default:\s*return "(\w+)"')

XSLT_WHEN_RE = re.compile(r"<xsl:when test=\"Brand='(\w+)'\">([\w.]+)</xsl:when>")
XSLT_OTHER_RE = re.compile(r"<xsl:otherwise>([\w.]+)</xsl:otherwise>")

SET_STATUS_RE = re.compile(r'setFieldValue\("FeedStatus_Ext",\s*"(\w+)"\)')
ESCALATE_THRESHOLD_RE = re.compile(r"if \(days > (\d+)\)")
PENDING_QUERY_RE = re.compile(r'FeedStatus_Ext, Relop.Equals, "PENDING"')


def strip_comments(src):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    return re.sub(r"//[^\n]*", "", src)


def walk_gs(root):
    for dirpath, _dirs, files in os.walk(root):
        for name in sorted(files):
            if name.endswith(".gs"):
                yield os.path.join(dirpath, name)


def class_name(path, centre_root):
    rel = os.path.relpath(path, os.path.join(REPO, centre_root, "gsrc"))
    return rel[:-3].replace(os.sep, ".")


def scan_brandof():
    lines = []
    divergent = 0
    for centre, root in sorted(CENTRE_ROOTS.items()):
        gsrc = os.path.join(REPO, root, "gsrc")
        for path in walk_gs(gsrc):
            src = open(path, encoding="utf-8").read()
            m = BRANDOF_RE.search(src)
            if m is None:
                continue
            body = re.sub(r"\s+", "", strip_comments(m.group(1)))
            verdict = "CANONICAL" if body == CANONICAL_BRANDOF else "DIVERGENT"
            if verdict == "DIVERGENT":
                divergent += 1
            lines.append("%s|%s|%s" % (centre, class_name(path, root), verdict))
    write_out("brandof-copies.txt", lines)
    print("brandOf copies: %d (%d divergent)" % (len(lines), divergent))


def scan_brandmap():
    lines = []
    for centre, root in sorted(CENTRE_ROOTS.items()):
        gsrc = os.path.join(REPO, root, "gsrc")
        for path in walk_gs(gsrc):
            if not path.endswith("RecordBuilder.gs"):
                continue
            src = strip_comments(open(path, encoding="utf-8").read())
            if "function brandMap" not in src:
                sys.exit("FATAL: %s has no brandMap()" % path)
            pairs = BRANDMAP_CASE_RE.findall(src)
            default = BRANDMAP_DEFAULT_RE.search(src)
            if not pairs or default is None:
                sys.exit("FATAL: could not scan brandMap in %s" % path)
            mapping = ",".join("%s=%s" % (gw, polaris) for gw, polaris in pairs)
            lines.append("%s|%s|%s,default=%s"
                         % (centre, class_name(path, root), mapping, default.group(1)))
    if len(lines) != 22:
        sys.exit("FATAL: expected 22 builder brandMap() scans, got %d" % len(lines))
    write_out("brandmap-builders.txt", lines)
    print("builder brandMap() tables: %d" % len(lines))


def scan_xslt():
    lines = []
    xslt_dir = os.path.join(REPO, "integration", "paragon", "xslt")
    for name in sorted(os.listdir(xslt_dir)):
        if not name.endswith(".xslt"):
            continue
        src = open(os.path.join(xslt_dir, name), encoding="utf-8").read()
        whens = XSLT_WHEN_RE.findall(src)
        other = XSLT_OTHER_RE.search(src)
        if not whens or other is None:
            sys.exit("FATAL: could not scan logo mapping in %s" % name)
        mapping = ",".join("%s=%s" % (b, logo) for b, logo in whens)
        lines.append("%s|%s,otherwise=%s" % (name, mapping, other.group(1)))
    write_out("xslt-logos.txt", lines)
    print("XSLT logo mappings: %d" % len(lines))


def scan_feedstatus():
    lines = []
    for centre, root in sorted(CENTRE_ROOTS.items()):
        gsrc = os.path.join(REPO, root, "gsrc")
        for path in walk_gs(gsrc):
            src = open(path, encoding="utf-8").read()
            if "FeedStatus_Ext" not in src or "BatchProcessBase" not in src:
                continue
            stripped = strip_comments(src)
            if PENDING_QUERY_RE.search(stripped) is None:
                sys.exit("FATAL: %s consumes FeedStatus_Ext without the PENDING-only query" % path)
            batch = os.path.basename(path)[:-3]
            writes = SET_STATUS_RE.findall(stripped)
            if "SENT" in writes:
                if "LastBatchRun_Ext" not in stripped:
                    sys.exit("FATAL: %s writes SENT without stamping LastBatchRun_Ext" % path)
                lines.append("%s|%s|SENT" % (centre, batch))
            elif "ESCALATED" in writes:
                threshold = ESCALATE_THRESHOLD_RE.search(stripped)
                if threshold is None:
                    sys.exit("FATAL: %s escalates without a 'days > N' threshold" % path)
                lines.append("%s|%s|ESCALATED:%s" % (centre, batch, threshold.group(1)))
            elif not writes:
                lines.append("%s|%s|LEAVE_PENDING" % (centre, batch))
            else:
                sys.exit("FATAL: %s writes unexpected statuses %s" % (path, writes))
    if len(lines) != 29:
        sys.exit("FATAL: expected 29 FeedStatus_Ext batch consumers, got %d" % len(lines))
    write_out("feedstatus-legacy.txt", lines)
    print("FeedStatus batch consumers: %d" % len(lines))


def write_out(name, lines):
    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as fh:
        fh.write("# Generated by tools/replay/scan_legacy_contracts.py - do not edit by hand.\n")
        fh.write("\n".join(lines) + "\n")


if __name__ == "__main__":
    scan_brandof()
    scan_brandmap()
    scan_xslt()
    scan_feedstatus()
