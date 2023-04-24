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
const user_model_1 = require("../model/user.model");
const utils_1 = require("../../utils/utils");
const point_model_1 = require("../model/point.model");
const discoverUser_dto_1 = require("../dto/discoverUser.dto");
const locationid_dto_1 = require("../dto/locationid.dto");
const imageid_model_1 = require("../dto/imageid.model");
const userid_dto_1 = require("../dto/userid.dto");
const match_dto_1 = require("../dto/match.dto");
const create = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, hobby, dateOfBirth, gender, email, phoneNumber, age, occupation, career, } = req.body;
    const userRef = firebase_service_1.database.collection("user");
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
});
const update = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, fullName, hobby, dateOfBirth, gender, email, phoneNumber, age, occupation, career, } = req.body;
    const userRef = firebase_service_1.database.collection("user").doc(userID);
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
    const { userID, isLike, otherUserID } = req.body;
    const like = firebase_service_1.database.collection("like");
    const date = new Date().toLocaleString();
    try {
        yield like.add({
            userID,
            isLike,
            otherUserID,
            messageID: "", // Tạo một field messageID trống
        });
        // Tạo query để kiểm tra tương thích
        const matchQuery = yield like
            .where("userID", "==", otherUserID)
            .where("otherUserID", "==", userID)
            .where("isLike", "==", "true")
            .get();
        // Kiểm tra và trả về kết quả
        if (matchQuery.size > 0) {
            const newMessageRef = firebase_service_1.realtimedb.ref("message").push(); // Tạo một DocumentReference mới
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
            yield Promise.all([updateMessageID(userID, otherUserID, newMessageId)]);
            res.status(200).json({
                message: "It's a match!",
                data: {
                    otherUserID,
                    imageUrl: "chua lam",
                    messageID: newMessageId,
                    fullName: yield getFullName(otherUserID),
                },
            });
        }
        else {
            res.status(200).json({ message: "Like Success" });
        }
    }
    catch (error) {
        res.status(400).json({ error });
    }
});
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, messageID, content } = req.body;
    const date = new Date().toLocaleString();
    const messageRef = firebase_service_1.realtimedb.ref(`message/${messageID}/listContent`);
    const newMessageRef = messageRef.push();
    try {
        yield newMessageRef.set({
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
    }
    catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        res.status(500).send("Có lỗi xảy ra khi gửi tin nhắn");
    }
});
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const newUser = new user_model_1.user();
    newUser.email = email;
    newUser.password = yield (0, utils_1.hashMessage)(password);
    const plainUser = Object.assign({}, newUser);
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
                        otp: otp
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
        const rss = yield userRef.add(plainUser);
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
    const locationRef = yield firebase_service_1.database
        .collection("location")
        .doc(locationID.toString());
    const locationDoc = yield locationRef.get();
    let p = new point_model_1.point();
    if (locationDoc.exists) {
        const location = locationDoc.data();
        p.latitude = location.lat;
        p.longitude = location.lng;
    }
    try {
        const [userCollection, locationCollection, imageCollection, likeCollection] = yield Promise.all([
            firebase_service_1.database.collection("user").where("isAuth", "==", true).get(),
            firebase_service_1.database.collection("location").get(),
            firebase_service_1.database.collection("image").get(),
            firebase_service_1.database.collection("like").where("userIDLike", "==", userID).where("isLike", "==", true).get()
        ]);
        let likeDocs = likeCollection.docs.map(like => like.data().userIDLiked);
        let userDocs = userCollection.docs
            .map((doc) => {
            let u = new userid_dto_1.userid();
            u.id = doc.id;
            u.user = doc.data();
            return u;
        }).filter(user => user.user.age >= minAge && user.user.age <= maxAge && getGender.includes(user.user.gender) && !likeDocs.includes(user.id));
        let locationDoc = locationCollection.docs.map((doc) => {
            const lcationid = new locationid_dto_1.locationid();
            lcationid.id = doc.id;
            lcationid.location = doc.data();
            return lcationid;
        });
        let imageDoc = imageCollection.docs.map((doc) => {
            const imgeid = new imageid_model_1.imageid();
            imgeid.id = doc.id;
            imgeid.image = doc.data();
            return imgeid;
        });
        let userDistance = userDocs.map((userDoc) => {
            const locationId = userDoc.id;
            let distance = Number.MAX_VALUE;
            const arrayLocation = locationDoc.filter((location) => location.id == userDoc.id);
            if (arrayLocation.length > 0) {
                let point2 = new point_model_1.point();
                point2.latitude = arrayLocation[0].location.lat;
                point2.longitude = arrayLocation[0].location.lng;
                distance = (0, utils_1.getDistance)(p, point2);
            }
            let dcUser = new discoverUser_dto_1.discorverUser();
            dcUser.age = userDoc.user.age;
            dcUser.fullName = userDoc.user.fullName;
            (dcUser.hobby = userDoc.user.hobby), (dcUser.occupation = userDoc.user.occupation);
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
            isError: false,
            message: error,
        });
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const userRef = firebase_service_1.database.collection("user");
    const newUser = new user_model_1.user();
    try {
        const snapshots = yield userRef.where("email", "==", email).get();
        if (snapshots.empty) {
            res.status(404).send('user is not exist !!');
        }
        else {
            const snapshot = yield userRef.where("email", "==", email).where("password", "==", password).get();
            if (snapshot.empty) {
                res.status(404).send('password is not correct');
            }
            else {
                // console.log(x.docs[0].data().career)
                const userdoc = snapshot.docs[0].data();
                newUser.career = userdoc.career;
                newUser.age = userdoc.age;
                newUser.occupation = userdoc.occupation;
                newUser.fullName = userdoc.fullName;
                newUser.dateOfBirth = userdoc.dateOfBirth;
                newUser.hobby = userdoc.hobby;
                res.status(200).send({
                    "isError": false,
                    "message": "success",
                    data: {
                        user: newUser
                    }
                });
            }
        }
    }
    catch (error) {
        res.status(500).send('Error getting user');
    }
});
const getmatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    const userR = yield firebase_service_1.database.collection("user").doc(userID);
    // console.log(userID)
    // const likeRef = await database.collection("like2");
    // const userRef = database.collection("user");
    try {
        const likeRef = yield firebase_service_1.database.collection("like2").where("message_id", "!=", null).where("user_id_like", "==", userID).get();
        // console.log(likeSnap.docs[0].data())
        if (likeRef.empty) {
            res.status(404).send("none match !!");
        }
        else {
            const [useref, imageRef] = yield Promise.all([
                firebase_service_1.database.collection("user").get(),
                firebase_service_1.database.collection("image").get(),
            ]);
            const likelocal = likeRef.docs.map(doc => doc.data());
            const userlocal = useref.docs.map((doc) => {
                const u = new userid_dto_1.userid();
                u.id = doc.id;
                u.user = doc.data();
                return u;
            }).filter((doc) => (likelocal.map(x => x.user_id_liked).includes(doc.id)));
            console.log(userlocal);
            //.filter((x)=>{
            //   x.id = 
            // })
            // console.log(userlocal)
            const imagelocal = imageRef.docs.map((doc) => {
                const i = new imageid_model_1.imageid();
                i.id = doc.id;
                i.image = doc.data();
                return i;
            });
            //console.log(imagelocal)
            const matchlist = userlocal.map((doc) => {
                const m = new match_dto_1.match();
                m.user = doc.user;
                const temp1 = imagelocal.filter((x) => { return x.image.userID == doc.id; });
                const temp = temp1.map((x) => (x.image.url));
                m.urlimage = temp[0];
                return m;
            });
            res.status(200).send({
                "isError": false,
                "message": "success",
                data: {
                    matchlist: matchlist
                }
            });
        }
    }
    catch (error) {
        res.status(500).send('Error getting matclist');
    }
});
const getConver = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.body;
    const userR = yield firebase_service_1.database.collection("user").doc(userID);
    // console.log(userID)
    // const likeRef = await database.collection("like2");
    // const userRef = database.collection("user");
    try {
        const likeRef = yield firebase_service_1.database.collection("like2").where("message_id", "!=", null).where("user_id_like", "==", userID).get();
        // console.log(likeSnap.docs[0].data())
        if (likeRef.empty) {
            res.status(404).send("none match !!");
        }
        else {
            const [useref, imageRef] = yield Promise.all([
                firebase_service_1.database.collection("user").get(),
                firebase_service_1.database.collection("image").get(),
            ]);
            const likelocal = likeRef.docs.map(doc => doc.data());
            const userlocal = useref.docs.map((doc) => {
                const u = new userid_dto_1.userid();
                u.id = doc.id;
                u.user = doc.data();
                return u;
            }).filter((doc) => (likelocal.map(x => x.user_id_liked).includes(doc.id)));
            console.log(userlocal);
            //.filter((x)=>{
            //   x.id = 
            // })
            // console.log(userlocal)
            const imagelocal = imageRef.docs.map((doc) => {
                const i = new imageid_model_1.imageid();
                i.id = doc.id;
                i.image = doc.data();
                return i;
            });
            //console.log(imagelocal)
            const convermatch = userlocal.map((doc) => {
                const m = new match_dto_1.match();
                m.user = doc.user;
                const temp1 = imagelocal.filter((x) => { return x.image.userID == doc.id; });
                const temp = temp1.map((x) => (x.image.url));
                m.urlimage = temp[0];
                return m;
            });
            res.status(200).send({
                "isError": false,
                "message": "success",
                data: {
                    converstation: convermatch
                }
            });
        }
    }
    catch (error) {
        res.status(500).send('Error getting matclist');
    }
});
exports.default = {
    create,
    update,
    register,
    getDiscorverUser,
    match: match_dto_1.match,
    login,
    getmatch,
};
