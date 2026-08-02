# Perplexity Design Reference (captured live on perplexity.ai, dark theme, 2026-08)

## Global
- Font: `pplxSans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- Text colour `#d6d5d4`, page background `#171615`.
- 751 CSS custom properties; semantic naming is `--bg-*`, `--surface-*`, `--fg-*`, `--border-*`, `--accent-*`.

## Tokens (dark)
| Token | Value |
|---|---|
| `--bg-base` / `--surface-base` | `#171615` |
| `--bg-raised` / `--surface-raised` | `#1e1d1c` |
| `--surface-underlay` | `#121211` |
| `--bg-soft` | `#d6d5d412` |
| `--bg-subtle` | `#d6d5d409` |
| `--bg-backdrop` | `#171615b3` |
| `--bg-inverse` | `#d6d5d4` |
| `--fg-primary` | `#d6d5d4` |
| `--fg-secondary` | `#d6d5d4a6` |
| `--fg-tertiary` | `#d6d5d480` |
| `--fg-inverse` | `#171615` |
| `--border-heavy` | `#d6d5d4` |
| `--border-medium` | `#d6d5d424` |
| `--border-soft` | `#d6d5d412` |
| `--border-focus` / `--accent-bg-strong` | `#4e99a3` (signature teal) |
| `--accent-bg-soft` | `#4e99a317` |

## Radii
`--radius-2xs 2px` · `xs 4px` · `sm 6px` · `md 8px` · `lg 12px` · `2xl 16px` · `3xl 24px` · `full 9999px`

## Notes
- The backdrop token `--bg-backdrop` (`#171615b3`) is the modal scrim.
- Accent teal `#4e99a3` drives focus rings and primary actions.
