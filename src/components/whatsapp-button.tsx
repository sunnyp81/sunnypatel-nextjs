import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_URL =
  "https://wa.me/447305523333?text=" +
  encodeURIComponent("Hi Sunny, I found you through sunnypatel.co.uk and would like to talk about SEO.");

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message Sunny on WhatsApp (opens in a new tab)"
      data-cta-location="whatsapp_float"
      data-cta-offer="whatsapp_chat"
      className="group fixed right-4 z-40 inline-flex h-14 min-w-14 items-center justify-center gap-2.5 rounded-full border-2 border-[#128C7E] bg-surface-1 px-0 text-[#128C7E] shadow-[var(--elev)] transition-[background-color,color,box-shadow] duration-200 hover:bg-[#25D366] hover:text-[#04210f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:right-6 sm:px-5 dark:border-[#25D366] dark:bg-[#08080d] dark:text-[#25D366] dark:shadow-[0_0_18px_rgba(37,211,102,0.4),inset_0_0_10px_rgba(37,211,102,0.12)] dark:hover:bg-[#25D366] dark:hover:text-[#04210f] dark:hover:shadow-[0_0_30px_rgba(37,211,102,0.65)] print:hidden"
      style={{ bottom: "max(7rem, calc(env(safe-area-inset-bottom) + 6.5rem))" }}
    >
      <FaWhatsapp className="h-7 w-7 shrink-0" aria-hidden="true" />
      <span className="hidden text-sm font-semibold text-foreground transition-colors group-hover:text-[#04210f] sm:inline" style={{ fontFamily: "var(--font-heading)" }}>
        WhatsApp me
      </span>
    </a>
  );
}
