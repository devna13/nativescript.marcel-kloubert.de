import {ViewModel} from "./main-view-model";

export function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = new ViewModel();
}
