# AMD ROCm Video Restoration Beta Research

This path is research-only. Normal Windows users should use `docs/WINDOWS_VIDEO_QUALITY.md` instead.

Phoenix's AMD quality path is **not** the ONNX DirectML path. DirectML ONNX is kept as a compatibility/fast path, but it can look smeary on archival footage.

The experimental AMD quality backend is `realbasicvsr`, a video-native restoration model that uses neighboring frames instead of processing still images one at a time.

## Target Hardware

- AMD Radeon RX 7800 XT / 7900 XT / 7900 XTX class GPUs
- RDNA 3 preferred
- 16 GB+ VRAM recommended
- Linux or WSL2 with ROCm-visible PyTorch

Windows DirectML is not the target for this backend. Windows AMD support requires a PyTorch build that exposes the GPU through `torch.cuda` with `torch.version.hip` set.

## Setup

Install ROCm/WSL support first:

```bash
sudo bash scripts/setup_amd_wsl.sh
```

Install ROCm PyTorch in your Phoenix environment, then install RealBasicVSR:

```bash
bash scripts/setup_realbasicvsr_rocm.sh
```

On Windows, use the experimental setup script from a Phoenix dev/app Python environment:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup_realbasicvsr_windows_rocm.ps1
```

If you already installed a Windows ROCm/HIP PyTorch build, keep it and skip the generic torch install:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/setup_realbasicvsr_windows_rocm.ps1 -SkipTorch
```

Probe with a short clip:

```bash
python scripts/probe_rocm_video_restore.py input/clip.mp4 output/clip-realbasicvsr.mp4 --max-seq-len 12
```

Run through the Phoenix CLI:

```bash
phoenix-upscale input/clip.mp4 output/clip-amd-quality.mp4 --quality amd_quality
```

In the desktop app, select **Quality mode -> AMD Quality Beta** before starting restoration.

## Current Backend

- `realbasicvsr`: primary AMD quality beta
- `basicvsr++`: backup candidate, not wired yet
- `rvrt` / `vrt`: research comparison only because the upstream license is non-commercial

## Notes

- RealBasicVSR is Apache 2.0, so it is a better commercial candidate than RVRT/VRT.
- The setup may need ROCm-specific fixes for old MMEditing/MMCV dependencies.
- Lower `--max-seq-len` or set `PHOENIX_REALBASICVSR_MAX_SEQ_LEN=8` if the 7800 XT runs out of VRAM.
