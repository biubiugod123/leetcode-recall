#!/usr/bin/env node
/**
 * Build script: converts SecondBrain/LeetCode markdown files to static JSON
 * Run: node scripts/build.js
 */

const fs = require('fs');
const path = require('path');
const { buildBagugu } = require('./build-bagugu.js');

const LEETCODE_DIR = '/Users/jiantanghuang/SecondBrain/LeetCode';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Ensure dist exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

function parseProblem(filePath, category) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath, '.md');
  const match = fileName.match(/^(\d+)-(.+)$/);
  if (!match) return null;

  const number = parseInt(match[1]);
  const title = match[2].trim();

  // Extract sections
  const sections = {};
  let currentSection = '';
  let currentContent = [];

  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = line.replace(/^## /, '').replace(/[📝🎯🚀📊💡🎨🔗📅🎓🔑⚡]/g, '').trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  // Extract difficulty
  const diffMatch = content.match(/难度[：:]\s*(\w+)/);
  const difficulty = diffMatch ? diffMatch[1] : 'Medium';

  // Extract code blocks
  const codeBlocks = [];
  const codeRegex = /```python\n([\s\S]*?)```/g;
  let cm;
  while ((cm = codeRegex.exec(content)) !== null) {
    codeBlocks.push(cm[1].trim());
  }

  // Extract key points
  const keyPoints = sections['关键要点'] || sections['关键点总结'] || sections['关键点'] || '';

  // Extract description summary
  let descSummary = '';
  const descSection = sections['题目'] || sections['题目描述'] || '';
  if (descSection) {
    const lines = descSection.split('\n');
    const summaryLines = [];
    for (const line of lines) {
      if (line.startsWith('**示例') || line.startsWith('**约束') || line.startsWith('```')) break;
      if (line.trim()) summaryLines.push(line.trim());
    }
    descSummary = summaryLines.join(' ').trim();
  }

  // Extract mistakes
  const mistakes = [];
  const mistakeRegex = /❌\s*(.+)/g;
  let mm;
  while ((mm = mistakeRegex.exec(content)) !== null) {
    mistakes.push(mm[1].trim());
  }

  return {
    number,
    title,
    fullTitle: `${number}. ${title}`,
    difficulty,
    category,
    codeBlocks,
    keyPoints,
    descSummary,
    mistakes,
    rawContent: content,
    sections
  };
}

function loadAllProblems() {
  const problems = [];
  try {
    const categories = fs.readdirSync(LEETCODE_DIR).filter(f => {
      const full = path.join(LEETCODE_DIR, f);
      return fs.statSync(full).isDirectory();
    });

    for (const cat of categories) {
      const catDir = path.join(LEETCODE_DIR, cat);
      const files = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        const prob = parseProblem(path.join(catDir, file), cat);
        if (prob) problems.push(prob);
      }
    }
  } catch (e) {
    console.error('Error loading problems:', e.message);
  }
  return problems.sort((a, b) => a.number - b.number);
}

// Build
console.log('🔨 Building LeetCode Recall PWA...');
console.log(`📂 Source: ${LEETCODE_DIR}`);
console.log(`📦 Output: ${DIST_DIR}`);

const problems = loadAllProblems();
console.log(`✅ Found ${problems.length} problems`);

// Write problems.json
const problemsJson = JSON.stringify(problems, null, 2);
fs.writeFileSync(path.join(DIST_DIR, 'problems.json'), problemsJson);
console.log(`📝 Written dist/problems.json (${(problemsJson.length / 1024).toFixed(1)} KB)`);

// Write build info
const buildInfo = {
  buildTime: new Date().toISOString(),
  problemCount: problems.length,
  version: `v${Date.now()}`
};
fs.writeFileSync(path.join(DIST_DIR, 'build-info.json'), JSON.stringify(buildInfo, null, 2));
console.log(`📝 Written dist/build-info.json`);

// Build 八股文
buildBagugu();

console.log('\n🎉 Build complete!');
