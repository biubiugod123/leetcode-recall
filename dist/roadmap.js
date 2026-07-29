const LLM_ROADMAP_PROGRESS_KEY = 'llm-engineer-roadmap-progress-v1';

const LLM_ROADMAP = [
  {
    id: 'foundation',
    weeks: '第 1–3 周',
    title: 'Transformer 与 PyTorch 基础',
    goal: '能脱离高层 API 解释模型的数据流、张量形状、训练循环、生成过程和显存开销。',
    output: '阶段产出：50M–100M 参数 Mini GPT + 单元测试 + 性能记录',
    tasks: [
      {
        id: 'foundation-cs336',
        type: 'course',
        title: '浏览 CS336 总览并完成环境准备',
        detail: '重点锁定 Assignment 1 Basics；Assignment 2 先做 profiling 与 memory 部分。',
        resource: 'https://cs336.stanford.edu/',
        resourceLabel: '打开 CS336'
      },
      {
        id: 'foundation-tokenizer',
        type: 'practice',
        title: '实现并测试一个 BPE tokenizer',
        detail: '覆盖训练、encode/decode、特殊 token 与 round-trip 单元测试。'
      },
      {
        id: 'foundation-transformer',
        type: 'practice',
        title: '从零实现 Decoder-only Transformer',
        detail: '包括 embedding、RMSNorm、causal self-attention、MLP、residual 和 cross-entropy。',
        resource: 'https://docs.pytorch.org/tutorials/beginner/transformer_tutorial.html',
        resourceLabel: 'PyTorch 教程'
      },
      {
        id: 'paper-attention',
        type: 'paper',
        title: '精读：Attention Is All You Need',
        detail: '回答：注意力解决了什么瓶颈？Q/K/V 的 shape 如何变化？',
        resource: 'https://arxiv.org/abs/1706.03762',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-rope',
        type: 'paper',
        title: '阅读：RoFormer / RoPE',
        detail: '理解旋转位置编码如何把相对位置信息写入 attention。',
        resource: 'https://arxiv.org/abs/2104.09864',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-llama',
        type: 'paper',
        title: '阅读：LLaMA',
        detail: '关注现代 decoder-only 模型的 normalization、activation 与训练配置。',
        resource: 'https://arxiv.org/abs/2302.13971',
        resourceLabel: '阅读论文'
      },
      {
        id: 'foundation-train',
        type: 'practice',
        title: '训练 50M–100M 参数的 Mini GPT',
        detail: '记录 loss curve、tokens/s、峰值显存、checkpoint 与恢复过程。'
      },
      {
        id: 'foundation-inference',
        type: 'practice',
        title: '加入 KV Cache 与采样策略',
        detail: '实现 temperature、top-k、top-p，并比较使用 KV Cache 前后的生成速度。'
      },
      {
        id: 'foundation-proof',
        type: 'practice',
        title: '整理基础阶段的工程证据',
        detail: '补齐 causal mask、tokenizer、checkpoint 测试；README 写清 tensor shape 与性能结果。',
        resource: 'https://huggingface.co/learn/llm-course/en/chapter1/1',
        resourceLabel: 'HF 辅助课程'
      }
    ]
  },
  {
    id: 'post-training',
    weeks: '第 4–5 周',
    title: '现代 Post-training',
    goal: '把已有 SFT、DPO、ORPO 经历整理为可复现、可比较、可部署的训练管线。',
    output: '阶段产出：Base / SFT / SFT+DPO 对照实验 + 可部署 adapter',
    tasks: [
      {
        id: 'post-trl',
        type: 'course',
        title: '学习 TRL 的 SFTTrainer 与 DPOTrainer',
        detail: '重点看 dataset formats、PEFT integration、memory optimization 与训练日志。',
        resource: 'https://huggingface.co/docs/trl/index',
        resourceLabel: '打开 TRL'
      },
      {
        id: 'post-data',
        type: 'practice',
        title: '建立训练数据处理管线',
        detail: '实现 chat template、sequence packing、response-only loss mask、清洗与可复现划分。'
      },
      {
        id: 'post-qlora',
        type: 'practice',
        title: '对 1B–3B 模型完成一次 QLoRA SFT',
        detail: '记录显存、训练时间、数据量、validation loss，并验证 checkpoint resume。'
      },
      {
        id: 'post-compare',
        type: 'practice',
        title: '比较 Base、SFT 与 SFT + DPO',
        detail: '使用同一数据集，记录 task accuracy、生成速度、显存与定性失败案例。'
      },
      {
        id: 'post-distributed',
        type: 'course',
        title: '理解 DDP 与 FSDP2 的切分方式',
        detail: '能解释参数、梯度、optimizer state 在两种方案中的复制与切分。',
        resource: 'https://docs.pytorch.org/tutorials/intermediate/FSDP_tutorial.html',
        resourceLabel: 'FSDP2 教程'
      },
      {
        id: 'paper-lora',
        type: 'paper',
        title: '精读：LoRA',
        detail: '理解低秩更新的假设、参数量变化与 adapter 部署方式。',
        resource: 'https://arxiv.org/abs/2106.09685',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-qlora',
        type: 'paper',
        title: '阅读：QLoRA',
        detail: '关注 NF4、double quantization 与 paged optimizer。',
        resource: 'https://arxiv.org/abs/2305.14314',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-zero',
        type: 'paper',
        title: '阅读：ZeRO',
        detail: '理解 optimizer、gradient、parameter 三个 stage 的内存变化。',
        resource: 'https://arxiv.org/abs/1910.02054',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-flash-attention',
        type: 'paper',
        title: '精读：FlashAttention',
        detail: '从 IO complexity 理解为什么它更快，而不只是记住“省显存”。',
        resource: 'https://arxiv.org/abs/2205.14135',
        resourceLabel: '阅读论文'
      }
    ]
  },
  {
    id: 'inference',
    weeks: '第 6–8 周',
    title: '高性能 LLM 推理',
    goal: '掌握 prefill/decode、continuous batching、PagedAttention、量化、缓存与服务性能指标。',
    output: '阶段产出：Transformers vs vLLM 推理 Benchmark 报告',
    tasks: [
      {
        id: 'inference-vllm',
        type: 'course',
        title: '完成 vLLM Quickstart 与核心概念阅读',
        detail: '明确 TTFT、TPOT、tokens/s、requests/s 和 throughput/latency 权衡。',
        resource: 'https://docs.vllm.ai/',
        resourceLabel: '打开 vLLM'
      },
      {
        id: 'inference-baseline',
        type: 'practice',
        title: '用 Transformers generate() 建立基线',
        detail: '固定模型、prompt、context 与输出长度，记录单请求延迟、吞吐与显存。'
      },
      {
        id: 'inference-serving',
        type: 'practice',
        title: '部署同一模型的 vLLM 服务',
        detail: '暴露 OpenAI-compatible endpoint，并验证 streaming 与并发请求。',
        resource: 'https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html',
        resourceLabel: 'Serving 文档'
      },
      {
        id: 'inference-concurrency',
        type: 'practice',
        title: '完成并发 1 / 4 / 8 / 16 压测',
        detail: '比较 P50/P95 latency、TTFT、TPOT、吞吐与 GPU utilization。'
      },
      {
        id: 'inference-quantization',
        type: 'practice',
        title: '比较原精度与量化模型',
        detail: '至少选择一种 AWQ、GPTQ 或 bitsandbytes，记录速度、显存与质量变化。',
        resource: 'https://docs.vllm.ai/en/latest/features/quantization/',
        resourceLabel: '量化文档'
      },
      {
        id: 'inference-cache',
        type: 'practice',
        title: '测试 prefix caching 与不同 context length',
        detail: '比较缓存开关、短/长上下文对 TTFT、吞吐和显存的影响。'
      },
      {
        id: 'inference-report',
        type: 'practice',
        title: '发布可复现的推理 Benchmark 报告',
        detail: '包含硬件、模型、参数、负载生成方式、图表、结论与设计 trade-off。'
      },
      {
        id: 'paper-paged-attention',
        type: 'paper',
        title: '精读：PagedAttention / vLLM',
        detail: '理解 KV Cache 碎片、block table 与 continuous batching 的关系。',
        resource: 'https://arxiv.org/abs/2309.06180',
        resourceLabel: '阅读论文'
      }
    ]
  },
  {
    id: 'production',
    weeks: '第 9–12 周',
    title: '生产级 LLM 系统',
    goal: '把模型能力做成在并发、失败、成本与版本变化下仍然可靠的服务。',
    output: '阶段产出：vLLM + 路由 + 缓存 + 可观测性的生产级项目',
    tasks: [
      {
        id: 'production-course',
        type: 'course',
        title: '选学 Full Stack LLM Bootcamp',
        detail: '只看 LLM Foundations、Augmented LMs、LLMOps、Launch an LLM App 与 UX。',
        resource: 'https://fullstackdeeplearning.com/llm-bootcamp/',
        resourceLabel: '打开课程'
      },
      {
        id: 'production-api',
        type: 'practice',
        title: '建立 FastAPI gateway 与流式输出',
        detail: '统一请求 schema、structured output validation、鉴权、限流与 backpressure。',
        resource: 'https://fastapi.tiangolo.com/',
        resourceLabel: 'FastAPI 文档'
      },
      {
        id: 'production-state',
        type: 'practice',
        title: '接入异步队列、PostgreSQL 与 Redis',
        detail: '区分同步推理、长任务、缓存、会话状态和持久化结果的职责。'
      },
      {
        id: 'production-router',
        type: 'practice',
        title: '实现本地模型与商业 API 路由',
        detail: '支持能力/成本路由、fallback、模型降级与请求级 token 成本统计。'
      },
      {
        id: 'production-reliability',
        type: 'practice',
        title: '加入 timeout、retry 与 circuit breaker',
        detail: '为模型失败、格式错误、工具失败、限流和下游不可用定义清晰策略。'
      },
      {
        id: 'production-observability',
        type: 'practice',
        title: '建立 tracing、prompt version 与成本面板',
        detail: '每条请求可追踪模型、prompt、token、延迟、错误、fallback 与用户反馈。'
      },
      {
        id: 'production-delivery',
        type: 'practice',
        title: '完成 Docker、CI/CD 与自动化测试',
        detail: '覆盖 unit/integration/load tests，并在 README 展示架构、失败场景和压测结果。',
        resource: 'https://docs.docker.com/compose/',
        resourceLabel: 'Compose 文档'
      },
      {
        id: 'paper-rag',
        type: 'paper',
        title: '阅读：Retrieval-Augmented Generation',
        detail: '理解 retrieval 与 generation 的职责边界和联合训练设定。',
        resource: 'https://arxiv.org/abs/2005.11401',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-lost-middle',
        type: 'paper',
        title: '阅读：Lost in the Middle',
        detail: '把长上下文中的位置偏差转化为 RAG 排序与提示设计决策。',
        resource: 'https://arxiv.org/abs/2307.03172',
        resourceLabel: '阅读论文'
      }
    ]
  },
  {
    id: 'evaluation',
    weeks: '第 13–14 周',
    title: 'Evaluation、Agent 与安全',
    goal: '把你的 Agent Safety 研究优势转化为可自动运行的质量门禁和可靠性工程。',
    output: '阶段产出：100 条评测集 + 回归测试 + Agent 安全质量门禁',
    tasks: [
      {
        id: 'evaluation-agents',
        type: 'course',
        title: '选择性完成 Hugging Face Agents Course',
        detail: '学习 Unit 1、一个框架（LangGraph）、Unit 4，以及 function calling / observability bonus。',
        resource: 'https://huggingface.co/learn/agents-course/en/unit0/introduction',
        resourceLabel: '打开课程'
      },
      {
        id: 'evaluation-mlflow',
        type: 'course',
        title: '学习 MLflow LLM & Agent Evaluation',
        detail: '覆盖 tracing、evaluation dataset、custom scorer、LLM judge 与 regression test。',
        resource: 'https://mlflow.org/docs/latest/genai/eval-monitor/',
        resourceLabel: 'MLflow 文档'
      },
      {
        id: 'evaluation-dataset',
        type: 'practice',
        title: '建立至少 100 条评测案例',
        detail: '40 正常任务、20 边界条件、20 工具失败、10 prompt injection、10 越权/敏感信息。'
      },
      {
        id: 'evaluation-gate',
        type: 'practice',
        title: '把评测接入发布前回归质量门禁',
        detail: '同时监控 task success、tool accuracy、latency、cost、泄漏与版本回退条件。'
      },
      {
        id: 'paper-instructgpt',
        type: 'paper',
        title: '阅读：InstructGPT',
        detail: '理解 SFT、reward model 与 PPO 三段式对齐流程。',
        resource: 'https://arxiv.org/abs/2203.02155',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-dpo',
        type: 'paper',
        title: '精读：Direct Preference Optimization',
        detail: '推导 DPO objective，并理解 reference model 与偏好对的作用。',
        resource: 'https://arxiv.org/abs/2305.18290',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-cot',
        type: 'paper',
        title: '阅读：Chain-of-Thought Prompting',
        detail: '理解示例规模、任务类型与 reasoning elicitation 的关系。',
        resource: 'https://arxiv.org/abs/2201.11903',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-react',
        type: 'paper',
        title: '阅读：ReAct',
        detail: '关注 reasoning/action 交替、tool feedback 与 trajectory 评测。',
        resource: 'https://arxiv.org/abs/2210.03629',
        resourceLabel: '阅读论文'
      },
      {
        id: 'paper-llm-judge',
        type: 'paper',
        title: '精读：Judging LLM-as-a-Judge',
        detail: '理解 position、verbosity、self-enhancement bias，并设计 judge 校准。',
        resource: 'https://arxiv.org/abs/2306.05685',
        resourceLabel: '阅读论文'
      }
    ]
  }
];

const LLM_ROADMAP_FILTER_LABELS = {
  all: '全部',
  course: '课程',
  practice: '实践',
  paper: '论文'
};

const LLM_ROADMAP_TYPE_LABELS = {
  course: '课程',
  practice: '实践',
  paper: '论文'
};

const LLM_STUDY_CRITERIA = {
  course: [
    '完成指定章节，并用自己的话写下至少 3 个核心概念',
    '不看资料，解释这些概念之间的因果关系或数据流',
    '完成本课对应的小实验；只看完视频不算完成'
  ],
  practice: [
    '代码或系统能够运行，并保存可复现的启动命令与配置',
    '至少记录一个量化指标，例如 loss、显存、TTFT、吞吐或成功率',
    '写下一次遇到的问题、定位过程和最终解决办法'
  ],
  paper: [
    '回答论文解决了什么具体瓶颈，以及旧方法为什么不够',
    '用自己的话解释核心机制，不照抄摘要',
    '记录作者用什么指标证明有效，以及它会怎样影响你的系统设计'
  ]
};

let llmRoadmapView = {
  phase: 'all',
  type: 'all',
  query: ''
};

function getLlmRoadmapTasks() {
  return LLM_ROADMAP.flatMap((phase, phaseIndex) =>
    phase.tasks.map((task, taskIndex) => ({ ...task, phase, phaseIndex, taskIndex }))
  );
}

function loadLlmRoadmapProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(LLM_ROADMAP_PROGRESS_KEY) || '{}');
    return saved.completed ? saved : { completed: saved, notes: {} };
  } catch (error) {
    return { completed: {}, notes: {} };
  }
}

function saveLlmRoadmapProgress(progress) {
  localStorage.setItem(
    LLM_ROADMAP_PROGRESS_KEY,
    JSON.stringify({
      completed: progress.completed || {},
      notes: progress.notes || {},
      updatedAt: new Date().toISOString()
    })
  );
}

function getLlmRoadmapStats(progress = loadLlmRoadmapProgress()) {
  const tasks = getLlmRoadmapTasks();
  const completed = tasks.filter(task => progress.completed?.[task.id]).length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  const nextTask = tasks.find(task => !progress.completed?.[task.id]) || null;
  const currentPhase = nextTask?.phase || LLM_ROADMAP[LLM_ROADMAP.length - 1];
  return { total: tasks.length, completed, percent, nextTask, currentPhase };
}

function updateLlmRoadmapHomeSummary() {
  const count = document.getElementById('llmCount');
  const due = document.getElementById('llmDue');
  if (!count || !due) return;

  const stats = getLlmRoadmapStats();
  count.textContent = `${LLM_ROADMAP.length} 阶段 · ${stats.total} 任务`;
  due.textContent = stats.percent === 100
    ? '路线已完成 ✓'
    : `进度: ${stats.completed}/${stats.total} · ${stats.percent}%`;
}

function escapeRoadmapHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initLlmRoadmap() {
  document.getElementById('fullscreenOverlay')?.remove();
  const initialStats = getLlmRoadmapStats();
  llmRoadmapView = { phase: initialStats.currentPhase.id, type: 'all', query: '' };

  const overlay = document.createElement('div');
  overlay.id = 'fullscreenOverlay';
  overlay.className = 'roadmap-overlay';
  overlay.innerHTML = `
    <main class="roadmap-shell">
      <div class="roadmap-topbar">
        <div class="roadmap-brand">LLM Systems Roadmap</div>
        <button class="roadmap-back" onclick="backToHome()" aria-label="返回首页">← 返回首页</button>
      </div>

      <section class="roadmap-hero">
        <div>
          <div class="roadmap-kicker">今天，只学下一件事</div>
          <h1 class="roadmap-title">LLM 工程学习工作台</h1>
        </div>
        <p class="roadmap-intro">
          面向 <strong>LLM Systems / Applied AI Engineer</strong>：
          每周 12–15 小时，按 60% 实践、25% 课程、15% 论文推进。
          每一课都要留下自己的总结与可验证产出。
        </p>
      </section>

      <section class="roadmap-summary" aria-label="学习路线概览">
        <div class="roadmap-progress-cell">
          <div class="roadmap-summary-label">总体进度</div>
          <div class="roadmap-summary-value" id="roadmapProgressValue">0 / 44</div>
          <div class="roadmap-progress-track">
            <div class="roadmap-progress-fill" id="roadmapProgressFill" style="width:0%"></div>
          </div>
        </div>
        <div class="roadmap-stat-cell">
          <div class="roadmap-summary-label">核心周期</div>
          <div class="roadmap-summary-value">14 周</div>
        </div>
        <div class="roadmap-stat-cell">
          <div class="roadmap-summary-label">每周投入</div>
          <div class="roadmap-summary-value">12–15h</div>
        </div>
        <div class="roadmap-stat-cell">
          <div class="roadmap-summary-label">当前阶段</div>
          <div class="roadmap-summary-value small" id="roadmapCurrentPhase">基础</div>
        </div>
      </section>

      <section id="roadmapNext"></section>

      <div class="roadmap-toolbar">
        <input
          id="roadmapSearch"
          class="roadmap-search"
          type="search"
          placeholder="搜索课程、技术或论文…"
          oninput="setLlmRoadmapSearch(this.value)"
          aria-label="搜索学习任务"
        />
        <div class="roadmap-filters" id="roadmapFilters" aria-label="任务类型筛选"></div>
      </div>

      <nav class="roadmap-phase-tabs" id="roadmapPhaseTabs" aria-label="阶段筛选"></nav>
      <div id="roadmapPhaseList"></div>
    </main>
  `;

  document.body.appendChild(overlay);
  renderLlmRoadmap();
}

function setLlmRoadmapPhase(phaseId) {
  llmRoadmapView.phase = phaseId;
  renderLlmRoadmap();
}

function setLlmRoadmapType(type) {
  llmRoadmapView.type = type;
  renderLlmRoadmap();
}

function setLlmRoadmapSearch(query) {
  llmRoadmapView.query = String(query || '').trim().toLowerCase();
  renderLlmRoadmap({ preserveSearchFocus: true });
}

function toggleLlmRoadmapTask(taskId, completed) {
  const progress = loadLlmRoadmapProgress();
  progress.completed = progress.completed || {};
  if (completed) progress.completed[taskId] = true;
  else delete progress.completed[taskId];
  saveLlmRoadmapProgress(progress);
  updateLlmRoadmapHomeSummary();
  renderLlmRoadmap();
}

function renderLlmRoadmap(options = {}) {
  const list = document.getElementById('roadmapPhaseList');
  if (!list) return;

  const progress = loadLlmRoadmapProgress();
  const stats = getLlmRoadmapStats(progress);

  document.getElementById('roadmapProgressValue').textContent =
    `${stats.completed} / ${stats.total} · ${stats.percent}%`;
  document.getElementById('roadmapProgressFill').style.width = `${stats.percent}%`;
  document.getElementById('roadmapCurrentPhase').textContent =
    stats.percent === 100 ? '路线完成' : stats.currentPhase.title;

  const next = document.getElementById('roadmapNext');
  if (stats.nextTask) {
    next.innerHTML = `
      <div class="roadmap-next">
        <div class="roadmap-next-index">NEXT</div>
        <div>
          <div class="roadmap-next-label">${escapeRoadmapHtml(stats.nextTask.phase.weeks)} · 下一项</div>
          <div class="roadmap-next-title">${escapeRoadmapHtml(stats.nextTask.title)}</div>
          <div class="roadmap-next-meta">${escapeRoadmapHtml(stats.nextTask.phase.title)}</div>
        </div>
        <button class="roadmap-next-action" type="button"
                onclick="openLlmStudyTask('${stats.nextTask.id}')">
          开始这一课 →
        </button>
      </div>
    `;
  } else {
    next.innerHTML = `
      <div class="roadmap-next roadmap-complete">
        <div class="roadmap-next-index">✓</div>
        <div>
          <div class="roadmap-next-label" style="color:#4a541f">全部完成</div>
          <div class="roadmap-next-title">你已经完成整条 LLM Systems 学习路线。</div>
          <div class="roadmap-next-meta" style="color:#526025">下一步：整理项目指标并开始定向投递。</div>
        </div>
      </div>
    `;
  }

  const filters = document.getElementById('roadmapFilters');
  filters.innerHTML = Object.entries(LLM_ROADMAP_FILTER_LABELS).map(([type, label]) => `
    <button class="roadmap-filter ${llmRoadmapView.type === type ? 'active' : ''}"
            type="button" onclick="setLlmRoadmapType('${type}')">
      ${label}
    </button>
  `).join('');

  const phaseTabs = document.getElementById('roadmapPhaseTabs');
  const allTab = `
    <button class="roadmap-phase-tab ${llmRoadmapView.phase === 'all' ? 'active' : ''}"
            type="button" onclick="setLlmRoadmapPhase('all')">
      全部阶段 <span>${stats.percent}%</span>
    </button>
  `;
  phaseTabs.innerHTML = allTab + LLM_ROADMAP.map((phase, index) => {
    const done = phase.tasks.filter(task => progress.completed?.[task.id]).length;
    const pct = Math.round((done / phase.tasks.length) * 100);
    return `
      <button class="roadmap-phase-tab ${llmRoadmapView.phase === phase.id ? 'active' : ''}"
              type="button" onclick="setLlmRoadmapPhase('${phase.id}')">
        ${index + 1}. ${escapeRoadmapHtml(phase.title)} <span>${pct}%</span>
      </button>
    `;
  }).join('');

  const query = llmRoadmapView.query;
  const visiblePhases = LLM_ROADMAP
    .filter(phase => llmRoadmapView.phase === 'all' || llmRoadmapView.phase === phase.id)
    .map((phase, index) => {
      const tasks = phase.tasks.filter(task => {
        const matchesType = llmRoadmapView.type === 'all' || task.type === llmRoadmapView.type;
        const haystack = `${task.title} ${task.detail} ${phase.title}`.toLowerCase();
        return matchesType && (!query || haystack.includes(query));
      });
      return { phase, index: LLM_ROADMAP.indexOf(phase), tasks };
    })
    .filter(entry => entry.tasks.length);

  list.innerHTML = visiblePhases.length
    ? visiblePhases.map(({ phase, index, tasks }) => renderLlmRoadmapPhase(phase, index, tasks, progress)).join('')
    : '<div class="roadmap-empty">没有匹配的任务，换一个阶段、类型或搜索词试试。</div>';

  if (options.preserveSearchFocus) {
    const search = document.getElementById('roadmapSearch');
    search.value = query;
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
  } else {
    const search = document.getElementById('roadmapSearch');
    if (search) search.value = query;
  }
}

function renderLlmRoadmapPhase(phase, index, tasks, progress) {
  const taskRows = tasks.map(task => {
    const done = Boolean(progress.completed?.[task.id]);
    const hasNote = Boolean(progress.notes?.[task.id]?.trim());

    return `
      <div class="roadmap-task ${done ? 'is-done' : ''}">
        <input class="roadmap-check" type="checkbox" ${done ? 'checked' : ''}
               onchange="toggleLlmRoadmapTask('${task.id}', this.checked)"
               aria-label="标记 ${escapeRoadmapHtml(task.title)} 为完成" />
        <span class="roadmap-type ${task.type}">${LLM_ROADMAP_TYPE_LABELS[task.type]}</span>
        <div class="roadmap-task-copy">
          <div class="roadmap-task-title">${escapeRoadmapHtml(task.title)}</div>
          <div class="roadmap-task-detail">${escapeRoadmapHtml(task.detail)}</div>
          ${hasNote ? '<div class="roadmap-task-note">● 已有学习笔记</div>' : ''}
        </div>
        <button class="roadmap-resource" type="button"
                onclick="openLlmStudyTask('${task.id}')">
          ${done ? '复习' : '开始学习'} →
        </button>
      </div>
    `;
  }).join('');

  return `
    <section class="roadmap-phase">
      <header class="roadmap-phase-head">
        <div>
          <div class="roadmap-phase-number">Phase ${index + 1} · ${escapeRoadmapHtml(phase.weeks)}</div>
          <h2 class="roadmap-phase-title">${escapeRoadmapHtml(phase.title)}</h2>
          <p class="roadmap-phase-goal">${escapeRoadmapHtml(phase.goal)}</p>
        </div>
        <div class="roadmap-phase-output">${escapeRoadmapHtml(phase.output)}</div>
      </header>
      <div>${taskRows}</div>
    </section>
  `;
}

function findLlmRoadmapTask(taskId) {
  return getLlmRoadmapTasks().find(task => task.id === taskId) || null;
}

function openLlmStudyTask(taskId) {
  const task = findLlmRoadmapTask(taskId);
  if (!task) return;

  document.getElementById('roadmapStudyOverlay')?.remove();
  const progress = loadLlmRoadmapProgress();
  const note = progress.notes?.[task.id] || '';
  const tasks = getLlmRoadmapTasks();
  const position = tasks.findIndex(item => item.id === task.id) + 1;
  const criteria = LLM_STUDY_CRITERIA[task.type] || LLM_STUDY_CRITERIA.practice;

  const overlay = document.createElement('div');
  overlay.id = 'roadmapStudyOverlay';
  overlay.className = 'roadmap-study-overlay';
  overlay.onclick = event => {
    if (event.target === overlay) closeLlmStudyTask();
  };
  overlay.innerHTML = `
    <article class="roadmap-study-panel" onclick="event.stopPropagation()">
      <header class="roadmap-study-head">
        <div>
          <div class="roadmap-study-step">
            ${escapeRoadmapHtml(task.phase.title)} · 第 ${position}/${tasks.length} 课 ·
            ${LLM_ROADMAP_TYPE_LABELS[task.type]}
          </div>
          <h2 class="roadmap-study-title">${escapeRoadmapHtml(task.title)}</h2>
        </div>
        <button class="roadmap-study-close" type="button" onclick="closeLlmStudyTask()"
                aria-label="关闭学习页">✕</button>
      </header>

      <div class="roadmap-study-body">
        <section class="roadmap-study-section">
          <div class="roadmap-study-label">01 · 本课目标</div>
          <div class="roadmap-study-objective">${escapeRoadmapHtml(task.detail)}</div>
        </section>

        <section class="roadmap-study-section">
          <div class="roadmap-study-label">02 · 学习材料</div>
          <div class="roadmap-study-material">
            <div class="roadmap-study-material-copy">
              ${task.resource
                ? '先带着“本课目标”阅读，不需要把整门课或整份文档一次看完。'
                : '这是实践任务：在你的项目中完成它，并保留代码、命令、配置和实验结果。'}
            </div>
            ${task.resource ? `
              <a href="${escapeRoadmapHtml(task.resource)}" target="_blank" rel="noopener noreferrer">
                ${escapeRoadmapHtml(task.resourceLabel || '打开学习资料')} ↗
              </a>
            ` : ''}
          </div>
        </section>

        <section class="roadmap-study-section">
          <div class="roadmap-study-label">03 · 完成标准</div>
          <ul class="roadmap-study-criteria">
            ${criteria.map(item => `<li>${escapeRoadmapHtml(item)}</li>`).join('')}
          </ul>
        </section>

        <section class="roadmap-study-section">
          <div class="roadmap-study-label">04 · 用自己的话总结</div>
          <textarea
            class="roadmap-note"
            id="roadmapNote"
            placeholder="${task.type === 'paper'
              ? '1. 论文解决了什么瓶颈？\\n2. 核心机制是什么？\\n3. 用什么证据证明？\\n4. 对我的系统有什么影响？'
              : '写下关键概念、实验结果、踩过的坑，以及你现在还不能解释的问题…'}"
            oninput="saveLlmRoadmapNote('${task.id}', this.value)"
          >${escapeRoadmapHtml(note)}</textarea>
          <div class="roadmap-note-hint">
            <span>笔记自动保存在当前浏览器</span>
            <span id="roadmapNoteCount">${note.length} 字</span>
          </div>
        </section>
      </div>

      <footer class="roadmap-study-footer">
        <button class="roadmap-study-secondary" type="button" onclick="closeLlmStudyTask()">
          暂停，返回列表
        </button>
        <button class="roadmap-study-complete" type="button"
                onclick="completeAndOpenNextLlmTask('${task.id}')">
          ${progress.completed?.[task.id] ? '进入下一课 →' : '完成自检，进入下一课 →'}
        </button>
      </footer>
    </article>
  `;

  document.body.appendChild(overlay);
  document.getElementById('roadmapNote')?.focus();
}

function saveLlmRoadmapNote(taskId, value) {
  const progress = loadLlmRoadmapProgress();
  progress.notes = progress.notes || {};
  progress.notes[taskId] = value;
  saveLlmRoadmapProgress(progress);
  const count = document.getElementById('roadmapNoteCount');
  if (count) count.textContent = `${value.length} 字`;
}

function closeLlmStudyTask() {
  document.getElementById('roadmapStudyOverlay')?.remove();
  renderLlmRoadmap();
}

function completeAndOpenNextLlmTask(taskId) {
  const progress = loadLlmRoadmapProgress();
  progress.completed = progress.completed || {};
  progress.completed[taskId] = true;
  saveLlmRoadmapProgress(progress);
  updateLlmRoadmapHomeSummary();

  const stats = getLlmRoadmapStats(progress);
  llmRoadmapView.phase = stats.currentPhase.id;
  renderLlmRoadmap();

  if (stats.nextTask) openLlmStudyTask(stats.nextTask.id);
  else closeLlmStudyTask();
}
