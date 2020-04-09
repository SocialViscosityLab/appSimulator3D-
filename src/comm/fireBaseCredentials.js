
// Initialize Firebase
var config = {
  apiKey: "AIzaSyC3VE_lBeUABWsB-DjlAI8JhND1TuS5UyY",
  authDomain: "biketracker-e494b.firebaseapp.com",
  databaseURL: "https://biketracker-e494b.firebaseio.com",
  projectId: "biketracker-e494b",
  storageBucket: "biketracker-e494b.appspot.com",
  messagingSenderId: "715778490288",
  timestampsInSnapshots: true
};

var firebase = firebase.initializeApp(config);
//const admin = firebase.auth();
const admin = firebase.auth().signInWithEmailAndPassword("dd6@illinois.edu", "manchas").catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
});

const db = firebase.firestore();

const settings = {timestampsInSnapshots: true};
db.settings(settings);

console.log("Firebase initialized");
