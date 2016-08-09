import Dialogs = require('ui/dialogs');
import DropBox = require('./DropBox');
import Enumerable = require('nativescript-enumerable');
var FilePicker = require('./FilePicker');
import FileSystem = require('file-system');
import {Observable} from "data/observable";
import {ObservableArray} from "data/observable-array";
import TypeUtils = require('utils/types');
import Utils = require('utils/utils');

export class ViewModel extends Observable {
    constructor() {
        super();

        this.set('token', '<YOUR-ACCESS-TOKEN>');
        this.set('path', '/');
        this.set('isRefreshing', false);
        this.set('entries', new ObservableArray<DropBox.IFolderEntry>());
    }

    public refresh() {
        var me = this;

        if (me.get('isRefreshing')) {
            return;
        }

        me.set('isRefreshing', true);

        var entries: ObservableArray<DropBox.IFolderEntry> = this.get('entries');
        entries.length = 0;

        var path: string = me.get('path');
        if (TypeUtils.isNullOrUndefined(path)) {
            path = '';
        }

        path = ('' + path).trim();
        if ('/' === path) {
            path = '';
        }

        console.log('Listening path: ' + path);

        var client = new DropBox.DropBoxClient(me.get('token'));
        client.listFolder(path, (result) => {
            switch (result.code) {
                case 0:
                    var setupEntry = (entry: DropBox.IFolderEntry) => {
                        var e: any = entry;
                        e.onTap = () => {
                            switch (entry.type) {
                                case DropBox.EntryType.Folder:
                                    me.set('path', e.path);
                                    me.refresh();
                                    break;

                                case DropBox.EntryType.File:
                                    var fileToDownload: DropBox.IFile = e;
                                    fileToDownload.download((downloadResult) => {
                                        switch (downloadResult.code) {
                                            case 0:
                                                var newFile = downloadResult.localFile.path + '/' + fileToDownload.name;

                                                var renameFile = () => {
                                                    downloadResult.localFile.rename(entry.name).then(() => {
                                                        var fileUrl = 'file://' + newFile;
                                                        Utils.openUrl(fileUrl);
                                                    }).catch((e) => {
                                                        Dialogs.alert('Could not OPEN file "' + fileToDownload.name + '"! ' + e);
                                                    });
                                                };
                                                
                                                if (FileSystem.File.exists(newFile)) {
                                                    var existingFile = FileSystem.File.fromPath(newFile);
                                                    existingFile.remove().then(() => {
                                                        renameFile();
                                                    }).catch(e => {
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

                        e.askBeforeDelete = () => {
                            Dialogs.confirm('Do you really want to delete the ' + (DropBox.EntryType[entry.type].toLowerCase()) + ' "' + entry.name + '"?').then((flag) => {
                                if (!flag) {
                                    return;
                                }

                                entry.delete((delResult) => {
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
    }

    public upload() {
        var me = this;

        if (!FilePicker.isSupported) {
            Dialogs.alert('Upload NOT supported on that device!');
            return;
        }

        FilePicker.selectFile((fileResult) => {
            switch (fileResult.code) {
                case 0:
                    console.log('Uploading file: ' + fileResult.file.name);
                    
                    var client = new DropBox.DropBoxClient(me.get('token'));
                    client.uploadFileTo(fileResult.file, me.get('path'), (uploadResult) => {
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
    }
}
