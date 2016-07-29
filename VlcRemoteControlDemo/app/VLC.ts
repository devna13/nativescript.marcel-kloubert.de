import ApiClient = require('nativescript-apiclient');
import TypeUtils = require('utils/types');
import XmlObjects = require('nativescript-xmlobjects');

/**
 * The result of getting a playlist result.
 */
export interface IGetPlaylistResult extends IResult {
    /**
     * This contains the list of 
     */
    playlists?: IPlaylist[];
}

/**
 * Stores data of the current status.
 */
export interface IGetStatusResult extends IResult {
    /**
     * The length of the current track.
     */
    length?: number;

    /**
     * The ID of the current entry.
     */
    entry?: string;

    /**
     * The position.
     */
    position?: number;

    /**
     * The current state.
     */
    state?: PlayerState;
}

/**
 * The endpoint of a remote player.
 */
export interface IPlayerEndpoint {
    /**
     * The host.
     */
    host?: string;

    /**
     * The password.
     */
    password?: string;

    /**
     * The TCP port.
     */
    port?: number;
}

/**
 * A playlist.
 */
export interface IPlaylist {
    /**
     * The entries.
     */
    entries: IPlaylistEntry[];

    /**
     * The display name.
     */
    name: string;

    /**
     * The player.
     */
    player: Player;
}

/**
 * A playlist entry.
 */
export interface IPlaylistEntry {
    /**
     * The ID of the entry.
     */
    id: string;

    /**
     * Gets the display name of the entry.
     */
    name: string;

    /**
     * Plays the entry.
     * 
     * @param {Function} [callback] The optional callback.
     */
    play: (callback?: (result: IPlayResult) => void) => void;

    /**
     * Gets the underlying playlist.
     */
    playlist: IPlaylist;

    /**
     * Gets the URI of the entry on the host machine.
     */
    uri: string;
}

/**
 * A result of a 'pause' request.
 */
export interface IPausedResult extends IResult {
    /**
     * The underlying entry.
     */
    entry: IPlaylistEntry;
}

/**
 * A result of a 'play' request.
 */
export interface IPlayResult extends IResult {
    /**
     * The underlying entry.
     */
    entry: IPlaylistEntry;
}

/**
 * A general result.
 */
export interface IResult {
    /**
     * Contains the error (if occurred).
     */
    error?: any;

    /**
     * The underlying player.
     */
    player: Player;
}

/**
 * VLC remote control.
 */
export class Player {
    private _host: string;
    private _password: string;
    private _port: number;

    /**
     * Initializes a new instance of that class.
     * 
     * @param {IPlayerEndpoint} [ep] The end point.
     */
    constructor(ep?: IPlayerEndpoint) {
        if (TypeUtils.isNullOrUndefined(ep)) {
            ep = {};
        }

        this._host = ep.host;
        if (TypeUtils.isNullOrUndefined(this._host)) {
            this._host = '127.0.0.1';       
        }

        this._port = ep.port;
        if (TypeUtils.isNullOrUndefined(this._port)) {
            this._port = 8080;
        }

        this._password = ep.password;
        if (TypeUtils.isNullOrUndefined(this._port)) {
            this._password = '';
        }
    }

    /**
     * Creates the authorizer that is used by that player.
     * 
     * @return {IAuthorizer} The created authorizer.
     */
    public createAuthorizer(): ApiClient.IAuthorizer {
        return new ApiClient.BasicAuth("", this._password);
    }

    /**
     * Loads the playlist.
     * 
     * @param {Function} callback The callback.
     */
    public getPlaylist(callback: (result: IGetPlaylistResult) => void) {
        var me = this;

        var raiseError = (error?: any) => {
            console.log('[ERROR] VLC.Player.getPlaylist(): ' + error);

            callback({
                error: error,
                player: me,
            });
        };

        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/playlist.xml',

            ok: (result) => {
                var xml = XmlObjects.parse(result.getString());

                var playlistNodes = xml.root.elements("node");

                var createPlayAction = (entry: IPlaylistEntry) => {
                    return (callback) => {
                        entry.playlist.player
                                      .play(entry, callback);
                    };
                };

                var playlists: IPlaylist[] = [];
                for (var i = 0; i < playlistNodes.length; i++) {
                    var plNode = playlistNodes[i];

                    var newPlaylist = {
                        entries: [],
                        name: plNode.attribute("name").value,
                        player: me,
                    };

                    // entries
                    var leafNodes = plNode.elements("leaf");
                    for (var ii = 0; ii < leafNodes.length; ii++) {
                        var lNode = leafNodes[ii];

                        var newPlaylistEntry: any = {
                            id: lNode.attribute("id").value,
                            name: lNode.attribute("name").value,
                            playlist: newPlaylist,
                            uri: lNode.attribute("uri").value,
                        };
                        newPlaylistEntry.play = createPlayAction(newPlaylistEntry);

                        newPlaylist.entries.push(newPlaylistEntry);
                    }

                    playlists.push(newPlaylist);
                }

                console.log('VLC.Player.getPlaylist(): Loaded ' + playlists.length + ' playlist(s):');
                for (var i = 0; i < playlists.length; i++) {
                    var pl = playlists[i];

                    console.log('[' + i + '] ' + pl.name);
                    for (var ii = 0; ii < pl.entries.length; ii++) {
                        var ple = pl.entries[ii];

                        console.log('\t[' + ii + '] ' + ple.name);
                    }
                }

                callback({
                    playlists: playlists,
                    player: me,
                });
            },

            unauthorized: (result) => {
                raiseError('Invalid password!');
            },

            error: (ctx) => {
                raiseError(ctx.error);
            },

            authorizer: me.createAuthorizer(),
        });

        client.get();
    }

    /**
     * Gets the status of that player.
     * 
     * @param {Function} callback The callback to use.
     */
    public getStatus(callback: (result: IGetStatusResult) => void) {
        var me = this;

        var raiseError = (error?: any) => {
            console.log('[ERROR] VLC.Player.getStatus(): ' + error);

            callback({
                error: error,
                player: me,
            });
        };

        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/status.xml',

            ok: (result) => {
                var xml = XmlObjects.parse(result.getString());
                
                var callbackResult: any = {};

                var positionElements = xml.root.elements("position");
                if (positionElements.length > 0) {
                    callbackResult.position = xmlElementToNumber(positionElements[0]);
                }

                var lengthElements = xml.root.elements("length");
                if (lengthElements.length > 0) {
                    callbackResult.length = xmlElementToNumber(lengthElements[0]);
                }

                var currentplidElements = xml.root.elements("currentplid");
                if (currentplidElements.length > 0) {
                    var eid = currentplidElements[0].value;
                    if (!isStringEmpty(eid)) {
                        callbackResult.entry = eid.trim();
                    }
                }

                var stateElements = xml.root.elements("state");
                if (stateElements.length > 0) {
                    var state = stateElements[0].value;
                    if (!isStringEmpty(state)) {
                        var stateValue: PlayerState = null;    

                        state = state.toLowerCase().trim();
                        switch (state) {
                            case 'playing':
                                stateValue = PlayerState.playing;
                                break;

                            case 'paused':
                                stateValue = PlayerState.paused;
                                break;

                            case 'stopped':
                                stateValue = PlayerState.stopped;
                                break;
                        }

                        callbackResult.state = stateValue;
                    }
                }

                callback(callbackResult);
            },
    
            unauthorized: (result) => {
                raiseError('Invalid password!');
            },
    
            error: (ctx) => {
                raiseError(ctx.error);
            },
    
            authorizer: me.createAuthorizer(),
        });

        client.get();
    }

    /**
     * Gets the host address.
     */
    public get host(): string {
        return this._host;
    }

    /**
     * Pauses an entry.
     * 
     * @param {IPlaylistEntry} entry The entry to play.
     * @param {Function} [callback] The optional callback to use.
     */
    public pause(entry: IPlaylistEntry, callback?: (result: IPausedResult) => void) {
        var me = this;

        var raiseCallback = (error?: any) => {
            if (!TypeUtils.isNullOrUndefined(error)) {
                console.log('[ERROR] VLC.Player.pause(): ' + error);
            }
            
            if (TypeUtils.isNullOrUndefined(callback)) {
                return;
            }

            callback({
                entry: entry,
                error: error,
                player: me,
            });
        };

        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/status.xml',

            ok: (result) => {
                console.log("VLC.Player.pause(): Paused '" + entry.name + "' of '" + entry.playlist.name + "'...");

                raiseCallback();
            },
    
            unauthorized: (result) => {
                raiseCallback('Invalid password!');
            },
    
            error: (ctx) => {
                raiseCallback(ctx.error);
            },
    
            authorizer: me.createAuthorizer(),
        });

        client.get({
            params: {
                command: 'pl_pause',
                id: entry.id,
            } 
        });
    }

    /**
     * Plays an entry.
     * 
     * @param {IPlaylistEntry} entry The entry to play.
     * @param {Function} [callback] The optional callback to use.
     */
    public play(entry: IPlaylistEntry, callback?: (result: IPlayResult) => void) {
        var me = this;

        var raiseCallback = (error?: any) => {
            if (!TypeUtils.isNullOrUndefined(error)) {
                console.log('[ERROR] VLC.Player.play(): ' + error);
            }
            
            if (TypeUtils.isNullOrUndefined(callback)) {
                return;
            }

            callback({
                entry: entry,
                error: error,
                player: me,
            });
        };

        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/status.xml',

            ok: (result) => {
                console.log("VLC.Player.play(): Playing '" + entry.name + "' of '" + entry.playlist.name + "'...");

                raiseCallback();
            },
    
            unauthorized: (result) => {
                raiseCallback('Invalid password!');
            },
    
            error: (ctx) => {
                raiseCallback(ctx.error);
            },
    
            authorizer: me.createAuthorizer(),
        });

        client.get({
            params: {
                command: 'pl_play',
                id: entry.id,
            } 
        });
    }

    /**
     * Gets the TCP point.
     */
    public get port(): number {
        return this._port;
    }

    /**
     * Stops playing.
     * 
     * @param {Function} [callback] The optional callback to use.
     */
    public stop(callback?: (result: IResult) => void) {
        console.log("Stopping...");

        var me = this;

        var raiseCallback = (error?: any) => {
            if (!TypeUtils.isNullOrUndefined(error)) {
                console.log('[ERROR] VLC.Player.stop(): ' + error);
            }

            if (TypeUtils.isNullOrUndefined(callback)) {
                return;
            }

            callback({
                error: error,
                player: me,
            });
        };

        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/status.xml',

            ok: (result) => {
                console.log('VLC.Player.stop(): Player stopped.');

                raiseCallback();
            },
    
            unauthorized: (result) => {
                raiseCallback('Invalid password!');
            },
    
            error: (ctx) => {
                raiseCallback(ctx.error);
            },
    
            authorizer: me.createAuthorizer(),
        });

        client.get({
            params: {
                command: 'pl_stop',
            } 
        });
    }
}

/**
 * List of player states.
 */
export enum PlayerState {
    /**
     * Playing
     */
    playing,

    /**
     * Paused
     */
    paused,

    /**
     * Stoppped
     */
    stopped,
}


function isStringEmpty(str: string): boolean {
    if (TypeUtils.isNullOrUndefined(str)) {
        return true;
    }

    str = '' + str;
    return '' === str;
}

function xmlElementToNumber(e: XmlObjects.XElement): number {
    if (TypeUtils.isNullOrUndefined(e)) {
        return <any>e;
    }
    
    var str = e.value;
    if (TypeUtils.isNullOrUndefined(str)) {
        return <any>str;
    }

    if (isStringEmpty(str)) {
        return;
    }

    return parseFloat(('' + str).trim());
}
