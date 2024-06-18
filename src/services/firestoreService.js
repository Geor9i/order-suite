import { eventBus } from "./eventbus.js";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  deleteField,
} from "firebase/firestore";

export default class FirestoreService {
  constructor(app) {
    this.subscriberId = `FirestoreService`;
    this.app = app;
    this.db = getFirestore(app);
    this.init();
    this.uid = null;
  }

  init() {
    eventBus.on('authStateChange', this.subscriberId, (user) => this.uid = user.uid);
  }

  async addDoc(collectionName, data) {
    try {
      const documentRef = doc(this.db, collectionName, this.uid);
      const result = await setDoc(documentRef, data);
      console.log("Data written to Firestore successfully!");
      return result;
    } catch (err) {
      throw new Error(err);
    }
  }
  async updateDoc(collectionName, data) {
    try {
      const documentRef = doc(this.db, collectionName, this.uid);
      const id = new Date().getTime().toString();
      await updateDoc(documentRef, { [id]: data });
      console.log("Data updated in Firestore successfully!");
      return id;
    } catch (err) {
      throw new Error(err);
    }
  }
  async updateDocFields(collectionName, data, ...nestedKeys) {
    try {
      let documentRef;
      if (nestedKeys.length > 0) {
        documentRef = doc(this.db, collectionName, this.uid, ...nestedKeys);
      } else {
        documentRef = doc(this.db, collectionName, this.uid);
      }
      await updateDoc(documentRef, data);
      console.log("Data fields updated in Firestore successfully!");
    } catch (err) {
      throw new Error(err);
    }
  }
  async setDoc(collectionName, data, { merge = false } = {}, ...nestedKeys) {
    try {
      let documentRef;
      if (nestedKeys.length > 0) {
        documentRef = doc(this.db, collectionName, this.uid, ...nestedKeys);
      } else {
        documentRef = doc(this.db, collectionName, this.uid);
      }
      await setDoc(documentRef, data, merge ? { merge } : {});
      console.log("Data written to Firestore successfully!");
    } catch (err) {
      throw new Error(err);
    }
  }
  async setPublicDoc(collectionName, data, docKey) {
    try {
      let documentRef = doc(this.db, collectionName, docKey);
      await setDoc(documentRef, data, { merge: true });
      console.log("Data written to Firestore successfully!");
    } catch (err) {
      throw new Error(err);
    }
  }

  async checkDoc(collectionName) {
    const documentRef = doc(this.db, collectionName, this.uid);
    let result = await getDoc(documentRef);
    return result.exists();
  }

  async fetchData(collectionKeys, readyData = {}) {
    const uid = this.uid;
    const result = {};
    for (let collection in collectionKeys) {
      if (readyData[collection] && Object.keys(readyData[collection]) > 0) {
        result[collection] = readyData[collection];
        continue;
      }
      try {
        const documentRef = doc(this.db, collection, uid);
        const snapShot = await getDoc(documentRef);
        result[collection] = snapShot.exists() ? snapShot.data() : null;
      } catch (err) {
        throw new Error(err);
      }
    }
    console.log("Data Fetched!");
    return result;
  }
  async fetchOne(collectionName) {
    const uid = this.uid;
    try {
      const documentRef = doc(this.db, collectionName, uid);
      const snapShot = await getDoc(documentRef);
      if (snapShot.exists()) {
        console.log("Data Fetched!");
        return snapShot.data();
      } else {
        return null;
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  onSnapShot(collectionName, state, ...setState) {
    const documentRef = doc(this.db, collectionName, this.uid);
    const unsubscribe = onSnapshot(documentRef, (doc) => {
      if (doc.exists() && this.auth?.currentUser) {
        let newState = doc.data();
        console.log("data read!");
        if (!isEqual(newState, state)) {
          setState.forEach((set) => set(newState));
        }
      }
    });

    return unsubscribe;
  }

  async deleteDoc(collectionName) {
    await deleteDoc(doc(this.db, collectionName, this.uid));
  }

  async deleteField(collectionName, id) {
    const ref = doc(this.db, collectionName, this.uid);

    await updateDoc(ref, {
      [id]: deleteField(),
    });
  }
  async deleteInnerField(collectionName, ...pathSegments) {
    const ref = doc(this.db, collectionName, this.uid);

    await updateDoc(ref, {
      [`${pathSegments.join('.')}`]: deleteField(),
    });
  }
  async deletePublicField(publicId) {
    const ref = doc(this.db, GUEST_KEY, CLIENTS_KEY);

    await updateDoc(ref, {
      [publicId]: deleteField(),
    });
  }
}
