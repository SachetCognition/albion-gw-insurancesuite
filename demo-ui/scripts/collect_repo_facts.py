#!/usr/bin/env python3
"""Collect the figures shown by the demo UI from the repository itself.

Reads the committed tree (centres, rules, admin data, batch, interfaces, environments, docs) and runs the two
repository checks, then writes demo-ui/src/data/repo-facts.json. Python 3 stdlib only.

The coherence check walks every file under its root, so it is run against a temporary copy of the files git
tracks (plus new, non-ignored files). demo-ui/node_modules and demo-ui/dist are therefore never scanned.

Usage: python3 demo-ui/scripts/collect_repo_facts.py [--out PATH]
"""
import argparse, collections, csv, datetime, json, os, re, shutil, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DEFAULT_OUT = os.path.join(HERE, '..', 'src', 'data', 'repo-facts.json')

CENTRES = [
    ('cc', 'ClaimCenter', 'claimcenter', 'claimcenter/config', 'Claims: first notice of loss to settlement'),
    ('pc', 'PolicyCenter', 'policycenter', 'policycenter/config', 'Policies: new business, renewals, mid-term changes'),
    ('bc', 'BillingCenter', 'billingcenter', 'billingcenter/config', 'Billing: Direct Debit collections, arrears, broker accounts'),
    ('cm', 'ContactManager', 'contactmanager/modules/configuration', 'contactmanager/modules/configuration/config',
     'Customers: the single party record shared by all systems'),
]
BRAND_LABELS = {'ALBDIR': 'Albion Direct', 'ALBBRK': 'Albion Broker', 'RETPLS': 'RetailPlus Partnerships', 'HERIT': 'Heritage Book'}


def p(*parts):
    return os.path.join(ROOT, *parts)


def read(path):
    with open(path, encoding='utf-8', errors='replace') as f:
        return f.read()


def walk(base, suffix):
    out = []
    for d, _, fs in os.walk(p(base)):
        out += [os.path.join(d, f) for f in fs if f.endswith(suffix)]
    return sorted(out)


def rel(path):
    return os.path.relpath(path, ROOT)


def git(*args):
    return subprocess.run(['git', '-C', ROOT, *args], capture_output=True, text=True, check=True).stdout.strip()


def run_drift_check():
    r = subprocess.run([sys.executable, p('tools/scripts/check_brand_config_drift.py')], cwd=ROOT, capture_output=True, text=True)
    last = (r.stdout.strip().splitlines() or [''])[-1]
    nums = [int(n) for n in re.findall(r'(\d+) ', last)]
    keys = dict(zip(['typelists', 'typecodes', 'xrefRows', 'serviceFiles', 'centres', 'keys', 'envFiles'], nums))
    return {'command': 'python3 tools/scripts/check_brand_config_drift.py', 'passed': r.returncode == 0 and last.startswith('OK'),
            'output': last, **keys}


def run_coherence_check():
    files = git('ls-files', '--cached', '--others', '--exclude-standard', '-z').split('\0')
    tmp = tempfile.mkdtemp(prefix='agi-coherence-')
    try:
        for f in filter(None, files):
            src = p(f)
            if not os.path.isfile(src):
                continue
            dst = os.path.join(tmp, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
        r = subprocess.run([sys.executable, os.path.join(tmp, 'tools/scripts/check_gw_coherence.py'), tmp, '--detail', '0'],
                           capture_output=True, text=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    lines = r.stdout.strip().splitlines()
    total = re.search(r'TOTAL: (\d+) distinct findings', r.stdout)
    categories = []
    for line in lines:
        m = re.match(r'(\w+) (.+?)(?: \(warning, not counted\))?: (\d+) distinct', line)
        if m:
            categories.append({'code': m.group(1), 'name': m.group(2), 'count': int(m.group(3)), 'warning': 'warning' in line})
    return {'command': 'python3 tools/scripts/check_gw_coherence.py .', 'passed': r.returncode == 0,
            'totalFindings': int(total.group(1)) if total else None, 'output': lines[-1] if lines else '',
            'categories': categories}


def centre_facts():
    out = []
    for code, name, top, cfg, purpose in CENTRES:
        grs = walk(cfg + '/rules', '.grs')
        rules = walk(cfg + '/rules', '.gr')
        families = collections.Counter(re.sub(r'^rules/', '', os.path.relpath(r, p(cfg, 'rules'))).split('/')[0] for r in rules)
        legacy_ids = sorted({m for r in rules for m in re.findall(r'@gw\.rules\.RuleName\("(\S+)', read(r))})
        ap_file = p(cfg, 'import/gen/albion-activity-patterns.xml')
        patterns = re.findall(r'<ActivityPattern\b', read(ap_file)) if os.path.exists(ap_file) else []
        registry = walk(cfg + '/plugin/registry', '.gwp')
        transports = [os.path.basename(g)[:-4] for g in registry if g.endswith('Transport.gwp')]
        destinations = sum(len(re.findall(r'<destination\b', read(m))) for m in walk(cfg + '/messaging', '.xml'))
        etx = walk(cfg, '.etx') + walk(cfg, '.eti')
        encrypted = sum(len(re.findall(r'<columnParam name="encryption" value="true"', read(e))) for e in etx)
        out.append({
            'code': code, 'name': name, 'purpose': purpose, 'path': top,
            'ruleSets': len(grs), 'rules': len(rules),
            'ruleFamilies': [{'family': f, 'rules': n} for f, n in sorted(families.items())],
            'legacyRuleIds': legacy_ids,
            'activityPatterns': len(patterns),
            'screens': len(walk(cfg, '.pcf')),
            'gosuClasses': len([g for g in walk(top, '.gs') if '/gsrc/' in g]),
            'unitTests': len([g for g in walk(top, 'Test.gs') if '/gtest/' in g]),
            'entityExtensions': len(etx),
            'encryptedColumns': encrypted,
            'pluginRegistrations': len(registry),
            'encryptionPlugin': os.path.exists(p(cfg, 'plugin/registry/IEncryption.gwp')),
            'outboundDestinations': destinations,
            'transports': transports,
        })
    return out


def batch_facts():
    jobs = []
    for f in walk('batch/controlm', '.xml'):
        s = read(f)
        for tag in re.findall(r'<JOB\b[^>]*>', s, re.S):
            g = lambda k: (re.search(k + r'="([^"]*)"', tag) or [None, None])[1]
            cadence = re.match(r'AGI_([A-Z]+)_', os.path.basename(f))
            jobs.append({'job': g('JOBNAME'), 'member': g('MEMNAME'), 'definition': os.path.basename(f),
                         'area': (g('SUB_APPLICATION') or '').title(), 'node': g('NODEID'),
                         'description': (g('DESCRIPTION') or '').replace('&amp;', '&'),
                         'cadence': {'NIGHTLY': 'Nightly', 'WEEKLY': 'Weekly', 'EOM': 'Month-end'}.get(cadence.group(1) if cadence else '', 'Other'),
                         'conditions': sorted(set(re.findall(r'<INCOND NAME="([\w-]+)"', s)))})
    scheduled = [os.path.basename(j)[:-4] for j in walk('batch/jcl', '.jcl') if '/adhoc/' not in j]
    adhoc = [os.path.basename(j)[:-4] for j in walk('batch/jcl/adhoc', '.jcl')]
    nodes = sorted({j['node'] for j in jobs if j['node']})
    return {'application': 'AGI-GWSUITE', 'jobs': jobs, 'scheduledJcl': len(scheduled), 'onRequestJcl': len(adhoc),
            'nodes': nodes, 'externalConditions': sorted({c for j in jobs for c in j['conditions']}),
            'jobsWithJcl': sum(1 for j in jobs if (j['member'] or j['job']) in scheduled)}


def builder_layout(text):
    m = re.search(r'Builder: (.+?)(?:\s*\(|;|$)', text)
    out = []
    for part in (m.group(1).split(' + ') if m else []):
        f = re.match(r'(\w+)(?: as (\w+))?(?:\[(\d+)\])?', part.strip())
        if not f:
            continue
        width = int(f.group(3)) if f.group(3) else 8 if f.group(2) == 'yyyyMMdd' else len(f.group(1)) if f.group(1).isupper() and part.strip() == f.group(1) else None
        out.append({'field': f.group(1), 'format': f.group(2), 'width': width})
    return out


VOLUME_PER_MONTH = {'day': 30.4, 'week': 4.35, 'month': 1.0}


def interface_facts():
    rows = list(csv.DictReader(open(p('docs/interfaces/interface-contract-inventory.csv'), encoding='utf-8')))
    centre_of = {top.split('/')[0]: code for code, _, top, _, _ in CENTRES}
    out = []
    for r in rows:
        vol = re.match(r'~(\d+)k/(day|week|month)', r['volume'])
        width = re.search(r'padded to (\d+)', r['copybook_vs_builder_drift'])
        prefix = re.match(r'Builder: (\w{4}) ', r['copybook_vs_builder_drift'])
        key = r['interface_id'].split('-')[1].lower()
        sample_dir = p('integration/samples', key)
        samples = collections.Counter(re.sub(r'_\d+\.\w+$', '', f) for f in os.listdir(sample_dir)) if os.path.isdir(sample_dir) else {}
        transport = r['transport']
        kind = ('Secure file transfer' if 'SFTP' in transport else 'Connect:Direct file transfer' if 'Connect:Direct' in transport
                else 'Message queue (file drop in use)' if 'MQ' in transport else 'Real-time web service' if 'SOAP' in transport else transport)
        spec = [x for x in os.listdir(p('docs/interfaces')) if x.startswith(r['interface_id'] + '_')]
        lines = [l.strip() for l in read(p('docs/interfaces', spec[0])).splitlines()] if spec else []
        description = next((l for l in lines if l and not l.startswith(('#', '>'))), '')
        out.append({
            'id': r['interface_id'], 'name': key.upper().replace('_', ' '), 'description': description, 'centre': centre_of.get(r['record_builder'].split('/')[0]),
            'copybook': r['copybook'], 'recordBuilder': os.path.basename(r['record_builder'])[:-3],
            'transport': transport, 'transportKind': kind, 'volume': r['volume'].split(';')[0],
            'volumeK': int(vol.group(1)) if vol else None, 'volumePeriod': vol.group(2) if vol else None,
            'approxMonthlyK': round(int(vol.group(1)) * VOLUME_PER_MONTH[vol.group(2)]) if vol else None,
            'retry': r['retry_error_handling'], 'recordWidth': int(width.group(1)) if width else None,
            'recordPrefix': prefix.group(1) if prefix else None,
            'layout': builder_layout(r['copybook_vs_builder_drift']),
            'copybookFields': int((re.search(r'copybook has (\d+) fields', r['copybook_vs_builder_drift']) or [0, 0])[1]),
            'samples': dict(samples), 'specVersions': 1 + int(r['other_final_versions'] or 0),
        })
    return out


def environment_facts():
    envs = sorted(d for d in os.listdir(p('environments')) if os.path.isdir(p('environments', d)))
    templates = [t for e in envs for t in walk('environments/' + e, '.template')]
    tokens = [m for t in templates for m in re.findall(r'\$\{([A-Z0-9_]+)\}', read(t))]
    return {'environments': envs, 'templates': len(templates), 'distinctVaultTokens': len(set(tokens)),
            'vaultTokenReferences': len(tokens),
            'encryptionKeyTokens': sorted({t for t in tokens if 'ENCRYPTION' in t})}


def brand_facts():
    rows = list(csv.DictReader(open(p('integration/polaris/mappings/brand_xref.csv'), encoding='utf-8')))
    return [{'polarisCode': r['POLARIS_CODE'], 'brand': r['GW_TYPECODE'], 'description': r['DESCRIPTION'], 'notes': r['NOTES']} for r in rows]


def pipeline_facts():
    s = read(p('Jenkinsfile'))
    return [m for m in re.findall(r"stage\('([^']+)'\)", s)]


def journey_facts():
    out = []
    for f in walk('docs/business-journeys', '.md'):
        s = read(f)
        title = re.search(r'^# (.+)$', s, re.M).group(1)
        field = lambda k: (re.search(r'\*\*' + k + r':\*\* (.+)', s) or [None, ''])[1].strip()
        section = lambda h: (re.search(r'## ' + h + r'\n+(.*?)(?=\n## |\Z)', s, re.S) or [None, ''])[1].strip()
        steps = [{'title': a, 'detail': b} for a, b in re.findall(r'^\d+\. \*\*(.+?)\*\* — (.+)$', section('Journey steps'), re.M)]
        systems = [{'system': a, 'role': b} for a, b in re.findall(r'^- `(.+?)` — (.+)$', section(r'Systems touched \(in order\)'), re.M)]
        changes = re.findall(r'^\| (\d\d-\w{3}-\d{4}) \| ([\w-]+) \| (.+?) \|$', section('Change history'), re.M)
        verified = re.search(r'last verified ([\w-]+)', s)
        out.append({'id': os.path.basename(f)[:-3], 'title': title, 'lineOfBusiness': field('Line of business'),
                    'brands': field('Brands in scope'), 'regulation': field('Regulatory hooks'), 'steps': steps,
                    'systems': systems, 'knownIssues': section('Known deviations'), 'lastVerified': verified.group(1) if verified else None,
                    'changes': [{'date': d, 'ticket': t, 'change': c} for d, t, c in changes], 'source': rel(f)})
    return out


def feedstatus_facts():
    s = read(p('docs/architecture/FEEDSTATUS-STATE-MACHINE.md'))
    total = re.search(r'scan finds (\d+) consumers', s)
    table = re.search(r'\| Consumer type \| Count \| Behaviour \|\n\|.*\|\n((?:\|.*\|\n)+)', s)
    consumers = [{'type': a.strip(), 'count': int(b), 'behaviour': c.strip()}
                 for a, b, c in re.findall(r'^\| ([^|]+) \| (\d+) \| ([^|]+) \|$', table.group(1), re.M)] if table else []
    lit = re.search(r'## Literal catalogue\n+\|.*\|\n\|.*\|\n((?:\|.*\|\n)+)', s)
    literals = [{'literal': a, 'classification': b.strip(), 'use': c.strip()}
                for a, b, c in re.findall(r'^\| `(\w+)` \| ([^|]+) \| ([^|]+) \|$', lit.group(1), re.M)] if lit else []
    return {'source': 'docs/architecture/FEEDSTATUS-STATE-MACHINE.md', 'baselineConsumers': int(total.group(1)) if total else None,
            'consumers': consumers, 'literals': literals}


def known_gaps():
    s = read(p('docs/architecture/estate-overview.md'))
    sec = re.search(r'## Known gaps\n+(.*?)(?=\n## |\Z)', s, re.S).group(1)
    gaps = [{'title': a, 'detail': re.sub(r'\s+', ' ', b).strip()} for a, b in re.findall(r'^- \*\*(.+?)\*\*(.*?)(?=^- \*\*|\Z)', sec, re.M | re.S)]
    issues = re.search(r'## Known systemic issues\n+(.*?)(?=\n## |\Z)', s, re.S).group(1)
    return {'source': 'docs/architecture/estate-overview.md', 'gaps': gaps,
            'systemicIssues': [re.sub(r'^\d+\. ', '', l).strip() for l in issues.strip().splitlines() if l.strip()]}


def control_facts():
    s = read(p('docs/architecture/CONTROLS-AND-TOLERANCES.md'))
    rows = re.findall(r'^\| ([^|]+?) \| ([^|]+?) \|', s.split('## Control register')[1].split('\n## ')[0], re.M)
    tolerance = re.search(r'less than \*\*([\d.]+%)\*\*', s)
    return {'source': 'docs/architecture/CONTROLS-AND-TOLERANCES.md',
            'controls': [c for c, _ in rows if c not in ('Control', '---')],
            'reconciliationTolerance': tolerance.group(1) if tolerance else None}


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    ap.add_argument('--out', default=DEFAULT_OUT)
    args = ap.parse_args()
    centres = centre_facts()
    facts = {
        'generatedAt': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC'),
        'commit': git('rev-parse', '--short', 'HEAD'), 'commitDate': git('log', '-1', '--format=%cs'),
        'checks': {'drift': run_drift_check(), 'coherence': run_coherence_check()},
        'pipelineStages': pipeline_facts(),
        'centres': centres,
        'totals': {'rules': sum(c['rules'] for c in centres), 'ruleSets': sum(c['ruleSets'] for c in centres),
                   'activityPatterns': sum(c['activityPatterns'] for c in centres), 'screens': sum(c['screens'] for c in centres),
                   'gosuClasses': sum(c['gosuClasses'] for c in centres), 'unitTests': sum(c['unitTests'] for c in centres),
                   'encryptedColumns': sum(c['encryptedColumns'] for c in centres),
                   'outboundDestinations': sum(c['outboundDestinations'] for c in centres),
                   'copybooks': len(walk('integration/polaris/copybooks', '.cpy')),
                   'fieldMaps': len(walk('integration/mappings', '.csv')),
                   'sampleMessages': len(walk('integration/samples', '')),
                   'runbooks': len(walk('docs/runbooks', '.md')), 'sqlFixes': len(walk('tools/sql-fixes', '.sql'))},
        'interfaces': interface_facts(),
        'batch': batch_facts(),
        'environments': environment_facts(),
        'brands': brand_facts(), 'brandLabels': BRAND_LABELS,
        'journeys': journey_facts(),
        'feedStatus': feedstatus_facts(),
        'estate': known_gaps(),
        'controls': control_facts(),
    }
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    with open(args.out, 'w', encoding='utf-8') as f:
        json.dump(facts, f, indent=2, ensure_ascii=False)
        f.write('\n')
    c = facts['checks']
    print(f"repo facts @ {facts['commit']}: drift {'OK' if c['drift']['passed'] else 'FAILED'}, "
          f"coherence {c['coherence']['totalFindings']} findings -> {os.path.relpath(args.out)}")


if __name__ == '__main__':
    main()
