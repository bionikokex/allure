import { setWorldConstructor, IWorldOptions, World as CucumberWorld } from "@cucumber/cucumber";
import type { BrowserContext, Page } from "playwright";
import type { Pickle } from "@cucumber/messages";

export class World extends CucumberWorld {
  context!: BrowserContext;
  page!: Page;
  pickle!: Pickle;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(World);
