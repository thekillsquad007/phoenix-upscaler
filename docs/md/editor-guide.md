---
title: "Phoenix Editor guide: setup and your first edit"
description: "How to set up Phoenix Editor and make your first edit: install it, drop in a VOD, review the cuts it found, and export a long edit plus captioned Shorts."
url: https://phoenixlabs.space/editor-guide
---

# Setup and your first edit

Start to finish, from installing Phoenix Editor to exporting a finished long-form cut and a set of captioned Shorts. About ten minutes of your attention, plus however long your recording takes to process.

[Get the installer](https://phoenixlabs.space/editor#download)

## 1. Install it

Download the installer from the [download section](https://phoenixlabs.space/editor#download) and run it. Phoenix Editor installs for your user account, so it does not ask for an administrator password.

Windows will probably show a blue “Windows protected your PC” box the first time. That appears for any installer without a paid code signing certificate, not because anything is wrong with the file. Click **More info**, then **Run anyway**.

Everything the app needs is inside the installer, including the transcription models and ffmpeg. There is no second download and no account to create. The first 7 days are a full free trial with no watermark and no card required.

## 2. Add a recording

Drag your VOD straight onto the window, or use **Choose video**. MP4, MKV, MOV, WebM, AVI, FLV and TS all work, which covers what OBS and most capture software produce.

Phoenix picks an output folder next to your source file and shows it under the video. Change it with **Change** if you would rather the exports landed somewhere else, like a faster drive.

Nothing is uploaded at any point. Transcription, detection and rendering all happen on your own machine.

## 3. Let it analyze

Press **Detect cuts + highlights**. Phoenix transcribes the audio, then looks for three things: dead air, filler words like “um” and “uh”, and the points where the picture changes.

This is the slow part, and it scales with the length of your recording and the speed of your GPU. The progress bar shows elapsed time and an estimate once it has enough to go on. You can leave it running and come back.

A rough guide: on a recent GPU, expect somewhere around a tenth of the recording's own length. A two hour stream is normally a coffee break, not an overnight job. Without a GPU it is considerably slower but still works.

## 4. Review before it renders

Nothing is exported until you say so. You get a list of every cut Phoenix wants to make, with the reason next to it, and a list of the moments it thinks would make good Shorts.

- Untick any cut you disagree with and that footage stays in.
- Untick a Short you do not want and it will not be rendered.
- Drag the handles on a Short to trim exactly where it starts and ends.
- Pick a caption style, or turn captions off.

It is worth skimming this on your first recording. It is the fastest way to learn how aggressive the detection is on your particular audio setup, and whether you want to keep more of your natural pauses.

## 5. Export

Press **Render**. Phoenix writes the long-form edit and each Short you kept into the output folder, with captions burned in where you asked for them. Open the folder straight from the app when it finishes.

During the trial, and after it if you have not bought a licence, exports carry a small “Made with Phoenix Editor” mark. Everything else is identical, including quality and length.

## If something goes wrong

### Windows blocked the installer

Click **More info** and then **Run anyway**. This is SmartScreen reacting to an installer that has not yet been signed with a paid certificate, not to anything it found in the file.

### It is cutting pauses I wanted to keep

Untick those cuts in the review step before rendering. Phoenix only removes silences longer than a set minimum, so a beat for effect should survive, but a genuinely long pause is treated as dead air.

### It left in an “um” or missed one

Filler detection works from the transcript, so a word the transcriber misheard cannot be cut. It is deliberately conservative and only removes unambiguous disfluencies, because wrongly cutting a real word is far more damaging to an edit than leaving one in.

### It is much slower than expected

Check the chips at the top of the window. They show which GPU was detected and which transcription and encoding backends were chosen. If they say CPU, Phoenix did not find a usable GPU and is falling back, which is functional but much slower. Updating your graphics driver is the usual fix.

### My recording has no audio track

Phoenix needs audio to find dead air and filler words, since both come from what you said. A silent source can still be used as the source video in Reactor, where your commentary track is the one being cut.

### The app showed an error screen

Use **Copy error details** and send them to [support@phoenixlabs.space](mailto:support@phoenixlabs.space). Your files are not touched when this happens, and reloading usually clears it.

### It is taking up a lot of disk space

Phoenix keeps working files next to your exports so a re-render does not have to redo everything. If your source is a format that needs converting first, such as MKV from OBS, that copy is the bulk of it. Delete the files beginning with an underscore in the output folder once you are happy with the result.

## Ready to try it on a real VOD?

[Download Phoenix Editor](https://phoenixlabs.space/editor#download)
