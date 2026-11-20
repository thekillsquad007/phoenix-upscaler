---
title: "How to upscale a DVD to HD (1080p) | Phoenix Upscaler"
description: "Home DVDs look soft and blocky on a big TV. How to copy the video off the disc, fix its shape and interlacing, and upscale it to 1080p without new damage."
url: https://phoenixlabs.space/upscale-dvd-to-hd
---

DVD

# How to upscale a DVD to HD

A wedding DVD, a tape transfer from the 2000s, a camcorder that burned straight to disc: on a modern TV they all look soft, smeared and a little blocky. A DVD is a better source than the tape it often came from, so it scales up well, but only if you copy it off the disc cleanly and fix two quirks first.

Updated 20 November 2026

## What's on a DVD

Every DVD stores the picture at 720×480 (NTSC: North America and Japan) or 720×576 (PAL: most of Europe, Asia and Australia), compressed with MPEG-2. That's about a sixth of the pixels in a 1080p frame. Two other things matter before you upscale:

- **The pixels aren't square.** The same 720-wide frame is shown at 4:3 or stretched to 16:9 widescreen, depending on a flag in the file.
- **Most home DVDs are interlaced.** Anything from a camcorder or a tape was recorded as interlaced video, and the disc keeps it that way.

## 1. Copy the video off the disc, untouched

You want the MPEG-2 video exactly as it is on the disc. Anything that “converts” it to MP4 at the same time compresses it a second time, and the upscaler will sharpen those new blocks too.

- **MakeMKV** (free while in beta, Windows, Mac and Linux) copies each title on the disc into one MKV file with no re-encode. The easiest route.
- **The files themselves.** Open the disc's `VIDEO_TS` folder. The video sits in `VTS_01_1.VOB`, `VTS_01_2.VOB` and so on, split into 1 GB pieces. ffmpeg can join them without re-encoding (below).

## 2. Fix the shape

This is the step most people miss. A 720×480 frame is 3:2, but a 4:3 disc is meant to be shown narrower and a widescreen disc wider. DVD players read that from the file. Many editors and upscalers don't, and keep the 720×480 shape, so everyone looks slightly too wide (4:3) or too thin (16:9).

Resizing to square pixels before upscaling settles it for every tool that comes after: 640×480 or 768×576 for a 4:3 disc, 854×480 or 1024×576 for widescreen. The ffmpeg command below works out the right width from the file.

## 3. Deinterlace, or undo pulldown

Pause on something moving. Fine horizontal stripes on its edges mean the disc is interlaced. Home video needs a deinterlacer, and it has to run before anything else touches the picture.

Discs of films and TV series from NTSC countries are different. They usually carry 24-frame film spread over 30-frame video in a 3:2 pattern, which needs inverse telecine, not deinterlacing. The [deinterlacing guide](https://phoenixlabs.space/deinterlace-video) explains both and has the commands.

## 4. Upscale once, to 1080p

Going from 480 or 576 lines to 1080 is a bit more than twice in each direction, which is well within what a good upscaler handles. Do it in one pass. Upscaling in steps, or restoring and then upscaling again, stacks each step's artifacts.

A proper video upscaler also handles the MPEG-2 damage: blocks in dark scenes and fast motion, and fizzy “mosquito” noise around edges. A plain resize, like the one your TV does, makes those bigger along with everything else.

## 5. Keep the original copy

Hold on to the untouched MKV or VOB files from step 1. Discs don't last forever, and restoration tools keep getting better. With the original copy you can always redo it later.

## Doing it yourself with ffmpeg

The free command-line tool [ffmpeg](https://ffmpeg.org/) handles the copying and the clean-up. To join a title's VOB files without re-encoding:

Join the VOB files

```
ffmpeg -fflags +genpts -i "concat:VTS_01_1.VOB|VTS_01_2.VOB|VTS_01_3.VOB" \
  -map 0:v -map 0:a -c copy dvd.mkv
```

Then fix the shape and deinterlace in one pass, keeping it close to lossless for the upscaler:

Square pixels and deinterlace

```
ffmpeg -i dvd.mkv \
  -vf "bwdif=mode=send_frame:parity=auto:deint=interlaced,scale=trunc(iw*sar/2)*2:ih:flags=lanczos,setsar=1" \
  -c:v libx264 -crf 12 -preset slow -c:a copy dvd_clean.mp4
```

- `bwdif` deinterlaces, and `deint=interlaced` touches only frames the disc marks as interlaced.
- `scale=trunc(iw*sar/2)*2:ih` widens or narrows the frame by the pixel shape the file declares, and `setsar=1` marks the result as square.
- `-crf 12` keeps it nearly lossless, so the upscaler sees the disc's picture and not a new layer of compression.
- On a film or TV series from an NTSC disc, swap `bwdif=...` for `fieldmatch,bwdif=deint=interlaced,decimate`.

Feed `dvd_clean.mp4` to whichever upscaler you use.

## What to expect

Done this way, a home DVD at 1080p looks like a clean, steady, slightly soft HD picture: faces have skin instead of smear, and dark scenes stop crawling with blocks. It won't look like it was shot on a modern camera. If the DVD was made from a VHS tape, the tape's softness is baked in and the result will look like a very good tape transfer.

## Doing it with Phoenix

[Phoenix Upscaler](https://phoenixlabs.space/upscaler) takes the cleaned file from the steps above and does the rest. It checks for interlacing and only deinterlaces when it's there, and its restoration models are trained to repair compression damage rather than sharpen it. Generative mode rebuilds texture in faces and fabric, then finishes at up to 1080p. It runs on your own Windows or Linux PC, NVIDIA or AMD, for $129 once. It also reads the pixel shape the DVD declares and restores the picture at its proper 4:3 or 16:9 shape, so you can skip step 2. The free download restores 60-second clips with a small watermark, so try a chapter of yours before you buy.

## Questions

### Can you convert a DVD to HD?

You can turn it into a 1080p file that looks cleaner and sharper than the disc on a big screen. It won't match something filmed in HD: a DVD frame is 720 by 480 or 576 pixels, and an upscaler can only clean up and rebuild so much of the rest.

### Is it worth upscaling a DVD to 4K?

Rarely. 1080p already stretches a DVD more than twice in each direction. 4K quadruples the file size again without adding anything the disc had. Your 4K TV will scale a good 1080p file up just fine.

### Why does my upscaled DVD look stretched?

Because DVD pixels aren't square. A 720 by 480 frame is meant to be shown at 4:3 or 16:9, and a player knows that from a flag in the file. Many tools ignore the flag and keep the 720 by 480 shape. Resize to square pixels before upscaling, as shown on this page.

### Does a DVD player or TV upscale DVDs already?

Yes, an upscaling player or a modern TV resizes the picture as it plays. It's a quick resize, though, not a restoration: it doesn't remove compression blocks, and the result disappears when you stop playing. An upscaled file is something you can keep, share and edit.

### Can I copy a store-bought movie DVD?

That depends on where you live, because most commercial movie discs are copy-protected and many countries forbid getting around it. Home DVDs, like camcorder discs and tape transfers you paid for, have no protection, and they're what this guide is for.

Related: [Deinterlacing video](https://phoenixlabs.space/deinterlace-video) · [Restoring VHS tapes at home](https://phoenixlabs.space/vhs-restoration-software) · [How to restore old video](https://phoenixlabs.space/restore-old-video) · [Upscaling 240p and 360p video](https://phoenixlabs.space/upscale-low-resolution-video) · [Topaz Video AI alternative](https://phoenixlabs.space/topaz-video-ai-alternative) · [Phoenix Upscaler guide](https://phoenixlabs.space/upscaler-guide)

## Try it on one chapter

The free download restores 60-second clips with a small watermark. Pick a scene with faces in it and judge the result yourself.

[Download Phoenix](https://phoenixlabs.space/upscaler#download)
