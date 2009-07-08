$(document).ready(function () {
  if (VanadiumConfig && typeof(VanadiumConfig) === "object") {
    Vanadium.each(VanadiumConfig, function(k, v) {
      Vanadium.config[k] = v;
    })
  }
  ;
  Vanadium.init();
});
