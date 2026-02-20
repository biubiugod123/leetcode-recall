# 面试 Killer - 设计文档

> 将 LeetCode Reviewer 扩展为个人综合复习工具

**创建时间**: 2026-02-20
**状态**: 设计完成，待实现

---

## 1. 项目目标

**核心目标**：打造长期学习工具，支持多种面试内容复习

**支持的内容类型**：
- LeetCode 算法题（已有）
- iOS 八股文（新增）
- 系统设计题（新增）
- 未来可扩展：后端、前端、通用 CS

---

## 2. 整体架构

### 数据来源

```
SecondBrain/
├── LeetCode/              # 已有，16 题
└── 八股文/                # 新建
    ├── iOS/
    │   ├── UIKit核心.md
    │   ├── 性能优化.md
    │   ├── 多线程.md
    │   └── 网络与存储.md
    ├── 系统设计/
    │   ├── App架构.md
    │   ├── 网络层设计.md
    │   └── 性能优化.md
    └── ...（未来扩展）
```

### 构建输出

```
dist/
├── problems.json          # LeetCode 题库（已有）
├── bagugu.json            # 八股文题库（新增）
└── index.html             # 统一入口
```

---

## 3. 八股文数据结构

### Markdown 格式（笔记文件）

```markdown
### 响应链机制

**概念**：iOS 中处理触摸事件的链式传递机制

**详细解释**：
当用户触摸屏幕时，系统需要找到应该响应这个触摸的视图。
这个过程分两步：先从上往下找到被点击的视图（Hit Testing），
再从下往上找到能处理事件的对象（Responder Chain）。

**问题**：解释 iOS 的 Responder Chain 机制

**答案要点**：
1. Hit Testing：从根视图向下递归查找
2. Action 传递：从 hit 视图向上查找响应者
3. 顺序：View → ViewController → Window → AppDelegate

**对比**：
- vs Android 事件分发：iOS 先下后上，Android 先下再上再下

**常见陷阱**：
- ❌ 只说 hit testing，忘了 action 传递
- ✅ 两部分都要说：先下（找视图）→ 再上（找响应者）

**追问**：
- Q: 如何让父视图响应而不是子视图？
- A: 子视图 `isUserInteractionEnabled = false` 或重写 `hitTest`
```

### JSON 结构（构建输出）

```json
{
  "id": "ios-responder-chain",
  "category": "iOS/UIKit核心",
  "title": "响应链机制",
  "concept": "iOS 中处理触摸事件的链式传递机制",
  "explanation": "当用户触摸屏幕时...",
  "question": "解释 iOS 的 Responder Chain 机制",
  "keyPoints": ["Hit Testing...", "Action 传递...", "顺序..."],
  "compare": { "vs": "Android 事件分发", "diff": "iOS 先下后上..." },
  "traps": [
    { "wrong": "只说 hit testing...", "right": "两部分都要说..." }
  ],
  "followUp": [
    { "q": "如何让父视图响应？", "a": "子视图 isUserInteractionEnabled..." }
  ]
}
```

---

## 4. 练习类型设计

### 四种练习类型（按优先级）

| 类型 | 展示 | 用户操作 | 对应字段 |
|------|------|----------|----------|
| 🎯 概念回忆 | 显示问题 | 写答案 → 对比要点 | `question` + `keyPoints` |
| ⚖️ 对比题 | "A 和 B 的区别？" | 回答 → 显示对比 | `compare` |
| ⚠️ 陷阱辨析 | 显示错误说法 | 找问题 → 显示正确 | `traps` |
| 💬 追问模拟 | 显示追问 | 回答 → 显示参考 | `followUp` |

### 每日队列生成

- 从到期的知识点中随机选择
- 每个知识点生成 1-2 种练习（不是全部 4 种）
- 优先生成"概念回忆"，穿插其他类型

### 自评与间隔重复

- 沿用现有 SM-2 算法
- 评分：✅ 记得 / 🤔 部分 / ❌ 忘了
- 根据评分调整下次复习时间

---

## 5. UI 改造

### 首页设计

```
┌─────────────────────────────┐
│      🔥 面试 Killer         │
│                             │
│  ┌─────────┐  ┌─────────┐  │
│  │ 💻      │  │ 📚      │  │
│  │ LeetCode│  │ 八股文  │  │
│  │ 16 题   │  │ 25 题   │  │
│  │ 今日: 5 │  │ 今日: 8 │  │
│  └─────────┘  └─────────┘  │
│                             │
│  ┌─────────┐               │
│  │ 🏗️      │               │
│  │系统设计 │               │
│  │ 10 题   │               │
│  └─────────┘               │
└─────────────────────────────┘
```

### 复习模式

- 完全分开：首页选类型再进入复习
- 沿用现有全屏复习模式
- 顶部显示当前类别标签
- 练习卡片样式统一（浮层答案、翻转动画等）

### 八股文特有 UI

- 对比题：左右分栏展示 A vs B
- 追问模拟：聊天气泡样式，模拟面试官追问

---

## 6. Skill 设计

### bagugu-notes skill

**触发词**：
- "记录八股文 XXX"
- "添加 iOS 八股 XXX"
- "写八股文笔记"

**笔记模板**：
```markdown
### [知识点标题]

**概念**：[这个东西是什么，一句话定义]

**详细解释**：
[2-3 句话展开说明原理/机制]

**问题**：[面试官会怎么问]

**答案要点**：
1. [要点1]
2. [要点2]
3. [要点3]

**对比**：（可选）
- vs [对比对象]：[区别说明]

**常见陷阱**：
- ❌ [错误做法/说法]
- ✅ [正确做法]

**追问**：（可选）
- Q: [面试官可能追问]
- A: [参考回答]
```

**Skill 职责**：
1. 确定放在哪个主题文件（如 `iOS/UIKit核心.md`）
2. 按模板格式写入
3. 运行 `npm run build` 重建题库
4. 推送到 GitHub

---

## 7. 实现计划

| 阶段 | 内容 | 预计工作量 |
|------|------|-----------|
| **Phase 1** | 创建八股文目录结构 + bagugu-notes skill | 30 分钟 |
| **Phase 2** | 改造构建脚本，支持解析八股文 | 1 小时 |
| **Phase 3** | UI 改造：首页分类入口 | 1 小时 |
| **Phase 4** | 八股文练习类型实现（概念回忆、对比、陷阱、追问） | 2 小时 |
| **Phase 5** | 迁移现有八股文内容到新格式 | 1 小时 |
| **Phase 6** | 项目改名 + 部署 | 30 分钟 |

### 优先级

- **MVP**: Phase 1-3（能跑起来）
- **完整版**: Phase 4-6

### 风险点

- 八股文格式解析可能需要调试
- 内容迁移需要手动整理

---

## 8. 技术细节

### 构建脚本改造

```javascript
// scripts/build.js
const sources = [
  { type: 'leetcode', path: 'SecondBrain/LeetCode', output: 'problems.json' },
  { type: 'bagugu', path: 'SecondBrain/八股文', output: 'bagugu.json' }
];

// 不同类型使用不同解析器
function parseFile(type, content) {
  if (type === 'leetcode') return parseLeetCode(content);
  if (type === 'bagugu') return parseBagugu(content);
}
```

### 八股文解析器

```javascript
function parseBagugu(content) {
  // 按 ### 分割知识点
  const items = content.split(/(?=^### )/m);
  
  return items.map(item => {
    return {
      title: extractField(item, /^### (.+)/m),
      concept: extractField(item, /\*\*概念\*\*：(.+)/),
      explanation: extractField(item, /\*\*详细解释\*\*：\n([\s\S]+?)(?=\n\*\*)/),
      question: extractField(item, /\*\*问题\*\*：(.+)/),
      keyPoints: extractList(item, /\*\*答案要点\*\*：\n([\s\S]+?)(?=\n\*\*|$)/),
      compare: extractCompare(item),
      traps: extractTraps(item),
      followUp: extractFollowUp(item)
    };
  });
}
```

---

## Appendix: 决策记录

| 问题 | 选择 | 理由 |
|------|------|------|
| 项目目标 | 长期学习工具 | 未来可扩展 |
| 内容组织 | 统一放 SecondBrain | 方便 Obsidian 管理 |
| 练习方式 | 概念 > 对比 > 陷阱 > 追问 | 按面试重要性排序 |
| 复习模式 | 完全分开 | UI 更清晰 |
| 笔记格式 | 按主题分文件 | 便于维护 |
| 项目命名 | 面试 Killer | 霸气 🔥 |
