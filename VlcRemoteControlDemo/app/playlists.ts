import Frame =require("ui/frame");
import {ViewModel} from "./playlists-vm";
import VLC = require('./VLC');

interface INavigationContext {
    lists: VLC.IPlaylist[];
    player: VLC.Player;
}

export function onNavigatingTo(args) {
    var vm = new ViewModel();

    var page = args.object;

    var ctx = <INavigationContext>page.navigationContext;
    vm.set('playlists', ctx.lists);

    page.bindingContext = vm;
}

export function openPlaylist(args) {
    var view = args.object;
    var playlist = <VLC.IPlaylist>view.bindingContext;

    Frame.topmost().navigate({
        moduleName: 'list',
        context: {
            playlist: playlist,
        }
    });
}
