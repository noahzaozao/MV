/*:
 * @plugindesc This plugin provides a function that would not turn off the screen during the game on Android
 * @author biud436
 */

var Imported = Imported || {};
Imported.RS_WakeLock = true;
(function () {
  if(!Utils.isMobileDevice() || (!!window.WakeLock) === false) {
    Imported.RS_WakeLock = undefined;
    return false;
  }
  if(!!navigator.userAgent.match(/Android/)) {
    WakeLock.init();
  }
})();
