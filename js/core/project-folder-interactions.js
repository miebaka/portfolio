/* Project folders are native links. CSS owns the paper appearance and
   hover/focus movement; no GPU renderer, pointer remapping or JS preview. */
export function initProjectFolderInteractions() {
  document.querySelectorAll(".project-folder-stack__cards").forEach(list => {
    list.dataset.navigation = "native";
  });
}
