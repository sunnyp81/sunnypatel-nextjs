type AnalyticsValue = string | number | boolean | undefined;

const TOOL_JOURNEY_KEY = "sp_tool_journey";
const TOOL_ACTIONS: Record<string, string> = {
  schema_copy: "schema_generator",
  schema_download: "schema_generator",
  keyword_complete: "keyword_scraper",
  keyword_download: "keyword_scraper",
  prompt_copy: "seo_prompts",
};
const TOOL_IDS = new Set(Object.values(TOOL_ACTIONS));

export function getToolJourney(): { last_tool_used?: string; tools_used?: string; tool_count?: number } {
  if (typeof window === "undefined") return {};
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(TOOL_JOURNEY_KEY) || "[]");
    if (!Array.isArray(value)) return {};
    const ids = [...new Set(value.filter((item): item is string => typeof item === "string" && TOOL_IDS.has(item)))].slice(-3);
    return ids.length ? { last_tool_used: ids.at(-1), tools_used: ids.join(","), tool_count: ids.length } : {};
  } catch { return {}; }
}

export function trackEvent(eventName: string, params: Record<string, AnalyticsValue>) {
  if (typeof window === "undefined") return;
  const tool = TOOL_ACTIONS[eventName];
  const succeeded = !params.status || params.status === "success";
  if (tool && succeeded && !(eventName === "keyword_complete" && Number(params.unique_keyword_count ?? 0) === 0)) {
    try {
      const previous = getToolJourney().tools_used?.split(",") || [];
      sessionStorage.setItem(TOOL_JOURNEY_KEY, JSON.stringify([...previous.filter(id => id !== tool), tool]));
    } catch { /* Storage can be unavailable; tool use still works. */ }
  }
  const analyticsWindow = window as Window & { dataLayer?: unknown[][] };
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
  }
  window.gtag("event", eventName, params);
}
