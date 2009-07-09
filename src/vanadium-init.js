$(document).ready(function () {
  if (typeof(VanadiumConfig) === "object" && VanadiumConfig) {
    Vanadium.each(VanadiumConfig, function(k, v) {
      Vanadium.config[k] = v;
    })
  }
  if (typeof(VanadiumRules) === "object" && VanadiumRules) {
    Vanadium.each(VanadiumRules, function(k, v) {
      Vanadium.rules[k] = v;
    })
  }
  Vanadium.init();
});
