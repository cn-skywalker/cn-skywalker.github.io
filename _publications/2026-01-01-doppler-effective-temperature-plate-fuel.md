---
title: "Numerical study on Doppler effective temperature for plate-type fuel based on MOOSE platform"
collection: publications
category: manuscripts
permalink: /publication/2026-01-01-doppler-effective-temperature-plate-fuel
excerpt: 'The intense spatial self-shielding effect and unique thermal–hydraulic characteristics of plate-type fuel elements pose new challenges for high-fidelity neutronics/thermal–hydraulic coupling. A novel interpolated effective temperature model for plate-type fuels is proposed, building upon the TROW and TC-S formulations.'
date: 2026-01-01
venue: 'Annals of Nuclear Energy'
venue_type: 'Journal'
paperurl: 'https://www.sciencedirect.com/science/article/pii/S0306454926003014'
keywords: 'Cardinal, OpenMC, MOOSE, Moderator-to-fuel ratio (MFR), Plate-type fuel, Effective Doppler temperature, High-fidelity multiphysics data mapping strategy'
---

The intense spatial self-shielding effect and unique thermal–hydraulic characteristics of plate-type fuel elements pose new challenges for high-fidelity neutronics/thermal–hydraulic coupling. To evaluate the inherent loss of spatial resolution in conventional lumped-parameter Doppler models, high-resolution 3D simulations were conducted using a high-fidelity multiphysics data mapping strategy based on the Cardinal framework within the MOOSE platform.

To overcome these limitations, a novel interpolated effective temperature model for plate-type fuels is proposed, building upon the TROW and TC-S formulations. By integrating the fuel surface, centerline, and volume-averaged temperatures, this model introduces a dimensionless parameter γ to physically quantify the spatial resonance absorption distribution. A universal constant-γ scheme was established by verifying the model's applicability across various moderator-to-fuel ratios (MFRs). Results demonstrate that applying γ = −0.969 yields a mean absolute error of only 9 pcm in Doppler reactivity, which is strictly bounded within the inherent statistical uncertainty of the Monte Carlo method. Validation at the assembly level, comprising five fuel plates, demonstrates that the universal model predicts reactivity feedback with a discrepancy of only 7 pcm relative to the explicit 3D high-fidelity benchmark. This physically grounded formulation provides a highly accurate and computationally efficient approach for core-wide safety evaluations of plate-type reactors.
