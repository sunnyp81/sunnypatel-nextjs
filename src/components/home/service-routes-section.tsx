import Link from "next/link";

const routes = [
  {
    href: "/services/seo-migration-consultant/",
    anchor: "SEO migration consultant",
    text: "For businesses changing platform, domain, design or URL structure who want to keep the search visibility they have earned.",
  },
  {
    href: "/services/woocommerce-seo-consultant/",
    anchor: "WooCommerce SEO",
    text: "For UK businesses selling through WooCommerce on WordPress.",
  },
  {
    href: "/services/shopify-seo-consultant/",
    anchor: "Shopify SEO",
    text: "For UK Shopify and Shopify Plus merchants and for stores about to move onto Shopify.",
  },
  {
    href: "/services/local-seo/",
    anchor: "Local SEO services",
    text: "For businesses that serve customers in set towns and postcodes and want to show up in Google Maps and local results.",
  },
  {
    href: "/services/ai-search-optimisation/",
    anchor: "AI search optimisation",
    text: "For founders and marketing teams whose customers research a considered purchase.",
  },
] as const;

export function ServiceRoutesSection() {
  return (
    <section
      id="service-routes"
      aria-labelledby="service-routes-heading"
      className="border-t border-hairline py-14 md:py-16 dark:border-white/[0.05]"
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2
          id="service-routes-heading"
          className="text-2xl font-bold text-foreground md:text-3xl"
          style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
        >
          Where do you need my help?
        </h2>
        <ul className="mt-6 grid border-t border-hairline md:grid-cols-2 md:gap-x-12 dark:border-white/[0.08]">
          {routes.map((route) => (
            <li key={route.href} className="border-b border-hairline py-4 dark:border-white/[0.08]">
              <Link
                href={route.href}
                className="text-base font-semibold text-brand-ink underline underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                {route.anchor}
              </Link>
              <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-white/70">
                {route.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
