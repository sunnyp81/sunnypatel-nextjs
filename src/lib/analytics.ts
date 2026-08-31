type AnalyticsValue = string | number | boolean | undefined;

export function trackEvent(eventName: string, params: Record<string, AnalyticsValue>) {
  if (typeof window === "undefined") return;
  const analyticsWindow = window as Window & { dataLayer?: unknown[][] };
  analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => analyticsWindow.dataLayer?.push(args);
  }
  window.gtag("event", eventName, params);
}
