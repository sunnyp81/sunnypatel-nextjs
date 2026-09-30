export type PageResponse = { url: string; text: string; contentType: string; lastModified: string | null };

export async function fetchPage(url: string): Promise<PageResponse> {
  const response = await fetch("/api/fetch-page", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Page fetch failed.");
  return data as PageResponse;
}

export function downloadText(name: string, text: string, type = "text/plain") {
  const objectUrl = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a"); link.href = objectUrl; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
