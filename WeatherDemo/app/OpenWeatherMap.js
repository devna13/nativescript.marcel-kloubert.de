"use strict";
var ApiClient = require('nativescript-apiclient');
var Enumerable = require('nativescript-enumerable');
var Moment = require('moment');
/**
 * List of weather types.
 */
(function (WeatherType) {
    WeatherType[WeatherType["broken_clouds"] = 803] = "broken_clouds";
    WeatherType[WeatherType["calm"] = 951] = "calm";
    WeatherType[WeatherType["clear_sky"] = 800] = "clear_sky";
    WeatherType[WeatherType["cold"] = 903] = "cold";
    WeatherType[WeatherType["drizzle"] = 301] = "drizzle";
    WeatherType[WeatherType["drizzle_rain"] = 311] = "drizzle_rain";
    WeatherType[WeatherType["dust"] = 761] = "dust";
    WeatherType[WeatherType["extreme_rain"] = 504] = "extreme_rain";
    WeatherType[WeatherType["few_clouds"] = 801] = "few_clouds";
    WeatherType[WeatherType["fog"] = 741] = "fog";
    WeatherType[WeatherType["freezing_rain"] = 511] = "freezing_rain";
    WeatherType[WeatherType["fresh_breeze"] = 955] = "fresh_breeze";
    WeatherType[WeatherType["gale"] = 958] = "gale";
    WeatherType[WeatherType["gentle_breeze"] = 953] = "gentle_breeze";
    WeatherType[WeatherType["hail"] = 906] = "hail";
    WeatherType[WeatherType["haze"] = 721] = "haze";
    WeatherType[WeatherType["heavy_intensity_drizzle"] = 302] = "heavy_intensity_drizzle";
    WeatherType[WeatherType["heavy_intensity_drizzle_rain"] = 312] = "heavy_intensity_drizzle_rain";
    WeatherType[WeatherType["heavy_intensity_rain"] = 502] = "heavy_intensity_rain";
    WeatherType[WeatherType["heavy_intensity_shower_rain"] = 522] = "heavy_intensity_shower_rain";
    WeatherType[WeatherType["heavy_shower_rain_and_drizzle"] = 314] = "heavy_shower_rain_and_drizzle";
    WeatherType[WeatherType["heavy_shower_snow"] = 622] = "heavy_shower_snow";
    WeatherType[WeatherType["heavy_snow"] = 602] = "heavy_snow";
    WeatherType[WeatherType["heavy_thunderstorm"] = 212] = "heavy_thunderstorm";
    WeatherType[WeatherType["high_wind__near_gale"] = 957] = "high_wind__near_gale";
    WeatherType[WeatherType["hot"] = 904] = "hot";
    WeatherType[WeatherType["hurricane"] = 902] = "hurricane";
    WeatherType[WeatherType["hurricane_cloudy_gusts"] = 962] = "hurricane_cloudy_gusts";
    WeatherType[WeatherType["light_breeze"] = 952] = "light_breeze";
    WeatherType[WeatherType["light_intensity_drizzle"] = 300] = "light_intensity_drizzle";
    WeatherType[WeatherType["light_intensity_drizzle_rain"] = 310] = "light_intensity_drizzle_rain";
    WeatherType[WeatherType["light_intensity_shower_rain"] = 520] = "light_intensity_shower_rain";
    WeatherType[WeatherType["light_rain"] = 500] = "light_rain";
    WeatherType[WeatherType["light_rain_and_snow"] = 615] = "light_rain_and_snow";
    WeatherType[WeatherType["light_shower_snow"] = 620] = "light_shower_snow";
    WeatherType[WeatherType["light_snow"] = 600] = "light_snow";
    WeatherType[WeatherType["light_thunderstorm"] = 210] = "light_thunderstorm";
    WeatherType[WeatherType["mist"] = 701] = "mist";
    WeatherType[WeatherType["moderate_breeze"] = 954] = "moderate_breeze";
    WeatherType[WeatherType["moderate_rain"] = 501] = "moderate_rain";
    WeatherType[WeatherType["overcast_clouds"] = 804] = "overcast_clouds";
    WeatherType[WeatherType["ragged_shower_rain"] = 531] = "ragged_shower_rain";
    WeatherType[WeatherType["ragged_thunderstorm"] = 221] = "ragged_thunderstorm";
    WeatherType[WeatherType["rain_and_snow"] = 616] = "rain_and_snow";
    WeatherType[WeatherType["sand"] = 751] = "sand";
    WeatherType[WeatherType["sand__dust_whirls"] = 731] = "sand__dust_whirls";
    WeatherType[WeatherType["scattered_clouds"] = 802] = "scattered_clouds";
    WeatherType[WeatherType["severe_gale"] = 959] = "severe_gale";
    WeatherType[WeatherType["shower_drizzle"] = 321] = "shower_drizzle";
    WeatherType[WeatherType["shower_rain"] = 521] = "shower_rain";
    WeatherType[WeatherType["shower_rain_and_drizzle"] = 313] = "shower_rain_and_drizzle";
    WeatherType[WeatherType["shower_sleet"] = 612] = "shower_sleet";
    WeatherType[WeatherType["shower_snow"] = 621] = "shower_snow";
    WeatherType[WeatherType["sleet"] = 611] = "sleet";
    WeatherType[WeatherType["smoke"] = 711] = "smoke";
    WeatherType[WeatherType["snow"] = 601] = "snow";
    WeatherType[WeatherType["squalls"] = 771] = "squalls";
    WeatherType[WeatherType["storm"] = 960] = "storm";
    WeatherType[WeatherType["strong_breeze"] = 956] = "strong_breeze";
    WeatherType[WeatherType["thunderstorm"] = 211] = "thunderstorm";
    WeatherType[WeatherType["thunderstorm_with_drizzle"] = 231] = "thunderstorm_with_drizzle";
    WeatherType[WeatherType["thunderstorm_with_heavy_drizzle"] = 232] = "thunderstorm_with_heavy_drizzle";
    WeatherType[WeatherType["thunderstorm_with_heavy_rain"] = 202] = "thunderstorm_with_heavy_rain";
    WeatherType[WeatherType["thunderstorm_with_light_drizzle"] = 230] = "thunderstorm_with_light_drizzle";
    WeatherType[WeatherType["thunderstorm_with_light_rain"] = 200] = "thunderstorm_with_light_rain";
    WeatherType[WeatherType["thunderstorm_with_rain"] = 201] = "thunderstorm_with_rain";
    WeatherType[WeatherType["tornado_1"] = 781] = "tornado_1";
    WeatherType[WeatherType["tornado_2"] = 900] = "tornado_2";
    WeatherType[WeatherType["tropical_storm"] = 901] = "tropical_storm";
    WeatherType[WeatherType["very_heavy_rain"] = 503] = "very_heavy_rain";
    WeatherType[WeatherType["violent_storm"] = 961] = "violent_storm";
    WeatherType[WeatherType["volcanic_ash"] = 762] = "volcanic_ash";
    WeatherType[WeatherType["windy"] = 905] = "windy";
})(exports.WeatherType || (exports.WeatherType = {}));
var WeatherType = exports.WeatherType;
/**
 * Class for handling OpenWeatherMap API service.
 */
var Service = (function () {
    /**
     * Initializes a new instance of that class.
     *
     * @param {string} apiKey The API key to use.
     */
    function Service(apiKey) {
        this._apiKey = ('' + apiKey).trim();
    }
    Object.defineProperty(Service.prototype, "apiKey", {
        /**
         * Gets the underlying API key.
         */
        get: function () {
            return this._apiKey;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets a forecast.
     *
     * @param {IGetForecastOptions} opts The options.
     */
    Service.prototype.getForecast = function (opts) {
        var raiseError = function (err) {
            opts.callback({
                error: err,
            });
        };
        var client = ApiClient.newClient({
            baseUrl: 'http://api.openweathermap.org/data/2.5/forecast',
        });
        client.ok(function (result) {
            var owmResult = result.getJSON();
            // let's use LINQ...
            // convert JSON data ....
            var entries = Enumerable.fromArray(owmResult.list)
                .select(function (x) {
                // convert weather entries ...                    
                var weatherEntries = Enumerable.fromArray(x.weather)
                    .select(function (y) { return WeatherType[y.id]; })
                    .toArray();
                return {
                    temperature: {
                        max: x.main.temp_max,
                        min: x.main.temp_min,
                        value: x.main.temp,
                    },
                    time: Moment(x.dt * 1000).utcOffset(0).format('YYYY-MM-DD HH:mm'),
                    weather: weatherEntries,
                };
            })
                .toArray();
            console.log('Forecast entries: ' + entries.length);
            // invoke the callback
            opts.callback({
                location: owmResult.city.coord,
                locationName: owmResult.city.name,
                list: entries,
            });
        }).unauthorized(function (result) {
            // invalid API key
            raiseError('Invalid API key!');
        }).error(function (ctx) {
            // client error
            raiseError('[ERROR]: ' + ctx.error);
        });
        client.addLogger(function (msg) {
            console.log('[API client]: ' + msg.message);
        });
        // do the request
        client.get({
            params: {
                'APPID': this._apiKey,
                'zip': ('' + opts.zipCode) +
                    ('' + opts.country).toLowerCase().trim(),
            },
        });
    };
    return Service;
}());
exports.Service = Service;
//# sourceMappingURL=OpenWeatherMap.js.map