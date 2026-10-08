# Map

### Map 接口与三种实现

**概念**：Map 是把 key 映射到 value 的对象（k-v pairs），key 唯一，一个 key 只对应一个 value；Map 不继承 Collection

**一句话**：key 和 value 都必须是对象（基本类型要装箱），put 同一个 key 会覆盖旧值并返回旧值；没有哈希冲突时 get / put 是 O(1)；HashMap 不保证顺序，LinkedHashMap 保持插入顺序，TreeMap 按 key 的自然顺序排序。

**详细解释**：
常用方法：put、get、remove、containsKey、containsValue、keySet()（返回 Set，因为 key 不重复）、values()（返回 Collection，因为 value 可以重复）、size、isEmpty、clear。
put 返回这个 key 之前的 value（之前没有就返回 null）；get 找不到返回 null，可以用 getOrDefault 给默认值。
体系：Map ← Hashtable、HashMap（← LinkedHashMap）、SortedMap ← NavigableMap ← TreeMap。
HashMap：No ordering；LinkedHashMap：Maintains insertion order；TreeMap：Maintains natural order（底层红黑树，get / put 是 O(log n)，有 firstKey 等方法）。
Hashtable 是 JDK 1.0 的老类，方法都是 synchronized，key 和 value 都不能为 null；现在多线程场景用 ConcurrentHashMap。

**问题**：Map 有什么特点？HashMap、LinkedHashMap、TreeMap 有什么区别？

**答案要点**：
1. Map 存 k-v 对，key 唯一，一个 key 对应一个 value
2. key 和 value 都是对象，基本类型会自动装箱
3. Map 不继承 Collection，keySet 返回 Set，values 返回 Collection
4. HashMap 无序、O(1)；LinkedHashMap 插入顺序；TreeMap 按 key 排序、O(log n)
5. put 已有的 key 会覆盖并返回旧值

**对比**：
| 实现 | 顺序 | 底层 | get / put |
|---|---|---|---|
| HashMap | 不保证 | 数组 + 链表 / 红黑树 | 平均 O(1) |
| LinkedHashMap | 插入顺序 | HashMap + 双向链表 | 平均 O(1) |
| TreeMap | key 的自然顺序 | 红黑树 | O(log n) |
| Hashtable | 不保证 | 哈希表，方法加锁 | 平均 O(1) |

**常见陷阱**：
- ❌ 依赖 HashMap 的 keySet 打印顺序
- ✅ HashMap 的顺序 may vary，需要顺序用 LinkedHashMap 或 TreeMap
- ❌ 用 map.get(key) == null 判断 key 是否存在
- ✅ value 本身可能是 null，判断存在要用 containsKey

**追问**：
- Q: 怎么用 LinkedHashMap 实现 LRU 缓存？
- A: 构造时传 accessOrder = true，让访问过的元素移到末尾；再重写 removeEldestEntry，超过容量时返回 true 删除最久没访问的元素

**代码题**：下面代码输出什么？

```java
Map<String, Integer> map = new HashMap<>();
System.out.print(map.put("a", 1) + " ");
System.out.print(map.put("a", 2) + " ");
System.out.println(map.get("a") + " " + map.size());
```

- [x] null 1 2 1
- [ ] null null 2 2
- [ ] 1 2 2 1
- [ ] null 1 1 1

解析：第一次 put 时 key 不存在，返回 null；第二次 put 同一个 key 会覆盖，返回旧值 1；最后 a 对应 2，Map 里只有 1 个键值对。

**代码题**：下面代码输出什么？

```java
Map<Integer, String> linked = new LinkedHashMap<>();
Map<Integer, String> tree = new TreeMap<>();
for (int k : new int[]{1, 3, 2}) {
    linked.put(k, "v" + k);
    tree.put(k, "v" + k);
}
System.out.println(linked.keySet() + " " + tree.keySet());
```

- [x] [1, 3, 2] [1, 2, 3]
- [ ] [1, 2, 3] [1, 2, 3]
- [ ] [1, 3, 2] [1, 3, 2]
- [ ] [1, 2, 3] [1, 3, 2]

解析：LinkedHashMap 保持插入顺序 1、3、2；TreeMap 按 key 的自然顺序排成 1、2、3。

**判断题**：
- ✅ TreeMap 会按 key 的自然顺序排序 —— 底层是红黑树，key 必须可比较
- ❌ Map 里可以有两个相同的 key —— key 必须唯一，put 相同的 key 会覆盖旧值

### HashMap 的底层实现

**概念**：HashMap 用 hashing 把 key 转成 hash code，再由 hash code 决定 k-v 对放在底层数组的哪个 bucket；冲突的元素在同一个 bucket 里用链表串起来，Java 8 起冲突多了会转成红黑树

**一句话**：put 时先算 key 的 hashCode 找到 bucket，bucket 里没有相同的 key 就新增节点，有就覆盖；get 时同样先定位 bucket，再用 equals 在桶里找 key；没有冲突时是 O(1)，链表长度达到 8 且数组长度至少 64 时链表转红黑树；元素超过 容量 × 0.75 时扩容为 2 倍。

**详细解释**：
Hashing：用 hashCode() 把对象转成一个 int（hash code），这个值决定 entry 存在哪个 bucket。
Bucket：底层数组里的一个格子，可以存一个或多个 k-v 对（entry / node），它们用链表串起来（冲突严重时变成树，Java 8 起）。
课件的例子：用字母序号相加当哈希，Alex 和 Dirk 都是 42，发生冲突，放在同一个 bucket 的链表里；get("Dirk") 先到 42 号 bucket，再用 equals 逐个比较找到 Dirk。
默认容量 16，负载因子 0.75；HashMap 允许一个 null key（放在 0 号 bucket）。
Java 8 前链表用头插法，Java 8 起改成尾插法，并加入了红黑树。

**问题**：说一下 HashMap 的底层实现原理

**答案要点**：
1. 底层是数组（bucket）+ 链表，Java 8 起冲突多时链表转红黑树
2. put / get 先用 hashCode 定位 bucket，再用 equals 在桶内找 key
3. 没有冲突时 get / put 是 O(1)，冲突严重时退化，树化后是 O(log n)
4. 链表长度 ≥ 8 且数组长度 ≥ 64 时树化
5. 默认容量 16，负载因子 0.75，超过阈值扩容为 2 倍

**常见陷阱**：
- ❌ 认为 HashMap 的 get 永远是 O(1)
- ✅ 大量冲突时会退化（链表 O(n)，树化后 O(log n)），O(1) 是平均情况
- ❌ 认为 hashCode 相同的两个 key 会互相覆盖
- ✅ hashCode 相同只是落进同一个 bucket，equals 不同就是两个不同的 key

**追问**：
- Q: 为什么数组长度要是 2 的幂？
- A: 下标用 hash & (n - 1) 计算，n 是 2 的幂时等价于取模但更快，扩容时元素要么留在原位置，要么移动 n 个位置
- Q: HashMap 线程安全吗？
- A: 不安全，多线程并发 put 可能丢数据；需要线程安全用 ConcurrentHashMap

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
System.out.println("Aa".hashCode() == "BB".hashCode());
Map<String, Integer> map = new HashMap<>();
map.put("Aa", 1);
map.put("BB", 2);
System.out.println(map.size() + " " + map.get("BB"));
```

- [x] true 2 2
- [ ] true 1 2
- [ ] false 2 2
- [ ] true 1 1

解析："Aa" 和 "BB" 的 hashCode 恰好相同（都是 2112），会落进同一个 bucket；但 equals 不同，HashMap 把它们当成两个 key，各自保存。

**代码题**：下面代码输出什么？

```java
Map<String, Integer> map = new HashMap<>();
map.put(null, 1);
map.put(null, 2);
System.out.println(map.size() + " " + map.get(null));
```

- [x] 1 2
- [ ] 2 2
- [ ] 抛出 NullPointerException
- [ ] 1 1

解析：HashMap 允许一个 null key，第二次 put 覆盖了第一次的值；换成 Hashtable 或 TreeMap（自然顺序）就会抛 NullPointerException。

**判断题**：
- ✅ Java 8 起 HashMap 的 bucket 冲突过多时会把链表转成红黑树 —— 查找从 O(n) 降到 O(log n)
- ❌ hashCode 相同的两个 key，后放入的会覆盖先放入的 —— 只有 equals 也相等才会覆盖，否则是同一个 bucket 里的两个节点
