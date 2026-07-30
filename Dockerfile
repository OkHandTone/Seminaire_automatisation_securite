FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY vendor/ /usr/share/nginx/html/vendor/

EXPOSE 10000

CMD ["nginx", "-g", "daemon off;"]
