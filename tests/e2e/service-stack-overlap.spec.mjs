import { test, expect } from "@playwright/test";

test("What I Do has a genuinely overlapping native-scroll stack with usable proof links", async ({ page }) => {
  for (const [width, height] of [[390, 900], [1440, 560], [1440, 900]]) {
    const stacks = width >= 896 && height >= 640;
    await page.setViewportSize({ width, height });
    await page.goto("/index.html");
    const items = page.locator(".service-stack__item");
    await expect(items).toHaveCount(5);
    const before = await items.evaluateAll(nodes => nodes.map(node => {
      const box = node.getBoundingClientRect();
      return {
        top: box.top, bottom: box.bottom, position: getComputedStyle(node).position,
        margin: parseFloat(getComputedStyle(node).marginTop),
      };
    }));
    for (let i = 1; i < before.length; i++) {
      if (stacks) {
        expect(before[i].top, "desktop cards overlap at " + width).toBeLessThan(before[i - 1].bottom);
      } else {
        expect(before[i].top, "nonsticky rows never overlap at " + width + "×" + height).toBeGreaterThanOrEqual(before[i - 1].bottom - 1);
      }
      expect(before[i].top).toBeGreaterThan(before[i - 1].top);
    }
    expect(before[0].position).toBe(stacks ? "sticky" : "relative");
    if (stacks) expect(before[1].margin).toBeLessThan(0);
    else expect(before[1].margin).toBeGreaterThanOrEqual(0);

    // Link targets may not be hidden beneath the following card.
    for (const item of await items.all()) {
      const link = item.locator(".service-stack__evidence");
      await link.scrollIntoViewIfNeeded();
      await expect(link).toBeVisible();
      await link.focus();
      await expect(link).toBeFocused();
      const hit = await link.evaluate(node => {
        const r = node.getBoundingClientRect();
        const target = document.elementFromPoint(r.left + Math.min(r.width / 2, 32), r.top + r.height / 2);
        return node === target || node.contains(target);
      });
      expect(hit, "proof link remains in the painted hit area").toBe(true);
    }
  }
});

test("reduced motion preserves readable non-sticky service cards", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/index.html");
  await expect(page.locator(".service-stack__item")).toHaveCount(5);
  await expect(page.locator(".service-stack__item").first()).toHaveCSS("position", "relative");
  for (const link of await page.locator(".service-stack__evidence").all()) {
    await expect(link).toHaveAttribute("href", /work\/.*\.html#/);
  }
});

test("mobile capability proof reads as a calm nonsticky list with no empty scroll runway", async ({ page }) => {
  for (const width of [320, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/index.html");
    const section = page.locator("#what-i-do");
    await expect(section.locator(".service-stack__item")).toHaveCount(5);
    for (const item of await section.locator(".service-stack__item").all()) {
      await expect(item).toHaveCSS("position", "relative");
      await expect(item.locator(".service-stack__tags")).toBeHidden();
      await expect(item.locator(".service-stack__motif")).toBeVisible();
      await expect(item.locator(".service-stack__evidence")).toBeVisible();
    }
    const mobile = await page.evaluate(() => ({
      runway: getComputedStyle(document.querySelector("#what-i-do .service-stack"), "::after").content,
      heroMeta: getComputedStyle(document.querySelector(".home-landing__meta p:nth-child(2)")).display,
      secondaryRole: getComputedStyle(document.querySelector(".home-landing__secondary-role")).display,
      location: getComputedStyle(document.querySelector(".home-landing__meta p:first-child")).display,
      overscroll: document.documentElement.scrollWidth - innerWidth
    }));
    expect(mobile.runway).toBe("none");
    expect(mobile.heroMeta).not.toBe("none");
    expect(mobile.secondaryRole).toBe("none");
    expect(mobile.location).toBe("none");
    expect(mobile.overscroll).toBeLessThanOrEqual(2);
  }
});


test("shared motifs are distinct, inherit existing ink and never cover text", async ({ page }) => {
  const motifs = [];
  for (const route of ["/index.html", "/about.html"]) {
    for (const colorScheme of ["light","dark"]) {
      await page.emulateMedia({ colorScheme, reducedMotion: "reduce" });
      for (const width of [320,390,768,1024,1440]) {
        await page.setViewportSize({ width, height:900 });
        await page.goto(route);
        const cards=page.locator(".service-stack__card");
        await expect(cards).toHaveCount(5);
        const markup=await cards.locator(".service-stack__motif").evaluateAll(nodes=>nodes.map(svg=>svg.innerHTML));
        expect(new Set(markup).size).toBe(5);
        if (!motifs.length) motifs.push(...markup);
        else expect(markup).toEqual(motifs);
        for (const card of await cards.all()) {
          const graphic=card.locator(".service-stack__motif");
          await expect(graphic).toBeVisible();
          await expect(graphic).toHaveAttribute("aria-hidden","true");
          const layout=await card.evaluate(node=>{
            const svg=node.querySelector(".service-stack__motif");
            const rect=svg.getBoundingClientRect(), title=node.querySelector("h3").getBoundingClientRect(), bottom=node.querySelector(".service-stack__bottom").getBoundingClientRect();
            const box=node.getBoundingClientRect();
            return {inside:rect.left>=box.left-1&&rect.right<=box.right+1&&rect.bottom<=box.bottom+1,
              textClear:title.right<=rect.left+1, bottomClear:rect.bottom<=bottom.top+1,
              inherited:getComputedStyle(svg).color===getComputedStyle(node).color,
              static:getComputedStyle(svg.querySelector(".motif-a")).transform==="none",
              overflow:node.scrollWidth-node.clientWidth};
          });
          expect(layout).toMatchObject({inside:true,textClear:true,bottomClear:true,inherited:true,static:true});
          expect(layout.overflow).toBeLessThanOrEqual(1);
        }
      }
    }
  }
});


test("five service palettes are fixed by discipline across routes, themes and widths", async ({ page }) => {
  const tokenNames = ["blue","orange","pink","plum","yellow"];
  let baseline;
  for (const route of ["/index.html","/about.html"]) {
    for (const width of [390,1440]) {
      await page.setViewportSize({width,height:900});
      for (const colorScheme of ["light","dark"]) {
        await page.emulateMedia({colorScheme,reducedMotion:"reduce",forcedColors:"none"});
        await page.goto(route);
        await expect(page.locator(".service-stack__card")).toHaveCount(5);
        const palettes=await page.locator(".service-stack__card").evaluateAll((cards,names)=>{
          const probe=document.createElement("span");
          document.body.append(probe);
          const canvas=document.createElement("canvas");
          canvas.width=canvas.height=1;
          const ctx=canvas.getContext("2d",{willReadFrequently:true});
          const pixel=color=>{
            ctx.clearRect(0,0,1,1);
            ctx.fillStyle=color;
            ctx.fillRect(0,0,1,1);
            return [...ctx.getImageData(0,0,1,1).data].slice(0,3);
          };
          const luminance=rgb=>rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
          const contrast=(a,b)=>{
            const x=luminance(pixel(a)),y=luminance(pixel(b));
            return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
          };
          const result=cards.map((card,i)=>{
            const cs=getComputedStyle(card);
            probe.style.color="var(--ref-service-card-"+names[i]+"-paper)";
            const expectedPaper=getComputedStyle(probe).color;
            probe.style.color="var(--ref-service-card-"+names[i]+"-ink)";
            const expectedInk=getComputedStyle(probe).color;
            const descendants=[...card.querySelectorAll("h3,.service-stack__description p,.service-stack__evidence,.service-stack__tag,.service-stack__motif")];
            return {paper:cs.backgroundColor,ink:cs.color,expectedPaper,expectedInk,
              inherited:descendants.every(el=>getComputedStyle(el).color===cs.color),
              contrast:contrast(cs.backgroundColor,cs.color),gradient:cs.backgroundImage};
          });
          probe.remove();
          return result;
        },tokenNames);
        expect(new Set(palettes.map(p=>p.paper)).size).toBe(5);
        for(const p of palettes){
          expect(p.paper).toBe(p.expectedPaper);
          expect(p.ink).toBe(p.expectedInk);
          expect(p.inherited).toBe(true);
          expect(p.gradient).toBe("none");
          expect(p.contrast).toBeGreaterThanOrEqual(9);
        }
        const signature=palettes.map(p=>[p.paper,p.ink]);
        if(!baseline) baseline=signature;
        else expect(signature).toEqual(baseline);
      }
    }
  }
});

test("forced colors keep service cards and their evidence links legible", async ({page})=>{
  await page.emulateMedia({forcedColors:"active",reducedMotion:"reduce"});
  for(const route of ["/index.html","/about.html"]){
    await page.goto(route);
    const cards=page.locator(".service-stack__card");
    await expect(cards).toHaveCount(5);
    for(const card of await cards.all()){
      const palette=await card.evaluate(el=>{
        const probe=document.createElement("span");
        probe.style.backgroundColor="Canvas";
        probe.style.color="CanvasText";
        document.body.append(probe);
        const actual=getComputedStyle(el),expected=getComputedStyle(probe);
        const result={paper:actual.backgroundColor,ink:actual.color,expectedPaper:expected.backgroundColor,expectedInk:expected.color};
        probe.remove();
        return result;
      });
      expect(palette.paper).toBe(palette.expectedPaper);
      expect(palette.ink).toBe(palette.expectedInk);
      await expect(card.locator(".service-stack__motif")).toBeVisible();
      const link=card.locator(".service-stack__evidence");
      await link.focus();
      await expect(link).toBeFocused();
      expect(await link.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe("none");
    }
  }
});


test("service motifs animate only over the icon and respect reduced motion", async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:"no-preference"});
  for (const route of ["/index.html","/about.html"]) {
    await page.goto(route);
    for (const card of await page.locator(".service-stack__card").all()) {
      const icon=card.locator(".service-stack__motif");
      const shape=icon.locator(".motif-a");
      await icon.scrollIntoViewIfNeeded();
      await card.locator("h3").hover();
      await expect(shape).toHaveCSS("transform","none");
      await icon.hover();
      await expect.poll(()=>shape.evaluate(el=>getComputedStyle(el).transform)).not.toBe("none");
      await card.locator("h3").hover();
      await expect(shape).toHaveCSS("transform","none");
    }
  }
  await page.emulateMedia({reducedMotion:"reduce"});
  const icon=page.locator(".service-stack__motif").first();
  await icon.hover();
  await expect(icon.locator(".motif-a")).toHaveCSS("transform","none");
});
