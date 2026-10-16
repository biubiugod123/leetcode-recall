# Servlet与容器

### Servlet 与 javax、jakarta

**概念**：Servlet 是 Web 应用里用来处理 HTTP 请求和响应的 Java 类；javax.servlet.Servlet 是一个 Java 接口，规定了 Servlet 初始化时、销毁时、收到请求时要做什么；javax 和 jakarta 都是 Java EE（企业版）的包名，Java EE 8 用 javax，Jakarta EE 9 起改成 jakarta

**一句话**：Servlet 是运行在 Servlet 容器（如 Tomcat）里、处理请求并生成响应的 Java 类；Servlet 接口定义了 init()、service()、destroy() 等方法，GenericServlet 是和协议无关的抽象实现，我们一般继承 HttpServlet 并重写 doGet / doPost；Java EE 交给 Eclipse 基金会后改名 Jakarta EE，Jakarta EE 9 把包名从 javax.servlet 改成 jakarta.servlet，所以 Tomcat 9 用 javax，Tomcat 10 起用 jakarta。

**详细解释**：
We are using Java programs to handle HTTP requests and responses；Servlet is a java class to do that job in a web application。
javax.servlet.Servlet：a Java Interface providing standards for processing HTTP requests：what should you do when initialized；what should you do when destroyed；what should you do when receiving request。
javax, jakarta：Java EE (Enterprise Edition) package, contains set of functional modules used to build enterprise-level Java applications；Java EE 8 uses javax, Java EE 9 renamed most of the functionalities to jakarta（准确说法是 Jakarta EE 9：Java EE 8 之后 Oracle 把它交给 Eclipse 基金会，改名 Jakarta EE；Jakarta EE 8 仍然是 javax，Jakarta EE 9 才把包名改为 jakarta）。
Servlet 接口的方法：init(ServletConfig)、service(ServletRequest, ServletResponse)、destroy()、getServletConfig()、getServletInfo()。
继承关系：Servlet（接口）→ GenericServlet（抽象类，和协议无关）→ HttpServlet（抽象类，处理 HTTP，提供 doGet、doPost、doPut、doDelete 等）→ 自己写的 Servlet。
严格说 Servlet 接口本身和协议无关，处理 HTTP 的是 HttpServlet：service() 的参数是 ServletRequest / ServletResponse，HttpServlet 把它们转成 HttpServletRequest / HttpServletResponse 再分发。
版本要对应：用 javax.servlet 写的代码部署到 Tomcat 9 及以前，用 jakarta.servlet 写的代码部署到 Tomcat 10 及以后；Spring Boot 3 也已经换成了 jakarta。

**问题**：什么是 Servlet？javax.servlet 和 jakarta.servlet 有什么关系？

**答案要点**：
1. Servlet 是在服务器端处理 HTTP 请求、生成响应的 Java 类
2. Servlet 接口规定了 init（初始化）、service（处理请求）、destroy（销毁）等方法
3. 一般继承 HttpServlet，重写 doGet、doPost，而不是直接实现 Servlet 接口
4. Java EE 8（以及 Jakarta EE 8）用 javax.servlet，Jakarta EE 9 起改名为 jakarta.servlet
5. 包名要和容器版本对应：Tomcat 9 用 javax，Tomcat 10 起用 jakarta

**对比**：
| | javax.servlet | jakarta.servlet |
|---|---|---|
| 平台版本 | Java EE 8 / Jakarta EE 8 及以前 | Jakarta EE 9 及以后 |
| Tomcat 版本 | Tomcat 9 及以前 | Tomcat 10 及以后 |
| Spring Boot | 2.x | 3.x |

**常见陷阱**：
- ❌ 认为 Java EE 改名 Jakarta EE 的第一个版本（Jakarta EE 8）就已经改用 jakarta 包名
- ✅ Jakarta EE 8 仍然用 javax，Jakarta EE 9 才改成 jakarta（课件写的 "Java EE 9" 应为 Jakarta EE 9）
- ❌ 把用 javax.servlet 写的项目原样部署到 Tomcat 10
- ✅ Tomcat 10 只认 jakarta.servlet，要改 import（或用官方迁移工具转换），或者换回 Tomcat 9

**追问**：
- Q: 为什么一般继承 HttpServlet，而不是直接实现 Servlet 接口？
- A: 直接实现接口要写全部 5 个方法，还要自己判断请求方法；HttpServlet 已经实现好了 service()，会按 GET、POST 等分发到 doGet、doPost，我们只需重写需要的方法

**判断题**：
- ✅ javax.servlet.Servlet 是一个接口，规定了 Servlet 初始化、处理请求和销毁时要做的事 —— 课件：a Java Interface providing standards，对应 init、service、destroy
- ❌ Java EE 8 的 Servlet API 包名是 jakarta.servlet —— 课件：Java EE 8 uses javax，Jakarta EE 9 起才改为 jakarta

### Servlet 容器与 Tomcat

**概念**：Servlet 容器（Servlet Container，也叫 Web 容器）是 Web 服务器中和 Java Servlet 交互的组件，负责管理 Servlet 的生命周期，并把 URL 映射到对应的 Servlet；常见的有 Apache Tomcat、JBoss、IBM WebSphere

**一句话**：Servlet 没有 main 方法，由容器创建和调用：容器监听端口、接收 HTTP 请求，把请求报文解析成 HttpServletRequest 对象、准备好 HttpServletResponse，根据 URL 找到对应的 Servlet，用线程池里的线程调用它的 service()，再把 response 组装成 HTTP 响应发回去；它还负责 Servlet 的创建、init 和 destroy；Tomcat 是最常用的开源 Servlet 容器。

**详细解释**：
Servlet container (also known as a web container) is the component of a web server that interacts with Java servlets。
A servlet container is responsible for managing the lifecycle of servlets, mapping a URL to a particular servlet。
课件的图：Web Browser ⇄（HTTP request / HTTP response）⇄ Web Server ⇄（HTTP request / HTTP response）⇄ Servlet Container（里面有多个 Servlet，Servlet 再访问 Database）。
Common Web Containers：Apache Tomcat (for java)；JBoss (commercial)；IBM WebSphere (commercial)；...
补充：JBoss 的社区版（现名 WildFly）是开源免费的，收费的是 Red Hat 的 JBoss EAP；JBoss、WebSphere 是完整的 Java EE 应用服务器，比单纯的 Servlet 容器多了 EJB、JMS 等功能，Tomcat 只实现了 Servlet、JSP 等 Web 相关规范。
容器做的事：网络通信（监听端口、解析 HTTP 报文）→ 把请求封装成 HttpServletRequest、HttpServletResponse 对象 → 按 URL 映射找到 Servlet → 管理生命周期（创建实例、调用 init、为每个请求调用 service、关闭时调用 destroy）→ 多线程（用线程池并发处理请求）。
Tomcat 默认的 HTTP 端口是 8080；它自带 HTTP 连接器，既是 Servlet 容器，也能直接当 Web 服务器用。

**问题**：什么是 Servlet 容器？它负责哪些工作？

**答案要点**：
1. Servlet 容器是 Web 服务器中运行和管理 Servlet 的组件，比如 Tomcat
2. 负责管理 Servlet 的生命周期：创建实例，调用 init、service、destroy
3. 负责把 URL 映射到对应的 Servlet
4. 负责把 HTTP 报文封装成 request、response 对象，处理完再转成 HTTP 响应
5. 用线程池并发处理多个请求；Servlet 没有 main 方法，完全由容器调用

**对比**：
| | Tomcat | JBoss / WildFly、WebSphere |
|---|---|---|
| 类型 | Servlet 容器（Web 容器） | 完整的 Java EE 应用服务器 |
| 支持的规范 | Servlet、JSP 等 Web 规范 | Web 规范 + EJB、JMS 等 |
| 收费 | 开源免费 | WildFly 开源；JBoss EAP、WebSphere 是商业产品 |

**常见陷阱**：
- ❌ 认为 Servlet 对象是开发者自己 new 出来、再交给容器的
- ✅ 开发者只写类和配置，Servlet 实例由容器创建、调用和销毁
- ❌ 认为 Servlet 像普通 Java 程序一样从 main 方法开始运行
- ✅ Servlet 没有 main 方法，入口是容器调用的 init()、service() 等方法

**追问**：
- Q: Tomcat 收到一个 HTTP 请求后，怎么知道交给哪个 Servlet？
- A: 先按请求路径里的上下文路径（context path）找到对应的 Web 应用，再用剩下的路径去匹配这个应用里 web.xml 或 @WebServlet 配置的 url-pattern，找到对应的 Servlet

**判断题**：
- ✅ Servlet 容器负责管理 Servlet 的生命周期，并把 URL 映射到对应的 Servlet —— 课件：responsible for managing the lifecycle of servlets, mapping a URL to a particular servlet
- ❌ Servlet 和普通 Java 程序一样，需要写 main 方法，由开发者启动 —— Servlet 没有 main 方法，由 Servlet 容器（比如 Tomcat）创建和调用
