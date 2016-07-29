import Dialogs = require('ui/dialogs');
import Frame =require("ui/frame");
import {Observable} from "data/observable";
import TypeUtils = require('utils/types');
import VLC = require('./VLC');

const VAR_HOST = 'host';
const VAR_ISLOADING_PLAYLISTS = 'isLoadingPlaylists';
const VAR_PASSWORD = 'password';
const VAR_PORT = 'port';

export class ViewModel extends Observable {
    constructor() {
        super();

        this.set(VAR_ISLOADING_PLAYLISTS, false);

        this.set(VAR_HOST, '192.168.0.21');
        this.set(VAR_PORT, '9090');
        this.set(VAR_PASSWORD, 'test');
    }

    public loadPlaylists() {
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

        player.getPlaylist((result) => {
            if (result.error) {
                me.logError(result.error, 'loadPlaylists');
                Dialogs.alert("ERROR: " + result.error);

                this.set(VAR_ISLOADING_PLAYLISTS, false);
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
    }

    protected logError(err: any, method: string) {
        if (TypeUtils.isNullOrUndefined(err)) {
            return;
        }

        console.log('[ERROR] main-view-model.ViewModel.' + method + '(): ' + err);
    }
}
