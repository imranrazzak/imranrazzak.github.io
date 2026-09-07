"""Validate built navigation, assets, anchors, metadata and imported publication coverage."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else '_site').resolve()
class Page(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set();self.canonical=False;self.description=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='link' and a.get('rel')=='canonical':self.canonical=True
  if tag=='meta' and a.get('name')=='description':self.description=bool(a.get('content'))
  for key in ['href','src']:
   if a.get(key):self.links.append(a[key])
pages={}
for f in root.glob('*.html'):
 p=Page();p.feed(f.read_text());pages[f]=p
errors=[]
for f,p in pages.items():
 if not p.canonical or not p.description:errors.append(f'{f.name}: missing metadata')
 for link in p.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  dest=(root/unquote(u.path).lstrip('/')) if u.path.startswith('/') else (f.parent/unquote(u.path))
  if not u.path:dest=f
  if dest.is_dir():dest=dest/'index.html'
  if not dest.exists():errors.append(f'{f.name}: missing {link}')
  elif u.fragment and dest in pages and unquote(u.fragment) not in pages[dest].ids:errors.append(f'{f.name}: missing anchor {link}')
records=json.loads((root/'assets/data/publications.json').read_text())
assert len(records)==517, 'Unexpected publication count'
assert len({p['scholar_id'] for p in records})==517, 'Duplicate or missing Scholar record IDs'
assert sum(p.get('selected',False) for p in records)==7, 'Missing selected papers'
text=(root/'publications.html').read_text()
for p in records:
 if p['scholar_id'] not in text:errors.append(f'Missing publication: {p["title"]}')
for f in pages:
 for marker in ['Your Name','your@email.com','Convallis a cras','bicolor cat','/academic-homepage/assets','© UNSW 2022']:
  if marker in f.read_text().replace('[Your Name]', '[Applicant name]'):errors.append(f'{f.name}: template placeholder {marker}')
if errors:print('\n'.join(errors));sys.exit(1)
print(f'PASS: {len(pages)} pages; all local links, assets, anchors and metadata; 517 unique Scholar records; 7 selected papers.')
