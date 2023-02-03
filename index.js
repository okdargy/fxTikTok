const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('https://github.com/dragonismcode/fxtiktok');
});

app.get('/t/:videoId', (req, res) => {
    fetch('https://api.douyin.wtf/api?url=https://www.tiktok.com/t/' + req.params.videoId)
        .then(res => res.json())
        .then(json => {
            if(json.status !== "failed") {
                res.render('../pages/embed.ejs', {
                    link: json.url,
                    description: json.desc,
                    uid: json.author.unique_id,
                    name: json.author.nickname,
                    videoUrl: json.video_data.nwm_video_url
                })
            } else {
                console.log('req failed for: ' + req.params.videoId);
                res.render('../pages/error.ejs');
            }
        })
        .catch(err => {
            console.error(err);

            res.render('../pages/error.ejs');
        })
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});