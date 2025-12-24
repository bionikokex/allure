import {
  BeforeAll,
  AfterAll,
  Before,
  After,
  setDefaultTimeout,
  Status,
} from "@cucumber/cucumber";
import { chromium, type Browser } from "playwright";

import fs from "node:fs";
import path from "node:path";
import * as allure from "allure-js-commons";

let browser: Browser;
setDefaultTimeout(60_000);

const RESULTS_DIR = process.env.ALLURE_RESULTS_DIR ?? "allure-results";
const TRACES_DIR = process.env.TRACES_DIR ?? "traces";

function safeName(name: string) {
  return name.replace(/[\\/:*?"<>|]+/g, "_").slice(0, 150);
}

function logResultsDir(prefix: string) {
  const abs = path.resolve(RESULTS_DIR);
  console.log(`[allure][${prefix}] resultsDir=${RESULTS_DIR}`);
  console.log(`[allure][${prefix}] resultsAbs=${abs}`);
  console.log(`[allure][${prefix}] exists=${fs.existsSync(abs)}`);
  if (fs.existsSync(abs)) {
    const list = fs.readdirSync(abs);
    console.log(`[allure][${prefix}] filesCount=${list.length}`);
    console.log(`[allure][${prefix}] sample=${JSON.stringify(list.slice(0, 30))}`);
  }
}

function statFile(filePath: string, label: string) {
  const abs = path.resolve(filePath);
  const exists = fs.existsSync(abs);
  console.log(`[fs][${label}] path=${filePath}`);
  console.log(`[fs][${label}] abs=${abs}`);
  console.log(`[fs][${label}] exists=${exists}`);
  if (!exists) return;
  const s = fs.statSync(abs);
  console.log(`[fs][${label}] size=${s.size}`);
  console.log(`[fs][${label}] mtime=${s.mtime.toISOString()}`);
}

BeforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

AfterAll(async () => {
  await browser?.close();
});

Before(async function () {
  this.context = await browser.newContext();

  // включаем трейс, иначе zip может быть пустым/не создаться
  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  this.page = await this.context.newPage();
});

After(async function (scenario) {
  // ВАЖНО: делаем attach до close()
  const scenarioName = safeName(scenario.pickle.name);
  const tracePath = path.join(TRACES_DIR, `${scenarioName}.zip`);

  console.log(`\n[hook][After] scenario="${scenario.pickle.name}" status=${scenario.result?.status}`);
  logResultsDir("before");

  // 1) Останавливаем трейс и сохраняем zip
  fs.mkdirSync(TRACES_DIR, { recursive: true });
  await this.context.tracing.stop({ path: tracePath });
  statFile(tracePath, "trace-created");

  // 2) Скрин (для контроля, что attachments вообще пишутся)
  const png = await this.page.screenshot({ fullPage: true });
  console.log(`[hook][After] screenshot size=${png.length}`);
  await allure.attachment("screenshot", png, { contentType: "image/png", fileExtension: "png" });

  // 3) Trace attach — ВАРИАЦИЯ A: через Buffer + vnd.* (как тебе нужно)
  if (fs.existsSync(tracePath)) {
    const buf = fs.readFileSync(tracePath);
    console.log(`[hook][After] trace buffer size=${buf.length}`);
    await allure.attachment("trace-buffer-vnd", buf, {
      contentType: "application/vnd.allure.playwright-trace",
      fileExtension: "zip",
    });
  }

  // 4) Trace attach — ВАРИАЦИЯ B: через attachmentPath (ссылка на файл)
  if (fs.existsSync(tracePath)) {
    await allure.attachmentPath("trace-path-vnd", path.resolve(tracePath), {
      contentType: "application/vnd.allure.playwright-trace",
      fileExtension: "zip",
    });
    console.log(`[hook][After] attached by path`);
  }

  // 5) Trace attach — ВАРИАЦИЯ C: как обычный zip (для диагностики)
  if (fs.existsSync(tracePath)) {
    const buf = fs.readFileSync(tracePath);
    await allure.attachment("trace-buffer-zip", buf, {
      contentType: "application/zip",
      fileExtension: "zip",
    });
  }

  logResultsDir("after-attachments");

  // Закрываем контекст в конце
  await this.context?.close();

  // Доп. лог: если attachments “не в result”, часто видно по отсутствию новых attachment-файлов
  logResultsDir("after-context-close");
});
