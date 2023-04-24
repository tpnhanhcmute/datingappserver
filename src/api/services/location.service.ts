import { Location } from "../model/location.model";

const NOMINATIM_URL='https://nominatim.openstreetmap.org/'

interface Address {
  road?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

export async function getLocation(lat: number, lng: number): Promise<Location>{
 try{
      const url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

      const response = await fetch(url);
      const json = await response.json();

      const { lat: latitude, lon: longitude } = json;
      const { road, suburb, city, county, state_district, state, postcode, country } = json.address;
      const address: Address = { road, suburb, city, county, state_district, state, postcode, country };
      
      const lcation = {} as Location
      lcation.lat = lat
      lcation.lng = lng
      lcation.name = ""

      console.log(suburb)
      if(suburb) lcation.name+=suburb +", "
      console.log(state)
      if(state) lcation.name+= state+", "
      console.log(country)
      if(city) lcation.name+= city+", "
      if(country)lcation.name+= country
      console.log(lcation)
      return lcation
  }catch(err){
    throw err
  }
}