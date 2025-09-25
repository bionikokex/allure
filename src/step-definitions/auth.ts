import {When} from "@cucumber/cucumber";
import {World} from "../types/types";


When('я захожу на страницу {string}', async function (this: World, url: string) {
  await this.page.goto(url);
});
