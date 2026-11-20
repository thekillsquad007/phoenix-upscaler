---
title: "How to deinterlace video (and fix the lines) | Phoenix Upscaler"
description: "Horizontal lines on anything that moves in old tape or DVD footage are interlacing. How to tell, which deinterlacer to use, and the free ffmpeg commands."
url: https://phoenixlabs.space/deinterlace-video
---

Deinterlacing

# How to deinterlace video and get rid of the lines

You play an old tape capture or a DVD on your computer and everything that moves has fine horizontal stripes along its edges, like a comb. Nothing is broken. The video is interlaced, a trick from the days of tube TVs, and your screen is showing it the wrong way. A deinterlacer fixes it, and it's the first thing any restoration should do.

Updated 20 November 2026

## What interlacing is

Old video systems couldn't send a full picture fast enough, so they sent half of one at a time. First the odd lines (one field), then the even lines (the next field), fifty times a second in PAL countries and about sixty in NTSC ones. A tube TV drew each field as it arrived and your eye blended them.

A file stores the two fields woven together as one frame. But they were recorded a fiftieth or sixtieth of a second apart, so anything that moved sits in two places at once: one position on the odd lines, another on the even ones. A computer or modern TV shows the whole frame at once, and you see the stripes.

Almost all standard-definition tape is interlaced: VHS, S-VHS, Hi8, Video8, MiniDV and Digital8. So are most DVDs made from video, and most broadcast TV recordings. Phone video and internet downloads usually aren't.

## 1. Check that it's really interlaced

Pause on a frame where something moves sideways, like a hand, a car or a camera pan, and zoom in. Combing on the moving edges means interlaced. A still scene shows nothing either way, so pick a busy one.

To check the file itself, `ffprobe` (part of ffmpeg) prints the field order the file claims:

Read the field order

```
ffprobe -v error -select_streams v:0 -show_entries stream=height,field_order capture.mp4
```

`tt` or `bb` means interlaced, `progressive` means not. Files lie sometimes, especially after a re-encode, so for a second opinion let ffmpeg measure the combing itself:

Measure combing

```
ffmpeg -i capture.mp4 -frames:v 500 -vf idet -an -f null -
```

The last “Multi frame detection” line counts TFF, BFF and progressive frames. Mostly TFF or BFF means interlaced.

## 2. Rule out film on an NTSC DVD

Movies and many TV series were shot on film at 24 frames a second. To get them onto 30-frame NTSC video, the frames were spread over fields in a repeating 3:2 pattern called pulldown. It combs like interlaced video, but deinterlacing it is wrong: you get blur and a small stutter every fifth frame.

What it needs is inverse telecine, which puts the original 24 film frames back together. In ffmpeg that's `fieldmatch,decimate` (see below). PAL DVDs of films don't have this problem: film was simply sped up from 24 to 25 frames.

Home video from a camcorder is real interlaced video, so this step only matters for discs of films and TV.

## 3. Pick a frame rate

A deinterlacer can turn every frame into one picture, keeping the 25 or 30 frames a second you started with. Or it can turn every field into a picture, giving 50 or 60. Both are correct, and the choice is about taste:

- **Field rate (50 or 60).** Keeps every moment the camera saw. Motion looks smooth and “live”, like the TV did. Best for sports, dancing and anything fast. Bigger files.
- **Frame rate (25 or 30).** Half the size, and a calmer, more film-like look. Fine for most family footage, and easier to drop into an edit with other clips.

## 4. Deinterlace first, before anything else

Do it at the start, on the original capture. Denoising, sharpening and upscaling all see the stripes as fine detail. A denoiser smears them into a ghostly double edge, a sharpener makes them crisper, and an upscaler bakes them into the bigger picture where no deinterlacer can find them again. And deinterlace once: two passes blur twice.

## 5. Save it as progressive video

Encode the result normally. If more steps follow, use a high quality setting (`-crf 12` or lower in ffmpeg) so the next tool isn't working from a freshly compressed copy.

## Which deinterlacer to use

- **yadif.** Built into ffmpeg, fast, and good. The safe default for years.
- **bwdif.** Also built into ffmpeg and just as easy. Slightly cleaner edges than yadif on most footage.
- **QTGMC.** A script for VapourSynth or AviSynth, used by archivists and tape transfer services. Clearly the best on shimmer and fine detail, and much slower, with a real setup cost.
- **Your video player's deinterlacer.** VLC and most players can deinterlace while playing. That fixes how it looks on your screen but changes nothing in the file.
- **Simple “blend” or “discard” modes.** Blending leaves ghosts on motion, discarding throws away half the lines. Avoid both if you have the choice.

## Doing it yourself with ffmpeg

The free command-line tool [ffmpeg](https://ffmpeg.org/) does all of this. Keep the original frame rate:

Deinterlace, same frame rate

```
ffmpeg -i capture.mp4 -vf "bwdif=mode=send_frame:parity=auto:deint=all" \
  -c:v libx264 -crf 14 -preset slow -c:a copy deinterlaced.mp4
```

Double it to field rate (50 or 60) for the smoothest motion:

Deinterlace to field rate

```
ffmpeg -i capture.mp4 -vf "bwdif=mode=send_field:parity=auto:deint=all" \
  -c:v libx264 -crf 14 -preset slow -c:a copy deinterlaced_50p.mp4
```

For a film or TV series on an NTSC DVD, undo the pulldown instead. Frames that can't be matched still get deinterlaced:

Inverse telecine

```
ffmpeg -i film_dvd.mkv -vf "fieldmatch,bwdif=deint=interlaced,decimate" \
  -c:v libx264 -crf 14 -preset slow -c:a copy film_24p.mp4
```

- `parity=auto` reads the field order from the file. If motion looks jerky and goes back and forth, the file has it wrong: try `parity=tff` or `parity=bff`.
- `deint=all` treats every frame as interlaced. Swap in `deint=interlaced` to touch only frames the file marks as interlaced, which is safer on mixed footage.
- yadif takes the same options: replace `bwdif` with `yadif`.

## Doing it with Phoenix

[Phoenix Upscaler](https://phoenixlabs.space/upscaler) handles this step for you. It checks each clip, deinterlaces only when the clip is interlaced, and keeps the original frame rate. In Generative mode it also measures the combing with idet, so a capture that's wrongly labelled progressive still gets fixed and a real progressive file is left alone. Then it denoises and restores detail, in that order. It doesn't undo 3:2 pulldown, so run the inverse telecine command above on a film-sourced NTSC disc first. Phoenix runs on your own Windows or Linux PC, NVIDIA or AMD, for $129 once, and the free download restores 60-second clips with a small watermark.

## Questions

### Why does my old video have lines on it?

Most tape and DVD video is interlaced: each frame is two half-pictures taken a fiftieth or sixtieth of a second apart, one on the odd lines and one on the even lines. A TV showed them one after the other. A computer screen shows both at once, so anything that moved between them gets a striped edge.

### What is the best deinterlacer?

QTGMC, a VapourSynth and AviSynth script, gives the cleanest result but takes real setup. In plain ffmpeg, bwdif is a little cleaner than the older yadif and just as easy. For most home tapes the difference between those two is small next to everything else that's wrong with the picture.

### Should I deinterlace to 25 or 50 frames per second?

50 (or 60 for NTSC) keeps every moment the camera recorded, so motion looks smooth and live, the way it did on a TV. 25 or 30 halves the file size and looks more like film. Both are correct. Pick 50 or 60 for sports and fast action, and keep the original rate if the file is going into a slideshow or an edit.

### Can deinterlacing hurt a video?

Yes, if the video wasn't interlaced. Running a deinterlacer on progressive video, like most phone clips and internet downloads, blends lines that were already fine and softens the picture. Check first, or use a mode that only touches frames marked as interlaced.

### Does Phoenix Upscaler deinterlace automatically?

Yes. It deinterlaces only clips that are interlaced and keeps the original frame rate. Phoenix doesn't undo 3:2 pulldown, so run inverse telecine on a film-sourced NTSC DVD first.

Related: [Restoring VHS tapes at home](https://phoenixlabs.space/vhs-restoration-software) · [Upscaling a DVD to HD](https://phoenixlabs.space/upscale-dvd-to-hd) · [How to restore old video](https://phoenixlabs.space/restore-old-video) · [Upscaling 240p and 360p video](https://phoenixlabs.space/upscale-low-resolution-video) · [AI video upscaling on Linux](https://phoenixlabs.space/linux-video-upscaler) · [Phoenix Upscaler guide](https://phoenixlabs.space/upscaler-guide)

## Try it on your own tape

The free download restores 60-second clips with a small watermark. Pick a stretch with plenty of movement and judge the result yourself.

[Download Phoenix](https://phoenixlabs.space/upscaler#download)
