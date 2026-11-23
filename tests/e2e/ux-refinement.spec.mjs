import {test,expect} from "@playwright/test";

test("Home keeps the landing restrained and Selected Work as landscape folders",async({page})=>{
  await page.goto("/index.html");
  await expect(page.locator("body")).not.toContainText("Available for senior brand and marketing design roles");
  await expect(page.locator(".home-landing")).toHaveCSS("position","relative");
  await expect(page.locator(".home-content")).toHaveCSS("position","relative");
  const badge=await page.locator(".home-landing").evaluate(node=>getComputedStyle(node,"::before").content);
  expect(["none","normal","\"none\""]).toContain(badge);
  await expect(page.locator('.work-view-controls [data-view="grid"]')).toHaveCount(0);
  await expect(page.locator(".home-folder-stack .project-folder")).toHaveCount(3);
  await expect(page.locator(".home-folder-stack .project-folder__paper")).toHaveCount(15);
  await expect(page.locator("#selected-work .work-view-controls")).toHaveCount(0);
  await expect(page.locator("#selected-work .swiss-section-head")).toHaveCount(0);
  await expect(page.locator("#selected-work")).toHaveAttribute("aria-label", "Selected work");
});

test("Landing and Selected Work move with normal scroll instead of covering one another", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  await expect(page.locator(".home-folder-stack__cards")).toHaveAttribute("data-navigation", "native");
  await page.locator(".home-landing").evaluate(async node => {
    await Promise.all(node.getAnimations().map(animation => animation.finished.catch(() => null)));
  });
  const positions = async () => page.evaluate(() => {
    const bounds = selector => document.querySelector(selector).getBoundingClientRect();
    const hero = bounds(".home-landing");
    const content = bounds(".home-content");
    return {
      scrollY,
      heroTop: hero.top,
      heroBottom: hero.bottom,
      contentTop: content.top,
      workTop: bounds("#selected-work").top,
      folderTop: bounds(".home-folder-stack__cards .project-folder").top,
      heroPosition: getComputedStyle(document.querySelector(".home-landing")).position,
      folderPosition: getComputedStyle(document.querySelector(".home-folder-stack__cards")).position
    };
  });
  const before = await positions();
  expect(before.heroPosition).toBe("relative");
  expect(["static", "relative"]).toContain(before.folderPosition);
  expect(before.contentTop).toBeGreaterThanOrEqual(before.heroBottom - 2);
  await page.evaluate(() => scrollTo({ top: Math.round(innerHeight * .7), behavior: "instant" }));
  const after = await positions();
  const delta = after.scrollY - before.scrollY;
  expect(delta).toBeGreaterThan(200);
  for (const axis of ["heroTop", "workTop", "folderTop"])
    expect(Math.abs(after[axis] - before[axis] + delta), axis + " follows document scroll").toBeLessThanOrEqual(2);
});

test("What I Do preserves rich desktop cards and a calm mobile reading list", async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/index.html");
    const section = page.locator("#what-i-do");
    const cards = section.locator(".service-stack__card");
    await expect(cards).toHaveCount(5);
    await expect(section.locator(".service-journey__number,.service-stack__count")).toHaveCount(0);
    const geometry = await page.evaluate(() => {
      const wrapper = document.querySelector("#what-i-do");
      const card = wrapper.querySelector(".service-stack__card");
      return {
        width: card.getBoundingClientRect().width,
        viewport: innerWidth,
        cardBackground: getComputedStyle(card).backgroundColor,
        sectionBackground: getComputedStyle(wrapper).backgroundColor,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        radius: parseFloat(getComputedStyle(card).borderTopLeftRadius),
        position: getComputedStyle(wrapper.querySelector(".service-stack__item")).position,
        labels: getComputedStyle(card.querySelector(".service-stack__tags")).display
      };
    });
    expect(geometry.width).toBeGreaterThan(width * .8);
    expect(geometry.width).toBeLessThanOrEqual(width);
    if (width <= 768) {
      expect(geometry.sectionBackground).toBe(geometry.bodyBackground);
      expect(geometry.radius).toBe(0);
      expect(geometry.position).toBe("relative");
      expect(geometry.labels).toBe("none");
    } else {
      expect(geometry.cardBackground).not.toBe(geometry.sectionBackground);
      expect(geometry.radius).toBeGreaterThanOrEqual(12);
      expect(geometry.position).toBe("sticky");
      expect(geometry.labels).not.toBe("none");
    }
  }
});

test("Client marks are fitted mathematically without distortion",async({page})=>{
  await page.goto("/index.html");
  const logos=page.locator(".client-proof").first().locator(".marquee__item img");
  await expect(logos).toHaveCount(6);
  const geometry=await logos.evaluateAll(nodes=>nodes.map(node=>{
    const style=getComputedStyle(node),w=parseFloat(style.width),h=parseFloat(style.height);
    return {w,h,fit:style.objectFit,loaded:node.naturalWidth > 0};
  }));
  geometry.forEach(({w,h,fit,loaded})=>{
    expect(w).toBeGreaterThan(30);
    expect(h).toBeGreaterThan(20);
    expect(loaded).toBe(true);
    expect(fit).toBe("contain");
  });
});

test("Footer dot field is keyboard-operable after entering viewport",async({page})=>{
  await page.goto("/index.html");
  const field=page.locator(".site-footer__signature");
  await field.scrollIntoViewIfNeeded();
  await expect(field).toHaveAttribute("role","button");
  await expect(field).toHaveAttribute("tabindex","0");
  await field.focus();
  await expect(field).toBeFocused();
  await field.press("Enter");
  await expect(field.locator("canvas")).toHaveCount(1);
});

// The previous cascade hid the restored dots on every page except Home.
test("Dot-matrix footer is rendered on Home, Work, and About", async ({page}) => {
  for (const route of ["/index.html", "/work.html", "/about.html"]) {
    await page.goto(route);
    const signature = page.locator(".site-footer__signature");
    await signature.scrollIntoViewIfNeeded();
    await expect(signature).toBeVisible();
    const { width, height } = await signature.evaluate(node => node.getBoundingClientRect().toJSON());
    expect(width).toBeGreaterThan(200);
    expect(height).toBeGreaterThan(100);
  }
});

test("What I Do stacks by scroll, ignores hover and ends with the last card", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  const cards = page.locator("#what-i-do .service-stack__item");
  await expect(cards).toHaveCount(5);
  const first = cards.first();
  const second = cards.nth(1);
  const last = cards.last();
  const firstZ = await first.evaluate(el => getComputedStyle(el).zIndex);
  await first.hover();
  await expect(first).toHaveCSS("z-index", firstZ);
  await expect(second).toHaveCSS("z-index", "11");
  await last.scrollIntoViewIfNeeded();
  await expect(second).toHaveCSS("position", "sticky");
  await expect(last).toHaveCSS("position", "relative");
  await expect(last).toHaveCSS("z-index", "14");
  await expect(last.locator(".service-stack__card")).toHaveCSS("transform", "none");
});

test("logo marquee animates and source logos have identical computed heights", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  const marquee = page.locator(".client-marquee");
  await marquee.scrollIntoViewIfNeeded();
  await expect(marquee).toHaveClass(/is-running/);
  const track = marquee.locator(".client-marquee__track");
  await expect(track).toHaveCSS("animation-play-state", "running");
  await expect(track).toHaveCSS("animation-name", "client-marquee");
  const heights = await marquee.locator(".client-proof").first()
    .locator(".marquee__item img")
    .evaluateAll(nodes => nodes.map(node => Math.round(parseFloat(getComputedStyle(node).height))));
  expect(new Set(heights).size).toBe(1);
  const before = await track.evaluate(node => getComputedStyle(node).transform);
  await page.waitForTimeout(200);
  const after = await track.evaluate(node => getComputedStyle(node).transform);
  expect(after).not.toBe(before);
});

test("yellow closes the service stack before the client-marquee boundary", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/index.html");
  const section = page.locator("#what-i-do");
  const cards = section.locator(".service-stack__item");
  await expect(cards).toHaveCount(5);
  const zIndices = await cards.evaluateAll(nodes => nodes.map(node => Number(getComputedStyle(node).zIndex)));
  expect(zIndices[4]).toBeGreaterThan(zIndices[3]);
  const spacer = await section.locator(".service-stack").evaluate(el => getComputedStyle(el, "::after").height);
  expect(parseFloat(spacer)).toBeGreaterThan(300);
  const boundary = await page.evaluate(() => ({
    sectionBottom: document.querySelector("#what-i-do").getBoundingClientRect().bottom,
    logosTop: document.querySelector(".journey").getBoundingClientRect().top
  }));
  expect(boundary.logosTop).toBeGreaterThanOrEqual(boundary.sectionBottom - 2);
});
