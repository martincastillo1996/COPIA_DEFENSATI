import os
import subprocess

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
OUTPUT_DIR = os.path.abspath("public/branding")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. NEURONAL GRAVITY - AVATAR (1080x1080)
ng_avatar_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <radialGradient id="ngBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0071e3" stop-opacity="0.35"/>
      <stop offset="45%" stop-color="#7928ca" stop-opacity="0.18"/>
      <stop offset="75%" stop-color="#04060a" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#04060a" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="ngBorderGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0071e3"/>
      <stop offset="50%" stop-color="#7928ca"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <filter id="ngGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="30" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="1080" height="1080" fill="#04060a"/>
  <rect width="1080" height="1080" fill="url(#ngBgGlow)"/>
  
  <!-- Outer Badge with Glow -->
  <g filter="url(#ngGlow)">
    <rect x="280" y="280" width="520" height="520" rx="140" ry="140" fill="url(#ngBorderGrad)"/>
  </g>
  
  <!-- Inner Badge Container -->
  <rect x="296" y="296" width="488" height="488" rx="124" ry="124" fill="#0a0d14"/>
  
  <!-- NG Text -->
  <text x="540" y="625" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        font-size="260" 
        font-weight="900" 
        letter-spacing="-12" 
        fill="#38bdf8" 
        text-anchor="middle">NG</text>
</svg>"""

with open(os.path.join(OUTPUT_DIR, "neuronal-gravity-avatar.svg"), "w", encoding="utf-8") as f:
    f.write(ng_avatar_svg)

# 2. NEURONAL GRAVITY - LOGO HORIZONTAL (1600x500)
ng_logo_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 500" width="1600" height="500">
  <defs>
    <radialGradient id="ngLogoGlow" cx="20%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#0071e3" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#7928ca" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#04060a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="ngBorderGradHoriz" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0071e3"/>
      <stop offset="50%" stop-color="#7928ca"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
    <filter id="ngGlowHoriz" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <rect width="1600" height="500" fill="#04060a"/>
  <rect width="1600" height="500" fill="url(#ngLogoGlow)"/>
  
  <!-- Badge -->
  <g filter="url(#ngGlowHoriz)">
    <rect x="100" y="110" width="280" height="280" rx="76" ry="76" fill="url(#ngBorderGradHoriz)"/>
  </g>
  <rect x="110" y="120" width="260" height="260" rx="66" ry="66" fill="#0a0d14"/>
  <text x="240" y="300" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        font-size="140" 
        font-weight="900" 
        letter-spacing="-6" 
        fill="#38bdf8" 
        text-anchor="middle">NG</text>
        
  <!-- Text Brand -->
  <text x="440" y="248" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        font-size="78" 
        font-weight="900" 
        letter-spacing="-2" 
        fill="#ffffff">NEURONAL GRAVITY</text>
        
  <text x="444" y="322" 
        font-family="'Consolas', 'Courier New', monospace" 
        font-size="28" 
        font-weight="500" 
        fill="#94a3b8">Soluciones Tecnológicas • RUC 10704877850</text>
</svg>"""

with open(os.path.join(OUTPUT_DIR, "neuronal-gravity-logo.svg"), "w", encoding="utf-8") as f:
    f.write(ng_logo_svg)

# 3. DEFENSA TI - AVATAR (1080x1080)
dt_avatar_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <radialGradient id="dtBgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0071e3" stop-opacity="0.32"/>
      <stop offset="45%" stop-color="#38bdf8" stop-opacity="0.12"/>
      <stop offset="80%" stop-color="#020408" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#020408" stop-opacity="1"/>
    </radialGradient>
    <linearGradient id="dtBadgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <filter id="dtGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="24" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <rect width="1080" height="1080" fill="#020408"/>
  <rect width="1080" height="1080" fill="url(#dtBgGlow)"/>
  
  <!-- Outer Squircle with Glow -->
  <g filter="url(#dtGlow)">
    <rect x="280" y="280" width="520" height="520" rx="140" ry="140" fill="url(#dtBadgeGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="4"/>
  </g>
  
  <!-- ShieldCheck Icon from Lucide -->
  <g transform="translate(395, 395) scale(12.0)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" fill="rgba(56,189,248,0.12)"/>
    <path d="m9 12 2 2 4-4" stroke="#38bdf8" stroke-width="2.2"/>
  </g>
</svg>"""

with open(os.path.join(OUTPUT_DIR, "defensa-ti-avatar.svg"), "w", encoding="utf-8") as f:
    f.write(dt_avatar_svg)

# 4. DEFENSA TI - LOGO HORIZONTAL (1600x500)
dt_logo_svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 500" width="1600" height="500">
  <defs>
    <radialGradient id="dtLogoGlow" cx="20%" cy="50%" r="40%">
      <stop offset="0%" stop-color="#0071e3" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#38bdf8" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#020408" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dtBadgeGradHoriz" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
    <filter id="dtGlowHoriz" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  
  <rect width="1600" height="500" fill="#020408"/>
  <rect width="1600" height="500" fill="url(#dtLogoGlow)"/>
  
  <!-- Squircle Shield -->
  <g filter="url(#dtGlowHoriz)">
    <rect x="100" y="110" width="280" height="280" rx="76" ry="76" fill="url(#dtBadgeGradHoriz)" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>
  </g>
  
  <!-- ShieldCheck Icon -->
  <g transform="translate(162, 172) scale(6.5)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" fill="rgba(56,189,248,0.12)"/>
    <path d="m9 12 2 2 4-4" stroke="#38bdf8" stroke-width="2.2"/>
  </g>
  
  <!-- Text Brand -->
  <text x="440" y="240" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        font-size="86" 
        font-weight="900" 
        letter-spacing="-2" 
        fill="#ffffff">DEFENSA TI</text>
        
  <text x="444" y="312" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" 
        font-size="34" 
        font-weight="600" 
        letter-spacing="0" 
        fill="#38bdf8">Blindaje &amp; Ciberseguridad Web</text>
        
  <text x="445" y="358" 
        font-family="'Consolas', 'Courier New', monospace" 
        font-size="20" 
        font-weight="500" 
        fill="#64748b">Neuronal Gravity • RUC 10704877850</text>
</svg>"""

with open(os.path.join(OUTPUT_DIR, "defensa-ti-logo.svg"), "w", encoding="utf-8") as f:
    f.write(dt_logo_svg)

print("SVG files generated successfully.")
