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
    bbcar: "../../assets/icons/bbcar.png",
    bshopping: "../../assets/icons/bshopping.png",
    bcoupon: "../../assets/icons/bcoupon.png",
    bcoin: "../../assets/icons/bcoin.png",
  },
  entitlements: {
    "com.apple.security.application-groups":
      config.ios.entitlements["com.apple.security.application-groups"],
  },
});
