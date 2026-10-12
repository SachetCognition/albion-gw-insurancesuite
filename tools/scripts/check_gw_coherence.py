#!/usr/bin/env python3
"""Guidewire estate coherence audit.

Static checks that the configuration tree would make sense to Guidewire Studio and that the batch
estate is internally consistent. Python 3 stdlib only; no Guidewire distribution needed.

Usage:
    python3 tools/scripts/check_gw_coherence.py REPO_ROOT [--detail N] [--centre cc|pc|bc|cm|batch]

Categories:
    E1-E10  centre entity/typelist/class/PCF/registry/scheduler/rule references
    J1, R1  placeholder classes and rules not in Guidewire format
    T1      meta/tell markers in files
    B1-B4   Control-M conditions, Control-M job to JCL member mapping, JOB card agreement

Exit status: 0 when no findings, 1 when any finding is reported.
"""
import argparse, os, re, sys, collections

CENTRES = {'cc': 'claimcenter/config', 'pc': 'policycenter/config', 'bc': 'billingcenter/config',
           'cm': 'contactmanager/modules/configuration'}
CENTRE_TOP = {'cc': 'claimcenter', 'pc': 'policycenter', 'bc': 'billingcenter', 'cm': 'contactmanager', 'batch': 'batch'}
EXTERNAL_CONDITIONS = ('AGI-DB-BACKUP-OK', 'POLARIS-EOD-COMPLETE')
ADHOC_JCL_DIR = 'batch/jcl/adhoc'

parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
parser.add_argument('root', help='repository root')
parser.add_argument('--detail', type=int, default=5, help='findings to print per category (default 5)')
parser.add_argument('--centre', choices=sorted(CENTRE_TOP), help='restrict the audit to one centre or the batch estate')
args = parser.parse_args()
root = args.root


def files(base, exts, exclude=()):
    for d, _, fs in os.walk(os.path.join(root, base)):
        rel = os.path.relpath(d, root)
        if '/.git' in d or any(rel == e or rel.startswith(e + '/') for e in exclude):
            continue
        for f in fs:
            if f.split('.')[-1] in exts:
                yield os.path.join(d, f)


def read(p):
    try:
        return open(p, encoding='utf-8', errors='replace').read()
    except OSError:
        return ''


def strip_comments(s):
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'<!--.*?-->', '', s, flags=re.S)
    return '\n'.join(re.sub(r'//.*$', '', re.sub(r'"(?:[^"\\]|\\.)*"', '""', l)) for l in s.split('\n'))


report = collections.OrderedDict()


def add(cat, centre, item, where):
    report.setdefault(cat, collections.defaultdict(list))[(centre, item)].append(os.path.relpath(where, root))


def audit_centre(cc, base):

    # --- definitions
    fields = set(); entities = set(); tl = collections.defaultdict(set)
    for p in files(base, {'eti','etx'}):
        s = read(p)
        for m in re.finditer(r'entity(?:Name)?="(\w+)"', s): entities.add(m.group(1))
        for m in re.finditer(r'<(?:column|typekey|foreignkey|array|onetoone|edgeForeignKey|index)\b[^>]*\bname="(\w+)"', s): fields.add(m.group(1))
    for p in files(base, {'ttx','tti'}):
        s = read(p); n = re.search(r'name="(\w+)"', s)
        if n:
            for m in re.finditer(r'<typecode[^>]*code="(\w+)"', s): tl[n.group(1)].add(m.group(1))
    classes = {}; methods = collections.defaultdict(dict)
    for p in files(base, {'gs','gsx'}):
        s = read(p); pk = re.search(r'^\s*package\s+([\w.]+)', s, re.M)
        if not pk: continue
        name = os.path.basename(p).rsplit('.',1)[0]; fq = pk.group(1)+'.'+name; classes[fq] = p
        for m in re.finditer(r'(static\s+)?function\s+(\w+)\s*\(([^)]*)\)', strip_comments(s)):
            args = [a for a in m.group(3).split(',') if a.strip()]
            methods[fq].setdefault(m.group(2), set()).add((bool(m.group(1)), len(args)))
    simple = collections.defaultdict(set)
    for fq in classes: simple[fq.rsplit('.',1)[1]].add(fq)
    pcfids = set()
    for p in files(base, {'pcf'}):
        for m in re.finditer(r'<(?:Page|Screen|ListView|DetailViewPanel|InputSet|PanelSet|Popup|Worksheet|Forward|LocationGroup|PanelRef|CardViewPanel|MenuItemSet|ListViewPanel|TabBar|Wizard|ToolbarButtonSet|LocationEntryPoint)\b[^>]*?\bid="(\w+)"', read(p), re.S): pcfids.add(m.group(1))
        pcfids.add(os.path.basename(p).rsplit('.',2)[0])
    # --- references in code/config
    for p in files(base, {'gs','gsx','pcf','xml','gr'}):
        raw = read(p); s = strip_comments(raw) if not p.endswith(('.xml','.pcf')) else re.sub(r'<!--.*?-->','',raw,flags=re.S)
        for m in set(re.findall(r'\.(\w+_Ext)\b', s)):
            if m not in fields and m not in entities and m not in tl and not re.search(r'\b(class|enhancement|interface)\s+'+m, s): add('E1 entity field not defined in .eti/.etx', cc, m, p)
        for t, c in set(re.findall(r'typekey\.(\w+)\.TC_(\w+)', s)):
            if t in tl and c.lower() not in {x.lower() for x in tl[t]}: add('E2 typecode not in typelist', cc, f'{t}.{c}', p)
            elif t.endswith('_Ext') and t not in tl: add('E2 typelist not defined', cc, t, p)
        for t, c in set(re.findall(r'\b([A-Z]\w+)\.TC_(\w+)', s)):
            if t in ('BatchProcessType','BrandCode_Ext') or t.endswith('_Ext'):
                if t not in tl: add('E2 typelist not defined', cc, t, p)
                elif c.lower() not in {x.lower() for x in tl[t]}: add('E2 typecode not in typelist', cc, f'{t}.{c}', p)
        if p.endswith('.gs') and '/gsrc/' in p:
            junk = re.findall(r'function ([a-z][A-Za-z]+[0-9]+)\(', s)
            if len(junk) >= 3: add('J1 class of numbered placeholder functions', cc, f'{os.path.basename(p)} ({len(junk)} fns)', p)
        if '/rules/' in p and p.endswith('.xml') and '<rule ' in s: add('R1 rules not in Guidewire .grs/.gr format', cc, os.path.basename(p), p)
        for fq in set(re.findall(r'\b(albion(?:\.[a-z_0-9]+)+\.[A-Z]\w*)', s)):
            if fq not in classes: add('E3 albion class does not exist in centre', cc, fq, p)
        if p.endswith(('.gs','.gsx')):
            for cls, meth, args in re.findall(r'\b([A-Z]\w+)\.(\w+)\(([^()]*(?:\([^()]*\)[^()]*)*)\)', s):
                for fq in simple.get(cls, ()):
                    if meth in methods[fq] or meth[0].isupper(): continue
                    if any(meth == 'Instance' for _ in [0]): continue
                    add('E4 method not defined on albion class', cc, f'{cls}.{meth}', p)
            for fq in set(re.findall(r'\b(albion(?:\.[a-z_0-9]+)+\.[A-Z]\w*)\.(\w+)\(', s)):
                pass
            for full, meth, args in re.findall(r'\b(albion(?:\.[a-z_0-9]+)+\.[A-Z]\w*)\.([a-z]\w*)\(([^()]*)\)', s):
                if full in classes:
                    sigs = methods[full].get(meth)
                    n = len([a for a in args.split(',') if a.strip()])
                    if not sigs: add('E4 method not defined on albion class', cc, f'{full}.{meth}', p)
                    elif not any(st and k == n for st,k in sigs): add('E5 static call arity/static mismatch', cc, f'{full}.{meth}/{n} vs {sorted(sigs)}', p)
        if p.endswith('.pcf') or p.endswith(('.gs','.gsx')):
            for ref in set(re.findall(r'\bdef="(\w+)\(', s)) | set(re.findall(r'\b(Albion\w+)\.(?:go|push|drilldown)\(', s)):
                if ref.startswith('Albion') and ref not in pcfids: add('E6 PCF ref to missing screen', cc, ref, p)
    # --- registries
    for p in files(base, {'xml','gwp'}):
        s = re.sub(r'<!--.*?-->','',read(p),flags=re.S)
        for attr, cls in re.findall(r'\b(transport|plugin|gosuclass|javaclass|class|request|reply)="([\w.]+)"', s):
            if cls.startswith('albion.') and cls not in classes: add('E7 registry points at missing class', cc, f'{attr}={cls}', p)
        procs = re.findall(r'process-schedule process="(\w+)" cron="([^"]+)"', s)
        cnt = collections.Counter(pr for pr,_ in procs)
        for pr, n in cnt.items():
            if n > 1: add('E8 scheduler: process scheduled multiple times', cc, f'{pr} x{n}', p)
        for pr in cnt:
            bpt = tl.get('BatchProcessType', set())
            if pr not in bpt and not any(pr == k.rsplit('.',1)[1] for k in classes): add('E8 scheduler: process has no batch class/typecode', cc, pr, p)
    # --- rules sanity
    for p in files(base+'/rules', {'xml'}):
        s = read(p); conds = re.findall(r'<condition lhs="([\w.]+)" op="(\w+)" rhs="(\w+)"', s)
        eq = collections.defaultdict(set); ne = collections.defaultdict(set)
        for l,o,r in conds: (eq if o=='equals' else ne)[l].add(r)
        for l in eq:
            if len(eq[l])>1 or eq[l] & ne[l]: add('E9 rule conditions contradictory (can never fire)', cc, os.path.basename(p), p); break
        dom = {'BrandCode_Ext': tl.get('BrandCode_Ext', set()), 'SourceSystem_Ext': {'POLARIS','GW','SSP','AGGR','MANUAL'}, 'FeedStatus_Ext': {'PENDING','SENT','ACK','NAK','ESCALATED'}}
        for l,o,r in conds:
            f = l.rsplit('.',1)[-1]
            if f in dom and dom[f] and r not in dom[f]: add('E10 rule compares field to value outside its domain', cc, f'{f}={r}', p)


SELF = os.path.realpath(__file__)


def audit_tells(scope):
    tell_re = re.compile(r'DOES_NOT_EXIST|works because|nobody knows|no one knows|peak 20\d\d|gave up|do not diff|'
                         r'meaning disputed|purpose partially|classloader alias|\bFIXME\b|\bHACK\b', re.I)
    for d, _, fs in os.walk(os.path.join(root, scope)):
        if '/.git' in d or d.endswith('.git') or '__pycache__' in d:
            continue
        for f in fs:
            p = os.path.join(d, f)
            if os.path.realpath(p) == SELF:
                continue
            for m in set(tell_re.findall(read(p))):
                add('T1 meta/tell markers', os.path.relpath(p, root).split('/')[0], m.lower(), p)


def audit_batch():
    outs, ins, jobs = set(), [], {}
    for p in files('batch/controlm', {'xml'}):
        s = read(p)
        outs |= set(re.findall(r'<OUTCOND NAME="([\w-]+)"', s))
        ins += [(n, p) for n in re.findall(r'<INCOND NAME="([\w-]+)"', s)]
        for tag in re.findall(r'<JOB\b[^>]*>', s, re.S):
            name = re.search(r'JOBNAME="(\w+)"', tag)
            mem = re.search(r'MEMNAME="(\w+)"', tag)
            if name:
                jobs[name.group(1)] = (mem.group(1) if mem else None, p)
    for n, p in ins:
        if n not in outs and n not in EXTERNAL_CONDITIONS:
            add('B1 Control-M INCOND never produced', 'batch', n, p)
    jcl = {os.path.basename(p)[:-4]: p for p in files('batch/jcl', {'jcl'}, exclude=(ADHOC_JCL_DIR,))}
    for job, (mem, p) in jobs.items():
        member = mem or job
        if member not in jcl:
            add('B2 Control-M job without JCL member', 'batch', member, p)
        elif mem and mem != job:
            add('B4 JOBNAME/MEMNAME/JOB card disagree', 'batch', f'{job} vs member {mem}', p)
    scheduled = {mem or job for job, (mem, _) in jobs.items()}
    for member, p in jcl.items():
        if member not in scheduled:
            add('B3 JCL member not scheduled by Control-M', 'batch', member, p)
    for member, p in list(jcl.items()) + [(os.path.basename(q)[:-4], q) for q in files(ADHOC_JCL_DIR, {'jcl'})]:
        card = re.match(r'//(\w+)\s+JOB\b', read(p))
        if not card or card.group(1) != member:
            add('B4 JOBNAME/MEMNAME/JOB card disagree', 'batch', f'{member} vs card {card.group(1) if card else None}', p)


selected = [args.centre] if args.centre else list(CENTRE_TOP)
for cc in selected:
    if cc in CENTRES:
        audit_centre(cc, CENTRES[cc])
if args.centre:
    audit_tells(CENTRE_TOP[args.centre])
else:
    audit_tells('')
if 'batch' in selected:
    audit_batch()

for cat, items in report.items():
    by = collections.Counter(c for c, _ in items)
    print(f'{cat}: {len(items)} distinct  ' + ' '.join(f'{c}={n}' for c, n in sorted(by.items())))
    for (c, i), ws in list(items.items())[:args.detail]:
        print(f'    [{c}] {i}  ({len(ws)} files, e.g. {ws[0]})')
total = sum(len(items) for items in report.values())
print(f'TOTAL: {total} distinct findings' + (f' (centre={args.centre})' if args.centre else ''))
sys.exit(1 if total else 0)
