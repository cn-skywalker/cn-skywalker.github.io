---
title: "OpenMC 中弦长抽样方法的空间一致性设计与初步验证"
collection: talks
type: "Conference Talk"
permalink: /talks/2026-05-24-spatially-consistent-cls-openmc
venue: "第二十一届反应堆数值计算与粒子输运学术会议暨2026年反应堆物理会议（CORPHY2026）"
date: 2026-05-24
location: "武汉, 中国"
---

This talk presents the design and preliminary verification of a spatially consistent Chord Length Sampling (CLS) method implemented in OpenMC. By introducing position-dependent deterministic seeds through quantized spatial hashing, the method ensures that chord sampling sequences are deterministic functions of position and direction, fundamentally resolving the spatial inconsistency problem inherent in conventional CLS approaches. Preliminary verification using TRISO fuel particle and dispersed poison benchmark cases demonstrates keff deviations within 100 pcm for all four white-boundary spherical cases, without any post-hoc correction of effective packing fraction.
