# 使用 Node.js 22 作为基础镜像
FROM node:22

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果有）
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件
COPY . .

# 暴露应用程序端口
EXPOSE 3000

# 启动应用程序
CMD ["npm", "start"]