const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.set('views', __dirname + '/pages');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('https://github.com/dragonismcode/fxtiktok');
});

app.get('/t/:videoId', (req, res) => {
    fetch('https://api.douyin.wtf/api?url=https://www.tiktok.com/t/' + req.params.videoId)
        .then(res => res.json())
        .then(json => {
            if(json.status !== "failed") {
                res.render('embed', {
                    link: json.url,
                    description: json.desc,
                    uid: json.author.unique_id,
                    name: json.author.nickname,
                    thumbnail: json.cover_data.cover.url_list[0],
                    width: json.cover_data.cover.width,
                    height: json.cover_data.cover.height,
                    videoUrl: json.video_data.nwm_video_url
                })
            } else {
                console.log('req failed for: ' + req.params.videoId);
                res.render('error');
            }
        })
        .catch(err => {
            console.error(err);

            res.render('error');
        })
})

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});