const express = require('express');
const bodyParser = require('body-parser');

const ToneAnalyzerV3 = require('ibm-watson/tone-analyzer/v3');
const { IamAuthenticator } = require('ibm-watson/auth');

const app = express();
const port = 5000;
const needle = require('needle');

const natural = require('natural');
const punctuation = require('./tools/punctuation');
const rt = require('./tools/remove-twitter-characters');
const stopwords = require('nltk-stopwords');

const logger = require('morgan');
const responseTime = require('response-time')
const path = require('path');
const apiRouter = require('./routes/api');
var s3Manager = require('./lib/s3_manager');
var constants = require('./lib/shared_constants');
var AWS = require("aws-sdk");

//In an ideal world I would put API keys into an env file but for the sake of testing these are left in.
const tokenTwitter = "AAAAAAAAAAAAAAAAAAAAAKDRTQEAAAAAeZgQFpmbFgJWcU0%2BjLOXLTYZTkM%3DogOa2iUjabE2lRXN4kzDbxdJ0q57aAydkWXx7dHu3Lz6WN3XDY";
const IBM_API_KEY = 'YStUq30XIWxWUr3VHtRa_dejJIZGz3LQgmVupPkGkMZf';
const IBM_URL = 'https://api.au-syd.tone-analyzer.watson.cloud.ibm.com';
const endpointUrlTwitter = "https://api.twitter.com/2/tweets/search/recent";

const toneAnalyzer = new ToneAnalyzerV3({
  version: '2017-09-21',
  authenticator: new IamAuthenticator({
    apikey: IBM_API_KEY,
  }),
  url: IBM_URL,
});

//Load views engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Load required files
app.use(logger('tiny'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(responseTime());

//aws config
AWS.config.update({region: constants.AWS_REGION});
AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: constants.AWS_PROFILE_NAME});

//Init bucket
new s3Manager().initBucket(constants.S3_DEFAULT_BUCKET_NAME);

app.get('/api/hello', (req, res) => {
  res.send({ express: 'Server Is Online' });
});

//API Calls
app.use('/api/twitter', async (req, res) => {

  console.log(`Sending request value ${req.body.post} to Twitter search API...`);
  
  // Twitter Call
  const params = {
    'query': req.body.post,
    'tweet.fields': 'author_id'
  }

  return redisClient.get(redisKey, (err, result) => {
    if (result) {
      // Serve from Cache
      const resultJSON = JSON.parse(result);
      return res.status(200).json(resultJSON);
    }
    else
    {
      return new AWS.S3({apiVersion: constants.S3_API_VERSION}).getObject(params, (err, response) => {
        if (response) {
          // Serve from S3
          const responseJSON = JSON.parse(response.Body);
          // Store in Redis
          redisClient.setex(redisKey, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, })); 
          return res.status(200).json(responseJSON);
        } 
        else
        {
          // Serve from Wikipedia API and store in cache
          twitterRes =  await needle('get', endpointUrlTwitter, params, {
            headers: {
              "User-Agent": req.body,
              "authorization": `Bearer ${tokenTwitter}`
            }
          })

          // Send Twitter Data to IBM Tone Analyzer
          console.log('Sending Twitter Response to Tone Analyser...');
          console.log(`Number of Responses from Twitter: ${twitterRes.body.data.length}`)  
          analysed =  getToneData(twitterRes);
          console.log("Sending Tone Analyser Data to Client...");  

          const responseJSON = twitterRes;
          redisClient.setex(redisKey, 3600, JSON.stringify({ source: 'Redis Cache', ...responseJSON, }));
          return res.status(200).json({ source: 'Twitter API', ...responseJSON, });
        }
      });
    }
  });
})

app.post('/api/world', (req, res) =>{
  console.log(req.body);

  res.send(req.body);
});

app.listen(port, () => console.log(`Listening on port ${port}`));

async function getToneData(twitterRes){
  let watsonRes = []
  for(let i = 0; i < twitterRes.body.data.length; i++){
    
    tweet = TweetPreprocessing(twitterRes.body.data[i].text);
    console.log(`Tweet after processing: ${tweet}`)
    
    const toneParams = 
    {
      toneInput:  {'text': tweet},
      content_type: 'application/json',
    };
    
    result = await WatsonAPICall(toneParams)
    
    // Check if Tone Was Detected
    if(Object.keys(result.result.document_tone.tones).length != 0){ 
      for(let j = 0; j < result.result.document_tone.tones.length; j++){
        watsonRes.push(result.result.document_tone.tones[j].tone_name);
        watsonRes.push(result.result.document_tone.tones[j].score);
      }
      
    }  

    console.log(`Tweet ${i+1}: Analysed...`)
  }
  
  return AverageSentiment(watsonRes);
}

function WatsonAPICall(toneParams){
  return toneAnalyzer.tone(toneParams)
}

function TweetPreprocessing(tweet){
  var english = stopwords.load('english');

  tweet = tweet.replace(/https?.*?(?= |$)/g, "");
  tweet = punctuation(tweet);
  tweet = stopwords.remove(tweet, english)
  tweet = tweet.toLowerCase();
  tweet = rt(tweet)
   
  return tweet;
}

// Formatting API Call For Display
function AverageSentiment(watsonRes){
  console.log("Averaging Sentiment Responses...")
  let averageSentiment = {};
  let sentiments = [0, 0, 0, 0, 0, 0, 0]
  let sentimentsCount = [0, 0, 0, 0, 0, 0, 0]
  
  for(let i = 0; i < watsonRes.length - 1; i++){  
    switch(watsonRes[i]){
        case "Anger":
          sentiments[0] += watsonRes[i+1];
          sentimentsCount[0]++; 
          break;
        case "Fear":
          sentiments[1] += watsonRes[i+1];
          sentimentsCount[1]++; 
          break;
        case "Joy":
          sentiments[2] += watsonRes[i+1];
          sentimentsCount[2]++; 
          break;
        case "Sadness":
          sentiments[3] += watsonRes[i+1];
          sentimentsCount[3]++; 
          break;
        case "Analytical":
          sentiments[4] += watsonRes[i+1];
          sentimentsCount[4]++; 
          break;
        case "Confident":
          sentiments[5] += watsonRes[i+1];
          sentimentsCount[5]++; 
        case "Tentative":
          sentiments[6] += watsonRes[i+1];
          sentimentsCount[6]++; 
          break;
        default: 
          break;
    }
    i++;
  }
  //Calculate average sentiment across posts
  for(let i = 0; i < sentimentsCount.length; i++){
    if(sentimentsCount[i] > 0){
      sentiments[i] = `${parseInt((sentiments[i] / sentimentsCount[i]) *100)}%`
    }else{sentiments[i] = "0%"}
  
  }
  averageSentiment.anger = sentiments[0];
  averageSentiment.fear = sentiments[1];
  averageSentiment.joy = sentiments[2];
  averageSentiment.sadness = sentiments[3];
  averageSentiment.analytical = sentiments[4];
  averageSentiment.confident = sentiments[5];
  averageSentiment.tentative = sentiments[6];

  return averageSentiment
  
} 