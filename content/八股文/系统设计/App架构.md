# App架构

### MVVM

**概念**：Model-View-ViewModel 架构模式，实现视图与业务逻辑分离

**详细解释**：
View 负责 UI 展示，ViewModel 负责业务逻辑和数据转换，
Model 负责数据模型。View 通过数据绑定监听 ViewModel 的变化。

**问题**：解释 MVVM 架构，为什么选择它？

**答案要点**：
1. View：UI 展示，不包含业务逻辑
2. ViewModel：业务逻辑、数据转换、可测试
3. Model：数据模型
4. 优点：可测试性高、关注点分离、适合 SwiftUI/Combine

**对比**：
- vs MVC：ViewModel 替代 Controller，更易测试，避免 Massive VC

**常见陷阱**：
- ❌ ViewModel 直接持有 View（应该反过来）
- ✅ View 持有 ViewModel，ViewModel 不知道 View 的存在

**追问**：
- Q: MVVM 的缺点是什么？
- A: 数据绑定复杂、调试困难、小项目可能过度设计、学习曲线陡峭

### 依赖注入

**概念**：将对象的依赖从内部创建改为外部传入

**详细解释**：
不在类内部直接创建依赖对象，而是通过构造函数、属性或方法参数传入。
这样可以轻松替换依赖（如用 Mock 测试），提高代码的可测试性和灵活性。

**问题**：什么是依赖注入？为什么要用？

**答案要点**：
1. 定义：依赖从外部传入而非内部创建
2. 方式：构造函数注入、属性注入、方法注入
3. 好处：可测试（注入 Mock）、解耦、灵活

**常见陷阱**：
- ❌ 在 ViewModel 里直接创建 NetworkService()
- ✅ 通过构造函数传入 protocol，方便测试时注入 Mock
