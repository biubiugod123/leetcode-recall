#!/usr/bin/env node
/**
 * Run every ```java 代码题 in dist/bagugu.json and check the marked answer.
 * Needs JDK 11+ (single-file source launch): JAVA=/path/to/java node scripts/verify-quiz.js
 *
 * Class / interface / enum declarations (and annotations right above them) that start at column 0
 * become top-level classes (so private access works like separate files); the remaining lines go into main().
 *
 * ```sql 代码题 run in Python's built-in sqlite3 (PYTHON=/path/to/python): statements are split on ";",
 * the rows of the last query are printed as "col col | col col"; special answers: 执行报错, 查询结果为空.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const JAVA = process.env.JAVA || 'java';
const PYTHON = process.env.PYTHON || 'python';
const SQL_RUNNER = `
import sqlite3, sys
con = sqlite3.connect(':memory:')
con.execute('PRAGMA foreign_keys = ON')
rows = None
try:
    for stmt in [s.strip() for s in sys.stdin.read().split(';') if s.strip()]:
        cur = con.execute(stmt)
        if cur.description is not None:
            rows = cur.fetchall()
except Exception as e:
    print('SQL_ERROR: ' + str(e))
    sys.exit(0)
print(' | '.join(' '.join('NULL' if v is None else str(v) for v in r) for r in (rows or [])))
`;
const items = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'dist', 'bagugu.json'), 'utf-8'));
const only = process.argv[2];   // optional: category prefix, e.g. "Java OOP"
const work = fs.mkdtempSync(path.join(os.tmpdir(), 'quiz-'));

const norm = s => s.trim().split(/\s+/).filter(Boolean).join(' ');

function splitSource(code) {
  const top = [], body = [];
  let depth = 0, inType = false;
  for (const line of code.split('\n')) {
    if (!inType && /^(@\w+(\(.*\))?\s*$|(abstract |final )*(class|interface|enum|record)\s)/.test(line)) inType = true;
    (inType ? top : body).push(line);
    if (inType) {
      depth += (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
      if (depth === 0 && line.includes('}')) inType = false;
    }
  }
  return { top: top.join('\n'), body: body.join('\n') };
}

let n = 0, fail = 0;
for (const item of items) {
  if (only && !item.category.startsWith(only)) continue;
  (item.codeQuiz || []).forEach((q, qi) => {
    if (q.lang === 'sql') {
      n++;
      const r = spawnSync(PYTHON, ['-c', SQL_RUNNER], { input: q.code, encoding: 'utf-8' });
      const raw = (r.stdout || '').trim();
      const sqlErr = raw.startsWith('SQL_ERROR:');
      const out = sqlErr ? '' : norm(raw);
      const expected = q.options[q.answer];
      const ok = expected === '执行报错' ? sqlErr : !sqlErr && out === (expected === '查询结果为空' ? '' : norm(expected));
      const clash = q.options.filter((o, i) => i !== q.answer && !sqlErr && norm(o) === out);
      if (!ok || clash.length) fail++;
      console.log(`${ok && !clash.length ? 'PASS' : 'FAIL'} ${item.title} #${qi + 1} | expected: ${expected} | actual: ${sqlErr ? raw : out}${clash.length ? ' | CLASH ' + clash : ''}`);
      return;
    }
    if (q.lang !== 'java') return;
    n++;
    const { top, body } = splitSource(q.code);
    const src = `import java.util.*;\nimport java.util.function.*;\nimport java.util.stream.*;\nimport java.io.*;\npublic class Q {\n  public static void main(String[] args) throws Exception {\n${body}\n  }\n}\n${top}\n`;
    const file = path.join(work, 'Q.java');
    fs.writeFileSync(file, src);
    const r = spawnSync(JAVA, ['-Duser.language=en', '-Dstdout.encoding=UTF-8', file], { encoding: 'utf-8' });
    const out = norm(r.stdout || '');
    const err = r.stderr || '';
    const compileErr = /error: compilation failed/.test(err);
    const exc = (err.match(/Exception in thread "main" java\.(?:lang|util|io)\.(\w+)/) || [])[1];
    const expected = q.options[q.answer];

    let ok, actual;
    if (expected === '编译错误') {
      ok = compileErr;
      actual = compileErr ? 'compile error: ' + (err.match(/error: (?!compilation failed).*/) || [''])[0] : out;
    } else if (expected.startsWith('抛出 ')) {
      ok = exc === expected.slice(3).trim();
      actual = exc ? 'throws ' + exc : (compileErr ? 'compile error' : out);
    } else {
      const want = expected === '什么也不输出' ? '' : norm(expected);
      ok = !compileErr && !exc && out === want;
      actual = compileErr ? 'compile error: ' + (err.match(/error: (?!compilation failed).*/) || [''])[0] : exc ? 'throws ' + exc : out;
    }
    // 错误选项不能恰好等于实际输出
    const clash = q.options.filter((o, i) => i !== q.answer && norm(o) === out && !compileErr && !exc);
    if (!ok || clash.length) fail++;
    console.log(`${ok && !clash.length ? 'PASS' : 'FAIL'} ${item.title} #${qi + 1} | expected: ${expected} | actual: ${actual}${clash.length ? ' | CLASH ' + clash : ''}`);
  });
}
console.log(`\n${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);
