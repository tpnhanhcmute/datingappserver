import { Request, Response, query } from "express";
import { admin, database, realtimedb } from "../services/firebase.service";
import { UploadImageRequest } from "../dto/image.dto";
import { deleteDoc } from "firebase/firestore";
import { Image } from "../model/image.model";

const uploadImage = async (req: Request, res: Response): Promise<void> => {
  let uploadRequest = req.body as UploadImageRequest

  try{
      const imageDocs = await database.collection("image").where("userID", "==", uploadRequest.userID).get();
      
      ((await imageDocs).docs).forEach(async (doc)=>{
          await doc.ref.delete()
      })

       uploadRequest.listImage.forEach(async (x)=>{
        const imageRequestUpdate = {} as Image
        imageRequestUpdate.userID = uploadRequest.userID
        imageRequestUpdate.url = x
        database.collection("image").add(imageRequestUpdate)
      })

      res.status(200).send({
        isError:false,
        message:"Upload successfull",
        data:{}
      })
  }catch(error){
    res.status(400).send({
      isError:true,
      message:"Upload falure"
      
    })
  }
};

const getImages = async (req:Request, res:Response):Promise<void>=>{
    try{
      const userID = req.body as String
      const imageRef = await (database.collection("image")).get()
      
      if(!imageRef.empty)
      {
        const listImage = [] as Array<String>

        imageRef.docs.forEach(x=>{
          const image = x.data() as Image
          listImage.push(image.url)
        })
        res.status(200).send({
          isError:false,
          message:"Get image url successfull",
          data:{
            listImage: listImage
          }
        })
      }else{
        throw "Use need to upload image to app"
      }
    }catch(error){
      res.status(500).send({
        isError:true,
        message:error,
      })
    }
}

export default { uploadImage,getImages };
