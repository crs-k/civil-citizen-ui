const testConfig = require('../config.js');

const testHeadlessBrowser = process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : false;

exports.config = {
  tests: '../functionalTests/tests/*_tests.js',
  output: process.env.REPORT_DIR || 'test-results/functional',
  helpers: {
    Playwright: {
      url: testConfig.TestUrl,
      show: !testHeadlessBrowser,
      browser: 'chromium',
      waitForTimeout: 20000,
      timeout: 20000,
      waitForAction: 1000,
      waitForNavigation: 'networkidle0',
      ignoreHTTPSErrors: true,
    },
  },
  include: {
    api: './specClaimHelpers/api/steps.js',
  },
  plugins: {
    autoDelay: {
      enabled: true,
      methods: [
        'click',
        'fillField',
        'checkOption',
        'selectOption',
        'attachFile',
        'see',
        'seeInCurrentUrl',
      ],
    },
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  },
  mocha: {
    bail: true,
    reporterOptions: {
      'codeceptjs-cli-reporter': {
        stdout: '-',
        options: {
          steps: false,
        },
      },
      'mocha-junit-reporter': {
        stdout: '-',
        options: {
          mochaFile: process.env.REPORT_FILE || 'test-results/functional/result.xml',
        },
      },
      'mochawesome': {
        stdout: '-',
        options: {
          reportDir: process.env.REPORT_DIR || 'test-results/functional',
          inlineAssets: true,
          json: false,
        },
      },
    },
  },
};
  