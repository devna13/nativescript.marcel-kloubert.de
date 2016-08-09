import Application = require("application");
var FilePicker = require('./FilePicker');
import TypeUtils = require('utils/types');

if (!TypeUtils.isNullOrUndefined(Application.android)) {
    Application.android.onActivityCreated = () => {
        if (FilePicker.isSupported) {
            FilePicker.initialize();
        }
    };
}

Application.start({ moduleName: "main-page" });
