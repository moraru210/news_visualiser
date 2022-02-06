// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {lemmatizer} from "lemmatizer";

export default async function handler(req, res) {
  const NewsAPI = require('newsapi')
  const news_api = new NewsAPI(process.env.NEWS_API_PKEY)

  const news_data = await news_api.v2.topHeadlines({
                                              language: 'en',
                                              country: 'gb',
                                              pageSize: 100,
                                            })
  console.log(news_data)
  console.log(`***************************************`)

  const language = require('@google-cloud/language')

  // Instantiates a client
  const client = new language.LanguageServiceClient({key: process.env.GCLOUD_PKEY})

  const map = new Map();
  for (let i = 0; i < 2; i++) {
    // The text to analyze
    const text = news_data.articles[i].title;

    const document = {
      content: text,
      type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the text
    const [result] = await client.analyzeSentiment({document: document})
    const sentiment = result.documentSentiment

    console.log(`Text: ${text}`)
    console.log(`Sentiment score: ${sentiment.score}`)

    const [entity_result] = await client.analyzeEntities({document: document})
    const main_entities = entity_result.entities.filter(e => e.type === 'PERSON' || e.type === 'ORGANIZATION' ||
                                                              e.type === 'LOCATION' || e.type === 'CONSUMER_GOOD')
    main_entities.map(e => {
      const l_name = lemmatizer(e.name)
      const old_val = map.get(l_name)
      if (old_val) {
        const old_sentiment = old_val.sentiment;
        const new_articles = (old_val.articles).push(news_data.articles[i]);
        map.set(l_name, { value: old_val +(e.salience ? e.salience : 0),
          articles: new_articles,
          sentiment: (((old_sentiment * (new_articles.length - 1.0)) + sentiment.score) / new_articles.length) })
      } else {
        map.set(l_name, { value: (e.salience ? e.salience : 0),
          articles: [news_data.articles[i]],
          sentiment: sentiment.score })
      }
    })
  }

  //rearrange structure of map to preferred structre of output json for frontend
  const result = []
  for (const [key, values] of map.entries()) {
      //console.log(`key = ${key}, value.sentiment = ${values.sentiment}, value.value = ${values.value}`);
      result.push({name: key, value: values.value, sentiment: values.sentiment, articles: values.articles})
  }

  res.status(200).json(result)
}
