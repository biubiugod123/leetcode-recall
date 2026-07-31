/*
 * Detailed in-site study guides for Stanford CS336 (Spring 2026).
 *
 * These notes are original Chinese explanations based on the official course
 * materials. They are deliberately structured as short learning blocks so the
 * reader can study in place instead of opening a slide deck for every topic.
 */
window.CS336_STUDY_GUIDES = {
  'lecture-01': {
    outcomes: [
      '能画出从原始文本到 next-token loss 的完整链路',
      '能手算 BPE 的 merge 过程并解释 merge rank',
      '能说清 byte、character、word 与 subword tokenizer 的取舍'
    ],
    sections: [
      {
        tag: '01 · 建立全局图',
        title: '训练语言模型，其实是一条数据变换流水线',
        body: [
          '原始网页不是模型可以直接读取的对象。数据管线先清洗文档，tokenizer 再把字符串转成整数 ID；模型接收长度为 T 的 token 序列，输出每个位置上“下一个 token”的概率分布。',
          '训练时把输入向右错一位得到标签：输入是 x₁…xₜ，目标是 x₂…xₜ₊₁。Cross-entropy 让正确 token 的概率变大。推理时没有真实的下一个 token，只能从预测分布中选一个，再把它追加到上下文继续预测。'
        ],
        flow: [
          ['Text', '清洗后的 UTF-8 文本'],
          ['Tokenizer', '文本 ↔ token IDs'],
          ['Transformer', '前缀 → logits'],
          ['Softmax', 'logits → 概率'],
          ['Loss / Sampling', '训练纠错或生成 token']
        ],
        callout: {
          type: 'insight',
          title: '贯穿整门课的问题',
          text: '每一步都在交换三样东西：模型能力、计算/显存成本、工程复杂度。以后遇到新技术，先问它改变了哪一笔账。'
        }
      },
      {
        tag: '02 · 机制',
        title: 'BPE：用更大的词表换更短的序列',
        body: [
          'Byte-level BPE 从 256 个 byte token 开始，所以任意 UTF-8 文本都可表示，不会出现 OOV。训练阶段反复寻找语料中出现次数最多的相邻 token pair，把它合并成一个新 token，直到词表达到目标大小。',
          '编码新文本时不能重新统计频率，而要按训练阶段得到的 merge rank 应用合并。rank 越小，代表该 pair 越早被学习，优先级越高。vocab 只告诉你“有哪些 token”，merge table 才告诉你“如何得到它们”。'
        ],
        example: {
          title: '手算两轮：语料 `low low lower`',
          steps: [
            ['初始', '`l o w`、`l o w`、`l o w e r`'],
            ['统计 pair', '`(l,o)` 与 `(o,w)` 都出现 3 次；用稳定规则选择 `(l,o)`'],
            ['Merge 1', '`lo w`、`lo w`、`lo w e r`'],
            ['Merge 2', '`(lo,w)` 出现 3 次，合并为 `low`'],
            ['结果', '`low`、`low`、`low e r`，序列长度下降']
          ]
        },
        code: {
          language: 'python',
          title: 'BPE 训练的最小伪代码',
          content: [
            'tokens = split_into_utf8_bytes(corpus)',
            'merges = []',
            'while vocab_size < target_size:',
            '    counts = count_adjacent_pairs(tokens)',
            '    pair = stable_argmax(counts)',
            '    tokens = merge_every_occurrence(tokens, pair)',
            '    merges.append(pair)'
          ].join('\n')
        }
      },
      {
        tag: '03 · 易错点',
        title: 'Tokenizer 不只是一个词表文件',
        body: [
          '真实 tokenizer 还包含 normalization、pre-tokenization、特殊 token、byte fallback 和 decode 规则。训练与推理只要有一个环节不一致，同一段文本就可能得到不同 ID，模型看到的输入也随之改变。',
          '比较 tokenizer 时不要只看 vocab size。更有用的指标包括平均 bytes/token、不同语言的压缩率、特殊字符 round-trip、训练速度与 encode 吞吐。中文、代码和 emoji 往往能暴露只在英文上测试看不到的问题。'
        ],
        compare: {
          headers: ['方案', '优点', '主要代价'],
          rows: [
            ['Character', '直观', 'Unicode 词表大、跨语言不均衡'],
            ['UTF-8 byte', '256 词表、无 OOV、可逆', '序列通常很长'],
            ['Word', '序列短', '词表爆炸、无法处理新词'],
            ['Byte BPE', '覆盖完整且长度适中', '训练/实现更复杂']
          ]
        },
        callout: {
          type: 'warning',
          title: '最常见的实现错误',
          text: '把字符串当 Unicode code point 拆分，而课程要求从 UTF-8 bytes 开始；中文字符通常由多个 bytes 组成。'
        }
      }
    ],
    takeaway: 'Tokenizer 决定模型的“输入坐标系”。BPE 的核心不是切词，而是在完全覆盖任意文本的前提下压缩常见 byte 序列。'
  },

  'lecture-02': {
    outcomes: [
      '能为 attention 的每个张量写出 shape',
      '能估算矩阵乘 FLOPs 与模型状态显存',
      '能用 arithmetic intensity 判断算子瓶颈'
    ],
    sections: [
      {
        tag: '01 · Shape 推理',
        title: '先写 shape，再写 PyTorch',
        body: [
          '设 batch 为 B、序列长度 T、隐藏维度 D、head 数 H、每个 head 维度 d=D/H。线性投影先得到 Q/K/V ∈ ℝᴮˣᵀˣᴰ，再 reshape 为 B×H×T×d。',
          '注意力分数 QKᵀ 的最后两维是 T×T；对最后一维做 softmax 后再乘 V，得到 B×H×T×d，最后拼回 B×T×D。很多 bug 的根源不是 API，而是把 head、token 或 feature 维混在了一起。'
        ],
        formula: {
          label: 'Scaled dot-product attention',
          expression: 'Attention(Q,K,V) = softmax(QKᵀ / √d) V',
          note: '除以 √d 是为了避免 d 增大时点积方差过大，让 softmax 过早饱和。'
        },
        code: {
          language: 'python',
          title: '用 einops 显式表达 head 维',
          content: [
            "q = rearrange(q, 'b t (h d) -> b h t d', h=num_heads)",
            "k = rearrange(k, 'b t (h d) -> b h t d', h=num_heads)",
            "v = rearrange(v, 'b t (h d) -> b h t d', h=num_heads)",
            "scores = einsum(q, k, 'b h tq d, b h tk d -> b h tq tk')"
          ].join('\n')
        }
      },
      {
        tag: '02 · 资源账单',
        title: 'FLOPs、显存和带宽是三本不同的账',
        body: [
          'm×k 与 k×n 的矩阵乘包含 mkn 次乘法和约 mkn 次加法，因此常记为 2mkn FLOPs。训练不是只做一次 forward：还要计算输入梯度与参数梯度，所以线性层的 backward 通常又包含两次相近规模的矩阵乘。',
          '显存至少包括参数、梯度、optimizer state 和 activation。以 AdamW 为例，混合精度训练通常还保留 fp32 master weights、fp32 一阶动量和 fp32 二阶动量；“模型是 bf16”不等于每个参数只占 2 bytes。'
        ],
        example: {
          title: '100M 参数的粗略模型状态',
          steps: [
            ['bf16 参数', '100M × 2 B ≈ 0.2 GB'],
            ['bf16 梯度', '100M × 2 B ≈ 0.2 GB'],
            ['fp32 master weight', '100M × 4 B ≈ 0.4 GB'],
            ['Adam m + v', '100M × 8 B ≈ 0.8 GB'],
            ['合计', '约 1.6 GB；还没算 activation、buffer 与 allocator 碎片']
          ]
        },
        formula: {
          label: 'Arithmetic intensity',
          expression: 'AI = 计算量 FLOPs / 从慢速内存搬运的 bytes',
          note: '若 AI 低于硬件的 peak FLOPs / memory bandwidth，算子通常受带宽限制。'
        }
      },
      {
        tag: '03 · 性能判断',
        title: 'Roofline：先判断瓶颈，再决定优化方向',
        body: [
          '算子性能上限是 min(计算峰值, 带宽 × AI)。Elementwise 激活对每个元素只做少量运算，却要读写完整张量，通常 memory-bound；大矩阵乘能在片上反复复用 tile，AI 高，更可能 compute-bound。',
          '如果算子受带宽限制，减少 FLOPs 往往没有明显收益；融合 kernel、减少中间张量和提高数据复用才有效。如果受计算限制，则应关注 Tensor Core、dtype、tile 与占用率。'
        ],
        compare: {
          headers: ['现象', '更可能的瓶颈', '优先动作'],
          rows: [
            ['带宽接近峰值、算力低', 'Memory-bound', 'Fusion、减少 HBM 往返'],
            ['Tensor Core 利用高', 'Compute-bound', '改算法/FLOPs、提高并行度'],
            ['两者都低', 'Launch/shape/同步', 'Profiler 定位空洞和小 kernel']
          ]
        }
      }
    ],
    takeaway: '性能分析不是看一张 FLOPs 表。先用 shape 保证语义正确，再同时核算计算、存储和数据移动。'
  },

  'lecture-03': {
    outcomes: [
      '能画出现代 pre-norm decoder block',
      '能解释 RMSNorm、RoPE 与 SwiGLU 的作用',
      '能设计参数量与计算量公平的架构对比'
    ],
    sections: [
      {
        tag: '01 · 架构主干',
        title: '现代 Decoder-only Transformer block',
        body: [
          'Pre-norm block 先对输入归一化，再进入 attention，输出与原 residual 相加；MLP 分支重复同样结构。Residual 路径像高速公路，让梯度可以绕过复杂子层直接传播。',
          'Causal mask 保证位置 t 只能看见 ≤t 的 token。训练时所有位置可以并行计算；生成时每次新增一个位置，因此需要 KV Cache 避免重复计算历史 K/V。'
        ],
        code: {
          language: 'python',
          title: '一个 block 的结构伪代码',
          content: [
            'def block(x):',
            '    x = x + attention(rms_norm(x), causal=True)',
            '    x = x + swiglu_mlp(rms_norm(x))',
            '    return x'
          ].join('\n')
        },
        callout: {
          type: 'insight',
          title: 'Pre-norm 为什么更稳',
          text: 'Residual 支路保留近似恒等映射，深层网络不必让梯度连续穿过每个 normalization 与子层。'
        }
      },
      {
        tag: '02 · 三个常用组件',
        title: 'RMSNorm、RoPE、SwiGLU 分别解决什么',
        body: [
          'RMSNorm 用均方根缩放向量，不减均值；RoPE 把每对 Q/K 通道按位置旋转，使点积依赖相对位置差；SwiGLU 让一条线性分支经过 SiLU 后去门控另一条分支。',
          '它们不是互相替代的技巧：RMSNorm 管激活尺度，RoPE 注入位置，SwiGLU 提升 MLP 的条件表达。更换组件后要重新核对参数量、中间 activation 和最优学习率。'
        ],
        formula: {
          label: 'RMSNorm',
          expression: 'RMSNorm(x) = γ ⊙ x / √(mean(x²) + ε)',
          note: 'γ 是可学习缩放；没有 LayerNorm 的减均值步骤。'
        },
        compare: {
          headers: ['组件', '修改位置', '主要作用'],
          rows: [
            ['RMSNorm', 'Attention/MLP 前', '稳定激活尺度'],
            ['RoPE', 'Q 与 K', '编码相对位置'],
            ['SwiGLU', 'MLP', '门控非线性表达']
          ]
        }
      },
      {
        tag: '03 · 公平实验',
        title: '超参数是一组耦合变量',
        body: [
          '隐藏维度 D 增大时，attention/MLP 参数量大致按 D² 增长；层数 L 则近似线性增长。增加 head 数但固定 D 不一定增加主要投影参数，只改变每个 head 的 d 和并行形状。',
          '比较 ReLU MLP 与 SwiGLU 时，不能直接使用相同中间宽度，因为 SwiGLU 有三组投影而普通 MLP 通常两组。公平实验应固定总参数、token、训练 FLOPs和数据顺序，并为两者合理调学习率。'
        ],
        formula: {
          label: '粗略参数量',
          expression: '每层 ≈ 4D² (attention) + 2D·D_ff (普通 MLP)',
          note: '忽略 bias、norm 与 embedding；SwiGLU 的 MLP 约为 3D·D_ff。'
        },
        callout: {
          type: 'warning',
          title: '不要只比最终 loss',
          text: '如果一个配置用了更多参数、token 或 FLOPs，它的更低 loss 不能证明组件本身更好。'
        }
      }
    ],
    takeaway: '现代 Transformer 是一组协同工作的稳定性与效率配方。理解每个组件的责任，比记住“标准答案”更重要。'
  },

  'lecture-04': {
    outcomes: [
      '能比较 full、local、linear 与 recurrent 路径',
      '能解释 GQA 为什么主要优化 decode',
      '能计算 MoE 的总参数与激活参数'
    ],
    sections: [
      {
        tag: '01 · Attention 取舍',
        title: 'O(T²) 不是唯一需要看的复杂度',
        body: [
          '标准 attention 生成 T×T 的 score，训练时计算和 activation 随 T² 增长，但具有高并行度。Local attention 把每个 token 的可见范围限制在窗口 w，复杂度降为 O(Tw)，代价是远距离信息要跨多层传播。',
          'Recurrent/SSM 路径能以固定大小状态进行 decode，但训练表达、状态压缩和硬件效率有不同取舍。判断方案时应分别比较训练并行性、prefill、单步 decode、状态大小和长距离能力。'
        ],
        compare: {
          headers: ['方案', '训练复杂度', 'Decode 状态', '主要取舍'],
          rows: [
            ['Full attention', 'O(T²)', 'KV 随 T 增长', '表达强，长序列昂贵'],
            ['Window attention', 'O(Tw)', '窗口 KV', '远距离传播变慢'],
            ['Linear attention', '近似 O(T)', '压缩状态', '近似/特征映射限制'],
            ['Recurrent/SSM', 'O(T)', '固定状态', '信息被压进有限状态']
          ]
        }
      },
      {
        tag: '02 · KV 优化',
        title: 'GQA 减少的是 K/V heads',
        body: [
          'Multi-head attention 为每个 query head 保留独立 K/V；Multi-query attention 让所有 query heads 共享一组 K/V；GQA 位于两者之间，让若干 query heads 共享一个 KV head。',
          '训练时 QKᵀ 的主要计算仍在，但服务 decode 时每个历史 token 需要保存和读取的 K/V 变少，因此 KV Cache 占用和 HBM 带宽明显下降。'
        ],
        formula: {
          label: '单层、单 token 的 KV 大小',
          expression: 'KV bytes = 2 × H_kv × d_head × bytes_per_element',
          note: '2 表示 K 和 V。GQA 通过减小 H_kv 线性降低缓存。'
        }
      },
      {
        tag: '03 · MoE',
        title: '容量大，不代表每个 token 都计算全部参数',
        body: [
          'MoE 通常替换 Transformer 的 dense MLP。Router 为每个 token 产生 expert 分数并选择 top-k；token 只经过被选中的 experts，再把输出加权组合。',
          '8 个同规模 experts、top-2 路由意味着 expert 总参数是单个 expert 的 8 倍，但每个 token 只激活约 2/8。真实速度还受 token dispatch、all-to-all、负载不均和 capacity drop 影响。'
        ],
        example: {
          title: '8 experts、top-2 的账',
          steps: [
            ['总容量', '存储 8 份 expert 参数'],
            ['激活计算', '每个 token 只运行 2 个 experts'],
            ['理论激活比例', '2 / 8 = 25%'],
            ['系统代价', 'Router + 跨设备 dispatch + 负载均衡']
          ]
        },
        callout: {
          type: 'warning',
          title: 'Expert imbalance',
          text: '热门 expert 决定整批延迟，冷门 expert 又学不到足够数据；辅助负载均衡损失是在质量和吞吐之间折中。'
        }
      }
    ],
    takeaway: '替代 attention 与 MoE 都是在移动成本，而不是消灭成本。必须把训练、prefill、decode、内存和通信分开比较。'
  },

  'lecture-05': {
    outcomes: [
      '能解释 GPU 的线程、warp、block 层级',
      '能画出 HBM 到 register 的数据路径',
      '能判断 coalescing、divergence 与 occupancy 问题'
    ],
    sections: [
      {
        tag: '01 · 硬件心智模型',
        title: 'GPU 用大量并发隐藏延迟',
        body: [
          'CPU 用复杂控制与大缓存优化少量线程的响应时间；GPU 用大量较简单的执行单元追求吞吐。线程按 warp 成组执行，多个 warp 组成 block，block 被调度到 SM。',
          '当一个 warp 等待内存时，SM 切换到另一个可运行 warp。前提是有足够 active warps；register 或 shared memory 使用过多会减少可驻留 block，降低 occupancy。'
        ],
        flow: [
          ['Grid', '一次 kernel 的全部工作'],
          ['Block', '共享 shared memory，可同步'],
          ['Warp', '同一指令执行的一组线程'],
          ['Thread', '处理一个或多个元素']
        ]
      },
      {
        tag: '02 · 数据移动',
        title: '越靠近计算单元，容量越小、速度越快',
        body: [
          'HBM 容量最大但访问最昂贵；L2 被全 GPU 共享；shared memory/register 位于片上，适合复用 tile。高性能矩阵乘会把 A/B 子块搬到片上，在写回前重复参与许多 FMA。',
          '相邻线程读取相邻地址时，硬件可以合并内存事务；跨步或随机访问会产生更多 transaction。Warp 内线程走不同分支时，两条路径通常被分别执行，造成 divergence。'
        ],
        compare: {
          headers: ['层级', '容量', '速度', '典型用途'],
          rows: [
            ['HBM', 'GB 级', '最慢', '模型权重、大张量'],
            ['L2 cache', 'MB 级', '较快', '跨 SM 复用'],
            ['Shared memory', '每 SM KB 级', '很快', '手工 tile'],
            ['Register', '每线程少量', '最快', '局部累加值']
          ]
        }
      },
      {
        tag: '03 · 快不快的判断',
        title: '峰值 FLOPs 只有在数据喂得上时才有意义',
        body: [
          'Tensor Core 对特定 dtype 和 tile shape 的矩阵乘加提供极高吞吐，但 shape 太小、未对齐或数据准备不足时无法接近峰值。Elementwise kernel 即使算式简单，也可能把时间花在 HBM 往返。',
          '多 GPU 还增加互联层级：节点内 NVLink 通常比 PCIe/节点间网络快。并行策略应让最频繁的通信留在最快的链路上。'
        ],
        callout: {
          type: 'insight',
          title: '优化问题的第一问',
          text: '算力在等数据，还是数据在等算力？Profiler 的 memory throughput、Tensor Core utilization 和 occupancy 能帮助回答。'
        }
      }
    ],
    takeaway: 'GPU 优化的中心是数据复用和并发。只有理解内存层级与执行层级，才能解释相同 FLOPs 为什么速度差很多。'
  },

  'lecture-06': {
    outcomes: [
      '能写出可信的 GPU benchmark',
      '能从 profiler 找到主要瓶颈',
      '能解释 Triton tiling、mask 与 fusion'
    ],
    sections: [
      {
        tag: '01 · 测量',
        title: '异步 GPU 让朴素计时失真',
        body: [
          'PyTorch 发出 CUDA kernel 后通常立即返回，CPU 计时可能只覆盖 launch，而不是执行。首次运行还可能包含 JIT、allocator 与 cache 冷启动，因此需要 warm-up 和显式同步。',
          '可信 benchmark 必须固定硬件、shape、dtype、软件版本与输入分布，并报告中位数/分位数，而不是挑一次最快结果。'
        ],
        code: {
          language: 'python',
          title: 'CUDA event 计时骨架',
          content: [
            'for _ in range(10):',
            '    fn(x)                     # warm-up',
            'torch.cuda.synchronize()',
            'start.record(); fn(x); end.record()',
            'end.synchronize()',
            'milliseconds = start.elapsed_time(end)'
          ].join('\n')
        }
      },
      {
        tag: '02 · Triton',
        title: '一个 program instance 负责一个 tile',
        body: [
          'Triton 不是为每个 scalar 写一个线程，而是让一个 program 处理一块数据。`program_id` 决定当前 tile，offsets 生成该 tile 的地址；最后一个 tile 超出真实长度的部分用 mask 屏蔽。',
          'Matmul tile 把 A/B 子块加载到片上，多次参与 dot，再写回 C。Tile 过小复用不足、launch 多；过大则增加 register/shared memory 压力并降低 occupancy。'
        ],
        code: {
          language: 'python',
          title: '向量 kernel 的地址模式',
          content: [
            'pid = tl.program_id(0)',
            'offsets = pid * BLOCK_SIZE + tl.arange(0, BLOCK_SIZE)',
            'mask = offsets < n_elements',
            'x = tl.load(x_ptr + offsets, mask=mask)',
            'tl.store(y_ptr + offsets, activation(x), mask=mask)'
          ].join('\n')
        }
      },
      {
        tag: '03 · Fusion',
        title: '少写回一次 HBM，可能比少做一点计算更重要',
        body: [
          '独立的 bias add 与 GELU kernel 会先读 x/bias、写中间结果，再读中间结果并写输出。Fused kernel 一次读取后在 register 中完成两步，只写最终输出。',
          'Fusion 并非越多越好：过大的 kernel 可能增加 register pressure、减少 occupancy，还会失去库中高度优化的矩阵乘。应通过 profiler 验证端到端收益。'
        ],
        compare: {
          headers: ['实现', 'Kernel launches', '中间张量 HBM 往返'],
          rows: [
            ['Bias → GELU', '2', '写 1 次 + 读 1 次'],
            ['Fused bias + GELU', '1', '0 次']
          ]
        }
      }
    ],
    takeaway: '优化是测量闭环：benchmark → profile → 建立假设 → 修改 → 再测。Triton 的价值是让你显式控制 tile 与数据移动。'
  },

  'lecture-07': {
    outcomes: [
      '能解释五种常见 collective',
      '能写出 global batch 的计算公式',
      '能说明 DDP 如何把通信藏在 backward 中'
    ],
    sections: [
      {
        tag: '01 · Data Parallel',
        title: 'DDP 复制模型，切分数据',
        body: [
          '每个 rank 保存完整参数，处理不同 micro-batch。Backward 得到本地梯度后通过 all-reduce 求和/平均，因此所有 rank 执行相同 optimizer step 并保持参数一致。',
          'DDP 扩大吞吐，但不切分参数、梯度和 optimizer state，所以不能解决单卡放不下模型的问题。Global batch 变化还会影响优化动态，不能把更多 GPU 只当作系统参数。'
        ],
        formula: {
          label: 'Global batch',
          expression: 'global_batch = micro_batch × world_size × accumulation_steps',
          note: '若保持 global batch 不变，增加 GPU 时通常要相应减小 micro-batch 或 accumulation。'
        }
      },
      {
        tag: '02 · Collectives',
        title: '分布式通信的五块积木',
        body: [
          'Collective 描述一组 rank 如何协同移动/归约数据。All-reduce 可以理解为 reduce-scatter 后接 all-gather；Ring 实现让每个 rank 分块发送，避免单个中心节点成为瓶颈。',
          '通信时间可粗略看作 latency × 消息轮数 + bytes / bandwidth。很多小 tensor 会被 latency 主导，因此框架通常把梯度放进较大的 bucket。'
        ],
        compare: {
          headers: ['Collective', '结束后每个 rank 拥有什么', '常见用途'],
          rows: [
            ['Broadcast', '同一份源数据', '分发参数/配置'],
            ['Reduce', '仅目标 rank 有归约结果', '集中统计'],
            ['All-reduce', '都有完整归约结果', 'DDP 梯度'],
            ['All-gather', '都有全部分片', '临时重建参数'],
            ['Reduce-scatter', '各有归约后的分片', 'FSDP 梯度']
          ]
        }
      },
      {
        tag: '03 · Overlap',
        title: 'Backward 一边算，梯度一边传',
        body: [
          '反向传播从后层向前层进行。某个 bucket 的梯度全部准备好后，可以立即异步 all-reduce，而前面层的 backward 仍在计算；理想情况下通信被计算覆盖。',
          'Bucket 太小会增加 launch/latency，太大又要等更多梯度才能开始；慢 rank、网络抖动和不均衡计算会形成 straggler，让所有 rank 在同步点等待。'
        ],
        flow: [
          ['Backward Lₙ', '计算最后几层梯度'],
          ['Bucket ready', '异步 all-reduce'],
          ['Backward Lₙ₋₁', '与通信重叠'],
          ['All buckets done', 'optimizer step']
        ]
      }
    ],
    takeaway: 'DDP 的数学核心是平均梯度，系统核心是把 all-reduce 切成合适 bucket 并与 backward 重叠。'
  },

  'lecture-08': {
    outcomes: [
      '能区分 FSDP、TP、PP 与 sequence parallel',
      '能解释 all-gather/reduce-scatter 的时机',
      '能按网络拓扑组合并行维度'
    ],
    sections: [
      {
        tag: '01 · 状态分片',
        title: 'FSDP 用通信换每卡显存',
        body: [
          'FSDP/ZeRO 将参数、梯度和 optimizer state 分片保存。计算某一层前，各 rank all-gather 当前层参数；反向完成后用 reduce-scatter 聚合并重新留下各自分片。',
          '峰值显存除了长期 shard，还包括当前临时 gathered 参数与 activation。Prefetch 可以把下一层参数通信藏在当前层计算后面，但过度 prefetch 会抬高峰值显存。'
        ],
        flow: [
          ['Shard state', '每卡长期只存 1/N'],
          ['All-gather', '临时重建当前层参数'],
          ['Forward / Backward', '本地计算'],
          ['Reduce-scatter', '聚合并留下梯度分片']
        ]
      },
      {
        tag: '02 · 模型并行',
        title: 'TP 切一层，PP 切层，SP 切 activation',
        body: [
          'Tensor Parallel 把同一矩阵乘的列或行分到多卡，层内通信频繁，适合节点内高速互联。Pipeline Parallel 把连续层分成 stages，用 micro-batches 填流水线；stage 闲置时间形成 bubble。',
          'Sequence/activation parallel 沿序列或非 TP 维分 activation，长上下文时尤其有用。它们可以与 DP/FSDP 组合形成多维并行。'
        ],
        compare: {
          headers: ['策略', '切分对象', '通信频率', '主要解决'],
          rows: [
            ['FSDP', '模型状态', '按层 gather/scatter', '状态显存'],
            ['TP', '单层矩阵', '几乎每层', '单层过大'],
            ['PP', '连续层', 'stage 边界', '整模过大'],
            ['SP', 'Activation 序列维', '层内', '长上下文显存']
          ]
        }
      },
      {
        tag: '03 · 组合策略',
        title: '让高频通信走最快的链路',
        body: [
          '典型集群节点内有 NVLink，节点间网络更慢。因此通信非常频繁的 TP 常放在同一节点；DP/FSDP 可以跨节点，因为通信更容易 bucket/overlap。',
          'Pipeline 的 bubble 近似随 stage 数增加、随 micro-batch 数减少而变大；但 micro-batch 太多会增加调度开销或改变有效 batch。最优方案必须结合模型 shape 和拓扑实测。'
        ],
        formula: {
          label: '简化的 pipeline bubble 比例',
          expression: 'bubble ≈ (stages - 1) / (micro_batches + stages - 1)',
          note: '是直觉近似；实际还受 forward/backward 调度与 stage 不均衡影响。'
        },
        callout: {
          type: 'warning',
          title: '切得更碎不一定更快',
          text: '分片减少单卡工作，但会产生更多小消息、同步和低效 kernel。并行度首先受显存约束，其次才是吞吐优化。'
        }
      }
    ],
    takeaway: '并行训练是在显存、计算粒度和通信之间做拓扑感知的分配。没有脱离网络结构的“最佳并行方案”。'
  },

  'lecture-09': {
    outcomes: [
      '能读懂 log-log 坐标下的 power law',
      '能用 C≈6ND 比较训练配置',
      '能解释 ISOFLOP 如何寻找 compute-optimal 点'
    ],
    sections: [
      {
        tag: '01 · Power law',
        title: 'Scaling law 把昂贵训练变成预测问题',
        body: [
          '经验上，验证损失与参数量、数据量或计算量常在一定区间呈幂律。幂律在 log-log 坐标下近似直线，因此可用多个小 run 拟合指数，再预测更大预算。',
          '外推有效的前提是模型、数据、optimizer 与训练 recipe 仍处在相同 regime。架构变化、数据重复、训练不稳定或小模型未进入渐近区都会让曲线折弯。'
        ],
        formula: {
          label: '一种常见形式',
          expression: 'L(C) = L∞ + A · C^(-α)',
          note: 'L∞ 是不可约损失，A 与 α 由实验拟合；不要用极少规模点盲目外推多个数量级。'
        }
      },
      {
        tag: '02 · Compute-optimal',
        title: '固定计算预算时，模型与数据要平衡',
        body: [
          'Transformer 训练 FLOPs 常粗略估为 C≈6ND：N 是非 embedding 参数量，D 是训练 token 数。固定 C 时，N 过大意味着每个参数看到的 token 太少；N 过小则容量限制更强。',
          'ISOFLOP 在多个固定 C 下训练不同 N/D 配置，找到每条曲线的最低 loss 点，再拟合 N_opt(C) 与 D_opt(C)。它不是凭一条公式直接决定配置，而是一套实验程序。'
        ],
        example: {
          title: '同为 6×10¹⁸ FLOPs',
          steps: [
            ['配置 A', 'N=1B，D=1B tokens'],
            ['配置 B', 'N=0.5B，D=2B tokens'],
            ['计算', '两者 6ND 都约为 6×10¹⁸'],
            ['结论', '计算相同但 loss 未必相同；需要 ISOFLOP 实验找最低点']
          ]
        }
      },
      {
        tag: '03 · 实验流程',
        title: '好的 scaling 实验重视稳定，而不是英雄 run',
        body: [
          '先选多个相隔合理倍数的 compute budgets，每个预算覆盖最低点两侧的 N/D；固定 tokenizer、数据 mixture、architecture family 和训练规则，并保存失败 run。',
          '拟合后检查 residual：如果误差随规模系统性偏正或偏负，说明单一幂律遗漏了结构。预测还应给区间而不是单点，并保留一部分规模作为 held-out 验证。'
        ],
        flow: [
          ['Design', '预算 × N/D 网格'],
          ['Run', '固定 recipe，记录失败'],
          ['Fit', 'log-space 曲线与不确定性'],
          ['Validate', 'held-out 规模检查'],
          ['Extrapolate', '给预测区间']
        ]
      }
    ],
    takeaway: 'Scaling law 的价值是规划实验与预算，不是宣称“更大一定更好”。曲线可信度来自可比 run、残差检查和克制外推。'
  },

  'lecture-10': {
    outcomes: [
      '能区分 prefill 与 decode 的瓶颈',
      '能计算单请求 KV Cache 大小',
      '能解释 continuous batching 与 speculative decoding'
    ],
    sections: [
      {
        tag: '01 · 两个阶段',
        title: 'Prefill 与 decode 是两种不同工作负载',
        body: [
          'Prefill 一次处理整个 prompt，矩阵维度较大、并行度高，通常更容易利用 Tensor Core；它决定 TTFT 的主要部分。Decode 每步只产生一个 token，矩阵的 batch/token 维较小，却要反复读取模型权重与历史 KV，通常 memory-bound。',
          '因此一个平均 tokens/s 会掩盖体验：服务需要分别报告 TTFT、TPOT/ITL、端到端延迟、吞吐和各自分位数。'
        ],
        compare: {
          headers: ['阶段', '一次处理', '常见瓶颈', '关键指标'],
          rows: [
            ['Prefill', '全部 prompt tokens', '计算/长 prompt', 'TTFT'],
            ['Decode', '每请求 1 个新 token', '权重与 KV 带宽', 'TPOT / ITL']
          ]
        }
      },
      {
        tag: '02 · KV Cache',
        title: '用显存保存历史，避免重复计算',
        body: [
          '每层保存所有历史 token 的 K/V。生成第 t 个 token 时，只需计算新 token 的 Q/K/V，再让 Q 与缓存 K 做 attention；历史 token 不需要重新投影。',
          '缓存随 layer、KV heads、head dimension、sequence length、batch 和 dtype 线性增长。GQA/MLA、KV 量化和 paged allocation 分别减少每 token 大小、字节数和碎片。'
        ],
        formula: {
          label: '单请求 KV Cache',
          expression: 'bytes = 2 × L × T × H_kv × d_head × bytes_per_element',
          note: '2 表示 K 与 V。Batch 多请求时再乘对应序列的数量与长度。'
        },
        example: {
          title: '32 层、8 KV heads、head_dim 128、bf16、8K context',
          steps: [
            ['每 token 每层', '2 × 8 × 128 × 2 B = 4096 B'],
            ['全部层', '4096 × 32 = 128 KiB/token'],
            ['8K tokens', '约 1 GiB / request'],
            ['含义', '并发数很快受到 KV 显存限制']
          ]
        }
      },
      {
        tag: '03 · Serving',
        title: '调度与解码算法共同决定服务效率',
        body: [
          'Continuous batching 在每个 decode step 重新组合活跃请求，已完成的请求立刻释放槽位，新请求可以加入；Paged KV 把逻辑连续序列映射到固定页，减少大块预留和碎片。',
          'Speculative decoding 让小 draft model 一次提出多个 token，再由目标模型并行验证。接受率高时能减少目标模型的串行 decode steps；如果 draft 太慢或分布差异大，收益会消失。'
        ],
        callout: {
          type: 'warning',
          title: '吞吐与延迟冲突',
          text: '增大 batch 通常提高 GPU 利用率和总吞吐，但排队与每步工作量增加，单请求 TTFT/TPOT 可能变差。'
        }
      }
    ],
    takeaway: '推理优化必须把 prefill、decode、KV 显存和调度分开看。服务系统的目标是满足延迟 SLO 下的最大吞吐。'
  },

  'lecture-11': {
    outcomes: [
      '能设计可复现的 scaling run 矩阵',
      '能通过 residual 发现拟合失效',
      '能解释超参数 transfer 的目标与限制'
    ],
    sections: [
      {
        tag: '01 · 可比性',
        title: 'Scaling 最难的是让不同规模仍是同一个实验',
        body: [
          '模型变大时，最优 batch、学习率、warmup、weight decay 和训练稳定性可能一起变化。如果每个规模随意调参，曲线混入“规模效应”和“调参质量”；如果完全不调，又可能让大模型被不合适的 recipe 拖累。',
          '实验表应记录 code commit、数据版本与顺序、tokenizer、seed、硬件、有效 batch、optimizer、峰值学习率、失败原因和最终/最佳验证 loss。失败 run 不能悄悄删掉。'
        ],
        compare: {
          headers: ['必须固定/追踪', '原因'],
          rows: [
            ['Architecture family', '避免组件变化造成 regime shift'],
            ['Data mixture/tokenizer', 'loss 与 token 粒度、分布相关'],
            ['Optimizer schedule', '规模改变最优更新尺度'],
            ['失败与重跑规则', '防止选择性报告']
          ]
        }
      },
      {
        tag: '02 · 拟合诊断',
        title: 'R² 很高，也可能系统性预测错',
        body: [
          '在跨数量级数据中，大体趋势就能产生很高 R²。更重要的是画 residual 对 log(C)：如果小规模持续高估、大规模持续低估，说明曲线弯曲或存在分段 regime。',
          '还要比较不同 loss space、权重与 outlier 规则，并用 bootstrap 或重复 run 估计预测区间。Held-out 大规模点比训练集内拟合更能检验外推。'
        ],
        flow: [
          ['Fit', '得到参数与预测'],
          ['Residual', '寻找系统性弯曲'],
          ['Sensitivity', '更换拟合权重/区间'],
          ['Hold-out', '验证真正的外推']
        ]
      },
      {
        tag: '03 · Hyperparameter transfer',
        title: '目标是让宽度变化时更新尺度保持可比',
        body: [
          'μP 一类方法通过特定参数化和学习率缩放，让小模型调出的超参数更容易迁移到更宽模型。它试图保持 activation、初始化和更新的尺度规律，而不是保证所有架构与数据都无需再调参。',
          '另一条实用路线是直接在多个规模估计最优 batch/LR 的 scaling 关系。无论哪种方法，都需要在目标规模附近验证，不能把 transfer 当作定理。'
        ],
        callout: {
          type: 'insight',
          title: '最终决策不只看训练 loss',
          text: '生命周期成本还包含数据、工程时间、推理价格和风险。Compute-optimal 训练配置未必是产品成本最优配置。'
        }
      }
    ],
    takeaway: '实用 scaling 的核心是实验治理：统一 recipe、记录异常、检查残差和预测区间，再把 loss 转换为真实成本决策。'
  },

  'lecture-12': {
    outcomes: [
      '能为不同目标选择正确评测信号',
      '能写出可复现的 benchmark protocol',
      '能识别污染、抽取与 judge 偏差'
    ],
    sections: [
      {
        tag: '01 · 测量对象',
        title: '先定义“好”是什么，再选择 benchmark',
        body: [
          'Perplexity 测模型对 token 序列的概率预测，适合相同 tokenizer 与数据分布下比较 base model；它不直接等价于对话帮助性、代码 Agent 成功率或安全性。',
          '评测应从用户任务出发拆成 capability、reliability、cost、latency 和 safety。单一平均分会掩盖某类用户或关键风险的退化。'
        ],
        formula: {
          label: 'Token perplexity',
          expression: 'PPL = exp( - (1/T) Σₜ log p(xₜ | x<ₜ) )',
          note: 'Tokenizer 改变 T 与 token 定义，因此不同 tokenizer 的数字通常不能直接横比。'
        }
      },
      {
        tag: '02 · Protocol',
        title: '题集相同，不代表评测相同',
        body: [
          'Zero-shot、few-shot、CoT、采样温度、最大 token、工具权限和答案抽取都会改变结果。可靠报告必须绑定模型 revision、prompt、system message、解码参数、scorer 与数据版本。',
          '对 Agent 不应只看最终答案：还要检查工具选择、参数、步数、错误恢复、费用和副作用。失败应按类型分桶，才能知道要修模型、提示、工具还是控制器。'
        ],
        example: {
          title: '代码 Agent 的最小评测卡',
          steps: [
            ['任务成功', '测试是否通过、需求是否满足'],
            ['轨迹质量', '工具和参数是否正确'],
            ['效率', 'token、调用次数、延迟、成本'],
            ['安全', '是否执行未授权或破坏性动作'],
            ['版本', 'model/prompt/tools/dataset/scorer']
          ]
        }
      },
      {
        tag: '03 · 常见陷阱',
        title: 'Benchmark 也会被过拟合',
        body: [
          '公开题进入训练数据会造成 contamination；反复根据测试集改模型，即使没有直接训练，也会形成开发集过拟合。应保留私有/新鲜集，并按数据时间与相似度审计。',
          'LLM judge 会受答案顺序、长度、风格和自我偏好影响。Pairwise 判断可交换 A/B 顺序，rubric 要有明确等级锚点，并与人工样本校准。'
        ],
        compare: {
          headers: ['陷阱', '检测方法'],
          rows: [
            ['Position bias', 'A/B 与 B/A 双向判断'],
            ['Verbosity bias', '控制长度或单独评分信息密度'],
            ['污染', 'n-gram/语义匹配 + 时间切分'],
            ['高方差', '重复采样并报告置信区间']
          ]
        }
      }
    ],
    takeaway: '评测是一个带版本的测量系统，不是一张排行榜。先定义构念和 protocol，再解释分数。'
  },

  'lecture-13': {
    outcomes: [
      '能区分原始来源、抓取结果和训练数据集',
      '能设计可追踪的 provenance 记录',
      '能从能力、许可与隐私共同评估数据源'
    ],
    sections: [
      {
        tag: '01 · 数据来源',
        title: 'Common Crawl 是原料，不是可直接训练的数据集',
        body: [
          '网页、代码、论文、书籍和对话数据具有不同格式、质量、许可与时间分布。Common Crawl 规模大，但含导航模板、广告、重复、机器生成垃圾和错误语言；GitHub 代码还涉及 license、generated files 与 secrets。',
          '数据 mixture 会改变模型能力：代码、数学、多语和专业领域在固定 token budget 中互相竞争。采集策略本身就是模型设计。'
        ],
        compare: {
          headers: ['来源', '优势', '主要风险'],
          rows: [
            ['Web', '覆盖广、规模大', '噪声、重复、许可/隐私'],
            ['GitHub', '真实代码与文档', 'license、secret、生成文件'],
            ['arXiv', '高密度技术文本', '格式解析、领域偏差'],
            ['Wikipedia', '结构和质量较稳', '覆盖有限、风格单一']
          ]
        }
      },
      {
        tag: '02 · Provenance',
        title: '每条样本要能回答“从哪来、经历了什么”',
        body: [
          'Provenance 不只保存 URL。还应记录抓取时间、内容 hash、来源许可/策略、处理 pipeline 版本、过滤原因和输出 shard。这样才能复现数据、响应删除请求并定位异常。',
          '内容变换应尽量可审计：raw object 保留受控副本，规范化/过滤产物用稳定 ID 关联；训练 manifest 再列出实际使用的 shard 与权重。'
        ],
        code: {
          language: 'json',
          title: '一条最小 provenance 记录',
          content: [
            '{',
            '  "doc_id": "sha256:...",',
            '  "source": "common-crawl",',
            '  "url": "https://example.com/page",',
            '  "fetched_at": "2026-04-01T00:00:00Z",',
            '  "pipeline_version": "data-v12",',
            '  "license_bucket": "review",',
            '  "transforms": ["html_extract", "lang_en", "dedup"]',
            '}'
          ].join('\n')
        }
      },
      {
        tag: '03 · 审计',
        title: '大规模统计不能替代人工抽样',
        body: [
          '长度、语言、困惑度和分类器分数只能描述代理信号。随机抽样能发现 boilerplate、编码错误、PII、错误语言和规则意外；按 source/score 分层抽样还能检查尾部。',
          '“公开访问”不自动等于允许训练。Terms of Service、版权许可、隐私、敏感群体与司法辖区需要单独治理，并且政策要落实为可执行过滤和删除流程。'
        ],
        callout: {
          type: 'warning',
          title: '先决定能不能用，再讨论好不好用',
          text: '质量过滤不能替代法律与隐私审查；高质量但无权使用的数据仍然不应进入训练 manifest。'
        }
      }
    ],
    takeaway: '数据管线的第一层能力是可追踪。没有 provenance，就无法可靠复现、审计、删除或解释模型行为。'
  },

  'lecture-14': {
    outcomes: [
      '能画出 raw HTML 到 token shard 的流水线',
      '能比较 exact 与 near dedup',
      '能设计过滤和 mixture 的 ablation'
    ],
    sections: [
      {
        tag: '01 · 清洗流水线',
        title: '每一步都可能改变数据分布',
        body: [
          '典型流程是解析 → 规范化 → 语言识别 → 质量/安全过滤 → 去重 → mixture 采样 → tokenizer/sharding。顺序会影响结果：例如先规范化可提高 exact dedup 命中，但过度规范化也可能把不同代码变成相同文本。',
          '过滤器有 precision/recall 取舍。阈值过严会删除少数语言、短问答或代码等有价值样本；阈值过松则把垃圾带进训练。必须看保留率、分桶样本和下游小模型 ablation。'
        ],
        flow: [
          ['Parse', 'HTML → 主体文本/元数据'],
          ['Normalize', '编码、空白、模板处理'],
          ['Filter', '语言、质量、安全、许可'],
          ['Dedup', 'exact + near duplicate'],
          ['Mix & shard', '按目标权重采样并 tokenize']
        ]
      },
      {
        tag: '02 · 去重',
        title: 'Exact hash 找相同，MinHash 找相似',
        body: [
          'Exact hash 对完全相同的规范化文档很有效，但一个标点或模板变化就会漏掉。Near dedup 把文档表示为 n-gram shingles 集合，用 Jaccard 相似度衡量重叠。',
          'MinHash 用多个哈希函数近似 Jaccard，LSH 再把可能相似的文档放到同一候选桶，避免所有文档两两比较。阈值和 shingle 大小决定 precision/recall。'
        ],
        formula: {
          label: 'Jaccard similarity',
          expression: 'J(A,B) = |A ∩ B| / |A ∪ B|',
          note: 'A/B 是两个文档的 shingle 集合；越接近 1 表示越相似。'
        },
        compare: {
          headers: ['方法', '能发现', '会漏掉'],
          rows: [
            ['URL dedup', '重复抓取同 URL', '镜像/参数变化'],
            ['Exact hash', '内容完全相同', '轻微编辑'],
            ['MinHash + LSH', '大段近似重复', '语义相同但表述不同']
          ]
        }
      },
      {
        tag: '03 · Mixture 与合成数据',
        title: '按原始体量采样，通常不是理想训练分布',
        body: [
          '高质量数学或代码语料可能远小于普通网页，需要上采样；但重复过多会过拟合。Mixture 权重应通过小模型实验，看各 domain validation loss 与目标 benchmark 的 Pareto 变化。',
          '合成数据可控制格式和难度，也可能复制 teacher 错误、风格与模式坍缩。需要 verifier、去重、多样性检查，并限制与真实数据的比例。'
        ],
        callout: {
          type: 'insight',
          title: '过滤器本身也是模型',
          text: '规则/分类器定义了“什么值得学习”。它的偏差会以数据分布的形式进入最终语言模型。'
        }
      }
    ],
    takeaway: '清洗、去重和 mixture 不是独立杂务，而是共同定义模型看到的世界。每个阈值都要通过样本审计与下游实验验证。'
  },

  'lecture-15': {
    outcomes: [
      '能解释 SFT 的序列化与 loss mask',
      '能画出经典 RLHF 的数据/模型流',
      '能说明 DPO 与 reward model 的差异'
    ],
    sections: [
      {
        tag: '01 · SFT',
        title: '让 next-token model 学会按对话协议回答',
        body: [
          'SFT 把 system/user/assistant 对话按 chat template 序列化，再用 teacher forcing 预测目标 token。特殊 token、角色边界和训练/推理模板必须一致，否则模型会学到错误协议。',
          '常见 response-only loss 只在 assistant token 上计算，user/system 位置 mask 为 -100。这样上下文仍参与 attention，但不要求模型模仿用户文本。'
        ],
        code: {
          language: 'text',
          title: '两轮对话与 loss mask',
          content: [
            '<system> You are helpful.        mask: off',
            '<user> 2+2?                      mask: off',
            '<assistant> 4                    mask: ON',
            '<user> why?                      mask: off',
            '<assistant> two pairs make four  mask: ON'
          ].join('\n')
        }
      },
      {
        tag: '02 · RLHF',
        title: '偏好是代理目标，不是真实质量本身',
        body: [
          '经典流程先用示范数据做 SFT，再对同一 prompt 的多个回答收集排序，训练 reward model 输出标量；最后用 PPO 等方法最大化 reward，同时用 KL 限制 policy 偏离 reference。',
          '标注者群体、rubric、答案长度和界面都会塑造 reward。Reward 上升但事实性、校准或多样性下降，可能意味着过优化或 reward hacking。'
        ],
        flow: [
          ['Demonstrations', '训练 SFT policy'],
          ['Comparisons', 'chosen vs rejected'],
          ['Reward model', '学习偏好标量'],
          ['Policy optimization', 'reward - KL penalty'],
          ['Independent eval', '验证真实目标']
        ]
      },
      {
        tag: '03 · DPO',
        title: '直接学习 chosen 相对 rejected 的概率差',
        body: [
          'DPO 不单独训练 reward model，也不运行在线 PPO。它比较 policy 与 reference 对 chosen/rejected 的 log-prob margin，让 policy 比 reference 更偏向 chosen。',
          'DPO 工程更简单，但并没有消除数据问题：偏好对仍可能含噪、只反映风格，或覆盖不了部署分布。β 控制偏好拟合与贴近 reference 的权衡。'
        ],
        formula: {
          label: 'DPO 的核心 margin（直觉式）',
          expression: 'Δ = [logπ(y⁺|x)-logπ(y⁻|x)] - [logπref(y⁺|x)-logπref(y⁻|x)]',
          note: 'Loss 鼓励 Δ 为正；reference margin 提供“不要无限漂移”的基线。'
        },
        callout: {
          type: 'warning',
          title: '更讨喜不等于更真实',
          text: '偏好优化会放大标注规则中的价值判断和偏差，必须用独立 factuality、safety 与 calibration 评测约束。'
        }
      }
    ],
    takeaway: 'Post-training 把“会续写”改造成“按协议帮助用户”。SFT 定义基本行为，偏好优化调整取舍，但代理奖励必须由独立评测约束。'
  },

  'lecture-16': {
    outcomes: [
      '能区分 RLVR 与主观 reward model',
      '能手算 group-normalized advantage',
      '能设计不易被投机的 verifier'
    ],
    sections: [
      {
        tag: '01 · 可验证奖励',
        title: '把结果交给程序检查',
        body: [
          'RLVR 适合数学答案、代码测试、形式证明等能自动判断的任务。相比主观 reward model，verifier 更便宜、一致，但通常只看最终结果，奖励稀疏且可能存在漏洞。',
          '好的 verifier 要检查真正目标，而非表面格式。代码只跑公开测试会鼓励 hard-code；数学只匹配最后字符串可能被格式或解析漏洞利用。'
        ],
        compare: {
          headers: ['任务', 'Verifier', '潜在漏洞'],
          rows: [
            ['数学', '标准化最终答案', '等价形式解析错误'],
            ['代码', '隔离沙箱单元测试', '隐藏 case 不足、超时副作用'],
            ['Agent', '环境状态与约束', '通过越权动作达成目标']
          ]
        }
      },
      {
        tag: '02 · Policy gradient',
        title: '奖励告诉模型哪些采样轨迹更值得增加概率',
        body: [
          'Policy gradient 用 advantage 加权采样 token 的 log-prob gradient。正 advantage 提高该轨迹概率，负 advantage 降低。Baseline 不改变期望方向，但能降低方差。',
          '常见 GRPO 对同一 prompt 采样一组回答，用组内 reward 均值和标准差归一化，省去单独 value model。课程也特别指出：样本相关的标准差缩放并不是保持无偏的合法 baseline，会改变梯度估计；它是实用算法选择，不是无偏 policy-gradient 定理。'
        ],
        formula: {
          label: 'Group-normalized advantage',
          expression: 'Aᵢ = (rᵢ - mean(r₁…rG)) / (std(r₁…rG) + ε)',
          note: '若组内 reward 全相同，几乎没有相对学习信号；标准差归一化还会引入课程讨论的 bias。'
        },
        example: {
          title: 'Rewards = [1, 1, 0, 0]',
          steps: [
            ['Mean', '0.5'],
            ['Std', '约 0.5'],
            ['Advantages', '[+1, +1, -1, -1]（忽略 ε）'],
            ['更新直觉', '提高前两个回答轨迹，压低后两个']
          ]
        }
      },
      {
        tag: '03 · 稳定与监控',
        title: 'Reward 曲线不是最终成绩单',
        body: [
          'Clipping/KL 限制 policy 单次漂移，避免稀疏奖励驱动模型迅速牺牲语言质量。生成长度也必须监控，因为更长轨迹可能获得更多尝试机会或利用 verifier。',
          '面板应同时观察 reward、真实准确率、长度、格式失败、KL、entropy/diversity 和不同难度分桶。Reward 升而独立准确率不升，是优先调查的分离信号。'
        ],
        callout: {
          type: 'warning',
          title: 'Verifier hacking',
          text: '只要奖励规则与真实目标之间有缝隙，足够强的 policy 就可能找到它。训练前先攻击 verifier，训练中持续保存高奖励失败案例。'
        }
      }
    ],
    takeaway: 'RLVR 用可靠结果信号探索 reasoning，但不会自动保证正确过程。Verifier 设计、policy 漂移控制和独立评测缺一不可。'
  },

  'lecture-17': {
    outcomes: [
      '能计算图像/视频 token 数',
      '能比较 projector、cross-attention 与统一 token',
      '能画出多模态理解和生成链路'
    ],
    sections: [
      {
        tag: '01 · 连续信号变 token',
        title: '多模态模型首先要解决表示接口',
        body: [
          '文本天然是一维离散序列；图像是二维像素，音频/视频还带时间。Vision encoder 常把图像切 patch，将每个 patch 映射成向量，再通过 projector 对齐到 LLM hidden dimension。',
          'Patch 越小，保留细节越多，但 token 数按边长平方增长。视频再乘帧数，很快超过文本上下文，因此需要 spatial/temporal pooling、帧采样或 resampler。'
        ],
        formula: {
          label: '图像 patch token 数',
          expression: 'tokens = (H / patch_h) × (W / patch_w)',
          note: '224×224 图像、16×16 patch 得到 14×14=196 tokens；14×14 patch 得到 16×16=256 tokens。'
        },
        example: {
          title: '10 秒视频的 token 膨胀',
          steps: [
            ['采样', '2 fps → 20 帧'],
            ['每帧', '196 visual tokens'],
            ['总计', '20 × 196 = 3920 tokens'],
            ['还未包含', '文本 prompt、音频与模型输出']
          ]
        }
      },
      {
        tag: '02 · 融合结构',
        title: '让模态交互的位置决定成本与表达',
        body: [
          '最简单方案是 encoder + projector，把视觉 token 当作前缀送入 LLM；Cross-attention 让文本层按需读取独立视觉表示；统一 token space 则追求所有模态共同自回归。',
          'Early fusion 交互充分，但序列长、attention 昂贵；更晚的融合模块化且可复用 encoder，但跨模态细粒度推理可能受限。'
        ],
        compare: {
          headers: ['方案', '优点', '代价'],
          rows: [
            ['Projector + LLM', '结构简单、复用 LLM', '视觉 token 占上下文'],
            ['Cross-attention', '按需读取模态表示', '新增模块与训练复杂度'],
            ['Unified tokens', '统一理解与生成接口', 'tokenizer/数据/计算都更难']
          ]
        }
      },
      {
        tag: '03 · 训练链路',
        title: '先对齐表示，再学习按指令使用模态',
        body: [
          '常见流程先冻结或部分冻结 backbone，用图文对学习 projector/connector；之后用多模态 instruction data 训练问答、定位和推理。生成图像/音频还需要输出 tokenizer 与 decoder，不能只靠输入 encoder。',
          '多模态评测要区分识别、定位、关系、OCR、时序与幻觉。模型语言很流畅，仍可能没有正确引用图像证据。'
        ],
        flow: [
          ['Raw modality', 'pixels / waveform / frames'],
          ['Encoder', '压缩为 modality features'],
          ['Projector / Fusion', '对齐 LLM hidden space'],
          ['LLM', '联合理解与推理'],
          ['Text head / Decoder', '文本或其他模态输出']
        ],
        callout: {
          type: 'insight',
          title: '统一的是接口，不是信息结构',
          text: '即使最终都表示成 token，图像的二维关系和视频的时间关系仍需要位置编码、采样与专门评测。'
        }
      }
    ],
    takeaway: '多模态的核心是以可承受的 token 预算保留关键信息，并选择足够强的融合方式让语言模型真正使用这些证据。'
  }
};
