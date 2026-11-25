/* Server-side only. Never log the response body, document ID or token. */
export function googleClient({token, request = fetch}) {
  if (typeof token !== "string" || !token.trim()) throw new Error("CMS_AUTH_REQUIRED");
  async function get(url) {
    let response;
    try {
      response = await request(url, {
        headers: {Authorization: "Bearer " + token},
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      });
    } catch { throw new Error("CMS_GOOGLE_REQUEST_FAILED"); }
    if (!response.ok) throw new Error("CMS_GOOGLE_HTTP_" + response.status);
    try { return await response.json(); }
    catch { throw new Error("CMS_GOOGLE_INVALID_JSON"); }
  }
  function id(value) {
    if (!/^[a-zA-Z0-9_-]{10,200}$/.test(value || "")) throw new Error("CMS_DOCUMENT_ID_INVALID");
    return encodeURIComponent(value);
  }
  return {
    async version(documentId) {
      const file = await get("https://www.googleapis.com/drive/v3/files/" + id(documentId) + "?fields=version,trashed,mimeType&supportsAllDrives=true");
      if (file.trashed || file.mimeType !== "application/vnd.google-apps.document" || !/^\d+$/.test(file.version || "")) throw new Error("CMS_DOCUMENT_UNAVAILABLE");
      return file.version;
    },
    async document(documentId) {
      const doc = await get("https://docs.googleapis.com/v1/documents/" + id(documentId) + "?includeTabsContent=true&suggestionsViewMode=PREVIEW_WITHOUT_SUGGESTIONS");
      if (doc.documentId !== documentId) throw new Error("CMS_DOCUMENT_MISMATCH");
      return doc;
    },
  };
}

export async function stableDocument(client, documentId) {
  const before = await client.version(documentId);
  const document = await client.document(documentId);
  const after = await client.version(documentId);
  if (before !== after) throw new Error("CMS_DOCUMENT_CHANGED_DURING_READ");
  return {document, version: after};
}
