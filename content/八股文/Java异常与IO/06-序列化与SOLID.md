# 序列化与SOLID

### 序列化与反序列化

**概念**：序列化（Serialization）是 Java 内置的机制，把对象转换成包含类型和字段数据的字节；反序列化（Deserialization）是把这些字节还原成 Java 对象

**一句话**：类要实现 Serializable 才能用 ObjectOutputStream.writeObject 序列化、ObjectInputStream.readObject 反序列化，否则抛 NotSerializableException；readObject 返回 Object，需要自己强转；反序列化时不会调用实现了 Serializable 的类的构造器，只会调用继承链上没有实现 Serializable 的父类的无参构造器；序列化后的字节可以保存或通过网络发送，并且平台无关。

**详细解释**：
Serialization：convert java object to bytes, including the type and data fields information。
Once serialized, object will be stored in somewhere as byte. These data can be read by other input streams and convert back into Java Objects. This process is called deserialization。
Why is this important：allows an object's state to be converted into a byte stream so it can be saved or sent over a network；platform independent；以后会学 JSON，它是另一种常见的、语言无关的数据交换格式。
Deserialization Flow：FileInputStream → ObjectInputStream → Java objects；The deserialized objects are returned as type Object；It's the developer's responsibility to cast them to the correct class。
Process：the JVM loads the class and restores the object's state from the byte stream；Constructors are not called for classes that implement Serializable；Constructors are called only for non-serializable superclass(es) in the object's hierarchy。
所以字段的初始化语句（比如 int cache = 42）在反序列化时也不会执行。

**问题**：什么是序列化和反序列化？反序列化时会调用构造器吗？

**答案要点**：
1. 序列化：对象 → 字节（包括类型和字段数据）；反序列化：字节 → 对象
2. 类必须实现 Serializable，否则抛 NotSerializableException
3. 用 ObjectOutputStream.writeObject / ObjectInputStream.readObject，读出来是 Object 需要强转
4. 反序列化不调用 Serializable 类的构造器，只调用不可序列化父类的无参构造器
5. 用途：保存到文件、网络传输；平台无关

**常见陷阱**：
- ❌ 以为反序列化时会执行类的构造器和字段初始化
- ✅ 对象状态直接从字节流恢复，构造器不会被调用
- ❌ 只让外层类实现 Serializable，字段里引用的对象没实现
- ✅ 被引用的对象也要能序列化，否则同样抛 NotSerializableException（或者把字段标成 transient）

**追问**：
- Q: Java 原生序列化有什么缺点？现在常用什么替代？
- A: 只能在 Java 之间使用、体积大、有反序列化安全漏洞；跨语言的数据交换常用 JSON、Protobuf

**代码题**：下面代码输出什么？

```java
class User implements Serializable {
    String username;
    transient String password;
    int age;
    User(String u, String p, int a) { username = u; password = p; age = a; System.out.print("ctor "); }
}
ByteArrayOutputStream bos = new ByteArrayOutputStream();
try (ObjectOutputStream out = new ObjectOutputStream(bos)) {
    out.writeObject(new User("tom", "secret", 20));
}
try (ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bos.toByteArray()))) {
    User u = (User) in.readObject();
    System.out.println(u.username + " " + u.password + " " + u.age);
}
```

- [x] ctor tom null 20
- [ ] ctor ctor tom null 20
- [ ] ctor tom secret 20
- [ ] ctor ctor tom secret 20

解析：构造器只在 new User 时执行一次，反序列化不会调用它；password 是 transient，没有被序列化，恢复后是 null；username 和 age 正常恢复。

**代码题**：下面代码运行结果是什么？

```java
class Point {
    int x = 1;
}
ObjectOutputStream out = new ObjectOutputStream(new ByteArrayOutputStream());
out.writeObject(new Point());
System.out.println("done");
```

- [ ] done
- [ ] 编译错误
- [x] 抛出 NotSerializableException
- [ ] 抛出 ClassCastException

解析：Point 没有实现 Serializable，writeObject 在运行时抛出 java.io.NotSerializableException；编译器不会检查这一点。

**判断题**：
- ✅ readObject() 的返回类型是 Object，需要强转成具体类型 —— 由开发者负责转换成正确的类
- ❌ 反序列化时会调用实现了 Serializable 的类的构造器 —— 只会调用不可序列化父类的无参构造器

### Serializable、transient 与 serialVersionUID

**概念**：Serializable 是一个标记接口（marker interface），没有任何方法，用来告诉 JVM 这个类可以被序列化；transient 用来排除不想序列化的字段；serialVersionUID 是序列化时的版本号

**一句话**：标记接口没有方法或常量，只提供运行时的类型信息（还有 Cloneable）；transient 字段不会被序列化，反序列化后是默认值（null、0、false），常用于密码等敏感数据；static 字段属于类，也不会被序列化；反序列化时字节流里的 serialVersionUID 和当前类不一致会抛 InvalidClassException，所以建议显式声明。

**详细解释**：
java.io.Serializable is a marker interface：has no methods or constants inside it. It provides run-time type information about objects, so the compiler and JVM have additional information about the object；e.g. Cloneable, Serializable。
Classes that do not implement this interface will not have any of their state serialized or deserialized。
transient：What if we don't want to serialize certain fields？transient keyword can be used to exclude specific fields from serialization。
```java
public class User implements Serializable {
    private String username;
    private transient String password;   // This will NOT be serialized
}
```
Transient variables are given null or default values (0, false, null) after deserialization。
serialVersionUID：a special version control identifier；When an object is deserialized, Java checks if the serialVersionUID of the serialized class (in the file) matches the current class；If they don't match, you get an InvalidClassException。
`private static final long serialVersionUID = 1L;`
不显式声明时编译器会根据类结构自动计算，类一改就变，旧数据就无法反序列化。课件提到这个机制不常用：一般不修改已有类的结构（违反开闭原则），而是新建类、新建表。

**问题**：transient 关键字有什么用？serialVersionUID 是干什么的？

**答案要点**：
1. Serializable 是标记接口，没有方法，只表示"可以序列化"
2. transient 字段不参与序列化，反序列化后是默认值
3. static 字段属于类，也不会被序列化
4. serialVersionUID 用来校验版本，不一致抛 InvalidClassException
5. 建议显式声明 serialVersionUID，避免类结构变化导致旧数据无法读取

**对比**：
| 字段类型 | 是否被序列化 | 反序列化后的值 |
|---|---|---|
| 普通实例字段 | 是 | 原来的值 |
| transient 字段 | 否 | 默认值（null / 0 / false） |
| static 字段 | 否 | 当前类里的静态值 |

**常见陷阱**：
- ❌ 以为 transient 字段反序列化后会恢复成声明时的初始值
- ✅ 字段初始化语句不会执行，得到的是类型默认值
- ❌ 不声明 serialVersionUID，之后给类加了字段
- ✅ 自动生成的 UID 变了，旧的序列化数据反序列化时抛 InvalidClassException

**追问**：
- Q: 除了 Serializable，还有哪些标记接口？
- A: Cloneable（允许调用 Object.clone()）、RandomAccess（表示支持快速随机访问，比如 ArrayList）

**代码题**：下面代码输出什么？

```java
class Config implements Serializable {
    static int version = 1;
    transient int cache = 42;
    String name = "app";
}
ByteArrayOutputStream bos = new ByteArrayOutputStream();
ObjectOutputStream out = new ObjectOutputStream(bos);
out.writeObject(new Config());
out.flush();
Config.version = 2;
ObjectInputStream in = new ObjectInputStream(new ByteArrayInputStream(bos.toByteArray()));
Config c = (Config) in.readObject();
System.out.println(c.name + " " + c.cache + " " + Config.version);
```

- [x] app 0 2
- [ ] app 42 1
- [ ] app 42 2
- [ ] app 0 1

解析：name 正常恢复；cache 是 transient，没有被序列化，而且反序列化不执行字段初始化，所以是 0；version 是 static，不属于对象，读的是类当前的值 2。

**判断题**：
- ✅ Serializable 接口里没有任何方法 —— 它是标记接口
- ❌ transient 字段反序列化后会恢复成字段声明时的初始值 —— 得到的是类型默认值，初始化语句不会执行

### SOLID 原则

**概念**：SOLID 是五条面向对象设计原则，让代码更易维护、易扩展、易测试、易理解

**一句话**：S 单一职责（一个类只有一个变化的理由）、O 开闭原则（对扩展开放、对修改关闭）、L 里氏替换（子类能替换父类而不破坏程序）、I 接口隔离（不强迫类实现用不到的方法）、D 依赖倒置（依赖抽象而不是具体实现）。

**详细解释**：
Design principles that help make code more maintainable, extensible, testable, and easier to understand。
Single Responsibility Principle：一个类只负责一件事。
Open/Closed Principle：Open for extension, closed for modification；新需求通过新增类实现，而不是改已有类（课件在 serialVersionUID 那页用它说明为什么不改已有类的结构）。
Liskov Substitution Principle：subclass should be able to replace its parent class without breaking the program；比如重写方法时不能缩小访问权限、不能抛出更宽的异常。
Interface Segregation Principle：a class shouldn't be forced to implement methods they don't use；把大接口拆成多个小接口。
Dependency Inversion Principle：depend on abstractions, not concrete implementations；比如变量类型写 List 而不是 ArrayList，Spring 的依赖注入就是这个思想。
（课件标题写作 "SOLID principal"，正确拼写是 principle。）

**问题**：说一下 SOLID 原则

**答案要点**：
1. S 单一职责：一个类只负责一件事
2. O 开闭原则：对扩展开放，对修改关闭
3. L 里氏替换：子类可以替换父类而不破坏程序
4. I 接口隔离：不强迫类实现它不需要的方法，拆分大接口
5. D 依赖倒置：依赖抽象而不是具体实现

**对比**：
| 原则 | 一句话 | 例子 |
|---|---|---|
| S | 一个类一个职责 | 把"计算订单"和"发送邮件"拆成两个类 |
| O | 加功能靠扩展不靠修改 | 新支付方式新增一个实现类 |
| L | 子类能替换父类 | 重写方法不缩小权限、不改变约定 |
| I | 接口要小而专 | 函数式接口只有一个抽象方法 |
| D | 依赖抽象 | List<String> list = new ArrayList<>() |

**常见陷阱**：
- ❌ 把依赖倒置（DIP）和依赖注入（DI）当成同一个东西
- ✅ DIP 是设计原则（依赖抽象），DI 是实现它的一种手段（由外部把依赖传进来）

**追问**：
- Q: 正方形继承长方形为什么违反里氏替换原则？
- A: 长方形可以分别设置宽和高，正方形设置宽时会同时改变高；用正方形替换长方形后，"设置宽高后面积等于宽乘高"的预期被破坏

**判断题**：
- ✅ 开闭原则要求软件对扩展开放、对修改关闭 —— 新需求通过新增代码实现，而不是修改已有代码
- ❌ 接口隔离原则要求把所有方法都放进一个大接口，方便统一实现 —— 恰恰相反，应该拆成小而专的接口
