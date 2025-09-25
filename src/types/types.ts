import {World as CucumberWorld} from '@cucumber/cucumber';
import {BrowserContext, Page} from "playwright";

export interface OurWorld extends CucumberWorld {
  context: BrowserContext;
  page: Page;
}

export interface World extends OurWorld {
  credential: { login: string; password: string };
  utils: {
    Field: any;
  };
  copiedText: string;
  url: string;
}
