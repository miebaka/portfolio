export async function captureState(testInfo, locator, state) {
  if (process.env.PORTFOLIO_INTERACTION_EVIDENCE !== "1") return;

  await testInfo.attach(state, {
    body: await locator.screenshot({ animations: "disabled" }),
    contentType: "image/png"
  });
}
