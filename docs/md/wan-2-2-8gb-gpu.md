---
title: "Running Wan 2.2 image-to-video on an 8 GB GPU, AMD included | Phoenix Labs"
description: "How we fit Wan 2.2's 14B image-to-video model into 4.2 GB of VRAM on 8 GB cards, Radeons on native Windows ROCm included: int4 weights streamed per block."
url: https://phoenixlabs.space/wan-2-2-8gb-gpu
---

Engineering notes

# Running Wan 2.2 image-to-video on an 8 GB GPU, AMD included

Wan 2.2's 14B image-to-video model normally wants a 24 GB card. We run it in 4.2 GB of video memory, on NVIDIA cards and on AMD Radeons natively on Windows. Three things do most of the work: int4 weights read from disk one transformer block at a time, the right ROCm attention kernel, and one copy that made attention twice as fast. A five-second 480p clip takes about seven and a half minutes on an RX 7800 XT held to 8 GB.

Updated 1 October 2026

These are the notes behind [Phoenix Motion desktop](https://phoenixlabs.space/motion-desktop), our image-to-video app. It's a paid product, but nothing below depends on it, and we'd rather the numbers were out there. Everything was measured on one machine: a Radeon RX 7800 XT (16 GB, gfx1101) capped at 8 GB with `torch.cuda.set_per_process_memory_fraction`, a Ryzen 9 5900X and 32 GB of RAM, on AMD's ROCm 7.2.1 Windows wheels (torch 2.9.1) with diffusers 0.40.0.

## The model

Wan 2.2 I2V-A14B (Apache 2.0) is a mixture of two 14B experts: one handles the high-noise early steps, the other the low-noise late ones. With the four-step lightx2v distillation LoRAs merged in, a clip takes four denoising steps instead of dozens. Each expert in bf16 is about 28 GB, so even one of them is far past an 8 GB card.

## 1. int4 weights, in small groups

Both experts are quantized to int4 in groups of 64 weights, each group with its own scale. A small search per group picks the clipping range (between 75% and 100% of the group's largest value) that gives the lowest error, which matters more at four bits than any other choice we tried. The T5 text encoder is int8. The whole pack, both experts plus encoder and VAE, is 23.5 GB on disk.

To check the cost in quality, we ran the same stills and seed through bf16, int8 and int4 on one H100. int4 tracked bf16 closely. One portrait went hazy partway through the clip, and the bf16 run did the same, slightly worse, so that's the four-step model, not the quantization. The Radeon's int4 output matched the H100's.

## 2. Stream one block at a time

Even at int4 the two experts don't fit in 8 GB alongside the activations. So the weights never all live on the card. A background thread reads each transformer block's weights from disk just before that block runs, and they're dropped once it's done. After the first step the files sit in the operating system's cache, and the reads stop costing anything measurable.

Result: **4.2 GB peak VRAM and 2 to 2.5 GB of system RAM** for a 480p clip. 720p doesn't fit at an 8 GB cap: the first expert's feed-forward runs out of memory, so we only offer 720p on cards with 12 GB or more.

## 3. ROCm on Windows, without WSL

AMD's official ROCm PyTorch wheels for Windows work natively on RDNA3 and RDNA4 cards (gfx1100, gfx1101, gfx1200, gfx1201). One flag decides whether this works at all:

`TORCH_ROCM_AOTRITON_ENABLE_EXPERIMENTAL=1`

Without it, scaled dot-product attention on these cards falls back to the math kernel, with no flash and no memory-efficient path, and a 480p attention step can't fit. With it, AOTriton's flash kernel runs.

## 4. The copy that halved attention time

Profiling showed attention was 80% of each step: 108 of 136 seconds. Yet one 480p self-attention (40 heads over 32,760 tokens) took 2.65 seconds inside the model and 1.33 seconds when we called it standalone. The difference was the memory layout. diffusers hands SDPA transposed views of q, k and v, and AOTriton's flash kernel is about twice as slow on that layout. Calling `.contiguous()` on the three tensors first costs about 2 ms and took a full step from about 136 seconds to about 86.

If you're running any diffusers video model on ROCm and attention looks slow, check this first.

## 5. The VAE in bf16, tiled

The video VAE was fp32 and tiled. In bf16 (still tiled) image encoding went from 62 to 33 seconds and decoding from 104 to 57, and its memory peak from 5.4 to 3.1 GB. Decoded frames came out at 59.6 dB PSNR against the fp32 decode, which is far closer than the VAE's own round trip (43.9 dB). Untiled, it runs out of memory under 8 GB in either precision.

## Where that leaves it

| Still (81 frames, 16 fps) | Total | Denoise | Decode | Peak VRAM |
| --- | --- | --- | --- | --- |
| Portrait, 752x528 (first in process) | 463 s | 398 s | 58 s | 4.26 GB |
| Logo, 848x464 | 444 s | 378 s | 60 s | 4.23 GB |
| House, 848x464 | 441 s | 376 s | 59 s | 4.23 GB |

Before the attention and VAE fixes the same clips took 719 to 849 seconds. Denoise includes encoding the input image; prompt encoding adds about 6 seconds. The first clip of a session also loads the model, which is why our [recorded walkthrough](https://youtu.be/PIdb_yZzVfs) took nine and a half minutes end to end.

## The finish

Wan's 480p output looks soft on a modern screen, so every clip can get an HD pass: Real-ESRGAN's realesr-general-x4v3, blended half and half with its denoising variant, takes each frame up 4x and back down to fit 1920x1080, in fp16 on the GPU. It adds about half a minute a clip and 0.8 GB of VRAM.

## What we'd still like to fix

- Seven and a half minutes is fine for a clip you care about and slow for experimenting. Most of it is still attention.
- The four-step model occasionally goes hazy mid-clip, usually on portraits. Another seed fixes it, but it would be better not to need one.
- Desktop clips are silent. The browser version of Phoenix Motion makes sound in the same pass; the desktop model doesn't.

Related: [Phoenix Motion desktop](https://phoenixlabs.space/motion-desktop) · [How to animate an old photo](https://phoenixlabs.space/animate-old-photos) · [Phoenix Motion in the browser](https://phoenixlabs.space/motion)

## Try it on your own card

Phoenix Motion desktop sets all of this up on first run, NVIDIA or AMD. The free trial has no time limit.

[See Motion desktop](https://phoenixlabs.space/motion-desktop)
