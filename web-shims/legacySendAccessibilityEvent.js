/**
 * No-op shim for react-native's legacySendAccessibilityEvent on web.
 * Used when building with expo export --platform web (Expo hosting).
 */
module.exports = { default: function legacySendAccessibilityEvent() {} };
