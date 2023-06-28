const express = require('express')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.set('views', __dirname + '/pages');
app.set('view engine', 'ejs');

app.get("/:videoId", (req, res) => {
  if(req.params.videoId.length == 9) return res.redirect("https://github.com/dragonismcode/fxtiktok");
  
    if(!BOT_REGEX.test(req.headers['user-agent'] || "")) {
        console.log('redirecting to: ' + 'https://tiktok.com/t/' + req.params.videoId + ' because user agent is: ' + req.headers['user-agent'])
        return res.redirect('https://tiktok.com/t/' + req.params.videoId);
    }

    var timeStart = Date.now();
    fetch('https://api.douyin.wtf/api?url=https://www.tiktok.com/t/' + req.params.videoId)
        .then(res => res.json())
        .then(json => {
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
                    videoUrl: json.video_data.nwm_video_url_HQ,
                    isTelegram: req.headers['user-agent'].includes('Telegram'),
                    hideStats: true
                })
            } else {
                console.log('req failed for: ' + req.params.videoId);
                res.render('error');
            }
        })
        .catch(err => {
            console.error(err);

            res.render('error');
        });
});

app.get('/', (req, res) => {
  res.redirect('https://github.com/dragonismcode/fxtiktok');
});

var BOT_REGEX = /bot|facebook|embed|got|firefox\/92|curl|wget|go-http|yahoo|generator|whatsapp|discord|preview|link|proxy|vkshare|images|analyzer|index|crawl|spider|python|cfnetwork|node/gi

app.get('/t/:videoId', (req, res) => {
    if(!BOT_REGEX.test(req.headers['user-agent'] || "")) {
        console.log('redirecting to: ' + 'https://tiktok.com/t/' + req.params.videoId + ' because user agent is: ' + req.headers['user-agent'])
        return res.redirect('https://tiktok.com/t/' + req.params.videoId);
    }

    var timeStart = Date.now();
    fetch('https://api.douyin.wtf/api?url=https://www.tiktok.com/t/' + req.params.videoId)
        .then(res => res.json())
        .then(json => {
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
                    videoUrl: json.video_data.nwm_video_url_HQ,
                    isTelegram: req.headers['user-agent'].includes('Telegram'),
                    hideStats: true
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

app.get('/@:username/video/:videoId', (req, res) => {
  console.log('got req')
      if(!BOT_REGEX.test(req.headers['user-agent'] || "")) {
        console.log('redirecting to: ' + 'https://tiktok.com/t/' + req.params.videoId + ' because user agent is: ' + req.headers['user-agent'])
        return res.redirect('https://tiktok.com/@' + req.params.username + '/video/' + req.params.videoId);
    }
  
  fetch('https://api.tiktokv.com/aweme/v1/feed/?aweme_id=' + req.params.videoId)
    .then(res => res.json())
    .then(json => {
        var video = json.aweme_list[0];

        if(video.aweme_id == req.params.videoId) {
          console.log('rendering video embed for: ' + json.share_url)
          res.render('embed', {
              sharelink: video.share_url,
              description: video.desc,
              uid: video.author.unique_id,
              likes: video.statistics.digg_count,
              comments: video.statistics.comment_count,
              shares: video.statistics.share_count,
              name: video.author.nickname,
              thumbnail: video.video.cover.url_list[0],
              width: video.video.play_addr.width,
              height: video.video.play_addr.height,
              videoUrl: video.video.play_addr.url_list[0],
              isTelegram: req.headers['user-agent'].includes('Telegram'),
              hideStats: req.query.hideStats == "true"
          })
        } else {
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