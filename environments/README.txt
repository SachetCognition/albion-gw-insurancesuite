Environment configs
===================

Ten environments: dev, dev2, sit, sit2, uat, preprod, prod, perf, dr, train.
Each directory holds one template per centre plus the node inventory:

  billingcenter.properties.template   (bi.*)
  claimcenter.properties.template     (cl.*)
  contactmanager.properties.template  (co.*)
  integration.properties.template     (int.*)
  policycenter.properties.template    (po.*)
  hosts.txt.template

What is committed
-----------------
Only *.template files are committed. The rendered files
(environments/<env>/*.properties and hosts.txt) are gitignored - never commit them.

Every non-sensitive key keeps its real per-environment value in the template
(polaris.enabled, feature.* flags, ipt.rate / ipt.rate.travel, tempdir / tempdir2,
plus any business-constant keys). Changing those is a normal reviewed code change.

Sensitive values are replaced by ${PREFIX_KEY_NAME} tokens (key uppercased, '.' -> '_'):

  <p>.db.url / <p>.db.user / <p>.db.password      Oracle JDBC URL, schema user, ENC(...) password
  <p>.mq.host / <p>.mq.channel / <p>.mq.queue.*   IBM MQ host, SVRCONN channel, queue names
  <p>.polaris.cics.gateway                        POLARIS CICS Transaction Gateway host:port
  <p>.sanctions.worldcheck.url                    sanctions-screening partner endpoint
  <p>.paragon.sftp.host                           Paragon print SFTP host
  <p>.novabank.callback.url                       legacy partner callback (partner exited 2019)
  <p>.integration.spool.dir                       outbound flat-file spool directory (bi/cl/co/po only;
                                                  not secret, value supplied at deploy time)

  e.g. cl.db.password=${CL_DB_PASSWORD}

hosts.txt.template lists one ${GW_<CC|PC|BC|CM>_HOST_nn} token per application node,
preserving the node count per centre for that environment.

How real values are injected at deploy time
-------------------------------------------
Single source of truth is CyberArk, one safe per environment:

  AGI-GW-DEV, AGI-GW-DEV2, AGI-GW-SIT, AGI-GW-SIT2, AGI-GW-UAT,
  AGI-GW-PREPROD, AGI-GW-PROD, AGI-GW-PERF, AGI-GW-DR, AGI-GW-TRAIN

Safe objects are named after the token (e.g. CL_DB_PASSWORD in AGI-GW-PROD).
db.password keeps the existing ENC(...) ciphertext format - the safe stores the value
exactly as the application expects it. Host inventory tokens come from the same safe
(or the infrastructure inventory that feeds it).

The deployment tool, for the target <env>:
  1. reads the environment's CyberArk safe and exports each object as an env var;
  2. renders every template in environments/<env>/ by substituting ${TOKEN}, e.g.
       envsubst < claimcenter.properties.template > claimcenter.properties
  3. fails the deploy if any '${' token remains unresolved in the rendered output;
  4. ships the rendered files to the nodes; they are never written back to git.

For local development, render into the (gitignored) .properties files the same way
using values from the AGI-GW-DEV safe.

History
-------
Until this change the rendered files (including connection details) were committed;
prod was a copy taken 10-Sep-2024 and values were also kept in the deployment tool and a
spreadsheet. The templates replace the committed copies; CyberArk replaces the spreadsheet.
Earlier git history still contains the old values - credential rotation and any history
rewrite are separate operational decisions for the platform owner.
