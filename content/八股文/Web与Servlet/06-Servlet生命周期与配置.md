# Servlet生命周期与配置

### Servlet 生命周期：init、service、destroy

**概念**：Servlet 的生命周期是从创建到销毁的整个过程：调用 init() 初始化，调用 service() 处理客户端的请求，调用 destroy() 终止，最后被 JVM 的垃圾回收器（GC）回收

**一句话**：默认情况下，用户第一次请求某个 Servlet 对应的 URL 时，容器才创建它的实例并调用一次 init()（做加载配置、建立数据库连接这类一次性准备）；之后每个请求调用一次 service()；容器关闭或应用卸载时调用一次 destroy()（关闭连接、停止后台线程、把数据写到磁盘）；然后对象等待 GC 回收；设置 loadOnStartup 可以让 Servlet 在容器启动时就创建和初始化。

**详细解释**：
A servlet life cycle can be defined as the entire process from its creation till the destruction：The servlet is initialized by calling the init() method；The servlet calls service() method to process a client's request；The servlet is terminated by calling the destroy() method；Finally, servlet is garbage collected by the garbage collector (GC) of the JVM。
init()：Every Servlet class is responsible for some URL requests；when user first make request call to the URL corresponding to the servlet, an instance of this servlet will be generated；例如 UserLoginServlet will be initialized (init() called) when the first user tries to log in。
init() — Initialization：Called once when the servlet is first loaded；Used to perform one-time setup, like loading config data or initializing resources (e.g., database connections)；Executed before any request is handled。
destroy()：called only once at the end of the life cycle of a servlet；gives your servlet a chance to close database connections, halt background threads, write cookie lists or hit counts to disk, and perform other such cleanup activities；After the destroy() method is called, the servlet object is marked for garbage collection；destroy() defines the operations before GC。
补充：loadOnStartup（web.xml 里是 load-on-startup）为 0 或正数时，容器启动时就加载并 init，数字越小越先加载；不设置（默认 -1）就是第一次请求时才加载，所以第一个请求会慢一些。init() 抛出 ServletException 时，这个 Servlet 不会投入使用。destroy() 本身不释放内存，容器不再引用这个对象后，它才变成可以被 GC 回收的对象。
构造器和 init() 的区别：构造器由容器通过反射调用，这时还拿不到 ServletConfig（初始化参数）；init() 在构造之后调用，可以通过 getServletConfig() 读取配置，所以初始化逻辑放在 init() 里。

**问题**：说一下 Servlet 的生命周期。init()、service()、destroy() 分别在什么时候调用、调用几次？

**答案要点**：
1. 创建实例：默认在第一次请求时，设置 loadOnStartup 后在容器启动时
2. init()：创建后调用一次，在处理任何请求之前，做一次性初始化
3. service()：每个请求调用一次，由不同的线程调用
4. destroy()：容器关闭或应用卸载时调用一次，做清理工作
5. destroy() 之后对象等待被 GC 回收

**对比**：
| 方法 | 什么时候调用 | 调用次数 | 典型用途 |
|---|---|---|---|
| init() | 实例创建后、处理第一个请求前 | 1 次 | 加载配置、建立数据库连接 |
| service() | 每个请求到来时 | 每个请求 1 次 | 处理请求、生成响应 |
| destroy() | 容器关闭、应用卸载时 | 1 次 | 关闭连接、停止后台线程、保存数据 |

**常见陷阱**：
- ❌ 认为每个请求都会创建一个新的 Servlet 实例并调用 init()
- ✅ 实例只创建一次，init() 只调用一次，之后的请求都调用同一个实例的 service()
- ❌ 认为调用 destroy() 就立刻释放了 Servlet 对象的内存
- ✅ destroy() 只是做清理工作，之后对象才可以被 GC 回收，什么时候回收由 JVM 决定

**追问**：
- Q: 为什么要把建立数据库连接这类工作放在 init() 里，而不是放在 doGet() 里？
- A: init() 只执行一次，而且在处理任何请求之前；放在 doGet() 里每个请求都要重做一遍，浪费时间和资源（实际项目里一般用连接池，在 init 或应用启动时初始化）

**代码题**：下面用普通 Java 类模拟 Servlet 容器（默认懒加载），输出什么？

```java
class HelloServlet {
    HelloServlet() { System.out.print("new "); }
    void init() { System.out.print("init "); }
    void service(String method) { System.out.print(method + " "); }
    void destroy() { System.out.print("destroy "); }
}
class MiniContainer {
    private HelloServlet servlet;
    void handle(String method) {
        if (servlet == null) {
            servlet = new HelloServlet();
            servlet.init();
        }
        servlet.service(method);
    }
    void shutdown() {
        if (servlet != null) servlet.destroy();
    }
}
MiniContainer tomcat = new MiniContainer();
System.out.print("start ");
tomcat.handle("GET");
tomcat.handle("POST");
tomcat.handle("GET");
tomcat.shutdown();
```

- [x] start new init GET POST GET destroy
- [ ] start new init GET new init POST new init GET destroy
- [ ] new init start GET POST GET destroy
- [ ] start new init GET destroy new init POST destroy new init GET destroy

解析：这个容器和 Tomcat 的默认行为一样是懒加载：启动时什么都不创建，第一个请求到来时才 new 出实例并调用一次 init()；之后的请求复用同一个实例，只调用 service()；关闭容器时调用一次 destroy()。如果设置了 loadOnStartup，实例才会在容器启动时就创建。

**判断题**：
- ✅ 默认情况下，Servlet 在第一次被请求时才创建实例并调用 init()；设置 loadOnStartup 后可以在容器启动时就初始化 —— 课件：用户第一次请求对应 URL 时才生成实例；@WebServlet 有 loadOnStartup 字段
- ❌ 每来一个新请求，容器都会调用一次 init() —— 课件：init() 只在 Servlet 第一次加载时调用一次，之后的请求只调用 service()

### service() 与 doGet、doPost

**概念**：service() 负责处理请求：服务器每收到一个发给该 Servlet 的请求，就用一个线程调用它的 service()；HttpServlet 的 service() 会判断请求类型（GET、POST……），调用对应的 doGet()、doPost() 等方法，所以我们一般不改 service()，只按业务需要重写 doGet 或 doPost

**一句话**：继承 HttpServlet 后只重写需要的 doXxx 方法，比如登录用 @WebServlet("/login") 映射、重写 doPost 处理表单；service() 由容器调用，按请求方法分发；没有重写的 doXxx 有默认实现：只重写了 doPost 的话，用 GET 访问会得到 405 Method Not Allowed，不会自动转给 doPost；不支持的请求方法返回 501 Not Implemented。

**详细解释**：
service() — Request Handling：Each time the server receives a servlet request, server will generate a new thread and invoke the service() method（课件的说法；实际上 Tomcat 用线程池，从池里取一个已有的线程来调用，不是每次都新建线程）。
Service() method will detect request type (GET, POST...) and call corresponding method from the servlet (doGet(), doPost()...)。
The service method is invoked by the server. Then the service() method will invoke doGet, doPost or other methods based on request type. Thus, we do not need to make any changes to service() method. All we need is to override doGet or doPost method based on business requirement（课件写作 doGET、doPOST，方法名应为 doGet、doPost）。
This is where the core logic for processing requests and generating responses happens。
课件的代码：
```java
@WebServlet("/login")
public class UserLogInServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) {
        // 读取用户名、密码，写响应
    }
}
```
HttpServlet 里 doGet、doPost、doPut、doDelete 的默认实现会返回错误（HTTP/1.1 下是 405 Method Not Allowed）；service() 遇到不支持的请求方法返回 501 Not Implemented。
doGet、doPost 的完整签名：protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException。

**问题**：HttpServlet 的 service() 方法做了什么？为什么我们一般重写 doGet / doPost 而不是 service()？

**答案要点**：
1. 容器每收到一个请求，就用一个线程调用 Servlet 的 service()
2. HttpServlet 的 service() 根据请求方法分发到 doGet、doPost、doPut、doDelete 等
3. 我们只需重写需要支持的 doXxx 方法，service() 不用改
4. 没重写的 doXxx 默认返回 405 Method Not Allowed，不支持的方法返回 501
5. 重写 service() 会破坏这套分发机制，所有请求方法都走同一段代码

**对比**：
| 请求方法 | service() 调用 | 没有重写时的结果 |
|---|---|---|
| GET | doGet() | 405 Method Not Allowed |
| POST | doPost() | 405 Method Not Allowed |
| PUT | doPut() | 405 Method Not Allowed |
| DELETE | doDelete() | 405 Method Not Allowed |

**常见陷阱**：
- ❌ 只重写了 doPost，以为用 GET 访问也会交给 doPost 处理
- ✅ GET 会走 HttpServlet 默认的 doGet，返回 405；需要的话可以在 doGet 里调用 doPost
- ❌ 认为 service() 只在 Servlet 第一次被访问时调用一次
- ✅ 只调用一次的是 init()；service() 每个请求都会调用

**追问**：
- Q: 在浏览器地址栏直接输入一个只重写了 doPost 的 Servlet 的地址，会看到什么？
- A: 地址栏访问发的是 GET 请求，会走默认的 doGet，返回 405 Method Not Allowed

**代码题**：下面用普通 Java 类模拟 HttpServlet 的分发逻辑，输出什么？

```java
abstract class MyHttpServlet {
    void service(String method) {
        switch (method) {
            case "GET" -> doGet();
            case "POST" -> doPost();
            default -> System.out.print("501 ");
        }
    }
    void doGet() { System.out.print("405 "); }
    void doPost() { System.out.print("405 "); }
}
class LoginServlet extends MyHttpServlet {
    @Override
    void doPost() { System.out.print("login "); }
}
MyHttpServlet servlet = new LoginServlet();
servlet.service("POST");
servlet.service("GET");
```

- [x] login 405
- [ ] login login
- [ ] 405 405
- [ ] login

解析：service() 按请求方法分发：POST 调用 doPost，LoginServlet 重写了它，输出 login；GET 调用 doGet，LoginServlet 没有重写，用的是父类的默认实现，输出 405。真实的 HttpServlet 也是这样：没重写的 doGet 默认返回 405 Method Not Allowed，不会自动转给 doPost。

**判断题**：
- ✅ 继承 HttpServlet 时，一般只重写 doGet、doPost 等方法，不需要重写 service() —— 课件：service() 会根据请求类型调用 doGet、doPost，we do not need to make any changes to service() method
- ❌ 一个只重写了 doPost 的 Servlet 收到 GET 请求时，会自动交给 doPost 处理 —— GET 会调用 HttpServlet 默认的 doGet，返回 405 Method Not Allowed

### Servlet 的单实例多线程

**概念**：默认情况下，同一个 Servlet（同一个声明）在容器里只有一个实例：实例在第一次请求时创建一次，之后每个请求由一个单独的线程调用这个实例的 service()，所以多个请求会同时执行同一个对象的方法

**一句话**：Servlet 是单实例多线程的：成员变量（实例变量）被所有请求、所有线程共享，用来存请求相关的数据会互相覆盖，不是线程安全的；doGet / doPost 里的局部变量在每个线程自己的栈上，是线程安全的；所以 Servlet 最好设计成无状态的，请求数据放局部变量，真正需要共享的计数之类用 AtomicInteger 或小范围的 synchronized，不要给整个 doPost 加 synchronized，那样所有请求都要排队。

**详细解释**：
课件的两句话放在一起：when user first make request call to the URL corresponding to the servlet, an instance of this servlet will be generated；After started, each request will be handled by a separate thread, and call the corresponding method。
也就是：一个实例、多个线程，多个请求并发调用同一个对象的 service() → doGet / doPost。
线程从哪来：Tomcat 用线程池（默认最多 200 个工作线程）处理请求，请求结束后线程回到池里，不是每个请求都新建线程。
错误写法：
```java
public class UserLoginServlet extends HttpServlet {
    private String username;                       // 所有请求共享
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) {
        username = req.getParameter("username");   // 可能被另一个线程覆盖
    }
}
```
正确写法：String username = req.getParameter("username"); 写成局部变量，每个线程各有一份。
和 Java 多线程的关系：成员变量在堆上，被线程共享（会有线程干扰、内存可见性问题）；局部变量在线程私有的栈上。
Servlet 由容器保证默认只有一个实例，但它不是用 private 构造器实现的单例模式：构造器是 public 的，同一个类在 web.xml 里声明两次就会有两个实例。
老的 SingleThreadModel 接口试图让每个线程用一个实例，早已被废弃，不要用。

**问题**：Servlet 是线程安全的吗？在 Servlet 里应该怎样保存数据？

**答案要点**：
1. 默认一个 Servlet 只有一个实例，多个请求由多个线程同时调用它的 service()
2. 成员变量被所有线程共享，用来存请求相关的数据会出现线程安全问题
3. 局部变量在各个线程自己的栈上，是线程安全的，请求数据应放在局部变量里
4. 真正需要共享的状态用 AtomicInteger、ConcurrentHashMap 或小范围的 synchronized
5. 不要给整个 doGet / doPost 加 synchronized，会让所有请求串行，失去并发能力

**对比**：
| | 成员变量（实例变量） | 局部变量 |
|---|---|---|
| 存在哪 | 堆上的 Servlet 对象里 | 每个线程自己的栈上 |
| 是否被请求共享 | 所有请求、所有线程共享 | 每次调用各一份 |
| 线程安全 | 不安全（除非只读或做了同步） | 安全 |
| 适合放 | 只读的配置、线程安全的工具对象 | 请求参数、当前用户等请求数据 |

**常见陷阱**：
- ❌ 认为每个请求都有自己的 Servlet 对象，所以成员变量互不影响
- ✅ 默认只有一个实例，成员变量被所有并发请求共享
- ❌ 为了线程安全给整个 doPost 加 synchronized
- ✅ 所有请求都要排队，吞吐量大幅下降；应该改用局部变量，只对真正共享的数据做最小范围的同步

**追问**：
- Q: Servlet 由容器保证只有一个实例，它和 Java 里的单例模式一样吗？
- A: 不一样：单例模式靠 private 构造器和 getInstance() 从语言层面保证只有一个实例；Servlet 只是容器默认为每个 Servlet 声明创建一个实例，构造器是 public 的，同一个类在 web.xml 里声明两次就会有两个实例

**代码题**：下面用一个普通对象模拟"容器只创建一个 Servlet 实例，三个请求依次调用它"，输出什么？

```java
class CounterServlet {
    private int count = 0;
    void service(String user) {
        int local = 0;
        count++;
        local++;
        System.out.print(user + ":" + count + "/" + local + " ");
    }
}
CounterServlet servlet = new CounterServlet();
servlet.service("A");
servlet.service("B");
servlet.service("C");
```

- [x] A:1/1 B:2/1 C:3/1
- [ ] A:1/1 B:1/1 C:1/1
- [ ] A:1/1 B:2/2 C:3/3
- [ ] A:1/1 B:1/2 C:1/3

解析：三个请求用的是同一个对象，成员变量 count 被它们共享，依次变成 1、2、3；局部变量 local 每次调用 service() 都重新创建，永远是 1。这里是单线程依次调用，结果是确定的；真实的 Servlet 里多个线程会同时执行 count++，还会出现 Java 多线程里讲的线程干扰，结果就不确定了。

**判断题**：
- ✅ 默认情况下，一个 Servlet 在容器里只有一个实例，并发的请求由不同线程同时调用它的 service() —— 课件：实例在第一次请求时创建，each request will be handled by a separate thread
- ❌ Servlet 的成员变量是每个请求各自一份的，所以天然是线程安全的 —— 所有请求共享同一个实例的成员变量，要用局部变量或做同步

### web.xml 与 @WebServlet 配置

**概念**：Servlet 有两种配置方式：XML 配置（WEB-INF 下的 web.xml，多见于老系统和大型企业系统）和注解配置（@WebServlet，开发者更喜欢）；@WebServlet 是 jakarta.servlet.annotation（或 javax.servlet.annotation）包下的类级别注解，有 name、urlPatterns、value、loadOnStartup 等字段

**一句话**：web.xml 用 `<servlet>`（名字 + 类）和 `<servlet-mapping>`（名字 + URL）两段把类映射到 URL；Servlet 3.0 起可以直接在类上写 @WebServlet("/login") 或 @WebServlet(name = "myDemoServlet", urlPatterns = "/my-demo-servlet")，value 和 urlPatterns 二选一、至少写一个；注解本身不改变代码的运行，是容器启动时扫描、读取它来建立映射；访问地址是 http(s)://host:port/应用上下文路径/Servlet 映射路径。

**详细解释**：
Servlet Configuration - 2 Ways：XML Configuration - web.xml (in legacy and big enterprise systems)；Annotation configuration (developers prefer)。
课件的项目结构：src/main/java 下的 org.example.ServletDemo 包里有 HelloServlet、MyDemoServlet；配置文件在 src/main/webapp/WEB-INF/web.xml；页面是 src/main/webapp/index.html。
课件的注解例子：@WebServlet(name = "myDemoServlet", urlPatterns = "/my-demo-servlet") public class MyDemoServlet extends HttpServlet。
同样的配置用 web.xml 写：
```
<servlet>
    <servlet-name>myDemoServlet</servlet-name>
    <servlet-class>org.example.ServletDemo.MyDemoServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>myDemoServlet</servlet-name>
    <url-pattern>/my-demo-servlet</url-pattern>
</servlet-mapping>
```
Java Annotations：a form of metadata, provide data about a program that is not part of the program itself. Annotations have no direct effect on the operation of the code they annotate；can have some fields/elements (key-value pairs)，e.g. @Author(name = "Jane Doe")；have multiple purposes, can be added to class/method/variable。
@WebServlet：An annotation under package jakarta.servlet.annotation or javax.servlet.annotation；Class-level annotation；Has some optional fields: name, urlPatterns, value, loadOnStartup, ...（其实 value 和 urlPatterns 至少要写一个，且不能同时使用；只写 URL 时可以省略字段名：@WebServlet("/login")）。
How to access a servlet：http(s)://<host>:<port>/<application-context>/<servlet-mapping>，比如 http://localhost:8080/ServletDemo/my-demo-servlet（课件写作 <host: port>）。
补充：注解是 Servlet 3.0 引入的；web.xml 和注解同时配置同一个 Servlet 时以 web.xml 为准；WEB-INF 下的文件浏览器不能直接访问；url-pattern 有精确匹配（/login）、前缀匹配（/api/*）、扩展名匹配（*.do）和默认 Servlet（/）。

**问题**：Servlet 有哪几种配置方式？@WebServlet 有哪些常用属性？配置好之后怎么访问？

**答案要点**：
1. 两种方式：web.xml（XML 配置，放在 WEB-INF 下）和 @WebServlet 注解（Servlet 3.0 起）
2. web.xml 用 `<servlet>` 定义名字和类，用 `<servlet-mapping>` 把名字映射到 URL
3. @WebServlet 是类级别注解，常用 name、value / urlPatterns、loadOnStartup
4. 注解本身不改变代码行为，由容器启动时扫描读取，建立 URL 到 Servlet 的映射
5. 访问地址：http(s)://host:port/应用上下文路径/Servlet 映射路径

**对比**：
| | web.xml | @WebServlet |
|---|---|---|
| 写在哪 | WEB-INF/web.xml | Servlet 类上 |
| 从哪个版本开始 | 一直都有 | Servlet 3.0 |
| 优点 | 配置集中，改映射不用改代码 | 简单直观，配置和代码在一起 |
| 适用 | 老系统、大型企业系统 | 新项目，开发者更喜欢 |
| 同时配置同一个 Servlet | 以它为准 | 被 web.xml 覆盖 |

**常见陷阱**：
- ❌ 把 @WebServlet 加在 doGet 方法上
- ✅ @WebServlet 是类级别注解，要加在继承了 HttpServlet 的类上
- ❌ 访问时漏掉应用的上下文路径，直接访问 http://localhost:8080/my-demo-servlet
- ✅ 完整地址是 http://localhost:8080/ServletDemo/my-demo-servlet，上下文路径一般是应用部署的名字（部署成 ROOT 时才为空）

**追问**：
- Q: 注解"对代码的运行没有直接影响"，那 @WebServlet 是怎么起作用的？
- A: 注解只是元数据；Tomcat 启动时扫描应用里的类，通过反射读到 @WebServlet，再根据里面的 urlPatterns 等信息注册 Servlet、建立 URL 映射（所以它的保留策略是 RUNTIME）

**判断题**：
- ✅ @WebServlet 是类级别的注解，可以用 urlPatterns 或 value 指定 Servlet 映射的 URL —— 课件：Class-level annotation，有 name、urlPatterns、value、loadOnStartup 等字段
- ❌ Java 注解会直接改变被注解代码的运行逻辑，不需要任何程序去读取 —— 课件：Annotations have no direct effect on the operation of the code they annotate，要由编译器或容器读取才起作用
