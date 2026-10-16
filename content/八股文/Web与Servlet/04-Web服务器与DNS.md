# Web服务器与DNS

### Web 服务器与 IP 地址

**概念**：Web 服务器是一个软件应用（有时也指运行它的硬件），它接收客户端（比如浏览器）发来的 HTTP 请求，返回 HTML 页面、图片、JSON 等 Web 内容；服务器连在互联网上，通过 IP 地址被访问

**一句话**：Web 服务器 = 接收 HTTP 请求、返回内容的程序（也可以指它所在的机器）；IPv4 地址是 32 位的数，写成 4 个 0~255 的数字、用点隔开（如 142.250.190.14），IPv6 是 128 位；常见的 Web 服务器软件有 Apache HTTP Server、Nginx、Node.js（Express），而 Tomcat 是运行 Java Servlet 的 Servlet 容器，和 Apache HTTP Server 是两个不同的产品。

**详细解释**：
A web server is a software application (and sometimes also refers to the hardware it runs on) that：Receives HTTP requests from clients (like web browsers)；Responds with web content, such as HTML pages, images, or JSON data。
The server is connected to the internet, ready to handle incoming requests。
Each web server has a unique IP address：A 32-bit number, usually written as four numbers (from 0 to 255) separated by periods；Example: 142.250.190.14（这是 IPv4；IPv6 是 128 位，写成 8 组十六进制数，比如 2001:db8::1；"唯一"也不绝对，一个 IP 上可以放多个网站，一个大网站也有很多个 IP）。
课件的图：服务器从下到上是 Hardware → Operating System (Linux, Windows, Mac) → HTTP Server、Database、Scripting Language。
If you want to run a website：First, you need to register a domain name；Then, you must point that domain to the IP address of the web server where your site is hosted；To handle your site's traffic and services, you can use a dedicated server。
Some leading web server software：Apache HTTP Server - widely used；Nginx Web Server - high performance, stability, simple configuration and low resource usage；Node.js (with Express) - JavaScript runtime, often used for building servers。
课件写的 "Apache HTTP Server (like Tomcat)" 不准确：Apache HTTP Server（httpd）和 Apache Tomcat 是 Apache 基金会的两个不同产品；httpd 是通用 Web 服务器，Tomcat 是 Servlet 容器（自带 HTTP 连接器，也能直接对外提供服务）。
常见部署：Nginx 在前面处理静态文件、HTTPS 和负载均衡，把动态请求反向代理给后面的 Tomcat。

**问题**：什么是 Web 服务器？Nginx、Apache HTTP Server 和 Tomcat 有什么区别？

**答案要点**：
1. Web 服务器接收 HTTP 请求，返回 HTML、图片、JSON 等内容；这个词也可以指运行它的硬件
2. 服务器通过 IP 地址被访问；IPv4 是 32 位，IPv6 是 128 位
3. Apache HTTP Server 使用广泛；Nginx 高性能、低资源占用，常用作反向代理和负载均衡
4. Tomcat 是 Servlet 容器，用来运行 Java 的 Servlet，和 Apache httpd 是不同的产品
5. 常见组合：Nginx 处理静态资源和转发，Tomcat 处理 Java 动态请求

**对比**：
| | Apache HTTP Server | Nginx | Tomcat |
|---|---|---|---|
| 类型 | Web 服务器 | Web 服务器、反向代理 | Servlet 容器 |
| 实现语言 | C | C | Java |
| 擅长 | 静态资源、模块丰富 | 高并发、低资源占用、负载均衡 | 运行 Servlet，生成动态内容 |

**常见陷阱**：
- ❌ 认为 Tomcat 就是 Apache HTTP Server
- ✅ 两者都是 Apache 基金会的项目，但 httpd 是通用 Web 服务器，Tomcat 是 Java 的 Servlet 容器
- ❌ 认为 IP 地址都是 32 位的
- ✅ 32 位的是 IPv4；IPv6 是 128 位

**追问**：
- Q: 为什么生产环境常在 Tomcat 前面再放一个 Nginx？
- A: Nginx 处理静态文件、HTTPS 和大量并发连接的效率更高，还能做负载均衡（把请求分给多台 Tomcat）和反向代理（隐藏后端服务器），Tomcat 专心处理 Java 动态请求

**判断题**：
- ✅ IPv4 地址是一个 32 位的数，通常写成 4 个 0 到 255 的数字，用点隔开 —— 课件：A 32-bit number, usually written as four numbers (from 0 to 255) separated by periods
- ❌ Apache HTTP Server 和 Apache Tomcat 是同一个软件 —— httpd 是通用 Web 服务器，Tomcat 是 Servlet 容器，是两个不同的产品

### DNS 与访问网页的过程

**概念**：DNS（Domain Name System，域名系统）像互联网的电话簿，把人容易记住的域名（如 google.com）翻译成对应的 IP 地址（如 142.250.190.14），浏览器再用这个 IP 地址访问 Web 服务器

**一句话**：在浏览器输入 URL 后：先通过 DNS 把域名解析成 IP（先查浏览器、操作系统等缓存）；然后和服务器建立 TCP 连接（https 还要 TLS 握手）；发送 HTTP 请求；服务器（比如 Tomcat 里的 Servlet）处理后返回响应；浏览器解析 HTML，再分别请求里面引用的图片、CSS、JS；最后把所有内容渲染成网页。

**详细解释**：
DNS：IP addresses like 142.250.190.14 are hard for humans to remember. Instead, we use domain names like google.com；DNS (Domain Name System) acts like the internet's phonebook, translates a domain name into the corresponding IP address。
课件的图：User 把 google.com 发给 DNS Server → DNS Server 返回 142.250.190.14 → User 用 142.250.190.14 访问 Google。
How It Works：
1. A user enters a URL into a browser (for example, google.com). This request is passed to a DNS server。
2. The DNS server returns an IP address for the server that hosts the Website (for example, 142.250.190.14)。
3. The browser requests the page from the Web server using the IP address specified by the domain name server。
4. The Web server returns the page to the IP address specified by the browser requesting the page. The page may also contain links to other files on the same server, such as images, which the browser will also request。
5. The browser collects all the information and displays to your computer in the form of Web page。
补充：DNS 结果会被缓存（浏览器缓存、操作系统缓存和 hosts 文件、本地 DNS 服务器），缓存有过期时间（TTL）；课件省略了 TCP 三次握手和 HTTPS 的 TLS 握手；localhost 是一个特殊的主机名，指向本机 127.0.0.1，开发时访问 http://localhost:8080 就是访问本机上的 Tomcat。

**问题**：在浏览器地址栏输入一个网址并回车，到页面显示出来，中间发生了什么？

**答案要点**：
1. 解析 URL，用 DNS 把域名解析成 IP 地址（先查各级缓存）
2. 和服务器建立 TCP 连接，https 还要做 TLS 握手
3. 浏览器发送 HTTP 请求，服务器处理后返回 HTTP 响应
4. 浏览器解析 HTML，页面引用的图片、CSS、JS 会再发请求获取
5. 浏览器把所有内容渲染成网页

**对比**：
| | 域名 | IP 地址 |
|---|---|---|
| 例子 | google.com | 142.250.190.14 |
| 给谁用 | 人（好记） | 网络（定位服务器） |
| 转换 | 由 DNS 翻译成 IP | 网络直接用它通信 |

**常见陷阱**：
- ❌ 认为第一次请求就会把 HTML、图片、CSS 一起返回
- ✅ 第一次响应一般只有 HTML，浏览器解析后再分别请求页面引用的图片等文件
- ❌ 认为每次访问网站都要重新去 DNS 服务器查询
- ✅ 浏览器、操作系统和本地 DNS 服务器都会缓存解析结果，过期之前直接用缓存

**追问**：
- Q: 本地开发时访问 http://localhost:8080，需要 DNS 吗？
- A: 不需要去外部 DNS 服务器查：localhost 由本机直接解析成 127.0.0.1（回环地址），请求不会离开这台电脑；8080 是 Tomcat 默认的 HTTP 端口

**判断题**：
- ✅ DNS 的作用是把域名翻译成对应的 IP 地址 —— 课件：DNS acts like the internet's phonebook，translates a domain name into the corresponding IP address
- ❌ 浏览器收到 HTML 后，页面里引用的图片已经包含在这次响应里，不需要再发请求 —— 课件：页面可能引用了服务器上的其他文件（比如图片），浏览器会再去请求它们
