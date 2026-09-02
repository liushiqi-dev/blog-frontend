# ===== 阶段 1：构建（在容器里完成 npm install + build）=====
FROM node:20-alpine AS build
WORKDIR /app
# 先只复制依赖清单，利用 Docker 层缓存：依赖没变就不重装
COPY package*.json ./
RUN npm ci
# 再复制源码并构建
COPY . .
RUN npm run build

# ===== 阶段 2：运行（只把构建产物装进 nginx）=====
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
