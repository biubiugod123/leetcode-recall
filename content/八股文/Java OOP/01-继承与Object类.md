# 继承与Object类

### OOP 与四大特性

**概念**：OOP（Object-Oriented Programming）是一种编程范式，把一切都当作对象来处理；它有四大特性：封装、继承、多态、抽象

**一句话**：OOP 用对象（数据 + 操作）来组织程序，四大特性可以用 A PIE 记：Abstraction 抽象（隐藏实现）、Polymorphism 多态（同一动作不同实现）、Inheritance 继承（复用父类）、Encapsulation 封装（把数据和方法打包并控制访问）。

**详细解释**：
对象 = data（fields）+ operations（methods），class 是创建对象的 blueprint。
四大特性各自的关键词：
Inheritance → Sharing of information（子类共享父类的属性和行为）
Encapsulation → Grouping of information（把字段和方法放进一个 class，用访问修饰符隐藏数据）
Abstraction → Hiding of information（只暴露"做什么"，隐藏"怎么做"）
Polymorphism → Redefining of information（同一个方法在不同对象上有不同表现）
记忆口诀：A PIE —— Abstraction、Polymorphism、Inheritance、Encapsulation。

**问题**：什么是面向对象编程？OOP 的四大特性分别是什么？

**答案要点**：
1. OOP 是一种编程范式，把程序看作一组对象的协作
2. 对象 = 数据（字段）+ 操作（方法），class 是对象的模板
3. 封装：把数据和方法打包，隐藏内部数据
4. 继承：子类复用父类，表达 IS-A 关系
5. 多态：同一个调用在不同对象上有不同实现；抽象：隐藏实现细节，只暴露功能

**对比**：
| 特性 | 一句话 | Java 里怎么实现 |
|---|---|---|
| Abstraction | 隐藏实现，只暴露功能 | abstract class、interface |
| Polymorphism | 同一动作，多种形态 | overloading、overriding |
| Inheritance | 从通用派生出具体 | extends |
| Encapsulation | 打包数据并控制访问 | private 字段 + public 方法 |

**常见陷阱**：
- ❌ 把抽象和封装说成同一个东西
- ✅ 抽象关注"暴露什么功能"，封装关注"把数据藏起来、控制访问"

**追问**：
- Q: 四大特性里你觉得哪个最重要？
- A: 没有标准答案，可以说多态：它让代码依赖抽象而不是具体实现，扩展新类型时调用方不用改

**判断题**：
- ✅ OOP 四大特性可以用 A PIE 来记 —— Abstraction、Polymorphism、Inheritance、Encapsulation
- ❌ 封装的英文关键词是 Sharing of information —— Sharing 是继承；封装是 Grouping of information

### 继承：extends 与 IS-A

**概念**：继承（Inheritance）是从一个通用的类派生出更具体的类的能力，子类用 extends 继承父类，二者是 IS-A 关系

**一句话**：子类用 extends 继承父类，复用父类的 public 和 protected 成员（同一个包里还包括默认访问的成员），不继承 private 成员和构造器；继承表达 IS-A 关系，比如 Dog is an Animal。

**详细解释**：
语法：`class MySubClass extends MySuperClass`。Dog 是 Subclass / Child class，Animal 是 Superclass / Parent class。
子类继承父类全部 public 和 protected 的属性和行为；如果子类和父类在同一个 package，还继承 package-private（默认访问）的成员；private 成员不继承。
"private 不继承"指子类代码不能直接访问它，但子类对象里仍然有这份数据，可以通过父类的 public getter 间接访问。
构造器不会被继承；子类构造器第一行会隐式调用 super()，父类没有无参构造器时必须显式写 super(参数)。
用继承之前先确认 IS-A 关系成立：A dog is an Animal。

**问题**：什么是继承？子类能继承父类的哪些成员？

**答案要点**：
1. 用 extends 从通用类派生具体类，主要作用是复用代码
2. 继承表达 IS-A 关系
3. 子类继承父类的 public、protected 成员
4. 同一个包里还继承默认访问（package-private）的成员
5. private 成员和构造器不继承，private 字段可以通过父类的 getter 访问

**对比**：
| 父类成员 | 子类能否直接使用 |
|---|---|
| public | 能 |
| protected | 能 |
| 默认（package-private） | 同一个包才能 |
| private | 不能 |
| 构造器 | 不继承，只能通过 super(...) 调用 |

**常见陷阱**：
- ❌ 认为子类对象里完全没有父类的 private 字段
- ✅ 字段仍然存在于子类对象中，只是子类代码不能直接访问
- ❌ 认为父类的构造器会被子类继承
- ✅ 构造器不继承，子类要通过 super(...) 调用父类构造器

**追问**：
- Q: 什么时候不应该用继承？
- A: IS-A 关系不成立、或者不能在对象整个生命周期里一直成立时，应该用组合 / 聚合（HAS-A）

**代码题**：下面代码能编译吗？

```java
class Animal {
    private String name = "animal";
    public String getName() { return name; }
}
class Dog extends Animal {
    String info() { return name; }
}
System.out.println(new Dog().info());
```

- [ ] animal
- [ ] null
- [x] 编译错误
- [ ] 抛出 NullPointerException

解析：name 是 Animal 的 private 字段，子类 Dog 不能直接访问它，编译报错；应该通过继承来的 getName() 访问。

**代码题**：下面代码输出什么？

```java
class Animal {
    private String name = "animal";
    public String getName() { return name; }
}
class Dog extends Animal { }
Dog d = new Dog();
System.out.println(d.getName() + " " + (d instanceof Animal));
```

- [x] animal true
- [ ] null true
- [ ] animal false
- [ ] 编译错误

解析：getName() 是 public 方法，被 Dog 继承，能读到父类里的 private 字段；Dog 继承 Animal，所以 d instanceof Animal 为 true。

**代码题**：下面代码能编译吗？

```java
class Animal {
    Animal(String name) { }
}
class Dog extends Animal { }
System.out.println(new Dog());
```

- [ ] 打印出 Dog 对象
- [ ] null
- [x] 编译错误
- [ ] 抛出 NullPointerException

解析：Dog 没写构造器，编译器生成的默认构造器会调用 super()，但 Animal 只有带参构造器，找不到无参的 super()，编译报错；构造器不会被继承。

**判断题**：
- ✅ 子类和父类在同一个包里时，子类也能使用父类的默认访问成员 —— 默认访问就是包访问权限
- ❌ 子类会继承父类的构造器 —— 构造器不继承，只能在子类构造器里用 super(...) 调用

### 继承的类型与菱形问题

**概念**：继承可以分为单继承、多继承、多层继承、层次继承和混合继承；Java 的 class 不支持多继承，原因是菱形问题（Diamond Problem）

**一句话**：Java 的类只能 extends 一个父类，但可以多层继承（C extends B extends A），也可以多个子类继承同一个父类；不支持类的多继承是为了避免菱形问题——两个父类有同名方法时，子类不知道该用哪一个；接口则可以多继承。

**详细解释**：
Single：B extends A，只继承一个类。
Multiple：同时继承多个不相关的类，Java 的 class 不支持。
Multi-Level：C extends B、B extends A，继承链没有长度限制，但太深会让代码过于复杂。
Hierarchical：B、C 都 extends A，多个类继承同一个父类。
Hybrid：以上几种的组合。
菱形问题：A 有 doSomething()，B 和 C 都继承 A 并重写了它，如果 D 同时继承 B 和 C，调用 d.doSomething() 时无法确定用 B 还是 C 的版本。
接口可以多实现；如果两个接口有同名的 default 方法，实现类必须自己重写，并用 接口名.super.方法() 明确调用哪一个。

**问题**：Java 支持哪些类型的继承？为什么不支持类的多继承？

**答案要点**：
1. 支持单继承、多层继承、层次继承，以及不含类多继承的混合继承
2. 类不支持多继承，一个类只能 extends 一个父类
3. 原因是菱形问题：多个父类的同名方法会产生歧义
4. 接口支持多继承：类可以实现多个接口，接口可以 extends 多个接口
5. 接口 default 方法冲突时，实现类必须重写并显式选择

**对比**：
| 类型 | 结构 | Java 的类是否支持 |
|---|---|---|
| Single | B extends A | 支持 |
| Multiple | C 同时 extends A 和 B | 不支持 |
| Multi-Level | C extends B，B extends A | 支持 |
| Hierarchical | B、C 都 extends A | 支持 |
| Hybrid | 以上组合 | 不含多继承时支持 |

**常见陷阱**：
- ❌ 认为 Java 完全不支持多继承
- ✅ 类不支持多继承，接口支持（一个类可以 implements 多个接口）

**追问**：
- Q: 除了用接口，还有什么办法避免菱形问题？
- A: 用聚合 / 组合：把 B 和 C 作为 D 的成员变量，通过 b.doSomething()、c.doSomething() 明确调用

**代码题**：下面代码能编译吗？

```java
class A { }
class B { }
class C extends A, B { }
System.out.println("ok");
```

- [ ] ok
- [x] 编译错误
- [ ] 抛出 ClassCastException
- [ ] 什么也不输出

解析：Java 的类只能 extends 一个父类，`extends A, B` 是语法错误。

**代码题**：下面代码输出什么？

```java
class A { }
class B extends A { }
class C extends B { }
Object o = new C();
System.out.println((o instanceof A) + " " + (o instanceof B) + " " + (o instanceof Object));
```

- [x] true true true
- [ ] false true true
- [ ] false false true
- [ ] true false true

解析：多层继承下，C 是 B，也是 A，所有类最终都继承 Object，所以三个 instanceof 都为 true。

**代码题**：下面代码输出什么？

```java
interface B { default String hi() { return "B"; } }
interface C { default String hi() { return "C"; } }
class D implements B, C {
    public String hi() { return B.super.hi() + C.super.hi(); }
}
System.out.println(new D().hi());
```

- [x] BC
- [ ] B
- [ ] C
- [ ] 编译错误

解析：两个接口有同名的 default 方法，D 必须自己重写 hi()，可以用 B.super.hi()、C.super.hi() 明确调用各自的版本，这样就没有歧义了。

**判断题**：
- ✅ Java 中继承链的层数没有限制 —— 多层继承没有长度限制，但太深会让代码难以维护
- ❌ 一个接口只能 extends 一个接口 —— 接口可以 extends 多个接口

### this 与 super

**概念**：this 指向当前类的对象，super 指向直接父类的那部分；两者都可以访问字段、方法和构造器

**一句话**：this.字段 / this.方法() / this(...) 访问当前类的成员和构造器；super.字段 / super.方法() / super(...) 访问直接父类的成员和构造器；this(...) 和 super(...) 都只能写在构造器第一行，所以不能同时出现；this 还可以作为参数传递或作为返回值。

**详细解释**：
子类重写了方法后，用 super.方法() 可以调用父类的原始版本，常用来"在父类逻辑基础上再加一点"。
子类定义了和父类同名的字段时会隐藏父类字段，用 super.字段 才能访问父类那个。
子类构造器第一行如果没写 this(...) 或 super(...)，编译器会自动插入 super()。
static 方法里没有 this 和 super。

**问题**：this 和 super 有什么区别？

**答案要点**：
1. this 代表当前对象，super 代表直接父类的那部分
2. this.字段 / super.字段 区分当前类和父类的同名字段
3. this(...) 调用本类其他构造器，super(...) 调用父类构造器
4. 两者都必须是构造器的第一条语句，不能同时出现
5. super.方法() 可以调用被重写的父类方法；static 方法里不能用 this 和 super

**对比**：
| | this | super |
|---|---|---|
| 指向 | 当前类（子类）的对象 | 直接父类的对象部分 |
| 字段 | this.field：当前类的实例变量 | super.field：父类的实例变量 |
| 构造器 | this(...)：本类的另一个构造器 | super(...)：父类的构造器 |
| 方法 | this.method()：当前类的方法 | super.method()：父类的方法 |
| 其他 | 可以作为参数传递、作为返回值 | 不能单独使用 |

**常见陷阱**：
- ❌ 在同一个构造器里同时写 this(...) 和 super(...)
- ✅ 两者都要求是第一条语句，只能二选一
- ❌ 以为 super 能跳过直接父类，访问祖父类的成员
- ✅ super 只指向直接父类，没有 super.super

**追问**：
- Q: 子类构造器里不写 super(...)，会发生什么？
- A: 编译器自动插入 super()，调用父类的无参构造器；父类没有无参构造器就编译错误

**代码题**：下面代码输出什么？

```java
class Animal {
    String name = "animal";
}
class Dog extends Animal {
    String name = "dog";
    String show() { return this.name + " " + super.name; }
}
System.out.println(new Dog().show());
```

- [x] dog animal
- [ ] dog dog
- [ ] animal animal
- [ ] animal dog

解析：Dog 定义了同名字段 name，隐藏了父类的 name；this.name 是 Dog 自己的，super.name 是父类 Animal 的。

**代码题**：下面代码输出什么？

```java
class Animal {
    Animal() { System.out.print("Animal "); }
}
class Dog extends Animal {
    Dog() {
        this("Rex");
        System.out.print("Dog ");
    }
    Dog(String name) {
        System.out.print(name + " ");
    }
}
new Dog();
```

- [x] Animal Rex Dog
- [ ] Rex Dog Animal
- [ ] Dog Rex Animal
- [ ] Rex Animal Dog

解析：Dog() 第一行 this("Rex") 先调用 Dog(String)；Dog(String) 第一行隐式调用 super()，先打印 Animal，再打印 Rex；最后回到 Dog() 打印 Dog。

**代码题**：下面代码输出什么？

```java
class Animal {
    String speak() { return "..."; }
}
class Dog extends Animal {
    String speak() { return super.speak() + "woof"; }
}
Animal a = new Dog();
System.out.println(a.speak());
```

- [x] ...woof
- [ ] woof
- [ ] ...
- [ ] 编译错误

解析：a 实际是 Dog，调用的是 Dog 重写后的 speak()；它先用 super.speak() 拿到父类的 "..."，再拼上 "woof"。

**判断题**：
- ✅ this 可以作为方法的返回值 —— 返回 this 是链式调用（builder）的常见写法
- ❌ 可以写 super.super.method() 调用祖父类的方法 —— super 只能指向直接父类，没有 super.super

### Object 类及其方法

**概念**：java.lang.Object 是 Java 中所有类的父类，位于继承体系的最顶端，它本身没有父类

**一句话**：任何类不写 extends 时默认继承 Object，所以所有对象都有 equals、hashCode、toString、getClass、clone、finalize、wait、notify、notifyAll 这些方法；最常被重写的是 equals、hashCode 和 toString。

**详细解释**：
Object 的方法可以分组记：
比较：equals(Object obj)、hashCode()
描述：toString()、getClass()（返回运行时的 Class）
复制：clone()（protected，返回对象的副本，需要实现 Cloneable）
回收：finalize()（protected，GC 回收前调用，已废弃）
多线程：wait()、wait(long timeout)、wait(long timeout, int nanos)、notify()、notifyAll()
默认实现：equals 等同于 ==；toString 返回 "类名@哈希值的十六进制"，比如 Person@1b6d3586。
wait / notify 必须在 synchronized 块里、对同一个对象的 monitor 调用，属于多线程的内容。

**问题**：Object 类有哪些方法？哪些经常需要重写？

**答案要点**：
1. Object 是所有类的父类，没有父类
2. 比较：equals、hashCode；描述：toString、getClass
3. 复制：clone（protected）；回收：finalize（已废弃）
4. 多线程：wait（三个重载）、notify、notifyAll
5. 常重写 equals、hashCode、toString；equals 默认等同于 ==

**对比**：
| 方法 | 返回类型 | 作用 |
|---|---|---|
| clone() | protected Object | 创建并返回对象的副本 |
| equals(Object obj) | boolean | 判断另一个对象是否"相等" |
| finalize() | protected void | GC 回收前调用（已废弃） |
| getClass() | Class<?> | 返回运行时的类 |
| hashCode() | int | 返回哈希值 |
| toString() | String | 返回对象的字符串表示 |
| wait() / notify() / notifyAll() | void | 线程间等待与唤醒 |

**常见陷阱**：
- ❌ 认为 getClass() 返回的是变量的声明类型
- ✅ 返回的是对象的运行时类型，Object o = "hi" 时 getClass() 是 String
- ❌ 直接打印对象，期望看到字段内容
- ✅ 默认 toString 只打印 类名@哈希值，要自己重写 toString

**追问**：
- Q: 为什么 wait、notify 定义在 Object 里，而不是 Thread 里？
- A: 它们操作的是对象的监视器锁（monitor），任何对象都可以作为锁，所以放在所有类的父类 Object 里

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
Object o = "hello";
System.out.println(o.getClass().getSimpleName());
System.out.println(o.equals("hello"));
System.out.println(new Object().equals(new Object()));
```

- [x] String true false
- [ ] Object true false
- [ ] String false false
- [ ] Object false true

解析：getClass() 返回运行时类型 String；o 实际是 String，调用的是 String 重写的 equals，按内容比较；Object 默认的 equals 比较引用，两个 new Object() 不是同一个对象。

**代码题**：下面代码输出什么？

```java
class Point {
    int x = 1, y = 2;
    @Override
    public String toString() { return "(" + x + "," + y + ")"; }
}
System.out.println("p=" + new Point());
```

- [x] p=(1,2)
- [ ] p=Point@1b6d3586
- [ ] p=(x,y)
- [ ] 编译错误

解析：字符串拼接对象时会调用它的 toString()，Point 重写了 toString，所以打印 (1,2)；不重写的话才会是 类名@哈希值。

**判断题**：
- ❌ Object 类也有自己的父类 —— Object 位于继承体系最顶端，没有父类
- ✅ Object 的 clone() 方法是 protected 的 —— 想让外部调用，需要在子类里重写成 public 并实现 Cloneable
