# Web应用架构

### Web 应用与客户端-服务器模型

**概念**：Web 应用（web app）是通过浏览器、经由网络访问的软件程序；大多数 Web 应用遵循客户端-服务器（Client-Server）模型：服务器端负责数据的存储和读取，客户端负责把信息展示给用户

**一句话**：Web 应用分成客户端（前端）和服务器端（后端）：前端用 HTML、CSS、JavaScript 在浏览器里展示界面、收集用户输入；后端用 Java 等语言处理业务逻辑、读写文件和数据库；两者通过 HTTP 的请求和响应通信；UI 运行在客户端，但它展示的数据来自服务器。

**详细解释**：
A web application, often called a web app, is a software program accessed through a web browser over the internet。
Client-Server model：Server-side language (such as Java) to handle the storage and retrieval of the information；client-side (HTML, CSS, JavaScript, etc.) to present information to the users；User Interface (UI)：The visual layer and controls the user interacts with (buttons, forms, tables, etc.)，Lives on the client but is built from data provided by the server。
课件的架构图：User → Collect Data → Frontend（What the User Sees & Interacts with：HTML, CSS, JavaScript）→ Request → Backend（Contains App Logic：PHP, JavaScript, Python, Java；Web Server 读写 File System 和 Database）→ Response → Frontend → Display Results → User。
课件的分层图：Client side（Presentation Layer：HTML5、JS、CSS3；Browser；Local Storage：Cookies、IndexedDB、localStorage、File API；Operating System）⇄ Communication Channel（Application Layer：HTTP/1.1、HTTP/2）⇄ Server side（Logic Layer；Web Server Layer：Nginx、Tomcat、Apache；Storage Layer：MySQL、Oracle、PostgreSQL；Operating System；Infrastructure）。
这门课的技术栈：前端 HTML、CSS、JavaScript，后端 Java Servlet 跑在 Tomcat 里，数据存在 MySQL。

**问题**：什么是 Web 应用？客户端-服务器模型中客户端和服务器分别负责什么？

**答案要点**：
1. Web 应用是通过浏览器、经由网络访问的软件，不需要单独安装客户端
2. 客户端（前端）负责展示信息、收集用户输入，技术是 HTML、CSS、JavaScript
3. 服务器端（后端）负责业务逻辑和数据的存储、读取，比如 Java + 数据库
4. 客户端发 HTTP 请求，服务器返回 HTTP 响应
5. UI 运行在客户端，但用服务器提供的数据搭建

**对比**：
| | 客户端（Frontend） | 服务器端（Backend） |
|---|---|---|
| 运行在哪 | 用户的浏览器 | 服务器 |
| 负责 | 展示、交互 | 业务逻辑、存储和读取数据 |
| 技术 | HTML、CSS、JavaScript | Java、Python、PHP 等 + 数据库 |
| 存储 | Cookie、localStorage、IndexedDB | 文件系统、MySQL 等 |

**常见陷阱**：
- ❌ 认为 HTML、CSS、JavaScript 在服务器上执行，再把画面发给浏览器
- ✅ 它们作为文件被发送到浏览器，由浏览器解析、渲染和执行
- ❌ 认为前端页面可以直接读写服务器上的数据库
- ✅ 前端只能发 HTTP 请求，由后端程序访问数据库，再把结果放进响应

**追问**：
- Q: 为什么不让前端直接连数据库？
- A: 数据库的账号密码会暴露在浏览器里，任何人都能随意读写；业务校验和权限控制也必须放在后端，前端的校验可以被绕过

**判断题**：
- ✅ 在客户端-服务器模型中，用户界面运行在客户端，但它展示的数据由服务器提供 —— 课件：UI lives on the client but is built from data provided by the server
- ❌ Web 应用的前端代码（HTML、CSS、JavaScript）运行在服务器上 —— 前端代码由浏览器下载后在客户端解析和执行

### HTML 与 CSS

**概念**：HTML（Hyper Text Markup Language，超文本标记语言）描述网页的结构，由一系列用标签表示的元素组成；CSS（Cascading Style Sheet，层叠样式表）描述 HTML 元素怎么显示，控制颜色、字体、布局、间距等

**一句话**：HTML 用 `<tagName>content</tagName>` 这样的标签告诉浏览器内容的结构，浏览器不会把标签显示出来，而是用它们渲染页面；CSS 有行内（标签的 style 属性）、内部（`<head>` 里的 `<style>`）、外部（单独的 .css 文件）三种写法，后两种用选择器指定样式作用在哪些元素上；"层叠"指多条样式可以同时作用在一个元素上，按优先级决定谁生效。

**详细解释**：
HTML stands for Hyper Text Markup Language：Describes the structure of a web page；Consists of a series of elements。
HTML elements are represented by tags：`<tagName>content</tagName>`；Tell the browser how to display the content；Browsers do not display the HTML tags directly, but use them to render the content of the page。
课件的例子：`<title>This is the tab name</title>` 显示在浏览器的标签页上，`<h1>Hello, world!</h1>` 显示为页面上的大标题；`<head>` 放标题、样式、编码等元信息，`<body>` 放真正显示在页面上的内容。
CSS stands for Cascading Style Sheet：describes how HTML elements are to be displayed；Cascading：Multiple styles can apply, with rules for which takes priority；Style：Controls color, font, layout, spacing, etc.
Ways to Apply CSS：Inline – directly in the tag `<p style="color:red;">Text</p>`；Internal (in-page) – inside `<style>` in the `<head>`；External – separate .css file。
CSS Selectors：In the last two methods, selectors are used to define which HTML elements the styles apply to（课件原文用 "~" 代替了 selectors）。
优先级（补充）：!important > 行内样式 > id 选择器（#header）> 类选择器（.title）> 元素选择器（p）；优先级相同时，后写的覆盖先写的。
实际项目推荐外部样式表：结构和样式分离，多个页面共用一份，浏览器还能缓存 .css 文件。

**问题**：HTML 和 CSS 分别负责什么？CSS 有哪几种引入方式，优先级怎样？

**答案要点**：
1. HTML 是超文本标记语言，描述页面结构，由元素组成
2. 元素用 `<tagName>content</tagName>` 标签表示，浏览器不显示标签，而是用它渲染内容
3. CSS 是层叠样式表，控制颜色、字体、布局、间距
4. CSS 有行内、内部（`<head>` 里的 `<style>`）、外部（.css 文件）三种写法，后两种要用选择器
5. 层叠：多条样式作用于同一元素时按优先级决定，不考虑 !important 时行内样式优先级最高

**对比**：
| 方式 | 写在哪 | 要不要选择器 | 适用 |
|---|---|---|---|
| Inline 行内 | 标签的 style 属性 | 不要 | 临时改单个元素 |
| Internal 内部 | `<head>` 里的 `<style>` | 要 | 单个页面的样式 |
| External 外部 | 单独的 .css 文件 | 要 | 多个页面共用，推荐 |

**常见陷阱**：
- ❌ 认为 `<head>` 里的内容会显示在页面正文里
- ✅ `<head>` 放元信息，`<title>` 显示在浏览器标签页上；正文内容放在 `<body>` 里
- ❌ 认为行内样式也要写选择器
- ✅ 行内样式直接写在元素的 style 属性上，只作用于这个元素；内部和外部样式才需要选择器

**追问**：
- Q: 为什么一般推荐外部样式表，而不是行内样式？
- A: 结构和样式分离，多个页面可以共用同一个 .css 文件，浏览器还能缓存它；行内样式难维护、不能复用，而且优先级太高，不好被覆盖

**判断题**：
- ✅ 浏览器不会直接显示 HTML 标签，而是用标签来渲染页面内容 —— 课件：Browsers do not display the HTML tags directly, but use them to render the content of the page
- ❌ 同一个元素上，外部 .css 文件里的样式优先级高于标签上的行内样式 —— 不考虑 !important 时，行内样式的优先级最高

### JavaScript 与静态、动态网页

**概念**：JavaScript 是 HTML 和 Web 的编程语言；只用 HTML 和 CSS 只能做出静态（static）网页，JavaScript 可以根据用户交互等事件动态地渲染页面

**一句话**：HTML 管结构、CSS 管样式、JavaScript 管行为；静态网页的内容事先写死，每个人看到的都一样；动态内容有两种来源：浏览器里的 JavaScript 根据用户操作修改页面（客户端动态），或者服务器端程序（比如 Servlet）根据请求现场生成内容（服务器端动态）。

**详细解释**：
JavaScript is the programming language of HTML and the Web。
HTML and CSS will only produce static web pages。
JavaScript can help render the web pages dynamically based on events such as user interactions（点击按钮、输入文字、滚动页面等）。
三者分工：HTML → 结构（有什么），CSS → 样式（长什么样），JavaScript → 行为（怎么动）。
客户端动态：浏览器执行 JavaScript，修改页面上的元素（DOM），或者用 fetch / AJAX 向服务器要数据后局部刷新页面。
服务器端动态：浏览器请求一个 URL，服务器上的 Java 程序（Servlet）查询数据库、拼出 HTML 或 JSON 再返回，不同用户、不同时间拿到的内容可以不同。
JavaScript 不只能跑在浏览器里：课件在 Web 服务器软件里提到 Node.js (with Express) 是 JavaScript 运行时，常用来写服务器。
JavaScript 和 Java 是两门不同的语言，只是名字相似。

**问题**：HTML、CSS 和 JavaScript 分别负责什么？什么是静态网页和动态网页？

**答案要点**：
1. HTML 描述页面结构，CSS 描述样式，JavaScript 描述行为
2. 只有 HTML 和 CSS 只能做静态网页，内容是写死的
3. JavaScript 可以根据用户交互等事件动态修改页面
4. 服务器端程序（比如 Servlet）也可以根据请求动态生成内容
5. JavaScript 也能通过 Node.js 在服务器端运行，它和 Java 是不同的语言

**对比**：
| | 静态网页 | 客户端动态 | 服务器端动态 |
|---|---|---|---|
| 内容从哪来 | 事先写好的 HTML 文件 | 浏览器里的 JavaScript 修改页面 | 服务器程序根据请求生成 |
| 典型技术 | HTML、CSS | JavaScript | Servlet、JSP 等 |
| 每个用户看到的 | 一样 | 随操作变化 | 随请求、用户、数据变化 |

**常见陷阱**：
- ❌ 认为动态网页一定要靠浏览器里的 JavaScript
- ✅ 服务器端程序（比如 Servlet）根据请求生成 HTML 也是动态内容，这正是 Servlet 要做的事
- ❌ 认为 JavaScript 是 Java 的脚本版本
- ✅ 两者是不同的语言，语法和运行环境都不同，只是名字相似

**追问**：
- Q: Servlet 返回的页面和浏览器里 JavaScript 渲染的页面有什么区别？
- A: Servlet 在服务器上把内容生成好再发给浏览器（服务器端渲染）；JavaScript 是浏览器拿到页面或数据后在本地修改页面（客户端渲染）；前者的内容直接就在响应里，后者可以只刷新局部、不用整页重新加载

**判断题**：
- ✅ 只用 HTML 和 CSS 只能做出静态网页 —— 课件：HTML and CSS will only produce static web pages，需要 JavaScript 或服务器端程序才能动态变化
- ❌ JavaScript 只能在浏览器里运行 —— 课件提到 Node.js 是 JavaScript 运行时，常用来写服务器
