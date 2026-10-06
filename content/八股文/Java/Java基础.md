# Java基础

### 类、对象与实例

**概念**：Class 是创建对象的模板（blueprint），Object / Instance 是按模板在堆上创建出来的具体对象

**一句话**：类是模板，规定对象有哪些字段（状态）和方法（行为）；用 new 按模板在堆上创建出的具体对象就是实例，每个实例有自己的一份字段。

**详细解释**：
对象 = 数据 + 对数据的操作，也就是 fields + methods。
`Person p = new Person("Tom");` 里，`Person` 是类，`new Person("Tom")` 在堆上创建对象，`p` 只是一个指向它的引用变量。
同一个类可以创建多个实例，彼此的字段互不影响；反过来，多个引用变量也可以指向同一个实例。

**问题**：类、对象、实例有什么区别？`Person p = new Person("Tom")` 这一行里分别是谁？

**答案要点**：
1. 类是模板：声明字段、构造器和方法
2. 对象 / 实例是按类创建出来的具体实体，存放在堆上
3. `p` 是引用变量，存的是对象的引用，不是对象本身
4. 每个实例有独立的实例字段；多个引用可以指向同一个实例

**常见陷阱**：
- ❌ 说"p 就是那个对象"
- ✅ p 是引用变量，对象在堆上，p 只是指向它

**追问**：
- Q: `Person p2 = p1;` 之后改 p2.name，p1.name 会变吗？
- A: 会。赋值只复制引用，p1 和 p2 指向同一个对象
- Q: 一个类可以不写构造器吗？
- A: 可以，编译器会生成无参默认构造器；但只要写了任意一个构造器，就不会再自动生成无参构造器

**代码题**：下面代码输出什么？

```java
class Person {
    String name;
    Person(String name) { this.name = name; }
}
Person p1 = new Person("Tom");
Person p2 = p1;
p2.name = "Alice";
System.out.println(p1.name);
```

- [ ] Tom
- [x] Alice
- [ ] null
- [ ] 编译错误

解析：`p2 = p1` 只复制引用，两个变量指向同一个对象，通过 p2 改字段，p1 看到的也是改后的值。

**判断题**：
- ❌ 每声明一个引用变量就会创建一个对象 —— `Person p;` 只是声明，只有 new（或反射、clone 等）才会创建对象
- ✅ 写了带参构造器后，编译器不再自动生成无参构造器 —— 此时 `new Person()` 会编译错误

### 基本类型与引用类型（值传递）

**概念**：基本类型变量直接存值；引用类型变量存的是指向堆上对象的引用

**一句话**：8 种基本类型的变量里直接放值，其余（类、数组、接口、String）都是引用类型，变量里放的是对象的引用；Java 方法传参永远是值传递——基本类型传值的副本，引用类型传引用的副本。

**详细解释**：
`int x = 10;` 变量里就是 10。
`ArrayList<Integer> list = new ArrayList<>();` 里 list 存的是引用，ArrayList 对象在堆上。
传参时把引用复制一份给形参：在方法里通过它修改对象内容，外面看得到；但让形参指向一个新对象，外面的变量不受影响。

**问题**：基本类型和引用类型有什么区别？Java 是值传递还是引用传递？

**答案要点**：
1. 基本类型共 8 种，变量直接保存值
2. 引用类型变量保存对象的引用，对象本身在堆上
3. Java 只有值传递：引用类型传的是"引用的副本"
4. 方法内改对象内容，外部可见；给形参重新赋值，外部不可见

**对比**：
| | 基本类型 | 引用类型 |
|---|---|---|
| 变量里存的 | 值本身 | 对象的引用 |
| 成员变量默认值 | 0 / false / '\u0000' | null |
| == 比较 | 值是否相等 | 是否同一个对象 |
| 能否为 null | 不能 | 能 |

**常见陷阱**：
- ❌ "对象是引用传递，所以 Java 同时有值传递和引用传递"
- ✅ 传的是引用的副本，本质仍是值传递；方法里让形参指向新对象，外面不变

**追问**：
- Q: 方法里写 `s = "changed"` 能改掉外面的 String 吗？
- A: 不能。只是让形参指向新字符串；而且 String 不可变，也没法通过引用改它的内容

**代码题**：下面代码输出什么？

```java
class Demo {
    static void change(int x, int[] arr, String s) {
        x = 100;
        arr[0] = 100;
        s = "changed";
    }
}
int x = 1;
int[] arr = {1};
String s = "origin";
Demo.change(x, arr, s);
System.out.println(x + " " + arr[0] + " " + s);
```

- [ ] 100 100 changed
- [x] 1 100 origin
- [ ] 1 1 origin
- [ ] 1 100 changed

解析：x 传的是值的副本；arr 传的是引用的副本，通过它改数组内容外面看得见；s 在方法里被指向新字符串，外面的 s 不受影响。

**代码题**：下面代码输出什么？

```java
class Demo {
    static void reset(int[] arr) {
        arr = new int[]{0, 0};
        arr[0] = 9;
    }
}
int[] nums = {1, 2};
Demo.reset(nums);
System.out.println(nums[0]);
```

- [x] 1
- [ ] 9
- [ ] 0
- [ ] 编译错误

解析：形参 arr 一开始是 nums 引用的副本，但随后被指向一个新数组，之后的修改都发生在新数组上，nums 指向的原数组没变。

**判断题**：
- ❌ Java 对对象使用引用传递 —— Java 只有值传递，对象传的是引用的副本
- ✅ 基本类型的变量不能赋值为 null —— `int x = null;` 编译错误，包装类 Integer 才可以

### 8 种基本数据类型

**概念**：byte、short、int、long、float、double、char、boolean

**一句话**：4 种整数（byte 8 位、short 16、int 32、long 64）、2 种浮点（float 32、double 64）、char 16 位、boolean；成员变量有默认值，局部变量没有，必须先赋值再使用。

**详细解释**：
整数范围：byte -128~127，short -32768~32767，int -2^31~2^31-1（Integer.MAX_VALUE = 2147483647），long -2^63~2^63-1。
默认值只针对成员变量和数组元素：数值为 0 / 0L / 0.0f / 0.0d，char 为 '\u0000'，boolean 为 false，引用为 null。
整数溢出不会报错，而是按补码"绕回去"：Integer.MAX_VALUE + 1 等于 Integer.MIN_VALUE。
float / double 是二进制浮点数，0.1 + 0.2 != 0.3，金额计算要用 BigDecimal。

**问题**：Java 有哪些基本数据类型？各占多少位、默认值是什么？

**答案要点**：
1. 整数：byte 8、short 16、int 32、long 64 位
2. 浮点：float 32、double 64 位，小数字面量默认是 double
3. char 16 位（一个 UTF-16 码元），boolean 只有 true / false
4. 成员变量和数组元素有默认值，局部变量必须显式初始化
5. 整数溢出静默绕回，浮点数有精度误差

**常见陷阱**：
- ❌ 把 String 也算作基本类型
- ✅ String 是引用类型（final 类），基本类型只有 8 种
- ❌ 认为整数溢出会抛异常
- ✅ 溢出会静默绕回，需要检测时用 Math.addExact

**追问**：
- Q: 为什么金额不能用 double？
- A: 二进制浮点无法精确表示 0.1 这类十进制小数，会有误差；用 BigDecimal，并且用字符串构造
- Q: char 能存中文吗？
- A: 能存基本多文种平面里的字符（如常用汉字）；超出 BMP 的字符（如部分 emoji）要用两个 char 表示

**代码题**：下面代码输出什么？

```java
int x;
System.out.println(x);
```

- [ ] 0
- [x] 编译错误
- [ ] null
- [ ] 抛出 NullPointerException

解析：局部变量没有默认值，编译器报 "variable x might not have been initialized"。只有成员变量和数组元素才有默认值。

**代码题**：下面代码输出什么？

```java
int big = Integer.MAX_VALUE;
big++;
System.out.println(big);
```

- [ ] 2147483648
- [x] -2147483648
- [ ] 抛出 ArithmeticException
- [ ] 编译错误

解析：int 溢出不会报错，2147483647 + 1 按补码绕回到 int 的最小值 -2147483648。

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
System.out.println(0.1 + 0.2 == 0.3);
System.out.println(0.1 + 0.2);
```

- [ ] true 0.3
- [x] false 0.30000000000000004
- [ ] false 0.3
- [ ] true 0.30000000000000004

解析：0.1 和 0.2 在二进制里都是无限循环小数，存储时已有误差，相加结果不等于 0.3。

**判断题**：
- ❌ boolean 固定占 1 bit —— 语言规范没有规定 boolean 的大小；HotSpot 中单个 boolean 按 int 处理，boolean 数组每个元素占 1 字节
- ✅ `new int[3]` 里的元素都是 0 —— 数组元素和成员变量一样会被初始化为默认值

### 字面量

**概念**：直接写在代码里的值，比如 10、3.14、'A'、"Hi"、true、null

**一句话**：整数字面量默认是 int，加 L 才是 long；小数默认是 double，加 f 才是 float；0 开头是八进制、0x 十六进制、0b 二进制，下划线只为可读。

**详细解释**：
`float f = 3.0;` 编译错误，因为 3.0 是 double，要写 3.0f。
`long l = 2147483648;` 也编译错误：字面量本身超出了 int 范围，要写 2147483648L。
`010` 是八进制的 8；`09` 编译错误，因为八进制没有数字 9。
`1_000_000` 等于 1000000，下划线不能放在开头、结尾或小数点旁边。
`'A'` 是 char，`"A"` 是 String；`null` 表示引用不指向任何对象；Java 的条件必须是 boolean，不能写 `if (1)`。

**问题**：Java 字面量有哪些写法？`float f = 3.0;` 为什么编译不过？

**答案要点**：
1. 整数默认 int，超出 int 范围要加 L
2. 小数默认 double，float 必须加 f / F
3. 进制前缀：0 八进制、0x 十六进制、0b 二进制
4. 下划线只为可读，不改变数值
5. char 用单引号，String 用双引号，boolean 只有 true / false

**常见陷阱**：
- ❌ 以为 `long l = 2147483648;` 会自动变成 long
- ✅ 字面量先按 int 解析，超范围直接编译错误，必须加 L
- ❌ 用小写 l 做 long 后缀
- ✅ 用大写 L，小写 l 很容易看成 1

**追问**：
- Q: `int x = 010;` 之后 x 是多少？
- A: 8，以 0 开头的整数是八进制
- Q: Java 可以写 `if (1)` 吗？
- A: 不行，条件必须是 boolean，int 不能隐式转成 boolean

**代码题**：下面代码输出什么？

```java
System.out.println(010 + 0x10 + 0b10);
```

- [x] 26
- [ ] 28
- [ ] 30
- [ ] 编译错误

解析：010 是八进制 8，0x10 是十六进制 16，0b10 是二进制 2，8 + 16 + 2 = 26。

**代码题**：下面代码输出什么？

```java
float f = 3.0;
System.out.println(f);
```

- [ ] 3.0
- [ ] 3
- [x] 编译错误
- [ ] 抛出 ClassCastException

解析：3.0 是 double 字面量，double → float 是窄化转换，不能隐式进行，要写 3.0f。

**判断题**：
- ❌ `int x = 09;` 表示十进制 9 —— 0 开头是八进制，八进制没有数字 9，编译错误
- ✅ `1_000_000 == 1000000` 为 true —— 下划线只是为了可读，不影响数值

### 类型转换：Widening 与 Narrowing

**概念**：小范围类型 → 大范围类型自动转换（widening）；大 → 小必须强制转换（narrowing casting），可能丢失精度

**一句话**：byte→short→int→long→float→double（以及 char→int）可以自动拓宽，反方向必须写 (type) 强转，会截断小数或溢出；混合运算时先把操作数提升到较大的类型再算。

**详细解释**：
`double y = 10;` 自动拓宽；`int y = (int) 3.99;` 得到 3（直接截断，不是四舍五入）。
二元运算的数值提升：byte / short / char 先提升为 int；只要有一边是 long / float / double，就提升到那个类型。所以 `5 / 2` 是 int 除法得 2，`5 / 2.0` 得 2.5。
`short s = 1; s = s + 1;` 编译错误（s + 1 是 int），但 `s += 1;` 可以，复合赋值自带强转。
long → float 虽然能自动拓宽，但 float 只有 24 位有效精度，大的 long 会丢精度。

**问题**：Java 的自动类型转换和强制类型转换规则是什么？有哪些坑？

**答案要点**：
1. 拓宽顺序：byte→short→int→long→float→double，char→int
2. 窄化必须显式强转，小数直接截断，整数可能溢出
3. 运算时 byte / short / char 先提升为 int，混合类型提升到较大的类型
4. 复合赋值（+= 等）隐含强转，普通赋值不会

**常见陷阱**：
- ❌ 认为 (int) 3.99 会四舍五入得 4
- ✅ 强转直接截断小数部分，四舍五入用 Math.round
- ❌ 认为自动拓宽一定不丢精度
- ✅ int→float、long→float / double 都可能丢精度

**追问**：
- Q: `byte b = 10; b = b * 2;` 能编译吗？
- A: 不能，b * 2 是 int；要写 `b = (byte) (b * 2)` 或 `b *= 2`
- Q: `(byte) 200` 等于多少？
- A: -56。200 超出 byte 范围，只保留低 8 位按补码解释：200 - 256 = -56

**代码题**：下面代码输出什么？

```java
int i = 5 / 2;
double d = 5 / 2;
double e = 5 / 2.0;
System.out.println(i + " " + d + " " + e);
```

- [x] 2 2.0 2.5
- [ ] 2 2.5 2.5
- [ ] 2.5 2.5 2.5
- [ ] 2 2 2.5

解析：5 / 2 是 int 除法得 2，赋给 double 后才变成 2.0；只要有一边是 double（2.0），就做浮点除法得 2.5。

**代码题**：下面代码输出什么？

```java
int m = (int) (5.0 / 2.0);
double n = (int) 5.0 / 2.0;
System.out.println(m + " " + n);
```

- [x] 2 2.5
- [ ] 2 2.0
- [ ] 2.5 2.5
- [ ] 3 2.5

解析：m 先算出 2.5 再强转，截断为 2；n 的强转只作用于 5.0，得到 int 5，5 / 2.0 仍是浮点除法，得 2.5。

**代码题**：下面代码输出什么？

```java
short s = 1;
s = s + 1;
System.out.println(s);
```

- [ ] 2
- [x] 编译错误
- [ ] 1
- [ ] 抛出 ArithmeticException

解析：s + 1 中 s 被提升为 int，结果是 int，赋回 short 需要强转。改成 `s += 1;` 就能编译，复合赋值自带强转。

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
System.out.println((char) 75);
System.out.println('A' + 1);
System.out.println((byte) 200);
```

- [x] K 66 -56
- [ ] K B -56
- [ ] 75 66 200
- [ ] K B 200

解析：(char) 75 是 Unicode 75 对应的 'K'；'A' + 1 中 char 被提升为 int，得到 66；200 超出 byte 范围，截断为 -56。

**判断题**：
- ✅ `short s = 1; s += 1;` 可以编译 —— 复合赋值等价于 s = (short) (s + 1)
- ❌ long 转 float 是自动拓宽，所以一定不丢精度 —— float 只有 24 位有效精度，大的 long 会丢精度
- ❌ `(int) -3.7` 的结果是 -4 —— 强转向 0 截断，结果是 -3

### 声明、初始化与实例化

**概念**：Declaration 声明类型和名字；Initialization 给变量第一次赋值；Instantiation 用 new 创建对象

**一句话**：`List<Integer> list = new ArrayList<>();` 一行做了三件事：声明引用变量 list，用 new 实例化一个 ArrayList 对象，再把对象的引用赋给 list 完成初始化。

**详细解释**：
声明：`int a;`、`List<Integer> list;` 只是告诉编译器名字和类型，不会创建对象。
实例化：`new ArrayList<>()` 在堆上分配对象并执行构造器。
初始化：变量第一次被赋值，比如 `a = 100;`、`list = new ArrayList<>();`。
基本类型没有实例化这一步；引用变量可以只声明不实例化，作为成员变量时默认是 null。

**问题**：解释 declaration、initialization、instantiation 的区别

**答案要点**：
1. 声明：类型 + 变量名，不创建对象
2. 实例化：new 在堆上创建对象并执行构造器
3. 初始化：给变量第一次赋值，基本类型也有
4. `Type x = new Type()` 一行同时包含三者

**常见陷阱**：
- ❌ 把初始化和实例化当成一回事
- ✅ 初始化是给变量赋值，实例化专指创建对象

**追问**：
- Q: `Person p = null;` 算初始化吗？创建对象了吗？
- A: 算初始化（赋了 null），但没有实例化，没有任何对象被创建

**判断题**：
- ✅ `Person p;` 不会创建任何 Person 对象 —— 只是声明了一个引用变量
- ❌ 基本类型变量也需要用 new 实例化 —— 基本类型直接存值，`int a = 1;` 只有声明和初始化

### 包装类、自动装箱与拆箱

**概念**：每种基本类型都有对应的包装类（Integer、Double 等），让基本值可以当对象使用

**一句话**：泛型和集合只能放对象，所以需要包装类；编译器会自动把 int 转成 Integer（装箱，调用 Integer.valueOf），也会反过来转（拆箱，调用 intValue）；要注意 Integer 缓存和拆箱 null 抛 NPE。

**详细解释**：
`Integer y = 10;` 编译成 `Integer.valueOf(10)`；`int z = y;` 编译成 `y.intValue()`。
Integer.valueOf 对 -128~127 使用缓存，同一个值返回同一个对象；超出范围每次都新建对象，所以比较包装类必须用 equals。
包装类变量可以是 null，对 null 拆箱会抛 NullPointerException。
对应关系：byte→Byte、short→Short、int→Integer、long→Long、float→Float、double→Double、char→Character、boolean→Boolean。

**问题**：什么是自动装箱和拆箱？有哪些坑？

**答案要点**：
1. 装箱：基本类型 → 包装类，底层调用 valueOf
2. 拆箱：包装类 → 基本类型，底层调用 xxxValue()
3. Integer 缓存 -128~127，比较包装类用 equals 不用 ==
4. 对 null 拆箱会抛 NullPointerException
5. 泛型和集合不能用基本类型，只能用包装类

**对比**：
- vs 基本类型：包装类是对象，可以为 null、可以放进集合，但多占内存，还有装箱拆箱的开销

**常见陷阱**：
- ❌ 用 == 比较两个 Integer
- ✅ 用 equals；== 只在 -128~127 的缓存范围内"碰巧"成立
- ❌ 把 `Map<String, Integer>` 的 get 结果直接赋给 int
- ✅ key 不存在时 get 返回 null，拆箱抛 NPE；先判空或用 getOrDefault

**追问**：
- Q: `Long l = 127L; l.equals(127)` 结果是什么？
- A: false。127 被装箱成 Integer，Long.equals 要求参数也是 Long
- Q: 在循环里频繁装箱有什么问题？
- A: 会创建大量临时对象，增加 GC 压力；热点代码里尽量用基本类型

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println(a == b);
System.out.println(c == d);
System.out.println(c.equals(d));
```

- [x] true false true
- [ ] true true true
- [ ] false false true
- [ ] true false false

解析：自动装箱调用 Integer.valueOf，-128~127 走缓存，a 和 b 是同一个对象；128 超出缓存范围，c 和 d 是两个不同的对象；equals 比较的是值。

**代码题**：下面代码输出什么？

```java
Map<String, Integer> scores = new HashMap<>();
int s = scores.get("Tom");
System.out.println(s);
```

- [ ] 0
- [ ] null
- [x] 抛出 NullPointerException
- [ ] 编译错误

解析：get 找不到 key 时返回 null，赋给 int 会自动拆箱，相当于调用 null.intValue()，抛 NullPointerException。

**判断题**：
- ❌ `ArrayList<int>` 可以编译 —— 泛型参数必须是引用类型，要写 ArrayList<Integer>
- ✅ `new Integer(5) == new Integer(5)` 为 false —— new 一定会创建新对象（这个构造器早已废弃，应使用 valueOf）

### 泛型

**概念**：Type as parameter——把类型当作参数，在编译期做类型检查

**一句话**：泛型让类、接口、方法把类型当参数，比如 Box<T>、List<String>；好处是编译期类型安全、取值不用强转；Java 泛型靠类型擦除实现，运行时没有泛型信息。

**详细解释**：
```java
class Box<T> {
    private T value;
    public void set(T value) { this.value = value; }
    public T get() { return value; }
}
Box<String> box = new Box<>();
box.set("hi");
String s = box.get();   // 不需要强转
```
没有泛型时，集合里放的都是 Object，取出来要强转，放错类型要到运行时才报 ClassCastException。
类型擦除：编译后 T 被替换成它的上界（默认 Object），所以 `List<String>` 和 `List<Integer>` 运行时是同一个 Class，也不能 `new T()`，不能用基本类型做类型参数。

**问题**：什么是泛型？为什么要用泛型？什么是类型擦除？

**答案要点**：
1. 泛型就是参数化类型，类型作为参数传入
2. 编译期类型检查，避免运行时 ClassCastException
3. 取值不需要强制类型转换，代码可复用
4. 类型擦除：运行时泛型信息被擦除，替换为上界
5. 类型参数只能是引用类型，基本类型要用包装类

**常见陷阱**：
- ❌ 认为运行时能拿到 List<String> 里的 String 类型信息
- ✅ 类型被擦除，运行时只有 List；所以不能 new T()，也没有 List<String>.class

**追问**：
- Q: `List<Object>` 类型的变量能接收 `List<String>` 吗？
- A: 不能，泛型不是协变的；要用通配符 `List<?>` 或 `List<? extends Object>`
- Q: `<? extends T>` 和 `<? super T>` 怎么选？
- A: PECS 原则：只从里面读取（生产者）用 extends，只往里面写入（消费者）用 super

**代码题**：下面代码输出什么？

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass());
```

- [x] true
- [ ] false
- [ ] 编译错误
- [ ] 抛出 ClassCastException

解析：类型擦除后两者运行时都是 java.util.ArrayList，getClass() 返回的是同一个 Class 对象。

**判断题**：
- ❌ 在泛型类里可以直接 `new T()` —— 类型擦除后运行时不知道 T 是什么，无法实例化
- ✅ 泛型的类型检查发生在编译期 —— 放错类型会直接编译报错，而不是等到运行时

### String 的不可变性

**概念**：String 对象一旦创建，内容就不能再修改

**一句话**：String 内部的字符数组是 private final 的，且类不对外提供任何修改方法，所有"修改"操作（+、concat、replace、toUpperCase）都返回新对象；这样设计是为了字符串池复用、hashCode 缓存、安全和线程安全。

**详细解释**：
`s = s + " World";` 并没有改原来的 "Hello"，而是创建了新字符串 "Hello World"，再让 s 指向它，原对象不变。
为什么要不可变：
1）字符串池：多个引用共享同一个字面量，必须保证谁都改不了；
2）hashCode 可以缓存，作为 HashMap 的 key 又快又安全；
3）安全：类名、URL、文件路径等都用 String 传递，不会被中途篡改；
4）天然线程安全，不需要同步。
String 类本身是 final 的，防止子类重写方法破坏不可变性。频繁拼接用 StringBuilder（非线程安全、快）或 StringBuffer（同步、线程安全）。

**问题**：为什么 String 是不可变的？有什么好处？

**答案要点**：
1. 内部数组 private final，且不暴露任何修改方法；类本身 final 防止被继承篡改
2. 所有修改操作都返回新 String，原对象不变
3. 好处：字符串池复用、hashCode 缓存、安全、线程安全
4. 大量拼接用 StringBuilder，多线程共享时用 StringBuffer

**对比**：
| | String | StringBuilder | StringBuffer |
|---|---|---|---|
| 可变性 | 不可变 | 可变 | 可变 |
| 线程安全 | 安全（因为不可变） | 不安全 | 安全（synchronized） |
| 拼接性能 | 每次创建新对象 | 最快 | 有同步开销 |

**常见陷阱**：
- ❌ 以为 String 不可变只是因为类被 final 修饰
- ✅ final 只保证不能被继承；不可变靠私有 final 数组 + 不提供修改方法
- ❌ 调用 `s.toUpperCase();` 后以为 s 变了
- ✅ 返回的是新字符串，必须接收：s = s.toUpperCase()

**追问**：
- Q: 在循环里用 + 拼接字符串有什么问题？
- A: 每轮都会创建新的 StringBuilder 和 String，整体是 O(n²) 的复制开销；应在循环外创建一个 StringBuilder
- Q: JDK 9 对 String 做了什么优化？
- A: 内部从 char[] 改成 byte[] + coder（Compact Strings），只含 Latin-1 字符的字符串每个字符只占 1 字节

**代码题**：下面代码输出什么？

```java
String s = "Hello";
String t = s;
s = s + " World";
s.toUpperCase();
System.out.println(s + " | " + t);
```

- [x] Hello World | Hello
- [ ] HELLO WORLD | Hello
- [ ] HELLO WORLD | HELLO WORLD
- [ ] Hello World | Hello World

解析：s + " World" 创建了新对象并让 s 指向它，t 仍指向原来的 "Hello"；toUpperCase() 返回新字符串，但没有被接收，s 不变。

**判断题**：
- ❌ 只要一个类被 final 修饰，它的对象就不可变 —— final 类只是不能被继承，对象是否可变取决于字段和方法
- ✅ String 对象可以安全地在多个线程之间共享 —— 不可变对象天然线程安全

### String Pool 与 == / equals

**概念**：字符串常量池存放字符串字面量，内容相同的字面量只保存一份

**一句话**：字面量 "abc" 会放进字符串池并被复用，new String("abc") 一定在堆上新建对象；== 比较是不是同一个对象，equals 比较内容，比较字符串永远用 equals。

**详细解释**：
`String a = "abc"; String b = "abc";` a 和 b 指向池里同一个对象，a == b 为 true。
`String c = new String("abc");` new 强制在堆上创建新对象，a == c 为 false，但 a.equals(c) 为 true。
编译期常量会被折叠：`"ab" + "c"` 编译时就变成 "abc"，和 a 是同一个对象；但 `x + "c"`（x 是变量）在运行时拼接，会产生新对象。
`intern()` 返回池中内容相同的字符串的引用（没有就放进去），所以 `c.intern() == a` 为 true。
JDK 7 起字符串池从永久代移到了堆中。

**问题**：说一下字符串常量池；`==` 和 `equals` 有什么区别？

**答案要点**：
1. 字面量放入字符串池，内容相同就复用同一个对象
2. new String 一定在堆上创建新对象
3. == 比较引用（是否同一个对象），equals 比较内容
4. 编译期常量拼接会折叠，运行时含变量的拼接产生新对象
5. intern() 返回池中的引用；JDK 7 起字符串池在堆中

**对比**：
| | == | equals |
|---|---|---|
| 基本类型 | 比较值 | 不能调用 |
| 引用类型 | 是否同一个对象 | 由类自己实现，String 比较内容 |
| Object 默认实现 | — | 等同于 == |

**常见陷阱**：
- ❌ 用 == 判断两个字符串内容是否相同
- ✅ 用 equals；把常量放前面 "abc".equals(s) 还能避免 NPE
- ❌ 认为 equals 天生就比较内容
- ✅ Object.equals 默认就是 ==，要类自己重写（String 重写了）

**追问**：
- Q: `new String("abc")` 创建了几个对象？
- A: 池里还没有 "abc" 时是 2 个（池里的字面量 + 堆上的新对象）；已经有了就只有 1 个
- Q: 重写 equals 为什么必须重写 hashCode？
- A: HashMap / HashSet 先按 hashCode 找桶，再用 equals 比较；equals 相等而 hashCode 不同，会导致查不到或重复存放

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
String a = "abc";
String b = "abc";
String c = new String("abc");
System.out.println(a == b);
System.out.println(a == c);
System.out.println(a.equals(c));
```

- [x] true false true
- [ ] true true true
- [ ] false false true
- [ ] true false false

解析：a 和 b 都是同一个池中字面量；c 是 new 出来的新对象，和 a 不是同一个；equals 比较内容，相同。

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
String a = "abc";
String x = "ab";
String d = "ab" + "c";
String e = x + "c";
System.out.println(a == e);
System.out.println(a == d);
System.out.println(a == e.intern());
```

- [x] false true true
- [ ] true true true
- [ ] true false true
- [ ] false false true

解析：x + "c" 含变量，运行时拼接出新对象，a == e 为 false；"ab" + "c" 全是常量，编译期折叠成 "abc"，就是池里那个对象；intern() 返回池中的 "abc"。

**判断题**：
- ✅ `"abc".equals(s)` 比 `s.equals("abc")` 更安全 —— s 为 null 时前者返回 false，后者抛 NullPointerException
- ❌ JDK 8 中字符串常量池位于永久代 —— JDK 7 就已移到堆中，JDK 8 更是用元空间取代了永久代

### 栈与堆

**概念**：栈（JVM Stack）按线程保存方法调用的栈帧；堆（Heap）存放 new 出来的对象，被所有线程共享

**一句话**：每个线程有自己的栈，每调用一次方法就压入一个栈帧，里面放局部变量（基本类型的值和对象引用），方法结束就弹出；对象和数组都在堆上，由 GC 回收，字符串池也在堆里。

**详细解释**：
```java
void test() {
    int x = 10;
    Person p = new Person();
}
```
x 的值 10 和引用 p 在 test 的栈帧里，Person 对象在堆上。方法返回后栈帧弹出，x 和 p 随之消失；Person 对象不再被任何引用指向后，由 GC 回收。
栈：线程私有、分配释放快、空间小，递归太深会 StackOverflowError。
堆：线程共享、空间大，对象太多又回收不掉会 OutOfMemoryError。
完整的运行时数据区还有方法区、程序计数器、本地方法栈，详见 JVM 篇。

**问题**：Java 的栈和堆有什么区别？局部变量和对象分别存在哪里？

**答案要点**：
1. 栈线程私有，按方法调用压入 / 弹出栈帧
2. 栈帧里存局部变量：基本类型的值、对象的引用
3. 堆线程共享，存放所有对象和数组（包括字符串池）
4. 栈随方法结束自动释放，堆上的对象由 GC 回收
5. 栈溢出是 StackOverflowError，堆满是 OutOfMemoryError

**对比**：
| | 栈 | 堆 |
|---|---|---|
| 存什么 | 栈帧、局部变量、引用 | 对象、数组 |
| 归属 | 每个线程一个 | 所有线程共享 |
| 生命周期 | 方法结束即释放 | 由 GC 回收 |
| 典型错误 | StackOverflowError | OutOfMemoryError |

**常见陷阱**：
- ❌ 说"基本类型都存在栈上"
- ✅ 只有局部变量在栈上；作为对象字段的基本类型随对象一起在堆上

**追问**：
- Q: 成员变量 `int age` 存在哪里？
- A: 跟着对象存在堆上；只有方法里的局部变量才在栈帧里
- Q: 无限递归会报什么错？
- A: StackOverflowError，栈帧不断压入，超出了栈的容量

**判断题**：
- ❌ 对象的基本类型字段存在栈上 —— 字段是对象的一部分，随对象存在堆上
- ✅ 每个线程都有自己独立的虚拟机栈 —— 栈线程私有，堆线程共享

### 算术运算：整数除法、取模与优先级

**概念**：+ - * / % 五种算术运算符，* / % 的优先级高于 + -

**一句话**：整数相除会截断小数（向 0 取整），% 结果的符号跟被除数一致；* / % 先于 + -，同级从左到右；+ 一旦遇到字符串就变成拼接。

**详细解释**：
`5 / 2` 得 2，`-5 / 2` 得 -2（向 0 截断，不是向下取整）。
`-7 % 3` 得 -1，`7 % -3` 得 1：余数的符号跟被除数。判断奇数要写 `x % 2 != 0`，写 `x % 2 == 1` 遇到负数会出错。
整数除以 0 抛 ArithmeticException；浮点数除以 0 得 Infinity 或 NaN。
`+` 从左到右结合：`1 + 2 + "3"` 先算 3 再拼成 "33"；`"1" + 2 + 3` 得 "123"。

**问题**：Java 的整数除法和取模有什么需要注意的？

**答案要点**：
1. 整数除法向 0 截断：5 / 2 = 2，-5 / 2 = -2
2. % 结果的符号与被除数相同：-7 % 3 = -1
3. 整数除 0 抛 ArithmeticException，浮点除 0 得 Infinity / NaN
4. 优先级：括号 > * / % > + -，同级从左到右
5. + 遇到字符串之后变成拼接

**常见陷阱**：
- ❌ 用 `x % 2 == 1` 判断奇数
- ✅ 负奇数 % 2 得 -1，应写 `x % 2 != 0`
- ❌ 以为 `1 + 2 + "3"` 是 "123"
- ✅ 从左到右：1 + 2 先得 3，再拼接得 "33"

**追问**：
- Q: `5.0 / 0` 的结果是什么？
- A: Infinity，不会抛异常；`0.0 / 0` 得 NaN

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
System.out.println(5 + 2 * 2);
System.out.println(-7 % 3);
System.out.println(7 % -3);
```

- [x] 9 -1 1
- [ ] 14 -1 1
- [ ] 9 2 -2
- [ ] 9 -1 -1

解析：先乘后加得 9；取模结果的符号跟被除数：-7 % 3 = -1，7 % -3 = 1。

**代码题**：下面代码输出什么？

```java
System.out.println(1 + 2 + "3" + 4 + 5);
```

- [ ] 12345
- [x] 3345
- [ ] 339
- [ ] 15

解析：+ 从左到右：1 + 2 = 3 是整数相加；之后遇到字符串变成拼接："33" → "334" → "3345"。

**判断题**：
- ✅ `-5 / 2` 的结果是 -2 —— 整数除法向 0 截断，不是向下取整
- ❌ 整数除以 0 的结果是 Infinity —— 整数除 0 抛 ArithmeticException，只有浮点数才得 Infinity

### 自增自减：++x 与 x++

**概念**：前置 ++x 先加再取值，后置 x++ 先取值再加

**一句话**：++x 先自增再参与表达式，x++ 先用旧值参与表达式再自增；单独成一条语句时两者效果一样，放进表达式里才有区别；`i = i++` 不会改变 i。

**详细解释**：
x = 4 时：`y = ++x` → x=5, y=5；`y = x++` → x=5, y=4；`y = --x` → x=3, y=3；`y = x--` → x=3, y=4。
`i = i++;` 的执行过程：先保存旧值 0，i 自增为 1，再把旧值 0 赋回 i，所以 i 还是 0。
++ 不是原子操作（读-改-写三步），多线程下 count++ 会丢失更新，要用 AtomicInteger 或加锁。

**问题**：i++ 和 ++i 有什么区别？

**答案要点**：
1. ++i 先自增，表达式的值是新值
2. i++ 表达式的值是旧值，之后才自增
3. 单独作为一条语句时没有区别
4. i = i++ 不会改变 i
5. ++ 不是原子操作，多线程下不安全

**常见陷阱**：
- ❌ 认为 `i = i++` 会让 i 加 1
- ✅ 旧值被重新赋回 i，i 不变
- ❌ 认为 count++ 是线程安全的
- ✅ 读-改-写三步可能被打断，用 AtomicInteger

**追问**：
- Q: for 循环里写 i++ 还是 ++i 有区别吗？
- A: 对 int 没有区别，更新部分是单独执行的，表达式的值不会被使用

**代码题**：下面代码输出什么？

```java
int x = 4;
int y = x++ + ++x;
System.out.println(x + " " + y);
```

- [x] 6 10
- [ ] 6 9
- [ ] 5 10
- [ ] 6 11

解析：x++ 取旧值 4，之后 x 变成 5；++x 先把 x 变成 6 再取值 6；y = 4 + 6 = 10，最终 x = 6。

**代码题**：下面代码输出什么？

```java
int i = 0;
i = i++;
i = i++;
System.out.println(i);
```

- [x] 0
- [ ] 1
- [ ] 2
- [ ] 编译错误

解析：i = i++ 先保存旧值 0，i 自增为 1，然后把旧值 0 赋回给 i，每次都被打回 0。

**判断题**：
- ✅ 单独写 `x++;` 和 `++x;` 效果相同 —— 区别只体现在表达式的值上
- ❌ 多个线程同时对一个 int 执行 count++ 是安全的 —— ++ 是读-改-写三步，不是原子操作

### 逻辑运算与短路

**概念**：&& || ! 是逻辑运算符，&& 和 || 会短路；& | ^ 用于 boolean 时不短路

**一句话**：&& 左边为 false、|| 左边为 true 时，右边不再执行，常用来先判空再访问，比如 `array == null || array.length == 0`；& 和 | 两边都会执行，^ 是异或。

**详细解释**：
`if (array == null || array.length == 0)`：array 为 null 时左边已经是 true，右边的 array.length 不会执行，避免了 NPE。
顺序写反成 `array.length == 0 || array == null`，array 为 null 时先执行 array.length，直接 NPE。
& 和 | 用于 boolean 时两边都会求值（不短路）；用于整数时是按位与 / 按位或。
^ 异或：两边不同才为 true。

**问题**：&& 和 & 有什么区别？什么是短路？

**答案要点**：
1. && 左边为 false 就不再计算右边；|| 左边为 true 就不再计算右边
2. & 和 | 两边都会计算，不短路；用于整数时是位运算
3. 短路常用于判空：先判 null 再访问成员
4. 判空条件必须写在前面，顺序写反会 NPE
5. ^ 异或：两边不同才为 true

**常见陷阱**：
- ❌ 把判空写在后面：`s.isEmpty() || s == null`
- ✅ 先判空：`s == null || s.isEmpty()`
- ❌ 在 && 右边写有副作用的代码（如 ++），并依赖它一定执行
- ✅ 短路时右边根本不会执行，副作用也不会发生

**追问**：
- Q: 什么时候会故意用 & 而不是 &&？
- A: 两边都有必须执行的副作用时；但可读性差，一般应该拆开写

**代码题**：下面代码输出什么？

```java
int a = 0, b = 0;
boolean r1 = (a > 0) && (++a > 0);
boolean r2 = (b > 0) & (++b > 0);
System.out.println(a + " " + b);
```

- [x] 0 1
- [ ] 1 1
- [ ] 0 0
- [ ] 1 0

解析：&& 左边是 false，直接短路，++a 不执行；& 不短路，++b 会执行。

**代码题**：下面代码运行结果是什么？

```java
int[] array = null;
if (array.length == 0 || array == null) {
    System.out.println("empty");
}
```

- [ ] empty
- [ ] 什么也不输出
- [x] 抛出 NullPointerException
- [ ] 编译错误

解析：|| 从左到右求值，先执行 array.length，array 为 null 直接 NPE；应该把 array == null 放在前面。

**判断题**：
- ✅ `true ^ true` 的结果是 false —— 异或：两边相同为 false
- ❌ `&` 用于 boolean 时也会短路 —— & 两边都会求值，只有 && 和 || 会短路

### .length、.length() 与 size()

**概念**：数组用 length 属性，String 用 length() 方法，集合用 size() 方法

**一句话**：数组的 length 是 final 字段，表示创建时的容量；String.length() 是方法，返回字符数（UTF-16 码元数）；集合的 size() 返回实际元素个数，与初始容量无关。

**详细解释**：
`int[] arr = {1, 2, 3}; arr.length` → 3，没有括号。
`"abc".length()` → 3，有括号。
`new String[5].length` 是 5，即使元素全是 null；而 `new ArrayList<>(10).size()` 是 0，这里的 10 只是初始容量。
对 null 调用其中任何一个都会抛 NullPointerException。

**问题**：数组、String、List 获取长度的方式有什么不同？

**答案要点**：
1. 数组：.length，是字段不是方法
2. String：.length()，是方法
3. 集合：.size()，返回实际元素个数
4. 数组 length 是创建时的容量，ArrayList 的初始容量不影响 size

**常见陷阱**：
- ❌ 写成 arr.length() 或 s.length
- ✅ 记口诀：数组是属性，字符串是方法，集合用 size

**追问**：
- Q: 数组创建后长度能改吗？
- A: 不能，length 是 final 的；需要变长就用 ArrayList，或者用 Arrays.copyOf 创建新数组

**代码题**：下面代码输出什么？

```java
String[] arr = new String[5];
List<String> list = new ArrayList<>(10);
System.out.println(arr.length + " " + list.size());
```

- [x] 5 0
- [ ] 0 0
- [ ] 5 10
- [ ] 0 10

解析：数组的 length 是创建时的容量，元素都是 null 也算；ArrayList 的 10 只是初始容量，size() 统计的是实际元素个数。

**判断题**：
- ❌ `int[] a = {1, 2}; a.length()` 可以编译 —— 数组的 length 是字段，不能加括号
- ✅ 数组创建后长度不能改变 —— length 是 final 的

### switch 与 fall-through

**概念**：switch 根据表达式的值跳到匹配的 case 执行，没有 break 就会继续执行后面的 case

**一句话**：匹配到 case 后会一直往下执行，直到遇到 break 或 switch 结束，这叫 fall-through；传统 switch 支持 byte / short / char / int 及其包装类、枚举和 String（JDK 7+），不支持 long、float、double、boolean。

**详细解释**：
```java
char c = 'A';
switch (c) {
    case 'A': System.out.println("A");
    case 'B': System.out.println("B");
    default:  System.out.println("Default");
}
```
没有 break，会依次输出 A、B、Default。
对 String 做 switch 时，底层先比较 hashCode 再用 equals 确认；表达式为 null 会抛 NPE。
JDK 14 起有箭头语法 `case 'A' -> ...`，不会 fall-through，还可以作为表达式返回值；JDK 21 的模式匹配 switch 还能按类型匹配任意引用类型。

**问题**：switch 里的 break 有什么作用？switch 支持哪些类型？

**答案要点**：
1. 没有 break 会 fall-through，继续执行后面的 case
2. default 在没有匹配时执行，位置不影响匹配
3. 支持 byte / short / char / int 及包装类、enum、String
4. 不支持 long、float、double、boolean
5. JDK 14 箭头语法不会 fall-through，可以作为表达式

**常见陷阱**：
- ❌ 忘记写 break，导致多个分支都被执行
- ✅ 每个 case 末尾写 break，或者用 JDK 14 的箭头语法
- ❌ 对可能为 null 的 String 做 switch
- ✅ 先判空，否则抛 NullPointerException

**追问**：
- Q: fall-through 有正当用途吗？
- A: 有，多个 case 共用同一段逻辑时可以连着写 `case 1: case 2: ...`

**代码题**：下面代码输出什么？

```java
int x = 2;
switch (x) {
    case 1: System.out.print("one ");
    case 2: System.out.print("two ");
    case 3: System.out.print("three ");
        break;
    default: System.out.print("other ");
}
```

- [ ] two
- [x] two three
- [ ] two three other
- [ ] one two three

解析：从 case 2 进入，没有 break 就一直执行到 case 3 的 break 才停，default 不会执行。

**代码题**：下面代码依次输出什么？（多行用空格隔开）

```java
char c = 'A';
switch (c) {
    case 'A': System.out.println("A");
    case 'B': System.out.println("B");
    default:  System.out.println("Default");
}
```

- [ ] A
- [ ] A B
- [x] A B Default
- [ ] A Default

解析：匹配到 case 'A' 后没有 break，会一路执行完 case 'B' 和 default。

**判断题**：
- ❌ switch 可以直接对 long 类型使用 —— 不支持 long、float、double、boolean（基本类型模式目前仍是预览特性）
- ✅ switch 可以对 String 使用 —— JDK 7 起支持，底层先比较 hashCode 再用 equals 确认

### 循环与跳转：while、do-while、for、break、continue、return

**概念**：while 先判断后执行，do-while 至少执行一次，for 适合已知次数；break 结束循环，continue 跳过本轮，return 结束方法

**一句话**：while 可能一次都不执行，do-while 至少执行一次；break 跳出当前循环（或 switch），continue 跳过本轮进入下一轮，return 直接结束整个方法；嵌套循环里可以用标签 `break outer` 跳出外层。

**详细解释**：
for 的执行顺序：初始化 → 判断条件 → 循环体 → 更新 → 回到判断。`for (int i = 0; i < 10; i++)` 执行 10 次。
嵌套循环：外层 n 次 × 内层 n 次 = n² 次，这就是 O(n²) 的来源。
break / continue 默认只作用于最内层循环，带标签的 `break outer;` / `continue outer;` 可以作用于外层。
return 结束当前方法，后面的语句都不会执行（finally 除外）。

**问题**：break、continue、return 有什么区别？while 和 do-while 有什么区别？

**答案要点**：
1. while 先判断，可能一次都不执行；do-while 先执行，至少一次
2. break 结束当前整个循环（或 switch）
3. continue 跳过本轮，继续下一轮
4. return 结束整个方法
5. 带标签的 break / continue 可以控制外层循环

**常见陷阱**：
- ❌ 以为 break 能跳出所有嵌套循环
- ✅ 只跳出最内层，要跳外层得用标签

**追问**：
- Q: try 里已经 return 了，finally 还会执行吗？
- A: 会，finally 在方法真正返回之前执行（除非调用了 System.exit 等）

**代码题**：下面代码输出什么？

```java
for (int i = 0; i < 5; i++) {
    if (i == 1) continue;
    if (i == 3) break;
    System.out.print(i + " ");
}
```

- [x] 0 2
- [ ] 0 2 4
- [ ] 0 1 2
- [ ] 0

解析：i = 1 时 continue 跳过打印；i = 3 时 break 结束整个循环，所以只打印 0 和 2。

**代码题**：下面代码输出什么？

```java
int n = 0;
do {
    System.out.print("run ");
} while (n > 0);
while (n > 0) {
    System.out.print("loop ");
}
```

- [x] run
- [ ] run loop
- [ ] 什么也不输出
- [ ] 死循环

解析：do-while 先执行一次再判断，所以打印一次 run；while 先判断 n > 0 为 false，一次都不执行。

**代码题**：下面代码输出什么？

```java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) continue outer;
        if (i == 2) break outer;
        System.out.print(i + "" + j + " ");
    }
}
```

- [x] 00 10
- [ ] 00 10 20
- [ ] 00 01 10 11
- [ ] 00

解析：每轮内层到 j = 1 时 continue outer，直接进入外层下一轮，所以只打印 j = 0 的情况；i = 2 时 j = 0 就遇到 break outer，结束全部循环。

**判断题**：
- ✅ do-while 的循环体至少执行一次 —— 先执行再判断条件
- ❌ continue 会结束整个循环 —— continue 只跳过当前这一轮

### 三元运算符

**概念**：`condition ? 表达式1 : 表达式2`，条件为 true 取前者，否则取后者

**一句话**：三元运算符是 if-else 的表达式形式，能直接返回值；两个分支类型不同时会做类型提升，包装类和基本类型混用还可能触发自动拆箱 NPE。

**详细解释**：
`int i = valid ? 1 : 0;` 等价于用 if-else 给 i 赋值。
类型提升：`true ? 1 : 2.0` 的类型是 double，打印 1.0。
拆箱陷阱：`Integer x = null; Integer r = flag ? x : 0;` 一个分支是 Integer、一个是 int，整个表达式的类型是 int，flag 为 true 时 x 被拆箱，抛 NPE——即使结果赋给的是 Integer。
不要嵌套多层三元运算，可读性很差。

**问题**：三元运算符怎么用？有什么坑？

**答案要点**：
1. 语法：条件 ? 真值 : 假值，是表达式，有返回值
2. 两个分支类型不同时，会提升为统一的类型
3. 包装类和基本类型混用会自动拆箱，遇到 null 抛 NPE
4. 避免多层嵌套

**常见陷阱**：
- ❌ 以为 `true ? 1 : 2.0` 打印 1
- ✅ 结果类型被提升为 double，打印 1.0

**追问**：
- Q: 怎么避免三元运算的拆箱 NPE？
- A: 让两个分支类型一致，比如都用 Integer：`flag ? x : Integer.valueOf(0)`

**代码题**：下面代码输出什么？

```java
System.out.println(true ? 1 : 2.0);
```

- [ ] 1
- [x] 1.0
- [ ] 2.0
- [ ] 编译错误

解析：两个分支一个是 int、一个是 double，表达式类型提升为 double，所以输出 1.0。

**代码题**：下面代码运行结果是什么？

```java
Integer x = null;
boolean flag = true;
Integer r = flag ? x : 0;
System.out.println(r);
```

- [ ] null
- [ ] 0
- [x] 抛出 NullPointerException
- [ ] 编译错误

解析：一个分支是 Integer、另一个是 int，表达式的类型是 int，x 会被自动拆箱，对 null 拆箱抛 NPE。

**判断题**：
- ✅ 三元运算可以直接作为方法参数 —— 它是表达式，有返回值；if-else 是语句，不行
- ❌ 三元运算符两个分支的类型必须完全相同 —— 类型不同时会做数值提升或取共同的父类型

### class、interface 与 enum

**概念**：class 定义类，interface 定义契约（能力），enum 定义一组固定的常量

**一句话**：class 描述"是什么"并提供实现；interface 描述"能做什么"，类用 implements 实现，一个类可以实现多个接口；enum 用于固定的取值集合，比字符串或 int 常量更类型安全。

**详细解释**：
```java
interface Flyable { void fly(); }
class Bird implements Flyable {
    public void fly() { System.out.println("fly"); }
}
enum Day { MONDAY, TUESDAY, WEDNESDAY }
```
接口里的方法默认 public abstract，字段默认 public static final；JDK 8 起可以有 default 和 static 方法。
Java 类只能单继承（extends 一个类），但可以实现多个接口。
enum 本质是继承了 java.lang.Enum 的 final 类，每个常量都是它唯一的实例，可以有字段、构造器和方法，可以直接用于 switch，用 == 比较。

**问题**：class、interface、enum 分别用来做什么？为什么用 enum 而不用字符串常量？

**答案要点**：
1. class：定义状态和行为，只能单继承
2. interface：定义契约，一个类可以实现多个接口
3. 接口方法默认 public abstract，JDK 8 起支持 default / static 方法
4. enum：固定的一组实例，编译期检查取值，不会拼错
5. enum 可以有字段和方法，能用于 switch，用 == 比较

**对比**：
| | 抽象类 | 接口 |
|---|---|---|
| 继承数量 | 只能单继承 | 可以实现多个 |
| 构造器 | 有 | 没有 |
| 字段 | 任意 | 只能是 public static final 常量 |
| 设计语义 | is-a，复用公共实现 | can-do，定义能力 |

**常见陷阱**：
- ❌ 用 `String day = "Monday"` 表示固定取值
- ✅ 用 enum，拼错会编译报错，取值范围也固定

**追问**：
- Q: 为什么说 enum 很适合实现单例？
- A: 枚举实例由 JVM 保证只创建一次，天然线程安全，还能防止反射和反序列化破坏单例
- Q: 一个类能同时继承类和实现接口吗？
- A: 能，写成 `class A extends B implements C, D`

**代码题**：下面代码输出什么？

```java
enum Day { MONDAY, TUESDAY, WEDNESDAY }
Day d = Day.valueOf("TUESDAY");
System.out.println(d.ordinal() + " " + d + " " + (d == Day.TUESDAY));
```

- [x] 1 TUESDAY true
- [ ] 2 TUESDAY true
- [ ] 1 TUESDAY false
- [ ] 0 Tuesday true

解析：ordinal() 是声明顺序，从 0 开始；enum 的 toString 默认返回常量名；每个常量只有一个实例，可以直接用 == 比较。

**判断题**：
- ❌ 一个 Java 类可以 extends 多个类 —— 类只能单继承，但可以实现多个接口
- ✅ 接口里定义的字段默认是 public static final —— 接口里只能有常量

### 访问修饰符

**概念**：public、protected、默认（package-private）、private 四种访问级别

**一句话**：访问范围从大到小：public 任何地方；protected 同包 + 其他包的子类；默认（什么都不写）只有同包；private 只有本类。

**详细解释**：
default 访问不是一个能写出来的关键字，什么修饰符都不写就是 package-private；`default int x;` 是错误写法（default 关键字只用在 switch 和接口的默认方法里）。
protected 的细节：不同包的子类只能通过继承（this 或子类类型的引用）访问父类的 protected 成员，不能通过父类类型的引用访问。
顶层类只能是 public 或默认访问；private / protected 只能修饰成员和内部类。
封装原则：字段尽量 private，通过 getter / setter 对外暴露。

**问题**：Java 的四种访问修饰符分别能在什么范围内访问？

**答案要点**：
1. public：所有地方都能访问
2. protected：同包 + 不同包的子类
3. 默认（不写）：仅同包，也叫 package-private
4. private：仅本类
5. 顶层类只能用 public 或默认访问

**对比**：
| 修饰符 | 同类 | 同包 | 不同包的子类 | 其他包 |
|---|---|---|---|---|
| public | ✓ | ✓ | ✓ | ✓ |
| protected | ✓ | ✓ | ✓ | × |
| 默认 | ✓ | ✓ | × | × |
| private | ✓ | × | × | × |

**常见陷阱**：
- ❌ 把 default 当成能写出来的修饰符：`default int x;`
- ✅ 默认访问就是什么都不写
- ❌ 认为 protected 只对子类开放
- ✅ 同包里的所有类也能访问 protected 成员

**追问**：
- Q: 子类重写方法时能缩小访问权限吗？
- A: 不能，只能相同或更宽；父类是 protected，子类可以改成 public，但不能改成 private

**判断题**：
- ✅ 同一个包里的非子类可以访问 protected 成员 —— protected 包含了包访问权限
- ❌ 顶层类可以声明为 private —— 顶层类只能是 public 或默认访问

### static：类成员与实例成员

**概念**：static 成员属于类本身，所有对象共享；非 static 成员属于每个对象

**一句话**：static 变量只有一份、所有实例共享；static 方法通过类名调用、没有 this，所以不能直接访问实例变量和实例方法；实例成员则是每个对象各有一份。

**详细解释**：
```java
class Person {
    static int count;  // 类变量，所有 Person 共享一份
    String name;       // 实例变量，每个对象一份
}
```
static 方法不依赖任何对象。调用 `Person.printName()` 时根本不知道该打印哪个对象的 name，所以不能直接访问 name，也不能用 this。
实例方法既可以访问 static 成员，也可以访问实例成员。
static 变量在类初始化时赋值，同一个类加载器下只有一份；static 代码块在类初始化时执行一次。
this 指向当前对象：用来区分同名的字段和参数（`this.name = name`），或者用 `this(...)` 调用同类的其他构造器（必须写在第一行）。

**问题**：static 变量和实例变量有什么区别？为什么 static 方法不能访问实例变量？

**答案要点**：
1. static 成员属于类，只有一份，所有实例共享
2. 实例变量属于对象，每个对象各有一份
3. static 方法没有 this，不能直接访问实例变量 / 实例方法
4. 实例方法可以访问 static 成员和实例成员
5. 推荐用类名调用 static 成员，比如 Math.max

**对比**：
| | static 方法 | 实例方法 |
|---|---|---|
| 访问实例变量 | ❌ | ✅ |
| 访问 static 变量 | ✅ | ✅ |
| 调用实例方法 | ❌ | ✅ |
| 调用 static 方法 | ✅ | ✅ |
| 使用 this | ❌ | ✅ |

**常见陷阱**：
- ❌ 在 static 的 main 里直接调用本类的实例方法
- ✅ 先 new 出对象再调用，或者把方法改成 static
- ❌ 用 static 字段保存每个对象各自的数据
- ✅ 每个对象独有的状态必须是实例变量

**追问**：
- Q: static 方法能被重写吗？
- A: 不能，只能被隐藏（hiding）；调用哪个由引用的编译时类型决定，没有多态
- Q: static 代码块什么时候执行？
- A: 类初始化时执行一次，早于任何构造器

**代码题**：下面代码输出什么？

```java
class Counter {
    static int total = 0;
    int mine = 0;
    Counter() {
        total++;
        mine++;
    }
}
Counter a = new Counter();
Counter b = new Counter();
System.out.println(Counter.total + " " + a.mine + " " + b.mine);
```

- [x] 2 1 1
- [ ] 2 2 2
- [ ] 1 1 1
- [ ] 2 1 2

解析：total 是 static，所有对象共用一份，被加了两次；mine 是实例变量，每个对象各自从 0 加到 1。

**代码题**：下面代码输出什么？

```java
class Person {
    String name = "Tom";
    static void printName() {
        System.out.println(name);
    }
}
Person.printName();
```

- [ ] Tom
- [ ] null
- [x] 编译错误
- [ ] 抛出 NullPointerException

解析：static 方法不属于任何对象，不知道该读哪个 Person 的 name，编译器报 "non-static variable name cannot be referenced from a static context"。

**判断题**：
- ❌ static 方法里可以使用 this —— static 方法没有当前对象
- ✅ 通过一个对象修改 static 变量，其他对象看到的值也会变 —— static 变量只有一份

### final：变量、方法与类

**概念**：final 变量只能赋值一次，final 方法不能被重写，final 类不能被继承

**一句话**：final 修饰变量表示只能赋值一次（引用不能改指向，但对象内容仍然可以改）；修饰方法表示不能被子类重写；修饰类表示不能被继承，比如 String、Integer。

**详细解释**：
`final int x = 10; x = 20;` 编译错误。
`final List<Integer> list = new ArrayList<>(); list.add(1);` 没问题；`list = new ArrayList<>();` 编译错误。final 限制的是引用，不是对象。
final 成员变量必须在声明处、构造器或初始化块中恰好赋值一次。
`static final` 常量通常全大写，如 `MAX_SIZE`；编译期常量会被编译器内联。
final、finally、finalize 是三个完全不同的东西。

**问题**：final 关键字有哪些用法？final 修饰的引用，对象内容能改吗？

**答案要点**：
1. final 变量：只能赋值一次
2. final 引用：不能指向新对象，但对象内容可以改
3. final 方法：不能被重写
4. final 类：不能被继承，比如 String
5. final 成员变量必须在构造结束前完成赋值

**常见陷阱**：
- ❌ 认为 final List 不能再 add 元素
- ✅ final 只锁定引用；想让内容不可变要用 List.of 或 Collections.unmodifiableList
- ❌ 混淆 final、finally、finalize
- ✅ finally 是异常处理的代码块，finalize 是已废弃的对象回收回调

**追问**：
- Q: 为什么 String 要设计成 final 类？
- A: 防止子类重写方法破坏不可变性，保证字符串池、hashCode 缓存和安全性
- Q: 方法参数可以加 final 吗？
- A: 可以，表示方法内不能给这个参数重新赋值；lambda 和匿名内部类捕获的局部变量必须是 final 或 effectively final

**代码题**：下面代码输出什么？

```java
final List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);
System.out.println(list);
```

- [x] [1, 2]
- [ ] []
- [ ] 编译错误
- [ ] 抛出 UnsupportedOperationException

解析：final 只限制 list 不能重新指向其他对象，ArrayList 对象本身是可变的，add 没有问题。

**代码题**：下面代码输出什么？

```java
final int[] arr = {1, 2, 3};
arr[0] = 100;
arr = new int[]{4, 5, 6};
System.out.println(arr[0]);
```

- [ ] 100
- [ ] 4
- [ ] 1
- [x] 编译错误

解析：arr[0] = 100 修改的是数组内容，可以；arr = new int[]{...} 试图让 final 引用指向新数组，编译错误。

**判断题**：
- ✅ String 类是 final 的 —— 不能被继承
- ❌ final 方法不能被重载 —— final 只禁止重写（override），重载（overload）不受影响

### main 方法

**概念**：`public static void main(String[] args)` 是 Java 程序的入口

**一句话**：public 让 JVM 能从类外部调用；static 让 JVM 不用创建对象就能调用；void 表示不返回值；String[] args 接收命令行参数。

**详细解释**：
`java Main hello 123` 启动后，args[0] = "hello"，args[1] = "123"，args.length = 2；参数都是 String，数字要自己用 Integer.parseInt 转换。
没有命令行参数时，args 是长度为 0 的数组，不是 null。
`String... args` 可变参数的写法也可以作为入口。
程序的退出码用 System.exit(code) 指定，而不是 main 的返回值。
JDK 25 起允许更简洁的实例 main 方法（如 `void main()`），但面试和现有代码里仍以 public static void main(String[] args) 为准。

**问题**：main 方法为什么是 public static void？args 是什么？

**答案要点**：
1. public：JVM 要从类外部调用
2. static：不需要创建对象就能调用
3. void：不返回值，退出码用 System.exit 指定
4. args 是命令行参数，类型都是 String
5. 没有参数时 args 是空数组，不是 null

**常见陷阱**：
- ❌ 认为不传参数时 args 是 null
- ✅ args 是长度为 0 的数组，可以直接读 args.length

**追问**：
- Q: main 方法能被重载吗？
- A: 能，但 JVM 只会把签名为 main(String[]) 的那个当作入口

**判断题**：
- ✅ 执行 `java Main a b` 时 args.length 为 2 —— 类名本身不算参数
- ❌ main 方法的返回值会成为程序的退出码 —— main 是 void，退出码要用 System.exit(code) 指定

### 深拷贝与浅拷贝

**概念**：浅拷贝只复制对象本身，内部的引用仍指向同一个对象；深拷贝把内部引用的对象也复制一份

**一句话**：浅拷贝只复制"外壳"，内部的可变对象被新旧两个对象共享，改一个另一个也变；深拷贝把内部对象也复制一份，两者完全独立。Object.clone() 默认是浅拷贝。

**详细解释**：
```java
class Person {
    int[] scores;
}
```
浅拷贝：B 是新对象，但 b.scores 和 a.scores 指向同一个数组，b.scores[0] = 100 之后 a 也看到 100。
深拷贝：给 B 新建一个数组并逐个复制元素（或用 scores.clone()），两者互不影响。
数组的 clone() 只复制一层：一维基本类型数组 clone 后是独立的；二维数组 clone 后内层数组仍然共享。
实现深拷贝的方式：重写 clone 逐层复制、拷贝构造器、序列化再反序列化、转 JSON 再转回来等。
不可变对象（如 String）可以放心共享，不需要深拷贝。

**问题**：深拷贝和浅拷贝有什么区别？怎么实现深拷贝？

**答案要点**：
1. 浅拷贝：创建了新对象，但引用类型字段仍指向同一个对象
2. 深拷贝：引用类型字段指向的对象也被复制
3. Object.clone() 默认是浅拷贝，类需要实现 Cloneable
4. 深拷贝的方式：逐层手动复制、拷贝构造器、序列化
5. 不可变字段可以直接共享

**对比**：
- vs 引用赋值：`b = a` 连新对象都没有创建，只是两个变量指向同一个对象；浅拷贝至少创建了新的外层对象

**常见陷阱**：
- ❌ 认为调用了 clone() 就得到了完全独立的副本
- ✅ 默认 clone 是浅拷贝，内部的可变对象仍然共享

**追问**：
- Q: 没实现 Cloneable 就调用 super.clone() 会怎样？
- A: 抛出 CloneNotSupportedException

**代码题**：下面代码输出什么？

```java
int[][] a = {{1, 2}, {3, 4}};
int[][] b = a.clone();
b[0][0] = 99;
b[1] = new int[]{7, 8};
System.out.println(a[0][0] + " " + a[1][0]);
```

- [x] 99 3
- [ ] 1 3
- [ ] 99 7
- [ ] 1 7

解析：clone 只复制外层数组，b[0] 和 a[0] 是同一个内层数组，所以改 b[0][0] 会影响 a；b[1] = 新数组只改了 b 自己的外层槽位，a[1] 不受影响。

**代码题**：下面代码输出什么？

```java
class Person {
    int[] scores;
    Person(int[] scores) { this.scores = scores; }
}
Person a = new Person(new int[]{90, 80});
Person b = new Person(a.scores);
Person c = new Person(a.scores.clone());
b.scores[0] = 100;
c.scores[1] = 0;
System.out.println(a.scores[0] + " " + a.scores[1]);
```

- [x] 100 80
- [ ] 90 80
- [ ] 100 0
- [ ] 90 0

解析：b 和 a 共享同一个数组（浅拷贝），b 的修改 a 看得到；c 拿到的是 clone 出来的新数组（一维基本类型数组 clone 相当于深拷贝），c 的修改不影响 a。

**判断题**：
- ✅ `Person b = a;` 不是拷贝 —— 只是复制了引用，没有创建新对象
- ❌ Object.clone() 默认执行深拷贝 —— 默认是浅拷贝，引用类型字段只复制引用
