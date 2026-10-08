# Java8函数式编程

### 函数式接口

**概念**：函数式接口（Functional Interface）是只有一个抽象方法的接口，可以有任意多个 default 或 static 方法；它是 Lambda 表达式和方法引用的目标类型

**一句话**：Comparator、Comparable、Consumer、Supplier、Function、Predicate 都是函数式接口；@FunctionalInterface 注解是可选的但推荐加，加了以后编译器会检查只能有一个抽象方法；default 和 static 方法不算，和 Object 公共方法同签名的抽象方法也不算。

**详细解释**：
Java 8 引入了 default 和 static 方法，让接口里可以有实现，所以函数式接口里可以有任意多个它们。
常见的函数式接口：
Comparator<T> → int compare(T a, T b)
Comparable<T> → int compareTo(T o)
Consumer<T> → void accept(T t)（吃进去，不返回）
Supplier<T> → T get()（不吃，吐出来）
Function<T, R> → R apply(T t)（吃进去，吐出来）
Predicate<T> → boolean test(T t)（吃进去，判断真假）
@FunctionalInterface：Ensures that only one abstract method is allowed；有多个抽象方法时编译报错（IDE 提示 Multiple non-overriding abstract methods found）。
Comparator 里还声明了 boolean equals(Object obj)，但它和 Object 的公共方法同签名，不计入抽象方法数量。

**问题**：什么是函数式接口？举几个 JDK 里的例子。

**答案要点**：
1. 只有一个抽象方法的接口
2. 可以有任意多个 default 和 static 方法
3. @FunctionalInterface 可选，加上后编译器检查只有一个抽象方法
4. 例子：Comparator、Comparable、Consumer、Supplier、Function、Predicate
5. 它是 Lambda 表达式和方法引用的目标类型

**对比**：
| 接口 | 抽象方法 | 输入 → 输出 |
|---|---|---|
| Consumer<T> | void accept(T t) | T → 无 |
| Supplier<T> | T get() | 无 → T |
| Function<T, R> | R apply(T t) | T → R |
| Predicate<T> | boolean test(T t) | T → boolean |
| Comparator<T> | int compare(T a, T b) | (T, T) → int |

**常见陷阱**：
- ❌ 认为函数式接口里只能有一个方法
- ✅ 只限制抽象方法的数量，default 和 static 方法可以有很多
- ❌ 认为不加 @FunctionalInterface 就不能用 lambda
- ✅ 注解是可选的，只要恰好有一个抽象方法就能用 lambda

**追问**：
- Q: Runnable 是函数式接口吗？
- A: 是，它只有一个抽象方法 void run()，可以写成 () -> {...}

**代码题**：下面代码能编译吗？

```java
@FunctionalInterface
interface Calc {
    int apply(int a, int b);
    int other(int a);
}
System.out.println("ok");
```

- [ ] ok
- [x] 编译错误
- [ ] 抛出 IllegalStateException
- [ ] 什么也不输出

解析：加了 @FunctionalInterface 的接口只能有一个抽象方法，Calc 有两个，编译器直接报错。

**代码题**：下面代码输出什么？

```java
Function<Integer, Integer> square = x -> x * x;
Predicate<Integer> isEven = x -> x % 2 == 0;
Supplier<String> hello = () -> "hi";
Consumer<String> printer = s -> System.out.print(s + " ");
printer.accept(hello.get());
System.out.println(square.apply(5) + " " + isEven.test(7));
```

- [x] hi 25 false
- [ ] hi 25 true
- [ ] hi 10 false
- [ ] 25 false hi

解析：Supplier.get() 返回 "hi"，Consumer.accept 打印它；Function.apply(5) 得到 25；Predicate.test(7) 判断 7 是否为偶数，得到 false。

**判断题**：
- ✅ @FunctionalInterface 注解是可选的 —— 只要接口恰好有一个抽象方法，就能用 lambda 实现
- ❌ 函数式接口不能有 default 方法 —— 可以有任意多个 default 和 static 方法

### Lambda 表达式

**概念**：Lambda 表达式是一种匿名方法的写法，用来实现函数式接口的那个抽象方法，取代 Java 8 之前的匿名内部类

**一句话**：语法是 (参数) -> 表达式 或 (参数) -> { 语句 }；只有一个参数时可以省略括号，方法体只有一个表达式时可以省略大括号和 return；它只能赋值给函数式接口；lambda 里用到的局部变量必须是 final 或 effectively final。

**详细解释**：
作用：Enables writing anonymous methods；Simplifies code by removing boilerplate code；Replace anonymous classes used before Java 8。
语法：(param) -> expression、(param) -> {statement}。
课件的对比：
```java
// Java 8 之前：匿名类
Comparator<String> byLength = new Comparator<String>() {
    @Override
    public int compare(String s1, String s2) {
        return s1.length() - s2.length();
    }
};
// Java 8 之后：lambda
Comparator<String> byLength = (s1, s2) -> s1.length() - s2.length();
```
为什么 lambda 和函数式接口配合得好：函数式接口只有一个抽象方法，lambda 正好提供一个方法的实现，没有歧义；两者一起简化代码、减少啰嗦。
effectively final：变量赋值后再也没有被修改过；lambda 里修改外部局部变量会编译错误。

**问题**：什么是 Lambda 表达式？为什么它只能用于函数式接口？

**答案要点**：
1. Lambda 是匿名方法，语法 (参数) -> 表达式 / { 语句 }
2. 用来替代实现函数式接口的匿名内部类，减少样板代码
3. 只能赋值给函数式接口：只有一个抽象方法，lambda 对应它，没有歧义
4. 捕获的局部变量必须是 final 或 effectively final
5. 参数类型可以由编译器推断，单参数可省略括号，单表达式可省略 return

**对比**：
| | 匿名内部类 | Lambda |
|---|---|---|
| 代码量 | 多，有样板代码 | 少 |
| 能实现的接口 | 任何接口或抽象类 | 只能是函数式接口 |
| this 指向 | 匿名类自己的实例 | 外层类的实例 |
| 编译结果 | 生成单独的 .class 文件 | 通过 invokedynamic 实现 |

**常见陷阱**：
- ❌ 在 lambda 里修改外面的局部变量，比如 count++
- ✅ 局部变量必须是 effectively final；需要累加可以用 AtomicInteger 或数组
- ❌ 把 lambda 赋值给有两个抽象方法的接口
- ✅ 只有函数式接口能作为 lambda 的目标类型

**追问**：
- Q: lambda 里的 this 指的是什么？
- A: 指外层类的实例；匿名内部类里的 this 指的是匿名类自己的实例

**代码题**：下面代码输出什么？

```java
Comparator<String> byLength = (s1, s2) -> s1.length() - s2.length();
List<String> list = new ArrayList<>(List.of("ccc", "a", "bb"));
list.sort(byLength);
System.out.println(list);
```

- [x] [a, bb, ccc]
- [ ] [ccc, bb, a]
- [ ] [a, ccc, bb]
- [ ] [bb, a, ccc]

解析：lambda 实现了 Comparator 的 compare 方法，按长度升序比较。

**代码题**：下面代码能编译吗？

```java
int count = 0;
Runnable r = () -> count++;
r.run();
System.out.println(count);
```

- [ ] 1
- [ ] 0
- [x] 编译错误
- [ ] 抛出 IllegalStateException

解析：lambda 里引用的局部变量必须是 final 或 effectively final，count++ 修改了它，编译报错。

**代码题**：下面代码输出什么？

```java
@FunctionalInterface
interface Printer {
    void print(String msg);
}
Printer p = msg -> System.out.println("[" + msg + "]");
p.print("hi");
```

- [x] [hi]
- [ ] hi
- [ ] [msg]
- [ ] 编译错误

解析：Printer 只有一个抽象方法 print，lambda msg -> ... 就是它的实现，调用 p.print("hi") 时执行 lambda 体。

**判断题**：
- ✅ Lambda 表达式可以用来替代实现函数式接口的匿名内部类 —— 写法更简洁
- ❌ Lambda 表达式可以赋值给任何接口类型的变量 —— 只能赋值给函数式接口

### 方法引用

**概念**：方法引用（Method Reference）是 lambda 的更短写法，通过方法名直接引用一个已有的方法，用 :: 表示

**一句话**：当 lambda 只是调用一个已有的方法时，可以写成方法引用：静态方法 ClassName::staticMethod，某个对象的实例方法 objectRef::instanceMethod，构造器 ClassName::new，还有特定类型任意对象的实例方法 ClassName::instanceMethod；System.out::println 就等价于 x -> System.out.println(x)。

**详细解释**：
A shorter alternative to lambda expressions；Refers to an existing method by name；Improves code readability。
四种写法：
Static method：ClassName::staticMethodName，例如 Integer::parseInt 等价于 s -> Integer.parseInt(s)
Instance method（特定对象）：objectRef::instanceMethodName，例如 System.out::println 等价于 x -> System.out.println(x)
Constructor：ClassName::new，例如 ArrayList::new 等价于 () -> new ArrayList<>()
特定类型的任意对象：ClassName::instanceMethodName，例如 String::toUpperCase 等价于 s -> s.toUpperCase()，String::compareTo 等价于 (a, b) -> a.compareTo(b)
课件的例子：`Printer p = System.out::println;`
方法引用的参数和返回值要和函数式接口的抽象方法匹配。

**问题**：什么是方法引用？有哪几种写法？

**答案要点**：
1. 方法引用是 lambda 的简写，直接引用已有的方法
2. 静态方法：ClassName::staticMethod
3. 特定对象的实例方法：objectRef::instanceMethod
4. 构造器：ClassName::new
5. 特定类型任意对象的实例方法：ClassName::instanceMethod，第一个参数作为调用者

**对比**：
| 方法引用 | 等价的 lambda |
|---|---|
| Integer::parseInt | s -> Integer.parseInt(s) |
| System.out::println | x -> System.out.println(x) |
| ArrayList::new | () -> new ArrayList<>() |
| String::toUpperCase | s -> s.toUpperCase() |
| String::compareTo | (a, b) -> a.compareTo(b) |

**常见陷阱**：
- ❌ 把构造器引用写成 new ClassName 或 ClassName::ClassName
- ✅ 构造器引用是 ClassName::new
- ❌ 以为 String::toUpperCase 只能用在 static 场景
- ✅ 它是"任意对象的实例方法"引用，第一个参数就是调用方法的那个对象

**追问**：
- Q: 什么时候用方法引用、什么时候用 lambda？
- A: lambda 只是原样调用一个已有方法时用方法引用更简洁；需要额外逻辑（比如拼接、判断）时用 lambda

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
List<String> list = new ArrayList<>(List.of("b", "a", "c"));
list.sort(String::compareTo);
list.forEach(System.out::print);
System.out.println();
Function<String, Integer> parse = Integer::parseInt;
Supplier<List<String>> maker = ArrayList::new;
System.out.println(parse.apply("42") + 1 + " " + maker.get().size());
```

- [x] abc 43 0
- [ ] abc 421 0
- [ ] cba 43 0
- [ ] abc 43 null

解析：String::compareTo 按字典序排序后逐个打印 abc；parse.apply("42") 得到 Integer 42，加 1 是数值相加得 43；ArrayList::new 每次创建一个新的空列表，大小为 0。

**代码题**：下面代码输出什么？

```java
BiFunction<String, String, Boolean> eq = String::equals;
Function<String, String> upper = String::toUpperCase;
System.out.println(eq.apply("a", "a") + " " + upper.apply("java"));
```

- [x] true JAVA
- [ ] false JAVA
- [ ] true java
- [ ] 编译错误

解析：String::equals 引用的是"任意 String 对象的实例方法"，第一个参数作为调用者：eq.apply("a", "a") 就是 "a".equals("a")；String::toUpperCase 同理。

**判断题**：
- ✅ System.out::println 等价于 x -> System.out.println(x) —— 这是"特定对象的实例方法"引用
- ❌ 构造器引用的写法是 new ClassName —— 构造器引用写成 ClassName::new

### 用 Comparator 组合排序（Java 8）

**概念**：Java 8 给 Comparator 加了 comparing、thenComparing、reversed 等 default / static 方法，配合 lambda 和方法引用可以一行写出多条件排序

**一句话**：Comparator.comparing(提取 key 的函数) 按某个字段排序，thenComparing 在前一个条件相等时再比较下一个条件，reversed() 反转顺序，Comparator.reverseOrder() 是自然顺序的逆序；这就是课件说的"Java 8 Enhances Custom Ordering"。

**详细解释**：
Java 8 用三个新特性增强了自定义排序：Functional Interface、Lambda Expressions、Method Reference。
```java
movies.sort(Comparator.comparing(Movie::getYear));                     // 按年份升序
movies.sort(Comparator.comparing(Movie::getRating).reversed());        // 按评分降序
movies.sort(Comparator.comparing(Movie::getYear)
                      .thenComparing(Movie::getName));                 // 先年份，再名字
```
comparingInt / comparingDouble 用于基本类型字段，避免装箱。
Comparator.nullsFirst / nullsLast 可以处理 null 值。
这些方法都返回新的 Comparator，不会修改原来的。

**问题**：Java 8 之后怎么简洁地写多条件排序？

**答案要点**：
1. Comparator.comparing(keyExtractor) 按某个字段排序
2. thenComparing 处理前面条件相等时的次级排序
3. reversed() 反转，Comparator.reverseOrder() 是自然顺序的逆序
4. comparingInt / comparingDouble 避免装箱
5. 配合方法引用（Movie::getYear）可读性最好

**常见陷阱**：
- ❌ 写 comparing(...).thenComparing(...).reversed()，以为只反转最后一个条件
- ✅ reversed() 反转的是整个组合后的比较器，只想反转某个条件要在那一层单独 reversed

**追问**：
- Q: list.sort(null) 会怎样？
- A: 按元素的自然顺序排序，元素必须实现 Comparable

**代码题**：下面代码输出什么？

```java
List<String> list = new ArrayList<>(List.of("bob", "Al", "cy", "dave"));
list.sort(Comparator.comparing(String::length).thenComparing(Comparator.reverseOrder()));
System.out.println(list);
```

- [x] [cy, Al, bob, dave]
- [ ] [Al, cy, bob, dave]
- [ ] [bob, cy, Al, dave]
- [ ] [dave, bob, cy, Al]

解析：先按长度升序：Al、cy（2）、bob（3）、dave（4）；长度相同时用逆自然顺序比较：'c' 大于 'A'，逆序后 cy 排在 Al 前面。

**判断题**：
- ✅ Comparator.comparing 可以配合方法引用写排序条件 —— 比如 Comparator.comparing(Movie::getYear)
- ❌ thenComparing 会替换前面的排序条件 —— 它只在前面的条件比较结果为 0 时才起作用
