import express from "express";

import controller from "../api/controllers/images.controller";

const router = express.Router();

router.post("/upload", controller.uploadImage);

router.post("/getImages", controller.getImages);

export = router;
