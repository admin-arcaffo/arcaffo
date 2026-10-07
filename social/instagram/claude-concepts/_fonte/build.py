import os, re, json, base64
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)

C = dict(paper='#f7f3ea', sand='#ede7dc', linen='#d8cfc0', stone='#b3a692', umber='#7a5c3e',
         graphite='#574f45', ink='#221c16', espresso='#17130f', ember='#c99a63')

SIZES = {}
for f in os.listdir(HERE):
    if f.endswith('.webp'):
        SIZES[f[:-5]] = Image.open(os.path.join(HERE, f)).size

logo_src = open(os.path.join(HERE, 'ArcaffoGroup_logo_p_1.1.svg')).read()
def logo(color, x, y, w, extra=''):
    svg = logo_src.replace('<path', f'<path fill="{color}"')
    uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode()).decode()
    return f'<img src="{uri}" style="position:absolute;left:{x}px;top:{y}px;width:{w}px;{extra}" alt="Arcaffo GROUP">'

def photo(img, box, region, extra=''):
    """box=(x,y,w,h) on page; region=(sx,sy,sw) in source px (height derived from box aspect)."""
    x, y, w, h = box
    sx, sy, sw = region
    k = w / sw
    W, H = SIZES[img]
    return (f'<div class="ph" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;{extra}">'
            f'<img src="{img}.webp" style="left:{-sx*k:.1f}px;top:{-sy*k:.1f}px;width:{W*k:.1f}px;height:{H*k:.1f}px"></div>')

BASE_CSS = f"""
@font-face{{font-family:Newsreader;src:url(newsreader-latin.woff2) format('woff2');font-weight:300}}
@font-face{{font-family:Inter;src:url(inter-latin.woff2) format('woff2');font-weight:400 600}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{background:{C['paper']}}}
.page{{position:relative;overflow:hidden;width:1080px}}
.feed{{height:1350px}} .story{{height:1920px}}
.ph{{position:absolute;overflow:hidden}} .ph img{{position:absolute;max-width:none}}
.a{{position:absolute}}
.nr{{font-family:Newsreader,Georgia,serif;font-weight:300;letter-spacing:-0.012em;font-feature-settings:'kern','liga'}}
.in{{font-family:Inter,sans-serif;font-weight:400}}
.lb{{font-family:Inter,sans-serif;font-weight:500;text-transform:uppercase;letter-spacing:.18em}}
.hr{{position:absolute;height:1px}} .vr{{position:absolute;width:1px}}
"""

def page(name, kind, bg, body, css=''):
    h = 1350 if kind == 'feed' else 1920
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>{BASE_CSS}{css}</style></head>
<body><div class="page {kind}" style="background:{bg}">{body}</div></body></html>"""
    path = os.path.join(HERE, f'{name}.html')
    open(path, 'w').write(html)
    return dict(html=path, png=os.path.join(OUT, f'{name}.png'), w=1080, h=h)

JOBS = []

# ---------- texto aprovado (content.json, verbatim) ----------
COVER = dict(eyebrow='DECISÃO DE MARCA', title='Rebranding ou redesign?', body='Como saber do que sua empresa realmente precisa.')
S04 = dict(number='04', title='Observe três camadas',
           body='Estratégia: sabemos quem atendemos? Percepção: o mercado nos entende? Expressão: a identidade traduz a direção atual?')
S04_PARTS = [('Estratégia:', 'sabemos quem atendemos?'), ('Percepção:', 'o mercado nos entende?'), ('Expressão:', 'a identidade traduz a direção atual?')]
CTA = dict(eyebrow='LEIA NA MATÉRIA', title='Sua marca precisa mudar ou ser compreendida melhor?', body='Leia o artigo completo em arcaffo.com/artigos')
ST2 = dict(eyebrow='PERGUNTA', title='O problema está na direção ou na expressão?',
           body='Estratégia, percepção e identidade precisam ser observadas antes da decisão.', sticker='Enquete: Direção / Expressão')

def sticker_zone(x, y, w, h, color, label_color, label='Área reservada · adesivo de enquete'):
    """Marcas de registro nos cantos + rótulo utilitário. Não imita o adesivo."""
    L = 36
    s = ''
    for cx, cy, dx, dy in [(x, y, 1, 1), (x + w, y, -1, 1), (x, y + h, 1, -1), (x + w, y + h, -1, -1)]:
        s += f'<div class="hr" style="left:{min(cx, cx+dx*L)}px;top:{cy-1}px;width:{L}px;height:2px;background:{color}"></div>'
        s += f'<div class="vr" style="left:{cx-1}px;top:{min(cy, cy+dy*L)}px;height:{L}px;width:2px;background:{color}"></div>'
    s += f'<div class="a lb" style="left:{x}px;top:{y + h + 24}px;font-size:19px;color:{label_color}">{label}</div>'
    return s

# =====================================================================
# DIREÇÃO 01 — CORTE
# A decisão como um corte preciso. A fotografia do corte do vidro
# (projeto Cia do Vidro) define a linha que organiza cada página.
# =====================================================================
d = 'direcao-01'

# capa: foto sangrada, recorte fechado na ponta do cortador; a aresta do vidro vira a linha da página
body = photo('f30bd934bd', (0, 0, 1080, 1350), (560, 300, 600))
edge = 988  # aresta do vidro no recorte
body += f'<div class="hr" style="left:0;top:{edge}px;width:1080px;background:{C["ember"]};opacity:.9"></div>'
body += logo(C['paper'], 64, 60, 150)
body += f'<div class="a lb" style="right:64px;top:74px;font-size:17px;color:{C["stone"]}">Matéria 01</div>'
body += f'<div class="a lb" style="left:384px;top:282px;font-size:19px;color:{C["ember"]}">{COVER["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:380px;top:330px;width:680px;font-size:106px;line-height:1;white-space:nowrap;color:{C["paper"]}">Rebranding<br>ou redesign?</div>'
body += f'<div class="a in" style="left:384px;top:580px;width:520px;font-size:31px;line-height:1.4;color:{C["linen"]}">{COVER["body"]}</div>'
body += f'<div class="a lb" style="right:64px;top:{edge-44}px;font-size:17px;color:{C["ember"]}">Deslize →</div>'
body += f'<div class="a lb" style="left:64px;bottom:52px;font-size:15px;color:{C["ink"]}">Cia do Vidro · projeto Arcaffo</div>'
body += f'<div class="a lb" style="right:64px;bottom:52px;font-size:16px;color:{C["ink"]}">01 / 07</div>'
JOBS.append(page(f'{d}-01-capa', 'feed', C['espresso'], body))

# interno 04: três faixas cortadas; a lâmina de vidro (camadas reais) atravessa a página
body = photo('bc15925088', (760, 0, 320, 1350), (1400, 0, 320))
body += logo(C['paper'], 64, 60, 130)
body += f'<div class="a lb" style="left:64px;top:230px;font-size:18px;color:{C["ember"]}">Ponto {S04["number"]}</div>'
body += f'<div class="a nr" style="left:60px;top:270px;width:660px;font-size:88px;line-height:1;color:{C["paper"]}">{S04["title"]}</div>'
top = 520
rows = [(520, 250), (770, 250), (1020, 250)]
for i, ((k, q), (ry, rh)) in enumerate(zip(S04_PARTS, rows)):
    body += f'<div class="hr" style="left:64px;top:{ry}px;width:1016px;background:{C["ember"]};z-index:2"></div>'
    body += f'<div class="a nr" style="left:64px;top:{ry+34}px;font-size:66px;line-height:1;color:{C["paper"]}">{k}</div>'
    body += f'<div class="a in" style="left:64px;top:{ry+122}px;width:660px;font-size:34px;line-height:1.35;color:{C["stone"]}">{q}</div>'
body += f'<div class="hr" style="left:64px;top:1270px;width:1016px;background:{C["ember"]};z-index:2"></div>'
body += f'<div class="a lb" style="left:64px;top:1292px;font-size:16px;color:{C["stone"]}">Rebranding ou redesign?</div>'
body += f'<div class="a lb" style="left:560px;top:1292px;font-size:16px;color:{C["stone"]}">05 / 07</div>'
JOBS.append(page(f'{d}-02-interno', 'feed', C['espresso'], body))

# CTA: grande título; o detalhe do cortador reaparece pequeno, pousado na linha do link
body = logo(C['paper'], 64, 60, 150)
body += f'<div class="a lb" style="right:64px;top:74px;font-size:17px;color:{C["stone"]}">Matéria 01</div>'
body += f'<div class="a lb" style="left:64px;top:250px;font-size:19px;color:{C["ember"]}">{CTA["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:60px;top:300px;width:940px;font-size:96px;line-height:1.02;color:{C["paper"]}">{CTA["title"]}</div>'
line_y = 960
body += photo('f30bd934bd', (716, line_y - 300, 300, 300), (700, 560, 300))
body += f'<div class="hr" style="left:0;top:{line_y}px;width:1080px;background:{C["ember"]}"></div>'
body += f'<div class="a in" style="left:64px;top:{line_y+36}px;width:620px;font-size:32px;line-height:1.4;color:{C["paper"]}">{CTA["body"]} <span style="color:{C["ember"]}">↗</span></div>'
body += f'<div class="a lb" style="left:64px;bottom:52px;font-size:15px;color:{C["stone"]}">Pessoas, valores, Negócios &amp; Marcas.</div>'
body += f'<div class="a lb" style="right:64px;bottom:52px;font-size:16px;color:{C["stone"]}">07 / 07</div>'
JOBS.append(page(f'{d}-03-cta', 'feed', C['espresso'], body))

# Story 02: foto no topo (área de UI do Instagram é só imagem), linha de corte desce até a enquete
sy = 0
body = photo('f30bd934bd', (0, 0, 1080, 620), (900, 380, 900))
cut = round((808 - 380) * 1080 / 900)
body += f'<div class="hr" style="left:0;top:{cut}px;width:1080px;background:{C["ember"]}"></div>'
body += f'<div class="a lb" style="left:64px;top:700px;font-size:20px;color:{C["ember"]}">{ST2["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:60px;top:752px;width:940px;font-size:96px;line-height:1.02;color:{C["paper"]}">{ST2["title"]}</div>'
body += f'<div class="a in" style="left:64px;top:1080px;width:800px;font-size:34px;line-height:1.42;color:{C["stone"]}">{ST2["body"]}</div>'
body += f'<div class="vr" style="left:540px;top:1250px;height:40px;background:{C["ember"]}"></div>'
body += sticker_zone(150, 1300, 780, 300, C['ember'], C['stone'])
body += f'<div class="a lb" style="right:64px;top:1636px;font-size:16px;color:{C["stone"]}">02 / 03</div>'
JOBS.append(page(f'{d}-04-story', 'story', C['espresso'], body))

# =====================================================================
# DIREÇÃO 02 — DOSSIÊ
# A leitura estratégica como documento: grade rígida, pranchas com
# legenda, notas de margem. O projeto aparece como evidência.
# =====================================================================
d = 'direcao-02'
def dossier_head(dark=False, folio='01 / 07', w_logo=120):
    fg = C['paper'] if dark else C['ink']
    mut = C['stone'] if dark else C['graphite']
    rule = 'rgba(247,243,234,.22)' if dark else C['ink']
    s = logo(fg, 72, 58, w_logo)
    s += f'<div class="a lb" style="left:396px;top:74px;font-size:15px;color:{mut}">Matéria 01 — Decisão de marca</div>'
    s += f'<div class="a lb" style="right:72px;top:74px;font-size:15px;color:{mut}">{folio}</div>'
    s += f'<div class="hr" style="left:72px;top:124px;width:936px;background:{rule}"></div>'
    return s

# capa: prancha grande do projeto + título sobreposto à borda da prancha
body = dossier_head()
body += photo('816a80878d', (396, 160, 612, 700), (620, 120, 780))
body += f'<div class="a lb" style="left:72px;top:170px;width:280px;font-size:17px;line-height:1.7;color:{C["umber"]}">{COVER["eyebrow"]}</div>'
body += f'<div class="a in" style="left:72px;top:760px;width:290px;font-size:17px;line-height:1.45;color:{C["graphite"]}"><span class="lb" style="font-size:14px;color:{C["umber"]}">Fig. 01</span><br>Cia do Vidro. Sistema de papelaria, projeto Arcaffo.</div>'
body += f'<div class="a" style="left:0;top:830px;width:1080px;height:520px;background:{C["paper"]}"></div>'
body += f'<div class="a nr" style="left:66px;top:850px;width:980px;font-size:130px;line-height:.95;white-space:nowrap;color:{C["ink"]}">Rebranding<br><span style="padding-left:198px">ou redesign?</span></div>'
body += f'<div class="hr" style="left:72px;top:1150px;width:936px;background:{C["linen"]}"></div>'
body += f'<div class="a in" style="left:396px;top:1176px;width:560px;font-size:31px;line-height:1.35;color:{C["graphite"]}">{COVER["body"]}</div>'
body += f'<div class="a lb" style="left:72px;top:1186px;font-size:17px;color:{C["umber"]}">Deslize →</div>'
JOBS.append(page(f'{d}-01-capa', 'feed', C['paper'], body))

# interno 04: corte estratigráfico — três camadas com espessuras diferentes
body = dossier_head(folio='05 / 07')
body += f'<div class="a nr" style="left:72px;top:176px;font-size:120px;line-height:1;color:{C["umber"]}">{S04["number"]}</div>'
body += f'<div class="a nr" style="left:396px;top:190px;width:612px;font-size:80px;line-height:1;color:{C["ink"]}">{S04["title"]}</div>'
bands = [(C['linen'], 340), (C['sand'], 310), (C['paper'], 280)]
y = 420
for (bg, hgt), (k, q) in zip(bands, S04_PARTS):
    body += f'<div class="a" style="left:0;top:{y}px;width:1080px;height:{hgt}px;background:{bg};border-top:1px solid {C["ink"]}"></div>'
    body += f'<div class="a lb" style="left:72px;top:{y+30}px;font-size:18px;color:{C["umber"]}">{k}</div>'
    body += f'<div class="a nr" style="left:396px;top:{y+20}px;width:612px;font-size:56px;line-height:1.06;color:{C["ink"]}">{q}</div>'
    y += hgt
body += f'<div class="hr" style="left:0;top:{y}px;width:1080px;background:{C["ink"]}"></div>'
JOBS.append(page(f'{d}-02-interno', 'feed', C['paper'], body))

# CTA: prancha da construção do logotipo (a forma tem razão) + colofão
body = dossier_head(dark=True, folio='07 / 07')
body += f'<div class="a lb" style="left:72px;top:176px;font-size:17px;color:{C["ember"]}">{CTA["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:396px;top:166px;width:612px;font-size:78px;line-height:1.04;color:{C["paper"]}">{CTA["title"]}</div>'
body += photo('3476ec507d', (72, 680, 936, 330), (220, 0, 1480))
body += f'<div class="a in" style="left:72px;top:1030px;width:300px;font-size:16px;line-height:1.45;color:{C["stone"]}"><span class="lb" style="font-size:14px;color:{C["ember"]}">Fig. 05</span><br>Cia do Vidro. Construção do logotipo.</div>'
body += f'<div class="hr" style="left:396px;top:1034px;width:612px;background:{C["ember"]}"></div>'
body += f'<div class="a in" style="left:396px;top:1058px;width:560px;font-size:32px;line-height:1.38;color:{C["paper"]}">{CTA["body"]}</div>'
body += f'<div class="a lb" style="left:72px;bottom:56px;font-size:14px;color:{C["stone"]}">Pessoas, valores, Negócios &amp; Marcas.</div>'
JOBS.append(page(f'{d}-03-cta', 'feed', C['espresso'], body))

# Story 02: formulário de leitura — pergunta, nota, área reservada como campo do documento
body = logo(C['ink'], 72, 290, 130)
body += f'<div class="a lb" style="right:72px;top:306px;font-size:15px;color:{C["graphite"]}">Matéria 01 · 02 / 03</div>'
body += f'<div class="hr" style="left:72px;top:356px;width:936px;background:{C["ink"]}"></div>'
body += f'<div class="a lb" style="left:72px;top:400px;font-size:18px;color:{C["umber"]}">{ST2["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:68px;top:450px;width:940px;font-size:100px;line-height:1;color:{C["ink"]}">{ST2["title"]}</div>'
body += f'<div class="hr" style="left:396px;top:840px;width:612px;background:{C["linen"]}"></div>'
body += f'<div class="a in" style="left:396px;top:866px;width:612px;font-size:32px;line-height:1.42;color:{C["graphite"]}">{ST2["body"]}</div>'
body += photo('bc15925088', (72, 866, 290, 290), (1150, 250, 500))
body += f'<div class="a" style="left:0;top:1230px;width:1080px;height:420px;background:{C["sand"]};border-top:1px solid {C["ink"]}"></div>'
body += sticker_zone(150, 1290, 780, 280, C['umber'], C['graphite'])
JOBS.append(page(f'{d}-04-story', 'story', C['paper'], body))

# =====================================================================
# DIREÇÃO 03 — ESCALA
# A tipografia constrói o sentido: palavras decisivas em escala
# monumental, conectivos pequenos. Fotografia como amostra de matéria.
# =====================================================================
d = 'direcao-03'
def small(t, x, y, color, size=26, extra=''):
    return f'<div class="a in" style="left:{x}px;top:{y}px;font-size:{size}px;line-height:1.3;color:{color};{extra}">{t}</div>'

# capa
body = logo(C['ink'], 56, 58, 120)
body += f'<div class="a lb" style="right:56px;top:72px;font-size:15px;color:{C["umber"]}">{COVER["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:44px;top:176px;font-size:198px;line-height:1;letter-spacing:-.02em;color:{C["ink"]}">Rebranding</div>'
# amostra de matéria: o bloco "DO" do cartão, no ponto de decisão
body += photo('ff7c565403', (56, 470, 250, 250), (955, 770, 250), f'outline:1px solid {C["linen"]};outline-offset:10px')
body += f'<div class="a nr" style="left:350px;top:540px;font-size:92px;line-height:1;color:{C["umber"]}">ou</div>'
body += f'<div class="a lb" style="left:350px;top:660px;font-size:14px;color:{C["graphite"]}">Amostra — Cia do Vidro</div>'
body += f'<div class="a nr" style="left:40px;top:760px;font-size:222px;line-height:1;letter-spacing:-.02em;color:{C["ink"]}">redesign?</div>'
body += f'<div class="hr" style="left:56px;top:1090px;width:968px;background:{C["ink"]}"></div>'
body += f'<div class="a in" style="left:56px;top:1118px;width:560px;font-size:32px;line-height:1.35;color:{C["graphite"]}">{COVER["body"]}</div>'
body += f'<div class="a lb" style="right:56px;top:1128px;font-size:16px;color:{C["umber"]}">01 / 07 →</div>'
JOBS.append(page(f'{d}-01-capa', 'feed', C['paper'], body))

# interno 04
body = logo(C['ink'], 56, 58, 110)
body += f'<div class="a lb" style="right:56px;top:72px;font-size:15px;color:{C["umber"]}">Ponto {S04["number"]}</div>'
body += f'<div class="a nr" style="left:56px;top:150px;font-size:60px;line-height:1;color:{C["ink"]}">{S04["title"]}</div>'
ys = [270, 620, 970]
aligns = ['left:36px', 'right:56px;text-align:right', 'left:36px']
qpos = [(620, 440), (60, 790), (560, 1140)]
for (k, q), yy, al, (qx, qy) in zip(S04_PARTS, ys, aligns, qpos):
    body += f'<div class="a nr" style="{al};top:{yy}px;font-size:176px;line-height:1;letter-spacing:-.02em;color:{C["ink"]}">{k}</div>'
    body += small(q, qx, qy, C['graphite'], 30, 'width:440px')
body += f'<div class="a lb" style="right:56px;bottom:40px;font-size:15px;color:{C["umber"]}">05 / 07</div>'
JOBS.append(page(f'{d}-02-interno', 'feed', C['sand'], body))

# CTA (deep): mudar / compreendida em escala
body = logo(C['paper'], 56, 58, 120)
body += f'<div class="a lb" style="right:56px;top:72px;font-size:15px;color:{C["ember"]}">{CTA["eyebrow"]}</div>'
body += small('Sua marca precisa', 60, 200, C['stone'], 40)
body += f'<div class="a nr" style="left:40px;top:250px;font-size:250px;line-height:1;letter-spacing:-.02em;color:{C["paper"]}">mudar</div>'
body += small('ou ser', 64, 500, C['stone'], 40)
body += f'<div class="a nr" style="left:40px;top:548px;font-size:156px;line-height:1;letter-spacing:-.02em;color:{C["paper"]}">compreendida</div>'
body += small('melhor?', 64, 750, C['stone'], 40)
body += photo('bc15925088', (824, 820, 200, 200), (1300, 380, 360), f'outline:1px solid rgba(247,243,234,.25);outline-offset:10px')
body += f'<div class="a lb" style="left:560px;top:1000px;font-size:14px;color:{C["stone"]}">Amostra — Cia do Vidro</div>'
body += f'<div class="hr" style="left:56px;top:1090px;width:968px;background:{C["ember"]}"></div>'
body += f'<div class="a in" style="left:56px;top:1118px;width:640px;font-size:32px;line-height:1.35;color:{C["paper"]}">{CTA["body"]}</div>'
body += f'<div class="a lb" style="right:56px;top:1128px;font-size:16px;color:{C["ember"]}">07 / 07</div>'
JOBS.append(page(f'{d}-03-cta', 'feed', C['espresso'], body))

# Story 02 (deep)
body = f'<div class="a lb" style="left:64px;top:290px;font-size:18px;color:{C["ember"]}">{ST2["eyebrow"]}</div>'
body += small('O problema está na', 64, 360, C['stone'], 44)
body += f'<div class="a nr" style="left:44px;top:420px;font-size:232px;line-height:1;letter-spacing:-.02em;color:{C["paper"]}">direção</div>'
body += small('ou na', 64, 690, C['stone'], 44)
body += f'<div class="a nr" style="left:44px;top:750px;font-size:212px;line-height:1;letter-spacing:-.02em;color:{C["paper"]}">expressão?</div>'
body += f'<div class="hr" style="left:64px;top:1030px;width:952px;background:{C["ember"]}"></div>'
body += f'<div class="a in" style="left:64px;top:1056px;width:760px;font-size:32px;line-height:1.42;color:{C["stone"]}">{ST2["body"]}</div>'
body += sticker_zone(150, 1260, 780, 290, C['ember'], C['stone'])
body += logo(C['paper'], 64, 1616, 120)
body += f'<div class="a lb" style="right:64px;top:1636px;font-size:15px;color:{C["stone"]}">02 / 03</div>'
JOBS.append(page(f'{d}-04-story', 'story', C['espresso'], body))

json.dump(JOBS, open(os.path.join(HERE, 'jobs.json'), 'w'), indent=1)
print(len(JOBS), 'páginas')

# =====================================================================
# DIREÇÃO 04 — DOSSIÊ × CORTE (híbrida)
# Grade, cabeçalho, legendas e estratos do Dossiê; fotografia do Corte.
# =====================================================================
d = 'direcao-04'
json_jobs_start = len(JOBS)

# capa: prancha do corte sangrando à direita; a aresta do vidro vira filete que atravessa a grade
body = dossier_head()
PX, PY, PW, PH = 396, 150, 684, 690
region = (620, 420, 700)       # recorte na ponta do cortador
k = PW / region[2]
edge_y = PY + round((846 - region[1]) * k)   # aresta do vidro (px de origem ~990)
body += photo('f30bd934bd', (PX, PY, PW, PH), region)
body += f'<div class="hr" style="left:72px;top:{edge_y}px;width:{PX-72}px;background:{C["umber"]}"></div>'
body += f'<div class="a lb" style="left:72px;top:170px;width:280px;font-size:17px;line-height:1.7;color:{C["umber"]}">{COVER["eyebrow"]}</div>'
body += f'<div class="a in" style="left:72px;top:{edge_y-66}px;width:290px;font-size:17px;line-height:1.45;color:{C["graphite"]}"><span class="lb" style="font-size:14px;color:{C["umber"]}">Fig. 01</span><br>Cia do Vidro, projeto Arcaffo.</div>'
body += f'<div class="a" style="left:0;top:{PY+PH}px;width:1080px;height:{1350-PY-PH}px;background:{C["paper"]}"></div>'
body += f'<div class="a nr" style="left:66px;top:{PY+PH-60}px;width:980px;font-size:130px;line-height:.95;white-space:nowrap;color:{C["ink"]}">Rebranding<br><span style="padding-left:198px">ou redesign?</span></div>'
body += f'<div class="hr" style="left:72px;top:1150px;width:936px;background:{C["linen"]}"></div>'
body += f'<div class="a in" style="left:396px;top:1176px;width:560px;font-size:31px;line-height:1.35;color:{C["graphite"]}">{COVER["body"]}</div>'
body += f'<div class="a lb" style="left:72px;top:1186px;font-size:17px;color:{C["umber"]}">Deslize →</div>'
JOBS.append(page(f'{d}-01-capa', 'feed', C['paper'], body))

# interno 04: estratos do Dossiê atravessando a lâmina de vidro empilhada (foto real de camadas)
body = dossier_head(folio='05 / 07')
body += f'<div class="a nr" style="left:72px;top:176px;font-size:120px;line-height:1;color:{C["umber"]}">{S04["number"]}</div>'
body += f'<div class="a nr" style="left:396px;top:190px;width:612px;font-size:80px;line-height:1;color:{C["ink"]}">{S04["title"]}</div>'
SX = 836
body += photo('bc15925088', (SX, 420, 1080 - SX, 930), (1480, 0, 1080 - SX), '')
bands = [(C['linen'], 340), (C['sand'], 310), (C['paper'], 280)]
y = 420
for (bg, hgt), (kk, q) in zip(bands, S04_PARTS):
    body += f'<div class="a" style="left:0;top:{y}px;width:{SX}px;height:{hgt}px;background:{bg}"></div>'
    body += f'<div class="hr" style="left:0;top:{y}px;width:1080px;background:{C["ink"]};z-index:2"></div>'
    body += f'<div class="a lb" style="left:72px;top:{y+30}px;font-size:18px;color:{C["umber"]}">{kk}</div>'
    body += f'<div class="a nr" style="left:396px;top:{y+20}px;width:410px;font-size:52px;line-height:1.06;color:{C["ink"]}">{q}</div>'
    y += hgt
body += f'<div class="a in" style="left:72px;top:1250px;width:290px;font-size:16px;line-height:1.45;color:{C["graphite"]}"><span class="lb" style="font-size:14px;color:{C["umber"]}">Fig. 04</span><br>Cia do Vidro, projeto Arcaffo.</div>'
JOBS.append(page(f'{d}-02-interno', 'feed', C['paper'], body))

# CTA: colofão do Dossiê; o detalhe do cortador como prancha pousada na linha do link
body = dossier_head(dark=True, folio='07 / 07')
body += f'<div class="a lb" style="left:72px;top:176px;font-size:17px;color:{C["ember"]}">{CTA["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:396px;top:166px;width:612px;font-size:78px;line-height:1.04;color:{C["paper"]}">{CTA["title"]}</div>'
LY = 1000
body += photo('f30bd934bd', (72, LY - 400, 288, 400), (690, 470, 330))
body += f'<div class="hr" style="left:72px;top:{LY}px;width:936px;background:{C["ember"]}"></div>'
body += f'<div class="a in" style="left:72px;top:{LY+18}px;width:290px;font-size:16px;line-height:1.45;color:{C["stone"]}"><span class="lb" style="font-size:14px;color:{C["ember"]}">Fig. 05</span><br>Cia do Vidro, projeto Arcaffo.</div>'
body += f'<div class="a in" style="left:396px;top:{LY+24}px;width:560px;font-size:32px;line-height:1.38;color:{C["paper"]}">{CTA["body"]} <span style="color:{C["ember"]}">↗</span></div>'
body += f'<div class="a lb" style="left:72px;bottom:56px;font-size:14px;color:{C["stone"]}">Pessoas, valores, Negócios &amp; Marcas.</div>'
JOBS.append(page(f'{d}-03-cta', 'feed', C['espresso'], body))

# Story 02: prancha fotográfica no topo (zona de UI recebe só imagem), documento abaixo
TOP = 700
body = photo('f30bd934bd', (0, 0, 1080, TOP), (880, 330, 1000))
body += f'<div class="hr" style="left:0;top:{TOP}px;width:1080px;background:{C["ink"]}"></div>'
body += f'<div class="a in" style="left:72px;top:{TOP+16}px;font-size:15px;color:{C["graphite"]}"><span class="lb" style="font-size:13px;color:{C["umber"]}">Fig. 02</span>&nbsp;&nbsp;Cia do Vidro, projeto Arcaffo.</div>'
body += f'<div class="a lb" style="right:72px;top:{TOP+18}px;font-size:14px;color:{C["graphite"]}">Matéria 01 · 02 / 03</div>'
body += f'<div class="a lb" style="left:72px;top:{TOP+90}px;font-size:18px;color:{C["umber"]}">{ST2["eyebrow"]}</div>'
body += f'<div class="a nr" style="left:68px;top:{TOP+136}px;width:940px;font-size:88px;line-height:1;color:{C["ink"]}">{ST2["title"]}</div>'
body += f'<div class="a in" style="left:396px;top:{TOP+430}px;width:612px;font-size:31px;line-height:1.42;color:{C["graphite"]}">{ST2["body"]}</div>'
body += logo(C['ink'], 72, TOP + 440, 130)
body += f'<div class="a" style="left:0;top:1290px;width:1080px;height:630px;background:{C["sand"]};border-top:1px solid {C["ink"]}"></div>'
body += sticker_zone(150, 1330, 780, 250, C['umber'], C['graphite'])
JOBS.append(page(f'{d}-04-story', 'story', C['paper'], body))

json.dump(JOBS, open(os.path.join(HERE, 'jobs.json'), 'w'), indent=1)
print('híbrida ok')
