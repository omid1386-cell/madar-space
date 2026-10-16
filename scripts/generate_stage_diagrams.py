from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / "public" / "images" / "stages"
OUT.mkdir(parents=True, exist_ok=True)

BG = """<rect width="800" height="520" fill="#081512"/>
<defs>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#17372e" stroke-width="1"/></pattern>
 <filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <linearGradient id="flame" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0a5"/><stop offset=".35" stop-color="#ffc857"/><stop offset=".75" stop-color="#ff806f"/><stop offset="1" stop-color="#ff806f" stop-opacity="0"/></linearGradient>
</defs><rect width="800" height="520" fill="url(#grid)" opacity=".55"/>
<circle cx="740" cy="50" r="2" fill="#72efc6"/><circle cx="640" cy="92" r="1.5" fill="#d8fff2"/><circle cx="115" cy="70" r="1.5" fill="#d8fff2"/><circle cx="690" cy="210" r="1" fill="#72efc6"/>"""

STYLE = """<style>.label{font:600 16px Arial,sans-serif;fill:#b7d1c8}.small{font:500 12px Arial,sans-serif;fill:#6f9689}.micro{font:700 10px monospace;fill:#72efc6;letter-spacing:1px}.line{stroke:#4e8b77;stroke-width:2;fill:none}.dash{stroke:#3c7562;stroke-width:2;stroke-dasharray:8 8;fill:none}.rocket{fill:#bed7ce;stroke:#effff9;stroke-width:2}.dark{fill:#143a30;stroke:#477d6c;stroke-width:2}.accent{fill:#72efc6}.gold{fill:#ffc857}.coral{fill:#ff806f}</style>"""

def rocket(x=400,y=90,scale=1,rotate=0,flame=True):
    f = '<path d="M-15 136 Q0 190 15 136 L8 122 H-8Z" fill="url(#flame)" filter="url(#glow)"/>' if flame else ''
    return f'''<g transform="translate({x} {y}) rotate({rotate}) scale({scale})">
      <path class="rocket" d="M0 0C17 15 23 35 23 56v63H-23V56C-23 35-17 15 0 0Z"/>
      <path class="dark" d="M-23 75H23V119H-23Z"/><path class="rocket" d="M-25 119H25V134H-25Z"/>
      <path class="dark" d="M-24 94-41 125h17M24 94l41 31H24"/><circle cx="0" cy="46" r="8" fill="#163e34" stroke="#72efc6"/>{f}</g>'''

def earth_horizon(y=445):
    return f'<path d="M-50 {y+80} Q400 {y-130} 850 {y+80}V600H-50Z" fill="#123a31" stroke="#4b8f78" stroke-width="3"/><path d="M20 {y+35}Q400 {y-95} 780 {y+35}" fill="none" stroke="#72efc6" stroke-opacity=".18" stroke-width="16"/>'

def base(title, subtitle, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">{BG}{STYLE}
      <text x="38" y="42" class="micro">MADAR · LAUNCH ANATOMY</text>
      <text x="38" y="73" class="label" font-size="24">{escape(title)}</text><text x="38" y="95" class="small">{escape(subtitle)}</text>{body}</svg>'''

diagrams = []
# 0 integration
body = '''<g transform="translate(125 150)"><rect x="0" y="0" width="170" height="250" rx="12" fill="#0d211c" stroke="#315e50"/><path class="rocket" d="M85 25c20 18 25 42 25 75H60c0-33 5-57 25-75Z"/><rect class="dark" x="60" y="100" width="50" height="100"/><rect class="rocket" x="57" y="200" width="56" height="24"/></g>
<g transform="translate(395 145)"><rect x="0" y="0" width="290" height="78" rx="12" fill="#0d211c" stroke="#315e50"/><text x="20" y="31" class="micro">PAYLOAD ENVIRONMENT TEST</text><path class="line" d="M22 53h20l9-18 18 35 16-28 13 11h48"/><circle cx="230" cy="39" r="21" fill="#15382e" stroke="#72efc6"/><path class="line" d="m219 39 8 8 15-18"/></g>
<g transform="translate(395 250)"><rect width="290" height="150" rx="12" fill="#0d211c" stroke="#315e50"/><text x="20" y="30" class="micro">INTERFACE VERIFICATION</text><circle cx="65" cy="86" r="28" class="dark"/><circle cx="65" cy="86" r="13" fill="#081512" stroke="#72efc6"/><path class="dash" d="M100 86h65"/><rect x="165" y="58" width="78" height="56" rx="8" class="rocket"/><text x="20" y="135" class="small">mechanical · electrical · software</text></g>'''
diagrams.append(base("Launch campaign", "Integration, qualification and readiness reviews", body))
# 1 ignition
body = earth_horizon(455)+rocket(420,185,1.35,0,True)+'''<path d="M250 430H570" stroke="#516c63" stroke-width="8"/><path d="M305 440V155H330V440M520 440V135H545V440" stroke="#31584c" stroke-width="8"/><path d="M330 185H520M330 260H520M330 340H520" stroke="#31584c" stroke-width="5"/><g transform="translate(50 180)"><rect width="205" height="105" rx="12" fill="#0d211c" stroke="#315e50"/><text x="18" y="27" class="micro">IGNITION SEQUENCE</text><text x="18" y="57" class="label">Chamber pressure</text><path class="line" d="M18 86h40l20-48 25 48h70"/></g>'''
diagrams.append(base("Terminal count & ignition", "Thrust is verified before hold-down release", body))
# 2 liftoff
body = earth_horizon(470)+rocket(430,150,1.2,-16,True)+'''<path class="dash" d="M410 420Q380 285 520 145"/><path class="line" d="M415 370q70-30 108-86" marker-end="url(#a)"/><g transform="translate(70 170)"><text class="micro" y="0">GRAVITY TURN</text><path class="dash" d="M0 25h250"/><path d="m238 17 15 8-15 8" fill="none" stroke="#72efc6" stroke-width="2"/><text class="small" y="55">Build horizontal velocity gradually</text></g>'''
diagrams.append(base("Liftoff & pitch program", "Clear the tower, align the launch plane, start gravity turn", body))
#3 max q
body = rocket(450,160,1.2,-8,True)+earth_horizon(480)+'''<g opacity=".65"><path class="line" d="M700 170Q560 200 500 220M720 225Q570 245 500 255M705 280Q570 290 500 290M680 335Q555 325 495 320"/></g><g transform="translate(60 165)"><rect width="245" height="145" rx="12" fill="#0d211c" stroke="#315e50"/><text x="18" y="28" class="micro">DYNAMIC PRESSURE</text><text x="18" y="70" class="label">q = ½ ρ v²</text><path class="line" d="M18 116Q70 108 104 55Q142 121 218 115"/><circle cx="106" cy="55" r="5" class="coral"/><text x="123" y="58" class="small">MAX Q</text></g>'''
diagrams.append(base("Maximum dynamic pressure", "Peak coupled aerodynamic and structural loading", body))
#4 staging
body = earth_horizon(495)+rocket(455,110,.95,-12,True)+'''<g transform="translate(445 315) rotate(8)"><rect x="-25" y="0" width="50" height="100" class="rocket"/><path d="M-18 100Q0 140 18 100" fill="url(#flame)"/></g><path class="dash" d="M410 275l-80 65M480 275l95 50"/><path d="m342 329-16 13 20 1M560 320l18 8-15 11" fill="none" stroke="#72efc6" stroke-width="3"/><g transform="translate(50 165)"><text class="micro">SEPARATION DYNAMICS</text><text y="35" class="label">No recontact</text><text y="61" class="small">controlled relative velocity</text><text y="84" class="small">bounded tip-off rate</text></g>'''
diagrams.append(base("MECO & stage separation", "Discard dry mass and ignite the upper stage safely", body))
#5 fairing
body = earth_horizon(500)+'''<g transform="translate(430 200) rotate(-8)"><rect x="-25" y="65" width="50" height="170" class="dark"/><rect x="-19" y="18" width="38" height="54" rx="5" fill="#ffc857" stroke="#fff0ba"/><path class="rocket" d="M-28 75Q-120 30-70-45Q-25-20-25 75Z"/><path class="rocket" d="M28 75Q120 30 70-45Q25-20 25 75Z"/></g><path class="dash" d="M335 180l-85-52M530 180l85-52"/><g transform="translate(58 190)"><text class="micro">JETTISON CONDITIONS</text><text y="35" class="label">Heating ↓</text><text y="63" class="label">Aero load ↓</text><text y="91" class="label">Mass ↓</text></g>'''
diagrams.append(base("Payload fairing jettison", "Expose the payload only after the dense atmosphere", body))
#6 parking orbit
body = earth_horizon(430)+'''<path d="M120 390Q400 235 680 390" fill="none" stroke="#72efc6" stroke-width="3"/><g transform="translate(545 295) rotate(58)">'''+rocket(0,0,.55,0,True)+'''</g><path class="line" d="M515 280h125"/><path d="m630 271 18 9-18 9" fill="none" stroke="#ffc857" stroke-width="3"/><text x="518" y="260" class="micro">7.8 km/s TANGENTIAL</text><g transform="translate(55 175)"><rect width="260" height="110" rx="12" fill="#0d211c" stroke="#315e50"/><text x="17" y="27" class="micro">CIRCULAR ORBIT</text><text x="17" y="63" class="label">v = √( μ / r )</text><text x="17" y="88" class="small">Altitude alone is not orbit.</text></g>'''
diagrams.append(base("Parking orbit insertion", "The vehicle needs tangential velocity, not only altitude", body))
#7 transfer
body = earth_horizon(450)+'''<ellipse cx="400" cy="335" rx="285" ry="120" class="dash"/><ellipse cx="400" cy="335" rx="150" ry="64" class="line"/><circle cx="400" cy="335" r="55" fill="#153e34" stroke="#72efc6" stroke-width="2"/><circle cx="675" cy="305" r="8" class="gold"/><circle cx="255" cy="370" r="8" class="accent"/><path class="line" d="M265 360l50-28M665 295l-45-20"/><text x="150" y="190" class="micro">BURN 1 · RAISE APOGEE</text><text x="495" y="170" class="micro">BURN 2 · CIRCULARIZE</text>'''
diagrams.append(base("Restart & transfer orbit", "Timed burns reshape the orbit and its energy", body))
#8 deploy
body = earth_horizon(470)+'''<g transform="translate(500 245) rotate(16)"><rect x="-45" y="-24" width="90" height="48" rx="6" class="dark"/><path class="rocket" d="M45-18h80v36H45Z"/><circle cx="-15" cy="0" r="8" class="gold"/></g><g transform="translate(340 190) rotate(-12)"><rect x="-28" y="-22" width="56" height="44" rx="6" fill="#ffc857" stroke="#fff0ba"/><rect x="-110" y="-14" width="82" height="28" fill="#245987" stroke="#60cceb"/><rect x="28" y="-14" width="82" height="28" fill="#245987" stroke="#60cceb"/><path class="line" d="M0-22V-70"/><circle cy="-75" r="7" fill="#d9e9e3"/></g><path class="dash" d="M455 235Q405 208 375 202"/><path d="m390 191-18 10 16 13" fill="none" stroke="#72efc6" stroke-width="3"/><text x="70" y="185" class="micro">SEPARATION VELOCITY</text><text x="70" y="215" class="label">~ 0.5–2 m/s</text><text x="70" y="244" class="small">collision-free deployment</text>'''
diagrams.append(base("Payload deployment", "Release with controlled relative velocity and attitude", body))
#9 LEOP
body = earth_horizon(455)+'''<g transform="translate(440 190)"><rect x="-34" y="-25" width="68" height="50" rx="7" fill="#ffc857" stroke="#fff0ba"/><rect x="-150" y="-16" width="116" height="32" fill="#245987" stroke="#60cceb"/><rect x="34" y="-16" width="116" height="32" fill="#245987" stroke="#60cceb"/><path class="line" d="M0-25V-80"/><circle cy="-86" r="9" fill="#dcebe6"/></g><path d="M380 260Q250 320 200 440M500 260Q620 330 660 440" fill="none" stroke="#60cceb" stroke-width="2" stroke-dasharray="7 7"/><g transform="translate(170 420)"><path class="line" d="M0 35V0M-20 35h40M-28 0Q0-28 28 0M-18 2Q0-15 18 2"/></g><g transform="translate(635 420)"><path class="line" d="M0 35V0M-20 35h40M-28 0Q0-28 28 0M-18 2Q0-15 18 2"/></g><text x="52" y="175" class="micro">FIRST ACQUISITION</text><text x="52" y="207" class="label">Power positive</text><text x="52" y="235" class="label">Detumble</text><text x="52" y="263" class="label">Sun acquisition</text>'''
diagrams.append(base("LEOP & first contact", "Stabilize, deploy power systems, acquire telemetry", body))

for i, svg in enumerate(diagrams):
    (OUT / f"stage-{i}.svg").write_text(svg, encoding="utf-8")
print(f"wrote {len(diagrams)} diagrams to {OUT}")
