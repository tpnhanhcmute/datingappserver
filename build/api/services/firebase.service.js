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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = exports.database = exports.realtimedb = exports.admin = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const serviceAccount = __importStar(require("../../configs/firebase-adminsdk.json"));
require("firebase/firestore");
const nodemailer = __importStar(require("nodemailer"));
const firestore_1 = require("firebase-admin/firestore");
const gmail = "tpnhan12a1@gmail.com";
const password = "xdvdvvboulygwevi";
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://datingapp-56f26-default-rtdb.asia-southeast1.firebasedatabase.app"
});
const realtimedb = admin.database();
exports.realtimedb = realtimedb;
const database = (0, firestore_1.getFirestore)(app);
exports.database = database;
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmail,
        pass: password,
    },
});
const sendEmail = function senEmail(to, subject, message) {
    return __awaiter(this, void 0, void 0, function* () {
        transporter.sendMail({
            to: to,
            subject: subject,
            text: message,
        }, (error, info) => {
            if (error) {
                console.error(error);
                return false;
            }
            else {
                console.log(info.response);
                return true;
            }
        });
    });
};
exports.sendEmail = sendEmail;
