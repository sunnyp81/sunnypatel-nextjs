import Markdoc from "@markdoc/markdoc";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderMarkdoc(content: any) {
  const node = content?.node ?? content;
  const transformed = Markdoc.transform(node);
  return Markdoc.renderers.react(transformed, React);
}
