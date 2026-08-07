# Phoenix Upscaler

**Bring VHS tapes, camcorder footage, and old DVDs back to life.**

Phoenix is built for people who care about family history, not Hollywood budgets. Drop in a clip, pick a preset, get back restored video. Run it on your own computer for a one-time $129, or use the cloud studio and pay only for the clips you restore.

**[Try it free →](https://phoenixlabs.space/)** · **[Get the desktop app ($129 once) →](https://phoenixlabs.space/#price)** · **[Open the cloud studio →](https://phoenixlabs.space/studio.html)**

---

## Why Phoenix exists

You found a box of tapes. Maybe your parents' wedding, maybe an old camcorder recording, maybe a concert you rented a VHS off someone for years ago. The footage matters, but it's fuzzy, interlaced, and stuck at VHS quality.

Topaz Video AI is the usual answer, and it's good, but as of late 2025 they stopped selling a one-time license entirely. It's $299/yr now, subscription only, for restoration that's largely built on the same open models anyone can access.

Phoenix does the same job (denoise, deinterlace, rebuild lost detail) for $129 once. You own it. No renewal, no credits, no upsell.

---

## Two ways to restore a tape

|  | **Desktop app** | **Cloud studio** |
|---|---|---|
| **Price** | $129 once | Pay per clip, from $2.99 |
| **Requires** | Your own NVIDIA GPU | Nothing — any OS, any device |
| **Privacy** | Fully local, nothing uploads | Uploaded only for the job, deleted after |
| **Best for** | A whole shoebox of tapes | An occasional clip |

Same restoration engine either way. If you have an NVIDIA GPU and tapes to get through, the desktop app is the better value. If you don't, or you've just got one clip, the [cloud studio](https://phoenixlabs.space/studio.html) does the same job with no install and no hardware requirements.

---

## See it in action

Real restoration on a public-domain 1952 home movie, print damage and all:

![Before and after](docs/assets/demo/enhanced_after.jpg)

More before/afters, including a second clip from 1938, on the **[official site](https://phoenixlabs.space/#proof)**.

---

## Download

Get the latest desktop build from **[Releases](https://github.com/thekillsquad007/phoenix-upscaler/releases/latest)**.

| Platform | Installer |
|---|---|
| **Windows** | `PhoenixUpscaler-Setup.exe` — double-click, Next, done |
| **Linux** | `PhoenixUpscaler.AppImage` — chmod +x, run |
| **macOS** | Not available yet — use the [cloud studio](https://phoenixlabs.space/studio.html) instead |

No Python, no command line. AI models are included and it works fully offline after install.

No NVIDIA card at all? Skip the download and use the **[cloud studio](https://phoenixlabs.space/studio-app.html)** instead.

---

## What you get

- **Denoise** — kills the crawling speckle VHS tape leaves behind
- **Deinterlace** — fixes the torn, striped edge on anything that moves
- **Detail reconstruction** — hair, fabric, signage, things the tape blurred into a smudge come back readable
- **Auto mode** — Phoenix reads the footage and picks its own settings
- **Generative restoration** — on 8GB+ VRAM NVIDIA cards, an optional diffusion-based mode (FlashVSR) goes further on badly degraded sources; 12GB+ unlocks a higher-quality generative tier (SeedVR2)
- **Free tier** — restore 60-second clips with a small watermark, no purchase required to try it

---

## Pricing

**Desktop — $129 once.** Yours permanently, every future update included free, no watermark, any clip length, install on up to 3 of your own computers, works offline once activated.

**Cloud studio — pay per job, from $2.99.** Standard quality matches the desktop app. Enhanced and Studio Max modes add AI detail reconstruction for badly degraded tape. Exact price shown before you pay. A failed job is refunded automatically.

Card and UPI payments are handled by Lemon Squeezy, our merchant of record. A license key for the desktop app arrives by email immediately after purchase.

---

## Who Phoenix is for

- Families digitizing VHS and camcorder tapes
- Anyone restoring old TV captures or personal concert/event recordings
- People who want Topaz-class results without a Topaz-class subscription
- Anyone who'd rather their footage never touch a server (desktop mode)

## Who Phoenix is not for

- Hollywood VFX pipelines — use Topaz + DaVinci
- Real-time streaming upscaling
- Expecting detail the original tape never recorded — Phoenix restores what's there, it doesn't invent footage

---

## GPU compatibility (desktop app)

|  | **NVIDIA** | **AMD** | **Intel / integrated** |
|---|---|---|---|
| **Standard (denoise, deinterlace, upscale)** | Full speed, CUDA | Supported via DirectML | CPU fallback, slow |
| **Generative Lite — FlashVSR** | 8GB+ VRAM | Not supported (CUDA-only kernels) | Not supported |
| **Generative Pro — SeedVR2** | 12GB+ VRAM | Not supported | Not supported |

No NVIDIA GPU, or below the minimum? The [cloud studio](https://phoenixlabs.space/studio.html) runs the same restoration, including the generative modes, on our GPUs instead.

---

## FAQ

**Does my video get uploaded anywhere?**
Not with the desktop app. Everything happens on your machine, and once activated it doesn't need an internet connection to run. The cloud studio uploads a clip only for the duration of that job, then deletes both the source and the result.

**Is this a subscription?**
No. The desktop app is $129 once, forever, including future updates. The cloud studio has no subscription either, you pay per job in dollars with no credits.

**How is this different from Topaz?**
Same tier of restoration problem (interlacing, noise, lost detail), a fraction of the price, and you actually own it, Topaz no longer sells a one-time license at all.

**What formats work?**
MP4, MOV, MKV, and AVI.

**Will it make a bad tape look brand new?**
No, and be wary of anything claiming otherwise. Detail the tape never recorded can't be recovered, only what's genuinely there gets pulled out and cleaned up.

---

## Official website

Full showcase, before/after demos, pricing, and both download paths:

**https://phoenixlabs.space/**

---

## Repository

This repo contains the **marketing site**, **release installers**, and **demo assets**. Application source is proprietary.

© 2026 Phoenix Labs.
