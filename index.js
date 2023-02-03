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
                    sharelink: json.url,
                    description: json.desc,
                    uid: json.author.unique_id,
                    name: json.author.nickname,
                    thumbnail: json.cover_data.cover.url_list[0],
                    width: "576",
                    height: "1024",
                    videoUrl: "https://v16m-default.akamaized.net/6c6b7a0e0bb26c418fac0cd1621b6fc2/63dd682e/video/tos/maliva/tos-maliva-ve-0068c799-us/b35a424162cd40a0abb827a84d8a7b35/?a=0&ch=0&cr=0&dr=0&lr=all&cd=0%7C0%7C0%7C0&cv=1&br=1510&bt=755&cs=0&ds=6&ft=XE5bCqq2m0nPD12rj0bq3wUjpHcLjeF~OD&mime_type=video_mp4&qs=0&rc=MzU3ZjdpNmg8ODo4ZzU7ZkBpamc1azk6ZnRxaTMzZzczNEBjYDBjMC5eNV8xMGIwXi5hYSNyLXIycjRvMzJgLS1kMS9zcw%3D%3D&l=2023020314012982065DAEEA327315D658&btag=80000"
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