'use strict';

const data = require('./data.js');
let output = data.getTranslation(); // val is "Hello" 

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library

const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("./summa-reader-firebase-adminsdk-oeyor-6193814e15.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://summa-reader.firebaseio.com"
});

var db = admin.database();

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));
  
  var string = 'nothing';
  
  

  // An action is a string used to identify what needs to be done in fulfillment
  let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters

  // Parameters are any entites that Dialogflow has extracted from the request.
  const parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters

  // Contexts are objects used to track and store conversation state
  const inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts

  // Get the request source (Google Assistant, Slack, API, etc) and initialize DialogflowApp
  const requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
  const app = new DialogflowApp({request: request, response: response});

  const resolvedQuery = request.body.result.resolvedQuery;

  const userId = app.getUser().userId;
  console.log("UserId: " + userId);

  // Create handlers for Dialogflow actions as well as a 'default' handler
  const actionHandlers = {

    // The default welcome intent has been matched, welcome the user (https://dialogflow.com/docs/events#default_welcome_intent)
    'input.welcome': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse('Hello, Welcome to the opinion broker!'); // Send simple response to user
      } else {
        sendResponse('Hello, Welcome to the summa reader!'); // Send simple response to user
      }
    },
    // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
    'input.unknown': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
      } else {
        sendResponse('I\'m having trouble, can you try that again?'); // Send simple response to user
      }
    },
    // The default fallback intent has been matched, try to recover (https://dialogflow.com/docs/intents#fallback_intents)
    'input.summa': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    // 1
    'input.1': () => {
      // Get the most interesting topic from firebase
      var ref_storyline_title = db.ref("storylines_test/1/title/");
      var ref_storyline_summary = db.ref("storylines_test/1/summary/");
      ref_storyline_title.once("value", function(snapshot_title) {
        ref_storyline_summary.once("value", function(snapshot_summary) {
          console.log(snapshot_title.val() + snapshot_summary.val());
          let text_to_speech = '<speak>'
          + '<p>' + snapshot_title.val() + '. </p>'
          + '<p>' + snapshot_summary.val() + '. </p>'
          + '<p>' + 'Do you have an opinion an that or do you need more details? If you have an opinion, say ' + '</p>'
          + '</speak>'
          sendGoogleResponse(text_to_speech);
        });
      });
    },


//MY -----------------------------------------------------------


    'input.2-Yes': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("default_values/strings/2-Yes/");
      ref.once("value", function(snapshot) {
        var snapshot_val = snapshot.val();
        console.log('input.2-Yes' + snapshot_val); 

        if (requestSource === googleAssistantRequest) {
          sendGoogleResponse(snapshot_val);
        } else {
          sendResponse(getDefaultText()); // Send simple response to user
        }

      });

    },
    'input.2-No': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("default_values/strings/2-No/");
      ref.once("input.2-No", function(snapshot) {
        var snapshot_val = snapshot.val();
        console.log('input.2-No' + snapshot_val); 
        if (requestSource === googleAssistantRequest) {
          sendGoogleResponse(snapshot_val);
        } else {
          sendResponse(getDefaultText()); // Send simple response to user
        }
      });
    },
    'input.2-More_details': () => {

      var ref_storyline_article_title = db.ref("storylines_test/1/article/title");
      var ref_storyline_article_text = db.ref("storylines_test/1/article/text");
      ref_storyline_article_title.once("value", function(snapshot_title) {
        ref_storyline_article_text.once("value", function(snapshot_text) {
          console.log(snapshot_title.val() + snapshot_text.val());
          let text_to_speech = '<speak>'
          + '<p>' + snapshot_title.val() + '</p>'
          + '<p>' + snapshot_text.val() + '</p>'
          + '</speak>'
          sendGoogleResponse(text_to_speech);
        });
      });
    },

    'input.3-Yes': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("text");
      ref.once("value", function(snapshot) {
        console.log(snapshot.val());
      });
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    'input.3-No': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("default_values/strings");
      ref.once("3-No", function(snapshot) {
        console.log(snapshot.val());
      });
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    'input.4-yes': () => {
      // Get the opinion of your friend
      var ref = db.ref("/users/test_friend/opinion/");
      ref.once("value", function(snapshot) {
        console.log(snapshot.val());
        if (requestSource === googleAssistantRequest) {
          sendGoogleResponse("Your friend test_friend had the following opinion: " + snapshot.val() + ". " + "We detect some slight difference in your opinions, maybe you should have a chat about that. Should we get you into a discussion with test_friend?");
        } else {
          sendResponse('summa'); // Send simple response to user
        }
      });
    },
    'input.4-No': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("text");
      ref.once("value", function(snapshot) {
        console.log(snapshot.val());
      });
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    'input.5-discuss': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("text");
      ref.once("value", function(snapshot) {
        console.log(snapshot.val());
      });
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    'input.6-Yes': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("text");
      ref.once("value", function(snapshot) {
        console.log(snapshot.val());
      });
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    'input.6-No': () => {
      // Get the most interesting topic from firebase
      var ref = db.ref("text");
      ref.once("value", function(snapshot) {
        console.log(snapshot.val());
      });
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse(output);
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },
    'input.My_opinion_is': () => {
      // Save the users opinion in Firebase
      console.log(resolvedQuery);
      var ref_user = db.ref("users/" + userId + "/");
      ref_user.set({
        opinion: resolvedQuery
      })
      //console.log("resolvedQuery: " + request.result.resolvedQuery);
      if (requestSource === googleAssistantRequest) {
        sendGoogleResponse("Wow, that's interesting! Would you like to now, what you friends had to say about this topic?");
      } else {
        sendResponse('summa'); // Send simple response to user
      }
    },









    // Default handler for unknown or undefined actions
    'default': () => {
      // Use the Actions on Google lib to respond to Google requests; for other requests use JSON
      if (requestSource === googleAssistantRequest) {
        let responseToUser = {
          //googleRichResponse: googleRichResponse, // Optional, uncomment to enable
          //googleOutputContexts: ['weather', 2, { ['city']: 'rome' }], // Optional, uncomment to enable
          speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
          displayText: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
        };
        sendGoogleResponse(responseToUser);
      } else {
        let responseToUser = {
          //richResponses: richResponses, // Optional, uncomment to enable
          //outputContexts: [{'name': 'weather', 'lifespan': 2, 'parameters': {'city': 'Rome'}}], // Optional, uncomment to enable
          speech: 'This message is from Dialogflow\'s Cloud Functions for Firebase editor!', // spoken response
          displayText: 'This is from Dialogflow\'s Cloud Functions for Firebase editor! :-)' // displayed response
        };
        sendResponse(responseToUser);
      }
    }
  };

  // If undefined or unknown action use the default handler
  if (!actionHandlers[action]) {
    action = 'default';
  }

  // Run the proper handler function to handle the request from Dialogflow
  actionHandlers[action]();

  function getDefaultText() {
    var ref = db.ref("default_values/strings/default-dontKnow/");
    ref.once("value", function(snapshot) {
        console.log(snapshot.val());
        return snapshot.val();
      });

  }

  // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
  function sendGoogleResponse (responseToUser) {
    if (typeof responseToUser === 'string') {
      app.ask(responseToUser); // Google Assistant response
    } else {
      // If speech or displayText is defined use it to respond
      let googleResponse = app.buildRichResponse().addSimpleResponse({
        speech: responseToUser.speech || responseToUser.displayText,
        displayText: responseToUser.displayText || responseToUser.speech
      });

      // Optional: Overwrite previous response with rich response
      if (responseToUser.googleRichResponse) {
        googleResponse = responseToUser.googleRichResponse;
      }

      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      if (responseToUser.googleOutputContexts) {
        app.setContext(...responseToUser.googleOutputContexts);
      }

      app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
    }
  }

  // Function to send correctly formatted responses to Dialogflow which are then sent to the user
  function sendResponse (responseToUser) {
    // if the response is a string send it as a response to the user
    if (typeof responseToUser === 'string') {
      let responseJson = {};
      responseJson.speech = responseToUser; // spoken response
      responseJson.displayText = responseToUser; // displayed response
      response.json(responseJson); // Send response to Dialogflow
    } else {
      // If the response to the user includes rich responses or contexts send them to Dialogflow
      let responseJson = {};

      // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
      responseJson.speech = responseToUser.speech || responseToUser.displayText;
      responseJson.displayText = responseToUser.displayText || responseToUser.speech;

      // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
      responseJson.data = responseToUser.richResponses;

      // Optional: add contexts (https://dialogflow.com/docs/contexts)
      responseJson.contextOut = responseToUser.outputContexts;

      response.json(responseJson); // Send response to Dialogflow
    }
  }
});

// Construct rich response for Google Assistant
const app = new DialogflowApp();
const googleRichResponse = app.buildRichResponse()
  .addSimpleResponse('This is the first simple response for Google Assistant')
  .addSuggestions(
    ['Suggestion Chip', 'Another Suggestion Chip'])
    // Create a basic card and add it to the rich response
  .addBasicCard(app.buildBasicCard(`This is a basic card.  Text in a
 basic card can include "quotes" and most other unicode characters
 including emoji 📱.  Basic cards also support some markdown
 formatting like *emphasis* or _italics_, **strong** or __bold__,
 and ***bold itallic*** or ___strong emphasis___ as well as other things
 like line  \nbreaks`) // Note the two spaces before '\n' required for a
                        // line break to be rendered in the card
    .setSubtitle('This is a subtitle')
    .setTitle('Title: this is a title')
    .addButton('This is a button', 'https://assistant.google.com/')
    .setImage('https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
      'Image alternate text'))
  .addSimpleResponse({ speech: 'This is another simple response',
    displayText: 'This is the another simple response 💁' });

// Rich responses for both Slack and Facebook
const richResponses = {
  'slack': {
    'text': 'This is a text response for Slack.',
    'attachments': [
      {
        'title': 'Title: this is a title',
        'title_link': 'https://assistant.google.com/',
        'text': 'This is an attachment.  Text in attachments can include \'quotes\' and most other unicode characters including emoji 📱.  Attachments also upport line\nbreaks.',
        'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
        'fallback': 'This is a fallback.'
      }
    ]
  },
  'facebook': {
    'attachment': {
      'type': 'template',
      'payload': {
        'template_type': 'generic',
        'elements': [
          {
            'title': 'Title: this is a title',
            'image_url': 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
            'subtitle': 'This is a subtitle',
            'default_action': {
              'type': 'web_url',
              'url': 'https://assistant.google.com/'
            },
            'buttons': [
              {
                'type': 'web_url',
                'url': 'https://assistant.google.com/',
                'title': 'This is a button'
              }
            ]
          }
        ]
      }
    }
  }
};