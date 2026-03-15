---
title: "基于OpenMC的反应性等效物理转换方法在双重非均匀性问题中的应用"
collection: publications
category: manuscripts
permalink: /publication/2023-12-01-rpt-openmc-dh-system-chinese
excerpt: '针对双重非均匀系统中弥散颗粒随机分布导致的复杂几何结构问题，传统的中子物理计算方法往往难以处理。反应性等效物理转换（RPT）方法是一种常用的近似处理方法。本文分析了RPT方法的三个关键步骤，并基于OpenMC开发了RPT模块。'
date: 2023-12-01
venue: '强激光与粒子束'
venue_type: 'Journal'
paperurl: 'https://www.hplpb.com.cn/cn/article/doi/10.11884/HPLPB202335.230193'
keywords: 'OpenMC, 双重非均匀系统, 弥散颗粒燃料, 反应性等效物理转换方法'
---

针对双重非均匀系统中弥散颗粒随机分布导致的复杂几何结构问题，传统的中子物理计算方法往往难以处理。反应性等效物理转换（RPT）方法是一种常用的近似处理方法。

本文分析了RPT方法的三个关键步骤：精确初始值的求解、等效半径的求解以及燃耗算法的选择。讨论了不同算法对RPT方法效率和精度的影响。基于OpenMC，在Python API上开发了RPT模块。数值结果表明，优化后的RPT模块在保持良好计算效率的同时，能够满足工程计算精度的需求。
