# 使用官方 Node.js 镜像作为基础镜像
FROM node:14

# 创建并设置工作目录
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 复制项目文件
COPY . .

# 暴露应用运行的端口
EXPOSE 3000

# 启动应用
CMD ["node", "src/index.mjs"]
