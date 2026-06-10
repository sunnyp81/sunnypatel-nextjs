import puppeteer from "puppeteer";

const URL = "https://sunnypatel.co.uk/blog/best-aeo-agencies-uk-2026/";
const browser = await puppeteer.launch({ headless: "new" });
const page = await browser.newPage();
const consoleErrors = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

const resp = await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });
const status = resp.status();
const h1 = await page.$eval("h1", (el) => el.textContent.trim()).catch(() => null);
const itemList = await page.evaluate(() =>
  [...document.querySelectorAll('script[type="application/ld+json"]')]
    .some((s) => s.textContent.includes('"ItemList"'))
);
const shotPath = "tmp/aeo-page-proof.png";
await page.screenshot({ path: shotPath, fullPage: false });
await browser.close();

console.log(JSON.stringify({ status, h1, itemListSchema: itemList, consoleErrors, screenshot: shotPath }, null, 2));
