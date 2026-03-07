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

## 二体分布函数定义

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

- $\tau(\mathbf{x})$：二体关联的辅助函数（待求函数）。通过积分方程自洽确定。
- $\sigma(\mathbf{x})$：二体分布函数（在均匀各向同性情形下可对应 RDF 的空间形式）。
- $g(r)$：径向分布函数（RDF），表示“在距离 $r$ 处找到另一粒子的相对概率”。
- $\mathbf{x},\mathbf{y}$：三维位移向量，$\mathbf{y}$ 是积分中的中间变量。
- $n$：数密度（单位体积的粒子数）。
- $V(\mathbf{r})$：二体相互作用势。
- $\theta$：逆温度参数，通常等价于 $\beta=1/(k_B T)$。
- $e^{-\theta V(\mathbf{r})}$：Boltzmann 因子，表示势能对统计权重的影响。
- $e^{-\theta V(\mathbf{r})}-1$：Mayer 函数形式，常用于液体理论积分方程。
- $d^3y$：对三维空间中所有中间位形进行积分。

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
