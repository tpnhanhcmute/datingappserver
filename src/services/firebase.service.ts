import * as admin from 'firebase-admin';
import * as serviceAccount from '../configs/firebase-adminsdk.json';


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://datingapp-56f26-default-rtdb.asia-southeast1.firebasedatabase.app"
  });


export default admin
