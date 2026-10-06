#!/usr/bin/env node
/**
 * Build dist/bagugu.json from content/八股文 (override with BAGUGU_DIR)
 * Run: node scripts/build-bagugu.js — only touches bagugu.json, safe on any machine
 */

const fs = require('fs');
const path = require('path');
const { parseBaguguFile } = require('./parse-bagugu.js');

const BAGUGU_DIR = process.env.BAGUGU_DIR || path.join(__dirname, '..', 'content', '八股文');
const DIST_DIR = path.join(__dirname, '..', 'dist');

function buildBagugu() {
  console.log('\n🎓 Building 八股文...');
  console.log(`📂 Source: ${BAGUGU_DIR}`);

  try {
    const baguguItems = [];

    // 遍历所有子目录（排序保证输出稳定）
    const categories = fs.readdirSync(BAGUGU_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .sort();

    for (const category of categories) {
      const categoryPath = path.join(BAGUGU_DIR, category);
      const files = fs.readdirSync(categoryPath)
        .filter(f => f.endsWith('.md'))
        .sort();

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
        const items = parseBaguguFile(content, filePath);
        baguguItems.push(...items);
      }
    }

    console.log(`✅ Found ${baguguItems.length} knowledge points`);

    // Write bagugu.json
    const baguguJson = JSON.stringify(baguguItems, null, 2);
    fs.writeFileSync(path.join(DIST_DIR, 'bagugu.json'), baguguJson);
    console.log(`📝 Written dist/bagugu.json (${(baguguJson.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.log('⚠️ Bagugu build skipped:', e.message);
  }
}

if (require.main === module) buildBagugu();

module.exports = { buildBagugu };
