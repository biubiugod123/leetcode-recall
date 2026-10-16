# HTTP请求

### HTTP 协议与请求-响应模型

**概念**：HTTP（Hypertext Transfer Protocol，超文本传输协议）规定了客户端和服务器在互联网上怎样通信：数据通过请求（request）和响应（response）组织和传输，客户端发出的每个请求都必须有服务器的一个响应

**一句话**：HTTP 是基于请求-响应模型的应用层协议：通信由客户端（通常是浏览器）发起，服务器返回响应，一个请求对应一个响应；HTTP 本身是无状态的，服务器不记得之前的请求，要靠 Cookie、Session、Token 维持登录状态；HTTP/1.x 的报文是文本格式，HTTP/2 改成了二进制分帧。

**详细解释**：
HTTP stands for Hypertext Transfer Protocol：It is used to structure communication between clients and servers over the internet；It defines how data is structured and transmitted via requests and responses；Each HTTP request sent by a client must be followed by an HTTP response from the server, ensuring a complete exchange of data over the network。
HTTP Request：a packet of binary data sent by the Client to server；HTTP Response：a packet of binary data in reply to a request（课件的说法；面试里一般说 HTTP/1.x 的报文是人能读懂的文本格式，HTTP/2 才是二进制分帧）。
课件的图：Client (Web Browser) ── Request ──→ Server，Server ── Response ──→ Client。
无状态（stateless）：每个请求都是独立的，服务器不会自动记住同一个用户上一次请求了什么；登录状态靠 Cookie + Session 或 Token 维持。
课件分层图里，HTTP 位于 Communication Channel 的 Application Layer（HTTP/1.1、HTTP/2）；HTTP 跑在 TCP 之上，HTTPS = HTTP + TLS 加密。

**问题**：HTTP 是什么？它的通信模型有什么特点？

**答案要点**：
1. HTTP 是超文本传输协议，规定客户端和服务器之间怎么通信
2. 请求-响应模型：客户端发请求，服务器回响应，一个请求对应一个响应
3. 通信由客户端发起，服务器被动响应
4. HTTP 是无状态的，要靠 Cookie、Session、Token 维持状态
5. HTTP 是应用层协议，基于 TCP；HTTPS 在它下面加了 TLS 加密

**对比**：
| | HTTP/1.1 | HTTP/2 |
|---|---|---|
| 报文格式 | 文本 | 二进制分帧 |
| 一个连接上的多个请求 | 基本按顺序一个接一个 | 多路复用，可以并行 |
| 头部 | 每次原样发送 | 压缩（HPACK） |

**常见陷阱**：
- ❌ 认为服务器会自动记住同一个用户之前的请求
- ✅ HTTP 是无状态的，要靠 Cookie、Session 或 Token 把同一个用户的多次请求关联起来
- ❌ 认为 HTTP 和 HTTPS 是两种完全不同的协议
- ✅ HTTPS 就是在 HTTP 下面加了一层 TLS 加密，请求和响应的格式一样

**追问**：
- Q: HTTP 是无状态的，那网站怎么知道我已经登录了？
- A: 登录成功后服务器返回一个标识（放在 Cookie 里的 Session ID，或者一个 Token），浏览器之后的每个请求都带上它，服务器据此识别是谁

**判断题**：
- ✅ HTTP 是无状态协议，服务器默认不会记住之前的请求 —— 需要 Cookie、Session 或 Token 来维持状态
- ❌ 在 HTTP 的请求-响应模型里，服务器可以在没有收到请求的情况下主动给浏览器发送响应 —— 课件：每个响应都是对客户端某个请求的回复，通信由客户端发起

### HTTP 请求的结构

**概念**：HTTP 请求由三部分组成：请求行（Request Line）、0 个或多个请求头（Request Headers）、可选的请求体（Request Body）；请求行包括请求方法、请求 URI 和协议版本

**一句话**：比如 POST /login HTTP/1.1 是请求行（方法 POST、URI /login、协议 HTTP/1.1）；后面的 Host、Content-Type、Content-Length 等是请求头，给服务器传递关于这个请求的额外信息；空一行之后是请求体，可以是 JSON、XML 等格式，是可选的，比如 GET /books/123 就不需要请求体。

**详细解释**：
An HTTP Request contains the following parts：Request Line；0 or more Request Headers；A Request Body (optional)。
课件的例子：
```
POST /login HTTP/1.1
Host: drill.beaconfireinc.com
Content-Type: application/json
Content-Length: 44

{
  "username": "kevin",
  "password": "123456"
}
```
Request Line：HTTP Method (GET, PUT, POST, PATCH, etc.)；Request URI (/login)；HTTP Protocol that is being used。
Request Header：In the request section, whatever follows Request Line till before Request Body is a Header；Headers are used to pass additional information about the request to the server；e.g., Host, Content-Type, Accept-Language（课件写作 content-Type、accept-Language；头的名字不区分大小写）。
Request Body：the part of the HTTP Request where additional content can be sent to the server；Can be in different formats (JSON, XML, etc.)；It's optional：GET /books/123 doesn't need a request body。
补充：请求头和请求体之间用一个空行分隔；Content-Type 说明请求体的格式，Content-Length 说明请求体的字节数；HTTP/1.1 要求请求必须带 Host 头，因为一台服务器（一个 IP）上可能有多个网站。

**问题**：一个 HTTP 请求由哪几部分组成？请求行里有什么？

**答案要点**：
1. 请求行：请求方法 + 请求 URI + 协议版本，比如 POST /login HTTP/1.1
2. 请求头：0 个或多个，传递额外信息，比如 Host、Content-Type、Content-Length、Accept-Language
3. 请求头和请求体之间有一个空行
4. 请求体可选，可以是 JSON、XML 等格式
5. GET 请求一般没有请求体，POST、PUT、PATCH 通常带请求体

**对比**：
| 部分 | 例子 | 是否必须 |
|---|---|---|
| 请求行 | POST /login HTTP/1.1 | 必须 |
| 请求头 | Host: drill.beaconfireinc.com | 0 个或多个（HTTP/1.1 必须有 Host） |
| 空行 | （空） | 必须 |
| 请求体 | {"username": "kevin", ...} | 可选 |

**常见陷阱**：
- ❌ 认为请求行里放的是完整的 URL（包括协议和域名）
- ✅ 一般只放路径部分（Request URI，比如 /login），主机名放在 Host 请求头里
- ❌ 认为请求里的 Content-Type: application/json 表示希望服务器返回 JSON
- ✅ 请求里的 Content-Type 描述的是请求体本身的格式；希望服务器返回什么格式用 Accept 头

**追问**：
- Q: HTTP/1.1 为什么要求必须带 Host 头？
- A: 一个 IP 上可能部署了多个网站（虚拟主机），服务器要靠 Host 判断请求的是哪个网站

**判断题**：
- ✅ HTTP 请求的请求头和请求体之间用一个空行分隔 —— 服务器靠这个空行判断请求头结束了
- ❌ 每个 HTTP 请求都必须带请求体 —— 课件：请求体是可选的，比如 GET /books/123 不需要请求体

### GET 与 POST

**概念**：HTTP 定义了一组请求方法，表示请求的目的；GET 请求指定资源的表示，应该只读取数据；POST 向指定资源提交一个实体，通常会改变服务器状态或产生副作用

**一句话**：GET 用来查数据，参数一般放在 URL 的查询字符串里（?id=1&name=a），会出现在地址栏和历史记录里，可以被收藏和缓存，是安全、幂等的；POST 用来提交数据，参数放在请求体里，通常会改变服务器状态，不幂等；POST 并不比 GET 加密，不用 HTTPS 的话请求体也是明文。

**详细解释**：
HTTP defines a set of request methods to indicate the purpose of the request and what is expected if the request is successful。
GET：The GET method requests a representation of the specified resource. Requests using GET should only retrieve data。
POST：The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server。
其他方法：PUT（整体替换）、PATCH（部分更新）、DELETE（删除），以及 HEAD、CONNECT、OPTIONS、TRACE 等（课件在这一行又写了一次 PATCH，是重复）。
查询字符串：GET /books?author=Fitzgerald&title=The+Great+Gatsby，参数写成 key=value，用 & 连接；特殊字符要 URL 编码，空格写成 + 或 %20，中文写成 %E4%B8%AD 这样的字节。
表单提交：`<form method="get">` 把参数拼到 URL 上；`<form method="post">` 把参数放进请求体，Content-Type 是 application/x-www-form-urlencoded；在 Servlet 里两种方式都用 request.getParameter("name") 取值，容器会帮你解码。
安全方法（safe）：不改变服务器状态，GET、HEAD、OPTIONS 是安全的，POST 不是。

**问题**：GET 和 POST 有什么区别？

**答案要点**：
1. 语义：GET 获取数据，不应改变服务器状态；POST 提交数据，通常会改变服务器状态
2. 参数位置：GET 在 URL 查询字符串里，POST 一般在请求体里
3. GET 的参数会出现在地址栏、历史记录和服务器日志里，可以被收藏、缓存
4. GET 是幂等的，POST 不是；刷新 POST 的结果页时浏览器会提示重复提交
5. 安全性：两者在 HTTP 下都是明文，敏感数据要靠 HTTPS

**对比**：
| | GET | POST |
|---|---|---|
| 用途 | 获取数据 | 提交数据 |
| 参数位置 | URL 查询字符串 | 请求体 |
| 能否收藏、缓存 | 可以 | 一般不行 |
| 出现在地址栏、历史记录 | 会 | 不会 |
| 幂等 | 是 | 否 |

**常见陷阱**：
- ❌ 认为 POST 比 GET 安全，因为 POST 的数据是加密的
- ✅ POST 只是把数据放在请求体里、不显示在地址栏；没有 HTTPS 时请求体同样是明文
- ❌ 用 GET 请求做删除、下单这类修改操作
- ✅ GET 应该只读取数据；浏览器预加载、爬虫、缓存都可能自动发 GET，用它改数据很危险

**追问**：
- Q: GET 请求的参数有长度限制吗？
- A: HTTP 规范本身没有规定，但浏览器和服务器都会限制 URL 的长度，所以大量数据要用 POST 放在请求体里

**代码题**：下面代码模拟解析 GET 请求的查询字符串，输出什么？

```java
String query = "name=Tom+Lee&city=New%20York";
for (String pair : query.split("&")) {
    String[] kv = pair.split("=");
    String value = java.net.URLDecoder.decode(kv[1], java.nio.charset.StandardCharsets.UTF_8);
    System.out.print(kv[0] + ":" + value + ";");
}
```

- [x] name:Tom Lee;city:New York;
- [ ] name:Tom+Lee;city:New York;
- [ ] name:Tom+Lee;city:New%20York;
- [ ] name:Tom Lee;city:New%20York;

解析：URLDecoder 按表单编码（application/x-www-form-urlencoded）的规则解码，+ 和 %20 都会还原成空格。GET 请求的参数就是这样编码后放在 URL 的查询字符串里的；在 Servlet 里调用 request.getParameter("name") 时，容器已经帮你完成了这一步解码。

**判断题**：
- ✅ GET 请求的参数一般放在 URL 的查询字符串里，会出现在浏览器地址栏和历史记录中 —— POST 的参数一般放在请求体里
- ❌ POST 请求比 GET 请求安全，因为 POST 的数据会被自动加密 —— 没有 HTTPS 时，POST 的请求体也是明文传输

### POST、PUT 与 PATCH

**概念**：以书店为例：POST 新增一本书，不需要指定 id，由服务器生成；PUT 新增或更新一本书，需要在 URL 里指定 id，资源已存在时用请求的数据替换整个资源（全量更新）；PATCH 只修改请求里给出的字段（部分更新），也需要指定 id

**一句话**：POST /books 新增，id 由服务器自动生成，重复提交会创建多本书；PUT /books/123 类似 hashMap.put()：不存在就创建，存在就整体替换，请求里没给的字段会变成 null；PATCH /books/123 只改请求体里出现的字段，其他字段保持不变。

**详细解释**：
Example: Book Store。
POST – add a new book：No need to specify the id, id will be auto-generated；What if we post the same book multiple times? → 会创建多本内容相同、id 不同的书。
PUT – add or update a book：Similar to hashMap.put()；If doesn't exist, it will create a new one；If exists, the data you send will replace the entire existing resource on the server；Need to specify the id (id=123 in this example)。
PATCH – partially update：Only modifies specific fields；Need to specify the id。
课件的方法列表：PUT 是 FULL UPDATE, meaning that if there are some fields not specified in the payload, they will be replaced with null；PATCH 是 PARTIAL UPDATE, meaning that if there are some fields not specified in the payload, they will be left as is。
课件的请求：
```
POST /books HTTP/1.1
{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald"}

PUT /books/123 HTTP/1.1
{"title": "The Great Gatsby", "author": "F. Scott Fitzgerald"}

PATCH /books/123 HTTP/1.1
{"year": "1925"}
```
（课件 PUT 例子的 JSON 在最后一个字段后面多了一个逗号，标准 JSON 不允许尾随逗号。）
REST 风格的约定：POST 创建成功一般返回 201 Created，并在 Location 响应头里给出新资源的地址。

**问题**：POST、PUT、PATCH 有什么区别？

**答案要点**：
1. POST 新增资源，URL 不带 id（/books），id 由服务器生成
2. PUT 新增或整体替换，URL 带 id（/books/123），类似 hashMap.put()
3. PUT 是全量更新：请求里没给的字段会被设为 null
4. PATCH 是部分更新：只改给出的字段，其他字段保持不变，也要带 id
5. 同一个 POST 发多次会创建多个资源，同一个 PUT 发多次结果一样

**对比**：
| | POST | PUT | PATCH |
|---|---|---|---|
| 作用 | 新增 | 新增或整体替换 | 部分更新 |
| URL | /books | /books/123 | /books/123 |
| 没给的字段 | 无 | 被清空（null） | 保持不变 |
| 幂等 | 否 | 是 | 不一定 |

**常见陷阱**：
- ❌ 只想改书的出版年份，却用 PUT 只发了 {"year": "1925"}
- ✅ PUT 会整体替换，title 和 author 会被清空；只改部分字段应该用 PATCH
- ❌ 认为 PUT 只能更新、不能创建
- ✅ 课件：PUT 类似 hashMap.put()，资源不存在时会创建一个新的

**追问**：
- Q: 为什么 POST 创建资源时不需要 id，而 PUT 需要？
- A: POST 是把实体提交给一个集合（/books），由服务器决定新资源的 id；PUT 是把内容放到一个确定的位置（/books/123），客户端已经知道资源的地址

**代码题**：用 Map 模拟对 123 号书分别发 PATCH 和 PUT（请求体都是 {"year": "1925"}），输出什么？

```java
Map<String, String> book = new TreeMap<>(Map.of("title", "Gatsby", "author", "Fitzgerald"));
Map<String, String> payload = Map.of("year", "1925");

Map<String, String> patched = new TreeMap<>(book);
patched.putAll(payload);

Map<String, String> replaced = new TreeMap<>(payload);

System.out.println(patched.keySet() + " " + replaced.keySet());
```

- [x] [author, title, year] [year]
- [ ] [year] [author, title, year]
- [ ] [author, title, year] [author, title, year]
- [ ] [year] [year]

解析：PATCH 是部分更新：在原来的数据上只改（或加上）请求里给出的字段，title、author 保留，所以是 [author, title, year]；PUT 是整体替换：新的资源就是请求体本身，没给的 title、author 都没了，只剩 [year]。TreeMap 按 key 的字母顺序排列。

**判断题**：
- ✅ 用 PUT 更新资源时，请求体里没有给出的字段会被清空（替换成 null） —— 课件：PUT 是 FULL UPDATE，会替换整个资源
- ❌ 用 POST 新增一本书时，客户端必须在 URL 里指定这本书的 id —— 课件：POST 不需要指定 id，id 由服务器自动生成

### 幂等性

**概念**：幂等（Idempotency）：f(x) = f(f(x))，即操作做一次和做多次的结果相同；在 Web 应用里 f() 是 HTTP 方法，x 是服务器的状态，同一个请求发一次和发多次对服务器状态的影响相同，这个方法就是幂等的

**一句话**：GET、PUT、DELETE 是幂等的：PUT 发多少次 123 号书都是同样的内容，DELETE 删一次和删多次资源都不存在；POST 不幂等，提交多次会创建多个对象；PATCH 不一定幂等，比如 "loginCount": user.loginCount + 1 每发一次就加 1；幂等看的是服务器状态而不是响应，DELETE 第二次返回 404 也不影响它是幂等的。

**详细解释**：
Idempotency：f(x)=f(f(x)) ⇔ f() is idempotent。
In web application context：f() means an HTTP method；x means the server status。
HTTP Methods Idempotency：PUT is idempotent；POST is not idempotent，POST multiple times will create identical objects（更准确地说是内容相同、id 不同的多个对象）；PATCH is not necessarily idempotent，例如 "loginCount": user.loginCount + 1；GET, DELETE are also idempotent。
安全和幂等不同：安全（safe）指不改变服务器状态（GET、HEAD、OPTIONS），幂等指执行多次和执行一次效果相同；安全的方法一定幂等，幂等的方法不一定安全（PUT、DELETE 会改状态，但重复执行效果相同）。
为什么重要：网络超时后客户端不知道请求有没有成功，幂等的请求可以放心重试；POST 重试可能重复下单，需要额外去重，比如每个请求带一个唯一的请求 id，服务器记录已经处理过的 id。
PATCH 也可以是幂等的：比如 {"year": "1925"} 只是把字段设成固定值，发多次结果一样；只有"在原值基础上计算"的更新才不幂等。

**问题**：什么是幂等？哪些 HTTP 方法是幂等的？

**答案要点**：
1. 幂等：同一个请求执行一次和执行多次，对服务器状态的影响相同
2. GET、PUT、DELETE 是幂等的
3. POST 不幂等，重复提交会创建多个资源
4. PATCH 不一定幂等，比如计数加 1 的更新
5. 幂等看服务器状态而不是响应；幂等的请求可以放心重试

**对比**：
| 方法 | 幂等 | 安全（不改状态） |
|---|---|---|
| GET | 是 | 是 |
| PUT | 是 | 否 |
| DELETE | 是 | 否 |
| POST | 否 | 否 |
| PATCH | 不一定 | 否 |

**常见陷阱**：
- ❌ 认为 DELETE 第二次返回 404，和第一次的 200 不一样，所以 DELETE 不幂等
- ✅ 幂等看的是服务器状态：删一次和删多次，资源都不存在
- ❌ 认为幂等就是不修改服务器的数据
- ✅ 不修改数据叫安全（safe）；PUT、DELETE 会修改数据，但仍然是幂等的

**追问**：
- Q: 用户网络不好，连续点了两次"提交订单"，怎样避免创建两个订单？
- A: POST 本身不幂等，需要自己做幂等：比如页面生成一个唯一的请求 id（或订单号）随请求提交，服务器发现这个 id 已经处理过就直接返回之前的结果；也可以在数据库上加唯一约束

**代码题**：用 TreeMap 模拟书店，连发两次相同的 POST 和两次相同的 PUT，输出什么？

```java
Map<Integer, String> books = new TreeMap<>();
int[] nextId = {1};
Runnable post = () -> books.put(nextId[0]++, "Gatsby");   // POST /books：id 自动生成
Runnable put = () -> books.put(123, "Gatsby");            // PUT /books/123
post.run();
post.run();
put.run();
put.run();
System.out.println(books.size() + " " + books.keySet());
```

- [x] 3 [1, 2, 123]
- [ ] 2 [1, 123]
- [ ] 4 [1, 2, 123, 123]
- [ ] 4 [1, 2, 3, 4]

解析：POST 每次都由服务器生成新的 id，发两次就创建了 1 号、2 号两本内容相同的书，所以 POST 不幂等；PUT 指定了 id = 123，第二次只是用同样的内容覆盖，和发一次的效果一样，是幂等的。一共 3 本书。

**判断题**：
- ✅ PUT 和 DELETE 都是幂等的 —— 课件：PUT is idempotent，GET、DELETE are also idempotent
- ❌ 幂等是指同一个请求发送多次，每次得到的响应（包括状态码）都完全相同 —— 幂等看的是服务器状态，DELETE 第二次返回 404 仍然是幂等的

### URI 与 URL

**概念**：URI（Uniform Resource Identifier，统一资源标识符）是资源的通用标识；URL（Uniform Resource Locator，统一资源定位符）是一种特殊的 URI，还包含了怎样找到这个资源（协议、位置）；所有 URL 都是 URI，但不是所有 URI 都是 URL

**一句话**：URI 可以是名字、定位符或两者都是，URL 只是定位符；课件的比喻：你的名字是 URI 但不是 URL（能标识你，但没法靠它找到你），你的地址既是 URI 又是 URL；HTTP URL 由协议、主机名、端口号（可选）、路径组成，比如 https://example.com:8080/books/123，端口省略时 http 默认 80、https 默认 443。

**详细解释**：
URI (Uniform Resource Identifier)：a generic identifier for a resource。
URL (Uniform Resource Locator)：a specific type of URI that includes the means to locate the resource (i.e., how to access it, like http, ftp, etc.)；All URLs are URIs, but not all URIs are URLs。
URL must include：Scheme/protocol：http, https, ftp, etc.；Location：domain, port, path, etc.
For an HTTP URL：https://example.com:8080/books/123 → 1 Protocol name（https）、2 Host name（example.com）、3 Port number（8080，Optional）、4 Path（/books/123）。
URL VS. URI：URI can be a name, locator, or both for an online resource where a URL is just the locator；URLs are a subset of URIs；Your name could be a URI because it identifies you, but it couldn't be a URL because it doesn't help anyone find your location；your address is both a URI and a URL。
补充：URN（Uniform Resource Name）是只起名字的 URI，比如 urn:isbn:0451450523；完整的 URL 还可以有查询字符串（?id=123）和片段（#top）。
HTTP 请求行里的 /login 叫 Request URI，只是路径部分；在 Servlet 里，request.getRequestURI() 返回 /ServletDemo/login 这样的路径，request.getRequestURL() 返回带协议、主机、端口的完整地址。

**问题**：URI 和 URL 有什么区别？一个 HTTP URL 由哪几部分组成？

**答案要点**：
1. URI 是资源的通用标识符，URL 是能定位资源的 URI
2. 所有 URL 都是 URI，但 URI 不一定是 URL（比如 URN 只是名字）
3. URL 包含协议（scheme）和位置（域名、端口、路径）
4. HTTP URL：协议 + 主机名 + 端口（可选）+ 路径，还可以有查询字符串
5. 端口省略时 http 用 80，https 用 443

**对比**：
| | URI | URL |
|---|---|---|
| 全称 | Uniform Resource Identifier | Uniform Resource Locator |
| 作用 | 标识资源（名字、定位符或两者） | 定位资源（告诉你怎么访问） |
| 关系 | 范围更大 | URI 的子集 |
| 课件的比喻 | 你的名字 | 你的地址 |

**常见陷阱**：
- ❌ 认为 URI 是 URL 的一部分，或者两者是完全不相干的东西
- ✅ URL 是 URI 的子集：每个 URL 都是 URI
- ❌ 认为 URL 里必须写端口号
- ✅ 端口是可选的，省略时用协议的默认端口（http 80、https 443）

**追问**：
- Q: Servlet 里 request.getRequestURI() 和 request.getRequestURL() 有什么区别？
- A: getRequestURI() 返回路径部分，比如 /ServletDemo/login；getRequestURL() 返回完整地址，比如 http://localhost:8080/ServletDemo/login；两者都不包含查询字符串

**代码题**：用 java.net.URI 解析两个地址，输出什么？（多行用空格隔开）

```java
java.net.URI a = new java.net.URI("https://example.com:8080/books/123");
java.net.URI b = new java.net.URI("http://example.com/books?id=123");
System.out.println(a.getScheme() + " " + a.getHost() + " " + a.getPort() + " " + a.getPath());
System.out.println(b.getPort() + " " + b.getPath() + " " + b.getQuery());
```

- [x] https example.com 8080 /books/123 -1 /books id=123
- [ ] https example.com 8080 /books/123 80 /books id=123
- [ ] https example.com 8080 /books/123 -1 /books?id=123 id=123
- [ ] https example.com:8080 8080 /books/123 -1 /books id=123

解析：URI 按"协议://主机:端口/路径?查询"拆开：a 的协议是 https、主机 example.com（不含端口）、端口 8080、路径 /books/123。b 没写端口，getPort() 返回 -1，表示"URL 里没有指定端口"，并不会自动填成 80（80 是浏览器访问时使用的默认端口）；路径不包含 ? 后面的查询字符串，查询字符串由 getQuery() 单独返回。

**判断题**：
- ✅ 所有 URL 都是 URI，但不是所有 URI 都是 URL —— 课件：URLs are a subset of URIs
- ❌ URL 中的端口号不能省略 —— 课件：端口号是可选的，省略时 http 用 80、https 用 443
