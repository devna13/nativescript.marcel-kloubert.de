import Dialogs = require('ui/dialogs');
import {Observable} from "data/observable";
import OpenWeatherMap = require('./OpenWeatherMap');

export class ViewModel extends Observable {
    constructor() {
        super();

        this.set('apiKey', '');
        this.set('zipCode', '52222');
        this.set('country', 'de');
        this.set('isLoadingForecast', false);
    }
    
    public loadForecast() {
        var me = this;

        if (me.get('isLoadingForecast')) {
            return;
        }

        me.set('isLoadingForecast', true);

        var service = new OpenWeatherMap.Service(me.get('apiKey'));
        service.getForecast({
            callback: (result) => {
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
    }
}
