# Claude.ai Design Reference (captured live on claude.ai, dark theme, 2026-08)

## Global
- Body: `background #202020` (gray-800), `color #f9f9f7`, font `"Anthropic Sans", system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`, 16px base.
- Root class: `cds-root`. Design-system prefix: `--cds-*`, semantic tokens are raw HSL triplets used as `hsl(var(--bg-100))`.

## Semantic tokens (dark)
| Token | HSL | Hex |
|---|---|---|
| `--bg-000` | `60 2.3256% 16.8627%` | `#2b2b2a` |
| `--bg-100` | `60 1.5873% 12.3529%` | `#201f1f` |
| `--bg-200` | `60 2.1277% 9.2157%` | `#181817` |
| `--bg-300` | `0 0% 7.451%` | `#131313` |
| `--bg-400` / `--bg-500` | `0 0% 4.3137%` | `#0b0b0b` |
| `--text-000` / `--text-100` | `60 14.2857% 97.2549%` | `#f9f9f7` |
| `--text-200` / `--text-300` | `55 9.0909% 74.1176%` | `#c3c2b7` |
| `--text-400` / `--text-500` | `48 4.5872% 57.2549%` | `#97958d` |
| `--border-100..300` | `52.5 11.7647% 86.6667%` | `#e1e0d9` (used at low alpha) |
| `--danger-100` | `.3871 73.4597% 58.6275%` | red |
| `--oncolor-100` | `0 0% 100%` | `#fff` |
| `--accent-brand` | `14.7692 63.1068% 59.6078%` | `#d97757` (clay) |
| `--accent-pro-000` | `246 75% 84.3137%` | periwinkle |

## Palette (`--cds-gray-*`)
0 `#ffffff` · 10 `#fcfcfb` · 20 `#f9f9f7` · 30 `#f6f6f4` · 40 `#f3f3f0` · 50 `#f0efec` · 60 `#edece8` · 80 `#e7e6e1` · 90 `#e4e3dd` · 100 `#e1e0d9` · 150 `#d2d1c7` · 200 `#c3c2b7` · 300 `#a5a49a` · 350 `#97958d` · 450 `#7b7974` · 500 `#6d6b67` · 600 `#52514e` · 650 `#454442` · 700 `#383835` · 750 `#2c2c2a` · 800 `#20201f` · 810 `#1e1e1d` · 830 `#1a1a19` · 840 `#181817` · 850 `#151515` · 860 `#131313` · 870 `#111111` · 890 `#0d0d0d` · 900 `#0b0b0b`

Brand: `--cds-clay #d97757`, `--cds-clay-emphasized #c6613f`.

## Radius & elevation
- `--cds-radius`: `8px` (base control radius).
- `--cds-border`: `hsl(from #fff h s l / 10%)`.
- `--cds-shadow-sm`: `0 1px 2px 0 hsl(from #0b0b0b h s l / 6%), 0 2px 8px 0 #0000003d`
- `--cds-shadow-md`: `0 2px 4px 0 hsl(from #0b0b0b h s l / 7%), 0 6px 16px 0 #0000003d`
- `--cds-shadow-lg`: `0 4px 8px 0 hsl(from #0b0b0b h s l / 8%), 0 12px 28px -2px #0000003d`

## Motion
- `--cds-ease-out`: `cubic-bezier(.165, .84, .44, 1)`
- `--df-ease-out-cubic`: `cubic-bezier(.215, .61, .355, 1)`
- Toggle knob: `.12s cubic-bezier(0.34, 1.3, 0.64, 1)` (slight overshoot).
- Nav/hover transitions: `.15s cubic-bezier(0.4, 0, 0.2, 1)`.

## Modal (`role="dialog"`, settings)
- Background `#2c2c2a` (gray-750), `border-radius 12px`, `border 1px rgba(255,255,255,.05)`.
- Scrim: `rgba(0,0,0,.5)` + `backdrop-filter: blur(2px)`, fades with `duration-base ease-out`.
- Title: 22px, weight 580.
- Sidebar/nav item: height 32px, radius 8px, padding `0 8px`, 14px/500, selected background `rgba(255,255,255,.1)`.

## Toggle (`role="switch"`)
- Track 36×20, pill radius, padding 2px; ON background `#2a78d6` (blue).
- Knob 16×16 white circle, transition `.12s cubic-bezier(.34,1.3,.64,1)`.

## Messages
- User message bubble: background `#131313` (`bg-300`, or `bg-000` in darker mode), `border-radius 12px` (`rounded-xl`), padding `10px 16px`, font 16px.
- Assistant message: no bubble, plain text on page background.
- Message action bar: `flex items-stretch justify-between`, `text-text-300`; buttons 24×24, radius 6px, color `#898781`.

## Composer
- Background `#2c2c2a`, `border-radius 20px`.

## Buttons (`cds-reset` base)
- Icon button: 32×32, radius 8px, transparent background, `font-weight 500`, 14px.
- Small icon button (message bar): 24×24, radius 6px.
- Primary/brand action uses clay `#d97757` with `--oncolor-100` text.

## Light theme (Claude standard)
- bg-000 `#ffffff`, bg-100 `#f9f9f7`, bg-200 `#f0efec`, bg-300 `#e7e6e1`.
- text-000/100 `#0b0b0b`, text-200/300 `#52514e`, text-400/500 `#7b7974`.
- Borders `rgba(0,0,0,.1)`.
