/* A single, shared motion-preference rule. Real browser scrolling is native;
   individual effects (water and image gallery) own their own lifecycle. */
export function isMotionReduced(root, systemQuery) {
  const setting = root?.dataset?.motion;
  return setting === "reduced" || (setting !== "full" && systemQuery?.matches === true);
}
