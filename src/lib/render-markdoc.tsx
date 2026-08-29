import Markdoc, { type Config } from "@markdoc/markdoc";
import React from "react";
import { ServiceMiniCta } from "@/components/services/ServiceMiniCta";

export const markdocConfig: Config = {
  tags: {
    cta: {
      render: "ServiceMiniCta",
      attributes: {
        heading: { type: String },
        text: { type: String },
      },
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderMarkdoc(content: any) {
  const node = content?.node ?? content;
  const transformed = Markdoc.transform(node, markdocConfig);
  return Markdoc.renderers.react(transformed, React, {
    components: { ServiceMiniCta },
  });
}
