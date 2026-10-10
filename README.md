# MatchBoard | Premium Zero-Server Live Scoreboard

**Live URL:** [https://match-board.github.io](https://match-board.github.io)  
**Support Developer:** [Buy Me a Coffee](https://buymeacoffee.com/kisharadilz)

A **100% client-side, zero-server digital scoreboard** built with **Astro**, **React Islands**, **Framer Motion**, and **Tailwind CSS**. MatchBoard unlocks broadcast-level features for free, utilizing `lz-string` URL-hash state compression for real-time link sharing and `LocalStorage` for unlimited saved matches and team rosters.

---

## ✨ Key Architectural Features

- **⚡ Zero-Server & Instant Load:** Static Site Generation (SSG) via Astro with isolated React Islands for interactive scoring.
- **🎯 Massive Ergonomic Touch Targets:** Split-screen scoreboard cards spanning $\ge 64\%$ of viewport height. Tap the **upper 50%** to `+1` and **lower 50%** to `-1`.
- **🎰 Physical Rolling Number Animations:** Framer Motion spring physics odometer effect on every score change.
- **🔗 Live URL-Hash State Sync (`#data=...`):** Automatically encodes scores, team names, periods, timers, and custom colors into a compact `lz-string` URL hash for 1-click sharing via WhatsApp, Telegram, or SMS.
- **💾 Unlimited Saved Matches & Team Rosters:** Save infinite match histories and team profiles (including downscaled logos) directly to browser `LocalStorage`, with portable `.json` export/import backup.
- **🎥 OBS Studio Broadcast Overlay Mode:** Dedicated chroma-key green (`#00FF00`) lower-third broadcast mode designed for OBS Browser Sources and live sports streamers.
- **🎨 Custom Team Colors, Logos & CSS Overrides:** Client-side `FileReader` + HTML5 `<canvas>` downscaling ($128 \times 128\text{px}$ WebP/PNG) and a live CSS override injector.
- **🌍 Multi-Language Support:** Instant client-side i18n switching across English (`en`), Español (`es`), Français (`fr`), Português (`pt`), and Deutsch (`de`).

---

## ⌨️ Referee Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `Q` / `A` | Team A Score `+1` / `-1` |
| `P` / `L` | Team B Score `+1` / `-1` |
| `Space` | Start / Pause Match Clock |
| `Esc` | Exit OBS Broadcast Overlay Mode |

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start development server at http://localhost:4321
npm run dev

# Build static production output into ./dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🎨 Design System Palette

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `deep-teal` | `#287A74` | High-contrast light mode typography & primary CTAs |
| `muted-teal` | `#55A9A0` | Secondary borders, interactive hover states |
| `mint-green` | `#AEEED3` | Dark mode stadium neon accents & active badges |
| `pale-yellow` | `#FFF8B0` | Warm highlights & light mode accent surfaces |

---

## 💖 Support the Developer

If MatchBoard helps power your tournaments, streams, or local games, consider supporting the project:  
👉 **[https://buymeacoffee.com/kisharadilz](https://buymeacoffee.com/kisharadilz)**
