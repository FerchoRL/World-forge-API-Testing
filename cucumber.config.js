module.exports = {
  default: {
    paths: ['domains/**/*.feature'],
    require: ['domains/**/*.steps.ts'],
    requireModule: ['ts-node/register'],
    publishQuiet: true,
    format: [
      'progress',
      'html:reports/cucumber-report.html'
    ]
  }
}
