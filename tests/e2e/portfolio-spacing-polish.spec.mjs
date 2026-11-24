import { test, expect } from "@playwright/test";

test("active route dot follows navigation and Work title is visually hidden", async ({page}) => {
  await page.setViewportSize({width:1440,height:900});
  for (const path of ["/index.html","/work.html","/about.html","/essays.html","/experiments.html","/contact.html"]) {
    await page.goto(path);
    const current=page.locator(".site-nav [aria-current='page']");
    await expect(current).toHaveCount(1);
    await expect.poll(()=>current.evaluate(el=>getComputedStyle(el,"::after").content)).toBe('""');
    await expect.poll(()=>current.evaluate(el=>parseFloat(getComputedStyle(el,"::after").width))).toBeGreaterThan(4);
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
