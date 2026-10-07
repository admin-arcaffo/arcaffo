import json,os
C=dict(paper='#f7f3ea',sand='#ede7dc',linen='#d8cfc0',ink='#221c16',graphite='#574f45',umber='#7a5c3e')
dirs=[('01','Corte','A decisão como um corte preciso. Fotografia sangrada define a linha que organiza a página.'),
('02','Dossiê','A leitura estratégica como documento: grade rígida, pranchas legendadas, notas de margem.'),
('03','Escala','Palavras decisivas em escala monumental, conectivos pequenos. Foto como amostra de matéria.'),
('04','Dossiê × Corte','Grade, legendas e estratos do Dossiê com a fotografia do Corte: gesto, aresta e lâminas de vidro.')]
rows=''
for n,name,desc in dirs:
    imgs=''.join(f'<div class="c"><img src="out/direcao-{n}-0{i}-{k}.png" style="height:{h}px"><span>{lab}</span></div>' for i,k,lab,h in [(1,'capa','Capa',600),(2,'interno','Interno · 04',600),(3,'cta','CTA',600),(4,'story','Story 02 · enquete',600)])
    rows+=f'<section><div class="m"><div class="n">{n}</div><div class="t">{name}</div><p>{desc}</p></div><div class="r">{imgs}</div></section>'
html=f"""<!doctype html><meta charset=utf-8><style>
@font-face{{font-family:Newsreader;src:url(newsreader-latin.woff2);font-weight:300}}
@font-face{{font-family:Inter;src:url(inter-latin.woff2);font-weight:400 600}}
body{{margin:0;background:{C['sand']};font-family:Inter;color:{C['ink']};width:2460px}}
header{{padding:64px 80px 40px;border-bottom:1px solid {C['ink']};margin:0 0 0}}
h1{{font-family:Newsreader;font-weight:300;font-size:72px;margin:0}}
header p{{font-size:20px;color:{C['graphite']};margin:12px 0 0;letter-spacing:.02em}}
section{{display:flex;gap:48px;padding:48px 80px;border-bottom:1px solid {C['linen']}}}
.m{{width:360px;flex:none}} .n{{font-size:15px;letter-spacing:.18em;color:{C['umber']};font-weight:500}}
.t{{font-family:Newsreader;font-weight:300;font-size:64px;line-height:1;margin:8px 0 18px}}
.m p{{font-size:20px;line-height:1.45;color:{C['graphite']}}}
.r{{display:flex;gap:32px;align-items:flex-start}} .c{{display:flex;flex-direction:column;gap:12px}}
.c img{{display:block;outline:1px solid {C['linen']}}} .c span{{font-size:14px;letter-spacing:.16em;text-transform:uppercase;color:{C['graphite']};font-weight:500}}
</style><header><h1>Rebranding ou redesign? — direções</h1><p>Arcaffo GROUP · Instagram · piloto de direção de arte · 23/09/2026 · capa, interno, CTA e Story por direção</p></header>{rows}"""
open('board.html','w').write(html)
json.dump([dict(html=os.path.abspath('board.html'),png=os.path.abspath('out/prancha-comparativa.png'),w=3200,h=0)],open('jobs_board.json','w'))
