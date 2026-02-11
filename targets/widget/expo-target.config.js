/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => ({
  type: "widget",
  name: "CaroWidget",
  displayName: "Caro",
  deploymentTarget: "17.0",
  colors: {
    $widgetBackground: "#fff",
    $accent: "#4880ED",
  },
  images: {
    bbcar: "../../src/assets/icons/bbcar.png",
    bshopping: "../../src/assets/icons/bshopping.png",
    bcoupon: "../../src/assets/icons/bcoupon.png",
    bcoin: "../../src/assets/icons/bcoin.png",
  },
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"],
  },
});
