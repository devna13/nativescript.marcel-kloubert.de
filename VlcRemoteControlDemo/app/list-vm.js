"use strict";
var observable_1 = require("data/observable");
var Timer = require('timer');
var TypeUtils = require('utils/types');
var VLC = require('./VLC');
var ViewModel = (function (_super) {
    __extends(ViewModel, _super);
    function ViewModel() {
        _super.apply(this, arguments);
    }
    ViewModel.prototype.findCurrentEntry = function () {
        var entryId = this.get('currentEntry');
        if (!TypeUtils.isNullOrUndefined(entryId)) {
            entryId = entryId.trim();
            if ('' !== entryId) {
                var list = this.get('list');
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
    };
    ViewModel.prototype.logError = function (err, method) {
        if (TypeUtils.isNullOrUndefined(err)) {
            return;
        }
        console.log('[ERROR] list-vm.ViewModel.' + method + '(): ' + err);
    };
    Object.defineProperty(ViewModel.prototype, "player", {
        get: function () {
            return this.get('list').player;
        },
        enumerable: true,
        configurable: true
    });
    ViewModel.prototype.playOrPause = function () {
        var me = this;
        this.player.getStatus(function (result) {
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
                    me.player.play(entry, function (result) {
                        me.logError(result.error, 'playOrPause');
                    });
                    break;
                case VLC.PlayerState.playing:
                case VLC.PlayerState.paused:
                    console.log('Pausing...');
                    me.player.pause(entry, function (result) {
                        me.logError(result.error, 'playOrPause');
                    });
                    break;
            }
        });
    };
    ViewModel.prototype.startListeningForState = function () {
        var me = this;
        if (!TypeUtils.isNullOrUndefined(this._stateListener)) {
            return;
        }
        var isListening = false;
        this._stateListener = Timer.setInterval(function () {
            if (isListening) {
                return;
            }
            isListening = true;
            me.player.getStatus(function (result) {
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
                        isPaused = true;
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
    };
    ViewModel.prototype.stop = function () {
        var me = this;
        this.player.stop(function (result) {
            me.logError(result.error, 'stop');
        });
    };
    return ViewModel;
}(observable_1.Observable));
exports.ViewModel = ViewModel;
function toTimeString(sec) {
    if (TypeUtils.isNullOrUndefined(sec)) {
        return sec;
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
//# sourceMappingURL=list-vm.js.map