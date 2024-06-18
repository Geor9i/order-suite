import { initializeApp } from "firebase/app";
import FirestoreService from "../services/firestoreService.js";
import AuthService from "../services/authService.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3RxCYMpjyOxyZR_3MRCMi-_puRVOIaFQ",
  authDomain: "instill-flow.firebaseapp.com",
  projectId: "instill-flow",
  storageBucket: "instill-flow.appspot.com",
  messagingSenderId: "391665964328",
  appId: "1:391665964328:web:1e6fb896a20eac538d6c1d"
};

const app = initializeApp(firebaseConfig);
export const authService = new AuthService(app);
export const firestoreService = new FirestoreService(app);
