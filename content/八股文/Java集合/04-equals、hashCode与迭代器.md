# equals、hashCode与迭代器

### equals 的约定与 == 的区别

**概念**：equals 比较两个对象逻辑上是否相等（logical equality）；== 比较两个引用是否指向同一个对象

**一句话**：Object 默认的 equals 和 == 一样比较引用，String、Integer 等类重写成比较值；重写 equals 要满足自反、对称、传递、一致、非空五条约定，参数类型必须是 Object；== 不能被重写。

**详细解释**：
Usage of equals()：比较逻辑相等；Object 里的默认实现比较引用；常被重写来比较值（比如 String、Integer）。
Java Contract：
Reflexive：x.equals(x) 必须为 true
Symmetric：x.equals(y) 为 true，则 y.equals(x) 也必须为 true
Transitive：x.equals(y) 且 y.equals(z)，则 x.equals(z) 也必须为 true
Consistent：对象没变时，多次调用结果相同
Non-null：x.equals(null) 必须为 false
equals vs ==：== compares object references，不能 override；equals() compares object content（if overridden），常被重写做自定义的值比较。
常见错误：写成 `public boolean equals(Person o)`，这是重载（overload）而不是重写，集合类调用的 equals(Object) 不会用到它；加上 @Override 编译器就能发现。

**问题**：equals 和 == 有什么区别？重写 equals 要遵守哪些约定？

**答案要点**：
1. == 比较引用（是否同一个对象），不能被重写
2. equals 默认也比较引用，重写后比较内容
3. 五条约定：自反、对称、传递、一致、非空
4. 参数类型必须是 Object，写成具体类型就变成了重载
5. 重写 equals 时必须同时重写 hashCode

**对比**：
| | == | equals() |
|---|---|---|
| 比较什么 | 引用是否相同 | 对象内容（重写之后） |
| 能否重写 | 不能 | 能 |
| 默认行为 | 比较引用 | Object 的实现也是比较引用 |
| 用于基本类型 | 比较值 | 不能调用 |

**常见陷阱**：
- ❌ 把 equals 的参数写成自己的类型，比如 equals(Point o)
- ✅ 必须是 equals(Object o)，并加上 @Override
- ❌ 在 equals 里不处理 null，直接强转
- ✅ 先用 instanceof 判断，instanceof 遇到 null 返回 false，正好满足非空约定

**追问**：
- Q: equals 里用 getClass() 判断和用 instanceof 判断有什么区别？
- A: getClass() 要求类型完全相同，子类对象和父类对象永远不相等；instanceof 允许子类，但父子类都重写 equals 时容易破坏对称性

**代码题**：下面代码输出什么？

```java
class Point {
    int x;
    Point(int x) { this.x = x; }
    @Override
    public boolean equals(Object o) {
        if (!(o instanceof Point)) return false;
        return ((Point) o).x == x;
    }
}
Point a = new Point(1);
Point b = new Point(1);
System.out.println((a == b) + " " + a.equals(b) + " " + a.equals(null));
```

- [x] false true false
- [ ] true true false
- [ ] false true 抛出异常
- [ ] false false false

解析：a 和 b 是两个对象，== 为 false；重写的 equals 按 x 比较，为 true；null instanceof Point 为 false，所以 equals(null) 返回 false，满足非空约定。

**代码题**：下面代码输出什么？

```java
class Point {
    int x;
    Point(int x) { this.x = x; }
    public boolean equals(Point o) { return o != null && o.x == x; }
}
List<Point> list = new ArrayList<>();
list.add(new Point(1));
System.out.println(new Point(1).equals(new Point(1)) + " " + list.contains(new Point(1)));
```

- [x] true false
- [ ] true true
- [ ] false false
- [ ] 编译错误

解析：equals(Point) 是重载不是重写；直接调用时参数是 Point，匹配到它，结果为 true；list.contains 内部调用的是 equals(Object)，仍是 Object 的默认实现（比较引用），所以为 false。

**判断题**：
- ✅ x.equals(null) 必须返回 false —— 这是 equals 的 Non-null 约定
- ❌ == 运算符可以在类里被重写 —— Java 不支持运算符重写，== 永远比较引用（或基本类型的值）

### hashCode 与 equals 在 HashMap 中的约定

**概念**：HashMap 用 hashCode() 决定 bucket，用 equals() 在 bucket 里找到正确的 key；所以重写 equals 必须相应地重写 hashCode

**一句话**：约定是 equals 为 true 的两个对象 hashCode 必须相等，hashCode 相等的两个对象 equals 可以为 false；违反约定会让 HashMap、HashSet、Hashtable 出错——相等的对象落进不同的 bucket，导致查不到或重复存放。

**详细解释**：
HashMap uses：hashCode() to determine the bucket；equals() to find the correct key in that bucket if collision happens。
If you override equals(), you MUST override hashCode() accordingly。
Contract：
If a.equals(b) is true, then a.hashCode() == b.hashCode() must be true
If a.hashCode() == b.hashCode(), a.equals(b) may return false
常见写法：equals 里比较哪些字段，hashCode 就用同样的字段计算，比如 `Objects.hash(name, age)`。
可变的 key：对象作为 key 放进 HashMap 之后又修改了参与 hashCode 的字段，hashCode 变了，用它自己也找不到原来那条记录；所以 key 最好是不可变对象（String、Integer）。

**问题**：为什么重写 equals 必须重写 hashCode？HashMap 是怎么用这两个方法的？

**答案要点**：
1. HashMap 先用 hashCode 找 bucket，再用 equals 在 bucket 里比较
2. 约定：equals 相等 ⇒ hashCode 相等；hashCode 相等 ⇏ equals 相等
3. 只重写 equals：相等的对象落进不同 bucket，HashSet 重复、HashMap 查不到
4. equals 和 hashCode 要用相同的字段计算
5. 作为 key 的对象最好不可变，放进去后不要改参与计算的字段

**常见陷阱**：
- ❌ 只重写 equals，不重写 hashCode
- ✅ 两个一起重写，用相同的字段
- ❌ 把对象放进 HashSet / HashMap 后修改它的字段
- ✅ hashCode 变了以后对象就"丢"在旧 bucket 里，contains、get、remove 都找不到

**追问**：
- Q: hashCode 直接返回一个常数（比如 1）合法吗？有什么问题？
- A: 合法，不违反约定；但所有元素都落进同一个 bucket，HashMap 退化成链表 / 树，性能变差

**代码题**：下面代码输出什么？

```java
class P {
    int id;
    P(int id) { this.id = id; }
    @Override public boolean equals(Object o) { return o instanceof P && ((P) o).id == id; }
    @Override public int hashCode() { return Integer.hashCode(id); }
}
Set<P> set = new HashSet<>();
set.add(new P(1));
set.add(new P(1));
System.out.println(set.size());
```

- [x] 1
- [ ] 2
- [ ] 0
- [ ] 编译错误

解析：equals 和 hashCode 都按 id 重写了，两个 P(1) 的 hashCode 相同、equals 为 true，HashSet 认为是同一个元素，只保存一份。

**代码题**：下面代码输出什么？

```java
class Key {
    int id;
    Key(int id) { this.id = id; }
    @Override public boolean equals(Object o) { return o instanceof Key && ((Key) o).id == id; }
    @Override public int hashCode() { return id; }
}
Map<Key, String> map = new HashMap<>();
Key k = new Key(1);
map.put(k, "one");
k.id = 2;
System.out.println(map.get(k) + " " + map.get(new Key(1)) + " " + map.size());
```

- [x] null null 1
- [ ] one null 1
- [ ] null one 1
- [ ] one one 1

解析：放入时按 hashCode 1 存进对应的 bucket；之后 k.id 改成 2，用 k 查会去 2 号 bucket，找不到；用 new Key(1) 能找到原来的 bucket，但桶里那个 key 现在 id 是 2，equals 不相等，也找不到；记录还在，size 仍是 1。

**判断题**：
- ✅ 重写了 equals 就必须重写 hashCode —— 否则相等的对象可能有不同的 hashCode，破坏 HashMap / HashSet
- ❌ 两个对象 hashCode 相等，equals 一定为 true —— 不同对象可能发生哈希冲突

### fail-fast 与 fail-safe 迭代器

**概念**：fail-fast 迭代器在遍历时发现集合被结构性修改就立即抛 ConcurrentModificationException；fail-safe 迭代器允许遍历时修改，不抛异常

**一句话**：增强 for 和显式 Iterator 都靠 hasNext() / next() 遍历；ArrayList、HashMap 的迭代器是 fail-fast 的，遍历时用集合自己的 add / remove 会抛 ConcurrentModificationException，要删除就用 iterator.remove() 或 removeIf；ConcurrentHashMap、CopyOnWriteArrayList 的迭代器是 fail-safe 的，不抛异常，但不一定能看到这次修改。

**详细解释**：
Java iterators：增强 for 循环和显式 Iterator 都会用到；Iterator.hasNext() 和 iterator.next() 用来遍历集合；不同的集合有不同类型的迭代器。
Fail-fast：检测遍历过程中的结构性修改（add / remove），抛 ConcurrentModificationException；例子：ArrayList、HashMap。原理是集合维护一个修改计数 modCount，迭代器每次 next() 时检查它和创建时记下的值是否一致。
Fail-safe：允许遍历时做结构性修改，不抛异常；迭代器可能反映、也可能不反映这次修改；例子：ConcurrentHashMap、CopyOnWriteArrayList（课件写作 CopyOnWriteList）。CopyOnWriteArrayList 每次修改都复制一个新数组，迭代器遍历的是旧数组的快照。
安全删除：`Iterator.remove()` 或 Java 8 的 `list.removeIf(x -> ...)`。

**问题**：什么是 fail-fast 和 fail-safe 迭代器？遍历 ArrayList 时怎么安全地删除元素？

**答案要点**：
1. fail-fast：遍历中发现结构性修改就抛 ConcurrentModificationException
2. ArrayList、HashMap 的迭代器是 fail-fast，靠 modCount 检测
3. fail-safe：允许修改、不抛异常，可能看不到修改（ConcurrentHashMap、CopyOnWriteArrayList）
4. 遍历时删除要用 iterator.remove() 或 removeIf
5. fail-fast 是尽力检测，不能用它来保证线程安全

**对比**：
| | fail-fast | fail-safe |
|---|---|---|
| 遍历时修改 | 抛 ConcurrentModificationException | 不抛异常 |
| 能否看到修改 | — | 不一定 |
| 例子 | ArrayList、HashMap | ConcurrentHashMap、CopyOnWriteArrayList |
| 原理 | 检查 modCount | 快照或弱一致性遍历 |

**常见陷阱**：
- ❌ 在增强 for 循环里调用 list.remove(x)
- ✅ 用 Iterator 的 remove()，或者 list.removeIf(...)
- ❌ 以为 ConcurrentModificationException 只在多线程下出现
- ✅ 单线程里边遍历边修改也会触发

**追问**：
- Q: CopyOnWriteArrayList 适合什么场景？
- A: 读多写少的场景，比如监听器列表；每次写都复制整个数组，写多时开销很大

**代码题**：下面代码运行结果是什么？

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
for (Integer x : list) {
    if (x == 1) list.remove(x);
}
System.out.println(list);
```

- [ ] [2, 3, 4]
- [ ] [1, 2, 3, 4]
- [x] 抛出 ConcurrentModificationException
- [ ] 编译错误

解析：增强 for 底层用的是 ArrayList 的 fail-fast 迭代器；删除元素后 modCount 变了，下一次 next() 检测到结构性修改，抛 ConcurrentModificationException。

**代码题**：下面代码输出什么？

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4));
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove();
}
System.out.println(list);
```

- [x] [1, 3]
- [ ] [2, 4]
- [ ] 抛出 ConcurrentModificationException
- [ ] [1, 2, 3, 4]

解析：通过迭代器自己的 remove() 删除，迭代器会同步更新预期的修改计数，不会抛异常；偶数被删掉，剩下 [1, 3]。

**代码题**：下面代码输出什么？

```java
List<Integer> list = new java.util.concurrent.CopyOnWriteArrayList<>(List.of(1, 2, 3));
for (Integer x : list) {
    if (x == 1) list.add(4);
}
System.out.println(list);
```

- [x] [1, 2, 3, 4]
- [ ] [1, 2, 3]
- [ ] 抛出 ConcurrentModificationException
- [ ] [1, 2, 3, 4, 4]

解析：CopyOnWriteArrayList 的迭代器是 fail-safe 的，遍历的是创建迭代器时的快照，所以不抛异常，也不会遍历到新加的 4；遍历结束后列表里有 4 个元素。

**判断题**：
- ✅ 遍历 ArrayList 时用 iterator.remove() 删除元素是安全的 —— 迭代器会同步更新修改计数
- ❌ 遍历 ConcurrentHashMap 时修改它会抛 ConcurrentModificationException —— 它的迭代器是 fail-safe 的，不抛异常
