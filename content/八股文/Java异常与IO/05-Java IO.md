# Java IO

### I/O 流的概念：字节流与字符流

**概念**：Java I/O 用"流（stream）"来读写数据：输入流连接数据源，输出流连接数据目的地；按处理单位分为字节流（8 bit）和字符流（16 bit，UTF-16）

**一句话**：Input / Output 是相对 Java 程序说的，数据流进程序是输入，流出程序是输出；流没有下标，一般只能顺序读写；字节流是 InputStream / OutputStream，处理二进制数据（图片、音频、序列化对象）；字符流是 Reader / Writer，处理文本，涉及字符编码；InputStreamReader / OutputStreamWriter 是把字节流转成字符流的桥梁。

**详细解释**：
Java I/O is used to process the input and produce the output (read and write data)；Input refers to data coming into the program (user, file, network)；Output refers to data going out from the program (file, console, network)；java.io 包含所有输入输出需要的类。
Streams：A stream is a conceptually endless flow of data；"Input" Stream: connected to a data source；"Output" Stream: connected to a data destination；Stream does not have concept of an index, nor can we typically move forward and backward。
Different types：1 byte = 8 bits，1 character = 16 bits（Java 使用 UTF-16）。
Byte Stream：xxxInputStream、xxxOutputStream，用于字节和二进制对象。
Character Stream：使用 Unicode，可以国际化，用于字符和字符串；命名是 xxxReader、xxxWriter（课件写成 xxxInputStreamReader / xxxOutputStreamWriter，那其实是桥接类的名字）。
同一段文字在不同编码下字节数不同：UTF-8 里英文 1 字节、常用汉字 3 字节，所以读写文本要用字符流并指定编码。
注意：java.io 的 I/O 流和 Java 8 的 Stream API 是两个不同的概念。

**问题**：Java 的字节流和字符流有什么区别？分别什么时候用？

**答案要点**：
1. I/O 相对于程序：输入流读数据源，输出流写目的地
2. 字节流：InputStream / OutputStream，以 8 位字节为单位，处理二进制数据
3. 字符流：Reader / Writer，以 16 位字符为单位，处理文本，涉及编码
4. InputStreamReader / OutputStreamWriter 把字节流转换成字符流，可以指定字符集
5. 流没有下标，一般只能顺序读写

**对比**：
| | 字节流 | 字符流 |
|---|---|---|
| 父类 | InputStream / OutputStream | Reader / Writer |
| 单位 | byte（8 位） | char（16 位） |
| 适用 | 图片、音频、序列化对象等二进制数据 | 文本 |
| 例子 | FileInputStream、BufferedOutputStream | FileReader、BufferedWriter |

**常见陷阱**：
- ❌ 用字节流逐字节读中文文本，再转成 char
- ✅ 一个汉字在 UTF-8 里占多个字节，会出现乱码，文本应该用字符流并指定编码
- ❌ 把 java.io 的 InputStream 和 Java 8 的 Stream API 混为一谈
- ✅ 前者读写字节，后者是处理集合数据的流水线

**追问**：
- Q: 怎么把一个 InputStream 按 UTF-8 读成文本？
- A: new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8))，再用 readLine() 逐行读

**代码题**：下面代码输出什么？

```java
String s = "a中";
System.out.println(s.length() + " " + s.getBytes(java.nio.charset.StandardCharsets.UTF_8).length);
```

- [x] 2 4
- [ ] 2 2
- [ ] 4 4
- [ ] 2 3

解析：length() 统计的是 char 个数，"a" 和 "中" 各一个，共 2；按 UTF-8 编码时 "a" 占 1 字节、"中" 占 3 字节，共 4 字节。这就是文本要用字符流并注意编码的原因。

**代码题**：下面代码输出什么？

```java
InputStream in = new ByteArrayInputStream(new byte[]{65, 66});
System.out.println(in.read() + " " + in.read() + " " + in.read());
```

- [x] 65 66 -1
- [ ] 1 1 0
- [ ] A B -1
- [ ] 65 66 0

解析：read() 每次返回读到的那个字节的值（0~255），读到末尾返回 -1；返回"实际读到的字节数"的是 read(byte[] b)。

**判断题**：
- ✅ 字符流使用 Unicode，适合处理需要国际化的文本 —— Java 的 char 是 16 位 UTF-16
- ❌ 字节流适合读写文本，字符流适合读写图片 —— 反过来：字节流处理二进制数据，字符流处理文本

### InputStream、OutputStream 与缓冲流

**概念**：InputStream 和 OutputStream 是字节输入、输出流的抽象父类；缓冲流（BufferedInputStream / BufferedOutputStream）包装基础流，用一块内存缓冲区减少直接读写次数

**一句话**：InputStream 用 read() / read(byte[]) 读，到末尾返回 -1；OutputStream 用 write() / write(byte[]) 写，flush() 把缓冲区数据强制写到目的地，close() 关闭流（会先 flush）；缓冲流默认缓冲区 8 KB，写入的数据先放在缓冲区里，没 flush 或 close 之前目的地可能看不到。

**详细解释**：
InputStream：an abstract class，子类 FileInputStream、FilterInputStream ...；read() 读一个字节；read(byte[] b) 读到字节数组里，返回实际读到的字节数；读到 EOF 返回 -1；close() 关闭输入流。
OutputStream：an abstract class，子类 FileOutputStream、PrintStream ...；write() 写一个字节；write(byte[] b) 写出所有字节；close() 关闭；flush() 强制把缓冲的数据真正写到目的地（文件、网络）。
Buffer：A buffer is a temporary memory area used to hold data while it's being moved between two places；It reduces the number of direct reads/writes, improving performance。
BufferedInputStream、BufferedOutputStream：Wraps a basic InputStream / OutputStream to improve efficiency；The default chunk size is 8 KB (8192 bytes)。
```java
BufferedInputStream bis = new BufferedInputStream(new FileInputStream("in.txt"));
BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("out.txt"));
```
一层包一层的写法是装饰器模式；字符流对应的是 BufferedReader（有 readLine()）和 BufferedWriter（有 newLine()）。

**问题**：缓冲流为什么能提高效率？flush() 有什么作用？

**答案要点**：
1. InputStream / OutputStream 是字节流的抽象父类
2. 缓冲流包装基础流，数据先进内存缓冲区，攒够了再一次性读写
3. 减少了直接访问磁盘或网络的次数，默认缓冲区 8 KB
4. flush() 把缓冲区里的数据强制写到目的地；close() 会先 flush 再关闭
5. 这种包装方式是装饰器模式

**常见陷阱**：
- ❌ 用缓冲输出流写完数据后既不 flush 也不 close
- ✅ 数据可能还留在缓冲区，文件里是空的或不完整；用 try-with-resources 自动关闭
- ❌ 把 read() 的返回值当成读到的字节数
- ✅ read() 返回的是那个字节本身，read(byte[]) 才返回读到的字节数

**追问**：
- Q: 为什么 read() 返回 int 而不是 byte？
- A: 要用 0~255 表示读到的字节，再额外用 -1 表示流结束，byte 的范围放不下这 257 种情况

**代码题**：下面代码输出什么？

```java
StringWriter sw = new StringWriter();
BufferedWriter bw = new BufferedWriter(sw);
bw.write("hello");
System.out.print("[" + sw + "] ");
bw.flush();
System.out.println("[" + sw + "]");
```

- [x] [] [hello]
- [ ] [hello] [hello]
- [ ] [] []
- [ ] [hello] []

解析：BufferedWriter 先把 "hello" 放在自己的缓冲区里，底层的 StringWriter 还是空的；调用 flush() 之后数据才真正写到 StringWriter。

**代码题**：下面代码输出什么？

```java
InputStream in = new ByteArrayInputStream("abcde".getBytes());
byte[] buf = new byte[3];
int n1 = in.read(buf);
int n2 = in.read(buf);
int n3 = in.read(buf);
System.out.println(n1 + " " + n2 + " " + n3);
```

- [x] 3 2 -1
- [ ] 3 3 3
- [ ] 3 2 0
- [ ] 5 0 -1

解析：read(byte[]) 返回实际读到的字节数：第一次读满 3 个，第二次只剩 2 个，第三次已经到末尾返回 -1。

**判断题**：
- ✅ BufferedInputStream 的默认缓冲区大小是 8192 字节 —— 也就是 8 KB
- ❌ 调用 close() 关闭缓冲输出流之前必须手动调用 flush()，否则数据一定丢失 —— close() 会先 flush 再关闭

### File I/O 与 java.io.File

**概念**：FileInputStream / FileOutputStream 读写文件的字节，FileReader / FileWriter 读写文件的字符；java.io.File 表示文件系统里的一个文件或目录路径

**一句话**：FileWriter(fileName) 会创建文件或覆盖原有内容，FileWriter(fileName, true) 追加到末尾；File 对象只是一个路径，new File("a.txt") 不会在磁盘上创建文件，可以用 exists、isFile、isDirectory、getName、getPath、getAbsolutePath、getParent、length 查询信息，用 createNewFile、mkdir、delete、renameTo 操作文件。

**详细解释**：
File I/O：FileInputStream、FileOutputStream；FileReader、FileWriter。
FileReader(String filePath)：从给定路径读文件；FileReader(File fileObj)：从 File 对象读。
FileWriter(String fileName)：Creates or overwrites the file with new content；FileWriter(String fileName, boolean append)：append 为 true 写到末尾，为 false 覆盖。
java.io.File：represents a file or directory (folder) path in the filesystem，提供方法：创建文件或目录、检查是否存在、获取元数据（名字、大小、路径）、删除或重命名、遍历目录。
APIs：File(String pathname)、exists()、isFile()、isDirectory()；课件例子里还有 getName()、getPath()、getAbsolutePath()、getParent()、canWrite()、canRead()、length()。
Java 7 起还有更现代的 java.nio.file（Path、Files.readAllLines、Files.write）。

**问题**：FileWriter 怎么追加写入？java.io.File 能做什么？

**答案要点**：
1. FileInputStream / FileOutputStream 处理字节，FileReader / FileWriter 处理字符
2. FileWriter(name) 默认覆盖，FileWriter(name, true) 追加
3. File 表示文件或目录的路径，创建 File 对象不会创建文件
4. 查询：exists、isFile、isDirectory、getName、getPath、getAbsolutePath、length
5. 操作：createNewFile、mkdir / mkdirs、delete、renameTo、listFiles

**常见陷阱**：
- ❌ 以为 new File("a.txt") 会在磁盘上创建文件
- ✅ 只是路径对象，要 createNewFile() 或用输出流写入才会创建
- ❌ 用 new FileWriter(name) 想往已有文件后面追加内容
- ✅ 默认是覆盖，追加要传 append = true

**追问**：
- Q: 读写文件后不关闭流会怎样？
- A: 文件句柄一直被占用，可能导致数据没写完、文件被锁、句柄耗尽；应该用 try-with-resources

**代码题**：下面代码输出什么？

```java
File f = new File("no_such_dir/readme.txt");
System.out.println(f.getName() + " " + f.exists() + " " + f.isFile());
```

- [x] readme.txt false false
- [ ] readme.txt true true
- [ ] no_such_dir/readme.txt false false
- [ ] 抛出 FileNotFoundException

解析：创建 File 对象只是表示一个路径，不会检查也不会创建文件；getName() 返回最后一段文件名，文件不存在所以 exists() 和 isFile() 都是 false。

**代码题**：下面代码输出什么？

```java
File f = File.createTempFile("demo", ".txt");
try (FileWriter w = new FileWriter(f)) { w.write("A"); }
try (FileWriter w = new FileWriter(f, true)) { w.write("B"); }
try (FileWriter w = new FileWriter(f.getPath(), false)) { w.write("C"); }
try (FileWriter w = new FileWriter(f, true)) { w.write("D"); }
System.out.println(new String(java.nio.file.Files.readAllBytes(f.toPath())));
f.delete();
```

- [x] CD
- [ ] ABCD
- [ ] D
- [ ] ABD

解析：第一次写入 A；append = true 追加得到 AB；append = false 覆盖成 C；再追加得到 CD。

**判断题**：
- ✅ FileWriter 的 append 参数为 true 时，数据写到文件末尾 —— 为 false 时覆盖原内容
- ❌ 创建 File 对象时，如果文件不存在会自动创建 —— File 只是路径对象，不会创建文件
