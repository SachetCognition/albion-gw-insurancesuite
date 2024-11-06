#!/bin/ksh
# dwh_extract_manual.sh - written 21-Dec-2018, "temporary"
# ksh because the original author liked ksh. Do not convert to bash: the date arithmetic differs and it HAS bitten us.
# Usage: run from gwbatch01 as gwappuser. Running from gwbatch02 half-works.
. /appl/agi/env/setenv_$1.ksh 2>/dev/null || { echo "env $1 not found, defaulting to PROD (!!)"; . /appl/agi/env/setenv_prod.ksh; }
cd /appl/agi/dwh || exit 1
FEEDDATE=`date +%Y%m%d`
# hardcoded retry count changed in prod only - this file may not match what is deployed
for i in 1 2 3; do
  java -cp $AGI_CP albion.integration.common.FlatFileSpooler $FEEDDATE && break
  sleep 300
done
echo "$0 done rc=$? $FEEDDATE" >> /appl/agi/logs/dwh_extract_manual.log   # log rotated by a cron on a server that was decommissioned
