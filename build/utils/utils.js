"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistance = exports.randomNumber = exports.hashMessage = void 0;
const crypto_1 = __importDefault(require("crypto"));
const geolib = __importStar(require("geolib"));
const hashMessage = function hashMessage(message) {
    return __awaiter(this, void 0, void 0, function* () {
        const hash = crypto_1.default.createHash('sha256');
        hash.update(message);
        const hashedMessage = hash.digest('hex');
        return hashedMessage;
    });
};
exports.hashMessage = hashMessage;
const randomNumber = function randomNumber(length) {
    let numberRandom = "";
    for (let i = 0; i < length; i++) {
        let per = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
        numberRandom += per.toString();
    }
    return numberRandom;
};
exports.randomNumber = randomNumber;
const getDistance = function distance(point1, point2) {
    return geolib.getDistance({ latitude: point1.latitude, longitude: point1.longitude }, { latitude: point2.latitude, longitude: point2.longitude }) / 1000;
};
exports.getDistance = getDistance;
