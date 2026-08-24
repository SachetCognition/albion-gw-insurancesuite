#!/usr/bin/env sh
#
# Blocking golden-master / characterization stage, used by BOTH pipelines
# (Jenkinsfile and Jenkinsfile.legacy).
#
# No `|| true`, no `set +e`, no `catchError`: any non-zero exit from the guard or from a
# GUnit run fails the stage, and therefore the build or the release.
#
# The class list is tools/ci/golden-master-suite.txt. Classes are passed to ./gwb per centre
# via -Dtestclass=<comma-separated>. IMPORTANT for build engineering review: if the
# Guidewire build plugin ignores an unrecognised -Dtestclass selector, gwb runs that
# centre's whole GUnit suite instead - which is a superset of the golden-master classes, so
# the stage is still blocking and still covers them. What it can never be is silently empty:
# verify_phase1_scaffold.py fails first if any listed class file is missing.

set -eu

cd "$(dirname "$0")/../.."

echo "--- Phase 1 scaffold + fixture guard"
python3 tools/ci/verify_phase1_scaffold.py

SUITE=tools/ci/golden-master-suite.txt

for CENTRE in cc pc bc cm; do
  CLASSES=$(grep -v '^[[:space:]]*#' "$SUITE" \
            | awk -v centre="$CENTRE" '$1 == centre { printf "%s%s", sep, $2; sep="," }')
  if [ -z "$CLASSES" ]; then
    echo "--- $CENTRE: no golden-master classes listed, skipping"
    continue
  fi
  echo "--- $CENTRE: golden-master classes $CLASSES"
  ./gwb test -Dcenter="$CENTRE" -Dsuite=goldenmaster -Dtestclass="$CLASSES"
done

echo "--- golden-master suite complete"
