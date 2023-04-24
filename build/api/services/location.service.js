"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = void 0;
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/';
function getLocation(lat, lng) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
            const response = yield fetch(url);
            const json = yield response.json();
            const { lat: latitude, lon: longitude } = json;
            const { road, suburb, city, county, state_district, state, postcode, country } = json.address;
            const address = { road, suburb, city, county, state_district, state, postcode, country };
            const lcation = {};
            lcation.lat = lat;
            lcation.lng = lng;
            lcation.name = "";
            console.log(suburb);
            if (suburb)
                lcation.name += suburb + ", ";
            console.log(state);
            if (state)
                lcation.name += state + ", ";
            console.log(country);
            if (city)
                lcation.name += city + ", ";
            if (country)
                lcation.name += country;
            console.log(lcation);
            return lcation;
        }
        catch (err) {
            throw err;
        }
    });
}
exports.getLocation = getLocation;
