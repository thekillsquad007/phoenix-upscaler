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

On Linux, download the AppImage, make it executable (`chmod +x`) and run it.

There is no account and nothing to configure before you start. The one extra download is Generative, which the app sets up for you the first time you ask for it (step 4).

## 2. Add a video

Drag the file onto the window, or click to browse. Phoenix reads the resolution, the frame rate and whether the footage is interlaced, and picks the settings for it. For most people that is the whole step.

If you want to steer it, open **Advanced options** under the Start button. The preset there tells Phoenix what kind of damage to expect:

- **Auto** inspects the file and chooses. Right almost always, and the right place to start.
- **VHS** for tape and broadcast captures: heavier noise reduction, and deinterlacing on by default.
- **Film** for scans and archive footage, where grain is part of the picture and should survive.
- **Faces** for interviews, weddings, anything where people are the subject and their faces are what you will actually look at.
- **Max** runs the full stack. Slowest, and the one to reach for on a short clip that matters.

If you are not sure, leave it on Auto and restore a 30-second section first. Judging a preset on a short clip costs minutes; judging it on a two-hour tape costs an evening.

## 3. Choose how much detail

Phoenix uses the best engine your PC has, and picks it for you. There are two:

### Generative

Diffusion-based detail reconstruction: it rebuilds texture rather than sharpening what is there. The biggest visible jump, and the slowest. Runs on Windows and Linux with a capable graphics card, after a one-time setup (step 4).

### Enhanced

Neural video restoration using paired frames, so motion stays consistent instead of shimmering. Runs on any modern graphics card on Windows, with no setup. Phoenix uses it when Generative isn't set up.

With Generative, the main screen asks one question, how much detail:

- **Balanced** is the recommended choice. Clean, natural detail on any footage.
- **Best** adds a little more detail on fast-moving footage and takes about 20% longer. On a still close-up it is no better than Balanced.

Phoenix will never quietly give you a lesser result than the one you chose. If Generative is not set up, it says so and tells you what to do. If your PC has no graphics card Phoenix can use, it tells you that too, and points you to the cloud studio instead of producing a restore that isn't worth keeping.

## 4. Set up Generative (one time)

Generative is the only engine with an extra step, because it needs a several-gigabyte model and a GPU compute stack built for your specific graphics card.

Click **Install Generative** in the app and leave it. It downloads the model and sets up everything it needs, which takes 15 to 40 minutes on a normal connection and needs roughly 20 GB free. This happens once. When it finishes, the Balanced and Best choices appear and you can start.

- **Windows with an AMD card:** it installs into Windows Subsystem for Linux, which Windows may ask to enable and which may want a restart, plus AMD’s ROCm for WSL. AMD supports that on the Radeon RX 7800 XT, RX 7900 and RX 9000 series, Radeon PRO W7000 and Ryzen AI Max. Keep the AMD graphics driver up to date.
- **Linux:** AMD (Radeon RX 6000 series or newer) or NVIDIA, with 8 GB or more. Nothing needs root. If your user account can't use the graphics card for compute yet, the app shows the one command to fix that, then you click Install Generative again.

If setup stops, the app shows why and what to do next, right under the Install button.

Restores are chunked, so a failure part-way through is not fatal. If a Generative job stops, Phoenix keeps the chunks it finished and offers **Resume** next time you open it, including after closing the app entirely.

## 5. Start the restoration, and what to expect

Press **Start restoration**. Phoenix shows progress and the folder your finished file will land in. You can drop in several videos at once, or add more while one is running. They restore one after another, in the order you added them.

How long it takes depends mostly on the engine. Enhanced runs several times slower than playback. Generative is slower again by a wide margin, and a long clip in Generative is genuinely an overnight job. None of this is a fault to work around. Rebuilding a picture frame by frame is simply expensive.

You don't have to watch it. Phoenix keeps your PC awake while it works, shows the progress on its taskbar button, and plays a short sound when the queue is done.

Each finished video is saved to your Videos folder, in **Phoenix Upscaler**, under the original's name with *(restored)* added. You can change the folder under the Start button. Your source file is never touched. To see what changed, click **Compare before and after** on the finished restore and drag the line across the picture.

One practical note. Working files can run to several gigabytes for a long restore, and Phoenix puts them on the largest fixed drive it can find rather than filling your system drive.

## If something goes wrong

### The result looks soft, or barely different

If you used Enhanced, try Generative, which rebuilds far more detail. If you are already on Generative, try Best. If the picture is still soft, the source may be out of focus rather than low resolution, which is not something any restoration can fix.

### Faces look smooth or waxy

Too much restoration for the amount of real detail in the source. Try the Faces preset under Advanced options, which is tuned to keep skin texture. On a face that was only a few dozen pixels wide to begin with, a slightly soft result is the honest one.

### Motion shimmers or flickers

Usually interlaced footage that was not detected. Set the preset to VHS under Advanced options, which turns deinterlacing on explicitly. Anything captured from tape or broadcast is interlaced far more often than people expect.

### “Generative isn't set up on this PC yet”

Exactly what it says: the model and runtime have not been installed. Click **Install Generative**. On Windows you can use Enhanced in the meantime, which needs no setup.

### Generative setup stopped

The app shows the reason under the Install button, and it is almost always one of three: the internet connection dropped, the drive is short of the roughly 20 GB setup needs, or (on Linux) your user account doesn't have access to the graphics card yet, in which case the app shows the command that grants it. Fix that, then click **Install Generative** again. It picks up where it stopped instead of downloading everything twice.

### “This PC doesn't have a graphics card Phoenix can use”

Phoenix only restores with engines that make a real difference, and those need a graphics card. Without one, the [cloud studio](https://phoenixlabs.space/studio) runs the same restoration on our GPUs, priced per clip.

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

- **Nothing is uploaded.** Restoration happens on your own GPU. Phoenix contacts the internet to check for updates (and download them) and to validate your licence, and for nothing else. Your video never leaves the machine.
- **The trial restores 60-second clips** with a watermark, so you can see exactly what your own footage looks like before paying. Generative needs a licence.
- **One payment, $129.** No subscription, no per-clip charge, no export limit. Updates are included.
- **Your originals are never modified.** Every restore writes a new file.
- **No gaming PC?** The [cloud studio](https://phoenixlabs.space/studio) runs the same engine on rented GPUs, priced per clip, with the price shown before you pay.

## Try it on something that matters to you

The trial runs on 60-second clips, so pick the video you most want back and see what happens to it.

[Download Phoenix](https://phoenixlabs.space/index#download)
