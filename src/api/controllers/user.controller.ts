import { Request, Response, query } from "express";
import { admin, database, realtimedb, sendEmail } from "../services/firebase.service";
import { user } from "../model/user.model";
import { hashMessage, randomNumber, getDistance } from "../../utils/utils";
import {
  collection,
  query as firestoreQuery,
  where,
  getDocs,
} from "firebase/firestore";
import {interaction} from "../model/like.model"
import { location } from "../model/location.model";
import { point } from "../model/point.model";
import { discorverUser } from "../dto/discoverUser.dto";
import { locationid } from "../dto/locationid.dto";
import { imageid } from "../dto/imageid.model";
import { image } from "../model/image.model";
import { userid } from "../dto/userid.dto";

const create = async (req: Request, res: Response): Promise<void> => {
  const {
    fullName,
    hobby,
    dateOfBirth,
    gender,
    email,
    phoneNumber,
    age,
    occupation,
    career,
  } = req.body;

  const userRef = database.collection("user");
  userRef
    .add({
      fullName,
      hobby,
      dateOfBirth,
      gender,
      email,
      phoneNumber,
      age,
      occupation,
      career,
    })
    .then((userRef) => {
      res.status(200).json({ userRef });
    })

    .catch((error) => {
      res.status(400).json({ error });
    });
};

const update = async (req: Request, res: Response): Promise<void> => {
  const {
    userID,
    fullName,
    hobby,
    dateOfBirth,
    gender,
    email,
    phoneNumber,
    age,
    occupation,
    career,
  } = req.body;

  const userRef = database.collection("user").doc(userID);
  userRef
    .update({
      userID,
      fullName,
      hobby,
      dateOfBirth,
      gender,
      email,
      phoneNumber,
      age,
      occupation,
      career,
    })
    .then((userRef) => {
      res.status(200).json({ message: "Updated Success" });
    })

    .catch((error) => {
      res.status(400).json({ error });
    });
};

const match = async (req: Request, res: Response): Promise<void> => {};

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const newUser = new user();
  newUser.email = email;
  newUser.password = await hashMessage(password);
  const plainUser = Object.assign({}, newUser);

  const userRef = database.collection("user");
  try {
    let querySnapshot = await userRef.where("email", "==", email).limit(1);
    let docs = await querySnapshot.get();
    let otp = randomNumber(4);
    let id = "";
    if (docs.size != 0) {
      let userInfo: user;
      docs.forEach((doc) => {
        userInfo = doc.data() as user;
        id = doc.id;
      });

      if (userInfo.isAuth == null || !userInfo.isAuth) {
        //Send OTP
        await sendEmail(email,"Datting appp: Your OTP",otp.toString())
        res.status(200).send({
          isError: false,
          message: "send otp successed",
          data: {
            id: id,
            otp: otp,
          },
        });
      } else {
        //Notify exited account
        res.status(200).send({
          isError: "true",
          message: "acount has existed",
        });
      }
      return;
    }

    await sendEmail(email,"Datting appp: Your OTP",otp.toString())
    const rss = await userRef.add(plainUser);
    res.status(200).send({
      isError: false,
      message: "send OTP successed",
      data: {
        id: id,
        otp: otp,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      isError: true,
      message: error,
    });
  }
};

const getDiscorverUser = async (req: Request, res: Response): Promise<void> => {
  const MALE = "Male";
  const FEMALE = "Female";
  const BOTH = "Both";

  let { minAge, maxAge, distance, gender, userID } = req.body;
  console.log(userID);
  if (minAge == null) minAge = 0
  if (maxAge == null) maxAge = Number.MAX_VALUE
  if (distance == null) distance = Number.MAX_VALUE
  if (gender == null) gender = BOTH;
  const getGender = [];
  if (gender == BOTH) {
    getGender.push(MALE);
    getGender.push(FEMALE);
  } else {
    getGender.push(gender);
  }
  const userRef = await database.collection("user").doc(userID);
  let locationID: String;
  const userDoc = await userRef.get();
  if (userDoc.exists) {
    const userData = userDoc.data() as user;
    locationID = userRef.id;
  }

  const locationRef = await database
    .collection("location")
    .doc(locationID.toString());
  const locationDoc = await locationRef.get();
  let p = new point();
  if (locationDoc.exists) {
    const location = locationDoc.data() as location;
    p.latitude = location.lat;
    p.longitude = location.lng;
  }

  try {
    const [userCollection, locationCollection, imageCollection, likeCollection] =
      await Promise.all([
        database.collection("user").where("isAuth","==",true).get(),
        database.collection("location").get(),
        database.collection("image").get(),
        database.collection("like").where("userIDLike","==", userID).where("isLike","==", true).get()
      ]);

    let likeDocs = likeCollection.docs.map(like=>(like.data() as interaction).userIDLiked)
    let userDocs: Array<userid> = userCollection.docs
      .map((doc) => {
        let u = new userid()
        u.id = doc.id
        u.user =  doc.data() as user
        return u
      }).filter(user=>user.user.age >= (minAge as Number) && user.user.age <=(maxAge as Number) && getGender.includes(user.user.gender) && !likeDocs.includes(user.id))

    let locationDoc: Array<locationid> = locationCollection.docs.map((doc) => {
      const lcationid = new locationid();
      lcationid.id = doc.id;
      lcationid.location = doc.data() as location;
      return lcationid;
    });

    let imageDoc: Array<imageid> = imageCollection.docs.map((doc) => {
      const imgeid = new imageid();
      imgeid.id = doc.id;
      imgeid.image = doc.data() as image;

      return imgeid;
    });

    let userDistance: Array<discorverUser> = userDocs.map((userDoc) => {
      const locationId = userDoc.id;
      let distance = Number.MAX_VALUE;
      const arrayLocation = locationDoc.filter(
        (location) => location.id == userDoc.id
      );
      if (arrayLocation.length > 0) {
        let point2 = new point();
        point2.latitude = arrayLocation[0].location.lat;
        point2.longitude = arrayLocation[0].location.lng;
        distance = getDistance(p, point2) as number;
      }
      let dcUser = new discorverUser();
      dcUser.age = userDoc.user.age;
      dcUser.fullName = userDoc.user.fullName;
      (dcUser.hobby = userDoc.user.hobby), (dcUser.occupation = userDoc.user.occupation);
      dcUser.distance = distance
      dcUser.imageUrl = imageDoc
        .filter((x) => {
          x.image.userID == userRef.id;
        })
        .map((x) => x.image.url);
      return dcUser;
    });

    res.status(200).send({
      isError: false,
      message: "List user",
      data: {
        discorverUser: userDistance.filter((x) => x.distance < distance),
      },
    });
  } catch (error) {
    res.status(400).send({
      isError: true,
      message: error,
    });
  }
};
export default {
  create,
  update,
  register,
  getDiscorverUser,
  match,
};
