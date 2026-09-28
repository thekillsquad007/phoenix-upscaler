# Phoenix Upscaler

**Restore and upscale old video on your own PC.**

Phoenix Upscaler is a desktop app for Windows and Linux that makes old footage watchable on a modern screen. It removes tape and sensor noise, fixes the combed edges of interlaced video, and rebuilds the detail that compression threw away, then upscales up to 4K. It runs on your own graphics card, so nothing uploads. $129 once, every update included. Made by [Phoenix Labs](https://phoenixlabs.space/).

**[Download it free](https://github.com/thekillsquad007/phoenix-upscaler/releases/latest)** · **[Website](https://phoenixlabs.space/upscaler)** · **[No suitable PC? Restore in the cloud](https://phoenixlabs.space/studio)**

![A frame from a 1952 home movie, restored with Phoenix Upscaler](docs/assets/demo/enhanced_after.jpg)

*A frame from* Texas Farm Family *(1952, public domain, via the Prelinger Archives), restored with Phoenix. Drag-to-compare before and afters are on the [website](https://phoenixlabs.space/upscaler#proof).*

---

## At a glance

| | |
|---|---|
| **What it fixes** | Noise, interlacing, compression damage and low resolution. Output up to 4K. |
| **Footage** | VHS, Hi8 and MiniDV tapes, DVDs, 8mm and Super 8 film scans, phone clips from the 2010s, old uploads, gameplay and webcam recordings |
| **Runs on** | Windows 10 and 11, and Linux, on your own graphics card. No macOS version yet. |
| **Price** | $129 once. Every future update included, nothing renews, installs on up to three of your own computers. |
| **Free trial** | The download restores 60-second clips with a small watermark. |
| **Privacy** | All work happens on your PC. Works offline once activated. |
| **Opens** | MP4, MOV, MKV and AVI |

## Why pay once

Topaz Video, the best-known tool for this job, has been sold only as a subscription since 2025: $299 a year. Phoenix does one job, making old footage look right again, and it costs $129 once. The [side-by-side comparison](https://phoenixlabs.space/topaz-video-ai-alternative) covers price, platforms and when Topaz is the better pick.

## No suitable PC?

[Phoenix Cloud Restore](https://phoenixlabs.space/studio) runs the same restoration on our GPUs, so it works from a Mac, a laptop or a phone. Upload a clip, see the price in dollars, pay for that one job, and download the result. From $2.99 a clip, and a job that fails is refunded.

## What it won't do

Phoenix restores what the camera recorded. It can't bring back detail that was never there: a shot that was out of focus stays out of focus, and a face a few pixels wide can only be guessed at. It's built for old footage, not for Hollywood VFX pipelines or real-time upscaling of a stream.

## Guides

- [How to restore old video](https://phoenixlabs.space/restore-old-video): working out what's wrong and fixing it in the right order
- [How to restore VHS tapes at home](https://phoenixlabs.space/vhs-restoration-software): capturing well, and what software can and can't fix
- [How to make old phone videos look better](https://phoenixlabs.space/old-phone-video): finding the best copy and what size to export
- [Phoenix Upscaler guide](https://phoenixlabs.space/upscaler-guide): setup, quality modes and troubleshooting

## Download

Get the latest build from **[Releases](https://github.com/thekillsquad007/phoenix-upscaler/releases/latest)**: a Windows installer and a Linux AppImage. No Python or command line needed. System requirements are on the [website](https://phoenixlabs.space/upscaler#download).

## Questions

**Is Phoenix Upscaler a subscription?**
No. It's $129 once, with every future update included. Cloud Restore is paid per clip, in dollars, with no subscription or credits.

**Does my video get uploaded?**
Not with the desktop app. Cloud Restore uploads a clip only to process it, deletes it automatically afterwards, and never uses it to train a model.

**Does it run on a Mac?**
Not yet. On a Mac, use Cloud Restore in the browser.

**What graphics card do I need?**
On Windows, any modern NVIDIA, AMD or Intel card runs it. Generative, the mode that rebuilds the most detail, needs a stronger NVIDIA or AMD card, and the app sets it up for you. The full list is on the website.

## Also from Phoenix Labs

- **[Phoenix Motion](https://phoenixlabs.space/motion)** turns a still image into a five-second video with sound, from $0.59 a clip.
- **[Phoenix Editor](https://phoenixlabs.space/editor)** cuts the dead air out of streams and recordings and makes captioned Shorts, $99 with a year of updates.
- AI assistants such as Claude, ChatGPT and Cursor can use Cloud Restore and Phoenix Motion through our MCP server, with a spending limit you set: [phoenixlabs.space/developers](https://phoenixlabs.space/developers).

(Phoenix Labs here is the video software company at phoenixlabs.space, not the video game studio of the same name.)

---

This repository holds the website (`docs/`), release installers and demo assets. The application source is proprietary. Support: support@phoenixlabs.space. © 2026 Phoenix Labs.
