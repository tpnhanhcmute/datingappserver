import { Request, Response, query } from "express";
import { admin, database, realtimedb } from "../services/firebase.service";

const uploadImage = async (req: Request, res: Response): Promise<void> => {
  const { userID, listFile } = req.body;

  const image = database.collection("image");

  try {
    await image.add({
      userID,
      listFile,
    });
    res.status(200).json({ message: "upload success!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

export default { uploadImage };
