import Markdoc from "@markdoc/markdoc";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderMarkdoc(content: any) {
  const transformed = Markdoc.transform(content);
  return Markdoc.renderers.react(transformed, React);
}
