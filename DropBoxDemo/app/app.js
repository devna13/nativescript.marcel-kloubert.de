"use strict";
var Application = require("application");
var FilePicker = require('./FilePicker');
var TypeUtils = require('utils/types');
if (!TypeUtils.isNullOrUndefined(Application.android)) {
    Application.android.onActivityCreated = function () {
        if (FilePicker.isSupported) {
            FilePicker.initialize();
        }
    };
}
Application.start({ moduleName: "main-page" });
//# sourceMappingURL=app.js.map