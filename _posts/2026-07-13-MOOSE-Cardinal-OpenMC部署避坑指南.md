---
layout: post
title: "MOOSE + Cardinal + OpenMC 部署经验与避坑指南"
date: 2026-07-13
categories: [核工程, 反应堆物理]
tags: [MOOSE, Cardinal, OpenMC, 环境部署, 踩坑记录]
---

> 本文档基于在 `virtual_test_bed` 容器环境中的实际部署经验整理。
> 适用于：有预装 libmesh/petsc/openmpi 但无 MOOSE 应用二进制的 Linux 环境。

本文把一次真实部署中踩过的 13 个坑按出现顺序记录下来，并给出验证通过的版本配对方案和完整环境激活脚本，便于在新环境中复现。

---

## 一、环境概况（部署前必须摸清的底数）

### 1.1 容器预装的关键组件

| 组件 | 路径 | 版本 | 用途 |
|------|------|------|------|
| libMesh | `/opt/libmesh` | 1.9.0-pre (git: ad08549af) | MOOSE 的核心 FE 库 |
| PETSc | `/opt/petsc` | 3.24 | 线性代数求解器 |
| OpenMPI | `/opt/openmpi` | 5.0.8 | MPI 并行 |
| GCC | gcc-toolset-13 | 13.3.1 | 编译器 |
| conda env `moose` | `/opt/miniforge3/envs/moose` | Python 3.13.11 + moose-tools 2025.10.21 | Python 工具链 |
| WASP | `/opt/wasp` | — | MOOSE 包管理器 |
| VTK/conduit/libtorch/mfem/neml2 | `/opt/*` | — | 可选依赖 |

### 1.2 预装组件的构建时间（关键线索）

```
libmesh_opt.so 构建时间: 2025-12-09 02:23:49
conda moose-tools:       2025-10-21
```

> **⚠️ 坑 #1：容器构建时间决定 MOOSE/Cardinal 版本**
>
> 预装的 libmesh 是某个特定 MOOSE 版本的内嵌 submodule 编译的。
> **必须用同期的 MOOSE/Cardinal 源码**，否则 API 不兼容。
> 容器构建时间（此处为 2025-12 初）是找匹配版本的唯一线索。

### 1.3 系统资源

| 资源 | 数值 | 影响 |
|------|------|------|
| CPU 核数 | 32 | 决定 make -j 参数 |
| 内存 | 15 GB | **严重制约并行编译和运行** |
| Swap | 4 GB | 缓冲但不够 |
| 磁盘 | 347 GB 可用 | 足够 |

---

## 二、核心避坑清单（按踩坑顺序）

### 坑 #1：MOOSE/Cardinal 版本与系统 libmesh 不匹配（最致命）

**现象**：用 gitee 镜像最新 devel 分支编译，报各种 API 错误：

```
# 错误1: libmesh_abort() 被移除
error: 'libmesh_abort' was not declared in this scope; did you mean 'libmesh_assert'?

# 错误2: C0Polyhedron 构造函数签名变了
error: no matching function for call to 'libMesh::C0Polyhedron::C0Polyhedron(..., std::unique_ptr<libMesh::Node>&)
note: candidate: 'libMesh::C0Polyhedron(const std::vector<...>&, libMesh::Elem*)'

# 错误3: addBoolCapability 被替换
error: 'addBoolCapability' was not declared in this scope; did you mean 'addCapability'?
```

**根因**：gitee 镜像的 devel 分支是 2026-07 的最新代码，但系统的 libmesh 是 2025-12 构建的。MOOSE 的 API 在这 7 个月里发生了变化。

**解决方案**：通过 GitHub API 找到与 libmesh 构建时间匹配的 MOOSE commit：

```bash
# 查 libmesh 构建时间
ls -la --time-style=full-iso /opt/libmesh/lib/libmesh_opt.so
# 输出: 2025-12-09 02:23:49

# 用 GitHub API 查这个日期附近的 moose commit
curl -s "https://api.github.com/repos/idaholab/moose/commits?until=2025-12-09T00:00:00Z&per_page=3"
# 找到: d186070d2d31ba1863e778f19a9ab7388c047de2 (2025-12-08)

# 从官方仓库 fetch 这个特定 commit（不用 gitee 镜像，可能同步滞后）
cd /home/moose
git fetch --depth=1 https://github.com/idaholab/moose.git d186070d2d31ba1863e778f19a9ab7388c047de2
git checkout d186070d2d31ba1863e778f19a9ab7388c047de2
```

**验证版本匹配的方法**：checkout 后检查是否还用被移除的 API：

```bash
# 如果无输出，说明这个版本不再用被移除的 API（匹配！）
grep -rn "libmesh_abort" framework/src/base/MooseError.C
grep -rn "C0Polyhedron" framework/src/meshgenerators/AdvancedExtruderGenerator.C
```

**经验法则**：
- libmesh 构建时间 ± 1 周 内的 MOOSE commit 最可靠
- **不要用 devel/master 分支 HEAD**，它们太新
- gitee 镜像可能比 GitHub 官方滞后，fetch 特定 commit 时优先用官方仓库

---

### 坑 #2：make -j 32 导致容器 OOM 崩溃

**现象**：`make -j 32` 编译 MOOSE 时，容器直接死掉（无响应，需要重启）。

**根因**：MOOSE 的 C++ 模板代码（libMesh + MOOSE framework）每个编译单元很重，32 个 g++ 进程瞬间需要 30-50GB 内存，而容器只有 15GB。

**解决方案**：降低并行度：

```bash
# 15GB 内存机器的安全参数
make -j 8   # MOOSE framework + test (峰值约 10GB，安全)
make -j 6   # Cardinal (含 OpenMC，峰值约 8GB)

# 通用公式：每个并行进程约 1.2-1.5GB 内存
# 安全并行度 = 可用内存 / 1.5
# 15GB / 1.5 ≈ 10，留余量用 8
```

**注意**：即使 swap 有 4GB 也不够救场——编译是 CPU 密集型，swap 拖慢到几乎停滞。

---

### 坑 #3：git clone 被中断后 index 损坏

**现象**：`git clone` 过程中被取消（Ctrl+C 或超时），导致：

```
fatal: .git/index: index file smaller than expected
```

**根因**：git 的 index 文件在写入中途被中断，产生不完整的文件。

**解决方案**：删除整个目录重新克隆（不要试图修复）：

```bash
# 删除损坏的目录（WSL2 上可能遇到删不掉的空目录）
chmod -R u+w moose 2>/dev/null
find moose -depth -type d -empty -delete 2>/dev/null
find moose -depth -print0 | xargs -0 -r rm -rf 2>/dev/null
rm -rf moose

# 重新克隆（用后台方式避免交互中断）
git clone --depth 1 --branch devel --single-branch <url> moose
```

**经验**：
- 大仓库克隆用 `run_in_background: true`，避免前台超时被杀
- `--depth 1` 浅克隆可大幅减少体积（MOOSE 从 ~2GB 降到 ~1GB）
- WSL2 的 D 盘挂载有时删不掉空目录，用 `find -depth` 递归删除

---

### 坑 #4：HDF5 库链接错误（OpenMC 编译失败）

**现象**：OpenMC 链接时报错：

```
ld: /opt/petsc/lib/libpetsc.so: undefined reference to `H5Pset_fapl_mpio'
ld: /opt/petsc/lib/libpetsc.so: undefined reference to `H5Pget_dxpl_mpio'
collect2: error: ld returned 1 exit status
```

**根因**：系统有两套 HDF5：

| HDF5 来源 | 路径 | 类型 | 有 H5Pset_fapl_mpio? |
|-----------|------|------|---------------------|
| PETSc 自带 | `/opt/petsc/lib/libhdf5.so` | **并行 (MPI)** | ✅ 有 |
| conda moose | `/opt/miniforge3/envs/moose/lib/libhdf5.so` | **串行** | ❌ 无 |

PETSc 编译时用了并行 HDF5，但 OpenMC 的 CMake 默认找到了 conda 的串行 HDF5，导致链接时缺 MPI 符号。

**解决方案**：`HDF5_ROOT` 必须指向 PETSc 目录：

```bash
# 错误 ❌（cardinal 文档默认推荐的，但在本环境不工作）
export HDF5_ROOT=$CONDA_PREFIX  # /opt/miniforge3/envs/moose

# 正确 ✅
export HDF5_ROOT=/opt/petsc
export LD_LIBRARY_PATH=/opt/petsc/lib:$LD_LIBRARY_PATH
```

**验证方法**：

```bash
# 检查 HDF5 库是否有 MPI 符号
nm -D /opt/petsc/lib/libhdf5.so | grep H5Pset_fapl_mpio
# 有输出 = 并行版本 ✅
```

> **⚠️ cardinal 文档的 `HDF5_ROOT=$CONDA_PREFIX` 在有预装 PETSc 的环境中是错的！**
> cardinal Makefile 注释里其实说了默认是 `$(PETSC_DIR)`，但 conda 指南误导了。

---

### 坑 #5：Cardinal 与 OpenMC submodule 版本不匹配

**现象**：checkout cardinal 到旧版本后，编译报错：

```
fatal error: xtensor/xview.hpp: No such file or directory
```

**根因**：cardinal 的 OpenMC submodule 指向新版（66359e5dd），但旧版 cardinal 期望的 OpenMC（bbfa18d7）不同。新版 OpenMC 不再 vendor xtensor（改用系统/conda），但旧版 cardinal 的代码还 `#include "xtensor/xview.hpp"`。

**解决方案**：OpenMC submodule 必须 checkout 到 cardinal 期望的版本：

```bash
cd /home/cardinal

# 查看 cardinal 这个版本期望的 openmc commit
git ls-tree HEAD contrib/openmc
# 输出: 160000 commit bbfa18d72c34d8710b5f4f3fa1fff54f5248fcc5 contrib/openmc

# checkout 到配套版本
cd contrib/openmc
git fetch --depth=1 origin bbfa18d72c34d8710b5f4f3fa1fff54f5248fcc5
git checkout bbfa18d72c34d8710b5f4f3fa1fff54f5248fcc5
cd /home/cardinal

# 验证 xtensor 现在存在
ls contrib/openmc/vendor/xtensor/include/xtensor/xview.hpp
```

**经验**：
- cardinal 的每个 submodule（openmc, nekRS, moose 等）都有特定版本配对
- `git submodule status` 中的 `+` 号表示 submodule 当前 checkout 与父仓库期望的不一致
- **不要只 checkout cardinal 主仓库，submodule 也要对齐**

---

### 坑 #6：Cardinal 与 MOOSE API 版本不匹配

**现象**：cardinal 编译报错：

```
error: 'addBoolCapability' was not declared in this scope; did you mean 'addCapability'?
```

**根因**：cardinal devel（较新）用了 `addBoolCapability`，但我们编译的 MOOSE（2025-12-08）只有 `addCapability`。

**解决方案**：cardinal 也要 checkout 到与 MOOSE 同期的版本：

```bash
# MOOSE 是 2025-12-08，找同期的 cardinal
curl -s "https://api.github.com/repos/neams-th-coe/cardinal/commits?until=2025-12-15T00:00:00Z&per_page=3"
# 找到: ddc466c112c5e914f88880d68921863bd1d3df47 (2025-12-14)

cd /home/cardinal
git fetch --depth=1 https://github.com/neams-th-coe/cardinal.git ddc466c112c5e914f88880d68921863bd1d3df47
git checkout ddc466c112c5e914f88880d68921863bd1d3df47

# 验证不再用 addBoolCapability
grep "addBoolCapability" src/base/CardinalApp.C
# 无输出 = 匹配 ✅
```

**版本配对表（本次部署验证通过的组合）**：

| 组件 | commit | 日期 | 来源 |
|------|--------|------|------|
| libmesh | ad08549af (系统预装) | 2025-12-09 | /opt/libmesh |
| MOOSE | d186070d2d31 | 2025-12-08 | github.com/idaholab/moose |
| Cardinal | ddc466c112c5 | 2025-12-14 | github.com/neams-th-coe/cardinal |
| OpenMC | bbfa18d72c34 | 2025-12-12 | cardinal contrib/openmc submodule |

---

### 坑 #7：conda 环境与 NekRS 不兼容

**现象**：cardinal 默认 `ENABLE_NEK=yes`，但 conda 环境下 NekRS 编译失败。

**根因**：MOOSE 的 conda 编译器 wrapper 导出的 HYPRE 头文件与 NekRS 自带的 HYPRE 冲突。这是已知的、官方文档记载的限制。

**解决方案**：

```bash
# 必须关闭 NekRS
export ENABLE_NEK=false

# 只保留 OpenMC 耦合
export ENABLE_OPENMC=yes
```

**影响**：无法使用 Cardinal 的 CFD（NekRS）功能，但 OpenMC-MOOSE 耦合完全可用。

---

### 坑 #8：mpirun 拒绝 root 用户运行

**现象**：

```
prterun has detected an attempt to run as root.
Running as root is *strongly* discouraged...
```

**解决方案**：

```bash
# 方法1：命令行参数
mpirun --allow-run-as-root -np 4 cardinal-opt -i input.i

# 方法2：环境变量（推荐写入 moose_env.sh）
export OMPI_ALLOW_RUN_AS_ROOT=1
export OMPI_ALLOW_RUN_AS_ROOT_CONFIRM=1
```

---

### 坑 #9：OpenMC Python 包未随 Cardinal 安装

**现象**：`import openmc` 失败：

```
ModuleNotFoundError: No module named 'openmc'
```

**根因**：cardinal 编译了 OpenMC 的 C++ 库（`libopenmc.so`）和命令行工具，但 Python API 包没自动安装。VTB 的 OpenMC 算例（如 `assembly.py`）需要 Python API 生成 `geometry.xml`/`materials.xml`。

**解决方案**：

```bash
cd /home/cardinal/contrib/openmc
pip install -e .
```

---

### 坑 #10：大网格算例运行时 OOM

**现象**：VTB 的 `htgr/assembly` 算例（330 万单元网格，246MB）运行时被 `signal 9 (Killed)` 杀掉。

**根因**：
- 16 进程 × 每进程复制网格 = 超过 15GB 内存
- 该算例还耦合了 BISON 子应用（进一步增加内存）

**解决方案**：
1. 降低进程数 + 使用分布式网格：

```bash
mpirun -np 4 cardinal-opt -i openmc.i --distributed-mesh
```

2. 对于 15GB 内存环境，避免运行 tests 标注 `min_slots >= 6` 或 `min_parallel >= 16` 的算例
3. 优先选择轻量 tutorial 算例（如 `gas_compact`）

---

### 坑 #11：grep 命令在 ZCode 环境中被包装

**现象**：`grep -Eio "pattern1\|pattern2"` 报错：

```
grep: conflicting matchers specified
```

**根因**：ZCode 的 shell 把 `grep` 包装成了函数（通过 node.js 处理），与管道中的正则语法冲突。

**解决方案**：用 `command grep` 绕过包装：

```bash
# 错误 ❌
grep -Eio "mooseapp|bisonapp" file.txt

# 正确 ✅
command grep -Eio "mooseapp|bisonapp" file.txt
```

---

### 坑 #12：gitee 镜像不支持 fetch 任意 commit

**现象**：`git fetch --depth=1 origin <commit_sha>` 对 gitee 镜像报错：

```
fatal: couldn't find remote ref <commit_sha>
```

**根因**：gitee 镜像的浅克隆只同步了分支 HEAD，不包含历史 commit。

**解决方案**：fetch 特定 commit 时用 GitHub 官方仓库：

```bash
# gitee 镜像（用于克隆分支，国内速度快）
git clone --depth 1 --branch devel https://gitee.com/skywalker-cn/moose.git

# GitHub 官方（用于 fetch 特定 commit，支持任意 SHA）
git fetch --depth=1 https://github.com/idaholab/moose.git <full_40char_sha>
```

---

### 坑 #13：make 输出被 tail 管道缓冲

**现象**：`make -j 8 2>&1 | tail -50` 长时间无输出，无法判断编译是否在进行。

**根因**：`tail` 在管道中会缓冲，直到 make 结束才输出。

**解决方案**：重定向到文件，用另一个命令监控：

```bash
# 编译输出重定向到文件
make -j 8 > /tmp/build.log 2>&1

# 另一个终端/命令监控
tail -f /tmp/build.log
# 或
grep "error:" /tmp/build.log
grep -oE "\[[ 0-9]+%\]" /tmp/build.log | tail -1
```

---

## 三、验证通过的完整部署流程

### 3.1 环境激活脚本

创建 `/home/moose_env.sh`（见附录 A），所有编译和运行都先 `source` 它。

### 3.2 MOOSE 部署

```bash
source /home/moose_env.sh

# 1. 克隆（gitee 镜像，国内速度快）
cd /home
git clone --depth 1 --branch devel --single-branch https://gitee.com/skywalker-cn/moose.git moose

# 2. 切换到与系统 libmesh 配套的版本（关键！）
cd moose
git fetch --depth=1 https://github.com/idaholab/moose.git d186070d2d31ba1863e778f19a9ab7388c047de2
git checkout d186070d2d31ba1863e778f19a9ab7388c047de2

# 3. configure（使用系统 /opt/libmesh）
./configure

# 4. 编译（-j 8 避免 OOM）
cd test
make -j 8 > /tmp/moose_build.log 2>&1

# 5. 验证
./moose_test-opt --version
./moose_test-opt -i test/tests/kernels/simple_diffusion/simple_diffusion.i
```

### 3.3 Cardinal 部署

```bash
source /home/moose_env.sh

# 1. 克隆
cd /home
git clone --depth 1 --branch devel --single-branch https://gitee.com/skywalker-cn/cardinal.git cardinal

# 2. 切换到与 MOOSE 配套的版本
cd cardinal
git fetch --depth=1 https://github.com/neams-th-coe/cardinal.git ddc466c112c5e914f88880d68921863bd1d3df47
git checkout ddc466c112c5e914f88880d68921863bd1d3df47

# 3. 拉取 OpenMC submodule 并切换到配套版本
cd contrib/openmc
git fetch --depth=1 origin bbfa18d72c34d8710b5f4f3fa1fff54f5248fcc5
git checkout bbfa18d72c34d8710b5f4f3fa1fff54f5248fcc5
cd /home/cardinal

# 4. 拉取 nuclear_data submodule
git submodule update --init contrib/nuclear_data

# 5. 安装 OpenMC Python 包
cd contrib/openmc && pip install -e . && cd /home/cardinal

# 6. 编译（关键环境变量）
export MOOSE_DIR=/home/moose          # 复用已编译的 moose
export LIBMESH_DIR=/opt/libmesh        # 系统预装
export PETSC_DIR=/opt/petsc
export ENABLE_NEK=false                # conda 环境不兼容 NekRS
export ENABLE_OPENMC=yes
export HDF5_ROOT=/opt/petsc            # 用 PETSc 的并行 HDF5（不是 conda 串行版）
export LD_LIBRARY_PATH=/opt/petsc/lib:/home/cardinal/install/lib:$LD_LIBRARY_PATH
export CC=mpicc CXX=mpicxx FC=mpif90

make -j 6 > /tmp/cardinal_build.log 2>&1

# 7. 验证
./cardinal-opt --version
./cardinal-opt -i test/tests/ics/volumetric_heat_source_ic/sinusoidal_z.i
```

### 3.4 核数据配置

```bash
# 在 /home/moose_env.sh 中加入：
export OPENMC_CROSS_SECTIONS=/home/data/XS/mcnp_endfb71/cross_sections.xml
export OPENMC_PHOTON_DATA=/home/data/XS/mcnp_endfb71/photon

# 验证
openmc  # 运行一个简单临界算例
```

---

## 四、快速诊断清单（部署前检查）

在新环境部署前，按此清单逐项检查：

```bash
# === 1. 系统资源 ===
nproc                          # CPU 核数（决定 make -j 参数）
free -h                        # 内存（< 16GB 不建议编译，运行也受限）
df -h /home                    # 磁盘空间（需 > 10GB）

# === 2. 预装库 ===
ls /opt/libmesh/bin/libmesh-config  && echo "✓ libmesh"
ls /opt/petsc/lib/libpetsc.so       && echo "✓ petsc"
ls /opt/openmpi/bin/mpiexec         && echo "✓ openmpi"
ls /opt/wasp/bin/                   && echo "✓ wasp"

# === 3. libmesh 版本和构建时间（找匹配 MOOSE 的关键）===
/opt/libmesh/bin/libmesh-config --version
ls -la --time-style=full-iso /opt/libmesh/lib/libmesh_opt.so
grep "Git revision" /opt/libmesh/logs/build.log

# === 4. HDF5 是并行还是串行（决定 HDF5_ROOT）===
nm -D /opt/petsc/lib/libhdf5.so | grep H5Pset_fapl_mpio  # 有输出=并行
nm -D /opt/miniforge3/envs/moose/lib/libhdf5.so | grep H5Pset_fapl_mpio  # 有输出=并行

# === 5. MPI 类型（OpenMPI vs MPICH，不能混用）===
mpiexec --version  # Open MPI 还是 MPICH

# === 6. conda 环境 ===
conda env list
conda list -n moose | grep -E "pyyaml|jinja2|numpy|matplotlib"

# === 7. 网络连通性 ===
git ls-remote https://github.com/idaholab/moose.git HEAD  # GitHub 官方
git ls-remote https://gitee.com/skywalker-cn/moose.git HEAD  # gitee 镜像

# === 8. root 用户（决定是否需要 --allow-run-as-root）===
whoami  # root 需要特殊处理 mpirun
```

---

## 五、常见错误速查表

| 错误信息 | 根因 | 解决方案 |
|----------|------|----------|
| `libmesh_abort was not declared` | MOOSE 版本太新，libmesh API 变了 | 切换到与 libmesh 同期的 MOOSE commit |
| `C0Polyhedron no matching function` | 同上 | 同上 |
| `addBoolCapability not declared` | Cardinal 版本与 MOOSE 不匹配 | 切换 Cardinal 到与 MOOSE 同期版本 |
| `xtensor/xview.hpp: No such file` | OpenMC submodule 版本不对 | checkout 到 cardinal 期望的 OpenMC 版本 |
| `H5Pset_fapl_mpio undefined reference` | HDF5 串行/并行不匹配 | `HDF5_ROOT=/opt/petsc` |
| `signal 9 (Killed)` | OOM 内存不足 | 降低 `-j` 参数或 `-np` 进程数 |
| `index file smaller than expected` | git clone 被中断 | 删除目录重新克隆 |
| `couldn't find remote ref` | gitee 镜像无此 commit | 用 GitHub 官方仓库 fetch |
| `attempt to run as root` | OpenMPI 拒绝 root | `--allow-run-as-root` |
| `No module named 'openmc'` | Python 包未装 | `cd contrib/openmc && pip install -e .` |
| `conflicting matchers specified` | ZCode grep 包装 | 用 `command grep` |

---

## 附录 A：环境激活脚本

文件：`/home/moose_env.sh`

```bash
#!/bin/bash
# =============================================================================
# MOOSE + Cardinal + OpenMC 编译/运行环境激活脚本
# 适用于本容器（OpenMPI + libmesh/petsc 预装在 /opt）
#
# 用法：source /home/moose_env.sh
# =============================================================================
set -e

# --- 1. 启用 GCC 13 工具集（libmesh/petsc 用此版本编译）---
if [ -f /opt/rh/gcc-toolset-13/enable ]; then
    source /opt/rh/gcc-toolset-13/enable
fi

# --- 2. OpenMPI（本容器原生 MPI，moose/libmesh 用它编译）---
export OPENMPI_DIR=/opt/openmpi
export PATH=$OPENMPI_DIR/bin:$PATH
export LD_LIBRARY_PATH=$OPENMPI_DIR/lib:${LD_LIBRARY_PATH:-}

# --- 3. libMesh（MOOSE 的核心依赖）---
export LIBMESH_DIR=/opt/libmesh
export PATH=$LIBMESH_DIR/bin:$PATH
export LD_LIBRARY_PATH=$LIBMESH_DIR/lib:$LD_LIBRARY_PATH

# --- 4. PETSc（线性代数求解器）---
export PETSC_DIR=/opt/petsc
export LD_LIBRARY_PATH=$PETSC_DIR/lib:$LD_LIBRARY_PATH

# --- 5. WASP（MOOSE 的包管理器）---
export WASP_DIR=/opt/wasp
export PATH=$WASP_DIR/bin:$PATH
export LD_LIBRARY_PATH=$WASP_DIR/lib:$LD_LIBRARY_PATH

# --- 6. 其他 MOOSE 依赖库 ---
for libdir in /opt/conduit/lib /opt/libtorch/lib /opt/mfem/lib /opt/neml2/lib /opt/vtk/lib; do
    [ -d "$libdir" ] && export LD_LIBRARY_PATH=$libdir:$LD_LIBRARY_PATH
done

# --- 7. MOOSE 编译模式：opt（优化）/ dbg（调试）/ devel（开发）---
export METHOD=${METHOD:-opt}

# --- 8. 激活 conda moose 环境（提供 Python 3.13 + MOOSE python 包）---
if command -v conda >/dev/null 2>&1; then
    eval "$(conda shell.bash hook)"
    conda activate moose 2>/dev/null || echo "[moose_env] 警告: conda moose 环境激活失败，将使用系统 python"
fi

# --- 9. 并行编译参数（32 核机器，但编译用 8 避免内存不足）---
export MOOSE_JOBS=${MOOSE_JOBS:-8}

# --- 10. Cardinal 编译/运行配置 ---
export CARDINAL_DIR=/home/cardinal
export MOOSE_DIR=${MOOSE_DIR:-/home/moose}   # cardinal 复用已编译的 moose
export ENABLE_NEK=${ENABLE_NEK:-false}        # NekRS 与 conda 环境不兼容，默认关闭
export ENABLE_OPENMC=${ENABLE_OPENMC:-yes}
export HDF5_ROOT=${HDF5_ROOT:-/opt/petsc}     # 必须用 PETSc 的并行 HDF5（不是 conda 串行版）
export LD_LIBRARY_PATH=/home/cardinal/install/lib:$LD_LIBRARY_PATH

# --- 11. OpenMC 核数据（ENDF/B-VII.1 HDF5 格式）---
export OPENMC_CROSS_SECTIONS=/home/data/XS/mcnp_endfb71/cross_sections.xml
export OPENMC_PHOTON_DATA=/home/data/XS/mcnp_endfb71/photon

# --- 12. root 用户运行 MPI ---
export OMPI_ALLOW_RUN_AS_ROOT=1
export OMPI_ALLOW_RUN_AS_ROOT_CONFIRM=1

echo "[moose_env] GCC=$(gcc -dumpversion) | Python=$(python --version 2>&1 | command grep -oE '[0-9.]+')"
echo "[moose_env] MOOSE=/home/moose | CARDINAL=/home/cardinal | OPENMC=$ENABLE_OPENMC | NEK=$ENABLE_NEK"
echo "[moose_env] XS=$OPENMC_CROSS_SECTIONS"
```

---

## 附录 B：版本配对参考表

> 以下组合在 2025-12 构建的容器环境中验证通过。
> 不同时期的容器需要重新找匹配版本。

| 组件 | commit SHA | 日期 | 来源 |
|------|-----------|------|------|
| libmesh (系统预装) | ad08549af | 2025-12-09 | /opt/libmesh |
| MOOSE | d186070d2d31ba1863e778f19a9ab7388c047de2 | 2025-12-08 | github.com/idaholab/moose |
| Cardinal | ddc466c112c5e914f88880d68921863bd1d3df47 | 2025-12-14 | github.com/neams-th-coe/cardinal |
| OpenMC | bbfa18d72c34d8710b5f4f3fa1fff54f5248fcc5 | 2025-12-12 | cardinal contrib/openmc |
| PETSc | 3.24 | — | /opt/petsc |
| OpenMPI | 5.0.8 | — | /opt/openmpi |
| GCC | 13.3.1 | — | gcc-toolset-13 |
| Python | 3.13.11 | — | conda env moose |

**找匹配版本的方法**：
1. 查 libmesh 构建时间：`ls -la --time-style=full-iso /opt/libmesh/lib/libmesh_opt.so`
2. 用 GitHub API 查同期 MOOSE：`curl -s "https://api.github.com/repos/idaholab/moose/commits?until=<date>T00:00:00Z&per_page=3"`
3. 同理查同期 Cardinal
4. checkout 后验证无 API 错误（grep 被移除的符号）
