exports.isSupported = true;

var Application = require('application');
var FileSystem = require("file-system");
var TypeUtils = require("utils/types");

var actionRunnable = java.lang.Runnable.extend({
    action: undefined,
    
    run: function() {
        this.action();
    }
});

var _activity;
var _rcSelectFile;
var _selectFileCallback;

function initialize() {
    _activity = Application.android.foregroundActivity || Application.android.startActivity;
    _rcSelectFile = 1744057863;

    var onActivityResultAction = function(requestCode, resultCode, intent) {
        var sfCB = _selectFileCallback;

        switch (requestCode) {
            case _rcSelectFile:
                if (!TypeUtils.isNullOrUndefined(sfCB)) {
                    try {
                        var resultCtx = {};

                        if (resultCode == android.app.Activity.RESULT_OK) {
                            resultCtx.code = 0;
                            
                            var imageUri = intent.getData();

                            var cursor = _activity.getApplicationContext()
                                                  .getContentResolver()
                                                  .query(imageUri, [ android.provider.MediaStore.MediaColumns.DATA ], null, null, null);
                            try {
                                cursor.moveToFirst();

                                var ci = cursor.getColumnIndex(android.provider.MediaStore.MediaColumns.DATA);
                                var file = FileSystem.File.fromPath(cursor.getString(ci));
                                
                                resultCtx.file = file;
                                resultCtx.load = function(loadCB) {
                                    var loadCBCtx = {};
                                    loadCBCtx.code = 0;
                                    loadCBCtx.file = file;

                                    try {
                                        var data = file.readSync(function(err) {
                                            loadCBCtx.code = 1;
                                            loadCBCtx.error = err;
                                        });

                                        if (0 === loadCBCtx.code) {
                                            loadCBCtx.data = android.util.Base64.encodeToString(data,
                                                                                                android.util.Base64.NO_WRAP);
                                        }
                                    }
                                    catch (e) {
                                        loadCBCtx.code = -1;
                                        loadCBCtx.error = e;
                                    }

                                    loadCB(loadCBCtx);
                                };
                            }
                            finally {
                                cursor.close();
                            }
                        }
                        else if (resultCode == android.app.Activity.RESULT_CANCELED) {
                            resultCtx.code = 1;
                        }
                        else {
                            resultCtx.code = 2;
                        }
                    }
                    catch (e) {
                        resultCtx.code = -1;
                        resultCtx.error = e;
                    }

                    sfCB(resultCtx);
                }
                break;
        }
    };

    _activity.onActivityResult = function(requestCode, resultCode, intent) {
        var uiAction = new actionRunnable();
        uiAction.action = function() {
            onActivityResultAction(requestCode, resultCode, intent);
        };

        _activity.runOnUiThread(uiAction);
    };
}
exports.initialize = initialize;

function selectFile(callback) {
    _selectFileCallback = callback;

    var intent = new android.content.Intent(android.content.Intent.ACTION_PICK);
    intent.setType("*/*");

    _activity.startActivityForResult(intent, _rcSelectFile);  
}
exports.selectFile = selectFile;
