import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyC3RxCYMpjyOxyZR_3MRCMi-_puRVOIaFQ",
  authDomain: "instill-flow.firebaseapp.com",
  projectId: "instill-flow",
  storageBucket: "instill-flow.appspot.com",
  messagingSenderId: "391665964328",
  appId: "1:391665964328:web:1e6fb896a20eac538d6c1d"
};

export const app = initializeApp(firebaseConfig);
