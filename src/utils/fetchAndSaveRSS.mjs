import axios from 'axios';
import RSS from 'rss';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const cup_rss = async (url) => {
  try {
    console.log('开始获取数据:', url);
    const response = await axios.get(url);
    console.log('数据获取成功');
    const data = response.data;
    console.log('开始解析数据');

    const rssId = new URL(url).searchParams.get('rss_id');
    const id = rssId;
    const sourceUrl = `http://wschool.cup.edu.cn/rss/wap/rssinfo/search?p=1&rss_id=${id}`;
    const homelink = `http://wschool.cup.edu.cn/rss/wap/rssinfo/index?rss_id=${rssId}`;
    // 获取 homelink
    const homeresponse = await axios.get(homelink);
    const homedata = homeresponse.data;
    // 从homedata的<head>的<title>标签中提取部门名称
    const departName = homedata.match(/<title>(.*?)<\/title>/)[1];
    console.log('departName:', departName);

    const channelTitle = `中国石油大学（北京）${departName} 公告`;
    const channel = {
      title: channelTitle,
      link: sourceUrl,
      description: '',
    };

    //sourcelink search?p=1&rss_id=21 >>> homelink index?rss_id=21    

    //新建rss对象
    const rss = new RSS({
      version: '2.0',
      encoding: 'UTF-8',
      title: channelTitle,
      link: homelink,
      description: '',
    })

    for (let i = 0; i < 20; i++) {
      // i转字符串
      console.log('i:', i);
      const ii = i.toString();
      const item = data.d[ii];
      console.log('item:', item);
      if (!item) {
        console.log('条目数据解析失败，item 为空');
        continue;
      }
      // Its value is a date, indicating when the item was published. If it's a date in the future, aggregators may choose to not display the item until that date.
      // <pubDate>Sun, 19 May 2002 15:21:36 GMT</pubDate>
      const formatedpubdate = new Date(item.pubdate * 1000).toUTCString();
      const formatedItem = {
        title: item.title,
        link: item.link,
        description: item.description,
        author:departName,
        pubDate: formatedpubdate
      };
      console.log('formatedItem:', formatedItem);
      //
      rss.item(formatedItem);
    }
    console.log('生成的 RSS 数据:', rss);
    return rss;
  } catch (error) {
    console.error('数据获取或解析失败:', error);
    return {};
  }
};


const fetchAndSaveRSS = async (domain,id) => {
  let filePath = '';
  let feedxml = '';

  // 如果域名是cup
  if (domain === 'cup') {
    const sourceUrl = `http://wschool.cup.edu.cn/rss/wap/rssinfo/search?p=1&rss_id=${id}`;
    const feed = await cup_rss(sourceUrl);
    feedxml = feed.xml({indent: true });
    console.log('!!!!!RSS XML:', feedxml);
  
    filePath = path.join(__dirname, `cup_rss_${id}.rss`);
  }

  // 如果域名是cnki
  if (domain === 'cnki') {
    const sourceUrl = `https://rss.cnki.net/knavi/rss/${id}?pcode=CJFD,CCJD`;
    const response = await axios.get(sourceUrl);
    // 生成文件路径
    const data = response.data;
    console.log('data:', data);
    // 确保是xml格式
    if (!data.startsWith('<?xml')) {
      console.error('数据不是xml格式');
      return;
    }

    // 将数据写入文件
    feedxml = data;
    console.log('data:', data);
    filePath = path.join(__dirname, `cnki_rss_${id}.rss`);
  }

  // 如果文件路径为空，返回
  if (!filePath) {
    console.error('文件路径为空');
    return;
  }
  // 如果feedxml为空，返回
  if (!feedxml) {
    console.error('feedxml为空');
    return;
  }

  // 确保目录存在
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // 根据follow.csv文件中的file,followInfo,对file的channel description 追加 followInfo
  const followInfo = fs.readFileSync(path.join(__dirname, 'follow.csv'), 'utf8').split('\n').filter(x => x.trim() !== '').map(x => x.split(',')[1]).join('\n');
  console.log('followInfo:', followInfo);
  // 如果文件名存在于follow.csv中，将followInfo追加到description中
  if (fs.existsSync(filePath)) {
      // 从feedxml中提取description
    const description = feedxml.match(/<description>(.*?)<\/description>/)[1];
    console.log('description:', description);
    // 将description和followInfo拼接
    const newDescription = description + '\n' + followInfo;
    console.log('newDescription:', newDescription);
    // 将newDescription替换feedxml中的description
    feedxml = feedxml.replace(/<description>(.*?)<\/description>/, `<description>${newDescription}</description>`);    
  }

  //保存文件，编码为utf-8
  fs.writeFileSync(filePath, feedxml, 'utf-8');
  console.log('RSS XML file saved:', filePath);
};


export { fetchAndSaveRSS };