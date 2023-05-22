import { Request, Response, query } from "express";
import { getLocation } from "../services/location.service";
import { database } from "../services/firebase.service";

const update = async (req: Request, res: Response): Promise<void> => {
  const { userID, lat, lng } = req.body;
  try {
    const location = await getLocation(lat, lng);
    const plainLocation = Object.assign({}, location);
    await database.collection("location").doc(userID).set(plainLocation);
    res.status(200).send({
      isError: false,
      message: "Update location success",
      data: plainLocation,
    });
  } catch (err) {
    res.status(200).send({
      isError: true,
      message: err,
    });
  }
};

export default {
  update,
};
