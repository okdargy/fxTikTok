# fxTikTok

Embed TikTok videos and slideshows on Discord with just `s/i/n`

> [!NOTE]  
> Have a feature you want to see in fxTikTok or want to report a bug? Make an issue! I would love to hear your feedback.

## 📸 Screenshots

<details>
  <summary>Click here to preview how fxTikTok looks in action</summary>

| <img src="/.github/readme/compare.png" alt="Video Preview" height="400px" /> |
| :--------------------------------------------------------------------------: |
|          Comparing `tiktok.com` vs. `tnktok.com` embeds on Discord           |

| <img src="/.github/readme/slideshow.png" alt="Slideshow Preview" /> |
| :-----------------------------------------------------------------: |
|                          Slideshow embeds                           |

| <img src="/.github/readme/direct.png" alt="Direct Preview" height="400px" /> |
| :--------------------------------------------------------------------------: |
|                          Direct image/video support                          |

</details>

## 📖 Usage

Using fxTikTok is easy on Discord. Fix ugly and unresponsive embeds by sending your TikTok link and then typing `s/i/n`

<details>
  <summary>👁️ Visual learner? Click here to see a GIF tutorial</summary>

  <img src=".github/readme/introduction.gif" alt="Introduction GIF" height="500px" style="border-radius:2%" />
</details>

### How does this work?

When you send `s/i/n` in Discord, it modifies your most recent message using the [sed](https://www.gnu.org/software/sed/manual/sed.html) format. Specifically, it replaces the first occurrence of the second parameter (`i`) in the message with the third parameter (`n`).

|     Before     |     After      |
| :------------: | :------------: |
| t**i**ktok.com | t**n**ktok.com |

> [!TIP]
> If you run a Discord server, I highly recommend adding [FixTweetBot](https://github.com/Kyrela/FixTweetBot) to your server. It automatically modifies links to use embed fixers like fxTikTok, and is highly customizable.

### Embed Modes

You can customize embeds using subdomains or URL query parameters:

| Mode | Subdomain | Query Parameter | Description |
| :--- | :--- | :--- | :--- |
| **Direct** | `d.tnktok.com` | `?isDirect=true` | Shows only the media without statistic clutter. |
| **Captions** | `a.tnktok.com` | `?addDesc=true` | Adds the video caption/description to the top (Discord hides `og:description` on videos). |
| **High Quality** | `hq.tnktok.com` | `?hq=true` | Enables H.265/HEVC playback for higher quality (defaults to H.264 for [compatibility](https://github.com/okdargy/fxTikTok/issues/14)). |

Modes can be combined by chaining subdomains (e.g. `hq.a.tnktok.com`) or query parameters (e.g. `?hq=true&addDesc=true`). Note that Direct and Captions cannot be used together.

### Why use tnktok.com?

We check all the boxes for being one of the best TikTok embedding services with many features that others don't have. Here's a table comparing our service, tnktok.com, with the other TikTok embedding services as well as TikTok's default embeds.

|                                        | [fxTikTok](https://www.tnktok.com) | Default TikTok | [kkScript](https://kktiktok.com/) | [tfxktok.com](https://tfxktok.com) | [EmbedEZ](https://tiktokez.com) |
| -------------------------------------- | ---------------------------------- | -------------- | --------------------------------- | ---------------------------------- | ------------------------------- |
| Embed playable videos                  | ☑️                                 | ☑️             | ☑️                                | ☑️                                 | ☑️                              |
| Embed multi-image slideshows           | ☑️                                 | ❌             | ❌                                | ☑️                                 | ☑️                              |
| Open source                            | ☑️                                 | ❌             | ❔                                | ❌                                 | ❌                              |
| Supports direct embeds                 | ☑️                                 | ❌             | ❔                                | ❌                                 | ❌                              |
| Shows like, shares, comments           | ☑️                                 | ☑️             | ❌                                | ☑️                                 | ☑️                              |
| Removes tracking for redirects         | ☑️                                 | ❌             | ❌                                | ☑️                                 | ☑️                              |
| Support for multi-continent short URLs | ☑️                                 | ☑️             | ❌                                | ❌                                 | ☑️                              |
| Support for h265/high quality          | ☑️                                 | ❌             | ❌                                | ❌                                 | ❌                              |
| Last commit                            | [![][tnk]][tnkc]                   | N/A            | [![][kkt]][kktc]                  | N/A                                | N/A                             |

[tnk]: https://img.shields.io/github/last-commit/okdargy/fxTikTok?label
[tnkc]: https://github.com/okdargy/fxTikTok/commits
[kkt]: https://img.shields.io/github/last-commit/kkscript/kk?label
[kktc]: https://github.com/kkscript/kk/commits

The following embed services are not listed due to being unmaintained or simply not working:

- [tiktxk.com](https://tiktxk.com)
- [vxtiktok.com](https://vxtiktok.com) (redirecting to kkScript)

## 💻 Selfhosting

By default, when setting up a new fxTikTok instance, the default offload server is `offload.tnktok.com`.
To setup your own, just compile and run [`offload.ts`](/src/offload.ts) which will start on port **8787**.

```bash
# Install all necessary dependencies
pnpm install
# Start your server
bun run src/offload.ts
```

> I recommend configuring this to your own domain alongside a reverse proxy like [nginx](https://nginx.org) and on top of Cloudflare with protection on.

Next, deploy your Worker with the button below and follow the instructions.

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/okdargy/fxtiktok)

Once done, go to "Settings" and change your offload server under "Variables and Secrets":

<img src=".github/readme/settings.png" alt="Settings Page, showing where to click to change your Offload Server" height="300px" style="border-radius:2%" />

## 📈 Observability

fxTikTok exposes Prometheus metrics at `/metrics`! This is only exposed only when `METRICS_ENABLED=true` is set in your environment varialbes.

Example Prometheus scrape config:

```yaml
scrape_configs:
  - job_name: fxtiktok
    metrics_path: /metrics
    static_configs:
      - targets:
          - your-api-domain.example.com
```

Useful exported metrics:

- `fxtiktok_requests_total{route,method,status_class}`
- `fxtiktok_request_duration_seconds_bucket{route,method,le}`
- `fxtiktok_request_duration_seconds_sum{route,method}`
- `fxtiktok_request_duration_seconds_count{route,method}`
- `fxtiktok_unhandled_exceptions_total{route,method,exception_type}`