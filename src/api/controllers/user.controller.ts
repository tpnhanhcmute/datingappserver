import { Request, Response, query } from "express";
import {
  admin,
  database,
  realtimedb,
  sendEmail,
} from "../services/firebase.service";
import { User } from "../model/user.model";
import { hashMessage, randomNumber, getDistance } from "../../utils/utils";
import {
  collection,
  query as firestoreQuery,
  where,
  getDocs,
} from "firebase/firestore";
import { interaction } from "../model/like.model";
import { Location } from "../model/location.model";
import { Point } from "../model/point.model";
import { DiscorverUser } from "../dto/discoverUser.dto";
import { LocationID } from "../dto/locationid.dto";
import { ImageID } from "../dto/imageid.model";
import { Image } from "../model/image.model";
import { UserID } from "../dto/userid.dto";
import { Match } from "../dto/match.dto";
import { Interaction } from "../model/interaction.model";
import { LikeUser } from "../dto/likeUser.dto";
import { log } from "console";
import { sendMessage } from "../dto/sendMessage.dto";

const update = async (req: Request, res: Response): Promise<void> => {
  const user = req.body as UserID;
  let isFirstLogin = false;
  const userRef = database.collection("user").doc(user.id.toString());
  userRef
    .set(user.user, { merge: true })
    .then((userRef) => {
      res.status(200).send({
        isError: false,
        message: "Update successfully",
        data: {},
      });
    })

    .catch((error) => {
      res.status(400).send({
        isError: true,
        message: "Update falure",
        data: {},
      });
    });
};

const updateMessageID = async (
  userID: String,
  otherUserID: String,
  messageId: String
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
  const likeRequest = req.body as LikeUser;
  const like = database.collection("like");
  const date = new Date().toLocaleString();

  try {
    await like.add({
      userID: likeRequest.userID,
      isLike: likeRequest.isLike,
      otherUserID: likeRequest.ortherUserID,
      messageID: "",
    });

    // Tạo query để kiểm tra tương thích
    const matchQuery = await like
      .where("userID", "==", likeRequest.ortherUserID)
      .where("otherUserID", "==", likeRequest.userID)
      .where("isLike", "==", true)
      .get();

    console.log(matchQuery.size);

    // Kiểm tra và trả về kết quả
    if (matchQuery.size > 0) {
      const newMessageRef = realtimedb.ref("message").push(); // Tạo một DocumentReference mới
      const newMessageId = newMessageRef.key; // Lấy ID của document vừa tạo

      newMessageRef.set({
        match: `match on ${date}`,
      });

      await Promise.all([
        updateMessageID(
          likeRequest.userID,
          likeRequest.ortherUserID,
          newMessageId
        ),
      ]);

      res.status(200).json({
        message: "It's a match!",
        data: {
          otherUserID: likeRequest.ortherUserID,
          imageUrl: "chua lam",
          messageID: newMessageId,
          fullName: await getFullName(likeRequest.ortherUserID),
        },
      });
    } else {
      res.status(200).json({ message: "Like Success" });
    }
  } catch (error) {
    res.status(400).json({ error });
  }
};

const chat = async (req: Request, res: Response): Promise<void> => {
  const sendMessage = req.body as sendMessage;
  const date = new Date().toLocaleString();

  const messageRef = realtimedb.ref(`message/${sendMessage.messageID}`);
  const newMessageRef = messageRef.push();

  try {
    await newMessageRef.set({
      content: sendMessage.content,
      date,
      senderID: sendMessage.userID,
    });
    res.status(200).json({
      message: "Tin nhắn đã được gửi thành công",
      data: {
        messageData: {
          messageID: sendMessage.messageID,
          senderID: sendMessage.userID,
          content: sendMessage.content,
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

  const newUser = {} as User;
  newUser.email = email;
  newUser.password = await hashMessage(password);
  newUser.isFirstLogin = true;

  const userRef = database.collection("user");
  try {
    let querySnapshot = await userRef.where("email", "==", email).limit(1);
    let docs = await querySnapshot.get();
    let otp = randomNumber(4);
    let id = "";
    if (docs.size != 0) {
      let userInfo: User;
      docs.forEach((doc) => {
        userInfo = doc.data() as User;
        id = doc.id;
      });

      if (userInfo.isAuth == null || !userInfo.isAuth) {
        //Send OTP
        await sendEmail(email, "Datting appp: Your OTP", otp.toString());
        res.status(200).send({
          isError: false,
          message: "send otp successed",
          data: {
            email: email,
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
    const rss = await userRef.add(newUser);
    const locate = {} as Location;
    locate.lat = 0;
    locate.lng = 0;
    locate.name = "";
    database.collection("location").doc(rss.id).set(locate);

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
    const userData = userDoc.data() as User;
    locationID = userRef.id;
  }
  let p = {} as Point;
  if (locationID) {
    const locationRef = await database
      .collection("location")
      .doc(locationID.toString());
    const locationDoc = await locationRef.get();

    if (locationDoc.exists) {
      const location = locationDoc.data() as Location;
      p.latitude = location.lat;
      p.longitude = location.lng;
    }
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
    let userDocs: Array<UserID> = userCollection.docs
      .map((doc) => {
        let u = {} as UserID;
        u.id = doc.id;
        u.user = doc.data() as User;
        return u;
      })
      .filter(
        (user) =>
          user.user.age >= (minAge as Number) &&
          user.user.age <= (maxAge as Number) &&
          getGender.includes(user.user.gender) &&
          !likeDocs.includes(user.id)
      );
    let locationDoc: Array<LocationID> = locationCollection.docs.map((doc) => {
      const lcationid = {} as LocationID;
      lcationid.id = doc.id;
      lcationid.location = doc.data() as Location;
      return lcationid;
    });

    let imageDoc: Array<ImageID> = imageCollection.docs.map((doc) => {
      const imgeid = {} as ImageID;
      imgeid.id = doc.id;
      imgeid.image = doc.data() as Image;

      return imgeid;
    });

    let userDistance: Array<DiscorverUser> = userDocs.map((userDoc) => {
      const locationId = userDoc.id;
      let distance = Number.MAX_VALUE;
      const arrayLocation = locationDoc.filter(
        (location) => location.id == userDoc.id
      );
      if (arrayLocation.length > 0) {
        let point2 = {} as Point;
        point2.latitude = arrayLocation[0].location.lat;
        point2.longitude = arrayLocation[0].location.lng;
        distance = getDistance(p, point2) as number;
      }
      let dcUser = {} as DiscorverUser;
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
      isError: true,
      message: error,
    });
  }
};

const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const userRef = database.collection("user");
  const newUser = {} as User;

  try {
    const snapshots = await userRef.where("email", "==", email).get();

    if (snapshots.empty) {
      res.status(404).send("user is not exist !!");
    } else {
      const passwordHash = await hashMessage(password);
      const snapshot = await userRef
        .where("email", "==", email)
        .where("password", "==", passwordHash)
        .get();
      if (snapshot.empty) {
        res.status(404).send("password is not correct");
      } else {
        // console.log(x.docs[0].data().career)
        const userdoc = snapshot.docs[0].data();

        newUser.career = userdoc.career;
        newUser.age = userdoc.age;
        newUser.email = userdoc.email;
        newUser.occupation = userdoc.occupation;
        newUser.fullName = userdoc.fullName;
        newUser.dateOfBirth = userdoc.dateOfBirth;
        newUser.hobby = userdoc.hobby;
        newUser.isFirstLogin = userdoc.isFirstLogin;
        newUser.gender = userdoc.gender;
        newUser.dateOfBirth = userdoc.dateOfBirth;

        res.status(200).send({
          isError: false,
          message: "success",
          data: {
            id: snapshot.docs[0].id,
            user: newUser,
          },
        });
      }
    }
  } catch (error) {
    res.status(500).send("Error getting user");
  }
};

const getmatch = async (req: Request, res: Response): Promise<void> => {
  const { userID } = req.body;
  const userR = await database.collection("user").doc(userID);
  // console.log(userID)
  // const likeRef = await database.collection("like2");
  // const userRef = database.collection("user");
  try {
    const likeRef = await database
      .collection("like2")
      .where("message_id", "!=", null)
      .where("user_id_like", "==", userID)
      .get();
    // console.log(likeSnap.docs[0].data())
    if (likeRef.empty) {
      res.status(404).send("none match !!");
    } else {
      const [useref, imageRef] = await Promise.all([
        database.collection("user").get(),
        database.collection("image").get(),
      ]);
      const likelocal = likeRef.docs.map((doc) => doc.data() as Interaction);
      const userlocal: Array<UserID> = useref.docs
        .map((doc) => {
          const u = {} as UserID;
          u.id = doc.id;
          u.user = doc.data() as User;
          return u;
        })
        .filter((doc) =>
          likelocal.map((x) => x.user_id_liked).includes(doc.id)
        );
      console.log(userlocal);
      //.filter((x)=>{
      //   x.id =
      // })
      // console.log(userlocal)

      const imagelocal: Array<ImageID> = imageRef.docs.map((doc) => {
        const i = {} as ImageID;
        i.id = doc.id;
        i.image = doc.data() as Image;
        return i;
      });
      //console.log(imagelocal)
      const matchlist: Array<Match> = userlocal.map((doc) => {
        const m = {} as Match;
        m.user = doc.user;
        const temp1 = imagelocal.filter((x) => {
          return x.image.userID == doc.id;
        });
        const temp = temp1.map((x) => x.image.url);
        m.urlimage = temp[0];
        return m;
      });

      res.status(200).send({
        isError: false,
        message: "success",
        data: {
          matchlist: matchlist,
        },
      });
    }
  } catch (error) {
    res.status(500).send("Error getting matclist");
  }
};

const getConver = async (req: Request, res: Response): Promise<void> => {
  const { userID } = req.body;
  const userR = await database.collection("user").doc(userID);
  // console.log(userID)
  // const likeRef = await database.collection("like2");
  // const userRef = database.collection("user");
  try {
    const likeRef = await database
      .collection("like2")
      .where("message_id", "!=", null)
      .where("user_id_like", "==", userID)
      .get();
    // console.log(likeSnap.docs[0].data())
    if (likeRef.empty) {
      res.status(404).send("none match !!");
    } else {
      const [useref, imageRef] = await Promise.all([
        database.collection("user").get(),
        database.collection("image").get(),
      ]);
      const likelocal = likeRef.docs.map((doc) => doc.data() as Interaction);
      const userlocal: Array<UserID> = useref.docs
        .map((doc) => {
          const u = {} as UserID;
          u.id = doc.id;
          u.user = doc.data() as User;
          return u;
        })
        .filter((doc) =>
          likelocal.map((x) => x.user_id_liked).includes(doc.id)
        );
      console.log(userlocal);
      //.filter((x)=>{
      //   x.id =
      // })
      // console.log(userlocal)

      const imagelocal: Array<ImageID> = imageRef.docs.map((doc) => {
        const i = {} as ImageID;
        i.id = doc.id;
        i.image = doc.data() as Image;
        return i;
      });
      //console.log(imagelocal)
      const convermatch: Array<Match> = userlocal.map((doc) => {
        const m = {} as Match;
        m.user = doc.user;
        const temp1 = imagelocal.filter((x) => {
          return x.image.userID == doc.id;
        });
        const temp = temp1.map((x) => x.image.url);
        m.urlimage = temp[0];
        return m;
      });

      res.status(200).send({
        isError: false,
        message: "success",
        data: {
          converstation: convermatch,
        },
      });
    }
  } catch (error) {
    res.status(500).send("Error getting matclist");
  }
};

export default {
  update,
  like,
  chat,
  register,
  getDiscorverUser,
  login,
  getmatch,
};
