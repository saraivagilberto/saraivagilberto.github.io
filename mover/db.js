    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
    import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";
  
    const firebaseConfig = {
      apiKey: "AIzaSyDDcR9ntnUJWe4GP74RfsEWfxaThclEZFo",
      authDomain: "mover-82a42.firebaseapp.com",
      projectId: "mover-82a42",
      storageBucket: "mover-82a42.appspot.com",
      messagingSenderId: "944636393113",
      appId: "1:944636393113:web:9fe26c3126f90e80d6aa08"
    };
  
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const provider = new GoogleAuthProvider();

    const createObserver = (userId, onData) => {
      console.log(userId)
      const database = getDatabase();
      const starCountRef = ref(database, userId + '/');
      let currData = null;
      let firstUpdate = true;
      onValue(starCountRef, (snapshot) => {
        currData = snapshot.val();
        if (firstUpdate) {
          onData(currData);
          firstUpdate = false;
        }
      });
      setInterval(() => {
        onData(currData);
      }, 10000);
    }

    export function registerObserver(onData) {
      auth.onAuthStateChanged(function(user) {
        if (user) {
          createObserver(user.uid, onData);
          // User is signed in.
        } else {
          signInWithPopup(auth, provider)
            .then((result) => {
              createObserver(result.user.uid, onData);
              // localStorage.setItem("name", name);
              // localStorage.setItem("email", email);
              // localStorage.setItem("profilePic", profilePic);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
      
    };