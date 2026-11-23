/* Every project is a normal link. CSS supplies the folder lift; no coordinate
   remapping, click interception or two-tap touch preview is needed. */
export function initProjectFolderInteractions() {
  document.querySelectorAll(".project-folder-stack__cards").forEach(list => {
    list.dataset.navigation = "native";
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      void import("../../assets/runtime/hero-wave.js?rev=20261122-refract-lightfront")
        .then(({ renderFolderStock }) => renderFolderStock(list.querySelectorAll(".project-folder__front")))
        .catch(() => { /* The existing cardstock remains visible without WebGL. */ });
    }, { rootMargin: "240px" });
    observer.observe(list);
  });
}
