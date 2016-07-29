"use strict";
var Frame = require("ui/frame");
var playlists_vm_1 = require("./playlists-vm");
function onNavigatingTo(args) {
    var vm = new playlists_vm_1.ViewModel();
    var page = args.object;
    var ctx = page.navigationContext;
    vm.set('playlists', ctx.lists);
    page.bindingContext = vm;
}
exports.onNavigatingTo = onNavigatingTo;
function openPlaylist(args) {
    var view = args.object;
    var playlist = view.bindingContext;
    Frame.topmost().navigate({
        moduleName: 'list',
        context: {
            playlist: playlist,
        }
    });
}
exports.openPlaylist = openPlaylist;
//# sourceMappingURL=playlists.js.map