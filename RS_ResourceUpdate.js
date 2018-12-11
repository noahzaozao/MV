/*:
 * RS_ResourceUpdate.js
 * @plugindesc This plugin allows you to download adding resource files on PC.
 * @author biud436
 *
 * @param URL_DB
 * @desc Please enter the url that has the version text.
 * @default https://github.com/biud436/MV/raw/master/Laboratory/DBVersion.json
 *
 * @param Current Version
 * @desc Please enter the currently version.
 * @default 0.1.1
 *
 * @help
 * 2016.01.04 (v1.0.0) - First Release.
 * 2018.12.01 (v1.0.1) - Fixed the bug that is not loaded files in RPG Maker MV v1.6.1 or more.
 */
 /*:ko
  * RS_ResourceUpdate.js
  * @plugindesc 인터넷을 통해 리소스를 다운로드 받을 수 있는 플러그인입니다.
  * @author biud436
  *
  * @param URL_DB
  * @desc 파일 목록이 있는 파일의 주소를 적어주시기 바랍니다.
  * @default https://github.com/biud436/MV/raw/master/Laboratory/DBVersion.json
  *
  * @param Current Version
  * @desc 현재 버전을 입력하세요.
  * @default 0.1.1
  *
  * @help
  * 2016.01.04 (v1.0.0) - First Release.
  * 2018.12.01 (v1.0.1) - Fixed the bug that is not loaded files in RPG Maker MV v1.6.1 or more.
  */
var Imported = Imported || {};
Imported.RS_ResourceUpdate = true;

var RS = RS || {};
RS.Net = RS.Net || {};

(function() {

  var http, Stream, fs;
  var parameters = PluginManager.parameters('RS_ResourceUpdate');


  if(!Utils.isMobileDevice()) {
    http = require('https');
    Stream = require('stream').Transform;
    fs = require('fs');
  }

  var DBV_URL = parameters["URL_DB"] || "https://github.com/biud436/MV/raw/master/Laboratory/DBVersion.json";

  RS.Net._dbVersion = '';
  RS.Net._currentVersion = parameters["Current Version"] || '0.1.1';
  RS.Net._list = [];

  /**
   * @memberof RS.Net
   * @method isInit
   */
  RS.Net.isInit = function(stage) {
    if(!Utils.isMobileDevice()) {

      this._folder = (function() {

        var path = require('path');
        var targetPath = path.join(process.mainModule.filename, "..");

        return decodeURIComponent(targetPath);

      })();

      this.initDBVersion();
      this.initList();
    }
  }

  /**
   * @memberof RS.Net
   * @method downloadData
   * @link http://stackoverflow.com/questions/12740659/downloading-images-with-node-js
   */
  RS.Net.downloadData = function(filePath, url, func) {
    http.request(url, function(response) {
      var data = new Stream();
      var ext = url.match(/(\/www|)\/[^\/]*$/);

      if(ext && ext instanceof Array) {
        ext = ext[0];
      }

      response.on('data', function(chunk) {
        data.push(chunk);
      });

      response.on('end', function() {
        fs.writeFileSync('%1%2'.format(filePath, ext), data.read());
        func();
      });

    }).end();
  }

  /**
   * @memberof RS.Net
   * @method allDataDownload
   */
  RS.Net.allDataDownload = function(buf) {
    try {
      var folder = this._folder;
      var picPath = folder + buf.src;
      var length = buf.list.length;
      var req = 1;
      buf.list.forEach(function(data, index, arr) {
        this.downloadData(picPath, data, function() {
            console.log( Math.floor(((req++) / length) * 100));
        });
      }, this);
    } catch(e) {
      console.log("다운로드 실패");
    }
    this.updateCurrentVersion();
    console.log('다운로드가 완료되었습니다');
  }

  /**
   * @memberof RS.Net
   * @method isUpdate
   */
  RS.Net.isUpdate = function() {
    if(RS.Net._currentVersion !== this.getDBVersion()) {
      this.allDataDownload(RS.Net._list);
    } else {
      console.log("현재 버전이 최신 버전입니다");
    }
  }

  RS.Net.initDBVersion = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', DBV_URL);
    xhr.onload = function() {
      if(xhr.status < 400) {
        var json = JsonEx.parse(xhr.responseText);
        RS.Net._dbVersion = json['dbVersion'];
        console.log(RS.Net._dbVersion);
      }
    }
    xhr.send();
  }

  RS.Net.initList = function() {
    var xhr = new XMLHttpRequest();
    var self = this;
    xhr.open('GET', DBV_URL);
    xhr.onload = function() {
      if(xhr.status < 400) {
        var json = JsonEx.parse(xhr.responseText);
        RS.Net._list = json.data.pictures;
        self.isUpdate();
      }
    }
    xhr.send();
  }

  RS.Net.getDBVersion = function() {
    return RS.Net._dbVersion;
  }

  RS.Net.updateCurrentVersion = function() {
    RS.Net._currentVersion = this.getDBVersion();
  }

  var alias_Scene_Boot_initialize = Scene_Boot.prototype.initialize;
  Scene_Boot.prototype.initialize = function() {
      alias_Scene_Boot_initialize.call(this);
      RS.Net.isInit(this);
  };

})();
