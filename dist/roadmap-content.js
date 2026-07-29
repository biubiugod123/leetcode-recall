/*
 * Curated Chinese lesson notes for the LLM Systems roadmap.
 *
 * The notes are intentionally concise: they explain the lesson in-place, then
 * point to the official course, documentation, or original paper for depth.
 * `roadmap.js` renders this data as a reading-first lesson instead of asking
 * learners to create the lesson by writing a summary themselves.
 */
const LLM_LESSON_CONTENT = {
  'foundation-cs336': {
    duration: '12 分钟',
    summary: 'CS336 的主线不是“调用一个模型”，而是亲手走完 tokenizer、Transformer、训练循环、系统优化、数据与对齐。当前阶段先聚焦 Basics：建立一个小而完整的语言模型闭环，再用 profiling 判断时间和显存花在哪里。',
    concepts: [
      ['课程地图', 'Basics 负责模型与训练闭环；Systems 解释 kernel、并行与性能；后续作业再进入 scaling、data 和 alignment。'],
      ['学习顺序', '先让单卡小模型正确运行，再优化吞吐。没有正确性基线，性能数字没有意义。'],
      ['工程证据', '每个作业都留下测试、配置、日志与 benchmark，最终形成可复现项目，而不只是 notebook。']
    ],
    steps: [
      '浏览课程首页与作业结构，只记录本阶段相关的 Basics 和 Systems 小节。',
      '创建 Python 环境，确认 PyTorch 能识别 GPU，并保存版本与硬件信息。',
      '建立 src、tests、configs、benchmarks 四个目录，先提交一个能运行的最小训练脚本。'
    ],
    check: '为什么本路线要求“先正确、后优化”，而不是一开始就使用 fused kernel？',
    answer: '优化会改变执行路径并增加定位难度。先用清晰实现和单元测试建立数值正确的基线，之后才能判断优化是否保持结果一致，并准确计算速度收益。',
    sources: [
      ['Stanford CS336 · 课程主页', 'https://cs336.stanford.edu/', '课程与作业总览'],
      ['CS336 · Lecture 1', 'https://cs336.stanford.edu/lectures/?trace=lecture_01', '从零构建语言模型的课程地图']
    ]
  },
  'foundation-tokenizer': {
    duration: '10 分钟',
    summary: 'BPE tokenizer 在“词表大小”和“序列长度”之间做工程折中。训练从字节级基础词表开始，反复合并语料中最高频的相邻 token 对；编码时必须严格复用同一份 merge 顺序，否则训练和推理看到的 token ID 会不一致。',
    concepts: [
      ['字节级起点', '以 UTF-8 bytes 作为基础单位，可以覆盖任意文本并避免真正的 unknown token。'],
      ['Merge 规则', '每轮统计相邻 pair，选择最高频 pair 合并；词表与有序 merge 列表共同定义 tokenizer。'],
      ['可逆性', 'decode(encode(text)) 应恢复原文本；特殊 token 需要在普通 merge 逻辑之外明确处理。']
    ],
    steps: [
      '在小语料上统计 byte pair 频次，并实现稳定的并列规则。',
      '训练若干轮 merge，保存 vocab 与 merge ranks，再实现 encode/decode。',
      '测试空字符串、中文、emoji、重复空格、特殊 token 和随机文本 round-trip。'
    ],
    check: '为什么只保存最终词表、不保存 merge 顺序，通常不足以复现 BPE 编码？',
    answer: '同一组词表项可能由不同合并路径得到。编码需要按照训练时的 merge 优先级逐步合并，因此还必须保存有序规则或 rank。',
    sources: [
      ['Hugging Face LLM Course · Tokenizers', 'https://huggingface.co/learn/llm-course/en/chapter6/5', 'BPE 训练与编码过程'],
      ['Tokenizers 文档', 'https://huggingface.co/docs/tokenizers/', '实现与 API 参考']
    ]
  },
  'foundation-transformer': {
    duration: '15 分钟',
    summary: 'Decoder-only Transformer 接收形状为 B×T 的 token IDs，映射到 B×T×C 的隐藏状态。每个 block 用因果自注意力混合历史 token，再用逐位置 MLP 变换特征；residual 保留信息通路，最终 LM head 为每个位置预测下一个 token。',
    concepts: [
      ['因果注意力', 'QKᵀ/√d 得到 T×T 分数，mask 掉未来位置，softmax 后加权 V。'],
      ['Pre-Norm', '现代 LLM 通常先 RMSNorm，再进入 attention 或 MLP，有助于深层训练稳定。'],
      ['残差数据流', 'x ← x + Attention(Norm(x))，再 x ← x + MLP(Norm(x))；shape 始终保持 B×T×C。']
    ],
    steps: [
      '先实现单头 attention，并用小张量检查 mask 与每行概率和。',
      '扩展为多头、RMSNorm、SwiGLU/MLP 和 residual，逐层打印 shape。',
      '连接 token embedding、RoPE、blocks、final norm 与 LM head，并测试前向和反向。'
    ],
    check: '因果 mask 应该在 softmax 之前还是之后应用？为什么？',
    answer: '应在 softmax 前把未来位置的 logits 设为负无穷，使其概率严格为 0；softmax 后再清零会破坏概率归一化。',
    sources: [
      ['PyTorch · Scaled Dot Product Attention', 'https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html', '注意力定义与 mask'],
      ['PyTorch · Building Models', 'https://docs.pytorch.org/tutorials/beginner/introyt/modelsyt_tutorial.html', 'Module 与 Parameter 基础']
    ]
  },
  'paper-attention': {
    duration: '14 分钟',
    summary: '《Attention Is All You Need》用 self-attention 取代循环结构，使序列各位置可以并行计算，并让任意两个 token 之间只经过一层交互。代价是注意力矩阵随序列长度呈 O(T²) 增长，这也成为长上下文和推理系统的核心瓶颈。',
    concepts: [
      ['Q / K / V', 'Query 表示当前位置想找什么，Key 表示各位置可被怎样匹配，Value 是匹配后聚合的信息。'],
      ['多头机制', '不同 head 在不同子空间建立关系，拼接后再通过输出投影混合。'],
      ['缩放项', '除以 √dₖ 避免维度增大导致 dot product 过大、softmax 进入饱和区。']
    ],
    steps: [
      '阅读摘要、图 1 和 3.2 节，先画出 encoder/decoder 与 attention 数据流。',
      '为 B、H、T、D 写出 Q、K、V、score、output 的完整 shape。',
      '比较 RNN 的顺序路径与 attention 的并行性，同时写下 O(T²) 的代价。'
    ],
    check: 'self-attention 为什么更容易并行，却不一定在长序列上更便宜？',
    answer: '所有位置的 Q/K/V 可以同时计算，所以训练并行性好；但每个 query 都要与所有 key 交互，注意力矩阵的计算和内存随 T² 增长。',
    sources: [
      ['论文 · Attention Is All You Need', 'https://arxiv.org/abs/1706.03762', '原论文']
    ]
  },
  'paper-rope': {
    duration: '10 分钟',
    summary: 'RoPE 把隐藏维度两两配对，并按 token 位置施加不同角度的二维旋转。旋转后的 query 与 key 做内积时，相位差只与两个位置的相对距离有关，因此无需把绝对位置向量直接加到 token embedding 上。',
    concepts: [
      ['二维旋转', '每对通道使用 cos(mθ)、sin(mθ) 旋转；不同通道使用不同频率。'],
      ['相对位置', 'R(m)ᵀR(n)=R(n−m)，因此 attention score 自然携带相对位置信息。'],
      ['上下文外推', '超出训练长度时角度分布发生变化，常需频率缩放等策略，不能假设无限外推。']
    ],
    steps: [
      '为一个 4 维向量手算 position 0 与 position 1 的旋转结果。',
      '实现 apply_rope(q, k, cos, sin)，测试 shape、dtype 与 device。',
      '用同一内容、不同相对距离验证内积随相对位置变化。'
    ],
    check: 'RoPE 为什么通常作用在 Q 和 K，而不是直接旋转 V？',
    answer: '位置关系需要影响“匹配权重”，因此进入 QK 内积最直接；V 承载被聚合的内容，旋转 V 会把位置信号混入输出内容且不是构造相对 score 所必需。',
    sources: [
      ['论文 · RoFormer', 'https://arxiv.org/abs/2104.09864', 'RoPE 定义与性质']
    ]
  },
  'paper-llama': {
    duration: '11 分钟',
    summary: 'LLaMA 展示了现代 decoder-only 模型的实用配方：pre-norm RMSNorm、RoPE、SwiGLU、因果自注意力，以及在更多高质量 token 上训练相对较小模型。对工程实现而言，重点是辨认这些组件如何替换原始 Transformer 的 LayerNorm、位置编码和 ReLU MLP。',
    concepts: [
      ['RMSNorm', '只按均方根缩放，不减均值，计算更简单并用于 pre-normalization。'],
      ['SwiGLU', '两条线性分支经过门控相乘，通常比普通 ReLU/GELU MLP 表达能力更好。'],
      ['训练预算', '参数量不是唯一尺度；训练 token、数据配比与计算预算共同决定最终能力。']
    ],
    steps: [
      '列出 LLaMA 与原始 Transformer 的三个组件差异。',
      '在自己的 block 中替换 RMSNorm、RoPE 与 SwiGLU，并保持 shape 测试。',
      '计算模型参数量，区分 embedding、attention、MLP 与 output head 的占比。'
    ],
    check: '为什么模型参数更少，并不自动意味着训练成本更低？',
    answer: '训练 FLOPs 还与 token 数、序列长度、批量和训练步数相关。较小模型若训练更多 token，总计算量仍可能很高。',
    sources: [
      ['论文 · LLaMA', 'https://arxiv.org/abs/2302.13971', '架构与训练设置']
    ]
  },
  'foundation-train': {
    duration: '13 分钟',
    summary: '语言模型训练把长度 T+1 的 token 序列切成输入 x[:T] 与标签 x[1:T+1]，最小化每个位置的 next-token cross entropy。可靠训练循环还要控制随机种子、梯度累积、学习率、checkpoint 和恢复后的数据顺序。',
    concepts: [
      ['Teacher Forcing', '训练时每个位置看到真实历史 token，并预测紧邻的下一个 token。'],
      ['有效 batch', 'micro_batch × gradient_accumulation × world_size；改变它会改变优化动态。'],
      ['可恢复状态', '模型、optimizer、scheduler、step、scaler 与随机数状态都应进入 checkpoint。']
    ],
    steps: [
      '先在极小数据上过拟合一个 batch，确认 loss 能明显下降。',
      '加入 gradient clipping、学习率调度、日志与定期验证。',
      '中途保存并重启，确认恢复后的 step、loss 和数据位置合理连续。'
    ],
    check: '为什么“能在一个 batch 上过拟合”是训练前很有价值的检查？',
    answer: '它快速验证标签位移、前向、反向、optimizer 与 loss 链路是否基本正确；若连小 batch 都学不会，扩大数据通常只会掩盖错误。',
    sources: [
      ['CS336 · Language Modeling from Scratch', 'https://cs336.stanford.edu/', '训练作业主线'],
      ['PyTorch · Saving and Loading Models', 'https://docs.pytorch.org/tutorials/beginner/saving_loading_models.html', 'checkpoint 基础']
    ]
  },
  'foundation-inference': {
    duration: '12 分钟',
    summary: '生成分为 prefill 与 decode：prefill 并行处理整段 prompt，decode 每次只产生一个新 token。KV Cache 保存每层历史 token 的 key/value，使 decode 不必重复计算历史；采样策略则从 logits 决定确定性、随机性与长尾候选。',
    concepts: [
      ['KV Cache', '缓存按 layer、batch、head、sequence、head_dim 增长，省计算但消耗显存。'],
      ['Temperature', 'logits 除以 temperature；低温更尖锐，高温更随机，0 通常等价 greedy。'],
      ['Top-k / Top-p', 'top-k 固定保留 k 个候选；top-p 保留累计概率达到阈值的动态集合。']
    ],
    steps: [
      '先实现 greedy decode，并确认每一步只拼接一个 token。',
      '让 attention 接收 past_key_values，比较有无 cache 的输出一致性。',
      '加入 temperature、top-k、top-p，在固定随机种子下记录速度与生成差异。'
    ],
    check: 'KV Cache 为什么主要优化 decode，而不会消除长 prompt 的 prefill 成本？',
    answer: '首次处理 prompt 时仍需为全部 token 计算 Q/K/V 与 attention，缓存尚不存在；之后 decode 才能复用已经算出的历史 K/V。',
    sources: [
      ['Transformers · Cache explanation', 'https://huggingface.co/docs/transformers/cache_explanation', 'KV Cache 原理'],
      ['Transformers · Generation', 'https://huggingface.co/docs/transformers/main_classes/text_generation', '生成参数']
    ]
  },
  'foundation-proof': {
    duration: '8 分钟',
    summary: '“做过 Mini GPT”和“能证明实现可靠”是两件事。工程证据应覆盖 tokenizer 可逆性、causal mask、shape、checkpoint 恢复、固定 seed 的生成，以及相同硬件下的 tokens/s 和峰值显存。',
    concepts: [
      ['正确性测试', '单元测试验证局部不变量；小规模 overfit 与端到端生成验证完整链路。'],
      ['性能基线', '记录 warm-up、迭代次数、batch、sequence length、dtype 与硬件，否则数字不可比。'],
      ['可读 README', '先给运行命令和结果，再解释架构与取舍，让招聘者能快速复现。']
    ],
    steps: [
      '补齐 tokenizer、mask、shape、loss 和 checkpoint 五类测试。',
      '用固定配置测 eager 与 cache decode 的延迟、吞吐和峰值显存。',
      '把命令、环境、结果表和一个失败案例写入 README。'
    ],
    check: '一个“tokens/s 提升 30%”的结论，至少还需要哪些上下文才可信？',
    answer: '需要模型与提交版本、硬件、dtype、batch、输入/输出长度、warm-up、测量次数，以及对照组使用的相同条件。',
    sources: [
      ['Hugging Face LLM Course', 'https://huggingface.co/learn/llm-course/en/chapter1/1', '模型使用与训练背景'],
      ['PyTorch Profiler', 'https://docs.pytorch.org/tutorials/recipes/recipes/profiler_recipe.html', '性能测量']
    ]
  },

  'post-trl': {
    duration: '13 分钟',
    summary: 'TRL 把 post-training 抽象为 Trainer，但数据语义仍由你负责。SFT 可以接收纯文本、prompt-completion 或 conversational messages；DPO 则需要同一 prompt 下的 chosen/rejected 偏好对。chat template、loss mask 和序列截断一旦错位，训练仍会运行，却学到错误目标。',
    concepts: [
      ['SFT 数据', '模型学习目标答案的 token 分布；conversational 数据通常由 tokenizer 自动应用 chat template。'],
      ['DPO 数据', '直接提高 chosen 相对 rejected 的偏好，同时由 reference model 约束偏离程度。'],
      ['PEFT 集成', 'Trainer 只更新 adapter，可显著降低可训练参数和 checkpoint 体积。']
    ],
    steps: [
      '把同一条样本打印为原始 messages、模板化文本和 token IDs。',
      '用 8–16 条数据跑通 SFTTrainer，检查实际参与 loss 的 token。',
      '构造小型 preference dataset，再跑通 DPOTrainer 并记录 chosen/rejected reward。'
    ],
    check: '为什么只看 training loss，无法证明 chat template 使用正确？',
    answer: '即使角色 token、终止符或 mask 错位，模型仍能拟合错误序列并降低 loss；必须直接检查模板化文本、token IDs 和 loss mask。',
    sources: [
      ['TRL · SFTTrainer', 'https://huggingface.co/docs/trl/en/sft_trainer', '数据格式与训练配置'],
      ['TRL · DPOTrainer', 'https://huggingface.co/docs/trl/en/dpo_trainer', '偏好训练']
    ]
  },
  'post-data': {
    duration: '12 分钟',
    summary: '训练数据管线负责把业务样本变成稳定、可追踪的 token 序列。核心不是“转成 JSON”，而是定义角色模板、终止边界、截断规则、只对 response 计 loss、去重与数据划分，并让每次运行都能得到相同结果。',
    concepts: [
      ['Chat Template', 'system/user/assistant 角色和特殊 token 必须与目标模型预训练/指令格式一致。'],
      ['Response-only Loss', 'mask 掉 prompt token，使 SFT 梯度集中在 assistant 回答；需验证边界没有偏一位。'],
      ['Sequence Packing', '把多个短样本拼入固定长度序列提高利用率，同时防止跨样本 attention 或标签泄漏。']
    ],
    steps: [
      '定义规范 schema，并为缺失字段、超长样本与非法角色写校验。',
      '固定 seed 完成 train/validation/test 划分，保存数据版本与统计。',
      '随机抽样可视化 token、mask、长度和特殊 token，最后再开启 packing。'
    ],
    check: '为什么数据划分应在数据增强或 packing 之前完成？',
    answer: '先增强或拼接可能让同一原始样本的变体进入不同集合，造成泄漏；应先按稳定 ID 划分，再在各集合内部处理。',
    sources: [
      ['Transformers · Chat templates', 'https://huggingface.co/docs/transformers/chat_templating', '角色模板'],
      ['TRL · Dataset formats', 'https://huggingface.co/docs/trl/en/dataset_formats', 'SFT 与偏好数据格式']
    ]
  },
  'post-qlora': {
    duration: '12 分钟',
    summary: 'QLoRA 将冻结的 base model 权重量化为 4-bit，并在其线性层上训练 LoRA adapter。计算通常仍在 bf16/fp16 中进行；4-bit 主要减少权重存储。NF4 针对近似正态分布权重，double quantization 继续压缩量化常数。',
    concepts: [
      ['冻结量化权重', 'base weight 不直接更新，梯度只流向低秩 adapter。'],
      ['NF4', '为正态分布权重设计的 4-bit 数据类型，目标是更有效利用有限量化级别。'],
      ['Paged Optimizer', '在显存峰值时借助统一内存分页，降低长序列或大 batch 的 OOM 风险。']
    ],
    steps: [
      '用 BitsAndBytesConfig 以 4-bit 加载 1B–3B 模型，并调用 prepare_model_for_kbit_training。',
      '为主要线性层配置 LoRA，打印 trainable/total parameter 比例。',
      '训练小数据，记录峰值显存、step time、validation loss，并测试 adapter 单独保存和加载。'
    ],
    check: 'QLoRA 中“4-bit 训练”为什么不代表所有运算都以 4-bit 执行？',
    answer: 'base 权重以 4-bit 存储，使用时会反量化到计算 dtype；激活、adapter 与多数矩阵计算仍使用 bf16/fp16 等更高精度。',
    sources: [
      ['PEFT · Quantization', 'https://huggingface.co/docs/peft/en/developer_guides/quantization', 'QLoRA 实践'],
      ['Transformers · bitsandbytes', 'https://huggingface.co/docs/transformers/quantization/bitsandbytes', '4-bit 加载配置']
    ]
  },
  'post-compare': {
    duration: '10 分钟',
    summary: 'Base、SFT 与 SFT+DPO 的比较必须控制模型、prompt、解码参数和评测集。SFT 通常提高格式与任务跟随；DPO 进一步改变偏好，但也可能增加长度、牺牲多样性或损伤其他能力，因此不能只展示几个“看起来更好”的例子。',
    concepts: [
      ['可控对照', '同一 base、同一测试输入、同一 generation config，差异才可归因于训练阶段。'],
      ['多维指标', '同时观察 task success、格式、长度、拒答、延迟和定性失败案例。'],
      ['回归', '对齐一个维度可能损伤另一个维度；保留 base 能力测试作为回归集。']
    ],
    steps: [
      '冻结 30–100 条未参与训练的评测集，并定义可程序化评分。',
      '对三个 checkpoint 批量生成，保存原始输出与 generation config。',
      '生成统一结果表，人工复核分歧样本并归类失败模式。'
    ],
    check: '如果 DPO 模型的 judge 分数更高但回答明显更长，应如何判断是否真正提升？',
    answer: '需要控制或报告长度，加入任务成功、事实性和人工偏好检查；LLM judge 可能存在 verbosity bias，不能把单一分数当结论。',
    sources: [
      ['TRL · Evaluation', 'https://huggingface.co/docs/trl/en/index', '训练工具与评测入口'],
      ['论文 · Judging LLM-as-a-Judge', 'https://arxiv.org/abs/2306.05685', '自动评审偏差']
    ]
  },
  'post-distributed': {
    duration: '14 分钟',
    summary: 'DDP 在每个 rank 保存完整参数、梯度和 optimizer state，只把数据切分并 all-reduce 梯度；FSDP2 用 DTensor 在 rank 之间切分参数，并在计算前 all-gather、计算后重新切分，从而以通信换显存。',
    concepts: [
      ['DDP', '模型副本完整，易用且吞吐稳定，但单卡仍要容纳全部模型状态。'],
      ['FSDP2', '参数按维度切分，forward/backward 在需要时临时聚合，可显著降低每卡常驻显存。'],
      ['通信边界', 'wrap/shard 粒度影响 all-gather 大小、重叠机会和峰值显存。']
    ],
    steps: [
      '先用 torchrun 把单卡脚本改为 DDP，确认 DistributedSampler 与 rank 日志。',
      '在相同模型上应用 fully_shard，记录每卡参数、optimizer state 和峰值显存。',
      '用相同 global batch 比较 DDP/FSDP2 的 tokens/s、显存与启动复杂度。'
    ],
    check: '为什么 FSDP2 更省显存，却不保证一定比 DDP 更快？',
    answer: 'FSDP2 需要频繁 all-gather/reduce-scatter，并可能受网络带宽、wrap 粒度和通信重叠影响；省下的显存是以额外通信和调度复杂度换来的。',
    sources: [
      ['PyTorch · FSDP2', 'https://docs.pytorch.org/docs/stable/distributed.fsdp.fully_shard.html', 'fully_shard API'],
      ['PyTorch · DDP Tutorial', 'https://docs.pytorch.org/tutorials/beginner/ddp_series_multigpu.html', '多 GPU DDP']
    ]
  },
  'paper-lora': {
    duration: '10 分钟',
    summary: 'LoRA 假设下游适配所需的权重更新 ΔW 具有较低的内在秩，因此冻结 W，只训练 ΔW=BA，其中 rank r 远小于输入/输出维度。训练参数和 optimizer state 大幅减少，部署时可单独加载 adapter，也可将更新合并回 base weight。',
    concepts: [
      ['低秩更新', 'A 与 B 的参数量约为 r(d_in+d_out)，远小于完整矩阵 d_in×d_out。'],
      ['缩放', '常用 α/r 控制 adapter 更新幅度，使 rank 改变时优化尺度更稳定。'],
      ['部署方式', 'adapter 可热切换；合并后不增加推理路径，但会失去轻量切换的便利。']
    ],
    steps: [
      '为一个线性层写出原参数量与 rank=8 的 LoRA 参数量。',
      '实现冻结 W 的 LoRALinear，并验证 B 初始为零时输出与原层一致。',
      '比较未合并、合并后的输出误差与推理延迟。'
    ],
    check: '为什么 LoRA 常把一个低秩矩阵初始化为零？',
    answer: '这样初始 ΔW=0，插入 adapter 后模型一开始与原模型行为一致，再由训练逐步学习更新，避免随机扰动破坏初始能力。',
    sources: [
      ['论文 · LoRA', 'https://arxiv.org/abs/2106.09685', '原论文'],
      ['PEFT · LoRA guide', 'https://huggingface.co/docs/peft/main/conceptual_guides/lora', '实现概念']
    ]
  },
  'paper-qlora': {
    duration: '11 分钟',
    summary: 'QLoRA 的贡献不只是“LoRA + int4”，而是 NF4、double quantization 与 paged optimizer 的组合，使冻结的大模型权重更紧凑，同时保持 adapter 训练质量。理解论文时应区分权重量化误差、计算精度和训练时显存峰值三类问题。',
    concepts: [
      ['NF4', '对正态权重分布信息论上更合适的 4-bit 表示。'],
      ['Double Quantization', '连量化 scale/constant 本身也量化，进一步减少平均每参数存储。'],
      ['内存峰值', 'paged optimizer 处理偶发峰值，不等价于让所有 optimizer state 永久驻留 CPU。']
    ],
    steps: [
      '阅读方法部分并画出 quantized base、dequantize compute、LoRA gradient 的数据流。',
      '估算 3B 参数以 fp16 与 4-bit 存储的理论权重大小。',
      '用相同数据比较 8-bit/4-bit 配置的显存与 validation loss。'
    ],
    check: 'double quantization 主要压缩什么，而不是再次量化模型激活？',
    answer: '它主要量化第一次权重量化所使用的 quantization constants/scales，减少这些元数据的存储开销。',
    sources: [
      ['论文 · QLoRA', 'https://arxiv.org/abs/2305.14314', '原论文']
    ]
  },
  'paper-zero': {
    duration: '12 分钟',
    summary: 'ZeRO 消除数据并行中的模型状态冗余：Stage 1 切 optimizer state，Stage 2 再切 gradient，Stage 3 连 parameter 也切分。stage 越高，每卡显存越低，但参数聚合与通信路径更复杂。',
    concepts: [
      ['Stage 1', '参数和梯度仍复制，只切分 optimizer states。'],
      ['Stage 2', '再切分梯度，减少 backward 后的常驻内存。'],
      ['Stage 3', '参数也只保存分片，计算前按需聚合，与 FSDP 的核心思想相近。']
    ],
    steps: [
      '画出 4 个 rank 下每个 stage 的 parameter/gradient/optimizer 分布。',
      '以 Adam 的参数、梯度、一阶/二阶状态估算每卡内存。',
      '写下选择 stage 时对显存、通信和部署复杂度的取舍。'
    ],
    check: 'ZeRO-3 相比 ZeRO-2 新增的主要通信来源是什么？',
    answer: '参数本身被切分，forward/backward 计算具体层之前需要按需 all-gather 参数，计算后可再次释放或切分。',
    sources: [
      ['论文 · ZeRO', 'https://arxiv.org/abs/1910.02054', '原论文']
    ]
  },
  'paper-flash-attention': {
    duration: '13 分钟',
    summary: 'FlashAttention 是精确 attention，不是近似稀疏化。它通过 tiling 把 Q/K/V 分块装入更快的片上 SRAM，用 online softmax 分块计算，避免把完整 T×T attention matrix 反复写入和读出 HBM，从而减少 IO。',
    concepts: [
      ['IO-aware', '现代 GPU attention 常受 HBM 访问限制，而不只受 FLOPs 限制。'],
      ['Tiling', '按块计算 score 与输出，让中间矩阵尽量留在 SRAM。'],
      ['Online Softmax', '维护每行运行中的 max 与归一化和，使分块结果与完整 softmax 数值等价。']
    ],
    steps: [
      '区分标准 attention 的数学步骤与实际 HBM 读写。',
      '手算两个 block 的 online softmax 合并过程。',
      '用 PyTorch SDPA 比较不同序列长度的时间与峰值显存。'
    ],
    check: 'FlashAttention 为什么能更快，即使理论 FLOPs 没有显著减少？',
    answer: '它减少了昂贵的 HBM 中间结果读写，让更多计算在高带宽 SRAM 内完成；在 memory-bound 场景，降低 IO 比减少少量 FLOPs 更关键。',
    sources: [
      ['论文 · FlashAttention', 'https://arxiv.org/abs/2205.14135', 'IO-aware attention'],
      ['PyTorch · SDPA', 'https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.scaled_dot_product_attention.html', '优化实现入口']
    ]
  },

  'inference-vllm': {
    duration: '13 分钟',
    summary: 'LLM 在线推理需要分别看 prefill 与 decode。TTFT 衡量请求到首 token，TPOT/ITL 衡量后续 token 间隔；吞吐可以是 output tokens/s 或 requests/s。调大 batch 往往提高总吞吐，却可能恶化单请求延迟，因此必须先定义服务目标。',
    concepts: [
      ['TTFT', '受排队、tokenization、prefill 和调度影响，对长 prompt 尤其敏感。'],
      ['TPOT / ITL', '首 token 后的平均/分位 token 间隔，主要反映 decode 与调度体验。'],
      ['Continuous Batching', '每个调度步动态加入/移出请求，比静态 batch 更充分利用 GPU。']
    ],
    steps: [
      '跑通离线 LLM.generate 与在线 vllm serve 两条路径。',
      '为同一请求记录 TTFT、端到端延迟、输出 token 数和 TPOT。',
      '改变并发与 max_num_batched_tokens，观察吞吐/延迟曲线。'
    ],
    check: '为什么只报告“tokens/s”不足以评价聊天服务体验？',
    answer: '总吞吐可能来自大 batch，但用户仍可能等待很久才看到首 token，或遇到高尾延迟；还需 TTFT、TPOT 和 P95/P99。',
    sources: [
      ['vLLM · Quickstart', 'https://docs.vllm.ai/en/stable/getting_started/quickstart.html', '运行入口'],
      ['vLLM · Metrics', 'https://docs.vllm.ai/en/stable/design/metrics/', '服务指标']
    ]
  },
  'inference-baseline': {
    duration: '9 分钟',
    summary: '基线的价值是让后续 vLLM、量化和缓存优化可比较。应固定模型 revision、dtype、device、prompt token 长度、输出长度与解码策略，并区分冷启动、warm-up 后稳定延迟和峰值显存。',
    concepts: [
      ['输入控制', '用 token 长度而不是字符数描述 prompt，避免 tokenizer 差异。'],
      ['Warm-up', '首次运行包含模型加载、kernel 选择或编译，不应直接代表稳态性能。'],
      ['同步计时', 'CUDA 异步执行，计时前后要 synchronize 或使用 CUDA Event。']
    ],
    steps: [
      '用 Transformers generate() 编写单请求 benchmark harness。',
      '固定 input/output tokens，warm-up 后重复至少 10 次。',
      '输出 median/P95 延迟、tokens/s、峰值显存和完整环境信息。'
    ],
    check: '直接用 Python time.time() 包住一次 CUDA generate，可能得到什么误差？',
    answer: 'CUDA kernel 异步提交，CPU 计时可能在 GPU 完成前结束；首次运行还混入初始化。需要同步、warm-up 与多次统计。',
    sources: [
      ['Transformers · Text generation', 'https://huggingface.co/docs/transformers/llm_tutorial', 'generate 基线'],
      ['PyTorch · Benchmark recipe', 'https://docs.pytorch.org/tutorials/recipes/recipes/benchmark.html', '可靠计时']
    ]
  },
  'inference-serving': {
    duration: '10 分钟',
    summary: 'vLLM 的 OpenAI-compatible server 把模型服务暴露为标准 Chat/Completions 接口，使现有 OpenAI SDK 可以通过 base_url 连接。工程上要验证 chat template、streaming 终止、错误码、并发取消与健康检查，而不只是 curl 成功。',
    concepts: [
      ['协议兼容', '客户端 schema 相似不代表所有参数和默认值完全一致，应核对支持列表。'],
      ['Streaming', '服务持续发送增量 token；客户端断开时应尽快取消后端请求以释放资源。'],
      ['模型配置', 'served model name、chat template、max context 与 generation defaults 都会改变行为。']
    ],
    steps: [
      '用 vllm serve 启动固定 revision 的模型并设置明确的 served-model-name。',
      '分别用 curl 与 OpenAI SDK 测试非流式和流式 Chat Completions。',
      '加入并发请求、客户端取消、超长 prompt 和非法参数测试。'
    ],
    check: '为什么服务启动成功，却仍可能对 chat 请求产生异常输出？',
    answer: '模型可能缺少或使用了错误的 chat template，角色/终止 token 不匹配；服务可正常返回 HTTP，但模型输入格式已错。',
    sources: [
      ['vLLM · OpenAI-Compatible Server', 'https://docs.vllm.ai/en/stable/serving/openai_compatible_server/', '服务配置']
    ]
  },
  'inference-concurrency': {
    duration: '11 分钟',
    summary: '并发压测的目标是找到系统在目标 SLO 下的最大 goodput，而不是把 GPU 打满。随着并发增加，吞吐先上升后趋于饱和，排队和 KV Cache 压力会推高 TTFT 与尾延迟；平均值会掩盖最差用户体验。',
    concepts: [
      ['Load model', 'closed-loop 固定并发，open-loop 固定到达率；两者回答的问题不同。'],
      ['尾延迟', 'P95/P99 暴露排队、长请求与调度干扰，通常比平均延迟更接近线上风险。'],
      ['Goodput', '满足 TTFT/TPOT SLO 的请求吞吐，比不受约束的总 tokens/s 更有意义。']
    ],
    steps: [
      '准备固定分布的输入/输出长度，避免每个并发档位样本不同。',
      '依次运行并发 1/4/8/16，每档 warm-up 后采集足够请求。',
      '绘制并发—吞吐、并发—P95 TTFT、并发—P95 TPOT 三条曲线。'
    ],
    check: '吞吐仍在上升，但 P95 TTFT 已超过产品要求时，应该把容量点放在哪里？',
    answer: '容量应按 SLO 约束下的 goodput 定义，选择 P95 仍满足要求的最高负载，而不是 GPU 极限吞吐。',
    sources: [
      ['vLLM · Bench Serve', 'https://docs.vllm.ai/en/stable/cli/bench/serve/', '在线压测参数'],
      ['vLLM · Optimization', 'https://docs.vllm.ai/en/stable/configuration/optimization/', '批处理权衡']
    ]
  },
  'inference-quantization': {
    duration: '11 分钟',
    summary: '推理量化减少权重或 KV Cache 的存储与带宽，但速度收益取决于硬件和 kernel。AWQ/GPTQ 是权重量化方案，bitsandbytes 更偏易用加载；更低 bit 可能扩大可容纳 batch，却也可能引入反量化开销和质量回归。',
    concepts: [
      ['Weight-only', '权重低比特、激活较高精度；收益常来自更低显存与内存带宽。'],
      ['Kernel 支持', '格式只有被当前 GPU 的高效 kernel 支持，才可能真正降低延迟。'],
      ['质量检查', 'perplexity 或任务准确率之外，还要检查目标业务中的格式、代码与长文本退化。']
    ],
    steps: [
      '选择同一模型的原精度与一种量化 checkpoint，核对 tokenizer/revision。',
      '在相同输入分布下比较显存、TTFT、TPOT 和吞吐。',
      '在固定小评测集上比较任务成功率，并保存最明显的回归案例。'
    ],
    check: '为什么模型从 16-bit 变为 4-bit，不代表推理必然加速 4 倍？',
    answer: '还有激活、KV Cache、调度和非矩阵开销；量化格式需反量化且 kernel 效率受硬件限制。权重大小缩减比端到端速度收益更直接。',
    sources: [
      ['vLLM · Quantization', 'https://docs.vllm.ai/en/stable/features/quantization/', '支持矩阵'],
      ['Transformers · LLM optimization', 'https://huggingface.co/docs/transformers/llm_optims', '量化权衡']
    ]
  },
  'inference-cache': {
    duration: '10 分钟',
    summary: 'Prefix caching 复用完全相同的 prompt 前缀对应的 KV blocks，适合共享长 system prompt、文档前缀或多轮模板。它主要减少重复 prefill；上下文越长，未命中时 TTFT 和 KV Cache 占用越高，因此要同时测命中率与内存压力。',
    concepts: [
      ['精确前缀', '缓存通常基于 token block hash；文本看似相同但模板、空格或 token 不同就可能 miss。'],
      ['命中收益', '省去已缓存前缀的 prefill 计算，但新后缀与 decode 仍需执行。'],
      ['容量竞争', '更长 context 占用更多 KV blocks，可能降低可并发请求数。']
    ],
    steps: [
      '构造共享 2k/8k token 前缀与不同后缀，分别关闭/开启 prefix caching。',
      '测首次冷请求与后续热请求的 TTFT、cache hit 和 GPU cache usage。',
      '改变 context length，记录命中收益与最大稳定并发。'
    ],
    check: '为什么 prefix cache 命中率高，端到端延迟仍可能没有明显下降？',
    answer: '请求可能主要耗在排队、网络或长 decode；缓存只优化重复 prefill。短前缀的可节省计算也可能太小。',
    sources: [
      ['vLLM · Automatic Prefix Caching', 'https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/', '前缀缓存'],
      ['vLLM · Metrics', 'https://docs.vllm.ai/en/stable/design/metrics/', '缓存指标']
    ]
  },
  'inference-report': {
    duration: '9 分钟',
    summary: '可复现 benchmark 报告应让读者判断“结果是否适用于自己的负载”。除了漂亮图表，还要明确硬件、软件版本、模型 revision、输入/输出分布、并发模型、warm-up、命令与原始数据，并把观察和因果解释分开。',
    concepts: [
      ['Workload contract', '模型、token 长度、到达率、并发与采样策略共同定义测试负载。'],
      ['Observation vs inference', '“P95 上升”是观测；“因为 KV Cache 碎片”是待证解释，需要指标支持。'],
      ['可重跑', '公开脚本、配置和原始 CSV，比只给截图更有工程价值。']
    ],
    steps: [
      '写环境与方法表，给出一条可直接复制的运行命令。',
      '至少绘制 throughput-latency 与 memory-concurrency 两组关系。',
      '列出三个结论、两个限制和一个下一步实验，并附原始数据。'
    ],
    check: '为什么 benchmark 报告需要公布输入/输出 token 长度分布？',
    answer: 'prefill 与 decode 的资源特征不同，长度直接影响 TTFT、TPOT、KV Cache 和吞吐；缺少分布，结果无法迁移到其他业务。',
    sources: [
      ['vLLM · Performance Dashboard', 'https://docs.vllm.ai/en/stable/benchmarking/dashboard/', '持续性能对比'],
      ['vLLM · Benchmarks', 'https://docs.vllm.ai/en/stable/cli/bench/serve/', '复现实验']
    ]
  },
  'paper-paged-attention': {
    duration: '13 分钟',
    summary: 'vLLM 发现 KV Cache 会随请求动态增长，连续内存分配产生内部/外部碎片并限制 batch。PagedAttention 借鉴操作系统分页，把每个序列的 KV 存在非连续固定大小 blocks 中，由 block table 建立逻辑到物理映射，并支持 copy-on-write 共享。',
    concepts: [
      ['分页 KV', '逻辑连续的 token 不要求物理连续，减少预留和碎片浪费。'],
      ['Block table', 'attention kernel 通过映射找到每个逻辑 block 的实际 KV 地址。'],
      ['共享与 COW', 'parallel sampling 等场景可共享 prompt blocks，写入新 token 时再复制。']
    ],
    steps: [
      '画出两个不同长度请求在连续分配与 paged 分配下的显存布局。',
      '解释 block size 过大与过小分别带来的碎片和管理开销。',
      '把 PagedAttention、continuous batching 与更大 batch 的因果链写清楚。'
    ],
    check: 'PagedAttention 为什么能提高吞吐，而它本身并没有减少模型参数？',
    answer: '它提高 KV Cache 内存利用率，使同一 GPU 能同时容纳更多请求并形成更大动态 batch，从而提升 GPU 利用率和总吞吐。',
    sources: [
      ['论文 · PagedAttention / vLLM', 'https://arxiv.org/abs/2309.06180', '原论文']
    ]
  },

  'production-course': {
    duration: '14 分钟',
    summary: 'Full Stack LLM Bootcamp 把 LLM 应用放回产品系统：模型只是一个带概率和成本的组件，还需要 retrieval/tools、评测、监控、版本管理和用户体验。本路线选学 Foundations、Augmented LMs、LLMOps、Launch 与 UX，重点提炼可迁移的设计原则。',
    concepts: [
      ['增强方式', 'retrieval 补充知识，tools 执行动作，chains/工作流组织多步计算。'],
      ['LLMOps', 'prompt、模型、数据和评测都需要版本化，线上 trace 应能回放。'],
      ['LUI UX', '用户需要看到系统状态、可编辑输入、来源与失败恢复，而不只是聊天框。']
    ],
    steps: [
      '先看课程目录，为五个指定讲座各写一个“系统决策”问题。',
      '每个讲座只记录 3 个可用于你项目的原则与 1 个过时细节。',
      '把原则转成当前生产项目的架构或 UX 修改项。'
    ],
    check: '为什么课程中的具体工具名可能过时，但系统设计原则仍值得学习？',
    answer: '框架迭代很快，但知识增强、可观测性、版本化、评测和用户控制等问题持续存在；应提炼问题与取舍，而不是记 API。',
    sources: [
      ['Full Stack LLM Bootcamp', 'https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/', '完整课程目录'],
      ['Augmented Language Models', 'https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/augmented-language-models/', 'retrieval、chains 与 tools']
    ]
  },
  'production-api': {
    duration: '12 分钟',
    summary: 'LLM gateway 应把供应商差异隔离在统一 schema 后，并将 token 流以 SSE/StreamingResponse 返回。请求进入后依次经过鉴权、限流、输入校验、路由和 timeout；输出还需结构化验证，避免“HTTP 200 但业务格式已坏”。',
    concepts: [
      ['Async 边界', '网络等待适合 async；CPU/GPU 阻塞工作不应直接占用 event loop。'],
      ['Backpressure', '客户端消费慢或断开时，服务应停止继续生成并释放后端资源。'],
      ['Schema validation', 'Pydantic 约束输入与结构化输出，错误应转换为清晰可观测的状态。']
    ],
    steps: [
      '定义 provider-neutral request/response schema 与错误模型。',
      '实现非流式和 SSE 流式 endpoint，处理客户端取消与 timeout。',
      '加入 API key、并发限制、request ID 和结构化输出校验测试。'
    ],
    check: '为什么 LLM 返回了内容并不等于 gateway 请求成功？',
    answer: '内容可能不满足 JSON/schema、被截断、触发安全策略或来自 fallback；成功应由业务契约定义，而不只看下游 HTTP 状态。',
    sources: [
      ['FastAPI · StreamingResponse', 'https://fastapi.tiangolo.com/advanced/custom-response/', '流式响应'],
      ['FastAPI · Security', 'https://fastapi.tiangolo.com/tutorial/security/', '鉴权入口']
    ]
  },
  'production-state': {
    duration: '12 分钟',
    summary: '状态层应按职责拆分：PostgreSQL 保存可追踪的持久业务记录，Redis 处理短期缓存、限流或轻量队列，异步 worker 执行超过请求生命周期的任务。同步推理不应为了“架构完整”强行进队列，长任务也不应占住 HTTP 连接。',
    concepts: [
      ['持久状态', '用户、任务、prompt/version、结果和审计记录适合关系数据库与事务。'],
      ['短期状态', 'cache、rate-limit counter、distributed lock 需要 TTL 与明确失效策略。'],
      ['任务语义', '队列至少要设计 idempotency、retry、dead-letter 与状态查询。']
    ],
    steps: [
      '画出同步 chat、长文档任务、缓存命中三条数据流。',
      '为 job 定义 queued/running/succeeded/failed/cancelled 状态机与幂等键。',
      '用 Compose 启动 API、worker、PostgreSQL、Redis，并测试重启与重复提交。'
    ],
    check: '为什么 worker retry 前必须考虑幂等性？',
    answer: '超时或崩溃时任务可能已产生部分副作用；无幂等键直接重试会重复扣费、写入或调用外部工具。',
    sources: [
      ['FastAPI · Background Tasks', 'https://fastapi.tiangolo.com/tutorial/background-tasks/', '请求后任务边界'],
      ['Docker Compose', 'https://docs.docker.com/compose/', '多服务本地环境']
    ]
  },
  'production-router': {
    duration: '11 分钟',
    summary: '模型路由器根据任务能力、延迟、成本、数据边界和供应商健康度选择本地或商业模型。fallback 不能只是 catch exception：降级模型的上下文、工具与结构化输出能力可能不同，必须显式记录路由原因和质量影响。',
    concepts: [
      ['Policy', '把任务类型、风险和 SLO 映射到模型候选，不把 if/else 散落在业务代码。'],
      ['Token cost', '记录 input、cached input、output 与工具调用成本，并绑定模型版本。'],
      ['Fallback budget', '限制最大尝试次数与总时间，避免多模型重试放大尾延迟和费用。']
    ],
    steps: [
      '定义至少三类请求：低成本、本地敏感、高能力，并写路由表。',
      '为 provider adapter 统一错误类型、usage 与 capability metadata。',
      '注入 timeout/rate-limit/invalid-output，验证 fallback、成本和 trace。'
    ],
    check: '为什么“主模型失败就换备用模型”仍可能导致错误响应？',
    answer: '备用模型可能不支持相同 tool/schema/context，或 prompt 格式不同；fallback 前需做 capability 检查和适配，并验证输出契约。',
    sources: [
      ['Full Stack LLM Bootcamp · LLMOps', 'https://fullstackdeeplearning.com/llm-bootcamp/spring-2023/llmops/', '模型选择与运营']
    ]
  },
  'production-reliability': {
    duration: '12 分钟',
    summary: '可靠性策略要按失败类型设计：连接失败和 429 可能安全重试，非法输出可能需要 repair 或换模型，工具副作用失败则不能盲目重放。timeout 应有整体 deadline；circuit breaker 在下游持续故障时快速失败，保护本服务。',
    concepts: [
      ['Retry taxonomy', '只重试暂时性且幂等的操作，使用指数退避与 jitter。'],
      ['Deadline', '把总请求时间预算分配给模型、工具和 fallback，避免层层 timeout 相加。'],
      ['Circuit breaker', '失败率超过阈值后 open，冷却后 half-open 探测，成功再恢复 closed。']
    ],
    steps: [
      '列出模型、工具、数据库五类典型错误及可否重试。',
      '实现统一 deadline、有限重试与 jitter，并给工具调用加入 idempotency key。',
      '通过故障注入验证 breaker 状态、fallback 与用户可理解的错误消息。'
    ],
    check: '为什么对所有 5xx 都自动重试三次可能使故障更严重？',
    answer: '非幂等操作会重复副作用；大规模请求同时重试会形成 retry storm，进一步压垮下游并放大延迟。',
    sources: [
      ['Microsoft Azure · Retry pattern', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/retry', '重试设计'],
      ['Microsoft Azure · Circuit Breaker', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker', '熔断状态机']
    ]
  },
  'production-observability': {
    duration: '12 分钟',
    summary: '一次 LLM 请求应形成完整 trace：gateway span 下包含 router、model call、retrieval、tool 与 validation。每个 span 关联 prompt version、model revision、token、cost、latency、错误和 fallback；敏感原文默认不直接进入日志。',
    concepts: [
      ['Trace', '跨服务 context propagation 把模型、工具和数据库调用串成同一因果链。'],
      ['版本', 'prompt、retriever、model 与 scorer 都应有稳定标识，才能定位回归。'],
      ['隐私', '优先记录 hash、长度、类别和经过脱敏的样本；原始内容采用采样与访问控制。']
    ],
    steps: [
      '接入 OpenTelemetry，为入口、模型和工具创建 spans。',
      '加入 model/prompt version、token usage、cost、route 与 error attributes。',
      '做一个按版本筛选的延迟/错误/成本面板，并验证敏感字段未泄漏。'
    ],
    check: '为什么仅记录最终 HTTP 延迟，难以定位 LLM 应用变慢的原因？',
    answer: '总延迟混合排队、检索、模型 prefill/decode、工具和重试；只有子 span 才能分离哪个环节、哪个版本发生变化。',
    sources: [
      ['OpenTelemetry · Python Getting Started', 'https://opentelemetry.io/docs/languages/python/getting-started/', 'traces、metrics 与 logs'],
      ['OpenTelemetry · Context propagation', 'https://opentelemetry.io/docs/concepts/context-propagation/', '跨服务关联']
    ]
  },
  'production-delivery': {
    duration: '11 分钟',
    summary: '交付阶段要把本地“能运行”变成可重复构建、启动和验证。Docker 镜像固定依赖，Compose 描述 API、worker、数据库和缓存；healthcheck 判断服务是否真正可用，CI 运行 unit/integration，部署前后再执行 smoke 与 load test。',
    concepts: [
      ['镜像可复现', '固定依赖与基础镜像，使用多阶段构建并避免把密钥写进 image layer。'],
      ['Readiness', '进程存在不代表可接流量；检查模型、数据库或关键依赖是否准备完成。'],
      ['测试分层', 'unit 快速验证逻辑，integration 验证边界，load 验证容量与退化方式。']
    ],
    steps: [
      '为 API 写最小非 root Dockerfile，并加入 .dockerignore。',
      '用 Compose 定义依赖、volume、network、healthcheck 和启动顺序。',
      'CI 中构建镜像、跑测试和安全扫描，再对部署环境做 smoke test。'
    ],
    check: '为什么 Compose 的 depends_on 本身不一定保证数据库可接受连接？',
    answer: '默认只保证容器启动顺序，不代表服务 readiness；需要 healthcheck，并使用 service_healthy 条件或应用侧重试。',
    sources: [
      ['Docker Compose', 'https://docs.docker.com/compose/', '多容器交付'],
      ['Compose · Startup order', 'https://docs.docker.com/compose/how-tos/startup-order/', 'healthcheck 与依赖'],
      ['Docker · GitHub Actions', 'https://docs.docker.com/build/ci/github-actions/', 'CI 构建']
    ]
  },
  'paper-rag': {
    duration: '11 分钟',
    summary: '经典 RAG 把参数化知识（generator 权重）与非参数化知识（外部文档索引）结合。retriever 根据输入取回文档，generator 在文档条件下生成；工程系统通常分别评估 retrieval recall 与 generation groundedness，避免只用最终回答分数掩盖检索失败。',
    concepts: [
      ['职责边界', 'retrieval 决定模型看见什么证据，generation 决定如何基于证据组织回答。'],
      ['Top-k', 'k 太小可能漏证据，太大会引入噪声、增加 context 成本并影响位置分布。'],
      ['可更新知识', '外部索引可独立更新和追踪来源，无需为每次知识变化重新训练模型。']
    ],
    steps: [
      '阅读方法图，画出 query→retriever→documents→generator 数据流。',
      '为一个小语料分别测 Recall@k 与答案 groundedness。',
      '构造“检索错/检索对但生成错”案例，建立分层调试方法。'
    ],
    check: '最终答案错误时，为什么应先判断证据是否被检索到？',
    answer: '如果相关文档不在 context，主要问题在 retriever/index/query；若证据已存在但回答错误，才更可能是生成、排序或提示问题。',
    sources: [
      ['论文 · Retrieval-Augmented Generation', 'https://arxiv.org/abs/2005.11401', '原论文']
    ]
  },
  'paper-lost-middle': {
    duration: '10 分钟',
    summary: '《Lost in the Middle》显示长上下文模型对信息位置敏感：相关信息位于开头或结尾时表现较好，位于中间时常下降。工程含义是“塞进上下文”不等于“被可靠使用”，RAG 仍需排序、压缩和位置设计。',
    concepts: [
      ['位置偏差', '模型表现常呈 U 形，首尾证据比中间证据更容易被利用。'],
      ['Context ≠ memory', '上下文窗口容量是上限，不是所有 token 等权可检索的保证。'],
      ['排序策略', '高置信证据应放在更有利位置，并减少重复或无关 chunk。']
    ],
    steps: [
      '阅读 key-value retrieval 与 multi-document QA 实验设置。',
      '在同一问题中把金标准段落放在首/中/尾，记录准确率。',
      '比较 rerank、context compression 与 evidence-at-end 三种策略。'
    ],
    check: '支持更长 context 的模型，为什么仍可能需要 RAG reranker？',
    answer: '长窗口只允许放入更多 token，不保证注意力能稳定利用中间证据；reranker 减少噪声并把关键证据放到更优位置。',
    sources: [
      ['论文 · Lost in the Middle', 'https://arxiv.org/abs/2307.03172', '长上下文位置偏差']
    ]
  },

  'evaluation-agents': {
    duration: '14 分钟',
    summary: 'Agent 不是“模型自己想办法”，而是 model、tools、state 与控制循环的组合。Hugging Face Agents Course 的 Unit 1 解释 Thought→Action→Observation，LangGraph 用有向图明确节点和状态，Unit 4 再把功能、测试与认证放到同一项目。',
    concepts: [
      ['Agent loop', '模型基于当前状态选择 action，环境返回 observation，再进入下一步，直到结束条件。'],
      ['Tool contract', '清晰名称、参数 schema、返回结构和副作用边界直接影响 tool selection。'],
      ['Graph state', '显式状态与边使重试、分支、human-in-the-loop 和持久化更可控。']
    ],
    steps: [
      '完成 Unit 1，手写一个两工具 agent 的 Thought/Action/Observation trace。',
      '用 LangGraph 实现 model→tool→model 循环和最大步数终止。',
      '为工具错误、无效参数、循环和越权请求各写一个测试。'
    ],
    check: '为什么 production agent 需要最大步数或终止条件？',
    answer: '模型可能在工具错误或模糊目标下循环，持续消耗 token、时间和副作用预算；显式终止条件形成可靠性边界。',
    sources: [
      ['Hugging Face Agents Course', 'https://huggingface.co/learn/agents-course/en/unit0/introduction', '课程入口'],
      ['Agent steps and structure', 'https://huggingface.co/learn/agents-course/unit1/agent-steps-and-structure', 'Thought-Action-Observation'],
      ['LangGraph · First graph', 'https://huggingface.co/learn/agents-course/unit2/langgraph/first_graph', '图实现']
    ]
  },
  'evaluation-mlflow': {
    duration: '13 分钟',
    summary: 'MLflow 把 agent 执行记录为 trace，并在 evaluation dataset 上运行 scorer。确定性约束优先用 code-based scorer；语义正确、groundedness 或复杂规范可用 LLM judge，但必须用人工样本校准并监控 bias。',
    concepts: [
      ['Evaluation dataset', '保存 inputs、expected outputs/facts 与 tags，使同一版本可以重复比较。'],
      ['Code scorer', '适合 schema、exact match、tool arguments、latency 和安全规则，便宜且稳定。'],
      ['LLM judge', '适合语义标准，但存在位置、长度、自偏好与模型版本变化，需要校准。']
    ],
    steps: [
      '为 20 条样本建立 evaluation dataset，并给每条标注类别。',
      '实现一个格式 scorer、一个 tool accuracy scorer 和一个 guidelines judge。',
      '比较 judge 与人工标签，记录误判并调整 rubric，而不是只调 prompt。'
    ],
    check: '什么情况下应优先使用代码评分，而不是 LLM judge？',
    answer: '当标准可确定计算，例如 JSON schema、exact tool name、敏感字段泄漏、延迟或数值阈值时，代码评分更稳定、便宜、可解释。',
    sources: [
      ['MLflow · LLM & Agent Evaluation', 'https://mlflow.org/docs/latest/genai/eval-monitor/', '评测入口'],
      ['MLflow · Judges and Scorers', 'https://mlflow.org/docs/latest/genai/eval-monitor/scorers/', '评分类型'],
      ['MLflow · Evaluation Datasets', 'https://mlflow.org/docs/latest/genai/datasets/', '数据集']
    ]
  },
  'evaluation-dataset': {
    duration: '12 分钟',
    summary: '100 条评测不是随机收集 100 个 prompt，而是覆盖正常能力、边界、工具故障、prompt injection 与越权/隐私的风险矩阵。每条样本应说明预期行为、允许的工具、禁止动作、评分方式和来源。',
    concepts: [
      ['风险分层', '正常任务看 capability，边界和故障看 robustness，攻击样本看 policy/security。'],
      ['预期行为', '安全样本不总是“拒绝”；有时应完成无害部分、请求确认或使用最小权限工具。'],
      ['数据来源', '结合真实 trace、手工红队和合成扩展，并标记来源以发现分布偏差。']
    ],
    steps: [
      '先定义 5 类×子能力的 coverage matrix，再填样本。',
      '为每条添加 expected outcome、allowed tools、forbidden behavior 与 scorer。',
      '去重并人工复核，保留失败 trace 作为后续回归样本。'
    ],
    check: '为什么安全评测不能把所有攻击样本的预期答案都设为“拒绝”？',
    answer: '过度拒绝会损伤正常任务；可靠策略应区分恶意部分与合法目标，最小化权限并在需要时澄清或确认。',
    sources: [
      ['MLflow · Evaluation Datasets', 'https://mlflow.org/docs/latest/genai/datasets/', '构建评测集'],
      ['HF Agents · Observability and Evaluation', 'https://huggingface.co/learn/agents-course/bonus-unit2/what-is-agent-observability-and-evaluation', 'agent 评测信号']
    ]
  },
  'evaluation-gate': {
    duration: '11 分钟',
    summary: '质量门禁把评测从报告变成发布条件。每个候选版本与当前基线比较 capability、tool accuracy、安全、延迟和成本；关键安全指标可零容忍，统计型指标设置允许退化范围，并保存失败样本与一键回退版本。',
    concepts: [
      ['Absolute gate', '例如敏感信息泄漏、未授权工具调用，一旦出现即可阻断发布。'],
      ['Relative gate', '成功率、P95、成本相对基线允许小范围波动，避免被随机噪声误判。'],
      ['版本绑定', '结果必须绑定 code、prompt、model、tool schema、dataset 与 scorer 版本。']
    ],
    steps: [
      '定义 must-pass 安全集与统计回归集的阈值。',
      '在 CI 中生成候选/基线对比，失败时附具体 case 与 trace。',
      '部署采用 canary，线上指标越界时自动或人工回退到已知版本。'
    ],
    check: '为什么只在 PR 中运行一次平均成功率，不足以作为发布门禁？',
    answer: '平均值可能掩盖关键安全失败和类别回归；还缺版本绑定、分项阈值、失败 case、噪声范围与回退机制。',
    sources: [
      ['MLflow · Running Evaluation', 'https://mlflow.org/docs/latest/genai/eval-monitor/running-evaluation/', '自动评测流程'],
      ['MLflow · Scorer Concepts', 'https://mlflow.org/docs/latest/genai/concepts/scorers/', '指标设计']
    ]
  },
  'paper-instructgpt': {
    duration: '12 分钟',
    summary: 'InstructGPT 的三阶段是：用人工示范做 SFT；对同一 prompt 的多个回答做人类排序并训练 reward model；用 PPO 优化 policy，同时用 KL penalty 约束其不要偏离 SFT policy。目标是人类偏好，不等于客观真值。',
    concepts: [
      ['SFT', '示范数据建立基本指令跟随 policy，也是后续 RL 的初始与参考。'],
      ['Reward Model', '从回答排序学习标量偏好分数，质量受标注标准和分布限制。'],
      ['PPO + KL', '最大化 reward，同时限制与 reference policy 的偏移，降低 reward hacking 与崩坏。']
    ],
    steps: [
      '画出 demonstration、comparison、PPO 三类数据/模型流。',
      '解释 reward model 的 pairwise ranking loss 在比较什么。',
      '列出 helpfulness、truthfulness、harmlessness 之间可能的冲突。'
    ],
    check: '为什么 reward model 分数升高，不保证模型更真实？',
    answer: 'reward model 学的是标注偏好并可能有盲区；policy 能利用其偏差获得高分，且“看起来可信”可能被偏好于真实但谨慎的回答。',
    sources: [
      ['论文 · InstructGPT', 'https://arxiv.org/abs/2203.02155', 'SFT、RM 与 PPO']
    ]
  },
  'paper-dpo': {
    duration: '13 分钟',
    summary: 'DPO 把带 KL 约束的奖励最大化问题改写为偏好分类目标，直接提高 policy 对 chosen 相对 rejected 的 log-prob margin，并使用 reference model 的对应 margin 作为基准。它省去显式 reward model 与在线 PPO，但仍依赖高质量偏好对。',
    concepts: [
      ['Preference pair', '同一 prompt 下 chosen 应优于 rejected；配对质量比孤立回答标签更重要。'],
      ['Reference policy', '提供原策略基线，防止 policy 为偏好数据过度漂移。'],
      ['β', '控制偏好优化与贴近 reference 的权衡；过强或过弱都可能影响稳定性。']
    ],
    steps: [
      '写出 policy 与 reference 对 chosen/rejected 的四个 log probabilities。',
      '用直觉解释 DPO loss 如何扩大 policy 的相对偏好 margin。',
      '在训练日志中同时观察 chosen/rejected reward、margin 与 validation。'
    ],
    check: 'DPO 为什么仍需要 reference model，尽管没有单独训练 reward model？',
    answer: 'reference 的 log-prob margin 体现偏离原策略的基准，相当于 KL 约束的一部分，防止只为偏好对无限推高概率差。',
    sources: [
      ['论文 · Direct Preference Optimization', 'https://arxiv.org/abs/2305.18290', 'DPO 推导'],
      ['TRL · DPOTrainer', 'https://huggingface.co/docs/trl/en/dpo_trainer', '实现']
    ]
  },
  'paper-cot': {
    duration: '9 分钟',
    summary: 'Chain-of-Thought prompting 通过少量包含中间推理步骤的示例，引导大模型在输出答案前生成分解过程，尤其改善多步算术、常识和符号推理。论文现象与模型规模相关；工程上还应区分“内部推理能力”与“向用户展示完整推理文本”。',
    concepts: [
      ['Elicitation', 'CoT 主要改变如何调用已有能力，不等于通过 prompt 新训练了推理算法。'],
      ['Scale effect', '论文中明显收益更多出现在足够大的模型，小模型可能产生不连贯过程。'],
      ['Faithfulness', '生成的解释可能合理但并非真实决策因果链，不能自动当作审计证据。']
    ],
    steps: [
      '比较 direct answer 与 few-shot CoT 的提示和错误类型。',
      '在 20 道多步题上固定模型与采样参数，比较准确率。',
      '检查“答案对但解释错”和“解释顺但答案错”的案例。'
    ],
    check: '为什么一段流畅的 CoT 不能直接证明模型按这条路径得出答案？',
    answer: '生成解释本身也是预测文本，可能是事后合理化；可读性不等于因果忠实性，需要干预或专门评测。',
    sources: [
      ['论文 · Chain-of-Thought Prompting', 'https://arxiv.org/abs/2201.11903', '原论文']
    ]
  },
  'paper-react': {
    duration: '10 分钟',
    summary: 'ReAct 将 reasoning trace 与 action 交替：模型先决定下一步，调用外部工具，读取 observation，再更新计划。相比只生成 CoT，它能用环境证据纠错；相比只调用动作，它保留任务分解上下文。风险是错误 observation、循环和提示注入进入后续状态。',
    concepts: [
      ['Thought', '维护当前目标与下一步选择，但生产系统不应依赖向用户暴露完整隐藏推理。'],
      ['Action / Observation', 'action 必须符合工具 schema，observation 应视为不可信外部输入。'],
      ['Trajectory', '评测不仅看最终答案，还看工具选择、参数、步数、错误恢复与副作用。']
    ],
    steps: [
      '阅读论文示例，标出每次 reasoning、action、observation 的作用。',
      '实现一个搜索+计算器最小循环，并设最大步数。',
      '注入工具错误与恶意 observation，测试 agent 是否越权或循环。'
    ],
    check: '为什么工具返回内容也要经过安全边界，而不能直接追加进 prompt？',
    answer: '网页或工具结果可能包含 prompt injection、敏感数据或伪造指令；它是数据而非可信系统指令，需要标记来源、过滤并限制后续权限。',
    sources: [
      ['论文 · ReAct', 'https://arxiv.org/abs/2210.03629', 'reasoning 与 action 交替'],
      ['HF Agents · Function Calling', 'https://huggingface.co/learn/agents-course/bonus-unit1/what-is-function-calling', '工具调用背景']
    ]
  },
  'paper-llm-judge': {
    duration: '12 分钟',
    summary: 'LLM-as-a-Judge 能以较低成本扩展开放式评测，但会受 position bias、verbosity bias、self-enhancement 和提示措辞影响。可靠使用方式是固定 rubric、交换回答顺序、控制长度、用人工标注校准，并把 judge 版本纳入结果版本。',
    concepts: [
      ['Position bias', 'pairwise judge 可能偏向先出现或后出现的答案，可交换顺序后聚合。'],
      ['Verbosity bias', '更长、更像解释的回答可能在实质质量相同或更差时得高分。'],
      ['Calibration', '在代表性人工集上计算一致率，并分析按类别和难度的误判。']
    ],
    steps: [
      '为目标任务写包含维度与等级锚点的 rubric。',
      '对 pairwise 样本做 A/B 与 B/A 两次判断，标记不一致。',
      '与至少 30 条人工标签比较，按类别检查 precision/recall 或 agreement。'
    ],
    check: '更换 judge model 后，为什么历史分数不能直接与新分数纵向比较？',
    answer: 'judge 的偏好、能力和输出分布发生变化，相当于量尺改变；应在同一校准集上重跑或建立版本间对照。',
    sources: [
      ['论文 · Judging LLM-as-a-Judge', 'https://arxiv.org/abs/2306.05685', '偏差与 MT-Bench'],
      ['MLflow · LLM Judges', 'https://mlflow.org/docs/latest/genai/eval-monitor/scorers/', '工程实现']
    ]
  }
};
