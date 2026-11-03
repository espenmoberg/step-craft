"""
Geometri for utetrapp med lukkede endevanger (trinn på klosser mellom vangene).
Alle mål i mm. Endre parametrene øverst og kjør: python3 trappegeometri.py

Koordinater: x vannrett (oppover trappa), y loddrett. Hellene nederst: y = 0.
Trinnese nr. 1 ligger i x = 0. Opptrinn r = H / n.
Vangens kappmål oppgis i brettkoordinater:
  u = avstand langs vangens overkant, målt fra brettets rette ende (nederst)
  v = avstand ned fra overkant, vinkelrett på kanten
Punkter (som i vangetegningen):
  A = tåpunkt på enden, B = lodd kapp møter overkant, C = fot møter underkant
  H = hæl (lodd) møter underkant, G = innerhjørne sete, F = sete møter underkant,
  E = endekapp møter overkant (toppen)
"""
import math

# ---------------- PARAMETRE ----------------
H    = 2110   # total høyde, helle nederst til toppflate (målt 2110; tegningen i dokumentet bruker 2127)
n    = 13     # antall opptrinn (13 passer nye mål; dokumentet har 12)
g    = 283    # inntrinn (nese til nese). 283 treffer målt diagonal A-F = 4015
d    = 300    # trinndybde (2 x 48x148 + 4 fuge = 300; 48x148 + 48x98 = 250)
W    = 198    # vangehøyde (48x198)
t    = 5      # trinnese under vangens overkant
FRONT= 100    # høyde på lodd kapp foran ved foten
SEAT = 150    # setelengde vannrett øverst
KL   = 200    # klosslengde, fra nesa og bakover, 48 høy
# -------------------------------------------

r=H/n; NT=n-1
th=math.atan(r/g); s=math.sin(th); c=math.cos(th); k=math.tan(th)
ytop=lambda x: r+k*x+t/c
ybot=lambda x: ytop(x)-W/c
nose=lambda x: r+k*x
xf=(FRONT-ytop(0))/k
xb0=(0-ybot(0))/k
xe=(NT-1)*g+d
ys=ybot(xe); xB=xe-SEAT
def bc0(x,y): return ((x-xf)*c+(y-FRONT)*s,(ytop(x)-y)*c)
U0=bc0(xf,0)[0]
def bc(x,y):
    u,v=bc0(x,y); return (u-U0,v)
P=dict(A=bc(xf,0),B=bc(xf,FRONT),C=bc(xb0,0),H=bc(xB,ybot(xB)),G=bc(xB,ys),F=bc(xe,ys),E=bc(xe,ytop(xe)))

print(f"Opptrinn {n} x {r:.1f}  Inntrinn {NT} x {g}  Stigning {math.degrees(th):.1f} grader")
print(f"Trappeformel 2r+g = {2*r+g:.0f} (anbefalt 600-640)")
print(f"Vangelengde (u fra A til E): {P['E'][0]:.0f} mm")
print(f"Diagonal A-F: {math.hypot(P['F'][0]-P['A'][0],P['F'][1]-P['A'][1]):.0f} mm")
print(f"Vannrett tå -> vangens toppende: {xe-xf:.0f} mm, vannrett A -> F: {xe-xf:.0f} mm")
print(f"Setet (F-G) ligger {H-ys:.0f} mm under toppflaten")
print(f"Plass i vangen: trinn trenger {d*s+48*c+t:.0f} mm, kloss {KL*s+96*c+t:.0f} mm av {W}")
print("Kappunkter (u, v):")
for kk in 'A B C H G F E'.split(): print(f"  {kk}: u {P[kk][0]:.0f}, v {P[kk][1]:.0f}")
print("Trinnesepunkter (u langs strek t mm under overkant):",[round(bc((i-1)*g,i*r)[0]) for i in range(1,NT+1)])
print(f"Mal: rettvinklet trekant {g} x {r:.1f}, hypotenus {math.hypot(g,r):.1f}")
print(f"Lodd kapp {90-math.degrees(th):.1f} grader mot langsiden, vannrett kapp {math.degrees(th):.1f} grader")
