export class SessionService {
    
    getAccessToken() {
        if (this.getUserData()) {
            return this.getUserData().accessToken;
        }
        return null;
    }

    getUserData () {
        let user = sessionStorage.getItem('user')
        if (user) {
            user = JSON.parse(user);
            return user
        }
        return null;
    }

    setUserData (userData) {
        if (userData) {
            sessionStorage.setItem('user', JSON.stringify(userData));
        }
    }

    removeUserData () {
        if (this.getUserData ()) {
            sessionStorage.removeItem('user');
        }
    }
    
}