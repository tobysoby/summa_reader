var admin = require("firebase-admin");

var serviceAccount = require("../summa-reader-firebase-adminsdk-oeyor-6193814e15.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://summa-reader.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("text");
ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});