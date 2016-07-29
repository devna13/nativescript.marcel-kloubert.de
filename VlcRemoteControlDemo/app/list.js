"use strict";
var list_vm_1 = require("./list-vm");
function onNavigatingTo(args) {
    var vm = new list_vm_1.ViewModel();
    var page = args.object;
    var ctx = page.navigationContext;
    vm.set('list', ctx.playlist);
    page.bindingContext = vm;
    vm.startListeningForState();
}
exports.onNavigatingTo = onNavigatingTo;
function playEntry(args) {
    var view = args.object;
    var entry = view.bindingContext;
    console.log('Entry: ' + entry.name);
    entry.play(function (result) {
    });
}
exports.playEntry = playEntry;
//# sourceMappingURL=list.js.map