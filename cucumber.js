export default {
    requireModule: ['ts-node/register'],
    require: ['src/settings/hooks/mainHook.ts', 'src/step-definitions/**/*.ts'],
    format: ['progress', 'allure-cucumberjs/reporter'],
    formatOptions: {
        resultsDir: 'allure-results',
    },
};
