# 面试 Killer 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 LeetCode Reviewer 扩展为支持八股文的综合面试复习工具

**Architecture:** 
- 新增八股文解析器，支持从 markdown 提取问题/答案/陷阱/追问
- 首页改为分类入口（LeetCode / 八股文）
- 复用现有间隔重复和练习框架

**Tech Stack:** 纯前端 PWA (HTML/CSS/JS)，Node.js 构建脚本

---

## Phase 1: 创建八股文目录结构 + Skill

### Task 1.1: 创建八股文目录结构

**Files:**
- Create: `/Users/jiantanghuang/SecondBrain/八股文/iOS/UIKit核心.md`
- Create: `/Users/jiantanghuang/SecondBrain/八股文/iOS/性能优化.md`
- Create: `/Users/jiantanghuang/SecondBrain/八股文/系统设计/App架构.md`

**Step 1: 创建目录**

```bash
mkdir -p "/Users/jiantanghuang/SecondBrain/八股文/iOS"
mkdir -p "/Users/jiantanghuang/SecondBrain/八股文/系统设计"
```

**Step 2: 创建示例文件 UIKit核心.md**

```markdown
# UIKit 核心

## 响应链机制

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
```

**Step 3: 创建示例文件 性能优化.md**

```markdown
# 性能优化

## 内存管理

### Retain Cycle

**概念**：两个或多个对象相互强引用导致无法释放的内存泄漏

**详细解释**：
当对象 A 强引用对象 B，对象 B 又强引用对象 A 时，
即使外部不再引用它们，它们的引用计数也不会变为 0，导致内存泄漏。

**问题**：什么是 Retain Cycle？如何避免？

**答案要点**：
1. 定义：相互强引用导致的内存泄漏
2. 常见场景：closure 捕获 self、delegate 强引用
3. 解决方案：[weak self]、[unowned self]、weak delegate

**常见陷阱**：
- ❌ 所有 closure 都用 weak self（有时不需要）
- ✅ 只在 closure 可能被 self 持有时才用 weak

**追问**：
- Q: weak 和 unowned 的区别？
- A: weak 是可选类型可为 nil，unowned 非可选假设永不为 nil
```

**Step 4: 创建空的系统设计示例**

```markdown
# App 架构

## 架构模式

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
4. 优点：可测试性、关注点分离

**对比**：
- vs MVC：ViewModel 替代 Controller，更易测试
- vs MVP：双向绑定 vs 手动更新

**追问**：
- Q: MVVM 的缺点是什么？
- A: 数据绑定复杂、调试困难、小项目过度设计
```

**Step 5: 验证目录结构**

Run: `ls -R "/Users/jiantanghuang/SecondBrain/八股文/"`

Expected:
```
iOS:
UIKit核心.md
性能优化.md

系统设计:
App架构.md
```

---

### Task 1.2: 创建 bagugu-notes Skill

**Files:**
- Create: `/Users/jiantanghuang/.openclaw/skills/bagugu-notes/SKILL.md`

**Step 1: 创建 skill 目录**

```bash
mkdir -p "/Users/jiantanghuang/.openclaw/skills/bagugu-notes"
```

**Step 2: 创建 SKILL.md**

```markdown
# 八股文笔记 Skill

记录八股文知识点时使用此模板，确保格式统一便于复习。

## 触发条件

当用户说：
- "记录八股文 XXX"
- "添加 iOS 八股 XXX"
- "写八股文笔记 XXX"

## 笔记位置

`/Users/jiantanghuang/SecondBrain/八股文/{category}/{topic}.md`

分类：
- `iOS/` - UIKit核心、性能优化、多线程、网络与存储
- `系统设计/` - App架构、网络层设计、性能优化

## 笔记模板

```markdown
### [知识点标题]

**概念**：[一句话定义]

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

## 记录流程

1. 确定分类和主题文件
2. 在对应文件末尾追加新知识点
3. 按模板格式填写
4. 运行 `cd ~/clawd/leetcode-recall-pwa && npm run build`
5. 推送更新

## 必须包含

- ✅ 概念（一句话定义）
- ✅ 详细解释
- ✅ 问题（面试问法）
- ✅ 答案要点（至少 3 点）
- ✅ 常见陷阱（❌ 错误 → ✅ 正确）

## 可选包含

- 对比（vs 其他概念）
- 追问（面试官追问）
- 代码示例
```

**Step 3: 验证 skill 创建**

Run: `cat "/Users/jiantanghuang/.openclaw/skills/bagugu-notes/SKILL.md" | head -20`

---

## Phase 2: 改造构建脚本

### Task 2.1: 创建八股文解析器

**Files:**
- Create: `scripts/parse-bagugu.js`

**Step 1: 创建解析器文件**

```javascript
// scripts/parse-bagugu.js
const fs = require('fs');
const path = require('path');

function parseBaguguFile(content, filePath) {
  const items = [];
  const category = path.basename(path.dirname(filePath)) + '/' + 
                   path.basename(filePath, '.md');
  
  // 按 ### 分割知识点
  const sections = content.split(/(?=^### )/m).filter(s => s.trim());
  
  for (const section of sections) {
    const item = parseSection(section, category);
    if (item && item.title) {
      items.push(item);
    }
  }
  
  return items;
}

function parseSection(section, category) {
  const lines = section.split('\n');
  
  // 提取标题
  const titleMatch = lines[0].match(/^### (.+)/);
  if (!titleMatch) return null;
  
  const title = titleMatch[1].trim();
  const content = lines.slice(1).join('\n');
  
  return {
    id: generateId(category, title),
    category,
    title,
    concept: extractField(content, /\*\*概念\*\*[：:]\s*(.+)/),
    explanation: extractBlock(content, /\*\*详细解释\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/),
    question: extractField(content, /\*\*问题\*\*[：:]\s*(.+)/),
    keyPoints: extractList(content, /\*\*答案要点\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/),
    compare: extractCompare(content),
    traps: extractTraps(content),
    followUp: extractFollowUp(content)
  };
}

function generateId(category, title) {
  return (category + '-' + title)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractField(content, regex) {
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractBlock(content, regex) {
  const match = content.match(regex);
  return match ? match[1].trim() : '';
}

function extractList(content, regex) {
  const match = content.match(regex);
  if (!match) return [];
  
  return match[1]
    .split('\n')
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, '').trim());
}

function extractCompare(content) {
  const match = content.match(/\*\*对比\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/);
  if (!match) return null;
  
  const vsMatch = match[1].match(/- vs (.+?)[：:]\s*(.+)/);
  if (!vsMatch) return null;
  
  return { vs: vsMatch[1].trim(), diff: vsMatch[2].trim() };
}

function extractTraps(content) {
  const match = content.match(/\*\*常见陷阱\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/);
  if (!match) return [];
  
  const traps = [];
  const lines = match[1].split('\n');
  let current = null;
  
  for (const line of lines) {
    if (line.includes('❌')) {
      if (current) traps.push(current);
      current = { wrong: line.replace(/^-\s*❌\s*/, '').trim(), right: '' };
    } else if (line.includes('✅') && current) {
      current.right = line.replace(/^-\s*✅\s*/, '').trim();
    }
  }
  if (current) traps.push(current);
  
  return traps;
}

function extractFollowUp(content) {
  const match = content.match(/\*\*追问\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/);
  if (!match) return [];
  
  const followUps = [];
  const lines = match[1].split('\n');
  let current = null;
  
  for (const line of lines) {
    if (line.startsWith('- Q:')) {
      if (current) followUps.push(current);
      current = { q: line.replace(/^- Q:\s*/, '').trim(), a: '' };
    } else if (line.startsWith('- A:') && current) {
      current.a = line.replace(/^- A:\s*/, '').trim();
    }
  }
  if (current) followUps.push(current);
  
  return followUps;
}

module.exports = { parseBaguguFile };
```

**Step 2: 验证语法**

Run: `node -c scripts/parse-bagugu.js`

Expected: `scripts/parse-bagugu.js`

---

### Task 2.2: 修改主构建脚本

**Files:**
- Modify: `scripts/build.js`

**Step 1: 更新 build.js 支持八股文**

在现有 build.js 末尾添加八股文构建逻辑：

```javascript
// 在文件顶部添加
const { parseBaguguFile } = require('./parse-bagugu.js');

// 在 buildLeetCode() 函数后添加
async function buildBagugu() {
  const baguguDir = '/Users/jiantanghuang/SecondBrain/八股文';
  const outputPath = path.join(__dirname, '../dist/bagugu.json');
  
  console.log('\n🎓 Building 八股文...');
  console.log(`📂 Source: ${baguguDir}`);
  
  const allItems = [];
  
  // 遍历所有子目录
  const categories = fs.readdirSync(baguguDir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  for (const category of categories) {
    const categoryPath = path.join(baguguDir, category);
    const files = fs.readdirSync(categoryPath)
      .filter(f => f.endsWith('.md'));
    
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const items = parseBaguguFile(content, filePath);
      allItems.push(...items);
    }
  }
  
  console.log(`✅ Found ${allItems.length} knowledge points`);
  
  fs.writeFileSync(outputPath, JSON.stringify(allItems, null, 2));
  console.log(`📝 Written ${outputPath}`);
}

// 修改主函数
async function main() {
  // 原有 LeetCode 构建
  buildLeetCode();
  
  // 新增八股文构建
  try {
    buildBagugu();
  } catch (e) {
    console.log('⚠️ Bagugu build skipped:', e.message);
  }
  
  console.log('\n🎉 Build complete!');
}

main();
```

**Step 2: 测试构建**

Run: `npm run build`

Expected:
```
🔨 Building LeetCode Recall PWA...
✅ Found 16 problems

🎓 Building 八股文...
✅ Found 3 knowledge points
📝 Written dist/bagugu.json

🎉 Build complete!
```

**Step 3: 验证输出**

Run: `cat dist/bagugu.json | head -30`

**Step 4: Commit**

```bash
git add scripts/parse-bagugu.js scripts/build.js
git commit -m "feat: add bagugu parser and build support"
```

---

## Phase 3: UI 改造 - 首页分类入口

### Task 3.1: 添加首页分类选择

**Files:**
- Modify: `dist/index.html`

**Step 1: 添加首页分类 HTML**

在 `<div id="app">` 后添加：

```html
<!-- 首页分类选择 -->
<div id="homeScreen" class="home-screen">
  <h1 class="home-title">🔥 面试 Killer</h1>
  <p class="home-subtitle">选择复习类型</p>
  
  <div class="category-grid">
    <div class="category-card" onclick="selectCategory('leetcode')">
      <div class="category-icon">💻</div>
      <div class="category-name">LeetCode</div>
      <div class="category-count" id="lcCount">0 题</div>
      <div class="category-due" id="lcDue">今日: 0</div>
    </div>
    
    <div class="category-card" onclick="selectCategory('bagugu')">
      <div class="category-icon">📚</div>
      <div class="category-name">八股文</div>
      <div class="category-count" id="bgCount">0 题</div>
      <div class="category-due" id="bgDue">今日: 0</div>
    </div>
  </div>
</div>
```

**Step 2: 添加首页 CSS**

```css
.home-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.home-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--accent), var(--green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.home-subtitle {
  color: var(--muted);
  margin-bottom: 40px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  max-width: 400px;
  width: 100%;
}

.category-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.category-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.category-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.category-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.category-count {
  color: var(--muted);
  font-size: 14px;
}

.category-due {
  color: var(--accent);
  font-size: 13px;
  margin-top: 4px;
}
```

**Step 3: 添加分类选择逻辑**

```javascript
let currentCategory = null;
let baguguData = [];

async function loadBagugu() {
  try {
    const res = await fetch('./bagugu.json');
    baguguData = await res.json();
    document.getElementById('bgCount').textContent = baguguData.length + ' 题';
  } catch (e) {
    console.log('No bagugu data');
  }
}

function selectCategory(category) {
  currentCategory = category;
  document.getElementById('homeScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  
  if (category === 'leetcode') {
    // 使用现有逻辑
    initDailySession(loadProgress());
  } else if (category === 'bagugu') {
    initBaguguSession();
  }
}

function backToHome() {
  document.getElementById('homeScreen').style.display = 'flex';
  document.getElementById('app').style.display = 'none';
  currentCategory = null;
}

// 页面加载时
document.addEventListener('DOMContentLoaded', () => {
  loadBagugu();
  document.getElementById('lcCount').textContent = problems.length + ' 题';
  
  // 默认显示首页
  document.getElementById('app').style.display = 'none';
});
```

**Step 4: 测试首页**

Run: 在浏览器中打开 `dist/index.html`

Expected: 看到首页有两个分类卡片

**Step 5: Commit**

```bash
git add dist/index.html
git commit -m "feat: add home screen with category selection"
```

---

## Phase 4-6: 后续任务

> 以下任务在 MVP 验证后继续实现

### Task 4.1: 八股文练习类型 - 概念回忆
### Task 4.2: 八股文练习类型 - 对比题
### Task 4.3: 八股文练习类型 - 陷阱辨析
### Task 4.4: 八股文练习类型 - 追问模拟
### Task 5.1: 迁移现有八股文内容
### Task 6.1: 项目改名
### Task 6.2: 部署更新

---

## 验收标准

MVP (Phase 1-3):
- [ ] 八股文目录结构已创建
- [ ] bagugu-notes skill 可用
- [ ] 构建脚本输出 bagugu.json
- [ ] 首页显示两个分类入口
- [ ] 点击 LeetCode 进入原有复习界面

完整版 (Phase 4-6):
- [ ] 八股文四种练习类型可用
- [ ] 现有内容已迁移
- [ ] 项目已改名并部署
