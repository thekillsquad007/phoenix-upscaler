---
name: phoenix-labs
description: Restore old video (tapes, DVDs, film scans, old phone clips) and turn still images into five-second video clips with sound, using the Phoenix Labs MCP server or REST API, paid from the user's prepaid balance with a capped agent key or in USDC over x402. Use when a user wants old footage cleaned up or upscaled, or a photo, logo or artwork animated into a short clip.
---

# Phoenix Labs

Phoenix Labs runs two cloud services an agent can use for a user:

- **Cloud Restore** cleans up and upscales old video: noise, interlacing and compression damage removed, detail rebuilt, up to 4K.
- **Phoenix Motion** turns one still image and a prompt into a five-second clip at 24 fps, with sound made in the same pass. It can also make a seamless loop.

Prices are real US dollars. Always tell the user what something costs before you spend, unless they have already agreed to it.

## Connect

- MCP server (Streamable HTTP): `https://api.phoenixlabs.space/mcp`
- REST API: `https://api.phoenixlabs.space`, described at `https://api.phoenixlabs.space/openapi.json`
- Human guide: `https://phoenixlabs.space/developers`

The MCP server needs sign-in. If your client supports MCP OAuth, connecting is one click: the user approves your app on https://phoenixlabs.space/connect and sets a spending limit. Otherwise ask the user for an **agent key** (`pak_…`), which they make in Phoenix Motion (https://phoenixlabs.space/motion-app.html: click the balance, then Agent keys) with a limit, and send it as `Authorization: Bearer pak_…` (or `?key=pak_…` on the MCP URL if the client only takes a URL). Never ask for the user's wallet key (`pmk_…`). Prices and quotes are free over the REST API without any key.

## Make a clip (Phoenix Motion)

1. Check the price with `get_prices`: $0.59 for 480p, $0.99 for 720p.
2. Call `make_clip` with a `prompt` describing what moves, how the camera moves and what it sounds like, and an `image_url` (a public JPEG, PNG or WebP up to 20 MB). Add `loop: true` for a seamless loop where only what the prompt names moves.
3. Poll `get_clip` every 10 seconds or so. Clips usually finish in under a minute. When `status` is `done`, give the user `video_url` or `download_url` (valid 24 hours).

Without an image link, `make_clip` returns an `upload` URL: send the image there with HTTP `PUT` and the given `Content-Type`, then call `start_clip`.

Good prompts are specific: "Slow push-in, wind moves through the trees, distant birdsong" beats "make it cinematic".

## Restore a video (Cloud Restore)

1. Get the exact price with `quote_restore` (length in seconds, and the frame size if known). Standard starts at $2.99; Enhanced and Studio Max (Enhanced delivered at up to 4K) at $5.99.
2. Call `create_restore` with the file name, content type, duration and size. With an agent key it is paid from the balance now; with `pay_with: "checkout"` the user pays through a link instead.
3. `PUT` the video to the returned `upload.url` with the given headers.
4. Call `start_restore`. For a checkout job it returns `checkout_url` for the user to pay; the restore starts once they have.
5. Poll `get_restore` until `status` is `done`, then give the user `download_url`.

Limits: 2 GB per file; Standard up to 30 minutes, Enhanced and Studio Max up to 6 minutes per clip. The GPU checks the real length, so declare what the file really is.

## When money runs short

- A `402` with `needs_topup` means the balance is too low: `create_top_up_link` gives the user a checkout link (US$5 to $200).
- A `402` with `over_limit` means the agent key's limit is used up: only the user can raise it or make a new key.
- An agent that holds its own crypto wallet can add USDC on Base itself with `top_up_with_usdc` (x402 v2), from $1 to $200; 1 USDC adds $1 and no gas is needed.
- A clip or restore that fails, or a prompt that is refused, is refunded to the balance automatically.

## Rules

- Clips: no sexual or nude content, and nothing sexual or suggestive involving a minor. Such prompts are refused before anything is charged.
- The user must have the right to use the images and videos they send.
- Uploaded images are deleted as soon as the clip is made; videos and results within about 48 hours. Nothing is used to train a model.
