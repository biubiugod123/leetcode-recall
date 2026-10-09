# Stream API

### Stream 的特点

**概念**：Stream 是 Java 8 引入的、用来处理对象集合的 API；一个 stream 是一个对象序列，支持把多个操作串成流水线（pipeline）得到结果

**一句话**：Stream 不是数据结构、不存储数据，它从集合、数组或 I/O 通道获取数据，不修改原始数据源，而是通过"中间操作 + 终止操作"的流水线产生新结果；一个 stream 只能被消费一次。

**详细解释**：
Main features：
A Stream is not a data structure, meaning it does not store data。
It takes input from sources like Collections, Arrays, or I/O channels。
Streams do not modify the original data source. They produce a new result based on a pipeline of operations。
Two types of operations：Intermediate（takes a stream, returns a stream，可以链式调用）；Terminal（marks the end of the stream, and return the actual result）。
PPT 的例子：从人员列表里取出所有成年人的名字，转成大写并按字母排序：
```java
return input.stream()              // Stream<Person>
    .filter(p -> p.age >= 18)      // 成年人
    .map(p -> p.name)              // Stream<String>
    .map(String::toUpperCase)
    .sorted()                      // 自然顺序（字典序）
    .collect(Collectors.toList()); // List<String>
```
创建 stream：collection.stream()、Arrays.stream(arr)、Stream.of(...)、IntStream.range(0, n)。
注意和 java.io 的 InputStream / OutputStream 是两回事。

**问题**：什么是 Stream API？它有什么特点？

**答案要点**：
1. Java 8 引入，用声明式的流水线处理集合数据
2. 不存储数据，数据来自集合、数组、I/O
3. 不修改数据源，产生新的结果
4. 由中间操作（返回 stream，可链式）和终止操作（产生结果）组成
5. 一个 stream 只能消费一次，再用会抛 IllegalStateException

**常见陷阱**：
- ❌ 以为 stream().sorted() 会把原来的 List 排好序
- ✅ Stream 不修改数据源，要用 collect 拿到新列表，或者直接 list.sort(...)
- ❌ 把同一个 stream 变量用两次
- ✅ 终止操作之后 stream 就关闭了，需要重新从数据源创建

**追问**：
- Q: sorted() 不传参数时按什么排序？
- A: 按元素的自然顺序（Comparable），元素没有实现 Comparable 会在终止操作时抛 ClassCastException；可以传 Comparator 自定义

**代码题**：下面代码输出什么？

```java
class Person {
    String name;
    int age;
    Person(String name, int age) { this.name = name; this.age = age; }
}
List<Person> people = List.of(new Person("Carson", 17), new Person("bob", 22), new Person("Alice", 24));
List<String> result = people.stream()
        .filter(p -> p.age >= 18)
        .map(p -> p.name)
        .map(String::toUpperCase)
        .sorted()
        .collect(Collectors.toList());
System.out.println(result);
```

- [x] [ALICE, BOB]
- [ ] [BOB, ALICE]
- [ ] [ALICE, BOB, CARSON]
- [ ] [Alice, bob]

解析：Carson 17 岁被 filter 过滤掉；剩下的名字转大写后是 BOB、ALICE，sorted() 按字典序排成 [ALICE, BOB]。

**代码题**：下面代码输出什么？

```java
List<Integer> nums = new ArrayList<>(List.of(3, 1, 2));
List<Integer> sorted = nums.stream().sorted().collect(Collectors.toList());
System.out.println(sorted + " " + nums);
```

- [x] [1, 2, 3] [3, 1, 2]
- [ ] [1, 2, 3] [1, 2, 3]
- [ ] [3, 1, 2] [3, 1, 2]
- [ ] [3, 1, 2] [1, 2, 3]

解析：Stream 不修改原始数据源，sorted 的结果收集到了一个新的 List，nums 保持原样。

**代码题**：下面代码运行结果是什么？

```java
Stream<String> s = Stream.of("a", "b");
s.forEach(x -> { });
System.out.println(s.count());
```

- [ ] 2
- [ ] 0
- [x] 抛出 IllegalStateException
- [ ] 编译错误

解析：forEach 是终止操作，执行后 stream 就被消费掉了；再调用 count() 抛 IllegalStateException（stream has already been operated upon or closed）。

**判断题**：
- ✅ Stream 不会修改原始的数据源 —— 它基于流水线产生新的结果
- ❌ Stream 是一种存储数据的数据结构 —— Stream 不存储数据，数据来自集合、数组等数据源

### 中间操作与终止操作

**概念**：中间操作（intermediate）返回一个新的 stream，可以链式调用，并且是惰性执行的；终止操作（terminal）返回非 stream 的结果或什么都不返回，调用它才会真正触发整条流水线执行

**一句话**：map、filter、distinct、sorted、limit、skip 是中间操作，调用时只是记录下来，不会执行；forEach、toArray、collect、min、count、anyMatch 是终止操作，调用后才一次性执行；limit、anyMatch 这类短路操作找到结果就停，不会处理剩下的元素。

**详细解释**：
Return value：Intermediate operations return a stream as a result and terminal operations return non-stream values like primitive or object or collection or may not return anything。
Intermediate operations are lazily executed：When you call intermediate operations, they are actually not executed. They are just stored in the memory and executed when the terminal operation is called on the stream。
例如 `Stream<Person> stream = input.stream().filter(p -> p.age >= 18);` 这一行执行完，filter 一个元素都还没检查。
执行方式：元素是一个一个"纵向"流过整条流水线的，而不是先对所有元素做完 filter 再统一做 map。
短路操作：limit、findFirst、anyMatch、allMatch、noneMatch 找到结果就停止。
常用收集：Collectors.toList / toSet / joining / groupingBy / counting；归约：reduce(初始值, 累加函数)。

**问题**：Stream 的中间操作和终止操作有什么区别？什么是惰性求值？

**答案要点**：
1. 中间操作返回 stream，可以链式调用；终止操作返回结果或不返回
2. 中间操作是惰性的，只有调用终止操作时才执行
3. 中间操作：map、filter、distinct、sorted、limit、skip
4. 终止操作：forEach、toArray、collect、min、count、anyMatch、reduce
5. 元素逐个流过流水线，limit / anyMatch 等可以短路

**对比**：
| | 中间操作 | 终止操作 |
|---|---|---|
| 返回值 | Stream | 非 Stream 的结果或 void |
| 执行时机 | 惰性，不立即执行 | 立即执行，触发整条流水线 |
| 能否链式调用 | 能 | 调用后流水线结束 |
| 例子 | map、filter、sorted、limit | collect、forEach、count、anyMatch |

**常见陷阱**：
- ❌ 只写了 filter / map 没有终止操作，以为代码已经执行了
- ✅ 没有终止操作，中间操作里的逻辑（包括打印）一次都不会运行

**追问**：
- Q: 惰性求值有什么好处？
- A: 可以合并多个操作一次遍历完成，配合 limit / findFirst 短路时能少处理很多元素，甚至能处理无限流（Stream.iterate）

**代码题**：下面代码输出什么？

```java
List<Integer> nums = List.of(1, 2, 3);
Stream<Integer> s = nums.stream().filter(x -> {
    System.out.print("check" + x + " ");
    return x > 1;
});
System.out.print("before ");
System.out.println(s.count());
```

- [x] before check1 check2 check3 2
- [ ] check1 check2 check3 before 2
- [ ] before 2
- [ ] check1 check2 check3 2 before

解析：filter 是中间操作，定义时不执行；先打印 before，直到调用终止操作 count() 才逐个检查元素，最后有 2 个元素大于 1。

**代码题**：下面代码输出什么？

```java
Stream.of(5, 3, 8, 1, 9)
        .filter(x -> x > 2)
        .limit(2)
        .forEach(x -> System.out.print(x + " "));
System.out.println();
```

- [x] 5 3
- [ ] 5 3 8
- [ ] 3 5
- [ ] 8 9

解析：按原顺序过滤出大于 2 的元素，limit(2) 只取前两个：5 和 3；取够之后流水线就停止，不再处理后面的元素。

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
List<Integer> nums = List.of(4, 2, 4, 7, 2, 9);
System.out.println(nums.stream().distinct().skip(1).collect(Collectors.toList()));
System.out.println(nums.stream().anyMatch(x -> x > 8) + " " + nums.stream().min(Integer::compare).get());
List<String> words = List.of("apple", "bob", "avocado");
System.out.println(words.stream().map(String::length).reduce(0, Integer::sum) + " " + words.stream().filter(w -> w.startsWith("a")).collect(Collectors.joining(",")));
```

- [x] [2, 7, 9] true 2 15 apple,avocado
- [ ] [4, 2, 7, 9] true 2 15 apple,avocado
- [ ] [2, 7, 9] false 2 15 apple,avocado
- [ ] [2, 7, 9] true 2 3 apple,avocado

解析：distinct 按出现顺序去重得 [4, 2, 7, 9]，skip(1) 跳过第一个；9 大于 8，anyMatch 为 true；最小值是 2；长度 5 + 3 + 7 = 15；以 a 开头的单词用逗号连接。

**判断题**：
- ✅ 中间操作在调用终止操作之前不会执行 —— 中间操作是惰性的
- ❌ count() 是中间操作 —— count() 返回 long，是终止操作
