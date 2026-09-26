import Markdoc, { type Config } from "@markdoc/markdoc";
import React from "react";
import { hasLightVariant, lightVariantPath } from "@/lib/light-image";
import { ServiceMiniCta } from "@/components/services/ServiceMiniCta";
import { LocalPackCalculator } from "@/components/glow/local-pack-calculator";
import { AgencyRedFlagScorer, ResourcingPicker, SeoQuoteChecker } from "@/components/glow/buyer-tools";
import {
  GlowChartFigure,
  GlowPanel,
  GlowPanelRow,
  GlowProcess,
  GlowProcessStep,
  GlowPullquote,
  GlowStat,
  GlowStatRow,
} from "@/components/glow/glow-blocks";

// Themed swap for markdown `![alt](/images/...)` images (e.g. the Berkshire
// coverage/results charts inlined in service content). Markdoc's default
// image node renders a plain <img>, which this preserves; it only adds a
// light-mode sibling when a `.light.<ext>` file exists in the manifest.
export function MarkdocImage({ src, alt, title }: { src: string; alt?: string; title?: string }) {
  if (!hasLightVariant(src)) {
    return <img src={src} alt={alt ?? ""} title={title} loading="lazy" />;
  }
  return (
    <>
      <img src={src} alt={alt ?? ""} title={title} loading="lazy" className="hidden dark:block" />
      <img src={lightVariantPath(src)} alt={alt ?? ""} title={title} loading="lazy" className="dark:hidden" />
    </>
  );
}

export const markdocConfig: Config = {
  nodes: {
    image: {
      ...Markdoc.nodes.image,
      render: "MarkdocImage",
    },
  },
  tags: {
    cta: {
      render: "ServiceMiniCta",
      attributes: {
        heading: { type: String },
        text: { type: String },
      },
    },
    pullquote: {
      render: "GlowPullquote",
      attributes: {
        cite: { type: String },
      },
    },
    stat: {
      render: "GlowStat",
      selfClosing: true,
      attributes: {
        value: { type: String, required: true },
        label: { type: String, required: true },
        source: { type: String },
      },
    },
    stats: {
      render: "GlowStatRow",
    },
    chart: {
      render: "GlowChartFigure",
      selfClosing: true,
      attributes: {
        type: { type: String, default: "bar", matches: ["bar", "line", "donut"] },
        title: { type: String, required: true },
        data: { type: String, required: true },
        source: { type: String },
        eyebrow: { type: String },
        prefix: { type: String },
        suffix: { type: String },
        highlight: { type: String },
        series: { type: String },
      },
    },
    panel: {
      render: "GlowPanel",
      attributes: {
        eyebrow: { type: String },
        title: { type: String },
        tone: { type: String, matches: ["good", "bad"] },
        id: { type: String },
      },
    },
    panels: {
      render: "GlowPanelRow",
    },
    process: {
      render: "GlowProcess",
    },
    step: {
      render: "GlowProcessStep",
      selfClosing: true,
      attributes: {
        title: { type: String, required: true },
        detail: { type: String, required: true },
      },
    },
    quotecheck: { render: "SeoQuoteChecker", selfClosing: true },
    agencyscore: { render: "AgencyRedFlagScorer", selfClosing: true },
    resourcepicker: { render: "ResourcingPicker", selfClosing: true },
    localpackcalc: {
      render: "LocalPackCalculator",
      selfClosing: true,
      attributes: {
        variant: { type: String, matches: ["dental"] },
      },
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderMarkdoc(content: any) {
  const node = content?.node ?? content;
  const transformed = Markdoc.transform(node, markdocConfig);
  return Markdoc.renderers.react(transformed, React, {
    components: {
      MarkdocImage,
      ServiceMiniCta,
      GlowPullquote,
      GlowStat,
      GlowStatRow,
      GlowChartFigure,
      GlowPanel,
      GlowPanelRow,
      GlowProcess,
      GlowProcessStep,
      LocalPackCalculator,
      SeoQuoteChecker,
      AgencyRedFlagScorer,
      ResourcingPicker,
    },
  });
}
