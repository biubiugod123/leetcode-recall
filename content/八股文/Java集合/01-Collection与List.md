# Collection与List

### Collection 体系结构

**概念**：Collection 是"一组对象"的根接口，继承自 Iterable，下面分成 List、Queue、Set 三条主线；Map 不属于 Collection，有自己单独的体系

**一句话**：Iterable → Collection → List（有序可重复）/ Queue（有队头）/ Set（不重复）；所有 Collection 实现类都有无参构造 T() 和用另一个集合初始化的 T(Collection c)；常用方法有 size、contains、add、remove、iterator。

**详细解释**：
Collection 本身没有规定元素是否有序、是否可以重复，这些由 List、Set、Queue 决定。
主要实现：List → ArrayList、LinkedList、Vector（→ Stack）；Queue → PriorityQueue、Deque（→ ArrayDeque、LinkedList）；Set → HashSet、LinkedHashSet、SortedSet（→ TreeSet）。
公共构造器：`new ArrayList<>()`；`new HashSet<>(list)` 用已有集合初始化，常用来给 List 去重。
Collection 接口的方法：size、isEmpty、contains、containsAll、add、addAll、remove、removeAll、clear、toArray、iterator；add / remove 在集合真的被改变时才返回 true。
Arrays.asList(...) 返回固定长度的 List，可以 set，但 add / remove 会抛 UnsupportedOperationException。

**问题**：说一下 Java 集合框架的体系结构

**答案要点**：
1. Collection 继承 Iterable，是 List、Queue、Set 的父接口
2. List 有序可重复，Set 不重复，Queue 按顺序从队头取
3. Map 不继承 Collection，是单独的体系
4. 实现类都有 T() 和 T(Collection c) 两个构造器
5. 核心方法：size、contains、add、remove、iterator

**常见陷阱**：
- ❌ 把 Map 也说成 Collection 的子接口
- ✅ Map 存的是键值对，有自己的体系，不继承 Collection
- ❌ 对 Arrays.asList 返回的 List 调用 add
- ✅ 它是固定长度的，要可变就包一层 new ArrayList<>(Arrays.asList(...))

**追问**：
- Q: Collection 和 Collections 有什么区别？
- A: Collection 是集合的根接口；Collections 是工具类，提供 sort、reverse、unmodifiableList 等静态方法

**代码题**：下面代码输出什么？

```java
List<Integer> list = Arrays.asList(1, 1, 3, 4, 5);
Set<Integer> set = new HashSet<>(list);
System.out.println(list.size() + " " + set.size() + " " + set.contains(3));
```

- [x] 5 4 true
- [ ] 5 5 true
- [ ] 4 4 true
- [ ] 5 4 false

解析：List 允许重复，有 5 个元素；用 T(Collection c) 构造 HashSet 时会去重，剩下 1、3、4、5 共 4 个。

**代码题**：下面代码运行结果是什么？

```java
List<Integer> list = Arrays.asList(1, 2, 3);
list.add(4);
System.out.println(list);
```

- [ ] [1, 2, 3, 4]
- [ ] [1, 2, 3]
- [x] 抛出 UnsupportedOperationException
- [ ] 编译错误

解析：Arrays.asList 返回的是包装数组的固定长度 List，不支持 add / remove，运行时抛 UnsupportedOperationException。

**判断题**：
- ✅ Collection 接口继承了 Iterable 接口 —— 所以所有 Collection 都能用增强 for 循环遍历
- ❌ Map 接口继承了 Collection 接口 —— Map 有单独的体系，不继承 Collection

### ArrayList 与 LinkedList

**概念**：List 是有序、可重复、能按位置访问的集合；ArrayList 底层是数组，LinkedList 底层是双向链表

**一句话**：ArrayList 按下标访问 O(1)、在末尾添加均摊 O(1)，但在头部或中间插入删除要移动元素，是 O(n)；LinkedList 按下标访问要从头走，是 O(n)，但在头尾增删是 O(1)；绝大多数场景用 ArrayList。

**详细解释**：
List 的特点：可以重复；保留插入顺序；可以指定插入位置；可以按 index 访问。
List 额外的方法：get(int index)、set(int index, E e)、add(int index, E e)、remove(int index)、addAll(int index, Collection c)、indexOf、lastIndexOf、subList(from, to)。indexOf 找不到返回 -1，subList 是左闭右开。
ArrayList：get(index) O(1)；add(element) O(1)（扩容时要复制，所以是均摊）；add(0, element) O(n)；remove(index) O(n)。
LinkedList：get(index) O(n)；addFirst / getFirst / addLast / getLast O(1)；remove(index) O(n)（先要找到位置）；通过 Iterator 删除当前节点是 O(1)。
LinkedList 同时实现了 List 和 Deque，可以当队列、双端队列用。

**问题**：ArrayList 和 LinkedList 有什么区别？分别适合什么场景？

**答案要点**：
1. ArrayList 底层是数组，LinkedList 底层是双向链表
2. ArrayList 随机访问 O(1)，LinkedList 随机访问 O(n)
3. ArrayList 头部 / 中间增删 O(n)，末尾添加均摊 O(1)
4. LinkedList 头尾增删 O(1)，按位置增删要先遍历找到位置
5. 读多、随机访问多用 ArrayList；频繁头尾操作用 LinkedList 或 ArrayDeque

**对比**：
| 操作 | ArrayList | LinkedList |
|---|---|---|
| get(index) | O(1) | O(n) |
| 末尾添加 | 均摊 O(1) | O(1) |
| 头部插入 | O(n) | O(1) |
| remove(index) | O(n)（移动元素） | O(n)（查找位置） |
| 内存 | 连续数组，占用少 | 每个节点多两个指针 |

**常见陷阱**：
- ❌ 认为 LinkedList 任何位置插入都是 O(1)
- ✅ 按 index 插入要先遍历找到位置，是 O(n)；只有已经拿到节点或在头尾时才是 O(1)
- ❌ 用 for (int i...) + get(i) 遍历 LinkedList
- ✅ 每次 get(i) 都是 O(n)，整体变成 O(n²)，应该用增强 for 或 Iterator

**追问**：
- Q: ArrayList 怎么扩容？
- A: 容量不够时创建一个约 1.5 倍大小的新数组并复制原数据，所以末尾添加是均摊 O(1)；能预估大小时可以在构造时指定初始容量

**代码题**：下面代码输出什么？

```java
List<String> list = new ArrayList<>(List.of("a", "b", "c", "d"));
list.add(1, "x");
list.remove(3);
System.out.println(list + " " + list.indexOf("c") + " " + list.subList(1, 3));
```

- [x] [a, x, b, d] -1 [x, b]
- [ ] [a, x, c, d] 2 [x, c]
- [ ] [a, x, b, d] -1 [x, b, d]
- [ ] [a, b, x, d] -1 [b, x]

解析：add(1, "x") 后是 [a, x, b, c, d]；remove(3) 删除下标 3 的 "c"，剩 [a, x, b, d]；找不到 "c" 返回 -1；subList(1, 3) 左闭右开，取下标 1、2。

**代码题**：下面代码输出什么？

```java
LinkedList<Integer> list = new LinkedList<>();
list.addLast(2);
list.addFirst(1);
list.addLast(3);
System.out.println(list.getFirst() + " " + list.getLast() + " " + list.get(1));
```

- [x] 1 3 2
- [ ] 2 3 1
- [ ] 1 2 3
- [ ] 3 1 2

解析：依次得到 [2] → [1, 2] → [1, 2, 3]；头是 1，尾是 3，下标 1 的元素是 2。

**判断题**：
- ✅ ArrayList 的 get(index) 是 O(1) —— 底层数组可以按下标直接访问
- ❌ LinkedList 的 get(index) 是 O(1) —— 需要从头或尾一个个走过去，是 O(n)
