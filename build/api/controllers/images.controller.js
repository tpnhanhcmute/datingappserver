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
const firebase_service_1 = require("../services/firebase.service");
const uploadImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let uploadRequest = req.body;
    try {
        const imageDocs = yield firebase_service_1.database.collection("image").where("userID", "==", uploadRequest.userID).get();
        ((yield imageDocs).docs).forEach((doc) => __awaiter(void 0, void 0, void 0, function* () {
            yield doc.ref.delete();
        }));
        uploadRequest.listImage.forEach((x) => __awaiter(void 0, void 0, void 0, function* () {
            const imageRequestUpdate = {};
            imageRequestUpdate.userID = uploadRequest.userID;
            imageRequestUpdate.url = x;
            firebase_service_1.database.collection("image").add(imageRequestUpdate);
        }));
        res.status(200).send({
            isError: false,
            message: "Upload successfull",
            data: {}
        });
    }
    catch (error) {
        res.status(400).send({
            isError: true,
            message: "Upload falure"
        });
    }
});
const getImages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userID } = req.body;
        const imageRef = yield (firebase_service_1.database.collection("image").where("userID", "==", userID));
        const listImage = [];
        (yield imageRef.get()).docs.forEach(x => {
            const image = x.data();
            if (image.url)
                listImage.push(image.url);
        });
        res.status(200).send({
            isError: false,
            message: "Get image url successfull",
            data: {
                listImage: listImage
            }
        });
    }
    catch (error) {
        res.status(500).send({
            isError: true,
            message: error,
        });
    }
});
exports.default = { uploadImage, getImages };
