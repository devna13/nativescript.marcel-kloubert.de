import ApiClient = require('nativescript-apiclient');
import Enumerable = require('nativescript-enumerable');
import FileSystem = require("file-system");
import TypeUtils = require('utils/types');

/**
 * List of entry types.
 */
export enum EntryType {
    /**
     * Folder
     */
    Folder = 0,

    /**
     * File
     */
    File = 1,
}

/**
 * A file.
 */
export interface IFile extends IFolderEntry {
    /**
     * Downloads a file.
     * 
     * @param {Function} callback The callback for the download result.
     */
    download: (callback: (result: IFileDownloadResult) => void) => void;
}

/**
 * The result of a file download.
 */
export interface IFileDownloadResult extends IResult {
    /**
     * The underlying file.
     */
    file: IFile;

    /**
     * The local file (if download succeeded),
     */
    localFile?: FileSystem.File;
}

/**
 * A folder.
 */
export interface IFolder extends IFolderEntry {
    /**
     * Uploads a file to that folder.
     * 
     * @param {FileSystem.File} The local file.
     * @param {Function} The optional result callback.
     */
    uploadFile(file: FileSystem.File,
               callback?: (result: IResult) => void);
}

/**
 * A general folder entry.
 */
export interface IFolderEntry {
    /**
     * Deletes that entry.
     */
    delete: (callback?: (result: IResult) => void) => void;

    /**
     * The ID.
     */
    id: string;

    /**
     * The (display) name.
     */
    name: string;

    /**
     * The path.
     */
    path: string;

    /**
     * The type.
     */
    type?: EntryType;
}

/**
 * The result of listening a folder.
 */
export interface IListFolderResult extends IResult {
    /**
     * Gets if the folder contains more items or not.
     */
    hasMore?: boolean;

    /**
     * The entries.
     */
    entries?: IFolderEntry[];

    /**
     * The path.
     */
    path: string;
}

/**
 * A general result.
 */
export interface IResult {
    /**
     * The result code.
     */
    code: number;

    /**
     * The error information (if occurred)
     */
    error?: any;
}

/**
 * A DropBox client.
 */
export class DropBoxClient {
    private _accessToken: string;

    /**
     * Initializes a new instance of that class.
     * 
     * @param {string} token The access token to use.
     */
    constructor(token: string) {
        this._accessToken = token;
    }

    /**
     * Gets the access token.
     */
    public get accessToken(): string {
        return this._accessToken;
    }

    /**
     * Lists a folder.
     * 
     * @param {string} Path The path.
     * @param {Function} callback The result callback.
     */
    public listFolder(path: string = '',
                      callback: (result: IListFolderResult) => void) {

        var me = this;
        
        var client = ApiClient.newClient({
            baseUrl: 'https://api.dropboxapi.com/2/files/list_folder',
            authorizer: new ApiClient.BearerAuth(this._accessToken),
        });

        var code = 1;
        var entries: any[];
        var error;
        var hasMore: boolean;
        var finish = () => {
            callback({
                code: code,
                entries: entries,
                error: error,
                hasMore: hasMore,
                path: path,
            });
        };

        client.succeededRequest((result) => {
            var jsonResp = result.getJSON<any>();

            code = 0;
            hasMore = jsonResp.has_more;

            if (TypeUtils.isNullOrUndefined(jsonResp.entries)) {
                entries = [];
            }
            else {
                entries = Enumerable.fromArray(jsonResp.entries)
                    .where(x => !TypeUtils.isNullOrUndefined(x))
                    .select(x => {
                        // IFolderEntry
                        var entry: any;
                        entry = {
                            delete: (delCallback: (delRes: IResult) => void) => {
                                var terminator = ApiClient.newClient({
                                    authorizer: new ApiClient.BearerAuth(me.accessToken),
                                    baseUrl: 'https://api.dropboxapi.com/2/files/delete',
                                });

                                var termCode = 1;
                                var termError;
                                var termFinish = () => {
                                    if (!TypeUtils.isNullOrUndefined(delCallback)) {
                                        delCallback({
                                            code: termCode,
                                            error: termError,
                                        });
                                    }
                                };

                                terminator.succeededRequest(() => {
                                    termCode = 0;
                                }).clientOrServerError(delResult => {
                                    termCode = -2;
                                    termError = 'Server returned code: ' + delResult.code + ' => ' + delResult.getString();
                                }).error(delCtx => {
                                    termCode = -1;
                                    termError = delCtx.error;
                                }).complete(() => {
                                    termFinish();
                                });

                                terminator.post({
                                    content: {
                                        path: entry.path,
                                    },
                            
                                    type: ApiClient.HttpRequestType.JSON,
                                });
                            },

                            id: x.id,
                            name: x.name,
                            path: x.path_display,
                        };

                        var tag = (TypeUtils.isNullOrUndefined(x['.tag']) ? '' : ('' + x['.tag'])).toLowerCase().trim();
                        switch (tag) {
                            case 'folder':
                                entry.type = EntryType.Folder;

                                entry.uploadFile = (fileToUpload: FileSystem.File, ulCallback?: (result: IResult) => void) => {
                                    me.uploadFileTo(fileToUpload, path, ulCallback);
                                };
                                break;

                            case 'file':
                                entry.type = EntryType.File;

                                entry.download = (callback: (result: IFileDownloadResult) => void) => {
                                    var downloadClient = ApiClient.newClient({
                                        authorizer: new ApiClient.BearerAuth(me.accessToken),
                                        baseUrl: 'https://content.dropboxapi.com/2/files/download',
                                    });

                                    downloadClient.addLogger((dlMsg) => {
                                        console.log('DropBoxDemo.DropBoxClient.download(' + entry.path + '): ' + dlMsg.message);
                                    });

                                    var dlCode = 1;
                                    var dlError;
                                    var dlFile: FileSystem.File;
                                    var finishDownload = () => {
                                        callback({
                                            code: dlCode,
                                            file: entry,
                                            localFile: dlFile,
                                        });
                                    };

                                    downloadClient.succeededRequest((dlResult) => {
                                        try {
                                            dlFile = dlResult.getFile();
                                            dlCode = 0;
                                        }
                                        catch (dlE) {
                                            dlCode = -3;
                                            dlError = dlE;
                                        }
                                    }).clientOrServerError((dlResult) => {
                                        dlCode = -2;
                                        dlError = 'Server returned code: ' + dlResult.code + ' => ' + dlResult.getString();
                                    }).error((dlCtx) => {
                                        dlCode = -1;
                                        dlError = dlCtx.error;
                                    }).complete(() => {
                                        finishDownload();
                                    });

                                    var apiArgs = {
                                        path: entry.path,
                                    };

                                    downloadClient.post({
                                        headers: {
                                            'Content-Type': '',
                                            'Dropbox-API-Arg': JSON.stringify(apiArgs),
                                        },
                                    });
                                };
                                break;
                        }

                        return entry;
                    })
                    .orderBy((x: IFolderEntry) => x.type)
                    .thenBy((x: IFolderEntry) => x.path.toLowerCase().trim())
                    .toArray();
            }
        }).clientOrServerError((result) => {
            code = -2;
            error = 'Server returned code: ' + result.code;
        }).error((ctx) => {
            code = -1;
            error = ctx.error;
        }).complete(() => {
            finish();
        });

        client.post({
            content: {
                path: path,
                recursive: false,
                include_media_info: true,
                include_deleted: false,
                include_has_explicit_shared_members: false
            },
            type: ApiClient.HttpRequestType.JSON,
        });
    }

    /**
     * Uploads a file.
     * 
     * @param {FileSystem.File} localFile The file to upload.
     * @param {String} [targetFolder] The custom target folder.
     * @param {Function} [callback] The optional result callback.
     */
    public uploadFileTo(localFile: FileSystem.File, targetFolder: string = '',
                        callback?: (result: IResult) => void) {

        var readError;
        var dataToUpload = localFile.readSync((fileErr) => {
            readError = fileErr;
        });
        
        var code = 1;
        var error;
        var finish = () => {
            if (!TypeUtils.isNullOrUndefined(callback)) {
                callback({
                    code: code,
                    error: error,
                });
            }
        };

        if (!TypeUtils.isNullOrUndefined(readError)) {
            code = -2;
            error = readError;

            finish();
        }
        else {
            var client = ApiClient.newClient({
                authorizer: new ApiClient.BearerAuth(this.accessToken),
                baseUrl: 'https://content.dropboxapi.com/2/files/upload',
            });

            client.succeededRequest(() => {
                code = 0;
            }).clientOrServerError((ulResult) => {
                code = -2;
                error = 'Server returned code: ' + ulResult.code + ' => ' + ulResult.getString();
            }).error((ulCtx) => {
                code = -1;
                error = ulCtx.error;
            }).complete(() => {
                finish();
            });

            var args = {
                path: targetFolder + '/' + localFile.name,
                mode: "add",
                autorename: true,
                mute: false
            };
 
            client.post({
                content: dataToUpload,
                type: ApiClient.HttpRequestType.Binary,
    
                headers: {
                    'Dropbox-API-Arg': JSON.stringify(args),
                }
            });
        }
    }
}
