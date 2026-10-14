# Task 11 computed-style checkpoints

Captured in Chromium from the local production source on 2026-10-14 after the ownership-only consolidation. The colour-token substitutions preserve the exact prior sRGB values; the `.btn` declaration moved unchanged from the page sheet to the component sheet. The existing visual-contract suite stayed green before and after the move.

Shared checkpoints at both widths: body `Schibsted Grotesk`, `15px/27.3px`, paper `rgb(248, 249, 252)`, ink `rgb(7, 17, 43)`, radius `0px`. Available primary buttons: `Josefin Sans`, `11.2px/11.2px`, Ultramarine `rgb(0, 32, 128)`, paper text, radius `0px`, gap `8.8px`.

| Route | Width | Heading family | Heading size / line height | Representative grid | Representative gap |
| --- | ---: | --- | --- | --- | --- |
| Home | 390 | BIZ UDPMincho | 54.6 / 49.686px | 350px | 16.8px |
| Work | 390 | BIZ UDPMincho | 58.5 / 53.82px | 350px | 16px |
| TEDx RSU | 390 | BIZ UDPMincho | 38.4 / 40.32px | 350px | 25.2px |
| About | 390 | BIZ UDPMincho | 54.6 / 54.6px | 350px | 56px |
| Services | 390 | BIZ UDPMincho | 54.6 / 54.6px | 350px | 33.6px |
| Contact | 390 | BIZ UDPMincho | page heading uses contact composition | 350px | 25.2px |
| Home | 1440 | BIZ UDPMincho | 109.44 / 99.5904px | 12-column grid | 12px |
| Work | 1440 | BIZ UDPMincho | 100.8 / 92.736px | 1301.76px | 25.6px |
| TEDx RSU | 1440 | BIZ UDPMincho | 86.4 / 90.72px | 394.984px | 25.2px |
| About | 1440 | BIZ UDPMincho | 108 / 108px | 439.555px 732.609px | 129.6px |
| Services | 1440 | BIZ UDPMincho | 108 / 108px | 533.953px 652.609px | 115.2px |
| Contact | 1440 | BIZ UDPMincho | page heading uses contact composition | 860.258px | 25.2px |

Production output remains one CSS request and `21,459` gzip bytes, below the `45 KB` contract.
