---
title: 'OpenMC 功能展开计数（FET）学习笔记：从数学原理到 C++ 源码实现'
date: 2026-08-21
permalink: /posts/2026/21/openmc-fet-expansion-tally/
tags:
  - OpenMC
  - FET
  - 功能展开计数
  - 蒙特卡罗方法
  - Legendre 多项式
  - 源码分析
categories:
  - 核工程
  - 蒙特卡罗方法
---

# OpenMC 功能展开计数（FET）学习笔记：从数学原理到 C++ 源码实现

蒙卡输运计算结束后，我们最想看的往往是一个**连续的空间分布**——比如通量沿轴向的完整变化曲线。mesh tally 给出的是阶梯状的直方图，而 OpenMC 提供的 **FET（Functional Expansion Tally，功能展开计数）** 只用少量展开系数就能重建处处连续的分布。这篇笔记把 FET 的数学从头推导一遍，对照官方教程案例逐段讲解脚本，再深入 C++ 源码走读整条实现链路。

> **配套教程**：[OpenMC 官方 expansion-filters 教程 notebook](https://github.com/openmc-dev/openmc-notebooks)（`expansion-filters.ipynb`）。
> 本文取其**第一个案例**（燃料平板 + B₄C 吸收层，Legendre 轴向展开）从头推导一遍，
> 并对照 [openmc-dev/openmc](https://github.com/openmc-dev/openmc) 源码走读实现链路。
> 源码引用基于本地 `fet-rr-eval` 分支 @ `617d35a50`（2026-08-21，基于上游开发版），行号以该版本为准。

---

## 1. FET 要解决什么问题

蒙卡输运算完后，最想知道的往往是一个**连续的空间分布**，比如通量沿 z 轴的变化 φ(z)。传统做法是
**mesh tally（网格计数）**：把 z 轴切成 N 个小格，每格记一个平均通量，得到直方图。缺点：

- 格子数多了方差大（每格粒子少）、格子数少了分辨率低；
- 结果是阶梯状的离散值，不是连续函数；
- 想换分辨率就得重跑。

**FET（Functional Expansion Tally，功能展开计数）** 换了个思路：不存直方图，而是**假设 φ(z)
可以用一组合适的基函数线性组合出来**，只记录每个基函数前面的系数。就像傅里叶级数用一串
正弦/余弦逼近任意波形一样，这里用**勒让德（Legendre）多项式**逼近空间分布。阶数 N 的展开
只需要 **N+1 个数**，就能重建出**处处连续**的 φ(z)。

---

## 2. 数学推导（从零开始）

### 2.1 勒让德多项式是什么

勒让德多项式 {P₀, P₁, P₂, …} 是定义在 [−1, 1] 上的一组多项式，前几个：

$$P_0(x)=1,\quad P_1(x)=x,\quad P_2(x)=\tfrac{1}{2}(3x^2-1),\quad P_3(x)=\tfrac{1}{2}(5x^3-3x)$$

由三项递推关系生成（OpenMC 源码用的正是这个公式，`src/math_functions.cpp:107`）：

$$(l+1)\,P_{l+1}(x) = (2l+1)\,x\,P_l(x) - l\,P_{l-1}(x)$$

最重要的性质是**正交性**——不同阶的乘起来积分为零，同阶的积出已知常数：

$$\int_{-1}^{1} P_n(x)\,P_m(x)\,dx = \frac{2}{2n+1}\,\delta_{nm}
\qquad \Big(\delta_{nm}=\begin{cases}1 & n=m\\ 0 & n\neq m\end{cases}\Big)$$

**直觉**：把每个 Pₙ 想象成一根坐标轴上的"单位向量"，它们互相垂直（内积为零）。任何"向量" φ
都能分解成这些单位向量的线性组合，每个分量就是 φ 在该轴上的投影。

### 2.2 展开假设与系数推导

**第一步**：假设通量分布可以写成（z′ 是归一化到 [−1,1] 的坐标，见 2.3）：

$$\phi(z') = \sum_{n=0}^{N} a_n P_n(z')$$

Pₙ 是已知函数，未知数只有系数 aₙ——一共 N+1 个。

**第二步**：利用正交性"提取"每一项。两边同乘 Pₘ(z′)，对 z′ 从 −1 到 1 积分：

$$\int_{-1}^{1} \phi(z')\,P_m(z')\,dz'
 = \sum_{n=0}^{N} a_n \underbrace{\int_{-1}^{1} P_n(z')\,P_m(z')\,dz'}_{=\ \frac{2}{2m+1}\ (n=m);\ =\ 0\ (n\neq m)}
 = a_m\,\frac{2}{2m+1}$$

求和号里所有 n≠m 的项因正交性消失，只剩 n=m 一项。于是：

$$\boxed{\ a_m = \frac{2m+1}{2} \int_{-1}^{1} P_m(z')\,\phi(z')\,dz'\ }$$

这就是教程开头的公式。**它把"求连续函数 φ"变成了"求 N+1 个积分"**——而积分恰好是蒙卡最擅长的事。

### 2.3 坐标归一化

物理坐标 z ∈ [z_min, z_max]（案例里 [−10, 10] cm），勒让德定义域是 [−1, 1]，做线性映射：

$$z' = \frac{2(z - z_{\min})}{z_{\max}-z_{\min}} - 1
\quad\Longleftrightarrow\quad dz' = \frac{2}{z_{\max}-z_{\min}}\,dz$$

案例里区间长 20 cm，所以 z = 10z′，dz = 10 dz′。记住这个 **10**，后处理会再见到它。

### 2.4 蒙卡怎么算这个积分（核心）

被积表达式里 φ(z′)Pₙ(z′) 的积分是"通量 × 多项式"的体积分（沿 z 的一维投影）。蒙卡里估计
"某区域内通量的体积分"的标准工具是**径迹长度估计量（track-length estimator）**：

> 一段权重为 w、长度为 ℓ、发生在位置 z 附近的粒子径迹，对"该处通量体积分"的贡献是 **w·ℓ**。
> 把所有粒子、所有径迹的贡献加起来、除以源粒子数，就是该积分的无偏估计。

（直觉：粒子在某处停留得越久、走过得越长，那里的通量积分就越大。）

FET 只需要在这个估计量上**多乘一个 Pₙ(z′)**。第 n 阶系数对应的积分估计为：

$$M_n \approx \frac{1}{N_{\text{src}}}\sum_{\text{所有径迹}} w \cdot \ell \cdot P_n(z'_{\text{径迹位置}})$$

- M₀（P₀≡1）就是通常的积分通量 tally；
- M₁ 是"通量 × z′"的一阶矩；……
- 每一阶都是**同一次模拟顺带算出来的**，不用重复跑。

最后套 2.2 的公式：**aₙ = (2n+1)/2 · Mₙ**，重建 φ(z) = Σₙ aₙ Pₙ(z′)。

一句话总结 FET 原理：**把"滤波"和"计数"合在一起——每段径迹不再按位置扔进某个格子，而是乘上
0…N 阶多项式在当前位置的值，分别累加到 N+1 个"阶数格"里。事后这 N+1 个数就是连续分布的全部信息。**

---

## 3. 官方第一个案例：脚本逐段讲解

模型：**一块 10×10×20 cm 的燃料平板，x/y 反射边界（模拟无限大平板），z 上下真空；正中间夹
1 cm 厚 B₄C 吸收层**——通量沿 z 呈中间凹陷的余弦形，正好检验 FET 能否重建。

### Cell 1 — 导入

```python
import openmc, numpy as np, matplotlib.pyplot as plt
```

### Cell 3 — 材料（每行什么意思）

```python
fuel = openmc.Material()
fuel.add_element('U', 1.0, enrichment=4.5)   # 铀，原子量比 1.0，富集度 4.5%（压水堆典型值）
fuel.add_nuclide('O16', 2.0)                 # 氧-16，每个 U 配 2 个 O → UO2
fuel.set_density('g/cm3', 10.0)              # 密度 10 g/cm3

b4c = openmc.Material()
b4c.add_element('B', 4.0)                    # 硼:碳 = 4:1 → B4C（碳化硼，强吸收体）
b4c.add_element('C', 1.0)
b4c.set_density('g/cm3', 2.5)
```

`add_element` 按天然丰度自动展开成各同位素（¹⁰B 是吸收中子的主力）。

### Cell 4 — 几何（CSG 布尔运算）

```python
zmin, zmax = -10., 10.
box = openmc.model.RectangularPrism(10., 10., boundary_type='reflective')  # x/y 围墙，反射=镜像弹回
bottom = openmc.ZPlane(z0=zmin, boundary_type='vacuum')  # 真空=粒子穿过即死亡（泄漏）
boron_lower = openmc.ZPlane(z0=-0.5)   # 内部分界面（无 boundary_type → 只是界面）
boron_upper = openmc.ZPlane(z0=0.5)
top = openmc.ZPlane(z0=zmax, boundary_type='vacuum')

fuel1    = openmc.Cell(fill=fuel, region=-box & +bottom & -boron_lower)        # -10 < z < -0.5：燃料
absorber = openmc.Cell(fill=b4c,  region=-box & +boron_lower & -boron_upper)   # -0.5 < z < 0.5：B4C
fuel2    = openmc.Cell(fill=fuel, region=-box & +boron_upper & -top)           # 0.5 < z < 10：燃料
geom = openmc.Geometry([fuel1, absorber, fuel2])
```

`-box` = 盒内部，`+bottom` = 面正侧，`&` = 区域交（AND）。整块板沿 z 分三层。

### Cell 6 — 设置（三个数字的含义）

```python
settings = openmc.Settings()
spatial_dist = openmc.stats.Box(*geom.bounding_box)   # 初始源在几何包盒内均匀抽样
settings.source = openmc.IndependentSource(space=spatial_dist)
settings.batches = 210        # 总批数
settings.inactive = 10        # 非活跃批：前 10 批不计数（等源分布收敛，避免早期偏置污染结果）
settings.particles = 1000     # 每批 1000 个源粒子
```

有效样本 = (210−10)×1000 = 20 万个粒子历史。

### Cell 8 — FET 本体：计数 + 展开 filter

```python
flux_tally = openmc.Tally()
flux_tally.scores = ['flux']                      # 记"通量"计分项

order = 8                                          # 展开到 8 阶 → 9 个系数（n=0..8）
expand_filter = openmc.SpatialLegendreFilter(order, 'z', zmin, zmax)
#                                                ↑轴↑   ↑展开区间（决定 z' 归一化）
flux_tally.filters.append(expand_filter)
```

`SpatialLegendreFilter(8, 'z', -10, 10)` 就是第 2 节推导的全部内容：计数时把每段径迹乘上
Pₙ(z′)，n = 0…8 各成一个 bin。**tally 结果不再是 1 个数，而是 9 个矩 M₀…M₈。**

### Cell 10–14 — 建模、运行、读结果

```python
tallies = openmc.Tallies([flux_tally])
model = openmc.model.Model(geometry=geom, settings=settings, tallies=tallies)

sp_file = model.run(output=False)                 # 跑 210 批，生成 statepoint.210.h5

with openmc.StatePoint(sp_file) as sp:
    df = sp.tallies[flux_tally.id].get_pandas_dataframe()   # 读成 pandas 表（9 行）
```

`df['mean']` 就是各阶矩 M₀…M₈ 的蒙卡估计（已自动除以源粒子权重总数，"每源粒子"单位）。

### Cell 18 — 矩 → 系数（2.2 公式落地）

```python
n = np.arange(order + 1)             # [0,1,...,8]
a_n = (2*n + 1)/2 * df['mean']       # aₙ = (2n+1)/2 · Mₙ
```

### Cell 20–22 — 重建连续函数并画图（/10 的来历）

```python
phi = np.polynomial.Legendre(a_n/10, domain=(zmin, zmax))
```

`np.polynomial.Legendre` 是 NumPy 的"勒让德级数"类，给系数和定义域即可直接求值。
**为什么除以 10**：算出的 aₙ 是关于 z′ 的展开 φ(z′) = Σ aₙPₙ(z′)。物理分布按 z 表示时，
由 |φ(z)dz| = |φ(z′)dz′|（粒子数守恒）且 dz = 10 dz′：

$$\phi(z) = \frac{\phi(z')}{10} = \sum_n \frac{a_n}{10} P_n(z')$$

```python
z = np.linspace(zmin, zmax, 1000)
plt.plot(z, phi(z))       # 平滑曲线：大致余弦形，z∈[-0.5,0.5] 有 B₄C 造成的凹陷
```

### Cell 24 — 自检

```python
np.trapz(phi(z), z)     # 梯形法则数值积分重建出的 φ(z)
```

因为 P₀≡1，第 0 阶矩收的就是"全区间积分通量"：∫φ(z)dz = 10·∫φ dz′ = 10·(2a₀) = 10·M₀。
所以该积分 ≈ **10 × df['mean'] 第 0 行**——对不上说明重建有错。教程给的免费正确性检查。

---

## 4. OpenMC C++ 实现链路（源码走读）

整条链路五步。

### ① Python 侧 filter 定义

`openmc/filter_expansion.py:140` —— `SpatialLegendreFilter` 把 order/axis/min/max 写进
XML，C++ 端读回。

### ② 每段径迹结束 → filter 给出"阶数 × 权重"

输运中粒子每飞完一段（到达下一碰撞点/边界面）就调一次计数。普通 filter（如 CellFilter）只返回
**一个** bin（粒子在哪个栅元）；展开 filter 返回 **order+1 个 bin，每个 bin 带权重 = Pₙ 在
当前位置的值**——`src/tallies/filter_sptl_legendre.cpp:63`：

```cpp
void SpatialLegendreFilter::get_all_bins(
  const Particle& p, TallyEstimator estimator, FilterMatch& match) const
{
  // 取粒子当前坐标在展开轴上的分量
  double x = p.r().z;                      // (axis==z 的情形)

  if (x >= min_ && x <= max_) {
    // 物理坐标 → [-1,1] 归一化：正是 2.3 节的公式
    double x_norm = 2.0 * (x - min_) / (max_ - min_) - 1.0;

    // 递推算出 P0(x_norm) ... P_order(x_norm)
    vector<double> wgt(order_ + 1);
    calc_pn_c(order_, x_norm, wgt.data());
    for (int i = 0; i < order_ + 1; i++) {
      match.bins_.push_back(i);        // 第 i 个 bin = 第 i 阶
      match.weights_.push_back(wgt[i]); // 该 bin 的权重 = P_i(z')
    }
  }
}
```

其中 `calc_pn_c`（`src/math_functions.cpp:107`）就是 2.1 节的三项递推：

```cpp
void calc_pn_c(int n, double x, double pnx[])
{
  pnx[0] = 1.;
  if (n >= 1) pnx[1] = x;
  for (int l = 1; l < n; l++)
    pnx[l + 1] = ((2 * l + 1) * x * pnx[l] - l * pnx[l - 1]) / (l + 1);
}
```

### ③ 径迹长度通量估计量

`src/tallies/tally_scoring.cpp:2523`：

```cpp
void score_tracklength_tally(Particle& p, double distance)
{
  // 径迹长度通量估计量 = 权重 × 该段飞行距离
  double flux = p.wgt() * distance;
  score_tracklength_tally_general(p, flux, model::active_tracklength_tallies);
}
```

### ④ 组合所有 filter 的 bin，权重连乘，累加

`FilterBinIter` 遍历各 filter bin 的笛卡尔积，总权重 = 各 filter 权重之积
（`src/tallies/tally_scoring.cpp:130`）：

```cpp
void FilterBinIter::compute_index_weight()
{
  index_ = 0;
  weight_ = 1.;
  for (auto i = 0; i < tally_.filters().size(); ++i) {
    ...
    index_  += match.bins_[i_bin] * tally_.strides(i);
    weight_ *= match.weights_[i_bin];     // ← Legendre 的 P_n(z') 在这里进入
  }
}
```

计分时（`score_general_ce_nonanalog`，`src/tallies/tally_scoring.cpp:595` 起）：

```cpp
case SCORE_FLUX:
  score = flux;                            // = w · ℓ

...

// tally_scoring.cpp:1104
tally.results_(filter_index, score_index, TallyResult::VALUE) +=
  score * filter_weight;                   // += w·ℓ·P_n(z')  ← 2.4 节公式逐项落地
```

bin n 里累加的就是 Σ w·ℓ·Pₙ(z′)。**FET 与普通 tally 的唯一区别：普通 filter 的权重恒为 1，
展开 filter 的权重是基函数值。**

### ⑤ 归一化与读出

每个源粒子的初始权重累进 `simulation::total_weight`（`src/simulation.cpp:771`），批结束时
tally 累计值除以它，得到"每源粒子"单位（`src/tallies/tally.cpp:1117` 一带的
`/ simulation::total_weight`）。9 个 bin 的均值随 statepoint 写盘，Python 读回来即
`df['mean']`。

---

## 5. 全流程图

```
粒子飞行一段 ℓ（权重 w，终点坐标 z）
   │
   ├─ flux = w·ℓ                              ← 径迹长度估计量 (tally_scoring.cpp:2523)
   │
   ├─ z' = (z+10)/10 − 1                      ← 归一化到 [-1,1]  (filter_sptl_legendre.cpp:78)
   │
   ├─ [P0(z'), P1(z'), ..., P8(z')]           ← 递推求值      (math_functions.cpp:107)
   │
   ├─ bin n 累加 += flux·Pn(z') = w·ℓ·Pn(z')   ← FET 核心      (tally_scoring.cpp:1104)
   │
   ▼ 模拟结束，除以源粒子权重总数
M0 ... M8  (statepoint 里的 9 个数)
   │
   ├─ aₙ = (2n+1)/2 · Mₙ                       ← 正交性给的系数公式（后处理，Python 一行）
   │
   └─ φ(z) = Σ (aₙ/10)·Pn(z')                  ← 连续重建，可画图/积分/任意插值
```

---

## 6. 延伸

1. **阶数的选择**：低阶光滑、方差小但分辨率低；高阶能抓住 B₄C 那种局部凹陷，但系数多、高阶
   方差大，还可能出现末端震荡（Gibbs 现象）。教程结尾"要更准需要更高阶展开"说的就是这个权衡。
2. **基函数要配几何**：平板/轴向一维 → Legendre（本例）；圆柱栅元径向+方位角 → Zernike
   多项式（正交于单位圆盘，系数公式里的 kₙᵐ = (2n+2)/π 等见 notebook 后半段）；角度分布 →
   球谐函数（`SphericalHarmonicsFilter`）。教程第二个案例把同套路用到 pincell：
   `ZernikeFilter`（r,θ 全展开）与 `ZernikeRadialFilter`（仅径向），重建用的
   `openmc.Zernike`/`ZernikeRadial` 类内部已把标度因子 kₙᵐ 并入，所以那部分不用像 Legendre
   这样手动乘 (2n+1)/2。
3. **与 mesh tally 对比的本质**：mesh 是"直方图基"（分段常数），FET 是"全局光滑基"。后者系数
   可直接对比、可解析求导/积分——这正是把 FET 移植到 Random Ray 求解器的动机：用少量展开系数
   替代 overlay mesh tally，重建连续通量（随机射线法本身可参见本博客
   《[从蒙特卡罗到随机射线法：OpenMC 源码实现解析](https://cn-skywalker.github.io/核工程/蒙特卡罗方法/OpenMC随机射线法源码解析/)》）。

## 7. 上手小实验

- `order` 改成 2 / 8 / 20，看 B₄C 凹陷的还原程度与高阶震荡；
- 去掉 B₄C 层，看分布是否退化为纯余弦；
- 对照 `df` 第 0 行与 `np.trapz(phi(z), z)/10`，验证 P₀ 关系；
- 换 `axis='x'`（x 方向是反射边界，理论上通量应接近常数——只有 P₀ 项显著）。
