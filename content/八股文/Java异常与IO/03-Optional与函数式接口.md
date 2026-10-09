# Optional与函数式接口

### Optional

**概念**：Optional 是 Java 8 引入的容器对象，里面可能有一个非 null 的值，也可能为空，用来代替直接返回 null

**一句话**：用 Optional.ofNullable(x) 把可能为 null 的值包起来，再用 isPresent / ifPresent / orElse / orElseGet / filter / map 处理"有值"和"没值"两种情况，减少到处判 null 和 NullPointerException；Optional.of(null) 会直接抛 NPE，空 Optional 调 get() 会抛 NoSuchElementException。

**详细解释**：
PPT 的例子：
```java
String input = null;
Optional<String> name = Optional.ofNullable(input);
if (name.isPresent()) {
    System.out.println("Name: " + name.get());
} else {
    System.out.println("Name is missing");
}
System.out.println(name.orElse("Default Name"));
```
常用方法：empty()、of(T value)（值不能为 null）、ofNullable(T value)、ifPresent(Consumer)、isPresent()、orElse(T other)、orElseGet(Supplier)、filter(Predicate)；另外还有 map、flatMap、orElseThrow。
orElse(x) 的参数 x 无论有没有值都会先被计算；orElseGet(supplier) 只有为空时才调用 supplier，默认值计算代价大时用它。
Optional 主要用作方法返回值，不推荐用作字段或方法参数，也不能被序列化。

**问题**：Optional 是什么？有哪些常用方法？orElse 和 orElseGet 有什么区别？

**答案要点**：
1. Optional 是可能为空的容器，用来表示"值可能不存在"，代替返回 null
2. 创建：of（不能为 null）、ofNullable、empty
3. 判断与取值：isPresent、ifPresent、orElse、orElseGet、orElseThrow
4. 转换：filter、map、flatMap
5. orElse 的默认值总会被计算，orElseGet 只在为空时才调用

**对比**：
| 方法 | 有值时 | 没值时 |
|---|---|---|
| orElse(x) | 返回值（x 也已经被计算了） | 返回 x |
| orElseGet(sup) | 返回值，不调用 sup | 调用 sup 并返回结果 |
| orElseThrow() | 返回值 | 抛 NoSuchElementException |
| get() | 返回值 | 抛 NoSuchElementException |

**常见陷阱**：
- ❌ 用 Optional.of(可能为 null 的值)
- ✅ 可能为 null 时用 Optional.ofNullable，of(null) 会直接抛 NPE
- ❌ 先 isPresent() 再 get()，写法和判 null 没区别
- ✅ 优先用 orElse / ifPresent / map 这类链式写法

**追问**：
- Q: Optional 适合用在哪里？
- A: 主要用作可能查不到结果的方法的返回值，比如 findById；不建议用作字段、方法参数或集合元素

**代码题**：下面代码输出什么？

```java
String input = null;
Optional<String> name = Optional.ofNullable(input);
System.out.println(name.isPresent() + " " + name.orElse("Default Name"));
```

- [x] false Default Name
- [ ] true null
- [ ] false null
- [ ] 抛出 NullPointerException

解析：ofNullable(null) 得到空 Optional，isPresent() 为 false，orElse 返回默认值。

**代码题**：下面代码输出什么？

```java
Optional<String> opt = Optional.of("java");
System.out.println(opt.filter(s -> s.length() > 5).orElse("short") + " " + opt.map(String::toUpperCase).get());
```

- [x] short JAVA
- [ ] java JAVA
- [ ] short java
- [ ] 抛出 NoSuchElementException

解析："java" 长度是 4，不满足 filter 条件，得到空 Optional，orElse 返回 "short"；map 把值转成大写 "JAVA"，get() 取出。

**代码题**：下面代码输出什么？

```java
class T {
    static String fallback() {
        System.out.print("called ");
        return "x";
    }
}
Optional<String> opt = Optional.of("a");
System.out.print(opt.orElse(T.fallback()) + " ");
System.out.println(opt.orElseGet(T::fallback));
```

- [x] called a a
- [ ] a a
- [ ] called a called a
- [ ] x x

解析：orElse 的参数在调用前就会被计算，所以即使有值也会执行 fallback() 打印 called；orElseGet 只有在为空时才调用 supplier，这里有值，不会调用。

**代码题**：下面代码运行结果是什么？

```java
Optional<String> opt = Optional.of(null);
System.out.println(opt.isPresent());
```

- [ ] false
- [ ] true
- [x] 抛出 NullPointerException
- [ ] 编译错误

解析：Optional.of 要求值不为 null，传入 null 直接抛 NullPointerException；可能为 null 时应该用 ofNullable。

**判断题**：
- ✅ Optional.ofNullable(null) 返回一个空的 Optional —— 不会抛异常
- ❌ orElseGet 的 Supplier 无论 Optional 是否有值都会被调用 —— 只有为空时才调用；总会被计算的是 orElse 的参数

### 常用函数式接口与组合方法

**概念**：java.util.function 包里最常用的四个函数式接口是 Consumer、Supplier、Function、Predicate，它们还提供 andThen、compose、and、or、negate 等 default 方法用来组合

**一句话**：Consumer<T> 接收一个参数不返回（accept，andThen 串联两个操作）；Supplier<T> 不接收参数、返回结果（get）；Function<T,R> 接收参数返回结果（apply，andThen 先自己后别人，compose 先别人后自己）；Predicate<T> 返回 boolean（test，and / or / negate 组合条件）。

**详细解释**：
Consumer<T>：Represents an operation that accepts a single input argument and returns no result；void accept(T t)；Consumer<T> andThen(Consumer<? super T> after)。
Supplier<T>：Represents a supplier of results；T get()。
Function<T,R>：Represents a function that accepts one argument and produces a result；R apply(T t)；f.andThen(g) 是先 f 后 g，f.compose(g) 是先 g 后 f。
Predicate<T>：Represents a predicate (boolean-valued function) of one argument；boolean test(T t)；and、or、negate，以及静态方法 Predicate.not。
这些组合方法都是接口里的 default 方法，这正是 Java 8 给接口加 default 方法的用处之一。
基本类型版本：IntPredicate、IntFunction、ToIntFunction 等，避免装箱；两个参数的版本：BiFunction、BiConsumer、BiPredicate。

**问题**：Consumer、Supplier、Function、Predicate 分别是什么？怎么组合使用？

**答案要点**：
1. Consumer：accept(T)，只消费不返回，andThen 串联
2. Supplier：get()，不接收参数，提供结果
3. Function：apply(T) 返回 R，andThen 先自己后别人，compose 相反
4. Predicate：test(T) 返回 boolean，and / or / negate 组合条件
5. 组合方法都是 default 方法；还有 Bi 版本和基本类型版本

**对比**：
| 接口 | 方法 | 组合方法 |
|---|---|---|
| Consumer<T> | void accept(T t) | andThen |
| Supplier<T> | T get() | 无 |
| Function<T, R> | R apply(T t) | andThen、compose、identity |
| Predicate<T> | boolean test(T t) | and、or、negate、not |

**常见陷阱**：
- ❌ 把 Function 的 andThen 和 compose 的顺序搞反
- ✅ f.andThen(g).apply(x) = g(f(x))；f.compose(g).apply(x) = f(g(x))

**追问**：
- Q: Runnable 和 Supplier 有什么区别？
- A: Runnable 的 run() 既不接收参数也不返回值；Supplier 的 get() 不接收参数但有返回值

**代码题**：下面代码输出什么？

```java
Consumer<String> hello = s -> System.out.print("hello " + s + " ");
Consumer<String> bye = s -> System.out.print("bye " + s + " ");
hello.andThen(bye).accept("tom");
Function<Integer, Integer> plus1 = x -> x + 1;
Function<Integer, Integer> times2 = x -> x * 2;
System.out.println(plus1.andThen(times2).apply(3) + " " + plus1.compose(times2).apply(3));
```

- [x] hello tom bye tom 8 7
- [ ] hello tom bye tom 7 8
- [ ] bye tom hello tom 8 7
- [ ] hello tom 8 7

解析：andThen 先执行 hello 再执行 bye；plus1.andThen(times2) 是 (3 + 1) * 2 = 8；plus1.compose(times2) 先乘再加：3 * 2 + 1 = 7。

**代码题**：下面代码输出什么？

```java
Predicate<Integer> positive = x -> x > 0;
Predicate<Integer> even = x -> x % 2 == 0;
System.out.println(positive.and(even).test(4) + " " + positive.negate().test(4) + " " + positive.or(even).test(-2));
```

- [x] true false true
- [ ] true true true
- [ ] false false true
- [ ] true false false

解析：4 是正数也是偶数，and 为 true；negate 取反，4 是正数所以为 false；-2 不是正数但是偶数，or 为 true。

**判断题**：
- ✅ Consumer 的 andThen 会先执行自己，再执行参数里的 Consumer —— 两个操作按顺序串联
- ❌ Supplier<T> 的抽象方法需要一个参数 —— Supplier 的 get() 不接收任何参数

### 接口的 default、static 方法与 forEach

**概念**：Java 8 起接口里可以写有方法体的 default 方法和 static 方法；Iterable 接口借此新增了 default 方法 forEach(Consumer)

**一句话**：default 方法让接口在不破坏已有实现类的前提下增加新方法，实现类可以直接用也可以重写；static 方法通过接口名调用，不会被实现类继承；所有集合都因此可以 list.forEach(...)，Map 也有 forEach((k, v) -> ...)。

**详细解释**：
```java
interface Greeter {
    String name();
    default String greet() { return "Hi " + name(); }   // 实现类可以直接用或重写
    static Greeter of(String n) { return () -> n; }       // 通过 Greeter.of(...) 调用
}
```
为什么要加：Java 8 要给 Iterable 加 forEach、给 Collection 加 stream() 和 removeIf()，如果是普通抽象方法，所有已有的集合实现类（包括第三方库的）都会编译不过。
冲突规则：类的方法优先于接口的 default 方法；两个接口有同名 default 方法时，实现类必须重写，可以用 接口名.super.方法() 选择。
forEach：Iterable 的 default void forEach(Consumer<? super T> action)；Map 的 default void forEach(BiConsumer<? super K, ? super V> action)。

**问题**：Java 8 为什么允许接口有 default 方法？default 和 static 方法有什么区别？

**答案要点**：
1. default 方法有方法体，实现类可以直接继承使用，也可以重写
2. 目的：给已有接口加新方法（如 forEach、stream）而不破坏已有实现类
3. static 方法属于接口本身，只能通过接口名调用，不被实现类继承
4. 两个接口的 default 方法冲突时，实现类必须重写
5. Iterable.forEach 和 Map.forEach 都是 default 方法

**对比**：
| | default 方法 | static 方法 |
|---|---|---|
| 调用方式 | 通过实现类的对象 | 通过接口名 |
| 能否被重写 | 能 | 不能（不会被继承） |
| 用途 | 给接口增加默认行为 | 提供工具方法、工厂方法 |

**常见陷阱**：
- ❌ 通过实现类或实现类的对象调用接口的 static 方法
- ✅ 接口的 static 方法只能用 接口名.方法() 调用

**追问**：
- Q: 有了 default 方法，接口和抽象类还有什么区别？
- A: 接口仍然不能有实例字段（状态）和构造器，一个类可以实现多个接口；抽象类可以有状态和构造器，但只能单继承

**代码题**：下面代码输出什么？

```java
interface Greeter {
    String name();
    default String greet() { return "Hi " + name(); }
    static Greeter of(String n) { return () -> n; }
}
System.out.println(Greeter.of("Ann").greet());
```

- [x] Hi Ann
- [ ] Ann
- [ ] Hi null
- [ ] 编译错误

解析：Greeter 只有一个抽象方法 name()，是函数式接口，static 方法 of 用 lambda 返回一个实现；greet() 是 default 方法，调用 name() 拼出 "Hi Ann"。

**代码题**：下面代码输出什么？

```java
List<String> list = List.of("a", "b");
list.forEach(s -> System.out.print(s.toUpperCase()));
Map<String, Integer> map = new TreeMap<>(Map.of("x", 1, "y", 2));
map.forEach((k, v) -> System.out.print(" " + k + "=" + v));
System.out.println();
```

- [x] AB x=1 y=2
- [ ] ab x=1 y=2
- [ ] AB x y
- [ ] AB 1 2

解析：Iterable.forEach 对每个元素执行 Consumer；Map.forEach 接收 BiConsumer，同时拿到 key 和 value；TreeMap 按 key 排序，所以是 x 再 y。

**判断题**：
- ✅ Java 8 起 Iterable 接口有 default 方法 forEach —— 所以所有集合都可以直接调用 forEach
- ❌ 接口的 static 方法可以通过实现类的对象调用 —— 只能通过接口名调用
