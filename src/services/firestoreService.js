import { bus } from '../constants/busEvents.js';
import { utils } from "../utils/utilConfig";
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
import { db } from "../constants/db.js";

export default class FirestoreService {
  constructor(app, eventBus) {
    this.eventBus = eventBus;
    this.subscriberId = `FirestoreService`;
    this.app = app;
    this.db = getFirestore(app);
    this.objUtil = utils.objUtil;
    this.snapshotUnsubscribe = null;
    this.user = null;
    this.userData = null;
    this.init();
  }

  init() {
    this.eventBus.on(
      bus.AUTH_STATE_CHANGE,
      this.subscriberId,
      this.onUserChange.bind(this)
    );
  }
  onUserChange(user) {
    this.user = user;
    this.userData = null;
    this.snapshotUnsubscribe && this.snapshotUnsubscribe();
    if (user) {
      const documentRef = doc(this.db, db.USERS, this.user.uid);
      this.snapshotUnsubscribe = onSnapshot(documentRef, this._updateState.bind(this));
    }
  }

  async importInventoryRecord(id, data, dbLocation = db.INVENTORY_ACTIVITY) {
    const documentRef = doc(this.db, db.USERS, this.user.uid);
    const dbRouter = {
      [db.INVENTORY_ACTIVITY]: `${db.INVENTORY}.${db.INVENTORY_RECORDS}.${db.INVENTORY_ACTIVITY}.${id}`,
      [db.PURCHASE_PRODUCTS]: `${db.INVENTORY}.${db.INVENTORY_RECORDS}.${db.PURCHASE_PRODUCTS}.${id}`,
    }
    const updates = {
      [dbRouter[dbLocation]]: data,
    };
    await updateDoc(documentRef, updates);
  }

  async deleteInventoryRecord(id, recordGroup) {
    const documentRef = doc(this.db, db.USERS, this.user.uid);
    const fieldPath = `${db.INVENTORY}.${db.INVENTORY_RECORDS}.${recordGroup}.${id}`;
    const updates = {
      [fieldPath]: deleteField(),
    };
    await updateDoc(documentRef, updates);
    console.log(`Deleted inventory record ${id} from ${recordGroup}`);
  }

  async setStoreTemplate(template) {
    const documentRef = doc(this.db, db.USERS, this.user.uid);
    const fieldPath = `${db.STORE_SETTINGS}`;
    const updates = {
      [fieldPath]: template,
    };
    await updateDoc(documentRef, updates);
    console.log(`Updated store template!`);
  }

  async setHourlySales(data) {
    const documentRef = doc(this.db, db.USERS, this.user.uid);
    const fieldPath = `${db.SALES_DATA}.${db.HOURLY_SALES}`;
    const updates = {
      [fieldPath]: data,
    };
    await updateDoc(documentRef, updates);
    console.log(`Updated Hourly Sales!`);
  }


  _updateState(doc) {
    if (doc.exists() && this.user) {
      let newState = doc.data();
      console.log("data read!");
      const { globalReferenceMatch } = this.objUtil.compare(
        newState,
        this.userData
      );
      if (!globalReferenceMatch) {
        this.userData = newState;
        this.eventBus.emit(bus.USERDATA, newState);
      }
    }
  }

  async addDoc(collectionName, data) {
    if (this.user) {
      try {
        const documentRef = doc(this.db, collectionName, this.user.uid);
        const result = await setDoc(documentRef, data);
        console.log("Data written to Firestore successfully!");
        return result;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
  async updateDoc(collectionName, data) {
    if (this.user) {
      try {
        const documentRef = doc(this.db, collectionName, this.user.uid);
        const id = new Date().getTime().toString();
        await updateDoc(documentRef, { [id]: data });
        console.log("Data updated in Firestore successfully!");
        return id;
      } catch (err) {
        throw new Error(err);
      }
    }
  }
  async updateDocFields(collectionName, data, ...nestedKeys) {
    try {
      let documentRef;
      if (nestedKeys.length > 0) {
        documentRef = doc(this.db, collectionName, this.user, ...nestedKeys);
      } else {
        documentRef = doc(this.db, collectionName, this.user);
      }
      await updateDoc(documentRef, data);
      console.log("Data fields updated in Firestore successfully!");
    } catch (err) {
      throw new Error(err);
    }
  }
  async setDoc(collectionName, data, { merge = false } = {}, ...nestedKeys) {
    if (this.user) {
      try {
        let documentRef;
        if (nestedKeys.length > 0) {
          documentRef = doc(
            this.db,
            collectionName,
            this.user.uid,
            ...nestedKeys
          );
        } else {
          documentRef = doc(this.db, collectionName, this.user.uid);
        }
        await setDoc(documentRef, data, merge ? { merge } : {});
        console.log("Data written to Firestore successfully!");
      } catch (err) {
        throw new Error(err);
      }
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
    if (this.user) {
      const documentRef = doc(this.db, collectionName, this.user.uid);
      let result = await getDoc(documentRef);
      return result.exists();
    }
  }

  async fetchData(collectionKeys, readyData = {}) {
    if (!this.user) return;
    const uid = this.user.uid;
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
    if (!this.user) return;
    const uid = this.user.uid;
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
    if (!this.user) return;
    const documentRef = doc(this.db, collectionName, this.user.uid);
    const unsubscribe = onSnapshot(documentRef, (doc) => {
      if (doc.exists() && this.user) {
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
    if (!this.user) return;
    try {
      await deleteDoc(doc(this.db, collectionName, this.user.uid));
    } catch (err) {
      console.log(err);
    }
  }

  async deleteField(collectionName, id) {
    if (!this.user) return;
    const ref = doc(this.db, collectionName, this.user.uid);
    await updateDoc(ref, {
      [id]: deleteField(),
    });
  }
  async deleteInnerField(collectionName, ...pathSegments) {
    if (!this.user) return;
    const ref = doc(this.db, collectionName, this.user.uid);
    await updateDoc(ref, {
      [`${pathSegments.join(".")}`]: deleteField(),
    });
  }
  async deletePublicField(publicId) {
    const ref = doc(this.db, GUEST_KEY, CLIENTS_KEY);

    await updateDoc(ref, {
      [publicId]: deleteField(),
    });
  }
}
