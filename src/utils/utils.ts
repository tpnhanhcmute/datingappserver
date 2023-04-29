import crypto from 'crypto';
import * as geolib from 'geolib';
import {Point} from '../api/model/point.model'
const hashMessage =async function hashMessage(message: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(message);
    const hashedMessage = hash.digest('hex');
    return hashedMessage;
}
const randomNumber = function randomNumber(length:number) : String {
    let numberRandom:String = ""
    for (let i = 0; i < length; i++) {
       let per =  Math.floor(Math.random() * (9 - 0 + 1)) + 0;
       numberRandom +=per.toString()
    }
    return numberRandom
}
const getDistance = function distance(point1: Point, point2: Point): Number {
    return geolib.getDistance(
      { latitude: point1.latitude as number, longitude: point1.longitude as number },
      { latitude: point2.latitude as number, longitude: point2.longitude as number }
    )/1000;
}
const getAge = (dateOfBirth: string):Number=>{
    const [day, month, year] = dateOfBirth.split("/").map(Number);
    const birthDate: Date = new Date(year, month - 1, day);

  // Calculate the age in years
  const differenceInMs: number = Date.now() - birthDate.getTime();
  const ageInMs: number = new Date(differenceInMs).getFullYear() - 1970;
  const age: number = Math.floor(ageInMs);

  return age;
}

export {hashMessage, randomNumber,getDistance,getAge}