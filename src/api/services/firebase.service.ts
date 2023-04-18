import * as admin from 'firebase-admin';
import * as serviceAccount from '../../configs/firebase-adminsdk.json';
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as nodemailer from 'nodemailer';
import { getFirestore } from 'firebase-admin/firestore';

const gmail = "tpnhan12a1@gmail.com"
const password = "xdvdvvboulygwevi"

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://datingapp-56f26-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
const realtimedb = admin.database()
const database = getFirestore()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmail,
    pass: password,
  },
});

const sendEmail = async function senEmail( to:string,subject: string ,message:string) {
  transporter.sendMail({
    to: to,
    subject: subject,
    text: message,
  }, (error, info) => {
    if (error) {
      console.error(error);
      return false;
    } else {
      console.log(info.response);
      return true;
    }
  });
}
export {admin, realtimedb, database ,sendEmail} 
