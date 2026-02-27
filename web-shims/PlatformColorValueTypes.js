/**
 * Web shim for react-native's PlatformColorValueTypes.
 * React Native only has .ios.js and .android.js; Metro fails to resolve on web without this.
 * On web we pass through color objects (no native platform color types).
 */
function processColorObject(color) {
  if (color && typeof color === 'object') {
    return color;
  }
  return null;
}

module.exports = { processColorObject };
