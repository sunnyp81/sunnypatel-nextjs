import Markdoc, { type Config } from "@markdoc/markdoc";
import React from "react";
import { ServiceMiniCta } from "@/components/services/ServiceMiniCta";
import { GlowChartFigure, GlowPullquote, GlowStat, GlowStatRow } from "@/components/glow/glow-blocks";

export const markdocConfig: Config = {
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
      },
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderMarkdoc(content: any) {
  const node = content?.node ?? content;
  const transformed = Markdoc.transform(node, markdocConfig);
  return Markdoc.renderers.react(transformed, React, {
    components: { ServiceMiniCta, GlowPullquote, GlowStat, GlowStatRow, GlowChartFigure },
  });
}
