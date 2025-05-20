FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM node:18-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist /app/dist
CMD ["serve", "-s", "dist", "-l", "80"] 