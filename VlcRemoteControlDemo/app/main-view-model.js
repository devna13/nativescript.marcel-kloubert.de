"use strict";
var Dialogs = require('ui/dialogs');
var Frame = require("ui/frame");
var observable_1 = require("data/observable");
var TypeUtils = require('utils/types');
var VLC = require('./VLC');
var VAR_HOST = 'host';
var VAR_ISLOADING_PLAYLISTS = 'isLoadingPlaylists';
var VAR_PASSWORD = 'password';
var VAR_PORT = 'port';
var ViewModel = (function (_super) {
    __extends(ViewModel, _super);
    function ViewModel() {
        _super.call(this);
        this.set(VAR_ISLOADING_PLAYLISTS, false);
        this.set(VAR_HOST, '192.168.0.21');
        this.set(VAR_PORT, '9090');
        this.set(VAR_PASSWORD, 'test');
    }
    ViewModel.prototype.loadPlaylists = function () {
        var _this = this;
        var me = this;
        var host = this.get(VAR_HOST).trim();
        if ('' === host) {
            host = '127.0.0.1';
        }
        var port = this.get(VAR_PORT).trim();
        if ('' === port) {
            port = '8080';
        }
        var pwd = this.get(VAR_PASSWORD).trim();
        if ('' === pwd) {
            pwd = '';
        }
        var player = new VLC.Player({
            host: host,
            port: parseInt(port),
            password: pwd,
        });
        if (this.get(VAR_ISLOADING_PLAYLISTS)) {
            return;
        }
        this.set(VAR_ISLOADING_PLAYLISTS, true);
        player.getPlaylist(function (result) {
            if (result.error) {
                me.logError(result.error, 'loadPlaylists');
                Dialogs.alert("ERROR: " + result.error);
                _this.set(VAR_ISLOADING_PLAYLISTS, false);
                return;
            }
            Frame.topmost().navigate({
                moduleName: 'playlists',
                context: {
                    player: player,
                    lists: result.playlists,
                }
            });
        });
    };
    ViewModel.prototype.logError = function (err, method) {
        if (TypeUtils.isNullOrUndefined(err)) {
            return;
        }
        console.log('[ERROR] main-view-model.ViewModel.' + method + '(): ' + err);
    };
    return ViewModel;
}(observable_1.Observable));
exports.ViewModel = ViewModel;
//# sourceMappingURL=main-view-model.js.map