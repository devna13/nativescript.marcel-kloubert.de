import ApiClient = require('nativescript-apiclient');
import Enumerable = require('nativescript-enumerable');
import Moment = require('moment');

/**
 * A forecast entry.
 */
export interface IForecastEntry {
    /**
     * The temperature data.
     */
    temperature: {
        /**
         * Maximum temperature, in Kelvin
         */
        max: number;

        /**
         * Minimum temperature, in Kelvin
         */
        min: number;

        /**
         * The value expected value, in Kelvin
         */
        value: number;
    },
    
    /**
     * The UTC timestamp the entry is for
     */
    time: string;

    /**
     * The expected weather(s).
     */
    weather: WeatherType[];
}

/**
 * The result of a forecast.
 */
export interface IForecastResult {
    /**
     * The error (if occurred).
     */
    error?: any;

    /**
     * The list of entries.
     */
    list?: IForecastEntry[];
    
    /**
     * The geo location. 
     **/    
    location?: ILocation;
    
    /**
     * The name of the location, like the city.
     */
    locationName?: string;
}

/**
 * Options for getting a forcast.
 */
export interface IGetForecastOptions {
    /**
     * The callback.
     */
    callback: (result: IForecastResult) => void;

    /**
     * The country, like 'de' or 'ru'
     */
    country: string;

    /**
     * The zip code of the city.
     */
    zipCode: string;
}

/**
 * Stores data of a geo location.
 */
export interface ILocation {
    /**
     * The latitude
     */
    lat: number;

    /**
     * The longitude
     */
    lon: number;
}

interface IOWMForecastEntry {
    dt: number;
    main: {
        temp: number;
        temp_min: number;
        temp_max: number;
    },
    weather: IOWMForecastWeather[];
}

interface IOWMForecastResult {
    city: {
        id: number;
        name: string;
        coord: ILocation;
        country: string;
    },
    cnt: number;
    list: IOWMForecastEntry[];
}

interface IOWMForecastWeather {
    description: string;
    icon: string;
    id: number;
    main: string;
}

/**
 * List of weather types.
 */
export enum WeatherType {
    broken_clouds = 803,
    calm = 951,
    clear_sky = 800,
    cold = 903,
    drizzle = 301,
    drizzle_rain = 311,
    dust = 761,
    extreme_rain = 504,
    few_clouds = 801,
    fog = 741,
    freezing_rain = 511,
    fresh_breeze = 955,
    gale = 958,
    gentle_breeze = 953,
    hail = 906,
    haze = 721,
    heavy_intensity_drizzle = 302,
    heavy_intensity_drizzle_rain = 312,
    heavy_intensity_rain = 502,
    heavy_intensity_shower_rain = 522,
    heavy_shower_rain_and_drizzle = 314,
    heavy_shower_snow = 622,
    heavy_snow = 602,
    heavy_thunderstorm = 212,
    high_wind__near_gale = 957,
    hot = 904,
    hurricane = 902,
    hurricane_cloudy_gusts = 962,
    light_breeze = 952,
    light_intensity_drizzle = 300,
    light_intensity_drizzle_rain = 310,
    light_intensity_shower_rain = 520,
    light_rain = 500,
    light_rain_and_snow = 615,
    light_shower_snow = 620,
    light_snow = 600,
    light_thunderstorm = 210,
    mist = 701,
    moderate_breeze = 954,
    moderate_rain = 501,
    overcast_clouds = 804,
    ragged_shower_rain = 531,
    ragged_thunderstorm = 221,
    rain_and_snow = 616,
    sand = 751,
    sand__dust_whirls = 731,
    scattered_clouds = 802,
    severe_gale = 959,
    shower_drizzle = 321,
    shower_rain = 521,
    shower_rain_and_drizzle = 313,
    shower_sleet = 612,
    shower_snow = 621,
    sleet = 611,
    smoke = 711,
    snow = 601,
    squalls = 771,
    storm = 960,
    strong_breeze = 956,
    thunderstorm = 211,
    thunderstorm_with_drizzle = 231,
    thunderstorm_with_heavy_drizzle = 232,
    thunderstorm_with_heavy_rain = 202,
    thunderstorm_with_light_drizzle = 230,
    thunderstorm_with_light_rain = 200,
    thunderstorm_with_rain = 201,
    tornado_1 = 781,
    tornado_2 = 900,
    tropical_storm = 901,
    very_heavy_rain = 503,
    violent_storm = 961,
    volcanic_ash = 762,
    windy = 905,
}


/**
 * Class for handling OpenWeatherMap API service.
 */
export class Service {
    private _apiKey: string;

    /**
     * Initializes a new instance of that class.
     * 
     * @param {string} apiKey The API key to use.
     */
    constructor(apiKey: string) {
        this._apiKey = ('' + apiKey).trim();
    }

    /**
     * Gets the underlying API key.
     */
    public get apiKey(): string {
        return this._apiKey;
    }

    /**
     * Gets a forecast.
     * 
     * @param {IGetForecastOptions} opts The options.
     */
    public getForecast(opts: IGetForecastOptions) {
        var raiseError = (err: any) => {
            opts.callback({
                error: err,
            });
        };
        
        var client = ApiClient.newClient({
            baseUrl: 'http://api.openweathermap.org/data/2.5/forecast',
        });
        
        client.ok((result) => {
            var owmResult = result.getJSON<IOWMForecastResult>();

            // let's use LINQ...

            // convert JSON data ....
            var entries = Enumerable.fromArray(owmResult.list)
                 // ... to array of 'IForecastEntry' entries
                .select<IForecastEntry>((x: IOWMForecastEntry) => {
                    // convert weather entries ...                    
                    var weatherEntries = Enumerable.fromArray(x.weather)
                         // ... to array of 'WeatherType' values
                        .select((y: IOWMForecastWeather) => WeatherType[y.id])
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
        }).unauthorized((result) => {
            // invalid API key
            raiseError('Invalid API key!');
        }).error((ctx) => {
            // client error
            raiseError('[ERROR]: ' + ctx.error);
        });

        client.addLogger((msg) => {
            console.log('[API client]: ' + msg.message);
        });

        // do the request
        client.get({
            params:  {
                'APPID': this._apiKey,
                'zip': ('' + opts.zipCode) + 
                       ('' + opts.country).toLowerCase().trim(),
            },
        });
    }
}
