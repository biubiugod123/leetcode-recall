# Queue与Set

### Queue 与 PriorityQueue

**概念**：Queue 是元素有顺序的集合，一般是先进先出（FIFO），定义了一个可以访问的队头（head）

**一句话**：offer 入队、poll 取出并删除队头、peek 只看队头，队列为空时 poll 和 peek 返回 null；LinkedList 实现的队列，队头是最早放进去的元素；PriorityQueue 的队头是最小（或按 Comparator 最大）的元素，但它只保证队头有序。

**详细解释**：
FIFO：First In First Out。
三个常用方法：offer()、poll()、peek()；对应的会抛异常的版本是 add()、remove()、element()。
Queue 的实现：LinkedList<E>：head 是队列中的第一个元素；PriorityQueue<E>：head 是最小 / 最大的元素。
PriorityQueue 底层是二叉堆，默认小顶堆；传入 Comparator.reverseOrder() 变成大顶堆。offer / poll 是 O(log n)，peek 是 O(1)。
直接打印或遍历 PriorityQueue 看到的是堆数组的顺序，不保证有序；只有不断 poll 才能按顺序取出。

**问题**：Queue 有哪些常用方法？PriorityQueue 和普通队列有什么区别？

**答案要点**：
1. Queue 一般是 FIFO，有一个队头 head
2. offer 入队，poll 出队并删除，peek 只看不删
3. 队列为空时 poll / peek 返回 null，remove / element 抛异常
4. LinkedList 实现的队列按插入顺序出队
5. PriorityQueue 是堆，队头是最小 / 最大元素，遍历不保证有序

**对比**：
| 作用 | 返回特殊值 | 抛异常 |
|---|---|---|
| 入队 | offer() 返回 false | add() |
| 出队 | poll() 返回 null | remove() |
| 看队头 | peek() 返回 null | element() |

**常见陷阱**：
- ❌ 以为打印 PriorityQueue 会得到排好序的结果
- ✅ 只有队头保证最小，要有序就不断 poll
- ❌ 空队列上用 remove() 取元素
- ✅ remove() 会抛异常，不确定是否为空时用 poll()

**追问**：
- Q: 怎么用 PriorityQueue 找数组里最大的 k 个数？
- A: 维护一个大小为 k 的小顶堆，元素比堆顶大就替换堆顶，最后堆里就是最大的 k 个，复杂度 O(n log k)

**代码题**：下面代码输出什么？

```java
Queue<Integer> q = new LinkedList<>();
q.offer(3);
q.offer(1);
q.offer(2);
System.out.println(q.poll() + " " + q.peek() + " " + q.size());
```

- [x] 3 1 2
- [ ] 1 2 2
- [ ] 3 1 1
- [ ] 3 3 3

解析：LinkedList 实现的队列先进先出：poll 取出并删除最早放入的 3；peek 只看新的队头 1，不删除；剩下 2 个元素。

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
Queue<Integer> pq = new PriorityQueue<>();
pq.offer(3);
pq.offer(1);
pq.offer(2);
System.out.println(pq.poll() + " " + pq.poll() + " " + pq.poll());
Queue<String> empty = new LinkedList<>();
System.out.println(empty.poll() + " " + empty.peek());
```

- [x] 1 2 3 null null
- [ ] 3 1 2 null null
- [ ] 1 2 3 抛出异常
- [ ] 3 2 1 null null

解析：PriorityQueue 默认小顶堆，每次 poll 取出当前最小的元素；空队列上 poll 和 peek 都返回 null，不抛异常。

**判断题**：
- ✅ 队列为空时 poll() 返回 null —— 想在空队列时抛异常要用 remove()
- ❌ 直接遍历 PriorityQueue 得到的元素是完全有序的 —— 只有队头保证是最小（或最大）的

### Set 与三种实现

**概念**：Set 是不允许重复元素的集合，没有比 Collection 多出的方法，只是 add() 不允许加入重复元素

**一句话**：重复元素 add 会返回 false，集合不变；HashSet 不保留插入顺序，LinkedHashSet 保留插入顺序，TreeSet 按自然顺序或 Comparator 排序；HashSet 靠 hashCode 和 equals 判断重复，TreeSet 靠 compareTo / compare 判断重复。

**详细解释**：
Set contains no methods other than those inherited from Collection；区别只在 add() 的限制：no duplicate elements are allowed。
HashSet<E>：底层是 HashMap（元素作为 key），插入顺序 NOT preserved，add / contains 平均 O(1)。
LinkedHashSet<E>：继承 HashSet，额外用双向链表记录插入顺序，插入顺序 IS preserved。
TreeSet<E>：底层是红黑树，元素排好序，add / contains 是 O(log n)；元素必须可比较（实现 Comparable 或提供 Comparator）。
常见用法：用 new HashSet<>(list) 给 List 去重；需要去重又保持原顺序用 LinkedHashSet。

**问题**：HashSet、LinkedHashSet、TreeSet 有什么区别？

**答案要点**：
1. Set 不允许重复，add 重复元素返回 false
2. HashSet：无序，底层 HashMap，平均 O(1)
3. LinkedHashSet：保留插入顺序
4. TreeSet：排序，底层红黑树，O(log n)
5. HashSet 用 hashCode + equals 判重，TreeSet 用比较结果为 0 判重

**对比**：
| 实现 | 顺序 | 底层 | 判重依据 |
|---|---|---|---|
| HashSet | 不保证 | HashMap | hashCode + equals |
| LinkedHashSet | 插入顺序 | HashMap + 双向链表 | hashCode + equals |
| TreeSet | 排序 | 红黑树 | compareTo / compare 为 0 |

**常见陷阱**：
- ❌ 依赖 HashSet 的遍历顺序
- ✅ HashSet 不保证顺序，需要顺序就用 LinkedHashSet 或 TreeSet

**追问**：
- Q: 自定义类放进 HashSet 需要注意什么？
- A: 要同时重写 equals 和 hashCode，否则内容相同的对象会被当成不同元素

**代码题**：下面代码输出什么？

```java
Set<String> set = new LinkedHashSet<>();
System.out.print(set.add("b") + " ");
System.out.print(set.add("a") + " ");
System.out.print(set.add("b") + " ");
System.out.println(set);
```

- [x] true true false [b, a]
- [ ] true true true [b, a, b]
- [ ] true true false [a, b]
- [ ] true true true [b, a]

解析：第二次 add("b") 是重复元素，返回 false 且集合不变；LinkedHashSet 保留插入顺序，所以是 [b, a]。

**代码题**：下面代码输出什么？

```java
Set<Integer> set = new TreeSet<>(List.of(5, 1, 3, 1));
System.out.println(set);
```

- [x] [1, 3, 5]
- [ ] [5, 1, 3]
- [ ] [1, 1, 3, 5]
- [ ] [5, 3, 1]

解析：TreeSet 去重并按自然顺序（数值升序）排序。

**判断题**：
- ✅ LinkedHashSet 会保留元素的插入顺序 —— 它用双向链表记录插入顺序
- ❌ HashSet 会保留元素的插入顺序 —— HashSet 不保证任何顺序
