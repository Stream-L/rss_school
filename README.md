# 项目名称：rss_school

## 项目简介
该项目是一个基于 Express 的 RSS 源获取和处理应用程序。它能够从指定的 RSS 源获取数据，并将其保存为 XML 文件。用户可以通过特定的路由请求生成的 XML 文件。自用，用于转写cup公告和转发知网期刊订阅。

## 文件结构
```
trae-rss
├── src
│   ├── index.mjs          # 应用程序入口点，设置 Express 服务器并定义路由
│   └── utils
│       └── fetchAndSaveRSS.mjs  # 获取 RSS 数据并保存为 XML 文件的函数
├── package.json           # npm 配置文件，列出项目依赖项和脚本
├── nodemon.json           # nodemon 配置文件，监视文件更改以自动重启应用
└── README.md              # 项目文档
```

## 安装依赖
在项目根目录下运行以下命令以安装所需的依赖项：
```
npm install
```

## 开发环境
为了在开发过程中自动重启应用程序，使用 `nodemon` 作为开发依赖。确保在 `package.json` 中添加以下脚本：
```json
"scripts": {
  "start": "node src/index.mjs",
  "dev": "nodemon src/index.mjs"
}
```

## 运行项目
使用以下命令启动项目：
```
npm run dev
```
这将启动 Express 服务器，并在文件更改时自动重新运行应用程序。

## 使用说明
访问以下 URL 以获取 RSS 源的 XML 文件：
```
http://localhost:3000/rss/{id}
```
将 `{id}` 替换为所需的 RSS 源 ID。例如，访问 `http://localhost:3000/rss/21` 将返回 ID 为 21 的 RSS 源的 XML 文件。
