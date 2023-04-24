import express from "express";

import locationController from "../api/controllers/location.controler";

const router = express.Router();

router.post("/update", locationController.update);

export = router;
