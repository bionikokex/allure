import { BeforeAll, AfterAll, Before, After, AfterStep, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, type Browser } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { step, attachment } from "allure-js-commons";

import type { ITestStepHookParameter } from "@cucumber/cucumber/lib/support_code_library_builder/types";
import {World} from "src/types/world";

let browser: Browser;
setDefaultTimeout(60_000);

const TRACES_DIR = process.env.TRACES_DIR ?? "traces";
const safeName = (s: string) => s.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 150);

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

AfterAll(async () => {
  await browser?.close();
});

Before(async function (this: World, p) {
  this.pickle = p.pickle;
  this.context = await browser.newContext();
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  this.page = await this.context.newPage();
});

AfterStep(async function (this: World, p: ITestStepHookParameter) {
  if (p.result?.status !== "FAILED") return;

  const name = safeName(this.pickle.name);
  const traceZip = path.resolve(TRACES_DIR, `${name}.zip`);
  fs.mkdirSync(TRACES_DIR, { recursive: true });

  await this.context.tracing.stop({ path: traceZip });

  // todo Рабочий вариант =)
  // await step("trace", async () => {
  //   const buf = fs.readFileSync(traceZip);
  //   await attachment("trace", buf, "application/vnd.allure.playwright-trace");
  // });
});

After(async function (this: World) {
  //todo Нерабочий вариант =(
  const name = safeName(this.pickle.name);
  const traceZip = path.resolve(TRACES_DIR, `${name}.zip`);
  fs.mkdirSync(TRACES_DIR, { recursive: true });
  await step("trace", async () => {
    const buf = fs.readFileSync(traceZip);
    await attachment("trace", buf, "application/vnd.allure.playwright-trace");
  });
  await this.context?.close();
});
