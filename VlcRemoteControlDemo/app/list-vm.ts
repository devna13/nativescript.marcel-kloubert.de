import {Observable} from "data/observable";
import Timer = require('timer');
import TypeUtils = require('utils/types');
import VLC = require('./VLC');

export class ViewModel extends Observable {
    private _stateListener: number;
    
    public findCurrentEntry(): VLC.IPlaylistEntry {
        var entryId: string = this.get('currentEntry');
        if (!TypeUtils.isNullOrUndefined(entryId)) {
            entryId = entryId.trim();
            if ('' !== entryId) {
                var list: VLC.IPlaylist = this.get('list');
                if (!TypeUtils.isNullOrUndefined(list)) {
                    var entries = list.entries;
                    if (!TypeUtils.isNullOrUndefined(entries)) {
                        for (var i = 0; i < entries.length; i++) {
                            var e = entries[i];
                            if (TypeUtils.isNullOrUndefined(e)) {
                                continue;
                            }

                            if (e.id == entryId) {
                                return e;
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    protected logError(err: any, method: string) {
        if (TypeUtils.isNullOrUndefined(err)) {
            return;
        }

        console.log('[ERROR] list-vm.ViewModel.' + method + '(): ' + err);
    }

    public get player(): VLC.Player {
        return this.get('list').player;
    }

    public playOrPause() {
        var me = this;

        this.player.getStatus((result) => {
            if (!TypeUtils.isNullOrUndefined(result.error)) {
                me.logError(result.error, 'playOrPause');
                return;
            }

            var entry = me.findCurrentEntry();
            if (TypeUtils.isNullOrUndefined(entry)) {
                return;
            }

            switch (result.state) {
                case VLC.PlayerState.stopped:
                    console.log('Continuing...');
                    me.player.play(entry, (result) => {
                        me.logError(result.error, 'playOrPause');
                    });
                    break;

                case VLC.PlayerState.playing:
                case VLC.PlayerState.paused:
                    console.log('Pausing...');
                    me.player.pause(entry, (result) => {
                        me.logError(result.error, 'playOrPause');
                    });
                    break;
            }
        });
    }

    public startListeningForState() {
        var me = this;
        
        if (!TypeUtils.isNullOrUndefined(this._stateListener)) {
            return;
        }
        
        var isListening = false;
        this._stateListener = Timer.setInterval(() => {
            if (isListening) {
                return;
            }

            isListening = true;
            me.player.getStatus((result) => {
                isListening = false;
                
                if (!TypeUtils.isNullOrUndefined(result.error)) {
                    return;
                }

                var entry = me.findCurrentEntry();

                var status = '';
                var isPaused = false;
                switch (result.state) {
                    case VLC.PlayerState.paused:
                        status = 'Paused';
                        isPaused= true;
                        break;

                    case VLC.PlayerState.stopped:
                        status = 'Stopped';
                        break;

                    case VLC.PlayerState.playing:
                        status = 'Playing';
                        break;
                }

                me.set('currentEntry', result.entry);

                if (!TypeUtils.isNullOrUndefined(entry)) {
                    status += ' (' + entry.name + ')';
                }

                var time = '';
                if (!TypeUtils.isNullOrUndefined(result.length)) {
                    time = toTimeString(result.length);

                    if (!TypeUtils.isNullOrUndefined(result.position)) {
                        var pos = Math.round(result.length * result.position);
                        time = toTimeString(pos) + ' / ' + time;
                    }
                }

                if ('' !== time) {
                    status = status + "\n(" + time + ")";
                }

                me.set('status', status);
                me.set('isPaused', isPaused);
            });
        }, 750);
    }

    public stop() {
        var me = this;

        this.player.stop((result) => {
            me.logError(result.error, 'stop');
        });
    }
}

function toTimeString(sec: number): string {
    if (TypeUtils.isNullOrUndefined(sec)) {
        return <any>sec;
    }

    var min = Math.floor(sec / 60.0);
    var sec = sec % 60;

    var strMin = min.toString();
    if (1 === strMin.length) {
        strMin = '0' + strMin;
    }

    var strSec = sec.toString();
    if (1 === strSec.length) {
        strSec = '0' + strSec;
    }

    return strMin + ':' + strSec;
}
