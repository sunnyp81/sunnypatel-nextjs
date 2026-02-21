#!/usr/bin/env node
/**
 * SVG Preview Tool
 * Takes an SVG file path, renders it with Puppeteer, saves a PNG screenshot.
 * Usage: node tmp/preview-svg.js public/images/blog/seo-mistakes-v2.svg
 */
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function preview(svgPath) {
  const abs = path.resolve(svgPath);
  if (!fs.existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }

  const outPng = abs.replace(/\.svg$/, "-preview.png");

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  const fileUrl = "file:///" + abs.replace(/\\/g, "/");
  await page.goto(fileUrl, { waitUntil: "networkidle0" });

  await page.screenshot({ path: outPng, type: "png" });
  await browser.close();

  console.log(`Preview saved: ${outPng}`);
  return outPng;
}

const svgArg = process.argv[2];
if (!svgArg) {
  console.error("Usage: node tmp/preview-svg.js <path-to-svg>");
  process.exit(1);
}

preview(svgArg).catch((e) => {
  console.error(e);
  process.exit(1);
});
