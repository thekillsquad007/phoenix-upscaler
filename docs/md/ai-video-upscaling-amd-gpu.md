---
title: "AI video upscaling on an AMD Radeon GPU | Phoenix Upscaler"
description: "Most AI video upscalers assume an NVIDIA card. What works on a Radeon, which cards run diffusion upscaling, how fast it is, and what we had to fix."
url: https://phoenixlabs.space/ai-video-upscaling-amd-gpu
---

AMD and Radeon

# AI video upscaling on an AMD Radeon GPU

Most AI video upscalers are written for NVIDIA cards first and AMD cards never. A Radeon can do the job. Lighter neural upscalers run on almost any recent card, and the heavy diffusion models run on the newer ones through AMD's ROCm. It takes more setup, and it's slower than NVIDIA. Here's what works, on which cards, and what we had to fix to get there.

Updated 8 November 2026

## Two kinds of AI upscaler, and why AMD support differs

- **Neural upscalers** (Real-ESRGAN and its relatives, and video restoration models that compare neighbouring frames). These are small enough to export to portable formats. On Windows they can run through DirectML, and elsewhere through Vulkan, both of which work on Radeon cards. Fast enough for whole tapes.
- **Diffusion upscalers** (FlashVSR, SeedVR and similar). These rebuild texture instead of sharpening what's there, so they give the biggest visible jump. They're also big research models written for PyTorch on CUDA, sometimes with CUDA-only parts. On AMD they need ROCm, AMD's answer to CUDA, which supports fewer cards.

## What runs on your card

| Your setup | What Phoenix uses |
| --- | --- |
| Windows, any modern Radeon (4 GB or more) | Enhanced: neural video restoration through DirectML. No setup. |
| Windows, RX 7800 XT, RX 7900 or RX 9000 series, Radeon PRO W7000, Ryzen AI Max | Generative too: diffusion detail, after a one-time setup that installs WSL2 and AMD's ROCm for WSL. 32 GB of system memory recommended. |
| Linux, RX 6000 series or newer, 8 GB or more | Generative, with ROCm set up by the app. Nothing needs root. |
| No usable graphics card | Phoenix says so and points you to [Cloud Restore](https://phoenixlabs.space/studio) instead of making a restore that isn't worth keeping. |

The Windows Generative list is the set of cards AMD supports for ROCm under WSL. It will grow as AMD adds cards.

## Why Windows goes through WSL2

PyTorch's ROCm builds have been most complete on Linux. So on Windows, Phoenix sets up a small Linux system inside Windows Subsystem for Linux (WSL2) and runs the diffusion model there, talking to your Radeon through AMD's WSL driver. Windows may ask to turn WSL on and to restart once. After that it's invisible: you press Restore in the same app.

## What we had to fix to make diffusion work on a Radeon

We run FlashVSR, a one-step diffusion video upscaler, for Generative. Getting it from “CUDA only” to a usable picture on a 16 GB RX 7800 XT took a handful of changes. If you're porting something similar yourself, these are the ones that cost us time.

- **A CUDA-only attention kernel.** FlashVSR is built around a block-sparse attention extension that only exists for CUDA. On AMD we fall back to PyTorch's standard attention, using AMD's AOTriton kernels so it doesn't run out of memory.
- **A bug that turned every frame into noise.** Passing the model's sparsity pattern to the standard attention as a mask looked correct and produced pure static on RDNA3. Plain dense attention, ignoring the mask, gives the right picture. It's slower, but it's the version that works.
- **Memory that fragments.** Long clips crept up in memory until they failed. Processing in chunks, moving finished frames off the card, and cleaning up between chunks fixed it.
- **WSL reporting the wrong amount of RAM.** Inside WSL the system looks much smaller than it is, and our memory planning got far too cautious, reloading the model every couple of chunks. The app now passes the real figure from Windows, which made jobs roughly twice as fast.

## How fast it is

On an RX 7800 XT, Generative takes about a minute of processing per second of 320 to 360p footage. That's fine for the clips you care about most: a wedding speech, a first birthday, a few minutes of a holiday. A full two-hour tape isn't a sensible Generative job on this card. The Enhanced mode is much faster and suits long footage, and NVIDIA cards with the CUDA kernel are faster again.

## The quality catch, on any brand of card

Diffusion upscalers on their own tend to warp on fast motion: an edge drifts a few pixels from where it was, a face changes shape slightly from frame to frame. So Phoenix never delivers the diffusion picture as it is. A conventional restore holds the shape of everything, and the diffusion output only contributes fine detail where it lines up with that. Where they disagree, the steady version wins. You get the texture without the wobble.

## Doing it with Phoenix

[Phoenix Upscaler](https://phoenixlabs.space/upscaler) is a desktop app for restoring old video (tapes, DVDs, film scans, early phone clips) on Windows and Linux, NVIDIA or AMD, for $129 once with every update included. It picks the best engine your card supports. The [setup guide](https://phoenixlabs.space/upscaler-guide) explains exactly what the Generative install adds. The free download restores 60-second clips with a small watermark, so you can see what your Radeon does with your footage before paying. Generative mode comes with the licence.

## Questions

### Can an AMD GPU do AI video upscaling?

Yes. Upscalers built on DirectML or Vulkan run on any recent Radeon. The heavier diffusion upscalers need AMD's ROCm, which covers fewer cards and, on Windows, runs inside WSL2. It works, but it's slower than on a comparable NVIDIA card.

### Which Radeon cards can run Phoenix's Generative mode?

On Windows, the cards AMD supports for ROCm under WSL: the Radeon RX 7800 XT, RX 7900 and RX 9000 series, Radeon PRO W7000 and Ryzen AI Max. On Linux, Radeon RX 6000 series or newer with 8 GB or more. Every other modern Radeon on Windows runs the Enhanced mode.

### Why do so many AI video tools only support NVIDIA?

Most research models are written and tested on CUDA, NVIDIA's compute platform, and some depend on CUDA-only pieces such as custom attention kernels. Porting them to AMD means replacing those pieces and re-testing the picture, which most projects never get round to.

### How fast is diffusion upscaling on a Radeon?

On an RX 7800 XT, Phoenix's Generative mode takes about a minute of processing for each second of 320 to 360p footage. That's fine for clips and highlights. A whole two-hour tape is better suited to the Enhanced mode or to Cloud Restore.

### Is there a free upscaler that works on AMD?

Yes. Video2X uses Vulkan builds of Real-ESRGAN and similar models, which run on Radeon cards. It's free for any length if you're comfortable setting it up. Phoenix's free download restores 60-second clips with a small watermark.

Related: [Upscaling 240p and 360p video](https://phoenixlabs.space/upscale-low-resolution-video) · [Running Wan 2.2 on an 8 GB GPU, AMD included](https://phoenixlabs.space/wan-2-2-8gb-gpu) · [Phoenix Upscaler guide](https://phoenixlabs.space/upscaler-guide)

## See what your Radeon can do

The free download restores 60-second clips with a small watermark. Generative mode comes with the licence.

[Download Phoenix](https://phoenixlabs.space/upscaler#download)
