/* Same-origin, CSP-safe early theme bootstrap. */
(function (root) {
  root.classList.replace("no-js", "has-js");
  root.dataset.theme = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
})(document.documentElement);
