import { bus } from "../constants/busEvents.js";
  import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    updatePassword,
    updateEmail,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    onAuthStateChanged
  } from "firebase/auth";
  
  export default class AuthService {
    constructor(app, eventBus) {
      this.eventBus = eventBus;
      this.app = app;
      this.auth = getAuth(this.app);
      this.confirmUser = this._confirmUser.bind(this);
      this.init();
    }

    init() {
      onAuthStateChanged(this.auth, (user) => this.eventBus.emit(bus.AUTH_STATE_CHANGE, user),
      (error) => console.log('authError: ', error))
    }

    get user() {
      return this.auth.currentUser;
    }

    _confirmUser(ctx, next) {
      ctx.user = this.auth.currentUser || null;
      next()
    }
  
    getAuth() {
      return getAuth(this.app);
    }
  
    get uid() {
      return this.auth.currentUser.uid;
    }
  
    login(email, password) {
      return signInWithEmailAndPassword(this.auth, email, password);
    }
  
    logout() {
      return signOut(this.auth);
    }
  
    register(email, password) {
      return createUserWithEmailAndPassword(this.auth, email, password);
    }
  
    async reAuthenticate(password, email) {
      let emailData = email ? email : this.auth.currentUser.email;
      const credential = EmailAuthProvider.credential(emailData, password);
      try {
        await reauthenticateWithCredential(this.auth.currentUser, credential);
      } catch (err) {
        console.log("Re-authentication Error: ", err);
        throw err;
      }
      return true;
    }
  
    updateProfile(newData) {
      return updateProfile(this.auth.currentUser, newData);
    }
    updateEmail(email) {
      return updateEmail(this.auth.currentUser, email);
    }
  
    updatePassword(newPassword) {
      return updatePassword(this.auth.currentUser, newPassword);
    }
  
    async deleteAccount() {
      try {
        await deleteUser(this.auth.currentUser);
      } catch (err) {
        throw err;
      }
    }
}
  