var admin = require("firebase-admin");
const request = require('request');
const underscore = require('underscore');

var serviceAccount = require("../summa-reader-firebase-adminsdk-oeyor-6193814e15.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://summa-reader.firebaseio.com"
});

// get the db reference
var db = admin.database();

function AsyncRequests(url, callback){
  request(url, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    var results = body;
    callback(results);
  })
};

// get all stories from summa
AsyncRequests('https://dev3.summa.leta.lv/api/queries/all/stories', function(results_all_stories){
  // sort the stories by mediaItems
  var TopFive = underscore.first(underscore.sortBy(results_all_stories.stories, 'itemCount').reverse(), 5);
  // get the first story
  var story_0 = TopFive[0];
  var url_story_0 = 'https://dev3.summa.leta.lv/api/stories/' + story_0.id;
  var storyline_0 = {};
  // get the details for the first story from summa
  AsyncRequests(url_story_0, function(results_story_0){
    storyline_0.title= results_story_0.title;
    storyline_0.summary= results_story_0.summary;
    var article = {};
    // get the first article for this story
    article.id = results_story_0.mediaItems[0].id;
    storyline_0.article = article;
    // get the details for the first article for our story
    url_article_0 = 'https://dev3.summa.leta.lv/api/mediaItems/' + storyline_0.article.id;
    AsyncRequests(url_article_0, function(results_article_0){
      storyline_0.article.title = results_article_0.title.english;
      storyline_0.article.summary = results_article_0.summary;
      // push it all to the firebase db
      var ref = db.ref("storylines");
      ref.set(
        {0: storyline_0}
      )
      throw new Error();
    });
  });
});
