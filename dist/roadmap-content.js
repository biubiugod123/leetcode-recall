/*
 * Curated Chinese lesson notes for the LLM Systems roadmap.
 *
 * The roadmap notes explain each lesson in-place, then point to the official
 * course, documentation, or original paper as a source. CS336 uses an
 * additional structured study guide with formulas, examples, and comparisons.
 */
const LLM_COURSES = {
  'cs336-2026': {
    id: 'cs336-2026',
    title: 'Stanford CS336',
    edition: 'Spring 2026',
    description: 'Language Modeling from Scratch · 从 tokenizer 一路构建到训练系统、数据与对齐',
    courseUrl: 'https://cs336.stanford.edu/',
    videoUrl: 'https://www.youtube.com/playlist?list=PLoROMvodv4rMqXOcazWaTUHhq-yembLCV',
    sourceNote: '以下内容依据 Stanford 2026 官方课程页、可执行讲义与 slides 整理为中文学习笔记；原材料保留在每讲底部。',
    chapters: [
      {
        id: 'lecture-01',
        number: '01',
        title: '总览与 Tokenization',
        subtitle: '从“会调用模型”回到底层：语言模型完整生产链与 BPE',
        duration: '28 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_01',
        summary: [
          'CS336 把语言模型看成一个端到端系统：原始数据先经过 tokenizer 变成 token，Transformer 根据前缀预测下一个 token，训练系统用数据和计算资源优化参数，最后再经过评测与对齐进入真实应用。课程的重点不是记住 API，而是能解释每一层抽象泄漏时发生了什么。',
          'Tokenization 决定模型看到的最小单位。直接使用 Unicode 字符会产生巨大而稀疏的词表；只使用 UTF-8 byte 虽然完全可逆，但序列太长。Byte-Pair Encoding 从 256 个 byte 出发，反复合并语料中高频相邻 pair，在词表大小与序列长度之间取得折中。'
        ],
        concepts: [
          ['理解来自构建', '调用高级框架能提高生产力，但性能、数值与数据问题会穿透抽象层。亲手实现是为了建立可调试的心智模型。'],
          ['Tokenizer 的正式接口', '`encode` 把 bytes/string 映射为整数序列，`decode` 做逆变换；同一词表与 merge 顺序必须在训练和推理中完全一致。'],
          ['BPE 训练', '统计相邻 token pair，选择最高频 pair 分配新 ID，再更新语料；特殊 token 与预分词规则要显式处理。'],
          ['效率主线', '课程所有模块都在平衡表达能力、训练稳定性与硬件效率。token 数更少意味着同样上下文能承载更多信息。']
        ],
        practice: [
          '用 UTF-8 bytes 编码并还原一段包含中文和 emoji 的文本，确认 round-trip。',
          '在一个 20–50 行小语料上手算两轮 BPE merge，并记录并列频次如何稳定决策。',
          '解释为什么只保存最终 vocab、不保存 merge ranks，通常不能复现编码结果。'
        ],
        check: 'Byte-level tokenizer 已经能表示任意文本，为什么还要训练 BPE？',
        answer: 'byte 方案的词表小且无 OOV，但常见文本会被拆成很长的序列，增加 attention 与训练成本。BPE 把高频 byte 组合成较长 token，用更大的词表换取更短序列，同时仍以 byte 为后备保证覆盖。',
        sourceLabel: 'Lecture 1 官方可执行讲义'
      },
      {
        id: 'lecture-02',
        number: '02',
        title: 'PyTorch 与资源核算',
        subtitle: '张量表达、einops、FLOPs、显存和 arithmetic intensity',
        duration: '30 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_02',
        summary: [
          '写模型前先学会为每个张量标注 shape，并把运算翻译成资源账单。PyTorch 的核心抽象是张量、自动微分和 `nn.Module`；einops 让 reshape、transpose 与 einsum 的意图更清楚，能显著减少“维度对上了但语义错了”的 bug。',
          '性能不能只看 FLOPs。每个算子还要从 HBM 读取输入并写回输出。Arithmetic intensity = FLOPs / bytes moved；当强度低于硬件的计算/带宽比时，算子受内存带宽限制，增加计算单元也不会变快。Transformer 训练显存还包括参数、梯度、optimizer state、activation 和临时 buffer。'
        ],
        concepts: [
          ['Shape 是第一语言', '为 `B` batch、`T` sequence、`D` hidden、`H` heads 写清每一步 shape，比只看代码更容易发现广播与转置错误。'],
          ['FLOPs 估算', '矩阵乘 `m×k` 与 `k×n` 约需 `2mkn` FLOPs；训练还包含 forward、backward 与参数梯度计算。'],
          ['显存构成', '混合精度并不意味着只有 bf16 参数；Adam 常保留 fp32 master weights 与两份 momentum state。'],
          ['Roofline 模型', '性能上限是计算峰值与带宽上限中的较小者；优化前先判断 compute-bound 还是 memory-bound。']
        ],
        practice: [
          '为多头注意力写出 Q、K、V、score 和 output 的完整 shape。',
          '估算一个线性层 forward 的 FLOPs 与最少读取字节数，再计算 arithmetic intensity。',
          '分别列出 100M 参数模型在 bf16 SGD 与 AdamW 下参数、梯度和 optimizer state 的近似显存。'
        ],
        check: '两个实现 FLOPs 相同，为什么运行时间仍可能差很多？',
        answer: '真实时间还受数据移动、kernel launch、内存访问连续性、并行度和硬件利用率影响。低 arithmetic intensity 的实现通常受带宽限制；同样 FLOPs 下，减少 HBM 往返或融合 kernel 会明显更快。',
        sourceLabel: 'Lecture 2 官方可执行讲义'
      },
      {
        id: 'lecture-03',
        number: '03',
        title: '架构与超参数',
        subtitle: '现代 Decoder-only Transformer 的稳定、高效配方',
        duration: '28 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_03.pdf',
        summary: [
          '现代 LLM 大多收敛到 pre-norm decoder-only Transformer，但具体组件仍决定稳定性和效率。典型 block 是 `x + Attention(Norm(x))`，再接 `x + MLP(Norm(x))`。RMSNorm、RoPE、SwiGLU、合理初始化与 residual scaling 共同维持激活和梯度处在可训练范围。',
          '超参数不是孤立旋钮。隐藏维度、层数、head 数、MLP expansion、学习率、batch size 与 token 数共同决定参数量、FLOPs、显存和优化动态。有效比较必须固定计算预算或数据预算，并通过 ablation 一次只改变一个关键因素。'
        ],
        concepts: [
          ['Pre-norm', '先归一化再进入子层，为 residual 提供更直接的梯度通路，深层训练通常比 post-norm 稳定。'],
          ['RMSNorm 与 SwiGLU', 'RMSNorm 省去均值中心化；SwiGLU 用门控分支提高 MLP 表达能力，但会改变参数量与中间维度。'],
          ['RoPE', '对 Q/K 的通道对施加与位置相关的旋转，使内积自然携带相对位置信息。'],
          ['可比实验', '改变 architecture 时要重新核算参数量、训练 FLOPs 与最优学习率，不能只比较单次 loss。']
        ],
        practice: [
          '画出一个 pre-norm Transformer block，并标出每条 residual 路径。',
          '给定 `D=768, H=12`，写出每个 head 的维度和 QKV 投影参数量。',
          '设计一个只比较 ReLU MLP 与 SwiGLU 的公平 ablation：明确固定哪些预算。'
        ],
        check: '为什么把 LayerNorm 换成 RMSNorm 后，不能只看“代码少了一步”就判断模型更快？',
        answer: '端到端性能还取决于 kernel 是否融合、内存访问、MLP/attention 占比和硬件。组件变化也可能需要不同 hidden size 才保持参数量公平，因此必须重新核算并 benchmark。',
        sourceLabel: 'Lecture 3 官方 slides'
      },
      {
        id: 'lecture-04',
        number: '04',
        title: 'Attention 替代方案与 MoE',
        subtitle: '从 O(T²) 瓶颈到稀疏计算、线性注意力和专家路由',
        duration: '30 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_04.pdf',
        summary: [
          '标准 self-attention 让任意 token 两两交互，表达力强但计算和中间矩阵随序列长度呈 O(T²)。常见改造包括局部/稀疏 attention、GQA/MLA、线性 attention 和状态空间/递归模型。它们不是“全面更好”，而是在训练并行性、长上下文、decode 状态大小与表达能力之间交换成本。',
          'Mixture of Experts 把 dense MLP 替换成多个 expert，router 为每个 token 只选择少量 expert。总参数量可以很大，而单 token 激活参数较少；代价是路由不均衡、跨设备 all-to-all 通信、expert capacity 和训练稳定性。'
        ],
        concepts: [
          ['稀疏注意力', '限制可见位置能降低复杂度，但全局信息需要多层传播或额外 global token。'],
          ['GQA', '多个 query heads 共享更少的 K/V heads，主要减少 KV Cache 和 decode 带宽。'],
          ['MoE 路由', 'router logits 决定 top-k experts；训练需要防止少数 expert 过载、其余 expert 学不到。'],
          ['参数量不等于 FLOPs', 'MoE 的总参数很多，但每个 token 只激活一部分；部署时仍要存储并分布全部 expert。']
        ],
        practice: [
          '比较 full attention、window attention 和 recurrent state 在训练/推理时需要保存的状态。',
          '假设 8 个 experts、top-2 路由，说明单 token 激活比例与总参数存储的区别。',
          '解释 expert imbalance 为什么既影响模型质量，也影响分布式吞吐。'
        ],
        check: 'MoE 为什么能增加模型容量，却不按总参数量同比增加每个 token 的计算？',
        answer: 'router 只让每个 token 经过 top-k 个 experts，因此实际激活计算取决于 k，而不是 expert 总数；但所有 expert 的权重仍需存储和分布，并引入路由与通信成本。',
        sourceLabel: 'Lecture 4 官方 slides'
      },
      {
        id: 'lecture-05',
        number: '05',
        title: 'GPU 与 TPU',
        subtitle: '理解硬件层级，才能解释模型为什么快或慢',
        duration: '27 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_05.pdf',
        summary: [
          'GPU 以吞吐优先：大量简单执行单元通过线程、warp 和 block 并行工作，用并发隐藏访存延迟。数据从 HBM 进入片上 cache/shared memory/register 越频繁，性能越受带宽限制。TPU 同样围绕大规模矩阵计算设计，但编程模型、互联与编译栈不同。',
          '高性能代码的核心不是“多做计算”，而是让已有计算持续喂饱硬件。连续访问、coalescing、共享内存复用、足够 occupancy 和减少 host-device 同步，往往比微小算术优化更重要。'
        ],
        concepts: [
          ['内存层级', 'HBM 容量大但远，register/shared memory 小但近；优秀 kernel 尽量复用搬到片上的数据。'],
          ['SIMT', 'warp 中线程执行同一指令；分支发散会让不同路径串行执行。'],
          ['Tensor Core', '专门加速小块矩阵乘累加，对 dtype、tile shape 与对齐有要求。'],
          ['互联拓扑', '单卡快不等于多卡快；NVLink/PCIe/网络带宽与拓扑会决定 collective 的代价。']
        ],
        practice: [
          '画出 CPU → HBM → L2 → shared memory/register 的数据路径。',
          '解释不连续读取和 warp divergence 各自浪费了什么硬件资源。',
          '对一个 elementwise op 与大矩阵乘，判断谁更可能 memory-bound。'
        ],
        check: '为什么 GPU 有极高 FLOPs，elementwise 激活函数仍可能跑不满计算单元？',
        answer: 'elementwise 运算对每个元素只做少量计算，却要读取并写回数据，arithmetic intensity 很低，瓶颈通常是 HBM 带宽而不是算术峰值。',
        sourceLabel: 'Lecture 5 官方 slides'
      },
      {
        id: 'lecture-06',
        number: '06',
        title: 'Kernel、Profiling 与 Triton',
        subtitle: '用 measurement 找瓶颈，再用 fusion 和 tiling 减少数据移动',
        duration: '30 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_06',
        summary: [
          '优化顺序应是 benchmark → profile → 定位瓶颈 → 改实现 → 再测。GPU 操作异步执行，直接用 CPU wall clock 会得到错误结果；需要 warm-up、显式同步或 CUDA events，并同时记录输入 shape、dtype 与硬件。',
          'Triton 用 program instance 处理一个数据 tile。elementwise kernel 关注连续 load/store，reduction 关注一个 block 能否容纳一行，matmul 则通过 tiling 把 A/B 子块搬到片上重复使用。Fusion 把多个 PyTorch op 合并，避免中间张量反复写回 HBM。'
        ],
        concepts: [
          ['正确 benchmark', 'warm-up 排除编译和 cache 冷启动；同步确保计时覆盖真实 GPU 工作。'],
          ['Profiler', '先看耗时 kernel、launch 数量、memory throughput 与 occupancy，不凭直觉改代码。'],
          ['Program ID', 'Triton 中每个 program 负责一个 tile，通过 offsets 与 mask 安全处理边界。'],
          ['Tiling', '块内复用能提高 arithmetic intensity；tile 太大又会增加 register/shared memory 压力。']
        ],
        practice: [
          '分别用未同步计时和 CUDA event 测一个矩阵乘，观察差异。',
          '写出 fused bias + GELU 相比两个独立 kernel 少了哪些 HBM 读写。',
          '为长度不是 block size 整数倍的向量说明 Triton mask 的作用。'
        ],
        check: '为什么一个自定义 fused kernel FLOPs 没变，却可能明显加速？',
        answer: '它把多个运算放在一次读取后完成，减少中间张量写回和再次读取 HBM，也减少 kernel launch。对 memory-bound 运算，数据移动下降会直接提高速度。',
        sourceLabel: 'Lecture 6 官方可执行讲义'
      },
      {
        id: 'lecture-07',
        number: '07',
        title: '并行训练 I',
        subtitle: 'Collective、DDP 与通信/计算重叠',
        duration: '28 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_07',
        summary: [
          '多 GPU 训练延续同一个原则：计算离数据很远，必须减少并隐藏数据传输。Data Parallel 在每张卡复制模型，处理不同 micro-batch，再用 all-reduce 聚合梯度。数学上它等价于更大的 batch，但通信量、同步点与 batch size 会改变效率和优化动态。',
          'Collective 是分布式算法的积木：broadcast、reduce、all-reduce、all-gather 和 reduce-scatter。Ring all-reduce 能让每张卡只传递分块数据；bucketed gradients 则在后层反向仍在计算时，提前同步已经完成的梯度。'
        ],
        concepts: [
          ['DDP', '参数复制、数据切分、梯度平均；单卡放得下模型时最简单可靠。'],
          ['All-reduce', '每个 rank 最终得到所有 rank 数据的归约结果，常用于梯度求和/平均。'],
          ['通信成本', '延迟项与消息次数有关，带宽项与总字节数有关；小张量过多会被 latency 主导。'],
          ['Overlap', '把梯度分 bucket，backward 产生一桶就异步通信，以计算遮盖通信时间。']
        ],
        practice: [
          '画出 4 卡 DDP 一步中 forward、backward、all-reduce 与 optimizer step 的顺序。',
          '说明 batch size、micro-batch、gradient accumulation 和 world size 的关系。',
          '解释为什么把所有梯度等 backward 完成后一次同步，会失去 overlap 机会。'
        ],
        check: 'DDP 为什么节省训练时间，却通常不节省单卡参数/optimizer 显存？',
        answer: 'DDP 在每张卡完整复制模型、梯度与 optimizer state，只把 batch 分开；它扩展吞吐但没有 shard 状态。要节省每卡显存，需要 FSDP/ZeRO 等切分方案。',
        sourceLabel: 'Lecture 7 官方可执行讲义'
      },
      {
        id: 'lecture-08',
        number: '08',
        title: '并行训练 II',
        subtitle: 'FSDP、Tensor/Pipeline/Sequence Parallel 与 3D 并行',
        duration: '32 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_08.pdf',
        summary: [
          '当模型状态放不进单卡，必须把参数、梯度或 optimizer state 分片。FSDP/ZeRO 用 all-gather 临时重建当前层参数，再用 reduce-scatter 分发梯度；显存下降的代价是更多通信。Tensor Parallel 把层内矩阵乘拆到多卡，Pipeline Parallel 把层分段并用 micro-batch 填充流水线。',
          '实际大模型往往组合 data、tensor、pipeline、sequence 与 expert parallel。最优方案取决于模型 shape、网络拓扑、batch、序列长度和是否 MoE；目标是让高频大流量通信尽量走最快互联，并控制 bubble 与重算。'
        ],
        concepts: [
          ['FSDP/ZeRO', '通过 shard 参数、梯度、optimizer state 降低每卡模型状态；计算某层前再通信恢复所需权重。'],
          ['Tensor Parallel', '拆分单层矩阵乘，通信频繁但能处理单层也放不下的模型，通常放在高速节点内。'],
          ['Pipeline Parallel', '不同卡负责不同层；micro-batch 太少会产生 pipeline bubble。'],
          ['Activation/Sequence Parallel', '沿序列或非 tensor-parallel 维切 activation，降低长上下文的激活显存。']
        ],
        practice: [
          '比较 DDP 与 FSDP 在参数、梯度和 optimizer state 上是复制还是分片。',
          '画一个 4-stage pipeline 处理 4 个 micro-batches 的时间格子，标出 bubble。',
          '给定节点内 NVLink、节点间较慢网络，说明 TP 与 DP 通常如何映射到拓扑。'
        ],
        check: '为什么“把所有维度都切得更碎”不一定更快？',
        answer: '分片降低单卡显存和计算，但会增加 collective 次数、同步与小消息开销；过细切分还降低 kernel 效率。并行方案必须平衡显存、计算粒度、网络拓扑和通信重叠。',
        sourceLabel: 'Lecture 8 官方 slides'
      },
      {
        id: 'lecture-09',
        number: '09',
        title: 'Scaling Laws I',
        subtitle: '用小实验预测大训练：power law、ISOFLOP 与 compute-optimal',
        duration: '28 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_09.pdf',
        summary: [
          'Scaling law 的价值不是一句“越大越好”，而是把昂贵训练变成可预测的规划问题。验证损失常随参数量 N、数据量 D 或计算量 C 呈平滑幂律下降。团队先在多个小规模预算上运行实验、拟合曲线，再外推目标训练的 loss 与合理配置。',
          '训练计算常近似 `C ≈ 6ND`。固定 C 时，模型过大会因 token 不足而 under-trained，模型过小则容量不足。ISOFLOP 方法在每个计算预算上寻找最优 N/D，再拟合最优配置随 C 的变化。'
        ],
        concepts: [
          ['Scaling recipe', '不是只预测一条曲线，而是定义计算预算如何映射到 model shape、tokens、batch 与学习率。'],
          ['Power law', '在 log-log 坐标中近似直线，便于拟合指数；但不可盲目跨越 regime 外推。'],
          ['Compute-optimal', '固定训练 FLOPs 下选择 N 与 D，使验证 loss 最低；还未考虑后续推理成本。'],
          ['可预测性', '稳定复现与低方差往往比单个小规模点上的最优结果更重要。']
        ],
        practice: [
          '用 `C=6ND` 比较两个同计算量、不同 N/D 的训练配置。',
          '画出三个 compute budgets 下的 ISOFLOP 曲线，并标出每条曲线最低点。',
          '列出至少三个会让小规模曲线不能可靠外推的 regime change。'
        ],
        check: '为什么只在一个模型规模上调出最好超参数，不能直接决定 100 倍规模的训练？',
        answer: '最优学习率、batch、深宽比和 token/parameter 比例会随规模变化，硬件和数值 regime 也可能改变。需要一组跨规模、遵循同一 recipe 的实验来拟合趋势。',
        sourceLabel: 'Lecture 9 官方 slides'
      },
      {
        id: 'lecture-10',
        number: '10',
        title: 'LLM Inference',
        subtitle: 'Prefill、Decode、KV Cache、Batching 与延迟/吞吐权衡',
        duration: '30 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_10',
        summary: [
          '推理包含性质不同的两阶段。Prefill 一次处理全部 prompt token，矩阵较大、并行度高，通常更 compute-bound；decode 每步只生成一个 token，需要读取全模型权重和历史 KV，常受内存带宽限制。TTFT 衡量首 token 体验，TPOT/ITL 衡量后续流式速度。',
          'KV Cache 保存每层历史 K/V，避免每步重新编码整个前缀，但显存随 batch、层数、KV heads、序列长度和 head dimension 线性增长。Continuous batching、paged KV、prefix cache、量化与 speculative decoding 分别从调度、内存、复用和计算路径优化服务。'
        ],
        concepts: [
          ['Prefill vs Decode', '同一模型在两阶段的 shape 与瓶颈不同，不能只报告一个平均 tokens/s。'],
          ['KV Cache', '省去历史 K/V 计算，用显存换 decode FLOPs；GQA/MLA 直接减少每 token KV 大小。'],
          ['Continuous Batching', '请求完成后立刻补入新请求，避免 static batch 被最长序列拖住。'],
          ['Speculative Decoding', '小 draft model 先提议多个 token，大模型并行验证；正确实现保持目标分布不变。']
        ],
        practice: [
          '根据 layer、KV heads、head_dim、dtype 与 sequence length 写出单请求 KV Cache 公式。',
          '分别设计测 TTFT、TPOT、P95 latency 和 throughput 的负载。',
          '解释 batch 增大为什么通常提高吞吐，却可能伤害单请求延迟。'
        ],
        check: '为什么 decode 往往是 memory-bound，即使 Transformer 本身包含大量矩阵乘？',
        answer: 'decode 每步只有很少 token，矩阵的 batch 维小；模型权重却要反复从 HBM 读取，单次读取对应的计算复用有限，因此 arithmetic intensity 低，带宽常先饱和。',
        sourceLabel: 'Lecture 10 官方可执行讲义'
      },
      {
        id: 'lecture-11',
        number: '11',
        title: 'Scaling Laws II',
        subtitle: '从漂亮曲线走向真实训练决策与稳健外推',
        duration: '28 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_11.pdf',
        summary: [
          '真实 scaling 实验最难的部分是让不同规模“可比”：数据配比、tokenizer、architecture family、optimizer、训练稳定性和测量噪声都可能让曲线折断。要预先定义 recipe、预算与拟合方法，保留失败 run，避免只挑符合预期的数据点。',
          '拟合不仅要给点预测，还要检查残差与不确定性。小模型过度正则、未进入渐近区，或大模型遇到数值不稳定时，统一 power law 会产生系统偏差。Hyperparameter transfer（例如 μP 思路）试图让一组超参数在宽度扩展时保持行为一致。'
        ],
        concepts: [
          ['实验设计', '规模点要覆盖足够范围并有重复 run；每个点都记录数据、seed、硬件与训练状态。'],
          ['拟合稳健性', '比较 log-space/linear-space 目标、加权方式与 outlier 处理，查看 residual 而不只看 R²。'],
          ['Hyperparameter Transfer', '通过参数化让宽度变化时 activation/update scale 保持一致，减少每个规模重新调参。'],
          ['预测与决策', '外推 loss 只是中间结果，最终还要权衡训练成本、推理成本、风险与时间。']
        ],
        practice: [
          '为 6 个规模点设计 train/validation 记录表，包含失败与异常字段。',
          '画一组有系统弯曲残差的 log-log 数据，解释单一幂律为何不可信。',
          '说明“最优训练 loss”与“总生命周期成本最优”为什么可能选择不同模型大小。'
        ],
        check: '为什么 scaling law 的预测很准，也不代表训练决策已经完成？',
        answer: '曲线通常预测固定 recipe 下的 loss，但产品还关心推理流量、延迟、显存、数据许可、可靠性与训练失败风险。最优决策是多目标问题。',
        sourceLabel: 'Lecture 11 官方 slides'
      },
      {
        id: 'lecture-12',
        number: '12',
        title: 'Evaluation',
        subtitle: 'Perplexity、能力评测、LLM Judge 与有效性',
        duration: '28 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_12',
        summary: [
          '“模型有多好”没有唯一答案。Perplexity 测 next-token prediction，适合比较同 tokenizer/数据分布的 base model；考试、chat、agent、reasoning 与 safety benchmark 测的是不同构念。评测必须先明确目标用户、任务、规则和允许的资源。',
          '好评测要同时考虑 realism 与 validity：任务是否代表真实使用？分数是否真的测到目标能力？污染、prompt 格式、答案抽取、judge 偏差和模型版本都可能改变结果，因此发布分数必须带完整 protocol 与置信区间。'
        ],
        concepts: [
          ['Perplexity', '平均 token NLL 的指数；tokenizer 不同会改变 token 粒度，数字通常不能直接横比。'],
          ['Benchmark Protocol', '同一题集在 zero-shot、few-shot、CoT、工具允许与否下是不同游戏。'],
          ['LLM-as-a-Judge', '可扩展但会受位置、长度、自我偏好与 rubric 模糊影响，需要校准。'],
          ['污染与过拟合', '公开题反复用于模型选择后，测试集就不再是独立估计。']
        ],
        practice: [
          '为一个代码 Agent 定义 task success、工具正确率、成本、延迟和安全失败五类指标。',
          '说明为什么两个不同 tokenizer 的模型不能只用 token perplexity 排名。',
          '设计一个检测 pairwise judge 位置偏差的 A/B 交换实验。'
        ],
        check: '一个 benchmark 分数提升，为什么不一定表示真实用户体验变好？',
        answer: '模型可能只适应了题型、prompt 或答案抽取规则，benchmark 也可能缺乏真实任务分布、成本和失败后果。需要验证构念有效性，并用贴近使用场景的端到端评测补充。',
        sourceLabel: 'Lecture 12 官方可执行讲义'
      },
      {
        id: 'lecture-13',
        number: '13',
        title: 'Pre-training Data I',
        subtitle: '数据从哪里来：Web、Wikipedia、代码、论文与许可边界',
        duration: '27 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_13',
        summary: [
          '模型行为由训练数据塑造。大规模预训练数据通常来自 Common Crawl、Wikipedia、GitHub、arXiv、书籍与其他专门语料；原始服务、公开 dump、抓取结果和最终可训练 dataset 是不同层级，每层都有格式、许可、去标识和质量问题。',
          '数据选择不只是“越多越好”。语种、代码、数学、时效性和领域比例会改变能力；版权、Terms of Service、隐私与安全要求决定哪些数据可以被收集和保留。高质量数据管线必须保存 provenance，能够追踪某条样本来自哪里、经历过哪些变换。'
        ],
        concepts: [
          ['Common Crawl', '规模大但噪声、重复、模板和垃圾页面很多，是原料而不是可直接训练的数据集。'],
          ['Dataset Provenance', '记录 source、时间、license、hash 与处理版本，支持审计、删除和复现。'],
          ['能力配比', '代码/数学/多语比例会系统性改变模型能力，数据 mixture 是模型设计的一部分。'],
          ['法律与伦理', '“公开可访问”不自动等于可任意训练；许可、隐私与司法辖区需要单独判断。']
        ],
        practice: [
          '为网页、GitHub 代码和 arXiv 三类来源列出格式、许可与质量风险。',
          '设计一条样本 provenance 记录，确保之后能按 source 删除。',
          '解释为什么随机抽 100 条人工查看，仍是大规模数据管线的重要步骤。'
        ],
        check: '为什么下载 Common Crawl 后不能直接 tokenize 并训练？',
        answer: '原始 crawl 包含导航模板、广告、乱码、重复、低质量/有害内容和许可风险。它需要解析、语言/质量过滤、去重、PII 与安全处理，以及数据配比。',
        sourceLabel: 'Lecture 13 官方可执行讲义'
      },
      {
        id: 'lecture-14',
        number: '14',
        title: 'Pre-training Data II',
        subtitle: 'Transformation、Filtering、Dedup、Mixing 与合成数据',
        duration: '30 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_14',
        summary: [
          '数据管线把原始文档转成可训练样本：先解析与规范化，再做语言、质量、毒性等过滤，随后进行 exact/near dedup，最后按目标 mixture 采样。每一步都可能误删有价值数据或保留系统性偏差，因此阈值必须通过样本审计与下游 ablation 决定。',
          '去重既减少浪费，也降低 benchmark contamination 和 memorization。Exact hash 只能发现完全相同文档；MinHash/LSH 等近似方法用 shingles 估计 Jaccard 相似度。数据 mixing 决定各 domain 在固定 token budget 中占比，合成数据则通过模型生成补齐任务，但会继承 teacher 偏差。'
        ],
        concepts: [
          ['Filtering', '规则或分类器定义“什么像好数据”；precision/recall 取舍会改变语料分布。'],
          ['Near Dedup', '把文档表示为 n-gram/shingle 集合，用 MinHash 近似相似度并通过 LSH 找候选。'],
          ['Data Mixing', '不是按原始体量自然采样；小而重要的 domain 常需上采样。'],
          ['Synthetic Data', '可产生可控格式与难度，但需要验证正确性、多样性和与真实数据的比例。']
        ],
        practice: [
          '为一个网页数据 pipeline 写出从 raw HTML 到 token shard 的 7 个阶段。',
          '比较 exact hash、URL dedup 与 MinHash 各能发现什么重复。',
          '设计一个过滤阈值 ablation：既看保留率，也看小模型 validation loss。'
        ],
        check: '为什么“质量分类器分数越高，数据越好”不能无限成立？',
        answer: '过高阈值会把风格多样、少数语言或专业内容误删，使数据趋同并放大分类器偏见。最佳阈值要结合保留率、分布覆盖和下游训练结果。',
        sourceLabel: 'Lecture 14 官方可执行讲义'
      },
      {
        id: 'lecture-15',
        number: '15',
        title: 'Mid/Post-training：SFT 与 RLHF',
        subtitle: '把 base model 变成能遵循指令、适合交互的模型',
        duration: '30 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_15.pdf',
        summary: [
          'Pre-training 学到广泛分布，但 next-token objective 并不直接等价于“按用户意图回答”。Mid-training 常用高质量领域或长上下文数据改变能力分布；SFT 用 instruction-response/chat trajectory 做 teacher forcing，让模型学会格式、角色与任务行为。',
          'RLHF 收集人类对候选回答的偏好，训练 reward model，再优化 policy。Preference optimization 也可以使用 DPO 等直接目标。关键风险是 reward hacking、过优化、模式坍缩和偏好数据代表性不足，因此必须保留 reference、KL 约束与独立评测。'
        ],
        concepts: [
          ['Chat Template', 'system/user/assistant 与特殊 token 的序列化必须和训练一致；格式错误会直接破坏行为。'],
          ['SFT Loss Mask', '通常只对 assistant response 计算 loss，避免把用户输入也当作待模仿输出。'],
          ['Reward Model', '从偏好对学习标量排序信号；它是人类偏好的近似代理，不是真实目标。'],
          ['DPO', '用 chosen/rejected 对直接调整 policy 相对 reference 的 log-ratio，避免显式在线 RL 环。']
        ],
        practice: [
          '把两轮对话写成 token 序列，并标出哪些位置参与 response-only loss。',
          '设计一条 preference pair，说明 chosen 比 rejected 好在哪里，避免只写“更自然”。',
          '列出 reward 提高但真实质量下降的三个可能迹象。'
        ],
        check: '为什么 SFT 数据量通常远小于 pre-training，仍能显著改变模型行为？',
        answer: 'Base model 已学到大量知识和语言能力；SFT 主要重新塑造条件分布与交互格式，告诉模型在 instruction/chat 上应调用哪些已有能力，而不是从头学习世界知识。',
        sourceLabel: 'Lecture 15 官方 slides'
      },
      {
        id: 'lecture-16',
        number: '16',
        title: 'Post-training：RLVR',
        subtitle: '可验证奖励、Policy Gradient、PPO/GRPO 与推理能力',
        duration: '30 分钟',
        materialType: 'Slides',
        materialUrl: 'https://github.com/stanford-cs336/lectures/blob/main/lecture_16.pdf',
        summary: [
          'RL from Verifiable Rewards 用可程序判断的结果作为奖励，例如数学最终答案、代码单元测试或形式证明检查。它减少主观 reward model 的噪声，并允许模型通过采样探索新的 reasoning trajectory；但稀疏奖励、错误 verifier、训练不稳定和长度投机仍然存在。',
          'Policy gradient 用采样回报加权 log-prob gradient。PPO 通过 clipped ratio 和 value/advantage 控制更新；GRPO 使用同一 prompt 的一组回答做相对归一化，省去显式 value model。无论算法名称，核心都是估计 advantage、限制 policy 漂移，并持续检测 reward 与真实能力是否分离。'
        ],
        concepts: [
          ['Verifier', '奖励必须可靠、难被投机，并验证过程所需的关键约束，而不只是表面格式。'],
          ['Advantage', '表示某个 action/trajectory 相对 baseline 好多少，降低 policy-gradient 方差。'],
          ['On-policy Sampling', '训练数据由当前 policy 产生；policy 改变后旧 trajectory 会逐渐失配。'],
          ['KL/Clipping', '限制单次更新，避免模型为追逐稀疏奖励而迅速偏离可读、通用的 reference 行为。']
        ],
        practice: [
          '为数学、代码和 Agent 三类任务各设计一个可验证 reward，并写出漏洞。',
          '用 4 个同 prompt 回答的 reward 手算 group-normalized advantage。',
          '设计同时监控 reward、准确率、长度、格式错误和 diversity 的训练面板。'
        ],
        check: 'Verifier 是确定性的，为什么 RLVR 仍可能 reward hacking？',
        answer: '确定性只表示相同输出得到相同分数，不保证规则等于真实目标。模型可能利用测试缺口、格式解析、答案泄漏或只优化最终结果而产生不可取过程。',
        sourceLabel: 'Lecture 16 官方 slides'
      },
      {
        id: 'lecture-17',
        number: '17',
        title: 'Multimodal Models',
        subtitle: '把图像、音频和视频变成 Transformer 能处理的 token',
        duration: '27 分钟',
        materialType: '可执行讲义',
        materialUrl: 'https://cs336.stanford.edu/lectures/?trace=lecture_17',
        summary: [
          'Transformer 的统一接口是 token，因此多模态系统首先要把图像、音频、视频等连续信号映射为离散或连续 token。图像可切 patch 并经 encoder 投影到 LLM hidden space，音频可按时间窗口编码；生成任务还需要 decoder 把 token 还原为像素或波形。',
          '常见设计包括独立 modality encoder + projector + LLM、cross-attention 融合，以及统一 token space。训练可以先对齐表示，再做多模态 instruction tuning。瓶颈来自 token 数巨大、时间/空间位置结构、模态不平衡与成对数据有限。'
        ],
        concepts: [
          ['Modality Encoder', '把原始信号压缩成语义表示；压缩太强会丢细节，太弱会产生过长序列。'],
          ['Projector/Adapter', '把视觉或音频特征映射到 LLM hidden dimension，使其能与文本 token 联合处理。'],
          ['Fusion', 'Early fusion 统一处理但昂贵；cross-attention/late fusion 更模块化但交互受限。'],
          ['Any-to-any', '理解与生成是两个方向：输入 encoder 之外，还需要输出 tokenizer/decoder 与相应训练目标。']
        ],
        practice: [
          '比较一张 224×224 图像使用 16×16 patch 与 14×14 patch 时 token 数。',
          '画出 vision encoder → projector → LLM → text decoder 的 shape 流。',
          '解释 10 秒视频为何会迅速产生比文本更长的 token sequence，并提出一种压缩方法。'
        ],
        check: '为什么不能简单把原始 RGB 数值直接当作普通文本 token 输入 LLM？',
        answer: '原始像素序列极长、局部结构强且数值分布与文本 embedding 不同。需要 encoder/patching 提取并压缩空间语义，再投影到模型可处理的表示空间。',
        sourceLabel: 'Lecture 17 官方可执行讲义'
      }
    ]
  }
};

const LLM_LESSON_CONTENT = {
  'foundation-cs336': {
    duration: '17 讲',
    courseId: 'cs336-2026',
    summary: 'CS336 的主线不是“调用一个模型”，而是亲手走完 tokenizer、Transformer、训练循环、系统优化、数据与对齐。已按 Stanford Spring 2026 官方课件整理为 17 讲站内中文课程。',
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
