/* Separate text-safe reading colours from the authored physical stock. */
export function projectReadingColors(slug) {
  const palette = {
    "tedx-rsu": ["#4b1742", "#ffffff"],
    rivo: ["#000041", "#ffffff"],
    chopbox: ["#ffc28f", "#000000"],
    "kiki-joshua-notepad": ["#493322", "#ffffff"],
    "christian-poster-a-week": ["#002080", "#ffffff"],
  };
  return palette[slug] || ["#07112b", "#ffffff"];
}
