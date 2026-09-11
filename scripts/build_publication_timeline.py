"""Merge matching titles or arXiv/DOI identifiers for an auditable timeline."""
from pathlib import Path
import json,re,unicodedata,collections
root=Path(__file__).resolve().parents[1]
records=json.loads((root/'assets/data/publications.json').read_text())
parents=list(range(len(records)))
def find(i):
 while parents[i]!=i:
  parents[i]=parents[parents[i]];i=parents[i]
 return i
seen={}
for i,p in enumerate(records):
 title=''.join(c for c in unicodedata.normalize('NFKC',p['title']).casefold() if c.isalnum())
 keys=['title:'+title] if title else []
 for value in p.get('links',{}).values():
  url=value if isinstance(value,str) else value.get('url','')
  a=re.search(r'arxiv.org/(?:abs|html|pdf)/(\d{4}\.\d{4,5})',url)
  if a:keys.append('arxiv:'+a[1])
  d=re.search(r'doi.org/(10\.[^?#]+)',url)
  if d:keys.append('doi:'+d[1].casefold())
 for k in keys:
  if k in seen:parents[find(i)]=find(seen[k])
  else:seen[k]=i
clusters=collections.defaultdict(list)
for i,p in enumerate(records):clusters[find(i)].append(p)
counts=collections.Counter();audit=[]
for group in clusters.values():
 years=[int(p['date'][:4]) for p in group if p.get('date') and int(p['date'][:4])>1900]
 year=max(years) if years else None
 if year:counts[year]+=1
 audit.append({'title':group[0]['title'],'year':year,'scholar_ids':[p['scholar_id'] for p in group]})
out={'records':len(records),'distinct_works':len(clusters),'undated':sum(x['year'] is None for x in audit),'method':'Merge exact normalized titles or shared arXiv/DOI identifiers; assign each group to its latest recorded year. Title changes without a shared identifier may remain separate.','years':[{'year':y,'count':counts[y]} for y in sorted(counts)],'groups':audit}
(root/'assets/data/publication-timeline.json').write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
import yaml
(root/'_data/publication_timeline.yml').write_text(yaml.safe_dump({k:v for k,v in out.items() if k!='groups'},sort_keys=False))
print(len(records),'records ->',len(clusters),'matched works;',out['undated'],'undated')
