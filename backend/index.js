var admin = require("firebase-admin");
const request = require('request');
const underscore = require('underscore');

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


function AsyncRequests(url, callback){
  request(url, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    var results = body;
    callback(results);
  })

};

AsyncRequests('https://dev3.summa.leta.lv/api/queries/all/stories', function(results){

  var TopFive = underscore.first(underscore.sortBy(results.stories, 'itemCount').reverse(), 5);
  var stories = TopFive.map(function(obj){
    var url = 'https://dev3.summa.leta.lv/api/stories/' + obj.id;
    var mediaObj = {};
    var media = AsyncRequests(url, function(results){
        mediaObj.title= results.title,
        mediaObj.summary= results.summary,
        mediaObj.articles =  results.mediaItems.map(function(obj){
          var url = 'https://dev3.summa.leta.lv/api/mediaItems/' + obj.id;
          var items = {};
          AsyncRequests(url, function(values){    
            items.title= values.title.english,
            items.summary=  values.summary 

            var ref = db.ref("storylines");
            ref.set(
              {0: mediaObj}
            )
            
            
          })
          return items;
        })
         
    });

  })
});
