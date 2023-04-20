import { Request, Response, query } from "express";
import {
  admin,
  database,
  realtimedb,
  sendEmail,
} from "../services/firebase.service";
import { user } from "../model/user.model";
import { hashMessage, randomNumber, getDistance } from "../../utils/utils";
import {
  collection,
  query as firestoreQuery,
  where,
  getDocs,
} from "firebase/firestore";
import { interaction } from "../model/like.model";
import { location } from "../model/location.model";
import { point } from "../model/point.model";
import { discorverUser } from "../dto/discoverUser.dto";
import { locationid } from "../dto/locationid.dto";
import { imageid } from "../dto/imageid.model";
import { image } from "../model/image.model";
import { userid } from "../dto/userid.dto";
import { log } from "console";

const create = async (req: Request, res: Response): Promise<void> => {
  const {
    fullName,
    listHobby,
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
      listHobby,
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

const editProfile = async (req: Request, res: Response): Promise<void> => {
  const {
    userID,
    fullName,
    listHobby,
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
      listHobby,
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

const updateMessageID = async (
  userID: string,
  otherUserID: string,
  messageId: string
) => {
  const like = database.collection("like");

  const query1 = like
    .where("userID", "==", userID)
    .where("otherUserID", "==", otherUserID);
  const query2 = like
    .where("userID", "==", otherUserID)
    .where("otherUserID", "==", userID);

  const [docs1, docs2] = await Promise.all([query1.get(), query2.get()]);

  const updates1 = docs1.docs.map((doc) =>
    doc.ref.update({ messageID: messageId })
  );
  const updates2 = docs2.docs.map((doc) =>
    doc.ref.update({ messageID: messageId })
  );

  await Promise.all([...updates1, ...updates2]);
};

const getFullName = async (ID) => {
  try {
    const userRef = database.collection("user").doc(ID);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      const fullName = userData.fullName;
      // console.log(fullName);
      return fullName;
    } else {
      throw new Error(`User document with ID ${ID} not found`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const like = async (req: Request, res: Response): Promise<void> => {
  const { userID, isLike, otherUserID } = req.body;
  const like = database.collection("like");
  const date = new Date().toLocaleString();

  try {
    await like.add({
      userID,
      isLike,
      otherUserID,
      messageID: "", // Tạo một field messageID trống
    });

    // Tạo query để kiểm tra tương thích
    const matchQuery = await like
      .where("userID", "==", otherUserID)
      .where("otherUserID", "==", userID)
      .where("isLike", "==", "true")
      .get();

    // Kiểm tra và trả về kết quả
    if (matchQuery.size > 0) {
      const newMessageRef = realtimedb.ref("message").push(); // Tạo một DocumentReference mới
      const newMessageId = newMessageRef.key; // Lấy ID của document vừa tạo

      const sender1Content = {
        senderID: userID,
        content: "create content success",
        date,
      };
      const sender2Content = {
        senderID: otherUserID,
        content: "create content success",
        date,
      };
      newMessageRef.set({
        listContent: [sender1Content, sender2Content],
      });

      await Promise.all([updateMessageID(userID, otherUserID, newMessageId)]);

      res.status(200).json({
        message: "It's a match!",
        data: {
          otherUserID,
          imageUrl: "chua lam",
          messageID: newMessageId,
          fullName: await getFullName(otherUserID),
        },
      });
    } else {
      res.status(200).json({ message: "Like Success" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const { userID, messageID, content } = req.body;
  const date = new Date().toLocaleString();

  const messageRef = realtimedb.ref(`message/${messageID}/listContent`);
  const newMessageRef = messageRef.push();

  try {
    await newMessageRef.set({
      content,
      date,
      senderID: userID,
    });
    res.status(200).json({
      message: "Tin nhắn đã được gửi thành công",
      data: {
        messageData: {
          messageID,
          senderID: userID,
          content,
          date,
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    res.status(500).send("Có lỗi xảy ra khi gửi tin nhắn");
  }
};

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
        await sendEmail(email, "Datting appp: Your OTP", otp.toString());
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
    await sendEmail(email, "Datting appp: Your OTP", otp.toString());
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
  if (minAge == null) minAge = 0;
  if (maxAge == null) maxAge = Number.MAX_VALUE;
  if (distance == null) distance = Number.MAX_VALUE;
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
    const [
      userCollection,
      locationCollection,
      imageCollection,
      likeCollection,
    ] = await Promise.all([
      database.collection("user").where("isAuth", "==", true).get(),
      database.collection("location").get(),
      database.collection("image").get(),
      database
        .collection("like")
        .where("userIDLike", "==", userID)
        .where("isLike", "==", true)
        .get(),
    ]);

    let likeDocs = likeCollection.docs.map(
      (like) => (like.data() as interaction).userIDLiked
    );
    let userDocs: Array<userid> = userCollection.docs
      .map((doc) => {
        let u = new userid();
        u.id = doc.id;
        u.user = doc.data() as user;
        return u;
      })
      .filter(
        (user) =>
          user.user.age >= (minAge as Number) &&
          user.user.age <= (maxAge as Number) &&
          getGender.includes(user.user.gender) &&
          !likeDocs.includes(user.id)
      );
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
      (dcUser.hobby = userDoc.user.hobby),
        (dcUser.occupation = userDoc.user.occupation);
      dcUser.distance = distance;
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

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const userRef = database.collection("user");
  const newUser = new user();

  try {
    const snapshots = await userRef
      .where("email", "==", email)
      .where("password", "==", password)
      .get();

    if (snapshots.empty) {
      res.status(404).send("User not found");
    } else {
      // console.log(x.docs[0].data().career)
      const userdoc = snapshots.docs[0].data();
      newUser.career = userdoc.career;
      newUser.age = userdoc.age;
      newUser.occupation = userdoc.occupation;
      newUser.fullName = userdoc.fullName;
      newUser.dateOfBirth = userdoc.dateOfBirth;
      newUser.hobby = userdoc.hobby;

      res.status(200).send({
        isError: false,
        message: "success",
        data: {
          user: newUser,
        },
      });
    }
  } catch (error) {
    res.status(500).send("Error getting user");
  }
};

export default {
  create,
  editProfile,
  register,
  getDiscorverUser,
  like,
  login,
  sendMessage,
};
