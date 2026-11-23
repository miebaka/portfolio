/* Shared reduced-motion resolution for case transitions and the Experiments gallery. */
export function isMotionReduced(root, systemQuery) {
  const setting = root?.dataset?.motion;
  return setting === "reduced" || systemQuery?.matches === true;
}
