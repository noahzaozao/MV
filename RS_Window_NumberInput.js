/*:
 * @plugindesc This plugin allows you to type the number value <RS_Window_NumberInput>
 * @author biud436
 * 
 * @param Font Size
 * @desc Specify the font size in name processing.
 * @default 28
 * 
 * @param Line Height
 * @desc Specify the line height for window.
 * @default 36
 * 
 * @param Window Width
 * @desc Calculate the window width.
 * (this parameter evaluates JavaScript code)
 * @default 480
 * 
 * @param Window Height
 * @desc Calculate the window height.
 * (this parameter evaluates JavaScript code)
 * @default this.fittingHeight(6);
 * 
 * @param Default Button Width
 * @desc Specify the default button width.
 * @default Math.floor(this.width/this.maxCols());
 * 
 * @param Center Spacing
 * @desc Specify the spacing value in the middle space.
 * @default 0
 * 
 * @param Button Type
 * @type boolean
 * @desc Sets the button width how to calculate the width.
 * @default false
 * @on Crop
 * @off Expand
 * 
 * @param Number Map
 * @desc Specify the number map.
 * @default 7, 8, 9, 4, 5, 6, 1, 2, 3, -, 0, ., Backspace, Ok
 * 
 * @param --- Image Name
 *
 * @param Background Image
 * @parent --- Image Name
 * @desc Specifies to import file that you want from img/titles1 folder.
 * @default World
 * @require 1
 * @dir img/titles1
 * @type file
 * 
 * @help
 * =============================================================================
 * Usage
 * =============================================================================
 * You need to add the plugin command called StartNumberInput.
 * 
 * StartNumberInput varId:1 maxLength:8 isNumber:true
 * 
 * =============================================================================
 * Change Log
 * =============================================================================
 * 2018.10.15 (v1.0.0) - First Release.
 */

 var Imported = Imported || {};
 Imported.RS_Window_NumberInputImpl = true;

 var RS = RS || {};
 RS.Window_NumberInputImpl = RS.Window_NumberInputImpl || {};
 RS.Window_NumberInputImpl.Params = RS.Window_NumberInputImpl.Params || {};

(function () {

  "use strict";

  var parameters = $plugins.filter(function (i) {
    return i.description.contains('<RS_Window_NumberInput>');
  });

  parameters = (parameters.length > 0) && parameters[0].parameters;  

  RS.Window_NumberInputImpl.Params.fontSize = parseInt(parameters["Font Size"] || 28);
  RS.Window_NumberInputImpl.Params.windowWidthEval = parameters["Window Width"] || "480";
  RS.Window_NumberInputImpl.Params.windowHeightEval = parameters["Window Height"] || "this.fittingHeight(6);";
  RS.Window_NumberInputImpl.Params.lineHeight = parseInt(parameters["Line Height"] || 36);
  RS.Window_NumberInputImpl.Params.buttonWidth = parameters["Default Button Width"] || "42";
  RS.Window_NumberInputImpl.Params.isCropped = Boolean(parameters["Button Type"] === "true");
  RS.Window_NumberInputImpl.Params.centerSpacing = parseInt(parameters["Center Spacing"] || 0);
  RS.Window_NumberInputImpl.Params.backgroundImage = parameters["Background Image"];

  function Window_NumberInputImpl() {
    this.initialize.apply(this, arguments);
  }

  Window_NumberInputImpl.prototype = Object.create(Window_NameInput.prototype);
  Window_NumberInputImpl.prototype.constructor = Window_NumberInputImpl;

  Window_NumberInputImpl.DATA = (function() {
    var data = parameters["Number Map"];
    var _data = {};
    _data.maps = data.split(",").map(function(i) {
      return i.trim();
    });
    _data.okIndex = _data.maps.length - 1;
    _data.backSpaceIndex = _data.maps.length - 2;
    return _data;
  })();

  console.log(Window_NumberInputImpl.DATA);

  Window_NumberInputImpl.prototype.initialize = function(editWindow) {
    var self = this;
    this._dataFromTable = {};
    this._dataFromTable.maxItems = Window_NumberInputImpl.DATA.maps.length;
    this._dataFromTable.okIndex = Window_NumberInputImpl.DATA.okIndex;
    this._dataFromTable.backIndex = Window_NumberInputImpl.DATA.backSpaceIndex;
    Window_NameInput.prototype.initialize.call(this, editWindow);
  };

  Window_NumberInputImpl.prototype.windowHeight = function() {
      return eval(RS.Window_NumberInputImpl.Params.windowHeightEval);
  };

  Window_NumberInputImpl.prototype.standardFontSize = function() {
    return RS.Window_NumberInputImpl.Params.fontSize;
  };

  Window_NumberInputImpl.prototype.lineHeight = function() {
    return RS.Window_NumberInputImpl.Params.lineHeight;
  };

  Window_NumberInputImpl.prototype.table = function() {
    return [Window_NumberInputImpl.DATA.maps];
  };

  Window_NumberInputImpl.prototype.maxCols = function() {
      return 3;
  };

  Window_NumberInputImpl.prototype.maxItems = function() {
    return this.table().length;
  };

  Window_NumberInputImpl.prototype.hitTest = function(x, y) {
    var maxItems = this._dataFromTable.maxItems;
    if (this.isContentsArea(x, y)) {
        var cx = x - this.padding;
        var cy = y - this.padding;
        var topIndex = this.topIndex();
        for (var i = 0; i < this.maxPageItems(); i++) {
            var index = topIndex + i;
            if (index < maxItems) {
                var rect = this.itemRect(index);
                var right = rect.x + rect.width;
                var bottom = rect.y + rect.height;
                if (cx >= rect.x && cy >= rect.y && cx < right && cy < bottom) {
                    var c = this.table()[this._page][index];
                    if(c !== '') {
                      return index;
                    }
                }
            }
        }
    }
    return -1;
  };  

  Window_NumberInputImpl.prototype.character = function() {
    var isNumber = this._editWindow.isNumber();
    var str = this.table()[this._page][this._index];

    if(this._index < 9) {
      return str;
    }
    if(this._index === 10) { // 0
      return str;
    }
    if([9, 11].contains(this._index) && !isNumber) { 
      return str;      
    }    

    return '';

};

  Window_NumberInputImpl.prototype.isPageChange = function() {
    return false;
  };

  Window_NumberInputImpl.prototype.processCursorMove = function() {
    var lastPage = this._page;
    Window_Selectable.prototype.processCursorMove.call(this);
    this.updateCursor();
    if (this._page !== lastPage) {
        SoundManager.playCursor();
    }
  };

  Window_NumberInputImpl.prototype.updateCursor = function() {
    var rect = this.itemRect(this._index);
    this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
  };

  Window_NumberInputImpl.prototype.cursorPagedown = function() {
  };

  Window_NumberInputImpl.prototype.cursorPageup = function() {
  };

  Window_NumberInputImpl.prototype.cursorDown = function(wrap) {
      var maxCols = this.maxCols();    
      var limited = this._dataFromTable.maxItems - maxCols;
      var max = this._dataFromTable.maxItems;
      if (this._index < limited || wrap) {
          this._index = (this._index + maxCols) % max;
      }
  };

  Window_NumberInputImpl.prototype.cursorUp = function(wrap) {
      var maxCols = this.maxCols();    
      var limited = this._dataFromTable.maxItems - maxCols;
      var max = this._dataFromTable.maxItems;    
      if (this._index >= maxCols || wrap) {
          this._index = (this._index + limited) % max;
      }
  };

  Window_NumberInputImpl.prototype.cursorRight = function(wrap) {
      var maxCols = this.maxCols();     
      var limited = this.maxCols() - 1; 
      if (this._index % maxCols < limited) {
          this._index++;
      } else if (wrap) {
          this._index -= limited;
      }
  };

  Window_NumberInputImpl.prototype.cursorLeft = function(wrap) {
    var maxCols = this.maxCols();     
    var limited = this.maxCols() - 1;     
      if (this._index % maxCols > 0) {
          this._index--;
      } else if (wrap) {
          this._index += limited;
      }
  };

  Window_NumberInputImpl.prototype.processHandling = function() {
      if (this.isOpen() && this.active) {
          if (Input.isRepeated('cancel')) {
              this.processBack();
          }
          if (Input.isRepeated('ok')) {
              this.processOk();
          }
      }
  };

  Window_NumberInputImpl.prototype.itemRect = function(index) {
    var w = eval(RS.Window_NumberInputImpl.Params.buttonWidth);
    var lineHeight = this.lineHeight();
    return {
        x: index % 3 * w,
        y: Math.floor(index / 3) * lineHeight,
        width: w,
        height: lineHeight
    };
  };

  Window_NumberInputImpl.prototype.refresh = function() {
      var table = this.table();
      this.contents.clear();
      this.resetTextColor();
      for (var i = 0; i < this._dataFromTable.maxItems; i++) {
          var rect = this.itemRect(i);
          rect.x += 3;
          rect.width -= 6;
          this.drawText(table[this._page][i], rect.x, rect.y, rect.width, 'center');
      }
  };

  Window_NumberInputImpl.prototype.isOk = function() {
    return this._index === this._dataFromTable.okIndex;
  };

  Window_NumberInputImpl.prototype.isBack = function () {
    return this._index === this._dataFromTable.backIndex;
  };

  Window_NumberInputImpl.prototype.processOk = function() {
    if (this.character()) {
        this.onNameAdd();
    } else if (this.isOk()) {
        this.onNameOk();
    } else if(this.isBack()) {
        this.processBack();
    }
  };

  //============================================================================
  // Window_NameEdit
  //============================================================================

  function Window_NumberEditImpl() {
    this.initialize.apply(this, arguments);
  }

  Window_NumberEditImpl.prototype = Object.create(Window_NameEdit.prototype);
  Window_NumberEditImpl.prototype.constructor = Window_NumberEditImpl;  

  Window_NumberEditImpl.prototype.initialize = function(varId, maxLength, isNumber) {
    var width = this.windowWidth();
    var height = this.windowHeight();
    var x = (Graphics.boxWidth - width) / 2;
    var y = (Graphics.boxHeight - (height + this.fittingHeight(9) + 8)) / 2;
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this._name = String($gameVariables.value(varId)).slice(0, maxLength);
    this._index = this._name.length;
    this._maxLength = maxLength;
    this._isNumber = isNumber;
    this._defaultName = this._name;
    this.deactivate();
    this.refresh();        
  };

  Window_NumberEditImpl.prototype.isNumber = function() {
    return this._isNumber;
  };

  Window_NumberEditImpl.prototype.windowWidth = function() {
    return eval(RS.Window_NumberInputImpl.Params.windowWidthEval);
  };

  Window_NumberEditImpl.prototype.refresh = function() {
    this.contents.clear();
    for (var i = 0; i < this._maxLength; i++) {
        this.drawUnderline(i);
    }
    for (var j = 0; j < this._name.length; j++) {
        this.drawChar(j);
    }
    var rect = this.itemRect(this._index);
    this.setCursorRect(rect.x, rect.y, rect.width, rect.height);      
  };

  Window_NumberEditImpl.prototype.left = function() {
    var nameCenter = this.contentsWidth() / 2;
    var nameWidth = (this._maxLength + 1) * this.charWidth();
    return Math.min(nameCenter - nameWidth / 2, this.contentsWidth() - nameWidth);
  };

  Window_NumberEditImpl.prototype.standardFontSize = function() {
    return RS.Window_NumberInputImpl.Params.fontSize;
  };

  Window_NumberEditImpl.prototype.drawUnderline = function(index) {
    var rect = this.underlineRect(index);
    var color = this.underlineColor();
    this.contents.paintOpacity = 48;
    this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, color);
    this.contents.paintOpacity = 255;
  };

  Window_NumberEditImpl.prototype.drawChar = function(index) {
    var rect = this.itemRect(index);
    this.resetTextColor();
    this.drawText(this._name[index] || '', rect.x, rect.y);
  };  

  //============================================================================
  // Scene_Name
  //============================================================================

  function Scene_NumberInput() {
    this.initialize.apply(this, arguments);
  }

  Scene_NumberInput.prototype = Object.create(Scene_Name.prototype);
  Scene_NumberInput.prototype.constructor = Scene_NumberInput;

  Scene_NumberInput.prototype.initialize = function() {
    Scene_Name.prototype.initialize.apply(this, arguments);
  };

  Scene_NumberInput.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._data = $gameVariables.value(this._varId);
    this.createEditWindow();
    this.createInputWindow();  
  };

  Scene_NumberInput.prototype.prepare = function(variableId, maxLength, isNumber) {
    this._varId = variableId;
    this._maxLength = maxLength;
    this._isNumber = isNumber;
  };

  Scene_NumberInput.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    if(RS.Window_NumberInputImpl.Params.backgroundImage === "") {
      this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    } else {
      this._backgroundBitmap = ImageManager.loadTitle1(RS.Window_NumberInputImpl.Params.backgroundImage);
      this._backgroundSprite.bitmap = this._backgroundBitmap;
      setTimeout(function() {
        if(this._backgroundBitmap.width <= 0 ) {
          this._backgroundBitmap = ImageManager.loadTitle1(RS.Window_NumberInputImpl.Params.backgroundImage);
          this._backgroundSprite.bitmap = this._backgroundBitmap;
        }
      }.bind(this), 0);      
    }
    this.addChild(this._backgroundSprite);    
  };  

  Scene_NumberInput.prototype.createEditWindow = function() {
    this._editWindow = new Window_NumberEditImpl(this._varId, this._maxLength, this._isNumber);
    this.addWindow(this._editWindow);      
  };

  Scene_NumberInput.prototype.createInputWindow = function() {
    this._inputWindow = new Window_NumberInputImpl(this._editWindow);
    this._inputWindow.setHandler('ok', this.onInputOk.bind(this));
    this.addWindow(this._inputWindow);      
  };

  Scene_NumberInput.prototype.onInputOk = function() {
    let value;
    if(this._isNumber) {
      value = parseInt(this._editWindow.name());
      if(value >= 0) {
        $gameVariables.setValue(this._varId, value);
      }  
    } else {
      value = this._editWindow.name();
      $gameVariables.setValue(this._varId, value);      
    }
    this.popScene();      
  };

  //===========================================================================
  // Game_Interpreter
  //===========================================================================

  var alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
      alias_Game_Interpreter_pluginCommand.call(this, command, args);
      if(command === "StartNumberInput") {
        let varId = parseInt(args[0].replace("varId:", "")) || 1;
        let maxLength = parseInt(args[1].replace("maxLength:", "")) || 4;
        let isNumber = Boolean((args[2].replace("isNumber:", "")) === "true");
        SceneManager.push(Scene_NumberInput);
        SceneManager.prepareNextScene(varId, maxLength, isNumber);
      }
  };

})();
