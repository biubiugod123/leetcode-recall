# JVM与线程基础

### Java 程序的执行与 JVM、JRE、JDK

**概念**：Java 源代码先被编译成平台无关的字节码，再由 JVM 解释执行或 JIT 编译成本地机器码；JDK 是开发工具包，JRE 是运行环境，JVM 是执行字节码的虚拟机

**一句话**：.java 经 javac 编译成 .class 字节码，字节码能在任何平台的 JVM 上运行（Write once, run anywhere）；JDK = JRE + 编译器、调试器等开发工具，JRE = JVM + 类库；只运行程序装 JRE 就够，开发要装 JDK；线程和进程也由 JVM 管理。

**详细解释**：
执行流程：写 Java 源代码（.java）→ Java Compiler 编译成字节码（.class）→ 字节码平台无关，可以在任何 JVM 上运行 → JVM 把字节码翻译成本机的机器码：逐行解释（interprets line-by-line）或 JIT（just-in-time）编译。
同一个 HelloWorld.class 可以在 Windows JVM、macOS JVM、Android 的 ART / Dalvik 上运行。
JVM：抽象概念、平台无关、一台"计算机器"、运行 bytecode。
JRE：JVM 的实现 + 类库（net、I/O 等）+ 其他文件。
JDK：给开发者的工具包 = JRE + 开发工具（编译器、调试器等）。
JIT 会把热点代码编译成机器码缓存起来，所以 Java 程序预热后会越跑越快。JDK 11 起官方不再单独发布 JRE。

**问题**：JDK、JRE、JVM 有什么区别？Java 为什么能跨平台？

**答案要点**：
1. JVM 执行字节码，是平台无关的虚拟机
2. JRE = JVM + 类库，用来运行 Java 程序
3. JDK = JRE + 开发工具（javac、调试器等），用来开发
4. 源代码编译成平台无关的字节码，各平台用自己的 JVM 运行
5. JVM 通过解释执行或 JIT 编译把字节码变成机器码

**对比**：
| | JVM | JRE | JDK |
|---|---|---|---|
| 是什么 | 运行字节码的虚拟机 | 运行环境 | 开发工具包 |
| 组成 | — | JVM + 类库 | JRE + 编译器、调试器等 |
| 谁需要 | — | 只运行 Java 程序的人 | Java 开发者 |

**常见陷阱**：
- ❌ 认为 Java 跨平台是因为 JVM 本身跨平台
- ✅ 跨平台的是字节码；JVM 恰恰是每个平台各自实现的
- ❌ 认为 Java 只是解释执行的语言
- ✅ JVM 会用 JIT 把热点代码编译成本地机器码

**追问**：
- Q: JIT 编译和解释执行有什么区别？
- A: 解释执行逐行把字节码翻译成机器码，启动快但执行慢；JIT 把频繁执行的热点代码整体编译成机器码并缓存，执行快但需要预热

**判断题**：
- ✅ JDK 包含 JRE，JRE 包含 JVM —— JDK = JRE + 开发工具，JRE = JVM + 类库
- ❌ .class 字节码文件只能在编译它的那个操作系统上运行 —— 字节码平台无关，任何平台的 JVM 都能运行

### 进程与线程

**概念**：进程是运行中的程序，拥有独立的内存空间；线程是进程中最小的执行单元，是轻量级的子进程，同一进程的多个线程共享进程的内存

**一句话**：一个进程至少有一个线程；进程之间内存隔离，一个崩溃不影响别的进程；线程之间共享代码、堆、static 变量和打开的文件，通信方便但需要同步，每个线程有自己的栈和寄存器（程序计数器）；线程创建和切换的开销比进程小得多。

**详细解释**：
Process：A process is a program in execution；Self-Contained Execution Environment（拥有独立运行所需的一切）；Private memory space；Isolated: One process won't affect others if it fails。
Thread：the smallest unit of processing, a lightweight sub-process；One process has >= 1 thread(s)；Each thread has a separate path of execution（一个线程里发生异常，不影响其他线程）；Threads in the same process share the code, data (static variables, heap data, files)，通信容易但需要小心同步。
课件的图：单线程进程里 code、data、files、registers、stack 各一份；多线程进程里 code、data、files 共享，每个线程有自己的 registers 和 stack。
这和"栈线程私有、堆线程共享"是同一个道理。

**问题**：进程和线程有什么区别？

**答案要点**：
1. 进程是运行中的程序，线程是进程里最小的执行单元
2. 一个进程至少有一个线程
3. 进程有独立内存，互相隔离；线程共享进程的堆、static 变量、文件
4. 每个线程有自己的栈和寄存器（程序计数器）
5. 线程更轻量，创建和切换开销小，但共享数据需要同步

**对比**：
| | 进程 | 线程 |
|---|---|---|
| 定义 | 运行中的程序 | 进程中最小的执行单元 |
| 内存 | 独立地址空间 | 共享进程的堆、static、文件 |
| 私有部分 | 整个地址空间 | 栈、寄存器 |
| 开销 | 创建、切换开销大 | 轻量 |
| 故障影响 | 一个崩溃不影响其他进程 | 共享内存，可能互相影响数据 |
| 通信 | IPC（管道、socket 等） | 直接读写共享变量 |

**常见陷阱**：
- ❌ 认为同一进程里的线程各有各的堆
- ✅ 堆和 static 变量是共享的，只有栈和寄存器是线程私有的
- ❌ 认为线程越多程序一定越快
- ✅ 线程切换有开销，CPU 核数有限；计算密集型任务线程数一般接近核数

**追问**：
- Q: 一个线程抛出未捕获的异常，会让整个 Java 程序退出吗？
- A: 不会，只有这个线程终止；只有所有非守护线程都结束后 JVM 才退出

**代码题**：下面代码输出什么？

```java
int[] shared = {0};
Thread t = new Thread(() -> shared[0] = 42);
t.start();
t.join();
System.out.println(shared[0] + " " + Thread.currentThread().getName());
```

- [x] 42 main
- [ ] 0 main
- [ ] 42 Thread-0
- [ ] 0 Thread-0

解析：数组对象在堆上，被两个线程共享；子线程修改后，main 用 join 等它结束再读，能看到 42；打印语句在 main 线程里执行，所以线程名是 main。

**判断题**：
- ✅ 同一个进程中的线程共享堆内存 —— 每个线程只有自己的栈和寄存器
- ❌ 一个进程只能有一个线程 —— 一个进程可以有一个或多个线程
