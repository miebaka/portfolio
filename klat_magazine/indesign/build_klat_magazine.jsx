#target indesign

(function () {
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

    var root = "/Users/mac/Desktop/Career/Portfolio/klat_magazine/indesign";
    var inddFile = File(root + "/KLAT_Editorial_Layouts_200x300.indd");
    var idmlFile = File(root + "/KLAT_Editorial_Layouts_200x300.idml");
    var pdfFile = File(root + "/KLAT_Editorial_Layouts_Spread_Proof.pdf");
    var specFile = File(root + "/KLAT_Type_System.txt");

    function mm(v) { return v * 2.834645669; }
    function gb(page,b) {
        var pb=page.bounds;
        return [pb[0]+mm(b[0]),pb[1]+mm(b[1]),pb[0]+mm(b[2]),pb[1]+mm(b[3])];
    }
    function pagePoint(page,x,y) {
        var pb=page.bounds;
        return [pb[1]+mm(x),pb[0]+mm(y)];
    }
    function safe(fn) { try { return fn(); } catch (e) { return null; } }
    function color(doc, name, values) {
        var s = doc.colors.itemByName(name);
        if (!s.isValid) s = doc.colors.add({name:name, model:ColorModel.PROCESS, space:ColorSpace.CMYK, colorValue:values});
        return s;
    }
    function findFont(candidates) {
        for (var i=0; i<candidates.length; i++) {
            var f = app.fonts.itemByName(candidates[i]);
            if (f.isValid) return f;
        }
        return app.fonts.item(0);
    }
    function pstyle(doc, name, props) {
        var s = doc.paragraphStyles.itemByName(name);
        if (!s.isValid) s = doc.paragraphStyles.add({name:name});
        for (var k in props) safe((function(key,val){ return function(){s[key]=val;};})(k,props[k]));
        return s;
    }
    function cstyle(doc, name, props) {
        var s = doc.characterStyles.itemByName(name);
        if (!s.isValid) s = doc.characterStyles.add({name:name});
        for (var k in props) safe((function(key,val){ return function(){s[key]=val;};})(k,props[k]));
        return s;
    }
    function ostyle(doc, name, props) {
        var s = doc.objectStyles.itemByName(name);
        if (!s.isValid) s = doc.objectStyles.add({name:name});
        for (var k in props) safe((function(key,val){ return function(){s[key]=val;};})(k,props[k]));
        return s;
    }

    if (inddFile.exists) safe(function(){inddFile.remove();});
    if (idmlFile.exists) safe(function(){idmlFile.remove();});
    if (pdfFile.exists) safe(function(){pdfFile.remove();});

    var doc = app.documents.add();
    // InDesign starts new documents in the application's current ruler units (often picas).
    // Keep the build in points so every mm() conversion is interpreted deterministically.
    doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.POINTS;
    doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.POINTS;
    doc.documentPreferences.properties = {
        facingPages:true,
        pageWidth:mm(200),
        pageHeight:mm(300),
        pagesPerDocument:1,
        documentBleedTopOffset:mm(3),
        documentBleedBottomOffset:mm(3),
        documentBleedInsideOrLeftOffset:mm(3),
        documentBleedOutsideOrRightOffset:mm(3),
        slugTopOffset:mm(0), slugBottomOffset:mm(0), slugInsideOrLeftOffset:mm(0), slugRightOrOutsideOffset:mm(0)
    };
    doc.documentPreferences.allowPageShuffle = false;
    doc.spreads[0].allowPageShuffle = false;
    doc.spreads[0].pages.add(LocationOptions.AT_END);
    for (var spreadIndex=1; spreadIndex<24; spreadIndex++) {
        var newSpread = doc.spreads.add(LocationOptions.AT_END);
        newSpread.allowPageShuffle = false;
    }
    doc.gridPreferences.baselineStart = mm(14);
    doc.gridPreferences.baselineDivision = 12.5;
    doc.gridPreferences.baselineGridShown = false;
    // Start on an even folio so page 1 is a left page and all 48 pages resolve into 24 true facing spreads.
    safe(function(){ doc.sections[0].pageNumberStart = 2; });

    var paper = color(doc,"KLAT Paper",[4,5,9,0]);
    var ink = color(doc,"KLAT Ink",[72,66,63,78]);
    var red = color(doc,"KLAT Vermilion",[0,86,88,0]);
    var cobalt = color(doc,"KLAT Cobalt",[92,73,0,0]);
    var acid = color(doc,"KLAT Acid",[16,0,88,0]);
    var pink = color(doc,"KLAT Rose",[0,41,14,0]);
    var sky = color(doc,"KLAT Sky",[36,11,7,0]);
    var tan = color(doc,"KLAT Tan",[21,31,48,1]);
    var plum = color(doc,"KLAT Plum",[53,57,25,17]);
    var grey = color(doc,"KLAT Image Grey",[29,21,23,2]);
    var pale = color(doc,"KLAT Pale Rule",[8,8,10,0]);
    var whiteSwatch = doc.swatches.itemByName("Paper");
    var none = doc.swatches.itemByName("None");

    var garamond = findFont(["EB Garamond\tRegular","Adobe Garamond Pro\tRegular","Minion Pro\tRegular"]);
    var garamondBold = findFont(["EB Garamond\tBold","Adobe Garamond Pro\tBold","Minion Pro\tBold"]);
    var garamondItalic = findFont(["EB Garamond\tItalic","Adobe Garamond Pro\tItalic","Minion Pro\tItalic"]);
    var grotesk = findFont(["Arial\tRegular","Helvetica Neue\tRegular","Helvetica\tRegular"]);
    var groteskBold = findFont(["Arial\tBold","Helvetica Neue\tBold","Helvetica\tBold"]);
    var mono = findFont(["Courier New\tRegular","Courier\tRegular"]);

    var styles = {};
    styles.body = pstyle(doc,"01 Body / Ragged",{
        appliedFont:garamond, pointSize:9.5, leading:12.5, fillColor:ink,
        justification:Justification.LEFT_ALIGN, composer:"Adobe Paragraph Composer",
        hyphenation:true, hyphenateWordsLongerThan:6, hyphenateAfterFirst:3, hyphenateBeforeLast:3,
        hyphenateLadderLimit:2, balanceRaggedLines:BalanceLinesStyle.NO_BALANCING,
        keepFirstLines:2, keepLastLines:2, spaceAfter:0, alignToBaseline:true
    });
    styles.bodyJust = pstyle(doc,"02 Body / Justified",{
        basedOn:styles.body, appliedFont:garamond, pointSize:9.25, leading:12.5,
        justification:Justification.LEFT_JUSTIFIED, desiredWordSpacing:100, minimumWordSpacing:85,
        maximumWordSpacing:115, desiredLetterSpacing:0, minimumLetterSpacing:-2, maximumLetterSpacing:2,
        desiredGlyphScaling:100, minimumGlyphScaling:98, maximumGlyphScaling:102, alignToBaseline:true
    });
    styles.first = pstyle(doc,"03 Body / First Paragraph",{basedOn:styles.body, firstLineIndent:0, spaceBefore:0, keepWithNext:0});
    styles.bodyIndent = pstyle(doc,"04 Body / Subsequent",{basedOn:styles.body, firstLineIndent:mm(4.4), spaceBefore:0});
    styles.intro = pstyle(doc,"05 Intro / Standfirst",{appliedFont:garamond, pointSize:14, leading:17, fillColor:ink, justification:Justification.LEFT_ALIGN, hyphenation:false, keepAllLinesTogether:true});
    styles.display = pstyle(doc,"10 Display / Monumental",{appliedFont:garamondBold, pointSize:58, leading:52, fillColor:ink, justification:Justification.LEFT_ALIGN, hyphenation:false, keepAllLinesTogether:true, tracking:-20});
    styles.h1 = pstyle(doc,"11 Headline / Feature",{appliedFont:garamondBold, pointSize:38, leading:37, fillColor:ink, hyphenation:false, keepAllLinesTogether:true, tracking:-10});
    styles.h2 = pstyle(doc,"12 Headline / Secondary",{appliedFont:groteskBold, pointSize:23, leading:24, fillColor:ink, hyphenation:false, keepAllLinesTogether:true, tracking:-15});
    styles.h3 = pstyle(doc,"13 Subhead",{appliedFont:groteskBold, pointSize:11, leading:13, fillColor:ink, spaceBefore:12.5, spaceAfter:6.25, keepWithNext:2, hyphenation:false});
    styles.deck = pstyle(doc,"14 Deck",{appliedFont:garamond, pointSize:18, leading:21, fillColor:ink, hyphenation:false, keepAllLinesTogether:true});
    styles.kicker = pstyle(doc,"15 Kicker / Section",{appliedFont:groteskBold, pointSize:8, leading:10, fillColor:red, capitalization:Capitalization.ALL_CAPS, tracking:120, hyphenation:false, keepWithNext:2});
    styles.pull = pstyle(doc,"16 Pull Quote",{appliedFont:garamondBold, pointSize:28, leading:29, fillColor:ink, hyphenation:false, justification:Justification.LEFT_ALIGN, keepAllLinesTogether:true});
    styles.quote = pstyle(doc,"17 Quote / Overscale",{appliedFont:groteskBold, pointSize:46, leading:43, fillColor:ink, hyphenation:false, tracking:-25});
    styles.list = pstyle(doc,"18 List / Numbered",{appliedFont:groteskBold, pointSize:10, leading:12.5, fillColor:ink, leftIndent:mm(8), firstLineIndent:mm(-8), spaceAfter:6.25, alignToBaseline:true});
    styles.caption = pstyle(doc,"20 Caption",{appliedFont:grotesk, pointSize:7.5, leading:9.5, fillColor:ink, hyphenation:false});
    styles.credit = pstyle(doc,"21 Credit",{appliedFont:mono, pointSize:6.5, leading:8, fillColor:ink, capitalization:Capitalization.ALL_CAPS, tracking:35, hyphenation:false});
    styles.label = pstyle(doc,"22 Label / UI",{appliedFont:groteskBold, pointSize:7, leading:8, fillColor:ink, capitalization:Capitalization.ALL_CAPS, tracking:90, hyphenation:false});
    styles.folio = pstyle(doc,"23 Folio",{appliedFont:groteskBold, pointSize:7, leading:8, fillColor:ink, tracking:40, hyphenation:false});
    styles.drop = pstyle(doc,"24 Opener / Drop Cap",{basedOn:styles.body, dropCapCharacters:1, dropCapLines:4, keepFirstLines:2});
    styles.byline = pstyle(doc,"25 Byline",{appliedFont:garamondItalic, pointSize:9, leading:11, fillColor:ink, hyphenation:false});

    var chars = {};
    chars.emphasis = cstyle(doc,"Emphasis / Italic",{appliedFont:garamondItalic});
    chars.bold = cstyle(doc,"Emphasis / Bold",{appliedFont:garamondBold});
    chars.red = cstyle(doc,"Accent / Vermilion",{fillColor:red});
    chars.blue = cstyle(doc,"Accent / Cobalt",{fillColor:cobalt});
    chars.smallcaps = cstyle(doc,"Utility / Small Caps",{capitalization:Capitalization.SMALL_CAPS, tracking:70});
    chars.super = cstyle(doc,"Utility / Superscript",{position:Position.SUPERSCRIPT, pointSize:6});

    var objects = {};
    objects.image = ostyle(doc,"Image / Placeholder",{enableFill:true, fillColor:grey, enableStroke:true, strokeColor:none, strokeWeight:0});
    objects.imageDark = ostyle(doc,"Image / Dark Placeholder",{enableFill:true, fillColor:ink, enableStroke:true, strokeColor:none, strokeWeight:0});
    objects.textPanel = ostyle(doc,"Text / Paper Panel",{enableFill:true, fillColor:whiteSwatch, enableStroke:true, strokeColor:none, strokeWeight:0, insetSpacing:[mm(5),mm(5),mm(5),mm(5)]});
    objects.rule = ostyle(doc,"Rule / Hairline",{enableFill:true, fillColor:ink, enableStroke:true, strokeColor:none, strokeWeight:0});

    var layerFurniture = doc.layers.item(0); layerFurniture.name = "01 Furniture";
    var layerImages = doc.layers.add({name:"02 Image Frames"});
    var layerText = doc.layers.add({name:"03 Editorial Text"});
    var layerGuides = doc.layers.add({name:"04 Guides + Notes"});

    for (var pi=0; pi<doc.pages.length; pi++) {
        var pg = doc.pages[pi];
        pg.marginPreferences.properties={top:mm(14),bottom:mm(14),left:mm(14),right:mm(14),columnCount:6,columnGutter:mm(4)};
    }

    // A-Parent furniture: running title, automatic folios, outer rules.
    var master = doc.masterSpreads.item(0); master.namePrefix="A"; master.baseName="KLAT Base";
    for (var mp=0; mp<master.pages.length; mp++) {
        var mpage=master.pages[mp];
        var mt=mpage.textFrames.add({geometricBounds:gb(mpage,[288,14,294,70]), itemLayer:layerFurniture});
        mt.contents="KLAT / EDITORIAL STUDIES"; mt.parentStory.paragraphs.everyItem().appliedParagraphStyle=styles.credit;
        var mf=mpage.textFrames.add({geometricBounds:gb(mpage,[288,170,294,186]), itemLayer:layerFurniture});
        mf.parentStory.insertionPoints[0].contents=SpecialCharacters.AUTO_PAGE_NUMBER;
        mf.parentStory.paragraphs.everyItem().appliedParagraphStyle=styles.folio;
        mf.parentStory.paragraphs.everyItem().justification=Justification.RIGHT_ALIGN;
        var mr=mpage.rectangles.add({geometricBounds:gb(mpage,[286.5,14,286.75,186]), fillColor:pale, strokeColor:none, itemLayer:layerFurniture});
    }
    for (pi=0; pi<doc.pages.length; pi++) doc.pages[pi].appliedMaster=master;

    function rect(page,b,fill,layer,stroke) {
        return page.rectangles.add({geometricBounds:gb(page,b), fillColor:fill||none, strokeColor:stroke||none, strokeWeight:0, itemLayer:layer||layerImages});
    }
    function oval(page,b,fill,layer) {
        return page.ovals.add({geometricBounds:gb(page,b), fillColor:fill||none, strokeColor:none, strokeWeight:0, itemLayer:layer||layerImages});
    }
    function tf(page,b,contents,style,fill,layer) {
        var t=page.textFrames.add({geometricBounds:gb(page,b), itemLayer:layer||layerText});
        if (fill) { t.fillColor=fill; t.textFramePreferences.insetSpacing=[mm(3.5),mm(3.5),mm(3.5),mm(3.5)]; }
        t.contents=contents;
        if (style) t.parentStory.paragraphs.everyItem().appliedParagraphStyle=style;
        return t;
    }
    function image(page,b,label,dark,fill) {
        var r=rect(page,b,fill||(dark?ink:grey),layerImages);
        var t=tf(page,[b[0]+(b[2]-b[0])*.44,b[1]+3,b[0]+(b[2]-b[0])*.56,b[3]-3],label||"IMAGE",styles.label,null,layerImages);
        t.parentStory.paragraphs.everyItem().justification=Justification.CENTER_ALIGN;
        t.parentStory.paragraphs.everyItem().fillColor=dark?whiteSwatch:ink;
        return r;
    }
    function bodyText() {
        return "Fashion becomes memorable when the image creates desire and the words sharpen its meaning. KLAT studies the gesture, the garment, the person and the culture around them. Every detail is edited; every silence is intentional.\rThe story continues through material, movement and voice, giving the reader a reason to pause rather than merely turn the page.";
    }
    function heading(page,b,kicker,title,deckText) {
        tf(page,[b[0],b[1],b[0]+8,b[3]],kicker,styles.kicker);
        tf(page,[b[0]+10,b[1],b[2]-18,b[3]],title,styles.h1);
        if(deckText) tf(page,[b[2]-17,b[1],b[2],b[3]],deckText,styles.deck);
    }
    function spreadLabel(page,num,name) {
        var t=tf(page,[mm(0)/mm(1)+7,14,12,186],("SPREAD "+(num<10?"0":"")+num+"  /  "+name),styles.credit,null,layerFurniture);
        t.parentStory.paragraphs.everyItem().fillColor=red;
    }

    var names=["Cover Story Collision","Paparazzi Run","The Giant Initial","Diagonal Argument","The Newsroom Mosaic","Cinema Credits","Poster in the Gutter","The Vertical Index","Interview Orbit","The Proof Sheet","Type Behind the Body","The Editor's Desk","Then / Now Flip","Red Carpet Dossier","Gutter Cascade","Micro / Macro","Calendar of Looks","Quote Avalanche","Edge Tabs","The Pause","Panoramic Foldout","The Lens","Footnote Constellation","End Credits"];

    function buildSpread(n,L,R) {
        spreadLabel(L,n,names[n-1]);
        // Each branch owns a different image count, silhouette, text geometry and gutter relationship.
        if(n===1){
            image(L,[18,-3,284,203],"HERO",true,ink); image(R,[18,-3,284,203],"HERO CONTINUES",true,ink);
            tf(L,[28,14,92,186],"KLAT",styles.display).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            tf(L,[206,14,270,92],"WHO GETS TO DEFINE\rWHAT FASHION BECOMES?",styles.h2,red);
            tf(R,[28,130,80,186],"THE NEW\rFORM",styles.h2,acid);
        } else if(n===2){
            heading(L,[18,14,55,186],"NIGHT MOVES","SEEN.",null); heading(R,[18,14,55,186],"NIGHT MOVES","EVERYWHERE.",null);
            var xs=[14,52,98,146]; var ws=[32,38,42,40];
            for(var i=0;i<4;i++) image(L,[72,xs[i],260,xs[i]+ws[i]],"0"+(i+1),i%2===0,i%2===0?tan:sky);
            image(R,[72,14,226,66],"05",false,plum); image(R,[72,72,276,186],"06 / ARRIVAL",false,grey); tf(R,[232,14,276,66],bodyText(),styles.caption);
        } else if(n===3){
            tf(L,[58,4,270,102],"K",styles.display).parentStory.pointSize=210;
            tf(L,[112,64,225,178],"THE SHAPE\rOF ARRIVAL\r\r"+bodyText(),styles.intro,whiteSwatch);
            image(R,[18,-3,284,203],"PORTRAIT",false,sky);
        } else if(n===4){
            var polyL=L.polygons.add({fillColor:tan,strokeColor:none,itemLayer:layerImages}); polyL.paths[0].entirePath=[pagePoint(L,-3,18),pagePoint(L,203,18),pagePoint(L,118,284),pagePoint(L,-3,284)];
            var polyR=R.polygons.add({fillColor:cobalt,strokeColor:none,itemLayer:layerImages}); polyR.paths[0].entirePath=[pagePoint(R,-3,18),pagePoint(R,203,18),pagePoint(R,203,284),pagePoint(R,38,284)];
            tf(R,[40,22,76,186],"PRETTY / UGLY",styles.h2).parentStory.paragraphs.everyItem().fillColor=acid;
            tf(R,[88,60,220,178],bodyText(),styles.body).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===5){
            tf(L,[20,14,48,186],"THIS WEEK",styles.h2).parentStory.paragraphs.everyItem().fillColor=red;
            image(L,[60,14,148,116],"01",false,grey); image(L,[60,122,148,186],"02",false,tan); tf(L,[156,14,270,186],bodyText(),styles.bodyJust);
            tf(R,[20,14,44,186],"12 THINGS WORTH KNOWING",styles.deck);
            var cells=[[58,14,132,70],[58,76,132,132],[58,138,132,186],[144,14,218,92],[144,98,218,186],[230,14,276,186]];
            for(i=0;i<cells.length;i++) image(R,cells[i],"0"+(i+3),false,[sky,tan,plum,grey,pink,sky][i]);
        } else if(n===6){
            rect(L,[0,-3,300,203],ink,layerImages); rect(R,[0,-3,300,203],ink,layerImages);
            image(L,[18,-3,218,203],"CINEMATIC STILL",true,plum); image(R,[18,-3,218,203],"STILL CONTINUES",true,plum);
            tf(L,[230,14,278,112],"A FILM BY\rKLAT",styles.h1).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            tf(R,[230,92,278,186],"CAST / THE CLOTHES\rCAMERA / THE CITY\rSOUND / AFTER MIDNIGHT",styles.credit).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===7){
            image(L,[18,-3,284,203],"BACKGROUND IMAGE",false,tan); image(R,[18,-3,284,203],"BACKGROUND IMAGE",false,tan);
            rect(L,[18,154,284,203],red,layerImages); rect(R,[18,-3,284,46],red,layerImages);
            var a=tf(L,[92,156,164,199],"PULL",styles.h2); a.parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            a=tf(R,[92,2,164,42],"OUT",styles.h2); a.parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            tf(L,[252,14,278,145],"THE IMAGE CONTINUES BEHIND A REMOVABLE POSTER",styles.credit);
        } else if(n===8){
            image(L,[18,-3,284,80],"FULL HEIGHT",true,ink); heading(L,[35,92,170,186],"THE EDIT","THE\rESSENTIAL\rLIST",null); tf(L,[196,92,270,186],bodyText(),styles.caption);
            for(i=0;i<8;i++){tf(R,[24+i*31.5,18,46+i*31.5,186],("0"+(i+1)+"  ESSENTIAL LOOK\rShort editorial note"),styles.list);}
        } else if(n===9){
            image(L,[52,20,170,138],"PORTRAIT A",false,sky); image(R,[132,62,250,180],"PORTRAIT B",false,tan);
            oval(L,[178,116,274,200],none,layerGuides).strokeColor=cobalt; oval(R,[20,0,116,84],none,layerGuides).strokeColor=cobalt;
            tf(L,[188,132,250,186],"Q",styles.display).parentStory.paragraphs.everyItem().fillColor=cobalt;
            tf(R,[35,14,97,64],"A",styles.display).parentStory.paragraphs.everyItem().fillColor=red;
            tf(L,[22,144,92,186],bodyText(),styles.caption); tf(R,[30,90,108,186],bodyText(),styles.caption);
        } else if(n===10){
            var cw=53,ch=72; for(var rr=0;rr<3;rr++)for(var cc=0;cc<3;cc++) image(L,[32+rr*82,14+cc*58,32+rr*82+ch,14+cc*58+cw],(rr===1&&cc===1)?"SELECT":"FRAME",false,(rr+cc)%2?tan:sky);
            for(rr=0;rr<3;rr++)for(cc=0;cc<3;cc++) image(R,[32+rr*82,14+cc*58,32+rr*82+ch,14+cc*58+cw],"FRAME",false,(rr+cc)%2?plum:grey);
        } else if(n===11){
            rect(L,[0,-3,300,203],cobalt,layerImages); rect(R,[0,-3,300,203],cobalt,layerImages);
            tf(L,[104,20,190,200],"UNT",styles.quote).parentStory.pointSize=92; tf(R,[104,0,190,185],"AMED",styles.quote).parentStory.pointSize=92;
            oval(L,[78,160,132,214],tan,layerImages); rect(L,[130,146,274,203],tan,layerImages); oval(R,[78,-14,132,40],tan,layerImages); rect(R,[130,-3,274,54],tan,layerImages);
            tf(L,[268,34,280,166],"THE BODY INTERRUPTS THE WORD",styles.credit).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===12){
            rect(L,[0,-3,300,203],tan,layerImages); rect(R,[0,-3,300,203],tan,layerImages);
            var cards=[[36,56,170,180,-7],[126,128,276,203,5]];
            for(i=0;i<cards.length;i++){var im=image(L,[cards[i][0],cards[i][1],cards[i][2],cards[i][3]],"ARCHIVE CARD",false,i?sky:grey); im.rotationAngle=cards[i][4];}
            cards=[[42,-3,186,74,-4],[102,74,266,184,6]];
            for(i=0;i<cards.length;i++){im=image(R,[cards[i][0],cards[i][1],cards[i][2],cards[i][3]],"EDITOR'S NOTE",false,i?grey:pink); im.rotationAngle=cards[i][4];}
            tf(L,[250,14,278,120],"THE EDITOR'S DESK",styles.deck).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===13){
            image(L,[18,-3,284,203],"THEN",false,tan); image(R,[18,-3,284,203],"NOW",true,ink);
            tf(L,[28,14,55,70],"THEN",styles.h2).parentStory.paragraphs.everyItem().fillColor=whiteSwatch; tf(R,[28,128,55,186],"NOW",styles.h2).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            oval(L,[128,176,176,224],whiteSwatch,layerText); oval(R,[128,-24,176,24],whiteSwatch,layerText);
            tf(L,[220,14,270,84],bodyText(),styles.caption,whiteSwatch);
        } else if(n===14){
            rect(L,[18,-3,284,54],red,layerImages); tf(L,[40,8,92,46],"THE\rLOOK",styles.h2).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            image(L,[18,66,284,186],"RED CARPET",false,tan);
            tf(R,[20,14,38,186],"WHO / WHAT / WHY",styles.credit).parentStory.paragraphs.everyItem().fillColor=red;
            for(i=0;i<4;i++){tf(R,[56+i*54,14,78+i*54,40],"0"+(i+1),styles.h2); tf(R,[56+i*54,48,94+i*54,186],["SILHOUETTE","COLOUR","REFERENCE","VERDICT"][i]+"\r"+bodyText(),styles.caption);}
        } else if(n===15){
            rect(L,[0,-3,300,203],ink,layerImages); rect(R,[0,-3,300,203],ink,layerImages);
            image(L,[38,86,132,184],"01",false,grey); image(L,[154,132,270,203],"02",false,tan); image(R,[40,-3,154,82],"03",false,sky); image(R,[172,36,278,170],"04",false,grey);
            tf(L,[22,14,60,112],"FALL",styles.h1).parentStory.paragraphs.everyItem().fillColor=whiteSwatch; tf(R,[244,82,280,186],"THROUGH",styles.h1).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===16){
            image(L,[18,-3,284,203],"MACRO TEXTURE",true,plum);
            oval(R,[38,22,124,108],whiteSwatch,layerImages); image(R,[44,28,118,102],"DETAIL 01",false,grey);
            oval(R,[116,96,194,174],whiteSwatch,layerImages); image(R,[122,102,188,168],"DETAIL 02",false,sky);
            oval(R,[206,18,286,98],whiteSwatch,layerImages); image(R,[212,24,280,92],"DETAIL 03",false,tan);
            tf(L,[244,14,276,186],"CLOSE ENOUGH TO SEE THE HAND",styles.deck).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===17){
            tf(L,[20,14,45,186],"30 DAYS / 30 LOOKS",styles.h2); var day=1;
            for(rr=0;rr<4;rr++)for(cc=0;cc<4;cc++){if(day<=15){image(L,[58+rr*52,14+cc*44,101+rr*52,52+cc*44],(""+day),false,(day%3===0)?plum:(day%2===0?tan:sky));day++;}}
            for(rr=0;rr<4;rr++)for(cc=0;cc<4;cc++){if(day<=30){image(R,[58+rr*52,14+cc*44,101+rr*52,52+cc*44],(""+day),false,(day%3===0)?plum:(day%2===0?tan:sky));day++;}}
            tf(R,[140,64,208,136],"WEEK 03\rTHE EDIT",styles.list,acid);
        } else if(n===18){
            rect(L,[0,-3,300,203],pink,layerImages); rect(R,[0,-3,300,203],pink,layerImages);
            tf(L,[34,14,96,186],"I DRESSED",styles.quote); tf(L,[112,52,170,198],"FOR THE",styles.quote).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            tf(R,[68,0,128,152],"LIFE I",styles.quote); tf(R,[150,14,224,186],"WANTED.",styles.quote).parentStory.paragraphs.everyItem().fillColor=red;
            image(R,[30,138,128,190],"PORTRAIT",true,ink); tf(R,[230,104,276,186],bodyText(),styles.caption,whiteSwatch);
        } else if(n===19){
            image(L,[18,-3,284,203],"SECTION IMAGE",true,ink); image(R,[18,-3,284,170],"CONTINUES",true,ink);
            var tabCols=[red,cobalt,acid,pink]; for(i=0;i<4;i++){rect(R,[18+i*66.5,170,84+i*66.5,203],tabCols[i],layerText); var tab=tf(R,[35+i*66.5,174,62+i*66.5,199],["PROFILE","STYLE","WORK","LIFE"][i],styles.label); tab.rotationAngle=90;}
            tf(L,[218,14,270,92],"ENTER\r"+bodyText(),styles.caption,whiteSwatch);
        } else if(n===20){
            heading(L,[28,14,150,186],"PORTRAIT 08","SPACE\rTO BE\rSEEN",null); tf(L,[190,14,274,108],bodyText(),styles.body);
            image(R,[62,52,246,150],"PORTRAIT",false,grey); tf(R,[256,128,274,186],"NO PERFORMANCE. NO PROP.",styles.credit);
        } else if(n===21){
            image(L,[18,-3,244,203],"PANORAMA",true,tan); image(R,[18,-3,244,203],"PANORAMA",true,tan);
            rect(L,[244,-3,284,203],acid,layerText); rect(R,[244,-3,284,203],acid,layerText);
            tf(L,[254,14,276,186],"THE ROAD",styles.h2); tf(R,[254,14,276,186],"KEEPS GOING",styles.h2);
        } else if(n===22){
            rect(L,[0,-3,300,203],cobalt,layerImages); rect(R,[0,-3,300,203],cobalt,layerImages);
            oval(L,[52,28,256,232],whiteSwatch,layerImages); oval(R,[52,-32,256,172],whiteSwatch,layerImages);
            image(L,[72,48,236,203],"BEAUTY MACRO",false,sky); image(R,[72,-3,236,152],"BEAUTY MACRO",false,sky);
            oval(L,[118,148,190,220],cobalt,layerText); oval(R,[118,-20,190,52],cobalt,layerText);
            tf(R,[42,124,116,186],"THE\rBEAUTY\rISSUE",styles.h1).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
        } else if(n===23){
            image(L,[78,94,238,203],"EVIDENCE",false,plum); image(R,[78,-3,238,106],"EVIDENCE",false,plum);
            var pts=[[42,14],[118,14],[222,14],[42,150],[118,150],[222,150]];
            for(i=0;i<pts.length;i++){var pg=i<3?L:R; var x=i<3?pts[i][1]:pts[i][1]; var y=pts[i][0]; oval(pg,[y,x,y+12,x+12],[red,cobalt,ink][i%3],layerText); tf(pg,[y+16,x,y+42,x+70],("0"+(i+1)+"\rSOURCE NOTE"),styles.credit);}
            tf(L,[28,44,52,186],"EVERY DETAIL",styles.h2); tf(R,[28,14,52,156],"HAS A SOURCE",styles.h2);
        } else if(n===24){
            image(L,[18,-3,284,203],"CLOSING IMAGE",true,tan); rect(R,[18,-3,284,203],red,layerImages);
            tf(R,[34,24,72,186],"THE END",styles.h1).parentStory.paragraphs.everyItem().fillColor=whiteSwatch;
            var roles=["PHOTOGRAPHY","STYLING","WORDS","CAST","HAIR","MAKE-UP","PRODUCTION","THANK YOU"];
            for(i=0;i<roles.length;i++){tf(R,[92+i*21,24,105+i*21,94],roles[i],styles.credit); var nt=tf(R,[92+i*21,108,105+i*21,186],"NAME SURNAME",styles.label); nt.parentStory.paragraphs.everyItem().fillColor=whiteSwatch;}
        }
    }

    for (var s=1; s<=24; s++) buildSpread(s,doc.pages[(s-1)*2],doc.pages[(s-1)*2+1]);

    // Add a slug note on page 1 with the specification and type system provenance.
    safe(function(){ doc.pages[0].notes.add({contents:"KLAT production file: 200 x 300 mm pages; facing pages; 3 mm bleed all sides; 6 columns per page / 12 per spread; 4 mm gutters; 12.5 pt baseline; text and image frames remain editable."}); });

    doc.save(inddFile);
    doc.exportFile(ExportFormat.INDESIGN_MARKUP,idmlFile,false);
    app.pdfExportPreferences.properties={pageRange:PageRange.ALL_PAGES,exportReaderSpreads:true,useDocumentBleedWithPDF:true,includeSlugWithPDF:false,viewPDF:false};
    // Do not pass a named preset here: presets can override reader-spread and bleed flags.
    doc.exportFile(ExportFormat.PDF_TYPE,pdfFile,false);

    // Leave the delivered document in millimetres for production use.
    doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    doc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;
    doc.save(inddFile);

    specFile.encoding="UTF-8"; specFile.open("w");
    specFile.writeln("KLAT TYPE + CHARACTER SYSTEM");
    specFile.writeln("Document: 200 x 300 mm, facing pages, 3 mm bleed, 6 columns/page, 4 mm gutters, 12.5 pt baseline.");
    specFile.writeln("Body: EB Garamond 9.5/12.5 pt, ragged left; justified alternative 9.25/12.5 pt with 85/100/115 word spacing, -2/0/2 letter spacing, 98/100/102 glyph scaling.");
    specFile.writeln("Hyphenation: words 6+ letters, 3 letters before/after, ladder limit 2. First/subsequent paragraph styles are separated; do not use both an indent and paragraph spacing.");
    specFile.writeln("Display: EB Garamond Bold 58/52; Feature headline 38/37; Secondary grotesk 23/24; deck 18/21; standfirst 14/17.");
    specFile.writeln("Utility: kicker 8/10 +120 tracking; caption 7.5/9.5; credit mono 6.5/8; UI label 7/8 +90; folio 7/8 +40.");
    specFile.writeln("Character styles: Italic emphasis, Bold emphasis, Vermilion accent, Cobalt accent, Small Caps, Superscript.");
    specFile.writeln("Object styles: Image Placeholder, Dark Image Placeholder, Paper Text Panel, Hairline Rule.");
    specFile.close();

    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
})();
