import { Request, Response } from 'express';

import {admin, database , realtimedb} from '../services/firebase.service'
import {user } from '../model/user.model';
import { hashMessage, randomNumber } from '../../utils/utils';


const create = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body)
    const { name, age } = req.body;

    const userRef = database.collection('user');
      userRef.add({
        name:name,
        age: age
      }).then((userRef)=>{
        console.log(userRef.id)
        res.status(200).json({userRef})})
        .catch((error)=>{res.status(400).json({error})})
    }

const register = async (req:Request, res:Response):Promise<void> =>{
  const {email, password} = req.body

  const newUser = new user()
  newUser.email = email
  newUser.password = await hashMessage(password)
  const plainUser = Object.assign({}, newUser);

  const userRef = database.collection('user')
  try{
    let querySnapshot = await userRef.where('email','==',email).limit(1)
    let docs = await querySnapshot.get()
    let otp = randomNumber(4)
    let id = ""
    if(docs.size!=0)
    {
      let userInfo: user
      docs.forEach((doc)=>{
        userInfo = doc.data() as user
        id = doc.id
      });

      if(userInfo.isAuth== null || !userInfo.isAuth){
        //Send OTP
        res.status(200).send({
          isError:false,
          message: "send otp successed",
          data:{
            id: id,
            otp:otp
          }
        })
      }else{
        //Notify exited account
        res.status(200).send({
          isError:"true",
          message:"acount has existed"
        })
      }
      return
    }

    const rss = await userRef.add(plainUser)
    res.status(200).send({
          isError:false,
          message:"send OTP successed",
          data:{
            id:id,
            otp: otp
          }
        })

  }catch(error){
    console.log(error)
      res.status(400).send({
        isError:true,
        message:error
      })
  }
}

export default {
  create,register
};