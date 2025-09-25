import {When} from "@cucumber/cucumber";
import {World} from "../types/types";


When('I open the page {string}', async function (this: World, url: string) {
  await this.page.goto(url);
});
