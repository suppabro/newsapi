const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

const url = 'https://www.helakuru.lk/esana';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});
async function scrapeDescription(newsUrl) {
  try {
    const response = await axios.get(newsUrl);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const newsDescription = $('.news-content p').text();
      return newsDescription;
    }
  } catch (error) {
    console.error('Error scraping description:', error);
  }
  return '';
}
async function scrapeImage(newsUrl) {
  try {
    const response = await axios.get(newsUrl);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
     const imageUrl = $('div.news-banner img.img-responsive').attr('src');
      return imageUrl;
    }
  } catch (error) {
    console.error('Error scraping image:', error);
  }
  return '';
}

// Route 
app.get('/news', async (req, res) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const newsArticle = $('.story-text').first();
      const newsHeadline = newsArticle.find('h2 a').text();
      const newsDate = newsArticle.find('.comments span').text().trim();
      const newsTime = newsArticle.find('.comments span').next().text().trim();
      const fullTime = (newsDate + ' ' + newsTime).trim();
      const newsUrl = 'https://www.helakuru.lk/esana/' + newsArticle.find('h2 a').attr('href');
      const newsDescription = await scrapeDescription(newsUrl);
      const imageUrl = await scrapeImage(newsUrl);
      const newsData = {
        title: newsHeadline,
        description: newsDescription,
        image: imageUrl,
        time: fullTime,
        new_url: newsUrl,
 powerd_by: "beta test"     
      };

      res.json([newsData]);
    } else {
      throw new Error('Failed to fetch data from the website');
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});
