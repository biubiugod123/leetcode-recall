# UIKit核心

### Responder Chain

**概念**：iOS 中处理触摸事件的链式传递机制

**详细解释**：
当用户触摸屏幕时，系统需要找到应该响应这个触摸的视图。
这个过程分两步：先从上往下找到被点击的视图（Hit Testing），
再从下往上找到能处理事件的对象（Responder Chain）。

**问题**：解释 iOS 的 Responder Chain 机制

**答案要点**：
1. Hit Testing：从根视图向下递归查找，使用 hitTest(_:with:) 方法
2. Action 传递：从 hit 视图向上查找响应者
3. 顺序：View → ViewController → Window → AppDelegate

**对比**：
- vs Android 事件分发：iOS 先下后上，Android 是隧道+冒泡

**常见陷阱**：
- ❌ 只说 hit testing，忘了 action 传递
- ✅ 两部分都要说：先下（找视图）→ 再上（找响应者）

**追问**：
- Q: 如何让父视图响应而不是子视图？
- A: 子视图设置 isUserInteractionEnabled = false 或重写 hitTest 返回 nil

### View Lifecycle

**概念**：UIViewController 从创建到销毁的一系列回调方法

**详细解释**：
当 ViewController 被加载、显示、隐藏、销毁时，系统会调用一系列生命周期方法。
理解这些方法的调用顺序对于正确初始化和清理资源至关重要。

**问题**：说一下 UIViewController 的生命周期方法

**答案要点**：
1. loadView → viewDidLoad（只调用一次）
2. viewWillAppear → viewDidAppear（每次显示都调用）
3. viewWillDisappear → viewDidDisappear（每次消失都调用）

**对比**：
- vs viewDidLoad：viewWillAppear 每次显示都调用，viewDidLoad 只一次

**常见陷阱**：
- ❌ 在 viewDidLoad 里做依赖屏幕尺寸的布局
- ✅ 布局相关操作放 viewDidLayoutSubviews

**追问**：
- Q: viewDidLoad 和 viewWillAppear 应该分别做什么？
- A: viewDidLoad 做一次性初始化，viewWillAppear 做每次显示前的刷新（如数据更新）
