# 使用说明

## 简介

该项目用于从指定的 RSS 源获取数据并保存为本地 RSS 文件。

## URL 重写使用方法

你可以通过访问以下 URL 来获取并重写 RSS 数据：

- 直接使用url：

  ```
    http://root/rss/url?url=URL_ADDRESS
  ```

  其中 `:domain` 是数据源域名，`:id` 是 RSS 源的 ID。
- 获取并重写中国石油大学（北京）RSS 数据：

  ```
  http://root/rss/cup/:id
  ```

  其中 `:id` 是 RSS 源的 ID，例如 `21`。
- 获取并重写 CNKI RSS 数据：

  ```
  http://root/rss/cnki/:id
  ```

  其中 `:id` 是 RSS 源的 ID，例如 `CJFD`。

## 安装

确保你已经安装了 Node.js 和 npm。然后在项目根目录下运行以下命令来安装依赖：

```bash
npm install
```

## 使用方法

在 `src/utils/fetchAndSaveRSS.mjs` 文件中，有一个 `fetchAndSaveRSS` 函数，可以用来获取并保存 RSS 数据。

### 示例

以下是一个示例代码，展示了如何使用 `fetchAndSaveRSS` 函数：

```javascript
import { fetchAndSaveRSS } from './utils/fetchAndSaveRSS.mjs';

// 获取并保存中国石油大学（北京）RSS 数据
fetchAndSaveRSS('cup', '21');

// 获取并保存 CNKI RSS 数据
fetchAndSaveRSS('cnki', 'CJFD');
```

## 参数说明

- `domain`: 数据源域名，目前支持 `cup` 和 `cnki`。
- `id`: RSS 源的 ID。
