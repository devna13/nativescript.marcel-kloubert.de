"use strict";
var ApiClient = require('nativescript-apiclient');
var TypeUtils = require('utils/types');
var XmlObjects = require('nativescript-xmlobjects');
/**
 * VLC remote control.
 */
var Player = (function () {
    /**
     * Initializes a new instance of that class.
     *
     * @param {IPlayerEndpoint} [ep] The end point.
     */
    function Player(ep) {
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
    Player.prototype.createAuthorizer = function () {
        return new ApiClient.BasicAuth("", this._password);
    };
    /**
     * Loads the playlist.
     *
     * @param {Function} callback The callback.
     */
    Player.prototype.getPlaylist = function (callback) {
        var me = this;
        var raiseError = function (error) {
            console.log('[ERROR] VLC.Player.getPlaylist(): ' + error);
            callback({
                error: error,
                player: me,
            });
        };
        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/playlist.xml',
            ok: function (result) {
                var xml = XmlObjects.parse(result.getString());
                var playlistNodes = xml.root.elements("node");
                var createPlayAction = function (entry) {
                    return function (callback) {
                        entry.playlist.player
                            .play(entry, callback);
                    };
                };
                var playlists = [];
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
                        var newPlaylistEntry = {
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
            unauthorized: function (result) {
                raiseError('Invalid password!');
            },
            error: function (ctx) {
                raiseError(ctx.error);
            },
            authorizer: me.createAuthorizer(),
        });
        client.get();
    };
    Player.prototype.getStatus = function (callback) {
        var me = this;
        var raiseError = function (error) {
            console.log('[ERROR] VLC.Player.getStatus(): ' + error);
            callback({
                error: error,
                player: me,
            });
        };
        var client = ApiClient.newClient({
            baseUrl: 'http://' + this._host + ':' + this._port + '/requests/status.xml',
            ok: function (result) {
                var xml = XmlObjects.parse(result.getString());
                var callbackResult = {};
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
                    var eid = xmlElementToString(currentplidElements[0]);
                    if (!isStringEmpty(eid)) {
                        callbackResult.entry = eid.trim();
                    }
                }
                var stateElements = xml.root.elements("state");
                if (stateElements.length > 0) {
                    var state = xmlElementToString(stateElements[0]);
                    if (!isStringEmpty(state)) {
                        var stateValue = null;
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
            unauthorized: function (result) {
                raiseError('Invalid password!');
            },
            error: function (ctx) {
                raiseError(ctx.error);
            },
            authorizer: me.createAuthorizer(),
        });
        client.get();
    };
    Object.defineProperty(Player.prototype, "host", {
        /**
         * Gets the host address.
         */
        get: function () {
            return this._host;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Pauses an entry.
     *
     * @param {IPlaylistEntry} entry The entry to play.
     * @param {Function} [callback] The optional callback to use.
     */
    Player.prototype.pause = function (entry, callback) {
        var me = this;
        var raiseCallback = function (error) {
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
            ok: function (result) {
                console.log("VLC.Player.pause(): Paused '" + entry.name + "' of '" + entry.playlist.name + "'...");
                raiseCallback();
            },
            unauthorized: function (result) {
                raiseCallback('Invalid password!');
            },
            error: function (ctx) {
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
    };
    /**
     * Plays an entry.
     *
     * @param {IPlaylistEntry} entry The entry to play.
     * @param {Function} [callback] The optional callback to use.
     */
    Player.prototype.play = function (entry, callback) {
        var me = this;
        var raiseCallback = function (error) {
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
            ok: function (result) {
                console.log("VLC.Player.play(): Playing '" + entry.name + "' of '" + entry.playlist.name + "'...");
                raiseCallback();
            },
            unauthorized: function (result) {
                raiseCallback('Invalid password!');
            },
            error: function (ctx) {
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
    };
    Object.defineProperty(Player.prototype, "port", {
        /**
         * Gets the TCP point.
         */
        get: function () {
            return this._port;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Stops playing.
     *
     * @param {Function} [callback] The optional callback to use.
     */
    Player.prototype.stop = function (callback) {
        console.log("Stopping...");
        var me = this;
        var raiseCallback = function (error) {
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
            ok: function (result) {
                console.log('VLC.Player.stop(): Player stopped.');
                raiseCallback();
            },
            unauthorized: function (result) {
                raiseCallback('Invalid password!');
            },
            error: function (ctx) {
                raiseCallback(ctx.error);
            },
            authorizer: me.createAuthorizer(),
        });
        client.get({
            params: {
                command: 'pl_stop',
            }
        });
    };
    return Player;
}());
exports.Player = Player;
/**
 * List of player states.
 */
(function (PlayerState) {
    /**
     * Playing
     */
    PlayerState[PlayerState["playing"] = 0] = "playing";
    /**
     * Paused
     */
    PlayerState[PlayerState["paused"] = 1] = "paused";
    /**
     * Stoppped
     */
    PlayerState[PlayerState["stopped"] = 2] = "stopped";
})(exports.PlayerState || (exports.PlayerState = {}));
var PlayerState = exports.PlayerState;
function isStringEmpty(str) {
    if (TypeUtils.isNullOrUndefined(str)) {
        return true;
    }
    str = '' + str;
    return '' === str;
}
function xmlElementToNumber(e) {
    var str = xmlElementToString(e);
    if (TypeUtils.isNullOrUndefined(str)) {
        return str;
    }
    if (isStringEmpty(str)) {
        return;
    }
    return parseFloat(str);
}
function xmlElementToString(e) {
    if (TypeUtils.isNullOrUndefined(e)) {
        return e;
    }
    var str = '';
    var nodes = e.nodes();
    for (var i = 0; i < nodes.length; i++) {
        str += nodes[i].toString();
    }
    return str;
}
//# sourceMappingURL=VLC.js.map