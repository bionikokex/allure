const os = require("node:os");
const process = require("node:process");

const getPlaywrightVersion = () => {
    try {
        return require("playwright/package.json").version;
    } catch {
        return "not_installed";
    }
};

const commonConfig = {
    requireModule: ["ts-node/register", "allure-cucumberjs"],
    require: [
        "src/settings/world.ts",
        "src/settings/hooks/mainHook.ts",
        "src/step-definitions/**/*.ts",
    ],
    format: ["progress", "rerun:@rerun.txt", "allure-cucumberjs/reporter"],
    formatOptions: {
        resultsDir: "./allure-results",
        globalLabels: { layer: "ui tests" },
        environmentInfo: {
            playwright_version: getPlaywrightVersion(),
            os_platform: os.platform(),
            os_release: os.release(),
            os_version: os.version(),
            node_version: process.version,
            timestamp: new Date().toISOString(),
            browser: process.env.BROWSER || "chromium",
        },
    },
};

module.exports = {
    default: { ...commonConfig, paths: ["./features/**/*.feature"],},
    oneScenario: { ...commonConfig },
};
