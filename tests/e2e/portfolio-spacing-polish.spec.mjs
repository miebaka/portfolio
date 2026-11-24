import { test, expect } from "@playwright/test";

test("active route remains semantic without a dot and Work title is visually hidden", async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  for (const path of ["/index.html","/work.html","/about.html","/essays.html","/experiments.html","/contact.html"]) {
    await page.goto(path);
    const current=page.locator(".site-nav [aria-current='page']");
    await expect(current).toHaveCount(1);
    await expect.poll(()=>current.evaluate(el=>getComputedStyle(el,"::after").content)).toBe("none");
    const indexCurrent=page.locator(".site-index__link[aria-current='page']");
    if (await indexCurrent.count()) await expect.poll(()=>indexCurrent.evaluate(el=>getComputedStyle(el,"::after").content)).toBe("none");
  }
  await page.goto("/work.html");
  await expect(page.locator("#archive-title")).toHaveText("Work");
  expect(await page.locator(".project-archive__head").evaluate(el=>el.getBoundingClientRect().height)).toBeLessThanOrEqual(1);
});

test("footer responds to system appearance; displaced ink is the same in both", async ({page}) => {
  await page.goto("/");
  const signature=page.locator(".site-footer__signature");
  for (const colorScheme of ["light","dark"]) {
    await page.emulateMedia({colorScheme});
    await expect(page.locator("html")).toHaveAttribute("data-theme",colorScheme);
    const colors=await signature.evaluate(el=>{
      const probe=document.createElement("span");
      el.append(probe);
      const resolve=token=>{probe.style.color="var("+token+")";return getComputedStyle(probe).color};
      const value={rest:getComputedStyle(el).color,expectedRest:resolve(document.documentElement.dataset.theme==="dark"?"--ref-white":"--ref-black"),active:resolve("--footer-signature-active"),ultramarine:resolve("--ref-ultramarine")};
      probe.remove();
      return value;
    });
    expect(colors.rest).toBe(colors.expectedRest);
    expect(colors.active).toBe(colors.ultramarine);
  }
});

test("homepage heading gaps match, cue repeats and essay title stays stationary", async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  await page.emulateMedia({reducedMotion:"no-preference"});
  await page.goto("/");
  const gaps=await page.evaluate(()=>[getComputedStyle(document.querySelector("#what-i-do .disciplines-heading")).marginBottom,getComputedStyle(document.querySelector(".home-beyond__grid")).marginTop]);
  expect(gaps[0]).toBe(gaps[1]);
  const icon=page.locator(".scroll-cue span:last-child");
  await expect(icon).toHaveCSS("animation-iteration-count","infinite");
  await page.emulateMedia({reducedMotion:"reduce"});
  await expect(icon).toHaveCSS("animation-name","none");
  await page.goto("/essays.html");
  const row=page.locator(".writing-item__link").first();
  const title=row.locator(".editorial-index__title");
  await row.hover();
  await expect(title).toHaveCSS("transform","none");
  await row.focus();
  await expect(title).toHaveCSS("transform","none");
});


test("career index is readable without horizontal scrolling or motion", async ({page}) => {
  for (const colorScheme of ["light","dark"]) {
    await page.emulateMedia({colorScheme,reducedMotion:"reduce"});
    for (const width of [320,390,768,1024,1440]) {
      await page.setViewportSize({width,height:900});
      await page.goto("/about.html");
      const index=page.locator(".career-index");
      await expect(index.locator(".career-index__organisation")).toHaveText(["Rise","Anakle","Rivo Studios","Grey Finance","WellaHealth Technologies","Riv-TechCreek"]);
      await expect(index.locator(".career-index__period").first()).toHaveText("Jul 2025 – Present");
      await expect(index.locator(".career-index__contribution")).toHaveCount(6);
      expect(await index.evaluate(el=>el.scrollWidth<=el.clientWidth+1 && [...el.children].every(row=>row.scrollWidth<=row.clientWidth+1))).toBe(true);
      await expect(index.locator("[tabindex],canvas,.experience-ruler")).toHaveCount(0);
    }
  }
});
