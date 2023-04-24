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
const location_service_1 = require("../services/location.service");
const firebase_service_1 = require("../services/firebase.service");
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, lat, lng } = req.body;
    try {
        const location = yield (0, location_service_1.getLocation)(lat, lng);
        const plainLocation = Object.assign({}, location);
        yield firebase_service_1.database.collection("location").doc(userID).set(plainLocation);
        res.status(200).send({
            isError: false,
            message: "Update location success",
            data: plainLocation,
        });
    }
    catch (err) {
        res.status(400).send({
            isError: true,
            message: err,
        });
    }
});
exports.default = {
    update,
};
