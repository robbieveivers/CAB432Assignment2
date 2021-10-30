module.exports = {

    getToneData: function (twitterRes){
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
    },

    TweetPreprocessing: function(tweet){
        var english = stopwords.load('english');
      
        tweet = tweet.replace(/https?.*?(?= |$)/g, "");
        tweet = punctuation(tweet);
        tweet = stopwords.remove(tweet, english)
        tweet = tweet.toLowerCase();
        tweet = rt(tweet)
         
        return tweet;
    },

    // Formatting API Call For Display
    AverageSentiment: function(watsonRes){
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
            }
            else{
                sentiments[i] = "0%"
            }
        }

        averageSentiment.anger = sentiments[0];
        averageSentiment.fear = sentiments[1];
        averageSentiment.joy = sentiments[2];
        averageSentiment.sadness = sentiments[3];
        averageSentiment.analytical = sentiments[4];
        averageSentiment.confident = sentiments[5];
        averageSentiment.tentative = sentiments[6];
    
        return averageSentiment    
    }, 
}