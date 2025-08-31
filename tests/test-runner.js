#!/usr/bin/env node
/**
 * Magic Book Fairy – capability-aware test runner
 * Skips empty suites, runs vitest where files exist, writes a JSON report.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class Runner {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, details: [] },
      integration: { passed: 0, failed: 0, details: [] },
      performance: { passed: 0, failed: 0, details: [] },
      coverage: { total: 0, covered: 0, percentage: 0 }
    };
    this.start = Date.now();
    this.root = process.cwd();
  }

  log(msg, level = 'info') {
    const ts = new Date().toISOString();
    const icon = { info:'📋', success:'✅', error:'❌', warning:'⚠️', debug:'🐛' }[level] || 'ℹ️';
    console.log(`${icon} [${ts}] ${msg}`);
  }

  list(dir) {
    try {
      return fs.readdirSync(dir, { withFileTypes: true })
        .flatMap(d => {
          const p = path.join(dir, d.name);
          return d.isDirectory() ? this.list(p) : [p];
        });
    } catch { return []; }
  }

  hasTests(subdir) {
    const files = this.list(path.join(this.root, 'tests'));
    return files.some(f => {
      const fp = f.replace(/\\/g, '/');
      return fp.includes(`tests/${subdir}/`) && /\.test\.(ts|js)$/.test(fp);
    });
  }

  runVitest(pattern, label) {
    this.log(`Starting: ${label}`);
    try {
      const cmd = `npx vitest run "${pattern}"`;
      const output = execSync(cmd, { encoding: 'utf8', stdio: 'pipe', cwd: this.root });
      this.log(`Completed: ${label}`, 'success');
      return { ok: true, output };
    } catch (e) {
      const out = (e.stdout || '') + (e.stderr || '');
      this.log(`Failed: ${label}`, 'error');
      return { ok: false, error: e.message, output: out };
    }
  }

  async runUnit() {
    this.log('=== Unit ===');
    const cats = [
      { name: 'LLM', sub: 'llm', pattern: 'tests/llm/**/*.test.*' },
      { name: 'Clients', sub: 'clients', pattern: 'tests/clients/**/*.test.*' },
      { name: 'Utils', sub: 'utils', pattern: 'tests/utils/**/*.test.*' },
      { name: 'Bot', sub: 'bot', pattern: 'tests/bot/**/*.test.*' },
    ];
    for (const c of cats) {
      if (!this.hasTests(c.sub)) { this.log(`No tests in '${c.sub}', skipping.`, 'warning'); continue; }
      const r = this.runVitest(c.pattern, `Unit: ${c.name}`);
      const bucket = this.results.unit;
      if (r.ok) bucket.passed++, bucket.details.push({ category: c.name, status: 'passed' });
      else bucket.failed++, bucket.details.push({ category: c.name, status: 'failed', error: r.error });
    }
  }

  async runIntegration() {
    this.log('=== Integration ===');
    if (!this.hasTests('integration')) { this.log(`No tests in 'integration', skipping.`, 'warning'); return; }
    const files = [
      { name: 'Message Pipeline', file: 'tests/integration/message-pipeline.test.*' },
      { name: 'Complete System', file: 'tests/integration/complete-system.test.*' },
      { name: 'Service Integration', file: 'tests/integration/service-integration.test.*' }
    ];
    for (const t of files) {
      const r = this.runVitest(t.file, `Integration: ${t.name}`);
      const bucket = this.results.integration;
      if (r.ok) bucket.passed++, bucket.details.push({ test: t.name, status: 'passed' });
      else bucket.failed++, bucket.details.push({ test: t.name, status: 'failed', error: r.error });
    }
  }

  async runPerformance() {
    this.log('=== Performance ===');
    if (!this.hasTests('performance')) { this.log(`No tests in 'performance', skipping.`, 'warning'); return; }
    const files = [
      { name: 'Response Time', file: 'tests/performance/response-times.test.*' },
      { name: 'Memory Usage', file: 'tests/performance/memory-usage.test.*' },
      { name: 'Concurrency', file: 'tests/performance/concurrency.test.*' }
    ];
    for (const t of files) {
      const r = this.runVitest(t.file, `Performance: ${t.name}`);
      const bucket = this.results.performance;
      if (r.ok) bucket.passed++, bucket.details.push({ test: t.name, status: 'passed', metrics: this.extractMetrics(r.output) });
      else bucket.failed++, bucket.details.push({ test: t.name, status: 'failed', error: r.error });
    }
  }

  extractMetrics(output) {
    const m = {};
    const rt = output.match(/Response time:\s*(\d+)ms/i);
    if (rt) m.responseTime = Number(rt[1]);
    const mem = output.match(/Memory usage:\s*(\d+)MB/i);
    if (mem) m.memoryUsage = Number(mem[1]);
    return m;
  }

  async coverage() {
    this.log('=== Coverage ===');
    const any = ['llm','clients','utils','bot','integration','performance'].some(s => this.hasTests(s));
    if (!any) { this.log('No tests at all, skipping coverage.', 'warning'); return; }
    try {
      const out = execSync('npx vitest run --coverage', { encoding: 'utf8', stdio: 'pipe', cwd: this.root });
      const m = out.match(/All files\s+\|\s+([\d.]+)/);
      const pct = m ? parseFloat(m[1]) : 0;
      const total = 1000;
      this.results.coverage = { total, covered: Math.round(total * pct / 100), percentage: pct };
      this.log(`Coverage: ${pct}%`);
    } catch (e) {
      this.log(`Coverage failed: ${e.message}`, 'error');
    }
  }

  writeJson() {
    const dur = `${Math.round((Date.now() - this.start) / 1000)}s`;
    const report = {
      testRun: {
        timestamp: new Date().toISOString(),
        duration: dur,
        env: { node: process.version, platform: process.platform, arch: process.arch }
      },
      summary: {
        unit: this.results.unit,
        integration: this.results.integration,
        performance: this.results.performance,
        coverage: this.results.coverage
      }
    };
    const out = path.join(this.root, 'tests', 'Test_Report.json');
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    this.log(`Wrote ${out}`, 'success');
  }

  async run() {
    this.log('🚀 Magic Book Fairy test run');
    await this.runUnit();
    await this.runIntegration();
    await this.runPerformance();
    await this.coverage();
    this.writeJson();
  }
}

new Runner().run().catch(err => { console.error(err); process.exit(1); });
