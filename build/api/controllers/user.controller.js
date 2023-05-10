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
            otherUserID: likeRequest.otherUserID,
            messageID: "",
        });
        // Tạo query để kiểm tra tương thích
        const matchQuery = yield like
            .where("userID", "==", likeRequest.otherUserID)
            .where("otherUserID", "==", likeRequest.userID)
            .where("isLike", "==", true)
            .get();
        //console.log(matchQuery.docs);
        // Kiểm tra và trả về kết quả
        if (matchQuery.docs.length > 0) {
            const newMessageRef = firebase_service_1.realtimedb.ref("message").push(); // Tạo một DocumentReference mới
            const newMessageId = newMessageRef.key; // Lấy ID của document vừa tạo
            newMessageRef.set({
                match: `match on ${date}`,
            });
            const [_, imageRef] = yield Promise.all([
                updateMessageID(likeRequest.userID, likeRequest.otherUserID, newMessageId), firebase_service_1.database.collection("image").where("userID", "==", likeRequest.otherUserID).get()
            ]);
            const imageDoc = imageRef.docs.shift();
            let url = "";
            if (imageDoc != null) {
                url = imageDoc.data().url;
            }
            const fullName = yield getFullName(likeRequest.otherUserID);
            res.status(200).send({
                isError: false,
                message: "It's a match!",
                data: {
                    isMatch: true,
                    otherUserID: likeRequest.otherUserID,
                    imageUrl: url,
                    messageID: newMessageId,
                    fullName: fullName
                },
            });
        }
        else {
            res.status(200).send({
                isError: true,
                message: "Like Success",
                data: {
                    isMatch: false
                }
            });
        }
    }
    catch (error) {
        console.log("lỗi rồi kìa !!!" + error);
        res.status(400).send({
            isError: true,
            message: error
        });
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
        let [userCollection, locationCollection, imageCollection, likeCollection,] = yield Promise.all([
            firebase_service_1.database.collection("user").where("isAuth", "==", true).where(firebase_service_1.admin.firestore.FieldPath.documentId(), "!=", userID).get(),
            firebase_service_1.database.collection("location").get(),
            firebase_service_1.database.collection("image").get(),
            firebase_service_1.database
                .collection("like")
                .where("userID", "==", userID)
                .get(),
        ]);
        let likeDocs = likeCollection.docs.map((like) => like.data().otherUserID);
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
            dcUser.userID = userDoc.id;
            dcUser.age = userDoc.user.age;
            dcUser.fullName = userDoc.user.fullName;
            (dcUser.hobby = userDoc.user.hobby),
                (dcUser.occupation = userDoc.user.occupation);
            dcUser.distance = distance;
            dcUser.imageUrl = imageDoc
                .filter((x) => x.image.userID == userDoc.id)
                .map(x => x.image.url);
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
            res.status(404).send({
                isError: true,
                message: "user is not exist !!"
            });
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
    try {
        // console.log(userID)
        // const likeRef = await database.collection("like2");
        // const userRef = database.collection("user");
        const likeRef = yield firebase_service_1.database
            .collection("like")
            .where("userID", "==", userID)
            .where("messageID", "!=", "")
            .get();
        if (likeRef.empty) {
            res.status(404).send({
                isError: true,
                message: "user is not exist !!"
            });
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
                .filter((doc) => (likelocal.map(x => x.otherUserID)).includes(doc.id));
            console.log(likelocal);
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
                m.user.userID = doc.id;
                let x = imagelocal.filter((x) => x.image.userID == doc.id).map((x) => x.image.url);
                console.log(x[0]);
                m.user.imageUrl = x[0];
                return m;
            });
            res.status(200).send({
                isError: false,
                message: "success",
                data: {
                    match: matchlist.map(x => x.user)
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
    try {
        // console.log(userID)
        // const likeRef = await database.collection("like2");
        // const userRef = database.collection("user");
        const likeRef = yield firebase_service_1.database
            .collection("like")
            .where("messageID", "!=", "")
            .where("userID", "==", userID)
            .get();
        const chatRef = yield firebase_service_1.realtimedb.ref(`message`);
        console.log(chatRef.get());
        // console.log(likeSnap.docs[0].data())
        if (likeRef.empty) {
            res.status(400).send({
                isError: true,
                message: "user is not exist !!"
            });
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
                .filter((doc) => (likelocal.map(x => x.otherUserID)).includes(doc.id));
            const imagelocal = imageRef.docs.map((doc) => {
                const i = {};
                i.id = doc.id;
                i.image = doc.data();
                return i;
            });
            //console.log(imagelocal)
            const converlist = userlocal.map((doc) => {
                const m = {};
                m.userID = doc.id;
                m.fullName = doc.user.fullName;
                m.messageID = likelocal.filter((x) => x.otherUserID == doc.id).map(x => x.messageID).shift();
                let x = imagelocal.filter((x) => x.image.userID == doc.id).map((x) => x.image.url);
                m.imageUrl = x[0];
                return m;
            });
            res.status(200).send({
                isError: false,
                message: "success",
                data: {
                    conver: converlist
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
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID, muserID } = req.body;
    try {
        const [userCollection, imageCollection, locationCollection, mlocationColection] = yield Promise.all([firebase_service_1.database.collection("user").doc(userID).get(),
            firebase_service_1.database.collection("image").where("userID", "==", userID).get(),
            firebase_service_1.database.collection("location").doc(userID).get(),
            firebase_service_1.database.collection("location").doc("muserID").get()]);
        const user = userCollection.data();
        const location = locationCollection.data();
        const mlocation = mlocationColection.data();
        const userInfo = {};
        userInfo.userID = userCollection.id;
        userInfo.age = user.age;
        userInfo.fullName = user.fullName;
        userInfo.hobby = user.hobby,
            userInfo.locationName = location.name;
        userInfo.occupation = user.occupation;
        const point = {};
        const mponit = {};
        point.latitude = location.lat;
        point.longitude = location.lng;
        mponit.latitude = mlocation.lat;
        mponit.longitude = mlocation.lng;
        userInfo.distance = (0, utils_1.getDistance)(point, mponit);
        userInfo.imageUrl = imageCollection.docs.map(x => {
            const image = x.data();
            return image.url;
        });
        res.status(200).send({
            isError: false,
            message: "Thông tin người dùng",
            data: {
                user: userInfo
            }
        });
    }
    catch (error) {
        res.status(400).send({
            isError: true,
            message: error
        });
    }
});
exports.default = {
    update,
    like,
    chat,
    register,
    getDiscorverUser,
    getConver,
    login,
    getmatch,
    getUser
};
