from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.colors import HexColor, Color, white, black
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.utils import ImageReader
from pathlib import Path
import textwrap


OUT = Path(__file__).with_name("KLAT_40_Spread_Layout_Guide.pdf")
W, H = landscape(A4)
M = 34

INK = HexColor("#171717")
PAPER = HexColor("#F3F0E9")
CREAM = HexColor("#E7E0D3")
RED = HexColor("#D4472F")
BLUE = HexColor("#1E4E75")
OLIVE = HexColor("#5E6252")
GOLD = HexColor("#A77B2F")
GREY = HexColor("#B8B3AA")
LIGHT = HexColor("#DDD8CE")

FONT_REG = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_SERIF = "/System/Library/Fonts/Supplemental/Times New Roman.ttf"
FONT_SERIF_BOLD = "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf"
for name, path in [("KlatSans", FONT_REG), ("KlatSansBold", FONT_BOLD), ("KlatSerif", FONT_SERIF), ("KlatSerifBold", FONT_SERIF_BOLD)]:
    if Path(path).exists():
        pdfmetrics.registerFont(TTFont(name, path))


def wrap(c, text, x, y, width, font="KlatSans", size=8, leading=11, color=INK, max_lines=None):
    c.setFont(font, size)
    c.setFillColor(color)
    words = text.split()
    lines, line = [], ""
    for word in words:
        trial = word if not line else line + " " + word
        if stringWidth(trial, font, size) <= width:
            line = trial
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    if max_lines:
        lines = lines[:max_lines]
    for ln in lines:
        c.drawString(x, y, ln)
        y -= leading
    return y


def label(c, text, x, y, color=RED):
    c.setFont("KlatSansBold", 6.8)
    c.setFillColor(color)
    c.drawString(x, y, text.upper())


def footer(c, page, section="KLAT EDITORIAL SYSTEM"):
    c.setStrokeColor(GREY)
    c.setLineWidth(.35)
    c.line(M, 22, W-M, 22)
    c.setFont("KlatSans", 6.5)
    c.setFillColor(OLIVE)
    c.drawString(M, 11, section)
    c.drawRightString(W-M, 11, f"{page:02d}")


def new_page(c, bg=PAPER):
    c.setFillColor(bg)
    c.rect(0, 0, W, H, fill=1, stroke=0)


def draw_image(c, x, y, w, h, variant=0, dark=False):
    base = [HexColor("#BBB5A9"), HexColor("#A8AFAD"), HexColor("#C5B6AA"), HexColor("#AAA59D")][variant % 4]
    c.setFillColor(base if not dark else HexColor("#343434"))
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.saveState()
    c.setStrokeColor(Color(1,1,1,alpha=.35) if dark else Color(0,0,0,alpha=.18))
    c.setLineWidth(.7)
    if variant % 4 == 0:
        c.circle(x+w*.52, y+h*.68, min(w,h)*.10, fill=0)
        c.line(x+w*.25, y+h*.12, x+w*.55, y+h*.58)
        c.line(x+w*.82, y+h*.12, x+w*.55, y+h*.58)
    elif variant % 4 == 1:
        c.line(x, y+h*.22, x+w, y+h*.76)
        c.line(x+w*.18, y, x+w*.74, y+h)
    elif variant % 4 == 2:
        for i in range(5):
            c.line(x+w*(.1+i*.18), y, x+w*(.36+i*.13), y+h)
    else:
        c.circle(x+w*.50, y+h*.50, min(w,h)*.28, fill=0)
        c.circle(x+w*.50, y+h*.50, min(w,h)*.16, fill=0)
    c.restoreState()
    c.setFont("KlatSansBold", max(5, min(9, h/15)))
    c.setFillColor(white if dark else HexColor("#6C6861"))
    c.drawCentredString(x+w/2, y+h/2-3, "IMAGE")


def draw_text_lines(c, x, y, w, count=8, color=INK, step=6):
    c.setStrokeColor(color)
    c.setLineWidth(.45)
    for i in range(count):
        frac = [.96, .89, .93, .74, .98, .86, .91, .62][i % 8]
        c.line(x, y-i*step, x+w*frac, y-i*step)


def spread_frame(c, pattern, ratio, accent=RED):
    x, y, w, h = 34, 176, 774, 347
    gap = 8
    half = (w-gap)/2
    c.setFillColor(white)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setStrokeColor(INK); c.setLineWidth(.6)
    c.rect(x, y, w, h, fill=0, stroke=1)
    c.setStrokeColor(GREY); c.line(x+half+gap/2, y, x+half+gap/2, y+h)
    image_share = .70 if ratio == "70:30" else .60

    # Ten composition grammars, each varied by index.
    p = pattern % 10
    if p == 0:  # full bleed + margin note
        draw_image(c, x, y, w, h, pattern, dark=pattern%2==0)
        c.setFillColor(white); c.rect(x+26, y+24, w*(1-image_share)-20, 86, fill=1, stroke=0)
        draw_text_lines(c, x+38, y+91, w*(1-image_share)-48, 7)
    elif p == 1:  # dominant left, text right
        iw = w*image_share
        draw_image(c, x, y, iw, h, pattern)
        c.setFillColor(accent); c.rect(x+iw, y, 5, h, fill=1, stroke=0)
        draw_text_lines(c, x+iw+25, y+h-64, w-iw-48, 15, step=8)
    elif p == 2:  # dominant right, text left
        tw = w*(1-image_share)
        draw_text_lines(c, x+24, y+h-74, tw-45, 17, step=8)
        draw_image(c, x+tw, y, w-tw, h, pattern)
        c.setFont("KlatSerifBold", 25); c.setFillColor(accent); c.drawString(x+18, y+h-38, "01")
    elif p == 3:  # top panorama, lower essay
        ih = h*image_share
        draw_image(c, x, y+h-ih, w, ih, pattern)
        cols = 3 if ratio == "60:40" else 2
        cw = (w-50-(cols-1)*18)/cols
        for j in range(cols): draw_text_lines(c, x+24+j*(cw+18), y+h-ih-30, cw, 10, step=6)
    elif p == 4:  # bottom panorama, headline above
        ih = h*image_share
        draw_image(c, x, y, w, ih, pattern)
        c.setFont("KlatSerifBold", 30); c.setFillColor(INK); c.drawString(x+24, y+h-52, "THE FORM")
        draw_text_lines(c, x+w*.70, y+h-35, w*.26, 6, step=7)
    elif p == 5:  # modular triptych
        imgw = w*image_share
        cell = (imgw-16)/3
        for j in range(3): draw_image(c, x+j*(cell+8), y, cell, h, pattern+j)
        draw_text_lines(c, x+imgw+22, y+h-42, w-imgw-38, 18, step=7)
    elif p == 6:  # small image floating in field
        iw, ih = w*image_share*.78, h*.78
        draw_image(c, x+28, y+h-ih-26, iw, ih, pattern)
        c.setFillColor(accent); c.rect(x+iw+44, y+26, w-iw-70, 44, fill=1, stroke=0)
        draw_text_lines(c, x+iw+44, y+h-56, w-iw-68, 13, step=7)
    elif p == 7:  # diagonal crop + bottom notes
        draw_image(c, x, y+h*(1-image_share), w, h*image_share, pattern, dark=True)
        c.setStrokeColor(accent); c.setLineWidth(5); c.line(x+w*.18, y, x+w*.46, y+h)
        draw_text_lines(c, x+26, y+82, w*.44, 8, step=7)
        draw_text_lines(c, x+w*.60, y+82, w*.34, 8, step=7)
    elif p == 8:  # portrait pair + narrow spine essay
        iw = (w*image_share-8)/2
        draw_image(c, x, y, iw, h, pattern)
        draw_image(c, x+iw+8, y, iw, h, pattern+1)
        tx = x+2*iw+30
        draw_text_lines(c, tx, y+h-45, w-(tx-x)-18, 20, step=7)
    else:  # contact sheet
        area_w = w*image_share
        cols, rows = 3, 3
        cw, ch = (area_w-20)/cols, (h-16)/rows
        for rr in range(rows):
            for cc in range(cols):
                draw_image(c, x+cc*(cw+5), y+h-(rr+1)*ch-rr*5, cw, ch, pattern+rr+cc)
        draw_text_lines(c, x+area_w+22, y+h-45, w-area_w-40, 18, step=7)
    return x, y, w, h


layouts = [
    ("Monumental Entrance", "HIGH FASHION", "70:30", "One full-bleed image establishes authority; a compact white text plaque behaves like a museum label.", "12 columns; full bleed; 8 mm safety inset", "Display serif 44–64 pt; caption sans 8–9 pt", "Single vertical hero, quiet background, garment silhouette intact", "Deck + 90–130 words + credits", "Open a major fashion story or designer profile.", "Text plaque covers the garment or feels like an ad."),
    ("Editorial Counterweight", "HIGH FASHION", "70:30", "A dominant image is balanced by a disciplined essay column, creating tension without visual noise.", "8/4 column split; image bleeds left", "High-contrast serif + neutral grotesk", "Landscape or portrait with negative space toward gutter", "Headline + standfirst + 180–230 words", "Feature opener or visual essay chapter.", "Subject faces out of the spread; gutter cuts key detail."),
    ("The Quiet Authority", "HIGH FASHION", "60:40", "Text leads with controlled restraint while a single image delivers the emotional proof.", "4/8 split; generous outer margin", "Serif headline 38–52 pt; body 9.5/13", "Full-height image with calm tonal range", "Headline + 260–340 words + pull quote", "Profile opener with meaningful writing.", "Text block becomes grey and undifferentiated."),
    ("Runway Horizon", "HIGH FASHION", "70:30", "A cinematic panorama makes the clothes feel like a world rather than a product.", "12 columns; image across top 70%", "Condensed sans for labels; serif body", "Wide crop, motion or architecture; horizon aligned", "Two columns + look credits", "Location story, collection narrative.", "Panorama lacks one obvious focal point."),
    ("House Name", "HIGH FASHION", "70:30", "An oversized title occupies the breath above a continuous image field.", "Baseline grid; lower 70% image band", "Editorial serif 52–76 pt; tight tracking", "Horizontal pair that reads as one scene", "Title + 80–120-word précis", "Fashion house introduction or section divider.", "Headline competes with facial expression."),
    ("Three Acts", "HIGH FASHION", "70:30", "A triptych turns styling changes into a deliberate visual progression.", "Three equal image bays + one narrow text rail", "Sans caps 10 pt; serif deck 18–24 pt", "Same subject, controlled variation in pose/crop", "Short concept note + numbered credits", "Three-look edit or material study.", "Images repeat rather than progress."),
    ("Gallery Distance", "HIGH FASHION", "60:40", "A framed image gains rarity from the surrounding field; text remains secondary but substantive.", "Image on 8 columns; text on 4", "Elegant serif; small caps metadata", "One exceptional image with strong edge discipline", "200–260 words + caption", "Couturier, artist, or atelier portrait.", "The image is too ordinary to deserve the space."),
    ("Cut Through", "HIGH FASHION", "70:30", "A directional rule cuts through a cinematic image and pulls the reader across the gutter.", "Diagonal vector over 12 columns", "Compressed sans headline + serif body", "Dark image with clear light path", "Two short text islands, 140 words total", "Night fashion, movement, performance.", "Graphic line becomes decoration with no directional role."),
    ("Twin Icon", "HIGH FASHION", "70:30", "Two full-height portraits create a controlled comparison: pose, generation, silhouette, or styling.", "Two portrait bays + 3-column notes", "Restrained sans; names set large", "Matched lighting and scale; contrasting attitude", "Profiles, questions, or garment notes", "Dual portrait, dialogue, or collection comparison.", "One portrait visually dominates without narrative reason."),
    ("Casting Ledger", "HIGH FASHION", "60:40", "A contact-sheet rhythm turns casting into an editorial argument about identity.", "3×3 image matrix + 4-column essay", "Monospaced labels + humanist serif", "Consistent portraits with meaningful differences", "300 words + short subject identifiers", "Casting story or identity-led portfolio.", "Grid becomes anonymous or tokenistic."),

    ("Raw Margin", "CONTEMPORARY", "70:30", "A rough crop and exposed annotations create immediacy while the core hierarchy stays exact.", "Full bleed + 3-column annotation zone", "Grotesk bold + mono notes", "Flash portrait, visible environment, imperfect edge", "Headline + fragments + credits", "Youth/culture opener.", "Fake distress overwhelms real content."),
    ("Side-Swipe", "CONTEMPORARY", "70:30", "The image pushes hard from one side while narrow text resists from the other.", "9/3 asymmetric split", "Wide sans headline rotated or stacked", "Subject cropped with intention at edge", "120–180 words", "Music/fashion crossover profile.", "Aggressive crop removes styling evidence."),
    ("Straight-Up Index", "CONTEMPORARY", "60:40", "Full-length portraits and direct captions turn personal style into documentary evidence.", "Four portrait modules + interview rail", "Typewriter-style labels; sans body", "Street-cast, full body, neutral viewpoint", "Four answers + 200-word context", "Street style or community feature.", "Over-styling destroys documentary credibility."),
    ("Signal / Noise", "CONTEMPORARY", "70:30", "A clean image field is interrupted by one loud typographic signal, mirroring cultural tension.", "12-column image; headline crosses 5 columns", "Ultra-bold grotesk + small serif body", "High-energy image with one quiet zone", "80-word provocation + source line", "Opinion opener or trend rebuttal.", "Every element shouts; no quiet zone remains."),
    ("Afterimage", "CONTEMPORARY", "70:30", "Repeated crops suggest memory, motion, or digital circulation rather than a single definitive frame.", "One hero + two echo fragments", "Light grotesk; wide tracking", "Motion blur, reflection, or sequential gesture", "Short essay and timestamps", "Nightlife, performance, experimental beauty.", "Effects feel cosmetic rather than narrative."),
    ("Conversation Stack", "CONTEMPORARY", "60:40", "Portraits and dialogue alternate vertically, making the interview feel paced and spoken.", "6/6 split with staggered modules", "Sans Q&A; serif pull quotes", "Two conversational portraits or details", "350–450 words in short exchanges", "Interview continuation spread.", "Answers become long blocks and kill the rhythm."),
    ("Sticker Logic", "CONTEMPORARY", "70:30", "Small labels behave like physical production marks placed over an otherwise premium image.", "Full image; floating metadata modules", "Mono microtype + bold sans title", "Graphic, high-contrast image with open corners", "Metadata, short captions, 70-word intro", "Product/fashion inventory story.", "Labels cover faces, hands, or product details."),
    ("Split Frequency", "CONTEMPORARY", "60:40", "Two image scales and two text voices create a fast/slow reading experience.", "Large 7-column image + small 3-column inset", "Display sans + serif essay", "One contextual image, one intimate detail", "Headline, 240-word essay, detail caption", "Culture report with personal testimony.", "Inset duplicates the hero instead of adding evidence."),
    ("The Zine Fold", "CONTEMPORARY", "60:40", "Photocopied energy meets a strict underlying grid, keeping rebellion readable.", "6-column modular grid; intentional overlaps", "Condensed grotesk + mono", "High grain, hard flash, collage fragments", "Manifesto fragments + credits", "Emerging designer or scene report.", "Randomness replaces editing."),
    ("Scroll Breaker", "CONTEMPORARY", "70:30", "A vertical sequence across the spread mimics digital swiping but resolves as print composition.", "Three tall crops with one interruption", "UI-like labels + editorial serif", "Portrait sequence with evolving gesture", "Short captions + 120-word close", "Social-native talent translated to print.", "Feels like screenshots pasted onto paper."),

    ("Atelier Evidence", "COUTURE", "60:40", "Macro craft details and precise notes make labour visible, not merely luxurious.", "Two macro images + 5-column technical text", "Refined serif + technical mono", "Embroidery, seam, hand, and tool details", "Process note, material list, hours, credits", "Atelier report or garment anatomy.", "Romantic language replaces actual construction detail."),
    ("Silhouette Chapel", "COUTURE", "70:30", "A single silhouette is given ceremonial stillness through symmetry and deep margins.", "Central 8-column portrait; text below", "Didone-style serif + spaced small caps", "Front-facing full silhouette; tonal backdrop", "Title + 100-word interpretation", "Couture look or archival gown.", "Symmetry feels static because pose and light lack nuance."),
    ("Flou / Tailleur", "COUTURE", "60:40", "The spread compares softness and structure as two halves of couture practice.", "Mirrored 6/6 halves", "Serif display; sans technical notes", "Draped garment opposite tailored construction", "Two 150-word columns + shared caption", "Craft comparison or collection analysis.", "Images are stylistically mismatched beyond the intended contrast."),
    ("The Hand", "COUTURE", "70:30", "Hands at work become the hero, shifting status from celebrity to maker.", "Full-bleed hand/process image + lower note", "Humanist serif; tiny caps", "Hands, needle, fitting, finishing; shallow depth", "Maker quote + process caption", "Artisan profile or savoir-faire story.", "Hands are generic stock imagery with no identifiable action."),
    ("Material Cathedral", "COUTURE", "70:30", "An extreme fabric detail reads like architecture, with text functioning as a key.", "Macro bleed + slim vertical legend", "Compressed sans legend + serif title", "Texture at near-abstract scale", "Material key + 100 words", "Embellishment or textile focus.", "Crop is so abstract that garment context disappears."),
    ("Pattern Room", "COUTURE", "60:40", "Pattern pieces, annotations, and one finished look reveal transformation from plan to body.", "Document grid: 7 columns evidence, 5 columns result", "Mono notes + classic serif", "Pattern, toile, sketch, finished garment", "Numbered explanatory sequence", "Design-development feature.", "Too many artifacts with no clear sequence."),
    ("Procession", "COUTURE", "70:30", "A repeated figure becomes a ceremonial rhythm across both pages.", "Four equal vertical frames", "Small centered serif captions", "Four steps or turns of one garment", "Minimal captions + one paragraph", "Runway sequence or garment movement study.", "Timing between frames lacks meaningful progression."),
    ("Archive Intervention", "COUTURE", "60:40", "Historic evidence and a contemporary response meet without pretending they are the same object.", "Archival frame left; contemporary crop right; central note", "Period-sensitive serif + neutral sans", "Clearly labeled archival and new images", "Provenance + 220-word comparison", "House codes, revival, reinterpretation.", "Unclear dates or credits blur historical truth."),
    ("Object Biography", "COUTURE", "60:40", "One garment is treated as an artifact with views, detail, provenance, and interpretation.", "Hero object + three detail windows", "Museum-label typography", "Front/side/detail; consistent color management", "Date, maker, material, ownership, 250 words", "Archive garment or signature accessory.", "The text becomes catalogue data without a point of view."),
    ("Final Fitting", "COUTURE", "70:30", "A candid fitting image holds the emotional centre while marginal notes retain technical specificity.", "Full bleed; notes pinned to outer edge", "Loose handwritten accent + clean sans", "Mirror, pins, assistants, unfinished room", "Quote + fitting notes + credits", "Backstage closure to a couture story.", "Manufactured candidness feels theatrical."),

    ("Estate Portrait", "HERITAGE / VINTAGE", "70:30", "Architecture and sitter share the frame, communicating inheritance through environment rather than logos.", "Full-width environmental portrait + lower caption rail", "Old-style serif + small caps", "Natural light, room context, restrained styling", "120-word scene-setter + provenance", "Founder, collector, or family profile.", "Luxury becomes property worship without human character."),
    ("Ledger & Likeness", "HERITAGE / VINTAGE", "60:40", "A formal portrait is countered by a dense ledger of dates, objects, and anecdotes.", "7/5 split; ruled text panel", "Book serif + tabular figures", "One formal portrait, minimally retouched", "Chronology + 180-word biography", "Archive profile or house history.", "Chronology becomes trivia without narrative stakes."),
    ("Country Weekend", "HERITAGE / VINTAGE", "70:30", "A loose sequence of lived-in images makes polish feel inhabited rather than staged.", "One large scene + two small details", "Warm serif + restrained italic", "Texture, weather, gestures, personal objects", "Diary captions + 100-word note", "Travel, leisure, seasonal wardrobe.", "Every prop looks newly purchased."),
    ("The Provenance Page", "HERITAGE / VINTAGE", "60:40", "Objects earn significance through traceable history, not through ornate styling alone.", "Six-object cabinet grid + text register", "Small serif + numbered sans labels", "Consistent object photography", "Maker, date, material, owner, story", "Accessories, watches, trunks, textiles.", "Claims of age or ownership are unverified."),
    ("Salon Pairing", "HERITAGE / VINTAGE", "70:30", "Two images converse across the gutter like paintings hung in a private room.", "Matched 5-column frames with central air", "Centered serif title; minimal caption", "Harmonized palette and eyeline", "Two captions + 90-word bridge", "Portrait diptych or then/now pairing.", "Pair lacks a conceptual relationship."),
    ("Engraved Modern", "HERITAGE / VINTAGE", "60:40", "A contemporary fashion image adopts the scale and framing of a fashion plate, not a fake antique filter.", "Framed figure + 5-column commentary", "Transitional serif + italic caption", "Full figure, pale field, precise outline", "250 words + garment notation", "Historical influence feature.", "Sepia effects substitute for historical thinking."),
    ("Library Table", "HERITAGE / VINTAGE", "60:40", "Documents, swatches, books, and photographs create an evidence-rich tabletop narrative.", "Overhead image 60%; four-note band 40%", "Bookish serif + mono references", "Flat lay with real hierarchy and provenance", "Four annotated notes + short thesis", "Research, archive, mood, influence.", "Flat lay is decorative and sources are unidentified."),
    ("Society Column Recut", "HERITAGE / VINTAGE", "60:40", "A traditional multi-column page is interrupted by a decisive modern crop.", "Five text columns; image occupies three", "Classic newspaper serif + bold sans caption", "One candid social image with real action", "300–380 words + names", "Event report or community chronicle.", "Names and relationships are unclear."),
    ("Patina", "HERITAGE / VINTAGE", "70:30", "Wear, repair, and age become the visual subject, reframing old-money codes as stewardship.", "Macro image field + narrow essay", "Soft serif + utilitarian labels", "Repairs, creases, worn leather, mending", "150-word ownership story + care notes", "Heirloom or sustainability feature.", "Artificial distressing undermines authenticity."),
    ("Generational Closing", "HERITAGE / VINTAGE", "70:30", "Two generations share one spatial system, ending the issue on continuity rather than nostalgia.", "Two portraits + final text rail", "Serif names + sans body", "Related gestures, objects, or garments across ages", "Closing reflection + credits", "Issue finale or brand legacy statement.", "The younger subject is framed only as an accessory to the elder."),
]


def cover(c, page):
    new_page(c, INK)
    c.setFillColor(RED); c.rect(0, 0, 18, H, fill=1, stroke=0)
    c.setFont("KlatSansBold", 13); c.setFillColor(CREAM); c.drawString(52, H-58, "KLAT / EDITORIAL DESIGN SYSTEM 01")
    c.setFont("KlatSerifBold", 58); c.drawString(52, H-156, "40 SPREADS")
    c.setFont("KlatSerif", 28); c.drawString(55, H-194, "for a picture-led fashion magazine")
    c.setFillColor(RED); c.rect(55, 98, 415, 8, fill=1, stroke=0)
    c.setFont("KlatSans", 12); c.setFillColor(CREAM)
    c.drawString(55, 70, "High fashion / Contemporary / Couture / Heritage")
    c.drawRightString(W-44, 37, "IMAGE : TEXT = 70:30 OR 60:40")


def intro_page(c, page):
    new_page(c); footer(c,page)
    label(c,"Purpose",M,H-48)
    c.setFont("KlatSerifBold",34); c.setFillColor(INK); c.drawString(M,H-92,"A system, not a stack of references.")
    y=H-130
    y=wrap(c,"This guide translates recurring editorial behaviours across historic glossies, independent fashion publications, long-form industry magazines, couture archives, and society-led heritage titles into a flexible visual language for KLAT.",M,y,515,"KlatSerif",14,19)
    y-=18
    for head,body in [
        ("Editorial premise","KLAT treats clothing as evidence of identity, labour, culture, and inheritance. The image creates desire; the text earns trust."),
        ("Ratio rule","Every blueprint reserves roughly 60–70% of the spread for imagery and 30–40% for text, including captions, credits, labels, and negative space assigned to reading."),
        ("Originality rule","Use the principles, not another title's logo, cover device, exact grid, or signature styling. KLAT should feel literate in magazine history without impersonating it."),
        ("Format assumption","A4 landscape diagrams represent an A4 portrait two-page spread. Rebuild at your final trim size with proper bleed and binding compensation.")]:
        label(c,head,M,y); y-=14; y=wrap(c,body,M,y,500,"KlatSans",9,13); y-=14
    c.setFillColor(CREAM); c.rect(585,58,223,410,fill=1,stroke=0)
    c.setFont("KlatSansBold",11); c.setFillColor(RED); c.drawString(607,440,"SHARED STRATEGY")
    wrap(c,"Communicate KLAT's view of fashion to visually sophisticated readers in a collectible print object, so they pause, feel, and understand—while keeping photography dominant and editorial text genuinely useful.",607,410,175,"KlatSerifBold",17,22)


def research_page(c,page,title,kicker,points,quote=None):
    new_page(c); footer(c,page,"RESEARCH SYNTHESIS")
    label(c,kicker,M,H-45)
    c.setFont("KlatSerifBold",31); c.setFillColor(INK); c.drawString(M,H-86,title)
    y=H-126
    for i,(head,body,src) in enumerate(points,1):
        c.setFillColor([RED,BLUE,OLIVE,GOLD][(i-1)%4]); c.circle(M+5,y+3,5,fill=1,stroke=0)
        c.setFont("KlatSansBold",10); c.setFillColor(INK); c.drawString(M+20,y,head)
        y=wrap(c,body,M+20,y-17,570,"KlatSans",8.5,12)
        c.setFont("KlatSans",6.5); c.setFillColor(OLIVE); c.drawString(M+20,y-2,src)
        y-=30
    if quote:
        c.setFillColor(INK); c.rect(640,78,168,360,fill=1,stroke=0)
        wrap(c,quote,660,405,128,"KlatSerifBold",16,21,CREAM)


def principles_page(c,page):
    new_page(c); footer(c,page,"KLAT OPERATING PRINCIPLES")
    label(c,"Translation",M,H-45)
    c.setFont("KlatSerifBold",31); c.setFillColor(INK); c.drawString(M,H-86,"What KLAT should take—and refuse.")
    rows=[
        ("TAKE","The authority of one unforgettable photograph.","REFUSE","Empty luxury signifiers and borrowed masthead theatre."),
        ("TAKE","Brodovitch's crop, white space, and page-to-page motion.","REFUSE","Cropping that amputates garment evidence without purpose."),
        ("TAKE","Independent magazines' permission to show real identity.","REFUSE","Applied 'zine noise' that treats youth as a texture."),
        ("TAKE","Long-form conversation as intellectual luxury.","REFUSE","Tiny body copy used to simulate seriousness."),
        ("TAKE","Couture's attention to hand, process, and material.","REFUSE","Mystique that hides makers or invents provenance."),
        ("TAKE","Heritage pacing, patina, and restraint.","REFUSE","Nostalgia that confuses wealth with character."),
    ]
    y=H-130
    for take,good,refuse,bad in rows:
        c.setFillColor(white); c.rect(M,y-48,W-2*M,58,fill=1,stroke=0)
        label(c,take,M+14,y-5,OLIVE); wrap(c,good,M+72,y-5,270,"KlatSans",9,12)
        label(c,refuse,M+390,y-5,RED); wrap(c,bad,M+458,y-5,285,"KlatSans",9,12)
        y-=67


def index_page(c,page,start,end):
    new_page(c); footer(c,page,"LAYOUT INDEX")
    label(c,"Index",M,H-45)
    c.setFont("KlatSerifBold",31); c.setFillColor(INK); c.drawString(M,H-86,f"Spreads {start+1:02d}–{end:02d}")
    y=H-125
    for i in range(start,end):
        name,fam,ratio,*_=layouts[i]
        c.setFont("KlatSansBold",8.5); c.setFillColor(RED); c.drawString(M,y,f"{i+1:02d}")
        c.setFillColor(INK); c.drawString(M+28,y,name)
        c.setFont("KlatSans",7); c.setFillColor(OLIVE); c.drawRightString(W-M-65,y,fam)
        c.setFont("KlatSansBold",7); c.setFillColor(INK); c.drawRightString(W-M,y,ratio)
        c.setStrokeColor(LIGHT); c.line(M,y-8,W-M,y-8)
        y-=25


def layout_page(c,page,idx,item):
    name,fam,ratio,idea,grid,type_spec,image_spec,text_spec,use_case,failure=item
    new_page(c); footer(c,page,f"SPREAD {idx+1:02d} / {fam}")
    c.setFont("KlatSansBold",8); c.setFillColor(RED); c.drawString(M,H-37,f"{idx+1:02d}  {fam}")
    c.setFont("KlatSerifBold",25); c.setFillColor(INK); c.drawString(M,H-68,name)
    c.setFont("KlatSansBold",10); c.setFillColor([RED,BLUE,GOLD,OLIVE][idx//10]); c.drawRightString(W-M,H-55,ratio)
    accent=[RED,BLUE,GOLD,OLIVE][idx//10]
    spread_frame(c,idx,ratio,accent)
    y=150
    cols=[(M,230),(M+252,230),(M+504,270)]
    blocks=[("GOVERNING IDEA",idea), ("GRID + TYPE",grid+". "+type_spec), ("IMAGE + TEXT",image_spec+". "+text_spec)]
    for (x,w),(head,body) in zip(cols,blocks):
        label(c,head,x,y,accent); wrap(c,body,x,y-15,w,"KlatSans",7.6,10)
    label(c,"BEST USE",M,72,accent); wrap(c,use_case,M,57,330,"KlatSans",7.6,10)
    label(c,"FAILURE CHECK",M+390,72,RED); wrap(c,failure,M+390,57,380,"KlatSans",7.6,10)


def implementation_page(c,page):
    new_page(c); footer(c,page,"PRODUCTION SPEC")
    label(c,"Implementation",M,H-45)
    c.setFont("KlatSerifBold",31); c.setFillColor(INK); c.drawString(M,H-86,"Build the rhythm before decorating it.")
    specs=[
        ("DOCUMENT","A4 portrait pages (210 × 297 mm) or chosen trim; facing pages on; 3 mm bleed; inside margin 16–20 mm depending on binding."),
        ("GRID","Start with 12 columns per spread, 4–5 mm gutters, and a 4 mm baseline. Break the grid only when the story gains meaning."),
        ("TYPE","Use one expressive display family, one highly readable text family, and one utility face at most. Body target: 9–10 pt / 12–14 pt."),
        ("IMAGES","Place at 300 ppi at final size; use CMYK profiles agreed with printer; protect faces, hands, garment closures, and credits from the gutter."),
        ("RATIO","Measure the whole spread: image area versus all text-bearing area. Negative space belongs to whichever function it serves, not automatically to imagery."),
        ("PACING","Avoid ten consecutive 70:30 hero spreads. Alternate monument, sequence, evidence, conversation, and pause."),
        ("CREDITS","Create paragraph styles for photographer, stylist, grooming, talent, garments, archive/source, and rights. Credits are content, not debris."),
        ("PROOF","Print at 100%, fold, and pin to a wall. Test reading distance, gutter loss, black density, image sequence, and whether every spread has one dominant move."),
    ]
    y=H-126
    for i,(h,b) in enumerate(specs):
        x=M+(i%2)*390
        if i%2==0 and i>0: y-=92
        c.setFillColor([RED,BLUE,GOLD,OLIVE][i%4]); c.rect(x,y-5,5,48,fill=1,stroke=0)
        label(c,h,x+16,y+29,[RED,BLUE,GOLD,OLIVE][i%4]); wrap(c,b,x+16,y+14,340,"KlatSans",8.3,11)


def sequencing_page(c,page):
    new_page(c); footer(c,page,"SAMPLE ISSUE RHYTHM")
    label(c,"Sequence",M,H-45)
    c.setFont("KlatSerifBold",31); c.setFillColor(INK); c.drawString(M,H-86,"A 96-page rhythm using the system.")
    seq=[("01–12","ARRIVAL","01, 05, 11","High-impact openers; few words; establish KLAT's point of view."),
         ("13–28","PEOPLE","13, 16, 31","Documentary portraiture and conversation; increase reading density."),
         ("29–46","DESIRE","02, 04, 06, 08","Primary fashion portfolio; alternate scale, motion, and stillness."),
         ("47–62","THE HAND","21, 24, 26, 29","Couture/process section; make labour and material legible."),
         ("63–80","INHERITANCE","32, 34, 36, 39","Archive and heritage; slow the tempo and deepen provenance."),
         ("81–96","RETURN","18, 27, 40","Contemporary re-entry, procession, and generational close.")]
    y=H-135
    for pages,phase,ids,desc in seq:
        c.setFillColor(white); c.rect(M,y-52,W-2*M,64,fill=1,stroke=0)
        c.setFont("KlatSansBold",8); c.setFillColor(RED); c.drawString(M+14,y-3,pages)
        c.setFont("KlatSerifBold",17); c.setFillColor(INK); c.drawString(M+82,y,phase)
        c.setFont("KlatSansBold",8); c.setFillColor(BLUE); c.drawString(M+270,y-2,ids)
        wrap(c,desc,M+355,y,365,"KlatSans",8.5,11)
        y-=72


def refs_page(c,page):
    new_page(c); footer(c,page,"SOURCES + LIMITATIONS")
    label(c,"Research trail",M,H-45)
    c.setFont("KlatSerifBold",31); c.setFillColor(INK); c.drawString(M,H-86,"Sources and use notes")
    refs=[
        ("1","Vogue — About Us / history","https://www.vogue.com/about-us"),
        ("2","Harper's Bazaar — Alexey Brodovitch, 1934–1958","https://www.harpersbazaar.com/culture/features/a94/bazaar-140-0607/"),
        ("3","V&A — 100 years of fashion photography","https://www.vam.ac.uk/articles/100-years-of-fashion-photography"),
        ("4","Dazed Media — Dazed brand history","https://www.dazedmedia.com/brands/dazed"),
        ("5","i-D — About","https://i-d.co/about/"),
        ("6","System — editorial purpose and archive","https://system-magazine.com/"),
        ("7","The Gentlewoman — About","https://thegentlewoman.co.uk/about"),
        ("8","The Metropolitan Museum of Art — Haute Couture","https://www.metmuseum.org/essays/haute-couture"),
        ("9","V&A — The art and history of fashion plates","https://www.vam.ac.uk/articles/the-art-of-fashion-plates-a-hidden-history-of-three-pioneering-women"),
        ("10","V&A — The Ambassador magazine","https://www.vam.ac.uk/shop/bestsellers/the-ambassador-magazine-promoting-post-war-british-textiles-and-fashion-113233.html"),
    ]
    y=H-126
    for n,title,url in refs:
        c.setFont("KlatSansBold",8); c.setFillColor(RED); c.drawString(M,y,n)
        c.setFont("KlatSansBold",8); c.setFillColor(INK); c.drawString(M+24,y,title)
        wrap(c,url,M+24,y-11,392,"KlatSans",6.2,8,BLUE,max_lines=2)
        y-=31
    c.setFillColor(CREAM); c.rect(520,48,288,150,fill=1,stroke=0)
    label(c,"Limitations",540,176,RED)
    wrap(c,"This is a principle-led review, not a forensic measurement of complete paid archives. Public publisher histories, museum essays, accessible issue samples, and official editorial statements were used. Layouts are original schematics and reproduce no magazine photography.",540,158,244,"KlatSans",7.6,10)
    label(c,"AI disclosure",540,98,OLIVE)
    wrap(c,"Research synthesis and the first-pass system used AI assistance. Human art-direction, rights, prepress, and accessibility review remain necessary before publication.",540,82,244,"KlatSans",7.2,9)


def make_pdf():
    c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
    c.setTitle("KLAT — 40 Spread Layout Guide")
    c.setAuthor("KLAT editorial design study")
    page=1
    cover(c,page); c.showPage(); page+=1
    intro_page(c,page); c.showPage(); page+=1
    research_page(c,page,"1. The glossy: image as authority","HIGH FASHION",[
        ("Stop the eye","Vogue describes its history through groundbreaking image-making and collaborations that create culturally resonant fashion images.","Sources 1, 3"),
        ("Crop creates motion","Brodovitch's Bazaar used bleed, white space, bold typography, and obsessive cropping to produce cinematic page rhythm.","Source 2"),
        ("The useful tension","Fashion photography continually negotiates artistic fantasy and the need to show clothes; KLAT should decide which function leads on every spread.","Source 3"),
        ("KLAT translation","Use fewer, stronger frames. Let one image establish desire; use type to direct interpretation rather than decorate the photograph.","Design synthesis")
    ],"THE IMAGE MUST DO MORE THAN SHOW THE CLOTHES. IT MUST CREATE A WORLD WORTH ENTERING."); c.showPage(); page+=1
    research_page(c,page,"2. The independent: image as provocation","CONTEMPORARY",[
        ("Culture, not category","Dazed positions fashion beside art, music, film, politics, and ideas; the hybrid is the editorial model.","Source 4"),
        ("Identity as method","i-D began as a punk-era, typewritten zine and frames style through emerging talent and personal identity.","Source 5"),
        ("Documentary credibility","Street-cast portraits and real environments can carry as much fashion authority as elaborate sets when captions provide context.","Sources 3, 5"),
        ("KLAT translation","Use roughness only where the subject is genuinely immediate. Keep the grid exact beneath the energy.","Design synthesis")
    ],"CONTEMPORARY DOES NOT MEAN RANDOM. ITS BEST DISORDER IS EDITED, CULTURAL, AND SPECIFIC."); c.showPage(); page+=1
    research_page(c,page,"3. The insider: image plus conversation","LONG-FORM",[
        ("Intellectual luxury","System defines its value through long-form conversations paired with portfolios by leading image-makers.","Source 6"),
        ("Personality over pedestal","The Gentlewoman focuses on personal style and combines journalism, photography, warmth, and purpose.","Source 7"),
        ("Reading is a visual material","Text-heavy moments need pacing, entry points, and tonal contrast—not artificially tiny copy.","Design synthesis"),
        ("KLAT translation","Make interviews feel spoken. Alternate portraits, questions, pauses, pull quotes, and evidence.","Design synthesis")
    ],"WORDS SHOULD NOT FILL THE SPACE LEFT BY PHOTOGRAPHY. THEY SHOULD CHANGE WHAT THE PHOTOGRAPH MEANS."); c.showPage(); page+=1
    research_page(c,page,"4. Couture and heritage: image as evidence","CRAFT + MEMORY",[
        ("Craft is the content","The Met describes couture through dressmaking, tailoring, embellishment, and exceptional technical mastery.","Source 8"),
        ("Old media was functional","Fashion plates documented and disseminated style before fashion photography; annotation and provenance were central.","Source 9"),
        ("Archive can be adventurous","The Ambassador used ambitious photography, fine art, and editorial experimentation to promote postwar British textiles.","Source 10"),
        ("KLAT translation","Show the hand, the seam, the room, the repair, and the source. Heritage should be traceable, not merely beige.","Design synthesis")
    ],"LUXURY BECOMES BELIEVABLE WHEN THE READER CAN SEE TIME, LABOUR, MATERIAL, AND OWNERSHIP."); c.showPage(); page+=1
    principles_page(c,page); c.showPage(); page+=1
    index_page(c,page,0,20); c.showPage(); page+=1
    index_page(c,page,20,40); c.showPage(); page+=1
    for idx,item in enumerate(layouts):
        layout_page(c,page,idx,item); c.showPage(); page+=1
    implementation_page(c,page); c.showPage(); page+=1
    sequencing_page(c,page); c.showPage(); page+=1
    refs_page(c,page); c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    make_pdf()
