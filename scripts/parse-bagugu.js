// scripts/parse-bagugu.js
const fs = require('fs');
const path = require('path');

function parseBaguguFile(content, filePath) {
  const items = [];
  const category = path.basename(path.dirname(filePath)) + '/' + 
                   path.basename(filePath, '.md');
  
  // 按 ### 分割知识点
  const sections = content.split(/(?=^### )/m).filter(s => s.trim() && s.startsWith('###'));
  
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
    oneLiner: extractField(content, /\*\*一句话\*\*[：:]\s*(.+)/),
    explanation: extractBlock(content, /\*\*详细解释\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/),
    question: extractField(content, /\*\*问题\*\*[：:]\s*(.+)/),
    keyPoints: extractList(content, /\*\*答案要点\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/),
    compare: extractCompare(content),
    compareTable: extractCompareTable(content),
    traps: extractTraps(content),
    followUp: extractFollowUp(content),
    codeQuiz: extractCodeQuiz(content),
    judge: extractJudge(content)
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

// **对比** 块里的 markdown 表格 → { headers, rows }
function extractCompareTable(content) {
  const match = content.match(/\*\*对比\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/);
  if (!match) return null;

  const rows = match[1].split('\n')
    .filter(line => line.trim().startsWith('|'))
    .filter(line => !/^\|[\s|:-]+\|$/.test(line.trim()))
    .map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
  if (rows.length < 2) return null;

  return { headers: rows[0], rows: rows.slice(1) };
}

// **代码题**：提示 + ```代码``` + - [ ] / - [x] 选项 + 解析：...
function extractCodeQuiz(content) {
  const quizzes = [];
  const blockRegex = /\*\*代码题\*\*[：:]\s*(.*)\n([\s\S]+?)(?=\n\*\*|$)/g;
  let m;

  while ((m = blockRegex.exec(content)) !== null) {
    const body = m[2];
    const code = body.match(/```\w*\n([\s\S]*?)```/);
    const options = [];
    let answer = -1;
    const optRegex = /^- \[([ xX])\] (.+)$/gm;
    let om;
    while ((om = optRegex.exec(body)) !== null) {
      if (om[1] !== ' ') answer = options.length;
      options.push(om[2].trim());
    }
    const why = body.match(/^解析[：:]\s*([\s\S]+)$/m);

    if (code && options.length >= 2 && answer >= 0) {
      quizzes.push({
        prompt: m[1].trim() || '下面代码输出什么？',
        code: code[1].replace(/\s+$/, ''),
        options,
        answer,
        why: why ? why[1].trim() : ''
      });
    }
  }
  return quizzes;
}

// **判断题**：- ✅ 正确说法 —— 理由 / - ❌ 错误说法 —— 理由
function extractJudge(content) {
  const match = content.match(/\*\*判断题\*\*[：:]\s*\n([\s\S]+?)(?=\n\*\*|$)/);
  if (!match) return [];

  return match[1].split('\n')
    .map(line => line.trim().match(/^- (✅|❌)\s*(.+)$/))
    .filter(Boolean)
    .map(([, mark, text]) => {
      const [statement, ...why] = text.split('——');
      return { statement: statement.trim(), correct: mark === '✅', why: why.join('——').trim() };
    });
}

module.exports = { parseBaguguFile };
