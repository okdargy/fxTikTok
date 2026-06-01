# MegaPenisPoopenFarten.SEX, a fork of fxTikTok

Embed TikTok videos and slideshows on Discord!

> [!NOTE]  
> Have a feature you want to see in fxTikTok or want to report a bug? Make an issue on upstream!

## 📸 Screenshots
  
<img src="/.github/readme/compare.png" alt="Video Preview" height="400px" />
:--------------------------------------------------------------------------:
  Comparing `tiktok.com` vs. `megapenispoopenfarten.sex` embeds on Discord

<img src="/.github/readme/slideshow.png" alt="Slideshow Preview" />
:-----------------------------------------------------------------:
                         Slideshow embeds                          

<img src="/.github/readme/direct.png" alt="Direct Preview" height="400px" />
:--------------------------------------------------------------------------:
                         Direct image/video support                         

## 📖 Usage

Using MegaPenisPoopenFarten.SEX is easy on Discord. Simply replace tiktok.com with megapenispoopenfarten.sex, or you can send your TikTok link and then type `s/tiktok.com/megapenispoopenfarten.sex`

### How does this work?

When you send `s/tiktok.com/megapenispoopenfarten.sex/g` in Discord, it modifies your most recent message using the [sed](https://www.gnu.org/software/sed/manual/sed.html) format. Specifically, it replaces the first occurrence of the second parameter (`tiktok.com`) in the message with the third parameter (`megapenispoopenfarten.sex`).

|     Before     |     After      |
| :------------: | :------------: |
| tiktok.com | megapenispoopenfarten.sex |

> [!TIP]
> If you run a Discord server, I highly recommend adding [FixTweetBot](https://github.com/Kyrela/FixTweetBot) to your server. It automatically modifies links to use embed fixers like fxTikTok, and is highly customizable.

### Using Direct Embeds

Don't want all that statistic clutter on your embed and only want the video or image? Simply change your URL to `d.megapenispoopenfarten.sex`

|         Before         |        After         |
| :--------------------: | :------------------: |
| **www**.tiktok.com | **d**.megapenispoopenfarten.sex |

> Alternatively, you can also set `isDirect` to true through the URL query by adding `?isDirect=true` at the end of your URL

### "I don't see the video's caption!"

By default, fxTikTok puts the description into the `og:description` tag, but Discord removes that from the embed if there's a video inside the embed. fxTikTok decided not to add it to the top like what [tfxktok.com](https://tfxktok.com) does to prevent the embed from getting too cluttered with hashtags.

However, fxTikTok wants to give users the option to add it if it provides additional context to the video. You can change your URL to `a.megapenispoopenfarten.sex` to add the description to the top.

|         Before         |        After         |
| :--------------------: | :------------------: |
| **www**.tiktok.com | **a**.megapenispoopenfarten.sex |

> Alternatively, you can also set `addDesc` to true through the URL query by adding `?addDesc=true` at the end of your URL

### Changing to High Quality

TikTok supports H.265/HEVC (High Efficiency Video Coding), which offers significantly better quality at the same file size compared to H.264, at the cost of compatibility. By default, fxTikTok uses H.264 quality since [many users report issues with embeds breaking with H.265](https://github.com/okdargy/fxTikTok/issues/14), but support enabling H.265.

To enable high-quality H.265 playback, add `?hq=true` or use `hq.megapenispoopenfarten.sex`:
| Before | After |
| :--------------------: | :------------------: |
| **www**.tiktok.com | **hq**.megapenispoopenfarten.sex |

### Combining Modes

You can combine different modes by using specific hostnames or URL query parameters. For example, if you want to enable H.265 and also see the caption, you can add `?hq=true&addDesc=true` to the URL.

> You cannot use Direct Mode and Caption Mode simultaneously since they contradict each other.

### Why use MegaPenisPoopenFarten.SEX?

fxTikTok checks all the boxes as one of the best TikTok embedding services, offering many features that others don't. MegaPenisPoopenFarten.SEX is a direct fork with a vanity comedic URL.

|                                        | [fxTikTok](https://github.com/okdargy/fxTikTok) | Default TikTok | [kkScript](https://kktiktok.com/) | [tfxktok.com](https://tfxktok.com) | [EmbedEZ](https://tiktokez.com) |
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
