module.exports = {
  default: {
    paths: ["tests/features/**/*.feature"],
    require: ["tests/features/steps/**/*.js", "tests/features/support/**/*.js"],
    format: ["progress-bar"],
    publishQuiet: true,
  },
};
