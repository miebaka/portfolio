from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth
from pathlib import Path
import math

OUT = Path(__file__).with_name("KLAT_Editorial_Layout_Atlas_V3.pdf")
W, H = landscape(A4)
PAPER = HexColor("#F4F0E8")
INK = HexColor("#161616")
RED = HexColor("#F0442D")
COBALT = HexColor("#2349E8")
ACID = HexColor("#D7FF36")
PINK = HexColor("#F3A7B8")
SKY = HexColor("#A7D6E8")
TAN = HexColor("#C7A879")
MINT = HexColor("#95CDAA")
GREY = HexColor("#A7A5A0")
PALE = HexColor("#E5DFD4")

fonts = {
    "KSans": "/System/Library/Fonts/Supplemental/Arial.ttf",
    "KHeavy": "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "KSerif": "/Users/mac/Library/Fonts/EBGaramond-Regular.ttf",
    "KSerifB": "/Users/mac/Library/Fonts/EBGaramond-Bold.ttf",
    "KMono": "/System/Library/Fonts/Supplemental/Courier New.ttf",
}
for name, path in fonts.items():
    pdfmetrics.registerFont(TTFont(name, path))


def bg(c, color=PAPER):
    c.setFillColor(color); c.rect(0, 0, W, H, fill=1, stroke=0)


def text(c, s, x, y, font="KSans", size=8, color=INK, align="left"):
    c.setFont(font, size); c.setFillColor(color)
    if align == "center": c.drawCentredString(x, y, s)
    elif align == "right": c.drawRightString(x, y, s)
    else: c.drawString(x, y, s)


def lines(c, x, y, w, n, step=6, color=INK, seed=0):
    c.setStrokeColor(color); c.setLineWidth(.45)
    lengths = [.97,.83,.91,.68,.95,.88,.76,.99,.61]
    for i in range(n):
        c.line(x, y-i*step, x+w*lengths[(i+seed)%len(lengths)], y-i*step)


def photo(c, x, y, w, h, tone=0, dark=False, label="IMAGE"):
    colors = [(HexColor("#BFC3BE"),HexColor("#7F8986")),(HexColor("#D4B7A3"),HexColor("#8D675B")),(HexColor("#9CB8C9"),HexColor("#546C7B")),(HexColor("#C5B79C"),HexColor("#82745E")),(HexColor("#B1A3C8"),HexColor("#665B75"))]
    a,b=colors[tone%len(colors)]
    c.saveState()
    clip=c.beginPath(); clip.rect(x,y,w,h); c.clipPath(clip,stroke=0)
    c.linearGradient(x,y,x+w,y+h,[b if dark else a, HexColor("#202020") if dark else b],positions=[0,1],extend=True)
    c.restoreState()
    c.saveState(); c.setStrokeColor(Color(1,1,1,alpha=.45) if dark else Color(0,0,0,alpha=.16)); c.setLineWidth(.8)
    # Abstract fashion figure / photographic energy.
    if tone%5==0:
        c.setFillColor(Color(0.08,0.08,0.08,alpha=.25) if not dark else Color(1,1,1,alpha=.18))
        c.circle(x+w*.51,y+h*.72,min(w,h)*.08,fill=1,stroke=0)
        p=c.beginPath(); p.moveTo(x+w*.51,y+h*.64); p.curveTo(x+w*.32,y+h*.54,x+w*.34,y+h*.24,x+w*.39,y+h*.10); p.lineTo(x+w*.67,y+h*.10); p.curveTo(x+w*.69,y+h*.27,x+w*.70,y+h*.55,x+w*.51,y+h*.64); p.close(); c.drawPath(p,fill=1,stroke=0)
    elif tone%5==1:
        for q in range(5): c.line(x+w*(.12+q*.16),y,x+w*(.38+q*.1),y+h)
    elif tone%5==2:
        c.circle(x+w*.35,y+h*.56,min(w,h)*.23,fill=0); c.circle(x+w*.65,y+h*.42,min(w,h)*.16,fill=0)
    elif tone%5==3:
        c.line(x,y+h*.2,x+w,y+h*.82); c.line(x+w*.2,y,x+w*.82,y+h)
    else:
        for q in range(4): c.rect(x+w*(.08+q*.22),y+h*(.12+(q%2)*.14),w*.13,h*.62,fill=0,stroke=1)
    c.restoreState(); text(c,label,x+w/2,y+h/2-3,"KHeavy",max(5,min(10,h/14)),white if dark else HexColor("#625F5A"),"center")


def rule(c,x1,y1,x2,y2,color=INK,width=.6):
    c.setStrokeColor(color); c.setLineWidth(width); c.line(x1,y1,x2,y2)


def meta(c, idx, name, ratio, mood):
    text(c,f"KLAT / {idx:02d}",25,15,"KHeavy",7,INK)
    text(c,name,W/2,15,"KSerifB",9,INK,"center")
    text(c,f"{ratio}  ·  {mood}",W-25,15,"KHeavy",7,INK,"right")


def crop_mark(c):
    rule(c,W/2,30,W/2,H-25,Color(0,0,0,alpha=.18),.5)


SPREADS = [
    ("COVER STORY COLLISION","70:30","DAZED / FASHION"),
    ("PAPARAZZI RUN","70:30","PEOPLE / SPEED"),
    ("THE GIANT INITIAL","60:40","CLASSIC / DRAMA"),
    ("DIAGONAL ARGUMENT","70:30","FASHION / TENSION"),
    ("THE NEWSROOM MOSAIC","60:40","EW / INFORMATION"),
    ("CINEMA CREDITS","70:30","FILM / ATMOSPHERE"),
    ("POSTER IN THE GUTTER","70:30","EXPERIMENTAL"),
    ("THE VERTICAL INDEX","60:40","SERVICE / FASHION"),
    ("INTERVIEW ORBIT","60:40","CONVERSATION"),
    ("THE PROOF SHEET","70:30","BACKSTAGE"),
    ("TYPE BEHIND THE BODY","70:30","DAZED / ICON"),
    ("THE EDITOR'S DESK","60:40","ARCHIVE / TACTILE"),
    ("THEN / NOW FLIP","60:40","CELEBRITY / TIME"),
    ("RED CARPET DOSSIER","60:40","PEOPLE / SERVICE"),
    ("GUTTER CASCADE","70:30","MOTION / BEAUTY"),
    ("MICRO / MACRO","70:30","COUTURE / DETAIL"),
    ("CALENDAR OF LOOKS","60:40","EW / ROUNDUP"),
    ("QUOTE AVALANCHE","60:40","VOICE / ATTITUDE"),
    ("EDGE TABS","70:30","SECTION OPENER"),
    ("THE PAUSE","70:30","PORTRAIT / SILENCE"),
    ("PANORAMIC FOLDOUT","70:30","LOCATION / SCALE"),
    ("THE LENS","60:40","BEAUTY / FOCUS"),
    ("FOOTNOTE CONSTELLATION","60:40","CULTURE / ESSAY"),
    ("END CREDITS","70:30","CLOSING / CINEMA"),
]

SCORES = [
    (78,76,91,90,"Rebuilt image/type collision around one visual question"),(84,82,93,92,"Tightened cadence and changed every frame proportion"),
    (91,87,96,94,"Refined initial-to-image counterweight"),(86,83,94,92,"Sharpened diagonal as argument, not decoration"),
    (79,77,90,89,"Rebuilt mosaic with editorial hierarchy"),(88,86,95,94,"Reduced credits to a cinematic rhythm"),
    (87,81,94,91,"Made the gutter a physical poster object"),(80,79,91,90,"Turned list into a decisive vertical instrument"),
    (92,87,96,94,"Balanced orbit with calmer reading zones"),(83,81,92,91,"Promoted one selected frame; reduced sameness"),
    (93,84,97,93,"Improved figure anatomy and word interruption"),(89,86,95,94,"Refined overlap, shadow, and tactile hierarchy"),
    (81,78,91,90,"Made time the visible structure"),(78,76,90,89,"Rebuilt service copy as a true dossier"),
    (90,85,95,93,"Varied cascade scale and protected the gutter"),(91,88,96,95,"Deepened macro/micro contrast"),
    (80,78,91,90,"Established a monthly rhythm with one focal week"),(88,82,95,92,"Reduced quote field to four controlled impacts"),
    (82,80,92,91,"Made tabs navigational and chromatically ordered"),(87,84,95,94,"Increased silence and corrected portrait proportion"),
    (84,82,93,92,"Made the fold physically legible"),(91,85,96,93,"Balanced optical novelty with an editorial anchor"),
    (92,86,97,94,"Clarified evidence lines and reading sequence"),(82,79,92,91,"Turned credits into a formal closing scene"),
]


def spread(c, n):
    name,ratio,mood=SPREADS[n-1]
    bg(c)
    if n==1:
        photo(c,0,36,W,H-36,0,True)
        text(c,"KLAT",32,H-64,"KHeavy",66,white)
        text(c,"THE NEW",W-34,H-86,"KHeavy",26,ACID,"right")
        text(c,"FORM",W-34,H-116,"KHeavy",26,ACID,"right")
        c.setFillColor(RED); c.rect(38,68,245,122,fill=1,stroke=0)
        text(c,"WHO GETS TO DEFINE",56,157,"KHeavy",15,white); text(c,"WHAT FASHION BECOMES?",56,138,"KHeavy",15,white)
        lines(c,56,112,180,7,6,white)
    elif n==2:
        c.setFillColor(ACID); c.rect(0,36,W,42,fill=1,stroke=0)
        widths=[145,116,175,109,185]
        x=22
        for i,w in enumerate(widths):
            photo(c,x,104,w,365-(i%2)*55,i+1,i%3==0)
            text(c,f"0{i+1}",x+8,116,"KHeavy",18,white)
            x+=w+10
        text(c,"SEEN.",26,H-56,"KHeavy",44,INK); text(c,"EVERYWHERE.",W-25,H-56,"KHeavy",44,INK,"right")
        text(c,"ONE NIGHT / FIVE FRAMES / NO POSED ARRIVALS",28,54,"KMono",9,INK)
    elif n==3:
        photo(c,W*.43,36,W*.57,H-36,2,False)
        text(c,"K",28,102,"KSerifB",360,RED)
        c.setFillColor(white); c.rect(93,92,268,190,fill=1,stroke=0)
        text(c,"THE SHAPE",112,250,"KSerifB",26,INK); text(c,"OF ARRIVAL",112,220,"KSerifB",26,INK)
        lines(c,114,190,210,14,7,INK)
    elif n==4:
        c.saveState(); p=c.beginPath(); p.moveTo(0,36); p.lineTo(W*.68,36); p.lineTo(W*.38,H); p.lineTo(0,H); p.close(); c.clipPath(p,stroke=0); photo(c,0,36,W,H-36,3,True); c.restoreState()
        c.setFillColor(COBALT); p=c.beginPath(); p.moveTo(W*.68,36); p.lineTo(W,36); p.lineTo(W,H); p.lineTo(W*.38,H); p.close(); c.drawPath(p,fill=1,stroke=0)
        text(c,"PRETTY / UGLY",W*.50,H-82,"KHeavy",32,ACID)
        lines(c,W*.57,H-124,W*.34,22,8,white)
        text(c,"TWO READINGS. ONE LOOK.",W-30,62,"KMono",9,white,"right")
    elif n==5:
        text(c,"THIS WEEK",26,H-50,"KHeavy",38,RED); text(c,"12 THINGS WORTH KNOWING",W-26,H-49,"KSerifB",25,INK,"right")
        cells=[(28,330,245,165),(287,330,155,165),(456,330,358,165),(28,102,175,210),(217,102,300,210),(531,102,283,210)]
        for i,(x,y,w,h) in enumerate(cells):
            photo(c,x,y+h*.37,w,h*.63,i)
            text(c,f"0{i+1}",x,y+h*.27,"KHeavy",15,RED); lines(c,x+28,y+h*.28,w-34,5,7,INK,i)
    elif n==6:
        bg(c,INK); photo(c,0,160,W,435,4,True)
        text(c,"A FILM BY",32,132,"KMono",8,white); text(c,"KLAT",32,86,"KSerifB",42,white)
        credits=["CAST / THE CLOTHES","CAMERA / THE CITY","SOUND / AFTER MIDNIGHT"]
        for i,s in enumerate(credits): text(c,s,W-34,128-i*22,"KMono",8,PALE,"right")
        text(c,"COMING SOON",W/2,49,"KHeavy",10,RED,"center")
    elif n==7:
        photo(c,20,36,W-40,H-64,1,False)
        c.setFillColor(RED); c.rect(W/2-70,36,140,H-64,fill=1,stroke=0)
        text(c,"PULL",W/2,H-150,"KHeavy",34,white,"center"); text(c,"OUT",W/2,H-190,"KHeavy",34,white,"center")
        text(c,"POSTER",W/2,74,"KMono",10,white,"center")
        c.saveState(); c.translate(46,H*.46); c.rotate(90); text(c,"THE IMAGE CONTINUES BEHIND THE INSERT",0,0,"KMono",8,INK); c.restoreState()
    elif n==8:
        photo(c,0,36,W*.36,H-36,0,True)
        c.setFillColor(white); c.rect(W*.36,36,W*.64,H-36,fill=1,stroke=0)
        text(c,"THE",W*.39,H-68,"KSerifB",34,INK); text(c,"ESSENTIAL",W*.39,H-102,"KSerifB",34,INK); text(c,"LIST",W*.39,H-136,"KSerifB",34,INK)
        x=W*.60
        for i in range(8):
            y=H-70-i*55; text(c,f"{i+1:02d}",x,y,"KHeavy",18,RED); lines(c,x+40,y+2,W-x-64,4,6,INK,i); rule(c,x,y-26,W-28,y-26,PALE)
    elif n==9:
        text(c,"IN CONVERSATION",W/2,H-48,"KMono",9,RED,"center")
        photo(c,50,242,220,220,2); photo(c,W-270,90,220,220,3)
        c.setStrokeColor(COBALT); c.setLineWidth(2); c.circle(W/2,H/2,108,fill=0,stroke=1); c.circle(W/2,H/2,142,fill=0,stroke=1)
        text(c,"Q",W/2,H/2+44,"KSerifB",54,COBALT,"center"); text(c,"A",W/2,H/2-58,"KSerifB",54,RED,"center")
        lines(c,298,420,240,7,7,INK); lines(c,305,116,230,7,7,INK,3)
    elif n==10:
        bg(c,HexColor("#E8E3D8")); text(c,"CONTACT / 24",25,H-42,"KMono",9,INK)
        for r in range(3):
            for q in range(6):
                x=28+q*132; y=79+(2-r)*145
                photo(c,x,y,118,118,r+q,False,"")
                text(c,f"{r+1}.{q+1}  1/{80+q*20}",x,y-12,"KMono",5.5,INK)
        c.setFillColor(RED); c.rect(421,206,132,145,fill=0,stroke=1)
        text(c,"SELECT",487,214,"KHeavy",8,RED,"center")
    elif n==11:
        bg(c,COBALT); text(c,"UNTAMED",W/2,H*.46,"KHeavy",108,ACID,"center")
        c.setFillColor(HexColor("#987762")); c.circle(W/2,H*.57,75,fill=1,stroke=0); c.roundRect(W/2-105,68,210,350,80,fill=1,stroke=0)
        text(c,"THE BODY INTERRUPTS THE WORD",W/2,48,"KMono",8,white,"center")
    elif n==12:
        bg(c,HexColor("#B88B5F")); c.setFillColor(HexColor("#8B6849")); c.circle(95,480,45,fill=1,stroke=0)
        cards=[(110,280,220,250,-8),(335,210,190,240,5),(525,265,230,220,-5)]
        for i,(x,y,w,h,a) in enumerate(cards):
            c.saveState(); c.translate(x+w/2,y+h/2); c.rotate(a); c.setFillColor(white); c.rect(-w/2,-h/2,w,h,fill=1,stroke=0); photo(c,-w/2+12,-h/2+45,w-24,h-64,i); text(c,["NOTE 01","ARCHIVE","TO WEAR"] [i],-w/2+15,-h/2+20,"KMono",7,INK); c.restoreState()
        text(c,"THE EDITOR'S DESK",28,57,"KSerifB",26,white)
    elif n==13:
        photo(c,0,36,W/2,H-36,3,False); photo(c,W/2,36,W/2,H-36,3,True)
        c.setFillColor(white); c.circle(W/2,H/2,54,fill=1,stroke=0); text(c,"↔",W/2,H/2-15,"KHeavy",42,RED,"center")
        text(c,"THEN",28,H-55,"KHeavy",28,white); text(c,"NOW",W-28,H-55,"KHeavy",28,white,"right")
        c.setFillColor(white); c.rect(28,62,235,92,fill=1,stroke=0); lines(c,44,132,190,8,7,INK)
    elif n==14:
        bg(c,white); c.setFillColor(RED); c.rect(0,36,160,H-36,fill=1,stroke=0); text(c,"THE",80,H-88,"KHeavy",28,white,"center"); text(c,"LOOK",80,H-120,"KHeavy",28,white,"center")
        photo(c,180,90,310,455,1); text(c,"WHO / WHAT / WHY",520,H-52,"KMono",8,RED)
        items=[("01","SILHOUETTE"),("02","COLOUR"),("03","REFERENCE"),("04","VERDICT")]
        for i,(num,lab) in enumerate(items):
            y=H-100-i*96; text(c,num,520,y,"KHeavy",22,INK); text(c,lab,570,y+4,"KHeavy",10,INK); lines(c,570,y-12,225,6,6,INK,i)
    elif n==15:
        bg(c,INK); crop_mark(c)
        sizes=[(W/2-205,385,180,150),(W/2+25,328,128,180),(W/2-145,150,170,185),(W/2+47,82,220,210)]
        for i,(x,y,w,h) in enumerate(sizes): photo(c,x,y,w,h,i,False)
        text(c,"FALL",28,H-55,"KSerifB",50,white); text(c,"THROUGH",W-28,56,"KSerifB",50,white,"right")
        lines(c,28,128,180,10,7,PALE)
    elif n==16:
        photo(c,0,36,W*.69,H-36,4,True)
        for i,(x,y,s) in enumerate([(W*.73,390,115),(W*.80,245,86),(W*.70,95,130)]):
            c.setFillColor(white); c.circle(x+s/2,y+s/2,s/2+6,fill=1,stroke=0); photo(c,x,y,s,s,i,False,"DETAIL")
        text(c,"CLOSE ENOUGH TO SEE THE HAND",28,58,"KHeavy",14,white)
    elif n==17:
        text(c,"30 DAYS / 30 LOOKS",28,H-48,"KHeavy",34,INK); text(c,"SEPTEMBER",W-28,H-46,"KMono",10,RED,"right")
        for r in range(4):
            for q in range(8):
                x=28+q*98; y=75+(3-r)*105
                if r*8+q<30:
                    photo(c,x,y,82,76,r+q,False,""); text(c,f"{r*8+q+1:02d}",x,y-11,"KHeavy",6,INK)
        c.setFillColor(ACID); c.rect(320,180,180,118,fill=1,stroke=0); text(c,"WEEK 03",410,259,"KHeavy",15,INK,"center"); lines(c,344,237,132,8,7,INK)
    elif n==18:
        bg(c,PINK); quotes=[("I DRESSED",32,480,42,INK),("FOR THE",165,400,58,white),("LIFE I",420,294,72,INK),("WANTED.",110,170,88,RED)]
        for s,x,y,z,col in quotes: text(c,s,x,y,"KHeavy",z,col)
        photo(c,610,285,180,250,0,True)
        c.setFillColor(white); c.rect(540,65,250,115,fill=1,stroke=0); lines(c,560,150,205,11,7,INK)
    elif n==19:
        photo(c,0,36,W-72,H-36,2,True)
        tabs=[("PROFILE",RED),("STYLE",COBALT),("WORK",ACID),("LIFE",PINK)]
        th=(H-36)/4
        for i,(s,col) in enumerate(tabs):
            c.setFillColor(col); c.rect(W-72,36+(3-i)*th,72,th,fill=1,stroke=0)
            c.saveState(); c.translate(W-36,36+(3-i)*th+th/2); c.rotate(90); text(c,s,0,-3,"KHeavy",9,INK if col==ACID else white,"center"); c.restoreState()
        c.setFillColor(white); c.rect(30,75,200,106,fill=1,stroke=0); text(c,"ENTER",48,148,"KSerifB",25,INK); lines(c,50,122,150,7,6,INK)
    elif n==20:
        bg(c,white); photo(c,W*.56,105,240,345,0,False)
        text(c,"SPACE",34,H-72,"KSerifB",62,INK); text(c,"TO BE",34,H-130,"KSerifB",62,INK); text(c,"SEEN",34,H-188,"KSerifB",62,INK)
        lines(c,38,180,270,15,7,INK)
        text(c,"PORTRAIT  /  NO. 08",W-34,72,"KMono",8,RED,"right")
    elif n==21:
        photo(c,0,122,W,H-122,3,True); crop_mark(c)
        c.setFillColor(ACID); c.rect(0,36,W,86,fill=1,stroke=0)
        text(c,"THE ROAD KEEPS GOING",26,70,"KHeavy",30,INK)
        text(c,"OPEN AS A FOUR-PAGE FOLDOUT",W-28,73,"KMono",8,INK,"right")
        for x in [W*.25,W*.75]: rule(c,x,122,x,H,Color(1,1,1,alpha=.45),.5)
    elif n==22:
        bg(c,COBALT); c.setFillColor(white); c.circle(W*.38,H*.54,205,fill=1,stroke=0); photo(c,W*.38-190,H*.54-190,380,380,2,False,"")
        c.setFillColor(COBALT); c.circle(W*.38,H*.54,72,fill=1,stroke=0); text(c,"FOCUS",W*.38,H*.54-10,"KHeavy",22,ACID,"center")
        text(c,"THE",W*.70,H-95,"KSerifB",38,white); text(c,"BEAUTY",W*.70,H-135,"KSerifB",38,white); text(c,"ISSUE",W*.70,H-175,"KSerifB",38,white)
        lines(c,W*.70,360,190,18,7,white)
    elif n==23:
        bg(c,white); photo(c,280,146,280,300,4,False)
        points=[(90,470,"01"),(655,480,"02"),(740,300,"03"),(630,95,"04"),(120,115,"05"),(65,290,"06")]
        for i,(x,y,num) in enumerate(points):
            c.setFillColor([RED,COBALT,INK][i%3]); c.circle(x,y,18,fill=1,stroke=0); text(c,num,x,y-3,"KHeavy",7,white,"center")
            rule(c,x+18 if x<W/2 else x-18,y,280 if x<W/2 else 560,295,Color(0,0,0,alpha=.35),.5)
            lines(c,x-30 if x<W/2 else x-90,y-32,120,4,6,INK,i)
        text(c,"EVERY DETAIL HAS A SOURCE",W/2,H-48,"KHeavy",20,INK,"center")
    elif n==24:
        bg(c,INK); photo(c,0,36,W*.62,H-36,1,True)
        c.setFillColor(RED); c.rect(W*.62,36,W*.38,H-36,fill=1,stroke=0)
        text(c,"THE END",W*.81,H-70,"KSerifB",38,white,"center")
        roles=["PHOTOGRAPHY","STYLING","WORDS","CAST","HAIR","MAKE-UP","PRODUCTION","THANK YOU"]
        for i,s in enumerate(roles):
            y=H-125-i*43; text(c,s,W*.66,y,"KMono",7,INK); text(c,"NAME SURNAME",W-28,y,"KHeavy",8,white,"right")
        text(c,"NEXT ISSUE / 02",W*.81,61,"KMono",9,INK,"center")
    crop_mark(c); meta(c,n,name,ratio,mood)


def cover(c):
    bg(c,INK); c.setFillColor(RED); c.rect(0,0,W*.36,H,fill=1,stroke=0)
    text(c,"KLAT",36,H-80,"KHeavy",64,white)
    text(c,"EDITORIAL",36,H-140,"KHeavy",32,INK); text(c,"LAYOUT",36,H-174,"KHeavy",32,INK); text(c,"ATLAS",36,H-208,"KHeavy",32,INK)
    for i in range(5): photo(c,W*.41+i*65,64,56,H-116,i,False,"")
    text(c,"24 SPREADS / CASEY + LOEWY REFINED EDITION",W-32,34,"KMono",9,white,"right")


def method(c):
    bg(c); text(c,"THE RESET",30,H-58,"KHeavy",11,RED); text(c,"Difference must be visible",30,H-105,"KSerifB",40,INK); text(c,"before it is explained.",30,H-148,"KSerifB",40,INK)
    tests=[("SILHOUETTE","Does the spread make a different shape at thumbnail size?"),("PATH","Does the eye travel in a different order?"),("COUNT","Does the number and scale of images change?"),("GUTTER","Is the centre fold used differently?"),("TEXT","Is copy a block, rail, caption, orbit, list, or interruption?"),("TEMPO","Does it create a new speed in the issue?")]
    y=H-210
    for i,(h,b) in enumerate(tests):
        x=30+(i%3)*265
        if i==3: y-=135
        c.setFillColor([RED,COBALT,ACID][i%3]); c.circle(x+12,y+12,12,fill=1,stroke=0); text(c,f"{i+1}",x+12,y+9,"KHeavy",7,INK if i%3==2 else white,"center")
        text(c,h,x+34,y+15,"KHeavy",9,INK); lines(c,x+34,y-2,195,5,7,INK,i)
    text(c,"Reference behaviours: Dazed = confrontation and youth-culture energy. People = emotional access and fast navigation. EW = entertainment hierarchy, lists, ensembles, and service information. Cool independent editorial = permission to treat type, sequence, and material as image.",30,62,"KSans",7.8,INK)


def index(c):
    bg(c,white); text(c,"24 FORMS",28,H-52,"KHeavy",38,INK)
    for i,(name,ratio,mood) in enumerate(SPREADS):
        col=i//12; row=i%12; x=28+col*398; y=H-92-row*42
        text(c,f"{i+1:02d}",x,y,"KHeavy",9,RED); text(c,name,x+30,y,"KSerifB",10,INK); text(c,ratio,x+350,y,"KMono",7,COBALT,"right")
        rule(c,x,y-10,x+350,y-10,PALE)


def score_page(c, start, end):
    bg(c, white)
    text(c,"CASEY × LOEWY REVIEW",28,H-46,"KHeavy",10,RED)
    text(c,f"Scores {start+1:02d}–{end:02d}",28,H-84,"KSerifB",32,INK)
    text(c,"Judgment scores summarize visual critique; they are not objective measurements.",W-28,H-52,"KMono",6.5,GREY,"right")
    y=H-124
    text(c,"NO.",28,y,"KHeavy",6.5,GREY); text(c,"LAYOUT",60,y,"KHeavy",6.5,GREY)
    text(c,"CASEY",318,y,"KHeavy",6.5,RED); text(c,"LOEWY",405,y,"KHeavy",6.5,COBALT); text(c,"ACTION APPLIED",492,y,"KHeavy",6.5,GREY)
    y-=22
    for i in range(start,end):
        before_c,before_l,after_c,after_l,action=SCORES[i]
        name=SPREADS[i][0]
        text(c,f"{i+1:02d}",28,y,"KHeavy",8,RED)
        text(c,name,60,y,"KSerifB",9,INK)
        text(c,f"{before_c} → {after_c}",318,y,"KHeavy",8,RED)
        text(c,f"{before_l} → {after_l}",405,y,"KHeavy",8,COBALT)
        text(c,action,492,y,"KSans",6.8,INK)
        rule(c,28,y-11,W-28,y-11,PALE,.5)
        y-=30
    c.setFillColor(PAPER); c.rect(28,38,W-56,42,fill=1,stroke=0)
    text(c,"CASEY",44,64,"KHeavy",7,RED); text(c,"idea, compression, subject-specific form, type as meaning",95,64,"KSans",7,INK)
    text(c,"LOEWY",44,48,"KHeavy",7,COBALT); text(c,"clarity, proportion, craft, restraint, and MAYA calibration",95,48,"KSans",7,INK)


def verdict_page(c):
    bg(c,INK)
    text(c,"FINAL VERDICT",32,H-48,"KHeavy",9,ACID)
    text(c,"SHIP THE SYSTEM.",32,H-108,"KSerifB",48,white)
    text(c,"Then art-direct every photograph.",32,H-151,"KSerif",28,PALE)
    c.setFillColor(RED); c.rect(32,88,226,250,fill=1,stroke=0)
    text(c,"CASEY",50,308,"KHeavy",9,white); text(c,"93.6",50,230,"KSerifB",72,white)
    text(c,"CLEAR",50,192,"KHeavy",12,INK)
    lines(c,50,168,165,10,7,white)
    c.setFillColor(COBALT); c.rect(278,88,226,250,fill=1,stroke=0)
    text(c,"LOEWY",296,308,"KHeavy",9,white); text(c,"92.0",296,230,"KSerifB",72,white)
    text(c,"SHIP",296,192,"KHeavy",12,ACID)
    lines(c,296,168,165,10,7,white)
    text(c,"ONE RULE",558,315,"KHeavy",8,ACID)
    text(c,"A spread earns",558,275,"KSerifB",25,white)
    text(c,"difference only",558,246,"KSerifB",25,white)
    text(c,"when its form",558,217,"KSerifB",25,white)
    text(c,"belongs to the",558,188,"KSerifB",25,white)
    text(c,"story.",558,159,"KSerifB",25,white)
    text(c,"High confidence in formal differentiation.",558,105,"KSans",7,PALE)
    text(c,"Photography, binding, colour proofing,",558,93,"KSans",7,PALE)
    text(c,"and reader testing remain outside this review.",558,81,"KSans",7,PALE)


def refs(c):
    bg(c); text(c,"REFERENCE TRAIL",30,H-52,"KHeavy",10,RED); text(c,"Looked at for behaviour,",30,H-95,"KSerifB",35,INK); text(c,"never copied as trade dress.",30,H-132,"KSerifB",35,INK)
    refs=[
      ("DAZED","Radical fashion and youth-culture positioning; art direction and storyboarding.","https://www.dazedmedia.com/brands/dazed","https://www.dazeddigital.com/fashion/article/55490/1/dazed-making-it-up-as-we-go-along-masterclass-gareth-wrighton"),
      ("PEOPLE","Human access, recognisable faces, emotional headlines, timelines, dossiers, and multi-image navigation.","https://people.com/","https://sva.design/projects/17054/people-magazine-redesign/"),
      ("ENTERTAINMENT WEEKLY","Ensemble coverage, rankings, service modules, cinematic framing, and information density.","https://ew.com/","https://www.spd.org/entertainment-weeklys-redesign-with-executive-editor-creative-director-tim-leong-and-design-director-jennie-chang/"),
      ("CONTEMPORARY EDITORIAL","Experimental type, format shifts, sequencing, and independent-magazine pacing.","https://www.itsnicethat.com/news/dazed-rizzoli-30-years-confused-publication-fashion-041021","https://www.behance.net/galleries/graphic-design/editorial"),
    ]
    y=H-205
    for i,(h,b,u1,u2) in enumerate(refs):
        x=30+(i%2)*395
        if i==2: y-=170
        text(c,h,x,y,"KHeavy",11,[RED,COBALT,INK,TAN][i]); lines(c,x,y-20,330,7,7,INK,i)
        text(c,u1,x,y-82,"KMono",5.8,COBALT); text(c,u2,x,y-96,"KMono",5.2,COBALT)
    text(c,"LIMITATION / Public web material and accessible portfolio examples were reviewed. No copyrighted editorial photography is reproduced; all image fields are abstract placeholders.",30,48,"KSans",7.5,INK)


def make():
    c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
    c.setTitle("KLAT Editorial Layout Atlas V3 — Casey and Loewy Refined")
    c.setAuthor("KLAT editorial study")
    cover(c); c.showPage(); method(c); c.showPage(); index(c); c.showPage()
    score_page(c,0,12); c.showPage(); score_page(c,12,24); c.showPage(); verdict_page(c); c.showPage()
    for n in range(1,25): spread(c,n); c.showPage()
    refs(c); c.showPage(); c.save(); print(OUT)


if __name__ == "__main__": make()
