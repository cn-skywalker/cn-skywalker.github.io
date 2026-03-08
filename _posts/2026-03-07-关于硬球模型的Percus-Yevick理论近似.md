---
title: '关于硬球模型的Percus-Yevick理论近似'
date: 2026-03-07
permalink: /posts/2026/07/Percus-Yevick/
tags:
  - 硬球模型
  - Percus-Yevick理论
  - 随机介质
categories:
  - 学习笔记
---
# Percus-Yevick公式

## 研究背景与问题（硬球随机分布）

这篇笔记只关注硬球体系的几何本质：粒子可以看作直径为 $d$ 的刚性小球，唯一约束是“不能重叠”。也就是说，两球中心距离 $r<d$ 的构型一律不允许，$r\ge d$ 才允许。

把这个框架放到 TRISO 颗粒背景下，可以做一个常见近似：把燃料颗粒（或其等效外形）先看作硬球，在一定体积分数下随机分布在基体中。这样我们最先要回答的，不是复杂材料细节，而是一个更基础的问题：

- 在“不可重叠 + 随机分布”的条件下，颗粒之间的典型间距分布是什么？
- 某个颗粒周围在不同半径处，出现其他颗粒的概率是增强还是被抑制？
- 这些几何排布特征怎样用一个可计算的方程表示出来？

这正是 Percus-Yevick 近似切入的地方：它把多体随机几何相关，转写成关于二体函数的自洽积分方程。换句话说，先抓住“任意两颗粒之间的统计几何关系”，再由它反推出体系结构信息（如 $g(r)$）以及后续可关联的宏观量。

下面的公式与符号说明，都会围绕这个目标展开：用尽量直观的方式理解“硬球随机分布”下的二体几何概率。

## 二体关联函数

$$
\tau(\mathbf{x}) \equiv e^{\theta V(\mathbf{x})}\,\sigma(\mathbf{x})
$$

## Percus-Yevick 积分方程

$$
\tau(\mathbf{x})
= 1 + n \int
\left(e^{-\theta V(\mathbf{y})}-1\right)
\tau(\mathbf{y})
\left[e^{-\theta V(\mathbf{x}-\mathbf{y})}\tau(\mathbf{x}-\mathbf{y})-1\right]
\,d^3y.
$$

## 符号与物理意义（按本文记号）

- $\tau(\mathbf{x})$：二体关联的辅助函数（待求函数）。通俗地说，它是把“硬球不能重叠”这层最强限制先单独处理后，剩下的相关性。例：在硬球壳外（$r\ge d$）它和 $\sigma$ 一样；在壳内（$r<d$）原始概率被禁入条件压成 0。
- $\sigma(\mathbf{x})$：二体分布函数，表示“固定一粒子在原点时，另一粒子中心出现在位移 $\mathbf{x}$ 附近”的相对概率密度。
- $g(r)$：径向分布函数（RDF），是 $\sigma(\mathbf{x})$ 在各向同性情形下的径向形式，刻画半径为 $r$ 的球壳上配对出现的相对概率。
- $\mathbf{x},\mathbf{y}$：三维位移向量；$\mathbf{x}$ 是你最终关心的两球间距，$\mathbf{y}$ 是“中间转一手”的位移。例：想看 A 和 C 的相关性时，$\mathbf{y}$ 可以理解为 A 到 B 的位移，$\mathbf{x}-\mathbf{y}$ 是 B 到 C 的位移。
- $n$：数密度（单位体积粒子数），对应体系的拥挤程度（crowding level）。
- $V(\mathbf{r})$：二体相互作用势；在硬球模型里就是“是否重叠”的几何判据。例：两球中心距 $r<d$ 就重叠（不允许），$r\ge d$ 就不重叠（允许）。
- $\theta$：逆温度参数，通常等价于 $\beta=1/(k_B T)$；在硬球模型中主要作为统计权重记号保留。
- $e^{-\theta V(\mathbf{r})}$：Boltzmann 因子；在硬球里可直接看成权重因子。例：$r<d$ 时为 0，$r\ge d$ 时为 1。
- $e^{-\theta V(\mathbf{r})}-1$：Mayer 函数形式；在硬球里可理解为“禁入标记”。例：禁入区取 $-1$，可达区取 0，所以只在“可能重叠”的几何区域产生贡献。
- $d^3y$：对所有中间位置 $\mathbf{y}$ 做三维积分。通俗地说，就是把“所有可能的中间粒子站位”都遍历一遍再求和。例：A 到 C 的影响，不只看直连，还把 A-B-C 这类所有中间路径都加起来。

## 关键关系说明

1. 变换关系：

$$
\tau(\mathbf{x}) = e^{\theta V(\mathbf{x})}\sigma(\mathbf{x}).
$$

其中 $e^{\theta V(\mathbf{x})}$ 可理解为对 $\sigma$ 的“反 Boltzmann 重权重”因子，用于把方程改写为更适合求解的形式。

2. 积分方程在求什么：

该方程求解的是 $\tau(\mathbf{x})$（等价地可还原到 $\sigma(\mathbf{x})$ 或 $g(r)$）。它体现了“直接相关 + 通过中间位置 $\mathbf{y}$ 的间接相关累加”的自洽结构。

3. 求得函数后的用途：

- 得到体系的微观结构信息（如 RDF）；
- 进一步计算结构因子与热力学量（压强、压缩率、状态方程等）。

## 硬球模型下的直观说明

对硬球势 $V(r)$：

- $r<d$ 时 $V(r)=+\infty$（粒子不可重叠）；
- $r\ge d$ 时 $V(r)=0$。

因此：

- 壳外 $e^{\theta V}=1$，有 $\tau=\sigma$；
- 壳内由不可重叠条件主导，相关函数在该区间受到强约束。

## 参考文献

[1] Percus J K, Yevick G J. Analysis of Classical Statistical Mechanics by Means of Collective Coordinates[J]. Physical Review, 1958, 110(1): 1-13.
