---
title: "A spatially consistent chord length sampling method for particle transport in stochastic media"
collection: publications
category: manuscripts
permalink: /publication/2026-11-01-spatially-consistent-chord-length-sampling
excerpt: 'The Chord Length Sampling (CLS) method is an efficient implicit geometric modeling approach for particle transport simulation in stochastic media. We develop a CLS transport method implemented in OpenMC, where position-dependent deterministic seeds endow chord length sampling with spatial consistency and reproducibility, and a physically consistent boundary treatment eliminates conventional packing fraction correction parameters.'
date: 2026-11-01
venue: 'Computer Physics Communications'
venue_type: 'Journal'
paperurl: 'https://www.sciencedirect.com/science/article/pii/S0010465526003449'
keywords: 'OpenMC, Stochastic media, Chord Length Sampling, Monte Carlo, Dispersion fuel'
---

The Chord Length Sampling (CLS) method is an efficient implicit geometric modeling approach for particle transport simulation in stochastic media. In conventional implementations, however, each particle independently samples chord lengths, causing the material distribution at a given spatial position to vary from particle to particle. In this work, a CLS transport method for stochastic media is developed and implemented in OpenMC, where position-dependent deterministic seeds are employed to endow chord length sampling with both spatial consistency and reproducibility. A physically consistent boundary treatment further eliminates the need for conventional packing fraction correction parameters.

The method is systematically evaluated through a three-tier progressive validation strategy using neutron criticality calculations. For four sets of white-boundary spherical benchmark cases, the keff deviations all fall within 100 pcm. A PWR single-pin benchmark with 28 parameter combinations and an MTR single-plate benchmark with multiple thicknesses reveal that CLS deviations are primarily governed by geometric parameters, with the deviation direction depending on the relative neutronic properties of the sphere and matrix materials. The parameter β, defined as the ratio of the mean chord segment period to the characteristic size D of the stochastic medium, is identified as the governing parameter for CLS applicability in finite-geometry dispersion fuels. The systematic bias scales as Δkeff ∝ β, and deviations remain on the order of 100 pcm for β < 0.1.

Notably, the computational throughput of the CLS method does not degrade with increasing dispersion sphere count, and the geometric storage requirement at the million-sphere scale amounts to less than one hundred-thousandth of that required by the explicit method. The geometric acceleration framework of the method is independent of the transported particle type and can be extended to broader radiation transport scenarios.
