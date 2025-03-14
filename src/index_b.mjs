import express from 'express';
import { fetchAndSaveRSS } from './utils/fetchAndSaveRSS.mjs';
import rss from 'rss';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cron from 'node-cron';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 基本配置
const app = express();
const port = 3000;


// CUP 转发rss_id 从 1-36
const cupRssId = [...Array(36).keys()].map(x => x + 1);
// 启动时立即调用 fetchAndSaveRSS 函数
for (const rss_id of cupRssId) {
  fetchAndSaveRSS('cup', rss_id);
}

// cnki 转发rss_id 列表
// 从 src\target.txt 中获取 链接列表
const targetList = fs.readFileSync(path.join(__dirname, 'target.txt'), 'utf8').split('\n');
// 过滤掉空行
const targetListFiltered = targetList.filter(x => x.trim() !== '');
console.log('targetListFiltered:', targetListFiltered);
// 从链接列表中获取 rss_id
const cnkiRssId = targetListFiltered.map(x => {
// 从链接列表中获取 rss_id
  const rss_id = new URL(x).pathname.split('/').pop();
  console.log('rss_id:', rss_id);
  return rss_id;
})
console.log('cnkiRssId:', cnkiRssId);
// 启动时立即调用 fetchAndSaveRSS 函数
for (const rss_id of cnkiRssId) {
  fetchAndSaveRSS('cnki', rss_id);
}

// 设置每天12点和17点重新抓取 RSS
cron.schedule('0 12,17 * * *', () => {
  console.log('Running scheduled task to fetch and save RSS at 12:00 and 17:00');
  
  // 重新抓取 CUP RSS
  for (const rss_id of cupRssId) {
    fetchAndSaveRSS('cup', rss_id);
  }

  // 重新抓取 CNKI RSS
  for (const rss_id of cnkiRssId) {
    fetchAndSaveRSS('cnki', rss_id);
  }
});



const md = new MarkdownIt();
// 渲染 README.md 到根页面
app.get('/', (req, res) => {
    const readmePath = path.join(__dirname, 'README.md');
    const readmeContent = fs.readFileSync(readmePath, 'utf8');
    const htmlContent = md.render(readmeContent);
    const html = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>README内容</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background-color: #f4f4f4;
            }
            .content {
                width: 80%;
                background: white;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                border-radius: 8px;
            }
        </style>
    </head>
    <body>
        <div class="content">
            ${htmlContent}
        </div>
    </body>
    </html>
    `;
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
});


app.get('/rss/url', async (req, res) => {
  const targeturl = req.query.url;
  console.log('识别url targeturl:', targeturl);
  

  console.log('识别url targeturl:', targeturl);
  // 解析域名
  const domain = new URL(targeturl).hostname;
  console.log('识别url domain:', domain);

  // 如果是 cup
  if (domain === 'wschool.cup.edu.cn') {
    const rssId =  req.query.rss_id;
    // 跳转到 /rss/cup/:id
    res.redirect(`/rss/cup/${rssId}`);
    return;
  }
  // 如果是 cnki
  if (domain === 'rss.cnki.net') {
    //https://rss.cnki.net/knavi/rss/QBXB?pcode=CJFD,CCJD >>> QBXB

    const rssId = new URL(targeturl).pathname.split('/').pop();
    console.log('rssId:', rssId);
    
    // 跳转到 /rss/cnki/:id
    res.redirect(`/rss/cnki/${rssId}`);
    return;
  }
  // 如果是其他域名
  else {
    res.status(404).send('域名不支持');
    return;
  }
 
});


//cup rss
app.get('/rss/cup/:id', async (req, res) => {
  const id = req.params.id;
  if (id in cupRssId) {
      const filePath = path.join(__dirname, 'utils', `cup_rss_${id}.rss`);
      if (fs.existsSync(filePath)) {
          // 设置响应头
          const fileContent = fs.readFileSync(filePath, 'utf8'); 
          res.set('Content-Type', 'application/xml;charset=UTF-8');
          res.send(fileContent);
      } else {
          res.status(404).send('RSS 文件未找到');
      }
  } else {
      const sourceUrl = `http://wschool.cup.edu.cn/rss/wap/rssinfo/search?p=1&rss_id=${id}`;
      try {
          const response = await axios.get(sourceUrl);
          res.set('Content-Type', 'application/xml;charset=UTF-8');
          res.send(response.data);
      } catch (error) {
          console.error('请求源 URL 时出错:', error);
          res.status(500).send('获取 RSS 内容时出错');
      }
  }
});

app.get('/rss/cnki/:id', async (req, res) => {
  const id = req.params.id;
  const sourceUrl = `https://rss.cnki.net/knavi/rss/${id}?pcode=CJFD,CCJD`;
  const filePath = path.join(__dirname, 'utils', `cnki_rss_${id}.rss`);

  try {
      // 发起请求并指定响应编码为 UTF-8
      const response = await axios.get(sourceUrl, { responseType: 'text', responseEncoding: 'utf8' });
      const rssContent = response.data;

      // 以 UTF-8 编码写入文件
      fs.writeFileSync(filePath, rssContent, 'utf8');

      // 设置响应头，明确指定字符编码为 UTF-8
      res.set('Content-Type', 'application/rss+xml; charset=utf-8');
      res.sendFile(filePath);
  } catch (error) {
      console.error(error);
      res.status(500).send('无法获取 RSS 文件');
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});