import { Request,Response } from "express";
import {database} from "../services/firebase.service"
const authentication = async (req: Request, res: Response): Promise<void>=>{
    try{
        const {email} = req.body
        const userRef = database.collection('user').where("email", "==", email).limit(1)
        const userID = (await userRef.get()).docs.shift().id

        await database.collection("user").doc(userID).update({
            "isAuth":true
        })
        
        res.status(200).send({
            isError:false,
            message:"Authenticate successfull",
            data: {}
        })
    }catch(error){
        res.status(200).send({
            isError:true,
            message:"Authentication failure",
        })
    }
}

export default {authentication}