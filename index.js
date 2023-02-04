const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.set('views', __dirname + '/pages');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.redirect('https://github.com/dragonismcode/fxtiktok');
});

var BOT_REGEX = /bot|facebook|embed|got|firefox\/92|curl|wget|go-http|yahoo|generator|whatsapp|preview|link|proxy|vkshare|images|analyzer|index|crawl|spider|python|cfnetwork|node/gi

app.get('/t/:videoId', (req, res) => {
    if(!BOT_REGEX.test(req.headers['user-agent'])) {
        console.log('redirecting to: ' + 'https://tiktok.com/t/' + req.params.videoId + ' because user agent is: ' + req.headers['user-agent'])
        res.redirect('https://tiktok.com/t/' + req.params.videoId);
        return;
    }

    console.log('got request for video id: ' + req.params.videoId)
    var timeStart = Date.now();
    fetch('https://api.douyin.wtf/api?url=https://www.tiktok.com/t/' + req.params.videoId)
        .then(res => res.json())
        .then(json => {
            console.log('it took: ' + (Date.now() - timeStart) + 'ms to fufill request')
            if(json.status !== "failed") {
                console.log('rendering video embed for: ' + json.url)
                res.render('embed', {
                    sharelink: json.url,
                    description: json.desc,
                    uid: json.author.unique_id,
                    name: json.author.nickname,
                    thumbnail: json.cover_data.cover.url_list[0],
                    width: "576",
                    height: "1024",
                    videoUrl: json.video_data.nwm_video_url_HQ
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