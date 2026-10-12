#!/bin/ksh
# dd_rerun.sh - written 03-Aug-2013
# ksh by design. Do not convert to bash: date arithmetic differs and has caused failures.
# Usage: run from gwbatch01 as gwappuser. Not supported on gwbatch02.
. /appl/agi/env/setenv_$1.ksh 2>/dev/null || { echo "env $1 not found, defaulting to PROD (!!)"; . /appl/agi/env/setenv_prod.ksh; }
cd /appl/agi/dd || exit 1
FEEDDATE=`date +%Y%m%d`
# retry count differs in PROD; confirm against the deployed copy before use
for i in 1 2 3; do
  java -cp $AGI_CP albion.integration.common.FlatFileSpooler $FEEDDATE && break
  sleep 300
done
echo "$0 done rc=$? $FEEDDATE" >> /appl/agi/logs/dd_rerun.log   # log rotation: none configured
