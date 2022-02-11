    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
    import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";
    import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";
  
    const firebaseConfig = {
      apiKey: "AIzaSyDBSly_o-P17at1UOHsOnD4Qpy5nM4_5TA",
      authDomain: "mover-219a0.firebaseapp.com",
      projectId: "mover-219a0",
      storageBucket: "mover-219a0.appspot.com",
      messagingSenderId: "180409060407",
      appId: "1:180409060407:web:02812a165f8b194081c3b2"
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