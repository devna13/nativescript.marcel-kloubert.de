"use strict";
var Dialogs = require('ui/dialogs');
var observable_1 = require("data/observable");
var OpenWeatherMap = require('./OpenWeatherMap');
var ViewModel = (function (_super) {
    __extends(ViewModel, _super);
    function ViewModel() {
        _super.call(this);
        this.set('apiKey', '');
        this.set('zipCode', '52222');
        this.set('country', 'de');
        this.set('isLoadingForecast', false);
    }
    ViewModel.prototype.loadForecast = function () {
        var me = this;
        if (me.get('isLoadingForecast')) {
            return;
        }
        me.set('isLoadingForecast', true);
        var service = new OpenWeatherMap.Service(me.get('apiKey'));
        service.getForecast({
            callback: function (result) {
                me.set('isLoadingForecast', false);
                if (result.error) {
                    Dialogs.alert('ERROR: ' + result.error);
                    return;
                }
                me.set('forecast', result.list);
                me.set('location', {
                    name: result.locationName,
                    lat: result.location.lat,
                    lon: result.location.lon,
                });
            },
            zipCode: me.get('zipCode'),
            country: me.get('country'),
        });
    };
    return ViewModel;
}(observable_1.Observable));
exports.ViewModel = ViewModel;
//# sourceMappingURL=main-view-model.js.map