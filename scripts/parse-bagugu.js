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
