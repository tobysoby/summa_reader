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
    var media = AsyncRequests(url, function(results){
      var meidaObj = {
        'title': results.title,
        'summary': results.summary,
        'newsItems': []
      };

      results.mediaItems.map(function(obj){
        var url = 'https://dev3.summa.leta.lv/api/mediaItems/' + obj.id;
        AsyncRequests(url, function(values){
          
          meidaObj.newsItems.push({
            'title': values.title.english,
            'summary': values.summary 
          });

          var ref = db.ref("storylines");
          ref.set(
            {Articles: meidaObj}
          )
        });
      });

      
      
    });
  })
});



// request('https://dev3.summa.leta.lv/api/queries/all/stories', { json: true }, (err, res, body) => {
//   if (err) { return console.log(err); }
//   
//   var stories = TopFive.map(function(obj){
//     
    
//     request(url, { json: true }, (err, res, body) => {
//       var lists = {
//         'title': body.title,
//         'summary': body.summary,
//         'artcles': body.mediaItems.map(function(obj){
//           

//           request(url, { json: true }, (err, res, body) => {
//             if (err) { return console.log(err); }
//             return body.title;
//           });
          
//         })
//       }
//       console.log(lists);
//     });
      
//   });
// });
