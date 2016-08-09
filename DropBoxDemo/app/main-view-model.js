"use strict";
var Dialogs = require('ui/dialogs');
var DropBox = require('./DropBox');
var FilePicker = require('./FilePicker');
var FileSystem = require('file-system');
var observable_1 = require("data/observable");
var observable_array_1 = require("data/observable-array");
var TypeUtils = require('utils/types');
var Utils = require('utils/utils');
var ViewModel = (function (_super) {
    __extends(ViewModel, _super);
    function ViewModel() {
        _super.call(this);
        this.set('token', '<YOUR-ACCESS-TOKEN>');
        this.set('path', '/');
        this.set('isRefreshing', false);
        this.set('entries', new observable_array_1.ObservableArray());
    }
    ViewModel.prototype.refresh = function () {
        var me = this;
        if (me.get('isRefreshing')) {
            return;
        }
        me.set('isRefreshing', true);
        var entries = this.get('entries');
        entries.length = 0;
        var path = me.get('path');
        if (TypeUtils.isNullOrUndefined(path)) {
            path = '';
        }
        path = ('' + path).trim();
        if ('/' === path) {
            path = '';
        }
        console.log('Listening path: ' + path);
        var client = new DropBox.DropBoxClient(me.get('token'));
        client.listFolder(path, function (result) {
            switch (result.code) {
                case 0:
                    var setupEntry = function (entry) {
                        var e = entry;
                        e.onTap = function () {
                            switch (entry.type) {
                                case DropBox.EntryType.Folder:
                                    me.set('path', e.path);
                                    me.refresh();
                                    break;
                                case DropBox.EntryType.File:
                                    var fileToDownload = e;
                                    fileToDownload.download(function (downloadResult) {
                                        switch (downloadResult.code) {
                                            case 0:
                                                var newFile = downloadResult.localFile.path + '/' + fileToDownload.name;
                                                var renameFile = function () {
                                                    downloadResult.localFile.rename(entry.name).then(function () {
                                                        var fileUrl = 'file://' + newFile;
                                                        Utils.openUrl(fileUrl);
                                                    }).catch(function (e) {
                                                        Dialogs.alert('Could not OPEN file "' + fileToDownload.name + '"! ' + e);
                                                    });
                                                };
                                                if (FileSystem.File.exists(newFile)) {
                                                    var existingFile = FileSystem.File.fromPath(newFile);
                                                    existingFile.remove().then(function () {
                                                        renameFile();
                                                    }).catch(function (e) {
                                                        Dialogs.alert('Could not DELETE existing file "' + fileToDownload.name + '"! ' + e);
                                                    });
                                                }
                                                else {
                                                    renameFile();
                                                }
                                                break;
                                            default:
                                                Dialogs.alert('Could not DOWNLOAD file "' + fileToDownload.name + '"! [' + downloadResult.code + ']: ' + downloadResult.error);
                                                break;
                                        }
                                    });
                                    break;
                            }
                        };
                        e.askBeforeDelete = function () {
                            Dialogs.confirm('Do you really want to delete the ' + (DropBox.EntryType[entry.type].toLowerCase()) + ' "' + entry.name + '"?').then(function (flag) {
                                if (!flag) {
                                    return;
                                }
                                entry.delete(function (delResult) {
                                    switch (delResult.code) {
                                        case 0:
                                            me.refresh();
                                            break;
                                        default:
                                            Dialogs.alert('Could not DELETE item "' + entry.name + '"! [' + delResult.code + ']: ' + delResult.error);
                                            break;
                                    }
                                });
                            });
                        };
                        return entry;
                    };
                    for (var i = 0; i < result.entries.length; i++) {
                        entries.push(setupEntry(result.entries[i]));
                    }
                    break;
                default:
                    Dialogs.alert('Could not refresh folder! [' + result.code + ']: ' + result.error);
                    break;
            }
            me.set('isRefreshing', false);
        });
    };
    ViewModel.prototype.upload = function () {
        var me = this;
        if (!FilePicker.isSupported) {
            Dialogs.alert('Upload NOT supported on that device!');
            return;
        }
        FilePicker.selectFile(function (fileResult) {
            switch (fileResult.code) {
                case 0:
                    console.log('Uploading file: ' + fileResult.file.name);
                    var client = new DropBox.DropBoxClient(me.get('token'));
                    client.uploadFileTo(fileResult.file, me.get('path'), function (uploadResult) {
                        switch (uploadResult.code) {
                            case 0:
                                me.refresh();
                                break;
                            default:
                                Dialogs.alert('Could not UPLOAD file! [' + uploadResult.code + ']: ' + uploadResult.error);
                                break;
                        }
                    });
                    break;
                case 1:
                    // cancelled
                    break;
                default:
                    Dialogs.alert('Could not SELECT file! [' + fileResult.code + ']: ' + fileResult.error);
                    break;
            }
        });
    };
    return ViewModel;
}(observable_1.Observable));
exports.ViewModel = ViewModel;
//# sourceMappingURL=main-view-model.js.map