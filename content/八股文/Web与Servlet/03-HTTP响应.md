# HTTP响应

### HTTP 响应的结构

**概念**：和请求一样，HTTP 响应也由三部分组成：状态行（Status Line）、0 个或多个响应头（Response Headers）、可选的响应体（Response Body）；状态行包括协议版本、状态码和原因短语

**一句话**：比如 HTTP/1.1 200 OK 是状态行（协议 HTTP/1.1、状态码 200、原因短语 OK）；状态行之后、响应体之前的行都是响应头，比如 Content-Type、Content-Length，响应几乎总会带头；响应体放客户端请求的资源数据（HTML、JSON、图片），是可选的，204、304 和 HEAD 请求的响应就没有响应体。

**详细解释**：
Just like HTTP Request, An HTTP Response contains the following parts：Status Line；0 or more Response Headers；A Response Body (optional)（课件 Response Header 和 Response Body 两页把这句写成了 "An HTTP Request contains"，应为 Response）。
课件的例子：
```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 47

{
  "message": "Login successful",
  "token": "abc123xyz"
}
```
Status Line：HTTP Protocol Version；Status Code & Reason Phrase，e.g. 200 OK。
Response Header：Just like a Request, HTTP Response also contains zero or more Header lines. However, it is very uncommon to have zero Headers in the response；Lines just after the Status Line and before the Response Body are all Response Headers lines。
Response Body：contains the resource data that was requested by the client。
常见响应头：Content-Type（响应体格式，如 text/html、application/json）、Content-Length（响应体字节数）、Location（重定向地址）、Set-Cookie（让浏览器保存 Cookie）。
在 Servlet 里：response.setStatus(201) 设置状态码，response.setContentType("application/json") 设置 Content-Type，response.getWriter().write(...) 写响应体。

**问题**：一个 HTTP 响应由哪几部分组成？和请求有什么区别？

**答案要点**：
1. 状态行：协议版本 + 状态码 + 原因短语，比如 HTTP/1.1 200 OK
2. 响应头：0 个或多个，但实际上几乎总有，比如 Content-Type、Content-Length
3. 响应头和响应体之间有一个空行
4. 响应体可选，放请求的资源数据（HTML、JSON、图片等）
5. 和请求的区别：请求第一行是请求行（方法 + URI + 版本），响应第一行是状态行（版本 + 状态码 + 短语）

**对比**：
| | 请求 | 响应 |
|---|---|---|
| 第一行 | 请求行：POST /login HTTP/1.1 | 状态行：HTTP/1.1 200 OK |
| 头部 | 请求头（Host、Content-Type 等） | 响应头（Content-Type、Set-Cookie 等） |
| 主体 | 请求体，可选 | 响应体，可选 |
| 方向 | 客户端 → 服务器 | 服务器 → 客户端 |

**常见陷阱**：
- ❌ 认为状态行里也会写请求方法，比如 HTTP/1.1 POST 200
- ✅ 状态行只有协议版本、状态码和原因短语；请求方法只出现在请求行里
- ❌ 认为每个响应都有响应体
- ✅ 响应体是可选的：204 No Content、304 Not Modified、HEAD 请求的响应都没有响应体

**追问**：
- Q: 浏览器怎么知道响应体是 HTML 页面还是 JSON 数据？
- A: 看响应头 Content-Type：text/html 就按网页渲染，application/json 就当作数据处理；在 Servlet 里用 response.setContentType(...) 设置

**判断题**：
- ✅ HTTP 响应的状态行由协议版本、状态码和原因短语组成，比如 HTTP/1.1 200 OK —— 课件：Status Line 包括 HTTP Protocol Version 和 Status Code & Reason Phrase
- ❌ HTTP 响应必须包含响应体 —— 课件：响应体是可选的，比如 204 No Content 就没有响应体

### HTTP 状态码

**概念**：HTTP 状态码分为五类：1xx 信息（请求已收到，继续处理）、2xx 成功（请求被成功接收、理解和接受）、3xx 重定向（需要进一步操作才能完成请求）、4xx 客户端错误（请求有语法错误或无法被满足）、5xx 服务器错误（服务器没能处理一个看起来有效的请求）

**一句话**：常见的有 200 OK、201 Created、202 Accepted；301 / 302 重定向、304 Not Modified；400 Bad Request（参数不对）、401 没登录、403 没权限、404 Not Found、405 方法不允许；500 Internal Server Error（比如后端 Java 程序抛了没处理的异常）、502 网关错误、503 服务不可用；分 4xx 还是 5xx 的关键是：错在客户端的请求，还是错在服务器。

**详细解释**：
There are five categories of status code：
1xx Informational - the request was received, continuing process。
2xx Successful - the request was successfully received, understood and accepted：200 OK, 201 Created, 202 Accepted。
3xx Redirection - further action needs to be taken to complete the request。
4xx Client Error - the request contains bad syntax or cannot be fulfilled：400 Bad Request, 404 Not Found。
5xx Server Error - the server failed to fulfill an apparently valid request：500 Internal Server Error (e.g., backend java program has an exception)。
参考：MDN 的 HTTP response status codes 文档；课件把 1xx 和 3xx 显示成灰色，重点是 2xx、4xx、5xx。
补充：201 Created 常用于 POST 创建成功；202 Accepted 表示已接受但还没处理完（异步任务）；204 No Content 表示成功但没有响应体；301 永久重定向、302 临时重定向（响应头 Location 给出新地址）；304 表示资源没变，用浏览器缓存；401 Unauthorized 是没认证（没登录），403 Forbidden 是认证了但没权限；405 Method Not Allowed 是这个 URL 不支持该请求方法；502 Bad Gateway 是网关（比如 Nginx）收到上游服务器的无效响应；503 Service Unavailable 是服务器暂时不可用。
在 Servlet 里：doGet 里抛出没有处理的异常时，Tomcat 会返回 500 错误页；response.sendError(404) 可以主动返回错误状态码。

**问题**：HTTP 状态码分几类？说几个常见的状态码。

**答案要点**：
1. 五类：1xx 信息、2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务器错误
2. 2xx：200 OK、201 Created、202 Accepted、204 No Content
3. 3xx：301 永久重定向、302 临时重定向、304 Not Modified
4. 4xx：400 Bad Request、401 未认证、403 无权限、404 Not Found、405 方法不允许
5. 5xx：500 服务器内部错误（后端抛异常）、502 Bad Gateway、503 Service Unavailable

**对比**：
| 状态码 | 含义 | 谁的问题 |
|---|---|---|
| 400 Bad Request | 请求格式或参数不对 | 客户端 |
| 401 Unauthorized | 没登录（未认证） | 客户端 |
| 403 Forbidden | 登录了但没权限 | 客户端 |
| 404 Not Found | 资源不存在 | 客户端 |
| 500 Internal Server Error | 服务器程序出错，比如抛了异常 | 服务器 |

**常见陷阱**：
- ❌ 把 401 和 403 混用
- ✅ 401 是还没证明你是谁（没登录或 token 失效），403 是知道你是谁、但你没有权限
- ❌ 认为 404 表示服务器宕机了
- ✅ 404 是服务器正常工作、但找不到请求的资源（比如路径写错）；服务器暂时不可用一般是 503，或者根本连不上

**追问**：
- Q: 访问一个 Servlet 返回 404，可能是什么原因？
- A: URL 和 Servlet 的映射对不上：路径或上下文路径（context path）写错、@WebServlet 的 urlPatterns 和访问地址不一致、应用没有部署成功等

**代码题**：下面用普通 Java 模拟容器根据 doGet 的执行结果设置状态码，输出什么？

```java
class MiniContainer {
    static int handle(Runnable doGet) {
        try {
            doGet.run();
            return 200;
        } catch (IllegalArgumentException e) {
            return 400;
        } catch (RuntimeException e) {
            return 500;
        }
    }
}
System.out.print(MiniContainer.handle(() -> {}) + " ");
System.out.print(MiniContainer.handle(() -> { throw new IllegalArgumentException("bad id"); }) + " ");
System.out.print(MiniContainer.handle(() -> { String s = null; s.length(); }));
```

- [x] 200 400 500
- [ ] 200 500 500
- [ ] 200 400 400
- [ ] 抛出 NullPointerException

解析：第一个 doGet 正常结束，返回 200；第二个抛出 IllegalArgumentException，被第一个 catch 捕获，模拟"请求参数不对"，返回 400（客户端错误）；第三个抛出 NullPointerException，它不是 IllegalArgumentException，被 catch (RuntimeException e) 捕获，返回 500。真实的 Tomcat 也是这样：Servlet 抛出没有处理的异常时，容器返回 500 Internal Server Error，也就是课件说的 "backend java program has an exception"。

**判断题**：
- ✅ 404 Not Found 属于 4xx 客户端错误 —— 课件：4xx Client Error 包括 400 Bad Request、404 Not Found
- ❌ 后端 Java 程序处理请求时抛出未处理的异常，服务器一般返回 404 —— 应该是 500 Internal Server Error，属于 5xx 服务器错误
