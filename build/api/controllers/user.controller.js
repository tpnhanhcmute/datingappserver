"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_service_1 = require("../services/firebase.service");
const utils_1 = require("../../utils/utils");
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.body;
    let isFirstLogin = false;
    user.user.age = (0, utils_1.getAge)(user.user.dateOfBirth);
    const userRef = firebase_service_1.database.collection("user").doc(user.id.toString());
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
});
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersRef = firebase_service_1.database.collection("user");
    const snapshot = yield usersRef.get();
    const users = [];
    try {
        snapshot.forEach((doc) => {
            users.push(Object.assign({ id: doc.id }, doc.data()));
        });
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(404).json({ error });
    }
});
const updateMessageID = (userID, otherUserID, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const like = firebase_service_1.database.collection("like");
    const query1 = like
        .where("userID", "==", userID)
        .where("otherUserID", "==", otherUserID);
    const query2 = like
        .where("userID", "==", otherUserID)
        .where("otherUserID", "==", userID);
    const [docs1, docs2] = yield Promise.all([query1.get(), query2.get()]);
    const updates1 = docs1.docs.map((doc) => doc.ref.update({ messageID: messageId }));
    const updates2 = docs2.docs.map((doc) => doc.ref.update({ messageID: messageId }));
    yield Promise.all([...updates1, ...updates2]);
});
const getFullName = (ID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRef = firebase_service_1.database.collection("user").doc(ID);
        const userDoc = yield userRef.get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const fullName = userData.fullName;
            // console.log(fullName);
            return fullName;
        }
        else {
            throw new Error(`User document with ID ${ID} not found`);
        }
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
const like = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const likeRequest = req.body;
    const like = firebase_service_1.database.collection("like");
    const date = new Date().toLocaleString();
    try {
        yield like.add({
            userID: likeRequest.userID,
            isLike: likeRequest.isLike,
            otherUserID: likeRequest.ortherUserID,
            messageID: "",
        });
        // Tạo query để kiểm tra tương thích
        const matchQuery = yield like
            .where("userID", "==", likeRequest.ortherUserID)
            .where("otherUserID", "==", likeRequest.userID)
            .where("isLike", "==", true)
            .get();
        console.log(matchQuery.size);
        // Kiểm tra và trả về kết quả
        if (matchQuery.size > 0) {
            const newMessageRef = firebase_service_1.realtimedb.ref("message").push(); // Tạo một DocumentReference mới
            const newMessageId = newMessageRef.key; // Lấy ID của document vừa tạo
            newMessageRef.set({
                match: `match on ${date}`,
            });
            yield Promise.all([
                updateMessageID(likeRequest.userID, likeRequest.ortherUserID, newMessageId),
            ]);
            res.status(200).json({
                isError: true,
                message: "It's a match!",
                data: {
                    otherUserID: likeRequest.ortherUserID,
                    imageUrl: "chua lam",
                    messageID: newMessageId,
                    fullName: yield getFullName(likeRequest.ortherUserID),
                },
            });
        }
        else {
            res.status(200).json({
                isError: true,
                message: "Like Success",
            });
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
});
const chat = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sendMessage = req.body;
    const date = new Date().toLocaleString();
    const messageRef = firebase_service_1.realtimedb.ref(`message/${sendMessage.messageID}`);
    const newMessageRef = messageRef.push();
    try {
        yield newMessageRef.set({
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
    }
    catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        res.status(500).send("Có lỗi xảy ra khi gửi tin nhắn");
    }
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const newUser = {};
    newUser.email = email;
    newUser.password = yield (0, utils_1.hashMessage)(password);
    newUser.isFirstLogin = true;
    const userRef = firebase_service_1.database.collection("user");
    try {
        let querySnapshot = yield userRef.where("email", "==", email).limit(1);
        let docs = yield querySnapshot.get();
        let otp = (0, utils_1.randomNumber)(4);
        let id = "";
        if (docs.size != 0) {
            let userInfo;
            docs.forEach((doc) => {
                userInfo = doc.data();
                id = doc.id;
            });
            if (userInfo.isAuth == null || !userInfo.isAuth) {
                //Send OTP
                yield (0, firebase_service_1.sendEmail)(email, "Datting appp: Your OTP", otp.toString());
                res.status(200).send({
                    isError: false,
                    message: "send otp successed",
                    data: {
                        email: email,
                        otp: otp,
                    },
                });
            }
            else {
                //Notify exited account
                res.status(200).send({
                    isError: "true",
                    message: "acount has existed",
                });
            }
            return;
        }
        yield (0, firebase_service_1.sendEmail)(email, "Datting appp: Your OTP", otp.toString());
        const rss = yield userRef.add(newUser);
        const locate = {};
        locate.lat = 0;
        locate.lng = 0;
        locate.name = "";
        firebase_service_1.database.collection("location").doc(rss.id).set(locate);
        res.status(200).send({
            isError: false,
            message: "send OTP successed",
            data: {
                id: id,
                otp: otp,
            },
        });
    }
    catch (error) {
        console.log(error);
        res.status(400).send({
            isError: true,
            message: error,
        });
    }
});
const getDiscorverUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const MALE = "Male";
    const FEMALE = "Female";
    const BOTH = "Both";
    let { minAge, maxAge, distance, gender, userID } = req.body;
    console.log(userID);
    if (minAge == null)
        minAge = 0;
    if (maxAge == null)
        maxAge = Number.MAX_VALUE;
    if (distance == null)
        distance = Number.MAX_VALUE;
    if (gender == null)
        gender = BOTH;
    const getGender = [];
    if (gender == BOTH) {
        getGender.push(MALE);
        getGender.push(FEMALE);
    }
    else {
        getGender.push(gender);
    }
    const userRef = yield firebase_service_1.database.collection("user").doc(userID);
    let locationID;
    const userDoc = yield userRef.get();
    if (userDoc.exists) {
        const userData = userDoc.data();
        locationID = userRef.id;
    }
    let p = {};
    if (locationID) {
        const locationRef = yield firebase_service_1.database
            .collection("location")
            .doc(locationID.toString());
        const locationDoc = yield locationRef.get();
        if (locationDoc.exists) {
            const location = locationDoc.data();
            p.latitude = location.lat;
            p.longitude = location.lng;
        }
    }
    try {
        const [userCollection, locationCollection, imageCollection, likeCollection,] = yield Promise.all([
            firebase_service_1.database.collection("user").where("isAuth", "==", true).get(),
            firebase_service_1.database.collection("location").get(),
            firebase_service_1.database.collection("image").get(),
            firebase_service_1.database.collection("like").where("userIDLike", "==", userID).get(),
        ]);
        let likeDocs = likeCollection.docs.map((like) => like.data().userIDLiked);
        let userDocs = userCollection.docs
            .map((doc) => {
            let u = {};
            u.id = doc.id;
            u.user = doc.data();
            return u;
        })
            .filter((user) => user.user.age >= minAge &&
            user.user.age <= maxAge &&
            getGender.includes(user.user.gender) &&
            !likeDocs.includes(user.id));
        let locationDoc = locationCollection.docs.map((doc) => {
            const lcationid = {};
            lcationid.id = doc.id;
            lcationid.location = doc.data();
            return lcationid;
        });
        let imageDoc = imageCollection.docs.map((doc) => {
            const imgeid = {};
            imgeid.id = doc.id;
            imgeid.image = doc.data();
            return imgeid;
        });
        let userDistance = userDocs.map((userDoc) => {
            const locationId = userDoc.id;
            let distance = Number.MAX_VALUE;
            const arrayLocation = locationDoc.filter((location) => location.id == userDoc.id);
            if (arrayLocation.length > 0) {
                let point2 = {};
                point2.latitude = arrayLocation[0].location.lat;
                point2.longitude = arrayLocation[0].location.lng;
                distance = (0, utils_1.getDistance)(p, point2);
            }
            let dcUser = {};
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
    }
    catch (error) {
        res.status(400).send({
            isError: true,
            message: error,
        });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userRef = firebase_service_1.database.collection("user");
    const newUser = {};
    try {
        const snapshots = yield userRef.where("email", "==", email).get();
        if (snapshots.empty) {
            res.status(404).send("user is not exist !!");
        }
        else {
            const passwordHash = yield (0, utils_1.hashMessage)(password);
            const snapshot = yield userRef
                .where("email", "==", email)
                .where("password", "==", passwordHash)
                .get();
            if (snapshot.empty) {
                res.status(404).send("password is not correct");
            }
            else {
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
    }
    catch (error) {
        res.status(500).send({
            isError: true,
            message: "can not log in !!"
        });
    }
});
const getmatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    const userR = yield firebase_service_1.database.collection("user").doc(userID);
    // console.log(userID)
    // const likeRef = await database.collection("like2");
    // const userRef = database.collection("user");
    try {
        const likeRef = yield firebase_service_1.database
            .collection("like2")
            .where("message_id", "!=", null)
            .where("user_id_like", "==", userID)
            .get();
        // console.log(likeSnap.docs[0].data())
        if (likeRef.empty) {
            res.status(404).send("none match !!");
        }
        else {
            const [useref, imageRef] = yield Promise.all([
                firebase_service_1.database.collection("user").get(),
                firebase_service_1.database.collection("image").get(),
            ]);
            const likelocal = likeRef.docs.map((doc) => doc.data());
            const userlocal = useref.docs
                .map((doc) => {
                const u = {};
                u.id = doc.id;
                u.user = doc.data();
                return u;
            })
                .filter((doc) => likelocal.map((x) => x.user_id_liked).includes(doc.id));
            console.log(userlocal);
            //.filter((x)=>{
            //   x.id =
            // })
            // console.log(userlocal)
            const imagelocal = imageRef.docs.map((doc) => {
                const i = {};
                i.id = doc.id;
                i.image = doc.data();
                return i;
            });
            //console.log(imagelocal)
            const matchlist = userlocal.map((doc) => {
                const m = {};
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
                    match: matchlist.map(x => x.user),
                    image: matchlist.map(x => x.urlimage)
                },
            });
        }
    }
    catch (error) {
        res.status(500).send({
            isError: true,
            message: "can not log in !!"
        });
    }
});
const getConver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    const userR = yield firebase_service_1.database.collection("user").doc(userID);
    // console.log(userID)
    // const likeRef = await database.collection("like2");
    // const userRef = database.collection("user");
    try {
        const likeRef = yield firebase_service_1.database
            .collection("like2")
            .where("message_id", "!=", null)
            .where("user_id_like", "==", userID)
            .get();
        // console.log(likeSnap.docs[0].data())
        if (likeRef.empty) {
            res.status(404).send("none match !!");
        }
        else {
            const [useref, imageRef] = yield Promise.all([
                firebase_service_1.database.collection("user").get(),
                firebase_service_1.database.collection("image").get(),
            ]);
            const likelocal = likeRef.docs.map((doc) => doc.data());
            const userlocal = useref.docs
                .map((doc) => {
                const u = {};
                u.id = doc.id;
                u.user = doc.data();
                return u;
            })
                .filter((doc) => likelocal.map((x) => x.user_id_liked).includes(doc.id));
            console.log(userlocal);
            //.filter((x)=>{
            //   x.id =
            // })
            // console.log(userlocal)
            const imagelocal = imageRef.docs.map((doc) => {
                const i = {};
                i.id = doc.id;
                i.image = doc.data();
                return i;
            });
            //console.log(imagelocal)
            const convermatch = userlocal.map((doc) => {
                const m = {};
                m.user = doc.user;
                const temp1 = imagelocal.filter((x) => {
                    return x.image.userID == doc.id;
                });
                const temp = temp1.map((x) => x.image.url);
                m.urlimage = temp[0];
                return m;
            });
            res.status(200).send({
                "isError": false,
                "message": "success",
                data: {}
            });
        }
    }
    catch (error) {
        res.status(500).send("Error getting matclist");
    }
});
exports.default = {
    update,
    getUser,
    like,
    chat,
    register,
    getDiscorverUser,
    login,
    getmatch,
};
