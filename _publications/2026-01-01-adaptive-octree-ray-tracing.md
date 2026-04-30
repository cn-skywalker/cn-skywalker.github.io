---
title: "An Adaptive Octree-based Ray Tracing Method for Particle Transport in Stochastic Media"
collection: publications
category: manuscripts
permalink: /publication/2026-01-01-adaptive-octree-ray-tracing
excerpt: 'To address the limitations of uniform grids in handling non-uniform, multi-scale material heterogeneities and accelerate geometric queries in Monte Carlo simulations of stochastic media, we develop an adaptive octree-based ray tracing method. The approach builds a spatial index governed by a maximum node capacity threshold and integrates a leaf finding search, Morton coding, and a neighbor-list accelerator, boosting ray-tracing performance in stochastic media.'
date: 2026-01-01
venue: 'Computer Physics Communications'
venue_type: 'Journal'
paperurl: 'https://www.sciencedirect.com/science/article/pii/S0010465526001694'
keywords: 'OpenMC, Stochastic media, Ray Tracing, Octree, Monte Carlo'
---

To address the limitations of uniform grids in handling non-uniform, multi-scale material heterogeneities and accelerate geometric queries in Monte Carlo simulations of stochastic media, we develop an adaptive octree-based ray tracing method. The approach builds a spatial index governed by a maximum node capacity threshold and integrates a leaf finding search, Morton coding, and a neighbor-list accelerator, boosting ray-tracing performance in stochastic media. A theoretical model of octree tracking efficiency and memory use is formulated, yielding an optimal node capacity threshold.

We validated the approach using three cases spanning tens of thousands to millions of particles. Averaged across all benchmark cases, the results demonstrate that: (1) the neighbor-list algorithm delivers the highest efficiency, achieving a speedup of 22.3% over the leaf finding method, followed by Morton coding (10.7%) (2) memory use is inversely proportional to the capacity threshold, with neighbor lists incurring the greatest overhead and leaf find method the least; (3) computational efficiency can be modeled by a generalized power law with respect to the mean particles per node. For systems with ~10⁴, ~10⁵, and ~10⁶ particles, optimal mean particles per node of 10, 5–6, and 3–4, respectively, simultaneously minimize memory and maximize efficiency. The method provides an effective tool for high-fidelity stochastic media simulations in applications such as reactor fuel design and radiation shielding composites.
