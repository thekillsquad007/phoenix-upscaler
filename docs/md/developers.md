---
title: "Phoenix for AI agents: MCP server, API and agent keys"
description: "Let Claude, ChatGPT, Cursor or your own code restore old video and make clips with Phoenix, paid from a balance you control with a capped agent key."
url: https://phoenixlabs.space/developers
---

For AI agents and developers

# Let your AI assistant use Phoenix

Claude, ChatGPT, Cursor or your own code can restore old video and make clips with Phoenix, and pay for them from a balance you control. You give the assistant its own key with a spending limit. It can never spend more than that, and you can switch it off at any time.

MCP server
:   `https://api.phoenixlabs.space/mcp`

REST API
:   [OpenAPI description](https://api.phoenixlabs.space/openapi.json)

Paying
:   A prepaid US dollar balance, added by card or in USDC (x402)

## Set it up in three steps

1. **Add some balance.** Open [Phoenix Motion](https://phoenixlabs.space/motion-app) and add $5 or more. That balance pays for clips and for cloud restores.
2. **Make an agent key.** Click your balance, then *Agent keys*. Name it, set a limit (say $10), and copy the `pak_…` key it shows. You only see it once.
3. **Connect your assistant** to the MCP server with that key, using one of the snippets below.

## Connect your assistant

### Claude Code

Terminal

```
claude mcp add --transport http phoenix https://api.phoenixlabs.space/mcp --header "Authorization: Bearer pak_your_key"
```

### Cursor, Windsurf and other apps with an MCP config file

mcp.json

```
{
  "mcpServers": {
    "phoenix": {
      "url": "https://api.phoenixlabs.space/mcp",
      "headers": { "Authorization": "Bearer pak_your_key" }
    }
  }
}
```

### Apps that only ask for a server URL

Some apps, such as the custom connectors in chat apps, only take an address. Put the key on the end of it:

Server URL

```
https://api.phoenixlabs.space/mcp?key=pak_your_key
```

Only ever use an agent key this way, never your wallet key: a URL can end up in logs and settings screens. The server refuses a wallet key in a URL for that reason.

## What your assistant can do

| Tool | What it does | Cost |
| --- | --- | --- |
| `get_prices` | Current prices and limits | Free |
| `quote_restore` | Exact price to restore a clip of a given length and size | Free |
| `create_restore` | Start a cloud restore and get an upload link | From $2.99, by length |
| `start_restore` | Run the restore once the video is uploaded, or get a checkout link for you | Paid at create |
| `get_restore` | Progress, and the download link when it's done | Free |
| `make_clip` | Turn an image into a five-second clip with sound, from a prompt | $0.59 (480p), $0.99 (720p) |
| `start_clip` | Start a clip once its image is uploaded | Paid at make |
| `get_clip` | Progress, and the video when it's done | Free |
| `list_clips` | Clips this key has made | Free |
| `cancel_job` | Cancel a job whose file never arrived, with an instant refund | Refunds |
| `get_balance` | The balance, and how much of the key's limit is left | Free |
| `create_top_up_link` | A checkout link for you to add money | Nothing until you pay |
| `top_up_with_usdc` | Add money itself, in USDC on Base, from its own crypto wallet (x402) | $1 to $200 |

Assistants usually send files one of two ways. For a clip, they can pass a link to a public image and Phoenix fetches it. Otherwise the create tool returns an upload link: the assistant sends the file there with an HTTP `PUT`, then calls the matching start tool. Coding assistants such as Claude Code and Cursor can upload a video from your disk this way.

## Money, limits and safety

- **A key can't spend past its limit.** The limit is checked on the server in the same step that takes the money, so two requests at once can't slip past it.
- **It can't do more than spend.** An agent key can't see your wallet key or your email, can't make other keys, and only sees the jobs it started itself.
- **Failures cost nothing.** A clip or restore that fails, or a prompt that's refused, is refunded to the balance straight away, and to the key's allowance too.
- **It can't use your card.** When the balance runs low, an assistant can hand you a checkout link, and nothing is charged until you pay it. An assistant with its own crypto wallet can add USDC itself, but it still can't spend past its key's limit.
- **Assistants are asked to confirm prices.** The server tells every connected assistant to say what something costs before spending, unless you've already agreed to it.
- **Same rules as the website.** Clips follow the same content rule: no sexual or nude content, and nothing sexual or suggestive involving a minor.
- **Switch it off any time.** Revoke a key from the *Agent keys* list and it stops working at once.

## Paying with USDC (x402)

Assistants that hold their own crypto wallet can add money to the balance themselves, in USDC on Base, using [x402](https://www.x402.org/), the open standard for paying over HTTP. They need USDC and nothing else: no gas, no account. 1 USDC adds $1, from $1 to $200 at a time, and it's spent exactly like balance added by card, with the same key limits and refunds.

- **Over MCP:** call `top_up_with_usdc`. It answers with the payment terms; sign the USDC transfer and call it again with the payment in `_meta["x402/payment"]`.
- **Over HTTP:** `POST /wallet/topup/crypto` with `{"amount_cents": 500}` answers `402` with the terms in the `PAYMENT-REQUIRED` header. Send the same request again with the signed payment in `PAYMENT-SIGNATURE`. Any x402 client library does this for you.
- **In the browser:** people can pay the same way from *Add balance* in [Phoenix Motion](https://phoenixlabs.space/motion-app), with MetaMask, Coinbase Wallet or Rabby.

We credit a payment only after reading the transfer back from the Base network ourselves. USDC payments go straight to Phoenix Labs, not through our card processor, and unused USDC balance is refunded in USDC to the address that paid.

## Using the API directly

Everything the MCP tools do is plain HTTP and JSON, described in the [OpenAPI file](https://api.phoenixlabs.space/openapi.json). Make a clip from an image link:

curl

```
curl https://api.phoenixlabs.space/motion/jobs \
  -H "Authorization: Bearer pak_your_key" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Slow push-in, wind in the trees", "image_url": "https://example.com/photo.jpg", "size": "480p"}'

# then poll until status is "done" and use download_url
curl https://api.phoenixlabs.space/motion/jobs/CLIP_ID -H "Authorization: Bearer pak_your_key"
```

Restore a video paid from the balance:

curl

```
# 1. Create the job (the price comes off the balance now)
curl https://api.phoenixlabs.space/cloud/jobs \
  -H "Authorization: Bearer pak_your_key" -H "Content-Type: application/json" \
  -d '{"filename": "tape.mp4", "content_type": "video/mp4", "duration_sec": 95, "width": 720, "height": 480, "quality": "enhanced"}'

# 2. Upload the file to the upload_url it returns
curl -X PUT -H "Content-Type: video/mp4" --upload-file tape.mp4 "UPLOAD_URL"

# 3. Start it, then poll GET /cloud/jobs/JOB_ID until status is "done"
curl -X POST https://api.phoenixlabs.space/cloud/jobs/JOB_ID/start -H "Authorization: Bearer pak_your_key"
```

The GPU checks the real length of every video. One that's much longer than declared is refused and refunded rather than charged extra, so quote what the file really is.

## Questions

### Can an AI assistant spend more than I allow?

No. Each agent key has a total it may spend, checked on the server in the same step that takes the money. When a job fails, the amount goes back to both the balance and the key's allowance.

### Which assistants work with Phoenix?

Anything that can connect to a remote MCP server over HTTP, including Claude Code, Cursor and other MCP apps, and apps that add servers by URL. Anything that can make HTTP requests can use the REST API directly.

### Can the assistant pay with my card?

No. It can only spend the balance you've added, up to its key's limit. To add more, it gives you a checkout link, and nothing is charged until you pay it yourself.

### Can an assistant pay with crypto?

Yes. An assistant with its own wallet can add USDC on Base to your balance with x402, from $1 to $200 at a time, and it can still only spend up to its key's limit. You can pay with USDC from the Motion app too.

### What happens to the files an assistant sends?

The same as on the website. Images are deleted as soon as the clip is made, and uploaded videos and results are deleted automatically, typically within 48 hours. Nothing is used to train a model.

### Is there an API for the desktop apps?

Not yet. Phoenix Upscaler and Phoenix Editor run on your own computer; the API covers the cloud services, Cloud Restore and Phoenix Motion.

## Make your first agent key

Add a few dollars of balance, set a limit you're comfortable with, and connect your assistant.

[Open Phoenix Motion](https://phoenixlabs.space/motion-app)
