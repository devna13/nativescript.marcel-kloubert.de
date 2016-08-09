import {ViewModel} from "./main-view-model";

function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = new ViewModel();
}
exports.onNavigatingTo = onNavigatingTo;
