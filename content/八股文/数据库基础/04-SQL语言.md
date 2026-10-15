# SQL语言

### SQL 的分类：DDL、DML、DCL、DQL

**概念**：SQL（Structured Query Language）按用途分为 DDL（数据定义）、DML（数据操作）、DCL（数据控制）和 DQL（数据查询）

**一句话**：DDL 定义和修改结构：CREATE、ALTER、DROP、TRUNCATE；DML 增删改数据：INSERT、UPDATE、DELETE；DCL 控制权限：GRANT、REVOKE；DQL 查询数据：SELECT；另外还有管理事务的 TCL：COMMIT、ROLLBACK。

**详细解释**：
DDL：Data Definition Language；DML：Data Manipulation Language；DCL：Data Control Language；DQL：Data Query Language。
CREATE：创建数据库、表、索引等对象，例如：
```sql
CREATE TABLE employee (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name CHAR(50) NOT NULL,
    last_name CHAR(70) NOT NULL
);
```
ALTER：修改已有的表：加列、删列、改列的类型、加约束，例如 `ALTER TABLE students ADD COLUMN middle_name VARCHAR(50) AFTER first_name;`。
DCL（课件标注 not important）：控制用户权限；可以创建角色（Role）把用户分组授权，控制能访问哪些表、能执行哪些语句；GRANT 授权，REVOKE 收回。
课件 Recap 里把四类写成了 DDL、DML、DCL、DDL，最后一个应为 DQL。
有的分类把 SELECT 归入 DML；TCL（Transaction Control Language）包括 COMMIT、ROLLBACK、SAVEPOINT。

**问题**：SQL 语句分为哪几类？各包括哪些语句？

**答案要点**：
1. DDL：CREATE、ALTER、DROP、TRUNCATE，定义和修改结构
2. DML：INSERT、UPDATE、DELETE，增删改数据
3. DCL：GRANT、REVOKE，控制权限
4. DQL：SELECT，查询数据
5. TCL：COMMIT、ROLLBACK，管理事务

**对比**：
| 分类 | 全称 | 语句 | 操作对象 |
|---|---|---|---|
| DDL | Data Definition Language | CREATE、ALTER、DROP、TRUNCATE | 表结构等对象 |
| DML | Data Manipulation Language | INSERT、UPDATE、DELETE | 表中的数据 |
| DCL | Data Control Language | GRANT、REVOKE | 权限 |
| DQL | Data Query Language | SELECT | 查询数据 |

**常见陷阱**：
- ❌ 认为 TRUNCATE 是 DML，因为它删除的是数据
- ✅ TRUNCATE 是 DDL：它直接重建表的存储，而不是逐行删除

**追问**：
- Q: ALTER TABLE 能做哪些事？
- A: 加列、删列、修改列的类型或名字、加或删约束（主键、唯一、外键）、加或删索引、重命名表

**判断题**：
- ✅ CREATE、ALTER、DROP 都属于 DDL —— 它们定义或修改数据库对象的结构
- ❌ GRANT 和 REVOKE 属于 DML —— 它们属于 DCL，用来管理权限

### DELETE、TRUNCATE 与 DROP

**概念**：DELETE 删除表中指定的行；TRUNCATE 快速删除表中所有行但保留表结构；DROP 把整张表（结构 + 数据）删掉

**一句话**：DELETE 是 DML，可以带 WHERE，逐行删除并记日志，可以回滚，自增值继续往后计数；TRUNCATE 是 DDL，不能带 WHERE，删掉全部数据、保留表结构、重置自增值，速度快，在 MySQL 中会隐式提交、不能回滚；DROP 是 DDL，连表结构一起删除，不能回滚。

**详细解释**：
DROP：A drop command is used to delete objects such as a table, index or view；A DROP statement cannot be rolled back, so once an object is destroyed, there's no way to recover it。`DROP TABLE employee;`
TRUNCATE：Similar to DROP, the TRUNCATE statement is used to quickly remove all records from a table；However, unlike DROP that completely destroys a table, TRUNCATE preserves its full structure to be reused later。`TRUNCATE TABLE Products;`
DELETE：used to remove specific rows inside a table；Use unique values to identify the correct rows to delete；Delete leave logs for roll back and continue identity values。`DELETE FROM [TableName] WHERE Id = 1;`
DELETE 不带 WHERE 会删除所有行，但表还在、自增值不会重置。

**问题**：DELETE、TRUNCATE、DROP 有什么区别？

**答案要点**：
1. DELETE 是 DML，可以带 WHERE 删除部分行；TRUNCATE、DROP 是 DDL
2. DELETE 逐行删除并记录日志，可以回滚；TRUNCATE、DROP 一般不能回滚
3. TRUNCATE 删除所有行但保留表结构，DROP 连表一起删除
4. DELETE 后自增值继续计数，TRUNCATE 会重置自增值
5. 速度：DROP、TRUNCATE 快，DELETE 慢

**对比**：
| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| 类型 | DML | DDL | DDL |
| 删除范围 | 指定的行（可带 WHERE） | 所有行 | 整张表 |
| 表结构 | 保留 | 保留 | 删除 |
| 能否回滚 | 能 | 一般不能（MySQL 隐式提交） | 不能 |
| 自增值 | 继续计数 | 重置 | 表都没了 |
| 速度 | 慢 | 快 | 快 |

**常见陷阱**：
- ❌ 想清空表又要保留自增序号继续，用了 TRUNCATE
- ✅ TRUNCATE 会把自增值重置，需要保留就用 DELETE
- ❌ 认为 DELETE FROM t（不带 WHERE）会把表删掉
- ✅ 只删除所有行，表结构还在

**追问**：
- Q: 有外键引用的表能直接 TRUNCATE 吗？
- A: 在 MySQL 中，被其他表的外键引用的表不能直接 TRUNCATE，需要先删除外键或临时关闭外键检查

**代码题**：下面 SQL 执行后，最后一条查询的结果是什么？

```sql
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(20));
INSERT INTO users VALUES (1, 'Ann'), (2, 'Bob'), (3, 'Cat');
DELETE FROM users;
SELECT COUNT(*) FROM users;
```

- [x] 0
- [ ] 3
- [ ] 执行报错
- [ ] 查询结果为空

解析：DELETE 不带 WHERE 会删除表里的所有行，但表本身还在，所以还能查询，计数为 0；COUNT(*) 总会返回一行结果。

**判断题**：
- ✅ TRUNCATE 删除所有数据后会保留表结构 —— 之后还可以继续往表里插入数据
- ❌ DELETE 语句删除数据后会重置自增值 —— DELETE 后自增值继续计数，TRUNCATE 才会重置

### INSERT、UPDATE 与 DELETE

**概念**：INSERT 向表中插入数据，UPDATE 修改已有的数据，DELETE 删除指定的行；UPDATE 和 DELETE 用 WHERE 选择要操作的行

**一句话**：INSERT 不写列名时值的顺序必须和表的列顺序一致，不确定顺序就写出列名，一条 INSERT 可以插入多行；UPDATE 和 DELETE 应该用唯一标识（主键）定位行，用不唯一的列做条件可能影响多行，忘写 WHERE 会作用于整张表。

**详细解释**：
INSERT：used to input data into tables；The order of data specified should match order of columns；If you don't know the order of columns, specify each column name。
`INSERT INTO [TableName] VALUES (1, 'Alice'), (2, 'Bob');`
`INSERT INTO [TableName] (Col2, Col1) VALUES ('Alice', 1), ('Bob', 2);`
UPDATE：used to change or modify data inside a table；Use unique identifiers to get correct rows。
`UPDATE [TableName] SET Name = 'Tim' WHERE Id = 2;`（唯一列，只改一行）
`UPDATE [TableName] SET Name = 'Hal' WHERE Name = 'Bob';`（不唯一的列，可能改多行）
DELETE：`DELETE FROM [TableName] WHERE Id = 1;`、`DELETE FROM [TableName] WHERE Name = 'Jim';`
实际工作中执行 UPDATE / DELETE 前，先用同样的 WHERE 做一次 SELECT 确认影响的行；MySQL 有 safe-updates 模式禁止不带主键条件的 UPDATE / DELETE。

**问题**：写 INSERT、UPDATE、DELETE 时要注意什么？

**答案要点**：
1. INSERT 不写列名时，值的顺序要和列顺序一致
2. 写出列名更安全，表结构变化（加列）也不影响
3. 一条 INSERT 可以插入多行
4. UPDATE / DELETE 尽量用主键等唯一标识定位行
5. 忘写 WHERE 会影响整张表，执行前先用 SELECT 验证条件

**常见陷阱**：
- ❌ UPDATE 时忘记写 WHERE
- ✅ 整张表的所有行都会被修改
- ❌ 用不唯一的列（比如名字）做 UPDATE 条件，以为只改一个人
- ✅ 同名的所有行都会被改，应该用主键

**追问**：
- Q: INSERT 时某些列不给值会怎样？
- A: 有 DEFAULT 的列取默认值，可为空的列为 NULL；NOT NULL 又没有默认值的列会报错

**代码题**：下面 SQL 执行后，最后一条查询的结果是什么？

```sql
CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(20));
INSERT INTO users VALUES (1, 'Bob'), (2, 'Bob'), (3, 'Amy');
UPDATE users SET name = 'Hal' WHERE name = 'Bob';
SELECT COUNT(*) FROM users WHERE name = 'Hal';
```

- [x] 2
- [ ] 1
- [ ] 0
- [ ] 3

解析：WHERE 条件用的是不唯一的 name 列，两个叫 Bob 的用户都被改成了 Hal；只想改一个人应该用 WHERE id = 1。

**代码题**：下面 SQL 执行后，最后一条查询的结果是什么？（每行用 | 隔开）

```sql
CREATE TABLE t (id INT, name VARCHAR(10));
INSERT INTO t (name, id) VALUES ('Alice', 1), ('Bob', 2);
SELECT id, name FROM t ORDER BY id;
```

- [x] 1 Alice | 2 Bob
- [ ] Alice 1 | Bob 2
- [ ] 执行报错
- [ ] 1 Alice

解析：INSERT 写出了列名 (name, id)，值按这个顺序对应，不受表里列顺序影响；一条 INSERT 插入了两行。

**判断题**：
- ✅ 一条 INSERT 语句可以一次插入多行 —— VALUES 后面用逗号分隔多组值
- ❌ UPDATE 语句不写 WHERE 时只会修改第一行 —— 会修改表中的所有行
