import * as admin from 'firebase-admin';
import * as serviceAccount from '../../configs/firebase-adminsdk.json';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://datingapp-56f26-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
const realtimedb = admin.database()
const database = getFirestore()


export {admin, realtimedb, database } 
