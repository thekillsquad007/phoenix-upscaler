---
title: "AI video upscaler for Linux: your options | Phoenix Upscaler"
description: "Topaz Video AI has no Linux version. The AI video upscalers that do run on Linux, free and paid, what each needs, and how they compare on old footage."
url: https://phoenixlabs.space/linux-video-upscaler
---

Linux

# AI video upscaling on Linux: what actually runs

Search for a video upscaler and most of what comes up, Topaz Video AI included, is Windows and Mac only. Linux has real options, though. Some are free and some take an evening of setup. Here's what each one is good at, what hardware it wants, and which to pick for old home video in particular.

Updated 20 November 2026

## The short version

- **Clean footage, cartoons, any GPU, free:** Video2X.
- **You like building pipelines:** VapourSynth, or chaiNNer for a visual editor.
- **Old tapes, DVDs and phone clips, one app:** Phoenix Upscaler, with an AMD or NVIDIA card with 8 GB or more.
- **No suitable graphics card:** a cloud service, since CPU-only AI upscaling takes hours per minute.

## Video2X

[Video2X](https://github.com/k4yt3x/video2x) is a free, open-source upscaler that runs well-known models like Real-ESRGAN, Real-CUGAN and RIFE (for frame interpolation) through Vulkan. Vulkan means it works on nearly any recent graphics card: AMD, NVIDIA or Intel, with the normal drivers. It's packaged for several distributions and as an AppImage.

It works one frame at a time, with models trained mostly on still images and anime. On clean footage and animation that's excellent. On old video it sharpens whatever is there, including tape noise, interlacing stripes and compression blocks, and frames can shimmer slightly from one to the next. Clean the clip first (see below) and it does much better.

## VapourSynth and chaiNNer

**VapourSynth** is the scriptable video toolkit archivists use. With plugins like QTGMC for deinterlacing and vs-mlrt for running AI models on the GPU, it can do everything a commercial restorer does, and you control every step. It's also the most work: Python scripts, plugin builds and tuning per clip.

**chaiNNer** is a free node editor for image models, with a Linux build. You wire up a chain of models visually, which makes it great for trying things. It's image-first, so for long videos you'll be splitting into frames and joining them back up.

## Phoenix Upscaler

[Phoenix Upscaler](https://phoenixlabs.space/upscaler) ships as an AppImage. Its Linux version runs Generative mode: a video diffusion model that rebuilds texture in faces, fabric and hair instead of only sharpening edges, while a second, source-faithful pass keeps people looking like themselves. Before that it works out what each clip needs. It deinterlaces interlaced tape and DVD captures, and deblocks heavily compressed low-resolution clips before the detail model sees them. You pick a clip and a quality level, and it does the rest.

- **Graphics card:** AMD Radeon RX 6000 series or newer, or NVIDIA, with 8 GB of video memory or more.
- **Setup:** the first time, the app downloads its own Python environment, PyTorch (ROCm or CUDA) and the model, about 25 GB, in 30 to 90 minutes. Nothing needs root. If your account isn't allowed to use the GPU for compute yet, the app shows the one command that fixes it.
- **Distribution:** built and tested on Ubuntu 24.04. Other current 64-bit distributions from 2024 on should work.
- **Price:** $129 once, no subscription. The free download restores 60-second clips with a small watermark.

It's honest to say what it isn't. The Linux version has no lighter mode for small cards (the Windows version does), so a card under 8 GB can't run it. And it's built for old footage. For clean HD or anime, Video2X is free and very good.

## How they compare

|  | Video2X | VapourSynth | Phoenix Upscaler |
| --- | --- | --- | --- |
| Price | Free | Free | $129 once |
| Graphics card | Any Vulkan card | Depends on plugins | AMD RX 6000+ or NVIDIA, 8 GB+ |
| Setup | Package or AppImage | Scripts and plugins | AppImage, one-click model setup |
| Deinterlacing | No | Yes (QTGMC) | Automatic |
| Model type | Per-frame image models | Your choice | Video diffusion plus a source-faithful base |
| Best at | Anime, clean footage | Full control | Old tapes, DVDs, phone clips |

## Cleaning old video first, with ffmpeg

Whatever upscaler you use, old footage turns out better when its damage is cleaned up before the AI sees it. For an interlaced tape or DVD capture, deinterlace and denoise lightly:

Deinterlace a tape capture

```
ffmpeg -i tape.mp4 -vf "bwdif=deint=interlaced,hqdn3d=2.0:1.5:3.0:2.5" \
  -c:v libx264 -crf 12 -preset fast -c:a copy tape_clean.mp4
```

For a blocky clip 288 pixels tall or less, deblock instead:

Deblock a low-res clip

```
ffmpeg -i lowres.mp4 \
  -vf "spp=5,deblock=filter=strong:block=8,hqdn3d=3.2:2.4:5.5:4.0" \
  -c:v libx264 -crf 12 -preset fast -c:a copy lowres_clean.mp4
```

The [deinterlacing guide](https://phoenixlabs.space/deinterlace-video) and the [low-resolution guide](https://phoenixlabs.space/upscale-low-resolution-video) explain each filter.

## Getting the GPU working

- **NVIDIA:** install the proprietary driver from your distribution. If `nvidia-smi` lists your card, CUDA apps that bring their own runtime (Phoenix does) will find it.
- **AMD:** the kernel's amdgpu driver is enough for Vulkan tools. ROCm apps also need your user in the `render` and `video` groups: `sudo usermod -aG render,video $USER`, then log out and back in.
- **Intel Arc:** works with Vulkan tools like Video2X. Most PyTorch-based upscalers, Phoenix included, don't support it on Linux yet.

## Questions

### Does Topaz Video AI run on Linux?

No. Topaz Video AI is made for Windows and macOS only, and Topaz doesn't offer a Linux build. On Linux you need one of the tools on this page, or a cloud service.

### What is the best free video upscaler for Linux?

Video2X, which is open source and runs Real-ESRGAN and other models on almost any graphics card through Vulkan. It's a good fit for cartoons and clean footage. On old, noisy, interlaced tape it sharpens the damage along with the picture unless you clean the clip first.

### Can I upscale video on Linux with an AMD graphics card?

Yes. Vulkan-based tools like Video2X work on any recent AMD card. Diffusion models need ROCm, AMD's compute platform, which supports the Radeon RX 6000 series and newer. Phoenix Upscaler sets ROCm up for its Generative mode itself, without root.

### Which Linux distributions does Phoenix Upscaler support?

It ships as an AppImage, so there's nothing to install system-wide. It's built and tested on Ubuntu 24.04, and other current 64-bit distributions from 2024 on should work. The free version lets you check on your own machine before you buy.

### Does upscaling work on Linux without a graphics card?

Only slowly. Plain resizing in ffmpeg works on any CPU, and some AI tools have CPU modes, but a minute of video can take hours. Phoenix's Linux version needs an AMD or NVIDIA card with 8 GB or more. Without one, [Phoenix Cloud Restore](https://phoenixlabs.space/studio) runs the same restoration in a browser.

Related: [AI upscaling on an AMD Radeon](https://phoenixlabs.space/ai-video-upscaling-amd-gpu) · [Topaz Video AI alternative](https://phoenixlabs.space/topaz-video-ai-alternative) · [Deinterlacing video](https://phoenixlabs.space/deinterlace-video) · [Upscaling a DVD to HD](https://phoenixlabs.space/upscale-dvd-to-hd) · [How to restore old video](https://phoenixlabs.space/restore-old-video) · [Phoenix Upscaler guide](https://phoenixlabs.space/upscaler-guide)

## Try it on your own machine

Download the AppImage, run the free version on a 60-second clip, and see whether your card and distribution are happy before you spend anything.

[Download Phoenix](https://phoenixlabs.space/upscaler#download)
