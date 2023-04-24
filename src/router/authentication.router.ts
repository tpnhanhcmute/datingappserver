import express from "express";

import authenticationController from "../api/controllers/authentication.controller";

const router = express.Router();

router.post("/authentication", authenticationController.authentication);

export = router;
