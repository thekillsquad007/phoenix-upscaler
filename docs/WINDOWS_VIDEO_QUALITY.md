# Windows Video Quality Pack

> **For AMD / Intel GPU users**, this is your best path — paired-frame SAFA restoration through DirectML, no WSL or CUDA needed.  
> **For NVIDIA GPU users**, the **Generative** path (FlashVSR / SeedVR2) produces higher detail synthesis with diffusion models. See `docs/GENERATIVE.md`.

Phoenix's normal Windows quality path is **not** WSL, ROCm, or Stable Diffusion frame-by-frame img2img.

The Windows Quality Pack uses:

- ONNX Runtime DirectML
- SAFA video-native ONNX model
- Neighboring-frame paired inference for temporal consistency
- AMD, Intel, and NVIDIA Windows GPUs through DirectX 12

## Install

From the desktop app, choose **Quality mode -> Windows Video Quality** and click **Install Quality Pack** if prompted.

Developer/manual install:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup_windows_video_quality_pack.ps1
```

The installer downloads `safa_v0.5.7z` from `AmusementClub/vs-mlrt`, extracts `safa_v0.5_non_adaptive.onnx`, and stores it at:

```text
%USERPROFILE%\.phoenix\models\safa\safa_v0.5_non_adaptive.onnx
```

## CLI

```powershell
python -m phoenix_upscaler.cli input.mp4 output.mp4 --quality windows_quality --preset vhs --scale 2
```

## Pipeline (quality)

1. **Preprocess** — deinterlace/denoise from the selected preset.
2. **SAFA temporal restore** — sliding neighboring-frame pairs on DirectML (better temporal stability than still-image SR).
3. **Neural 2×** — ONNX Real-ESRGAN / Nomos on DirectML (not Lanczos).
4. **Polish** — sharpen + mild contrast/saturation for archival footage.
5. **1080p delivery** — pad/scale to 1920×1080 with light unsharp.

## Longer clips

- Sliding SAFA pairs improve quality (~2× SAFA cost). For maximum throughput on long files:
  ```powershell
  $env:PHOENIX_SAFA_SLIDE="0"
  ```
- Intermediate frame folders are freed as stages complete to keep disk use lower on long jobs.
- Free tier GUI limit is 90s; Pro allows up to 2 hours per file. CLI is unrestricted by license guard.

## Tuning

| Variable | Default | Effect |
|---|---|---|
| `PHOENIX_SAFA_SLIDE` | `1` | Sliding pairs (quality) vs non-overlap (speed) |
| `PHOENIX_SAFA_NEURAL` | `1` | ONNX neural 2× after SAFA |
| `PHOENIX_SAFA_SHARPEN` | `0.32` | Frame polish sharpen |
| `PHOENIX_SAFA_1080P` | `1` | Pad/deliver 1920×1080 |
| `PHOENIX_SAFA_CONTRAST` | `1.06` | Mild contrast lift |
| `PHOENIX_SAFA_SATURATION` | `1.08` | Mild color lift |

## Notes

- This is video-native: it processes paired neighboring frames, not still images independently.
- DirectML must appear in `onnxruntime.get_available_providers()` as `DmlExecutionProvider`.
- The base installer stays small; the model pack is downloaded only when this mode is selected.
- FlashVSR / SeedVR2 generative modes still require NVIDIA CUDA; on AMD this Windows path is the recommended high-quality option.
