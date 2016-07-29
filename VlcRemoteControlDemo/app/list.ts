import Frame =require("ui/frame");
import {ViewModel} from "./list-vm";
import VLC = require('./VLC');

interface INavigationContext {
    playlist: VLC.IPlaylist;
}

export function onNavigatingTo(args) {
    var vm = new ViewModel();

    var page = args.object;

    var ctx = <INavigationContext>page.navigationContext;
    vm.set('list', ctx.playlist);

    page.bindingContext = vm;

    vm.startListeningForState();
}

export function playEntry(args) {
    var view = args.object;
    var entry = <VLC.IPlaylistEntry>view.bindingContext;

    console.log('Entry: ' + entry.name);

    entry.play((result) => {
        
    });
}
