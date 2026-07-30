export default {
  paths: ['tests/features/**/*.feature'],
  import: ['tests/features/steps/**/*.js', 'tests/features/support/**/*.js'],
  format: ['progress-bar'],
  publishQuiet: true,
};
