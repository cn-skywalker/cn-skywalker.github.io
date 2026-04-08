---
title: 'Torquato《Random Heterogeneous Materials》阅读计划——CLS解析解方向'
date: 2026-04-08
permalink: /posts/2026/08/Torquato-reading-plan-CLS/
tags:
  - 随机介质
  - Torquato
  - CLS
  - 弦长抽样
  - 阅读计划
categories:
  - 学习笔记
---

# Torquato《Random Heterogeneous Materials》阅读计划

**目标**：理解Torquato体系。


---

## 第一优先级：直接提供解析公式的章节

### Chapter 5: Monodisperse Spheres (p119–158) — 最核心章节

**5.2 Totally Impenetrable Spheres (p129–153)**：硬球（不可穿透球）的全部统计量解析结果，与论文 RSA 硬球体系完全对应。

| 小节 | 内容 | 与论文关系 |
|------|------|-----------|
| 5.2.4 Chord-Length Density Function (p137) | 硬球**弦长密度函数**解析解 | 直接对应 CLS 核心量 |
| 5.2.5 Nearest-Neighbor Functions (p139–151) | 硬球**最近邻分布**解析解 | 替代 NND 数值统计 |
| 5.2.3 Lineal-Path Function (p136) | 硬球 lineal-path 解析解 | 与弦长分布互补的几何描述 |
| 5.2.1 n-Point Probability Functions (p130–134) | 两点概率函数 | 推导弦长分布的基础 |
| 5.2.2 Surface Correlation Functions (p134) | 表面关联函数 | 边界效应分析 |

**5.1 Fully Penetrable Spheres (p120–129)**：可穿透球（Poisson 球）的解析结果，是 CLS 经典指数分布假设的理论基础，作为论文的对照基准。

| 小节 | 内容 | 与论文关系 |
|------|------|-----------|
| 5.1.4 Chord-Length Density Function (p127) | Poisson 球弦长分布 | 理解为什么经典 CLS 假设指数分布 |
| 5.1.5 Nearest-Neighbor Functions (p128) | Poisson 球最近邻分布 | 泊松基准对照 |

**5.4 Statistically Inhomogeneous Systems (p158)**：统计非均匀系统，有限容器**边界效应**的理论参考。

---

## 第二优先级：理论框架和推导工具

### Chapter 2: Microstructural Descriptors (p23–58)

所有微观结构描述符的严格定义，是理解 Chapter 5 解析公式的前提。

| 小节 | 内容 |
|------|------|
| 2.5 Chord-Length Density Function (p45) | 弦长密度函数的**一般定义** |
| 2.4 Lineal-Path Function (p44) | Lineal-path 的定义与性质 |
| 2.8 Nearest-Neighbor Functions (p50) | 最近邻函数的一般理论 |
| 2.2 n-Point Probability Functions (p25) | n 点概率函数（弦长推导基础） |

### Chapter 3: Statistical Mechanics of Many-Particle Systems (p59–95)

| 小节 | 内容 | 与论文关系 |
|------|------|-----------|
| 3.3 Equilibrium Hard-Sphere Systems (p75–83) | Percus-Yevick 硬球 RDF 解析解 | $g(r)$ 的闭合形式 |
| 3.4 Random Sequential Addition (p83–88) | RSA 过程的统计理论 | RSA 算法的理论对应 |
| 3.3.2 Arbitrary Fluid Densities (p81) | 任意密度下的 PY 近似 | 不同填充率的 RDF |

### Chapter 4: Unified Approach to Characterize Microstructure (p96–118)

$H_n$ 统一关联函数框架，联系各微观结构描述符的统一理论。重点看 4.2–4.4 节。

---

## 建议阅读路径

```
Ch 2.5 + 2.8  →  理解弦长密度函数和最近邻函数的一般定义
      ↓
Ch 3.3        →  掌握 Percus-Yevick 硬球 RDF 解析解 g(r)
      ↓
Ch 5.1.4      →  Poisson 球弦长分布（理解经典 CLS 为何假设指数分布）
      ↓
Ch 5.2        →  ★ 核心精读：硬球全部解析结果
                  （重点 5.2.4 弦长、5.2.5 最近邻、5.2.3 lineal-path）
      ↓
Ch 3.4        →  RSA 统计理论（理解 RSA 与平衡态硬球的差异）
      ↓
Ch 5.4        →  边界效应参考（有限容器）
```

---

## 不需要精读的章节

- **Chapter 7 (Anisotropic Media)** — 体系各向同性
- **Chapter 8 (Cell/Random-Field Models)** — 与硬球模型无关
- **Chapter 9 (Percolation)** — 非核心
- **Part II 全部 (Chapters 13–23)** — 有效性质预测（电导率、弹性模量等），与当前 CLS 几何分析目标无关

---

## 关键解析公式预期

阅读中重点关注以下解析表达式的提取：

1. **弦长密度函数** $p(l)$ — 硬球体系中基体和颗粒相的弦长分布（替代论文中的数值直方图）
2. **径向分布函数** $g(r)$ — Percus-Yevick 解析解（校验论文 RDF 统计结果）
3. **最近邻分布** $H_P(r)$ / $H_V(r)$ — 粒子问题和空穴问题的最近邻函数（校验 NND）
4. **Lineal-path 函数** $L(z)$ — 给定方向上连续穿越某相的概率
5. **RSA 与平衡态的差异** — 理解 RSA 生成的结构与 PY 解析解之间的系统性偏差
