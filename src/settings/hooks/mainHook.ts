import { BeforeAll, AfterAll, Before, After, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, Browser, BrowserContext, Page } from 'playwright';
import * as allure from 'allure-js-commons';

let browser: Browser;

setDefaultTimeout(60_000);

declare global {
  var __ctx: { context?: BrowserContext; page?: Page };
}

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true });
  global.__ctx = {};
});

Before(async function () {
  global.__ctx.context = await browser.newContext();
  global.__ctx.page = await global.__ctx.context.newPage();
});

After(async function ({ result }) {
  if (result?.status === Status.FAILED && global.__ctx.page) {
    const buf = await global.__ctx.page.screenshot({ fullPage: true });
    await allure.attachment('Failure screenshot', buf, 'image/png');
  }
  await global.__ctx.context?.close();
});

AfterAll(async () => {
  await browser?.close();
});
