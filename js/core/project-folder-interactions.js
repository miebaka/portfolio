/* Every project is a normal link. CSS supplies the folder lift; no coordinate
   remapping, click interception or two-tap touch preview is needed. */
export function initProjectFolderInteractions() {
  document.querySelectorAll(".project-folder-stack__cards").forEach(list => {
    list.dataset.navigation = "native";
  });
}
