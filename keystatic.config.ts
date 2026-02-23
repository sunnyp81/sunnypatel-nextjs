import { config, fields, collection, singleton } from "@keystatic/core";

const isLocal = process.env.NODE_ENV === "development";

export default config({
  storage: isLocal
    ? { kind: "local" }
    : {
        kind: "github",
        repo: "sunnyp81/sunnypatel-nextjs",
      },
  ui: {
    brand: { name: "Sunny Patel" },
  },
  singletons: {
    siteSettings: singleton({
      label: "Site Settings",
      path: "src/content/site-settings/",
      schema: {
        siteName: fields.text({ label: "Site Name" }),
        siteUrl: fields.text({ label: "Site URL" }),
        defaultTitle: fields.text({ label: "Default Title Tag" }),
        defaultDescription: fields.text({ label: "Default Meta Description" }),
        ogImage: fields.text({ label: "Default OG Image URL" }),
        phone: fields.text({ label: "Phone" }),
        email: fields.text({ label: "Email" }),
        location: fields.text({ label: "Location" }),
        linkedin: fields.text({ label: "LinkedIn URL" }),
      },
    }),
    about: singleton({
      label: "About Page",
      path: "src/content/pages/about/",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        h1: fields.text({ label: "Page Heading (H1)" }),
        subtitle: fields.text({ label: "Subtitle", multiline: true }),
        content: fields.markdoc({ label: "Page Content" }),
      },
    }),
    contact: singleton({
      label: "Contact Page",
      path: "src/content/pages/contact/",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        h1: fields.text({ label: "Page Heading (H1)" }),
        subtitle: fields.text({ label: "Subtitle", multiline: true }),
        content: fields.markdoc({ label: "Page Content" }),
      },
    }),
    servicesIndex: singleton({
      label: "Services Index Page",
      path: "src/content/pages/services-index",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        h1: fields.text({ label: "Page Heading (H1)" }),
        subtitle: fields.text({ label: "Subtitle", multiline: true }),
      },
    }),
    portfolioIndex: singleton({
      label: "Portfolio Index Page",
      path: "src/content/pages/portfolio-index",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        h1: fields.text({ label: "Page Heading (H1)" }),
        subtitle: fields.text({ label: "Subtitle", multiline: true }),
      },
    }),
    blogIndex: singleton({
      label: "Blog Index Page",
      path: "src/content/pages/blog-index",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        h1: fields.text({ label: "Page Heading (H1)" }),
        subtitle: fields.text({ label: "Subtitle", multiline: true }),
      },
    }),
    terms: singleton({
      label: "Terms of Use",
      path: "src/content/pages/terms/",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        content: fields.markdoc({ label: "Page Content" }),
      },
    }),
    privacy: singleton({
      label: "Privacy Policy",
      path: "src/content/pages/privacy/",
      schema: {
        title: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        content: fields.markdoc({ label: "Page Content" }),
      },
    }),
  },
  collections: {
    services: collection({
      label: "Services",
      slugField: "title",
      path: "src/content/services/*/",
      schema: {
        title: fields.slug({ name: { label: "Service Name" } }),
        metaTitle: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        h1: fields.text({ label: "Page Heading (H1)" }),
        subtitle: fields.text({ label: "Subtitle", multiline: true }),
        icon: fields.text({ label: "Icon Name (lucide-react)" }),
        featured: fields.checkbox({ label: "Show on Homepage", defaultValue: false }),
        sortOrder: fields.integer({ label: "Sort Order", defaultValue: 0 }),
        content: fields.markdoc({ label: "Service Content" }),
      },
    }),
    blog: collection({
      label: "Blog Posts",
      slugField: "title",
      path: "src/content/blog/*/",
      schema: {
        title: fields.slug({ name: { label: "Post Title" } }),
        metaTitle: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        date: fields.date({ label: "Publish Date" }),
        lastUpdated: fields.date({ label: "Last Updated Date" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        faqs: fields.array(
          fields.object({
            question: fields.text({ label: "Question" }),
            answer: fields.text({ label: "Answer", multiline: true }),
          }),
          {
            label: "FAQs",
            itemLabel: (props) => props.fields.question.value || "FAQ",
          }
        ),
        content: fields.markdoc({ label: "Post Content" }),
      },
    }),
    portfolio: collection({
      label: "Portfolio",
      slugField: "title",
      path: "src/content/portfolio/*/",
      schema: {
        title: fields.slug({ name: { label: "Project Name" } }),
        metaTitle: fields.text({ label: "Title Tag" }),
        description: fields.text({ label: "Meta Description", multiline: true }),
        ogImage: fields.text({ label: "OG Image URL" }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        featured: fields.checkbox({ label: "Featured", defaultValue: false }),
        // Structured case study fields
        client: fields.text({ label: "Client Name" }),
        industry: fields.text({ label: "Industry" }),
        services: fields.text({ label: "Services Delivered" }),
        year: fields.text({ label: "Year" }),
        problem: fields.text({ label: "The Problem", multiline: true }),
        solution: fields.text({ label: "The Solution", multiline: true }),
        result: fields.text({ label: "The Result", multiline: true }),
        metrics: fields.array(
          fields.object({
            value: fields.text({ label: "Value (e.g. +340%)" }),
            label: fields.text({ label: "Label (e.g. Organic Traffic)" }),
          }),
          { label: "Result Metrics", itemLabel: (props) => props.fields.label.value }
        ),
        testimonialText: fields.text({ label: "Testimonial Quote", multiline: true }),
        testimonialAuthor: fields.text({ label: "Testimonial Author" }),
        testimonialRole: fields.text({ label: "Testimonial Role / Company" }),
        content: fields.markdoc({ label: "Additional Case Study Content" }),
      },
    }),
  },
});
