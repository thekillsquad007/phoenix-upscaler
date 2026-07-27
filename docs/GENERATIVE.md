# Generative restoration (FlashVSR Lite & SeedVR2 Pro)

> **⚠️ NVIDIA required.** FlashVSR and SeedVR2 depend on CUDA‑only kernels (Block‑Sparse Attention, flash‑attn). They do **not** run on AMD or Intel GPUs.  
> AMD Windows users should use the **Windows Video Quality Pack** (`--quality windows_quality`) — a DirectML SAFA ONNX path with paired‑frame video restoration, no WSL or CUDA needed.

Phoenix can run **diffusion-based video restoration** on a local NVIDIA rig. This path is optional — the desktop app still works with classic upscaling without any of this.

## Quick start — Generative Lite (consumer, 8GB+)

```bash
# 1. Base GPU environment
bash scripts/remote_gpu_setup.sh

# 2. FlashVSR-Pro (Generative Lite, preferred on 8GB GPUs)
bash scripts/setup_flashvsr.sh

# 3. Run the consumer demo
bash scripts/run_generative_lite.sh
```

Direct CLI:

```bash
phoenix-upscale input.mp4 output.mp4 --quality generative_lite
```

The public Color Harmony demo (`docs/assets/demo/color-harmony-public-domain-demo-1080p.mp4`) was rendered with this pipeline using native‑safe FlashVSR, source‑safe Real‑ESRGAN base, and bounded detail transfer — no identity mutation from generative frames.

## Quick start — Generative Pro (farm, 12GB+)

SeedVR2 is the heavier path for detail synthesis. Install and run it only on 12GB+ GPUs or the patched render farm:

```bash
bash scripts/setup_seedvr.sh
bash scripts/run_gpu_generative.sh
```

## Pipeline

1. **Deinterlace** — yadif on interlaced VHS before generative.
2. **Scene-cut split** — chunks respect hard cuts when possible.
3. **Overlap + trim join** — ~0.5s overlap on 8GB; discard overlap when concatenating.
4. **Warm worker** — one model load per restart window.
5. **FlashVSR Lite** — 2× streaming diffusion on 8GB consumer GPUs.
6. **Source-safe 1080p delivery** — Real‑ESRGAN base from untouched source, generative donor via bounded detail transfer, then pad to 1080p. Face/identity geometry comes from the source, not the generative model.
7. **Polish** — optional (`--polish`); off by default on 8GB.

## How delivery keeps identity safe

Generative Lite does **not** output raw FlashVSR frames. Instead:

- **Source base** — Real‑ESRGAN **2×** on typical SD (not 4× — faster and enough for 1080p pad). Tiny sources still use 4×.
- **Detail donor** — FlashVSR frames go to 1080p (pad-only when already near-HD), then multi-band luma + mild chroma residuals transfer onto the source base.
- **Visible but safe defaults** — body strength ~0.62, face strength ~0.32, finish sharpen ~0.28. Geometry still comes from the source base.
- **Face protection** — faces get less aggressive transfer than the rest of the frame. Set `PHOENIX_FACE_SAFE=0` for full generative 1080p previews.

Tune if needed:

| Variable | Default | Effect |
|---|---|---|
| `PHOENIX_DETAIL_TRANSFER_STRENGTH` | `0.62` | Body/background generative texture |
| `PHOENIX_DETAIL_TRANSFER_FACE_STRENGTH` | `0.32` | Face texture (keep lower than body) |
| `PHOENIX_DETAIL_TRANSFER_CHROMA` | `0.35` | Color detail from donor |
| `PHOENIX_DETAIL_TRANSFER_MAX_DELTA` | `34` | Residual clamp (higher = punchier) |
| `PHOENIX_DELIVERY_SHARPEN` | `0.26` | Final 1080p unsharp |

Identity-mutating face models (CodeFormer/GFPGAN) are not shipped at all — see the license audit in the private repo (`internal/LICENSES.md`). FlashVSR delivery uses source-safe detail transfer.

## Auto GPU profiles

Phoenix detects your GPUs and picks safe FlashVSR defaults automatically:

| Tier | VRAM | Scale | Chunk length | Notes |
|---|---|---|---|---|
| **consumer_8gb** | ≤10 GB | 2× | 4s | no tiling, warm worker |
| **render_farm_8gb** | ≤10 GB | 2× | 2s | 512px pre-cap, sequential by default |
| **enthusiast_12gb** | ≤12 GB | 2× | 4s | warm worker |
| **pro_24gb** | ≤24 GB | 4× | 4s | showcase/HQ only |

On OOM, Phoenix retries: shorter chunk → `native_scale1` (no pre‑downscale) → `downscale_512` → `downscale_448` → `downscale_384`. The first tier that fits VRAM is used.

## VRAM & CPU tuning

| Variable | Auto (8GB) | Purpose |
|---|---|---|
| `PHOENIX_FLASHVSR_SCALE` | `2` | Generative upscale factor |
| `PHOENIX_FLASHVSR_CHUNK_SEC` | `4` | Seconds per temporal chunk |
| `PHOENIX_FLASHVSR_TILE_DIT` | `0` | Slow tiling; enabled only by OOM fallback |
| `PHOENIX_FLASHVSR_WARM_WORKER` | `1` | One model load per restart window |
| `PHOENIX_GPU_BLOCKLIST` | unset | Set to `0` only on the known flaky render-farm GPU |
| `OMP_NUM_THREADS` | `1` | Reduces CPU oversubscription |

Do not ship 4× + `PHOENIX_FLASHVSR_TILE_DIT=1` as a default on 8GB GPUs; it is a showcase/lab path and can take hours per short clip.

## Remote rig

```bash
export PHOENIX_GPU_HOST=192.168.1.69
export PHOENIX_GPU_USER=timpisynaptron
export PHOENIX_GPU_PASS=...   # or PHOENIX_GPU_KEY=~/.ssh/id_rsa
export HF_TOKEN=hf_...

python scripts/remote_process.py --duration 25 --quality flashvsr
```

## FlashVSR vs SeedVR2

| | **SeedVR2** | **FlashVSR** |
|---|---|---|
| Strength | Temporal restoration, detail synthesis | Fast 2× streaming VSR for consumer GPUs |
| VRAM | High (chunking required on 8GB) | Lower; still needs Block‑Sparse Attention build |
| Quality mode | `--quality generative_pro` | `--quality generative_lite` or `--quality flashvsr` |

FlashVSR weights: [FlashVSR-v1.1 on Hugging Face](https://huggingface.co/JunhaoZhuang/FlashVSR-v1.1).

## Troubleshooting

- **CUDA OOM** — set `PHOENIX_FLASHVSR_MAX_WIDTH=512` or reduce `PHOENIX_FLASHVSR_CHUNK_SEC` to `2`.
- **Port in use** — set `PHOENIX_SEEDVR_MASTER_PORT=29611` for SeedVR2 runs.
- **Missing `ema_vae.pth`** — re-run `bash scripts/setup_seedvr.sh`.
- **FlashVSR build fails** — Block‑Sparse Attention is validated on A100; 30‑series may need the ComfyUI community builds or classic fallback.
