import { Request, Response, query } from "express";
import { admin, database, realtimedb } from "../services/firebase.service";
import { user } from "../model/user.model";
import { hashMessage, randomNumber, getDistance } from "../../utils/utils";
import {
  collection,
  query as firestoreQuery,
  where,
  getDocs,
} from "firebase/firestore";
import { location } from "../model/location.model";
import { point } from "../model/point.model";
import { discorverUser } from "../dto/discoverUser.dto";
import { locationid } from "../dto/locationid.dto";
import { imageid } from "../dto/imageid.model";
import { image } from "../model/image.model";

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
  const BOTH = "both";

  let { minAge, maxAge, distance, gender, userID } = req.body;
  console.log(userID);
  if (minAge == null) minAge = 0;
  if (maxAge == null) maxAge == 100;
  if (distance == null) distance = Math.max;
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
    locationID = userData.locationID;
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
    const [userCollection, locationCollection, imageCollection] =
      await Promise.all([
        database.collection("user").get(),
        database.collection("location").get(),
        database.collection("image").get(),
      ]);

    let userDocs: Array<user> = userCollection.docs
      .map((doc) => doc.data() as user)
      .filter((user) => {
        user.age >= minAge, user.age <= maxAge, getGender.includes(user.gender);
      });

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
      const locationId = userDoc.locationID;
      let distance = Number.MAX_VALUE;
      const arrayLocation = locationDoc.filter(
        (location) => location.id == userDoc.locationID
      );
      if (arrayLocation.length > 0) {
        let point2 = new point();
        point2.latitude = arrayLocation[0].location.lat;
        point2.longitude = arrayLocation[0].location.lng;
        distance = getDistance(p, point2) as number;
      }
      let dcUser = new discorverUser();
      dcUser.age = userDoc.age;
      dcUser.fullName = userDoc.fullName;
      (dcUser.hobby = userDoc.hobby), (dcUser.occupation = userDoc.occupation);
      dcUser.distance = distance.toString();
      dcUser.imageUrl = imageDoc
        .filter((x) => {
          x.image.userID == userRef.id;
        })
        .map((x) => x.image.url);
      return dcUser;
    });

    res.status(200).send({
      isError: false,
      message: "Danh sách user",
      data: {
        discorverUser: userDistance.filter((x) => x.distance < distance),
      },
    });
  } catch (error) {
    res.status(400).send({
      isError: false,
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
