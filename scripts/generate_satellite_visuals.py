from pathlib import Path
OUT=Path(__file__).resolve().parents[1]/'public/images/satellites';OUT.mkdir(parents=True,exist_ok=True)
COMMON='''<defs><pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M34 0H0V34" fill="none" stroke="#16372e"/></pattern><linearGradient id="earth" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#286d5a"/><stop offset="1" stop-color="#0d2922"/></linearGradient><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#ffc857"/><stop offset="1" stop-color="#ff806f" stop-opacity="0"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><style>.l{fill:none;stroke:#72efc6;stroke-width:3}.d{fill:#153c31;stroke:#55937e;stroke-width:2}.p{fill:#245987;stroke:#60cceb;stroke-width:2}.g{fill:#ffc857;stroke:#fff0bb;stroke-width:2}.t{font-family:Arial,sans-serif;font-size:11px;font-weight:700;fill:#72efc6;letter-spacing:1px}.s{font-family:Arial,sans-serif;font-size:10px;font-weight:500;fill:#73998c}</style>'''

def frame(title,art,color='#72efc6'):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 430">{COMMON}<rect width="760" height="430" rx="22" fill="#081512"/><rect width="760" height="430" fill="url(#grid)" opacity=".55"/><circle cx="650" cy="40" r="2" fill="{color}"/><circle cx="710" cy="110" r="1.5" fill="#d9fff2"/><text x="30" y="34" class="t">MADAR · SATELLITE ENCYCLOPEDIA</text><text x="30" y="57" class="s">{title}</text>{art}</svg>'''

def sat(x=380,y=190,scale=1,radar=False,dish=False):
 payload='<path d="M-30-35h60v40h-60z" class="g"/>'
 if radar: payload='<rect x="-35" y="-48" width="70" height="52" rx="5" fill="#914f4f" stroke="#ff806f" stroke-width="2"/><path d="M-25-38h50M-25-28h50M-25-18h50" stroke="#ffc2ba"/>'
 if dish: payload='<path d="M-42-15Q0-70 42-15Q0 10-42-15Z" fill="#d8e8e2" stroke="#fff"/><path d="M0-20v35" class="l"/>'
 return f'''<g transform="translate({x} {y}) scale({scale})"><rect x="-45" y="0" width="90" height="105" rx="9" class="d"/>{payload}<rect x="-175" y="28" width="130" height="50" class="p"/><path d="M-157 28v50M-130 28v50M-103 28v50M-76 28v50" stroke="#9ed8ea"/><rect x="45" y="28" width="130" height="50" class="p"/><path d="M70 28v50M97 28v50M124 28v50M151 28v50" stroke="#9ed8ea"/><path d="M0 105v45" class="l"/><circle cy="158" r="9" class="g"/></g>'''

arts={
'earth-observation':sat(395,165,.92)+'''<path d="M365 270 245 405M425 270l115 135" fill="#72efc6" fill-opacity=".08" stroke="#72efc6" stroke-dasharray="8 7"/><path d="M120 405q260-110 520 0" fill="none" stroke="#4f8f79" stroke-width="4"/><rect x="285" y="365" width="210" height="28" rx="4" fill="#173d33" stroke="#72efc6"/><text x="305" y="384" class="s">MULTISPECTRAL SWATH</text>''',
'communications':sat(380,170,.9,dish=True)+'''<path d="M360 130Q220 35 80 170M400 130Q540 35 690 170" fill="none" stroke="#60cceb" stroke-width="3" stroke-dasharray="9 8"/><g transform="translate(72 225)"><path d="M0 120V30M-35 120h70M-42 28q42-65 84 0M-25 28q25-36 50 0" class="l"/></g><g transform="translate(650 225)"><path d="M0 120V30M-35 120h70M-42 28q42-65 84 0M-25 28q25-36 50 0" class="l"/></g>''',
'navigation':sat(380,165,.82)+'''<circle cx="380" cy="215" r="190" fill="none" stroke="#ffc857" stroke-opacity=".5"/><path d="M380 265 160 410M380 265 600 410M380 265 380 420" fill="none" stroke="#ffc857" stroke-dasharray="7 7"/><circle cx="160" cy="410" r="7" class="g"/><circle cx="380" cy="420" r="7" class="g"/><circle cx="600" cy="410" r="7" class="g"/>''',
'weather':sat(390,145,.82)+'''<circle cx="390" cy="560" r="230" fill="url(#earth)" stroke="#72efc6" stroke-width="3"/><path d="M335 280q-75 35-115 110M445 280q75 35 115 110" fill="none" stroke="#9be15d" stroke-width="3" stroke-dasharray="8 7"/><path d="M170 360q45-42 90 0q36-25 72 8q-15 35-82 28h-70Z" fill="#d8eee6" fill-opacity=".65"/>''',
'science':'''<g transform="translate(380 190)"><path d="M-80 5Q0-110 80 5Q0 55-80 5Z" fill="#d9e8e3" stroke="#fff"/><path d="M0 0v100" class="l"/><rect x="-45" y="92" width="90" height="70" rx="8" class="d"/><path d="M-45 110h-115v35h115M45 110h115v35H45" class="p"/></g><circle cx="105" cy="90" r="23" fill="#ffc857" filter="url(#glow)"/><circle cx="650" cy="115" r="4" fill="#fff"/><circle cx="620" cy="70" r="3" fill="#b9a1ff"/><circle cx="695" cy="190" r="2" fill="#fff"/>''',
'technology':sat(380,175,.85)+'''<rect x="90" y="130" width="140" height="165" rx="12" fill="#0d211c" stroke="#ff9e64"/><text x="110" y="160" class="t" fill="#ff9e64">EXPERIMENT</text><path d="M110 195h90M110 220h55M110 245h75" stroke="#ff9e64"/><path d="M230 210h70" stroke="#ff9e64" stroke-dasharray="6 5"/><circle cx="310" cy="210" r="8" fill="#ff9e64"/>''',
'security':sat(390,150,.88,radar=True)+'''<path d="M350 275 180 410M430 275l170 135" fill="none" stroke="#ff806f" stroke-width="3" stroke-dasharray="6 5"/><path d="M255 355q135-95 270 0" fill="none" stroke="#ff806f"/><circle cx="180" cy="410" r="9" fill="#ff806f"/><circle cx="600" cy="410" r="9" fill="#ff806f"/>''',
'iot':sat(380,150,.75)+'''<path d="M335 265Q230 320 145 390M425 265q105 55 190 125" fill="none" stroke="#5bd6a2" stroke-dasharray="6 6"/><g fill="#5bd6a2"><circle cx="145" cy="390" r="7"/><circle cx="245" cy="370" r="7"/><circle cx="515" cy="370" r="7"/><circle cx="615" cy="390" r="7"/></g><g stroke="#5bd6a2" fill="none"><path d="M130 375q15-20 30 0M230 355q15-20 30 0M500 355q15-20 30 0M600 375q15-20 30 0"/></g>'''
}
for slug,art in arts.items():(OUT/f'type-{slug}.svg').write_text(frame(slug.replace('-',' ').upper(),art),encoding='utf-8')

# Detailed generic satellite anatomy with numbered components.
anatomy=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680">{COMMON}<defs><filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-opacity=".45"/></filter></defs><rect width="1000" height="680" rx="24" fill="#081512"/><rect width="1000" height="680" fill="url(#grid)" opacity=".5"/><text x="35" y="38" class="t">MADAR · INTERACTIVE SATELLITE ANATOMY</text><text x="35" y="61" class="s">GENERIC THREE-AXIS-STABILIZED SPACECRAFT · NOT TO SCALE</text>
<g transform="translate(500 310)" filter="url(#shadow)">
 <rect x="-150" y="-125" width="300" height="270" rx="18" fill="#173d33" stroke="#82b5a4" stroke-width="3"/>
 <path d="M-150-50h300M-150 48h300M-52-125v270M55-125v270" stroke="#386d5c" stroke-width="2"/>
 <rect x="-95" y="-92" width="190" height="80" rx="10" fill="#a66b43" stroke="#ffc857" stroke-width="3"/><text x="-62" y="-48" font-family="Arial" font-size="16" fill="#fff0b4">PAYLOAD</text>
 <rect x="-425" y="-65" width="275" height="125" rx="5" class="p"/><path d="M-380-65v125M-330-65v125M-280-65v125M-230-65v125M-180-65v125" stroke="#9bd9ef"/>
 <rect x="150" y="-65" width="275" height="125" rx="5" class="p"/><path d="M195-65v125M245-65v125M295-65v125M345-65v125M395-65v125" stroke="#9bd9ef"/>
 <path d="M0-125v-75" class="l"/><path d="M-68-200Q0-290 68-200Q0-162-68-200Z" fill="#d9e9e3" stroke="#fff" stroke-width="3"/><circle cy="-205" r="7" class="g"/>
 <rect x="-125" y="65" width="68" height="48" rx="6" fill="#23302e" stroke="#b9a1ff"/><rect x="-38" y="65" width="75" height="48" rx="6" fill="#263b35" stroke="#72efc6"/><rect x="57" y="65" width="68" height="48" rx="6" fill="#3b2f25" stroke="#ff9e64"/>
 <circle cx="-92" cy="18" r="25" fill="#243a35" stroke="#ffc857"/><circle cx="-92" cy="18" r="12" fill="none" stroke="#ffc857"/>
 <rect x="55" y="0" width="75" height="42" rx="6" fill="#1d3530" stroke="#60cceb"/>
 <path d="M-55 145-82 205h45L0 145l37 60h45l-27-60" fill="#adbfb9" stroke="#eefbf7"/><path d="M-25 205Q0 285 25 205" fill="url(#f)"/>
 <rect x="135" y="-100" width="13" height="205" fill="#d8e8e2"/><path d="M140-85h45M140 85h45" stroke="#d8e8e2"/><path d="M-148-100h-13v205h13" fill="#d8e8e2"/>
</g>
<!-- leaders and numbered labels -->
<g font-family="Arial" font-weight="700" font-size="12" text-anchor="middle">
 {''.join(f'<circle cx="{x}" cy="{y}" r="18" fill="#102a23" stroke="#72efc6" stroke-width="2"/><text x="{x}" y="{y+4}" fill="#72efc6">{i:02}</text>' for i,(x,y) in enumerate([(500,210),(120,300),(500,80),(775,160),(255,420),(360,540),(500,520),(745,430),(595,600),(830,530)],1))}
</g>
<g fill="none" stroke="#4e8975" stroke-width="2" stroke-dasharray="6 5"><path d="M500 228v35"/><path d="M138 300h82"/><path d="M500 98v45"/><path d="M757 160l-95 70"/><path d="M273 420l135-82"/><path d="M378 540l45-130"/><path d="M500 502v-95"/><path d="M727 430l-120-70"/><path d="M577 600l-48-120"/><path d="M812 530 640 400"/></g>
</svg>'''
(OUT/'satellite-anatomy.svg').write_text(anatomy,encoding='utf-8')
print('wrote',len(arts),'type visuals and anatomy')
