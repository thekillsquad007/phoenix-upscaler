---
title: "VHS restoration software: how to restore old tapes at home"
description: "How to restore VHS tapes at home: capture them well, then deinterlace, clean and upscale on your own PC. What software can fix, and what it can't."
url: https://phoenixlabs.space/vhs-restoration-software
---

VHS restoration software

# How to restore VHS tapes at home

Restoring a tape has two halves. First you capture it, playing it into a computer as cleanly as your VCR allows. Then restoration software fixes what the tape did to the picture: it deinterlaces, removes tape noise and rebuilds detail at a size that suits a modern screen. Phoenix Upscaler does the second half on your own Windows or Linux PC, for $129 once, and the tape never leaves your computer.

Updated 28 September 2026

## What's wrong with the picture, and where it gets fixed

Most tapes show several of these at once. Some are fixed in software and some only at capture, so it's worth knowing which is which before you spend an evening on it.

| What you see | What causes it | Where it gets fixed |
| --- | --- | --- |
| Combed, striped edges on anything that moves | Interlacing: each frame is two half-pictures taken a moment apart | Restoration software |
| Speckle that crawls, blotchy colour | Tape noise and colour noise | Restoration software |
| A soft picture that falls apart on a big TV | Low resolution: VHS records less detail than a DVD | Restoration software, within limits |
| Colour smearing past the edges of things | VHS stores colour at a very low resolution | Partly, in software |
| Wobbling verticals, a jittery picture | Timing errors in playback | At capture, with a time base corrector |
| White streaks and flashes | Dropouts, where the tape's coating is worn or damaged | At capture, with a clean, well-adjusted deck |
| Bands of noise, a rolling picture | Tracking | At capture, with the VCR's tracking control |
| A ragged strip along the bottom edge | Head-switching noise, normally hidden by a TV's overscan | Crop or mask it when you edit |

## Capture: the half software can't redo

Restoration works from whatever the capture gives it. A wobbly, badly tracked capture, restored well, is still wobbly.

- **Use the best VCR you can get, with clean heads.** Snow on every tape usually means dirty heads, not bad tapes.
- **Use S-Video if the VCR and capture device both have it.** It keeps brightness and colour apart and gives a cleaner picture than the yellow composite cable.
- **A time base corrector steadies the picture.** It removes wobble and helps the capture device hold sync. Some higher-end S-VHS decks have one built in; otherwise it's a separate box.
- **Capture at the tape's own size**, 720×480 for NTSC or 720×576 for PAL, to a lossless or high-bitrate file. Don't let the capture software shrink, crop or heavily compress it.
- **Leave it interlaced.** Deinterlacing is best done once, by the restoration, not first by the capture software.
- **Capture the whole tape in one go**, adjusting tracking as you watch. You can restore just the parts you want later.

## Then restore it

1. **Preview.** Pick a stretch with a face, some motion and a dark corner. Run a short Phoenix preview using Standard Restore first.
2. **Check the preview.** Check faces, text, motion, and noisy shadows before exporting a long tape.
3. **Choose a restoration mode.** Standard and Enhanced run on any modern AMD, Intel or NVIDIA Windows GPU. Generative rebuilds the most detail and runs on 8 GB+ NVIDIA cards, or on 16 GB+ AMD cards after a one-time in-app setup. Pick Generative when the preview looks better.
4. **Export at the size you'll watch.** 1080p suits most screens. VHS holds too little detail to gain much from 4K unless you'll watch on a big 4K TV.

## What a restored tape looks like

Cleaner, steadier and sharper, but still recognisably a tape. Faces close to the camera improve the most, because that's where the tape recorded the most real detail. People in the distance, background text and anything out of focus can only be guessed at, and Phoenix aims to stay faithful to the tape rather than invent a new face where the tape had a smudge. Dropouts and tracking damage that made it into the capture mostly stay.

## Why do it on your own PC

Old tapes hold things you may not want online: private conversations, addresses, people who never agreed to be filmed for the internet. Phoenix keeps restoration on your PC instead of requiring a cloud upload, and works offline once it's activated.

## Doing it with Phoenix

[Phoenix Upscaler](https://phoenixlabs.space/upscaler) reads each capture, deinterlaces it, cleans up the tape noise and picks its own settings for the source. It opens MP4, MOV, MKV and AVI files, runs on Windows and Linux for $129 once with every update included, and the free download restores 60-second clips so you can test your own tape first. No suitable PC? [Cloud Restore](https://phoenixlabs.space/studio) runs the same restoration on our GPUs, from $2.99 a clip.

## Questions

### What is the best software for restoring VHS tapes?

It depends on what you want to pay and how much you want to tinker. Phoenix Upscaler runs on your own Windows or Linux PC for $129 once and picks its settings for you. Topaz Video is the best-known alternative, on Windows and Mac, and is sold only as a subscription, $299 a year. If you're happy with scripts, free tools such as QTGMC for deinterlacing and Video2X for upscaling do a lot, with more setup. Whichever you choose, a good capture matters as much as the software.

### Can VHS be upscaled to 4K?

Yes, but 1080p gets you most of the improvement. VHS holds less detail than a DVD, so going to 4K mainly makes bigger files. It's worth it if you'll watch on a large 4K TV and would rather not leave the upscaling to the TV.

### Should I deinterlace VHS captures?

Yes, once. Capture the tape interlaced and deinterlace as the first step of the restore. Sharpening or upscaling before deinterlacing turns the combed edges into permanent jagged lines.

### Can software fix tracking lines and a wobbly picture?

Mostly not. Tracking noise, rolling and wobble come from playback, so they're fixed at capture, with the VCR's tracking control, clean heads and a time base corrector. Software is good at what's left: interlacing, noise and softness.

### How long does it take to restore a whole tape?

It depends on your graphics card and the mode. Time a 30-second test and multiply: a two-hour tape is 240 of those. You can also restore just the parts you care about rather than every minute.

### Do I have to upload my tapes to restore them?

No. Phoenix Upscaler works entirely on your own computer and doesn't need an internet connection once it's activated. Cloud Restore is there if you'd rather not use your own PC.

Related: [How to restore old video](https://phoenixlabs.space/restore-old-video) · [Old phone videos](https://phoenixlabs.space/old-phone-video) · [Topaz Video AI alternative](https://phoenixlabs.space/topaz-video-ai-alternative)

## Try it on your own tape

The free download restores 60-second clips with a small watermark. Restore a stretch with a face in it, then decide.

[Download Phoenix](https://phoenixlabs.space/upscaler#download)
