# 使用官方的 Node.js 22 镜像作为基础镜像
FROM node:22-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 yarn.lock
COPY package.json yarn.lock ./

# 安装项目依赖
RUN yarn install --production

# 复制项目文件
COPY . .

# 设置环境变量
ENV PORT=3000

# 暴露应用程序端口
EXPOSE 3000

# 启动应用程序
CMD ["node", "src/index_b.mjs"]