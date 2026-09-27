---
title: "Phoenix Upscaler guide: setup, quality modes and fixes"
description: "How to use Phoenix Upscaler: install it, pick the right mode for your footage, set up Generative, and fix the problems people actually run into."
url: https://phoenixlabs.space/upscaler-guide
---

# How to use Phoenix Upscaler

Everything from installing it to getting a finished file, plus the problems people actually run into and what to do about each one. Your first restore takes about five minutes of attention.

[Get the installer](https://phoenixlabs.space/index#download) [Skip to troubleshooting](https://phoenixlabs.space/upscaler-guide#troubleshooting)

## What Phoenix can work with

Anything you can play. Phoenix reads whatever ffmpeg reads, which in practice means MP4, MKV, MOV, AVI, WMV, MPG, VOB and the rest. It does not care where the footage came from, only what state it is in.

Footage people bring it, roughly in order of how common it is:

- **Phone video from 2010 to 2016.** 480p or 720p, heavily compressed, shot on a phone with a tiny sensor. The single most common thing people restore, and often the most rewarding, because the subject matter is usually people you know.
- **VHS and camcorder captures.** Interlaced, noisy, colour-bled. Phoenix was built for these first.
- **DVD rips and wedding videos.** 720×480 squeezed onto a disc, usually interlaced, often with a soft transfer on top.
- **Old downloads and archive clips.** Anything that was 240p or 360p when you saved it and now looks like a postage stamp on a 4K screen.
- **Film scans.** 8mm and Super 8 transfers, where the grain is real and worth keeping rather than smoothing away.
- **Your own back catalogue.** Old uploads, gameplay captures, screen recordings and webcam footage that were fine on a 2012 monitor and are not fine now.

What it cannot do is invent a picture that was never recorded. A clip that is genuinely out of focus stays out of focus; a face that is twelve pixels wide has no detail to recover. Phoenix rebuilds detail that compression, tape and scaling destroyed, which is a different problem and a solvable one.

## 1. Install it

Download the installer from the [download section](https://phoenixlabs.space/index#download) and run it. It installs for your user account, so it never asks for an administrator password.

Windows will show a blue “Windows protected your PC” box the first time. That appears for any installer without a paid code signing certificate. Click **More info**, then **Run anyway**.

ffmpeg and the restoration models are inside the installer. There is no second download, no account and nothing to configure before your first restore.

## 2. Add a video and pick a preset

Drag the file onto the window, or click to browse. Phoenix reads the resolution, the frame rate and whether the footage is interlaced, and shows you what it found.

The preset tells it what kind of damage to expect:

- **Auto** inspects the file and chooses. Right almost always, and the right place to start.
- **VHS** for tape and broadcast captures: heavier noise reduction, and deinterlacing on by default.
- **Film** for scans and archive footage, where grain is part of the picture and should survive.
- **Faces** for interviews, weddings, anything where people are the subject and their faces are what you will actually look at.
- **Max** runs the full stack. Slowest, and the one to reach for on a short clip that matters.

If you are not sure, leave it on Auto and restore a 30-second section first. Judging a preset on a short clip costs minutes; judging it on a two-hour tape costs an evening.

## 3. Choose a quality mode

The preset says what kind of footage it is. The quality mode says how hard your GPU should work on it. This is the setting that changes both the result and the wait, so it is worth understanding.

### Standard

Fast and compatible. Cleans, deinterlaces and scales without any neural detail work. Runs on anything, including laptops with no usable GPU. Use it to check a file is what you think it is before committing to a long restore.

### Enhanced

Neural video restoration on any modern GPU, using paired frames so motion stays consistent instead of shimmering. This is the mode most people should use most of the time. It needs no setup beyond installing Phoenix.

### Generative

Diffusion-based detail reconstruction: it rebuilds texture rather than sharpening what is there. The biggest visible jump, and by far the slowest. Needs a one-time setup step and a card with 8 GB or more.

Phoenix picks a sensible default for your machine on first launch, and it will never quietly give you a lesser mode than the one you chose. If Generative is not set up, it says so and tells you what to do rather than silently running Standard and handing you a disappointing file.

## 4. Set up Generative (optional, one time)

Generative is the only mode with an extra step, because it needs a several-gigabyte model and a GPU compute stack that the installer would otherwise force on everyone.

Click **Install Generative** in the app and leave it. It downloads the models and sets up the runtime, which takes a while on a normal connection and needs roughly 20 GB free. On AMD cards it installs into WSL, which Windows may ask to enable and which may want a restart. This happens once; after it finishes, Generative is just another option in the dropdown.

Restores are chunked, so a failure part-way through is not fatal. If a Generative job stops, Phoenix keeps the chunks it finished and offers **Resume** next time you open it, including after closing the app entirely.

## 5. Restore, and what to expect

Press **Restore**. Phoenix shows progress and the folder your finished file will land in.

How long it takes depends almost entirely on the quality mode. Standard runs at something close to playback speed. Enhanced is several times slower than that. Generative is slower again by a wide margin, and a long clip in Generative is genuinely an overnight job. None of this is a fault to work around; rebuilding a picture frame by frame is simply expensive.

Two practical notes. Working files can run to several gigabytes for a long restore, and Phoenix puts them on the largest fixed drive it can find rather than filling your system drive. And the output is a new file next to the original, so your source is never touched.

## If something goes wrong

### The result looks soft, or barely different

Almost always the quality mode. Standard does no neural work at all, so on badly damaged footage the difference can be small. Try Enhanced first, then Generative. If you are already on Generative and the picture is still soft, the source may be out of focus rather than low resolution, which is not something any restoration can fix.

### Faces look smooth or waxy

Too much restoration for the amount of real detail in the source. Try the Faces preset, which is tuned to keep skin texture, or drop from Generative to Enhanced. On a face that was only a few dozen pixels wide to begin with, a slightly soft result is the honest one.

### Motion shimmers or flickers

Usually interlaced footage that was not detected. Set the preset to VHS, which turns deinterlacing on explicitly. Anything captured from tape or broadcast is interlaced far more often than people expect.

### “Generative isn't set up on this PC yet”

Exactly what it says: the models and runtime have not been installed. Click **Install Generative**, or use Enhanced, which needs no setup and is a real improvement over Standard.

### The job ran out of memory

Phoenix already steps itself down through smaller chunk sizes when a card runs short of memory, so seeing this means it reached the bottom of that ladder. Close other GPU-heavy applications, especially browsers with hardware acceleration and anything running a game. Failing that, restore in shorter sections.

### It failed part-way through a long job

Reopen Phoenix. If the job was Generative, it offers to resume from the chunks that already finished rather than starting again. This survives closing the app and rebooting.

### The app will not start, or the page is blank

Phoenix runs a small local server and shows its interface in a window pointed at it. If something else on your machine has taken the port, or a security tool is blocking local connections, the window can come up empty. Allow Phoenix through your firewall for private networks. Nothing is being sent anywhere; the connection is your computer talking to itself.

### Windows says the file is unrecognised

SmartScreen again, on the installer. **More info** → **Run anyway**. It is the absence of a paid signing certificate, not a judgement about the file.

### My drive filled up

A long restore writes large intermediates. Phoenix cleans them when a job finishes, but a job that was cancelled or crashed can leave them behind. The app shows where its working files live and how much space they are using, and will clear them for you.

## Things worth knowing

- **Nothing is uploaded.** Restoration happens on your own GPU. Phoenix contacts the internet to check for updates and to validate your licence, and for nothing else. Your video never leaves the machine.
- **The trial restores 60-second clips** with a watermark, so you can see exactly what your own footage looks like before paying. Generative needs a licence.
- **One payment, $129.** No subscription, no per-clip charge, no export limit. Updates are included.
- **Your originals are never modified.** Every restore writes a new file.
- **No gaming PC?** The [cloud studio](https://phoenixlabs.space/studio) runs the same engine on rented GPUs, priced per clip, with the price shown before you pay.

## Try it on something that matters to you

The trial runs on 60-second clips, so pick the video you most want back and see what happens to it.

[Download Phoenix](https://phoenixlabs.space/index#download)
