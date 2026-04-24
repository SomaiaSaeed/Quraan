# Quran App — Project Knowledge Base

## Stack & Config
- **Angular 16**, lazy-loaded feature modules
- **Tailwind CSS v3** with `tw-` prefix (all utility classes prefixed)
- **PrimeNG** for UI components (context menu, dialogs)
- **ngx-owl-carousel-o** for mushaf page carousel
- **ngx-spinner** for loading overlays (z-index: 99999)
- **Brand colors**: `#94A684` (sage green), `#E4E4D0` (border/secondary), `#fdf9ee` (parchment page bg)
- **Dev server**: `ng serve` on port 4200, branch `dev`

---

## Project Structure

```
src/app/
├── core/
│   └── constants/
│       └── quraanImages.constant.ts   ← InputItem interface, IMAGES array, types
├── dashboard/
│   └── home/
│       ├── home.component.ts          ← main layout, motashabehat side panels
│       ├── home.component.html
│       ├── home.component.scss
│       └── components/
│           └── quraanImages/
│               ├── quraanImages.component.ts    ← core mushaf rendering
│               ├── quraanImages.component.html
│               └── quraanImages.component.scss
```

---

## Key Interfaces

### InputItem (`quraanImages.constant.ts`)
```typescript
export interface InputItem {
  motashabehat: Motashabehat;
  ayat: any[];
  aya: string;
  ayaId: string;        // ← string, e.g. "2" — NOT 'id'
  spans: Span[];
  motashabehatSpans: MotashabehatSpan[];
  spansOfColoredWords: SpansOfColoredWords[];
  isActive: boolean;
  href: string;
  activeAya: number;
  matchedWord: string;
  arrOfColoredWords: ArrOfColoredWords[];
  errorFactor: string;
}
```

### Aya object (runtime, inside mushafLines)
```typescript
{
  id: string,            // e.g. "2" — string NOT number
  ayaNumber: number,
  highlighted: boolean,  // toggled by click
  _hlFirstLine: number,  // mushaf line index where aya starts
  _hlLastLine: number,   // mushaf line index where aya ends
  ...
}
```

---

## home.component.ts — Key Logic

### `onAyaClick(aya)`
Receives emitted aya from `quraanImages`. Matches motashabehat spans by ayaId:
```typescript
onAyaClick(aya: any) {
  this.leftMotashabehatSpans.forEach((mot) => {
    if (parseInt(mot.ayaId) === parseInt(aya.id)) mot.highlighted = aya.highlighted;
  });
  this.rightMotashabehatSpans.forEach((mot) => {
    if (parseInt(mot.ayaId) === parseInt(aya.id)) mot.highlighted = aya.highlighted;
  });
}
```
> **Important**: Use `mot.ayaId` (string), NOT `mot.id` (doesn't exist on InputItem).

### `onMotshbehatGenerated($event: InputItem[])`
Called when quraanImages emits motashabehat data. Splits items into left/right panels:
- `_startsRight === true` → push to `leftMotashabehatSpans` (displayed on right side visually)
- `_startsRight === false` → push to `rightMotashabehatSpans` (displayed on left side visually)

### `hasHighlight(inp)` → `boolean`
Returns `inp.highlighted` — used in template for active box styling and indicator dot.

### Layout constants
```typescript
const COL_WIDTH = 134;         // px per motashabehat column
const MAX_COL_INDEX = 2;       // max 3 columns
const QURAN_TOP_OFFSET = 24;   // matches tw-pt-5
const BOX_PADDING_PX = 12;
const BOX_LINE_HEIGHT_PX = 17;
```

---

## quraanImages.component.ts — Key Logic

### `toggleHighlight(aya)`
```typescript
toggleHighlight(aya: any) {
  aya.highlighted = !aya.highlighted;
  this.onClick.emit(aya);   // home.component listens via (onClick)="onAyaClick($event)"
}
```

### `onRightClick(event, aya)`
Sets `contextMenuItems` array and calls `this.contextMenu.show(event)`.
PrimeNG context menu must have `appendTo="body"` in the template, otherwise it's clipped
by `overflow: hidden` on `.quran-wrapper` and `.tw-overflow-hidden` containers.

### `buildMushafLines` — first/last line tracking
After building mushafLines, the component tracks which mushaf line each aya first/last appears on:
```typescript
const ayaFirstLine = new Map<any, number>();
const ayaLastLine  = new Map<any, number>();
mushafLines.forEach((ml, idx) => {
  ml.segments.forEach(seg => {
    if (!ayaFirstLine.has(seg.aya)) ayaFirstLine.set(seg.aya, idx);
    ayaLastLine.set(seg.aya, idx);
  });
});
ayaFirstLine.forEach((lineIdx, aya) => { aya._hlFirstLine = lineIdx; });
ayaLastLine.forEach((lineIdx, aya)  => { aya._hlLastLine  = lineIdx; });
```

### Outputs / EventEmitters
| Name | Type | Description |
|------|------|-------------|
| `onClick` | `EventEmitter` | emits aya object on left-click |
| `onRight` | `EventEmitter` | (unused — 0 observers) |
| `motshabehat` | `EventEmitter<InputItem[]>` | emits on page change |
| `pageNumberChange` | `EventEmitter<number>` | emits current page number |
| `motahabehClick` | `EventEmitter` | motashabehat click |

---

## Template Patterns

### home.component.html layout
```
grid-cols-7:
  [col-span-2] right motashabehat panel (dir=rtl)
  [col-span-3] quran-wrapper > paper-stack + app-quraanImages
  [col-span-2] left motashabehat panel (dir=rtl)
```
Hidden on mobile (md:tw-hidden / md:tw-block).

### Motashabehat box indicator (home.component.html)
```html
<div class="motashabehat-box"
  [class.motashabehat-box--active]="hasHighlight(inp)"
  [style.top.px]="getAyaTop(inp)"
  [style.right.px]="getColOffset(inp)">
  <span *ngIf="hasHighlight(inp)" class="mot-indicator"></span>
  ...
</div>
```

### quraanImages.component.html — mushaf line
```html
<div class="mushaf-line"
  [class.mushaf-line-centered]="line.isCentered"
  [class.line-hl]="isLineHighlighted(line)"
  [class.line-hl-first]="isFirstHighlightedLine(line, li)"
  [class.line-hl-last]="isLastHighlightedLine(line, li)">
  <ng-container *ngFor="let seg of line.segments">
    <ng-container *ngFor="let w of seg.lineColoredWords">
      <span class="mushaf-word"
        [class.word-hl]="seg.aya.highlighted"
        [style.text-decoration-line]="w.color ? 'underline' : 'none'"
        [style.text-decoration-color]="w.color"
        (click)="toggleHighlight(seg.aya)"
        (contextmenu)="onRightClick($event, seg.aya)">{{ w.word }}</span>
    </ng-container>
    <span *ngIf="seg.isAyaEnd" class="aya-aya">{{ convertToArabicNumbers(seg.aya.ayaNumber) }}</span>
  </ng-container>
</div>
```

### Context menu (MUST have appendTo="body")
```html
<p-contextMenu #menu [model]="contextMenuItems" appendTo="body"></p-contextMenu>
```
Without `appendTo="body"`, the menu is clipped by `overflow:hidden` on `.quran-wrapper`.

---

## CSS Architecture

### home.component.scss
| Class | Purpose |
|-------|---------|
| `.motashabehat-side` | Fixed-height panel, `position: relative`, `overflow: hidden` |
| `.motashabehat-box` | Absolutely positioned box, `position: absolute`, 128px wide |
| `.motashabehat-box--active` | Sage border `#94A684`, tinted bg `#edf7ed`, z-index 3 |
| `.mot-indicator` | Pulsing dot, `position: absolute; top:-5px; right:-5px`, bg `#94A684` |
| `.quran-wrapper` | `overflow: hidden` — clips carousel stage overflow |
| `.paper-stack` | Decorative paper-edge strip, left/right variants |
| `.sura-active` | Active sura entry in motashabehat box (amber) |

### quraanImages.component.scss
| Class | Purpose |
|-------|---------|
| `.carousel-wrapper` | `height: calc(100vh - 170px)`, `min-height: 600px` |
| `.mushaf-body` | `line-height: 2.1`, `margin: 0 8px` |
| `.mushaf-body-special` | Pages 1 & 2: wider margins, centered lines |
| `.mushaf-line` | `display: flex; justify-content: space-between; direction: rtl` |
| `.mushaf-line-centered` | Basmala/sura-start lines: `justify-content: center; gap: 6px` |
| `.mushaf-word` | `white-space: nowrap`, underline for color coding |
| `.word-hl` | Aya highlight: `background: rgba(148,166,132,0.2); border-radius: 3px` |
| `.aya-aya` | Aya number circle using `aya.png` asset, 24×24px |
| `.color-legend` | Compact strip below mushaf, `direction: rtl` |

---

## Known Issues & Solutions

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Motashabehat indicator not showing | `mot.id` doesn't exist; use `mot.ayaId` | `parseInt(mot.ayaId) === parseInt(aya.id)` |
| Right-click menu hidden/clipped | `p-contextMenu` inside `overflow:hidden` containers | Add `appendTo="body"` to `<p-contextMenu>` |
| Words merging / huge gaps on page 3 | Wrapper `<span>` inside flex breaks `justify-content: space-between` | Apply highlight per-word directly, never wrap words |
| Mobile carousel 200px wide | Grid had no `grid-cols-1` on mobile, flex children had no `min-width:0` | Add `tw-grid-cols-1`, `min-width:0; overflow:hidden` on host/wrapper |

---

## Page Data Flow

```
IMAGES (constant) → [images] input → quraanImages
  → loadPage(n) → HTTP/JSON → buildMushafLines()
    → mushafLines[].segments[].aya  (shared object references)
    → aya._hlFirstLine / aya._hlLastLine set here
  → motshabehat output → home.onMotshbehatGenerated()
    → leftMotashabehatSpans / rightMotashabehatSpans
    → positioned via getAyaTop() / getColOffset()

User click on word:
  → toggleHighlight(aya) → aya.highlighted toggled
  → onClick.emit(aya)
  → home.onAyaClick(aya)
    → finds matching span by parseInt(mot.ayaId) === parseInt(aya.id)
    → sets mot.highlighted = aya.highlighted
    → hasHighlight(inp) → true → mot-indicator shown
```

---

## Color Coding (Underlines on Words)

| Color | Meaning |
|-------|---------|
| `#FF0000` Red | Single word, start of aya |
| `#00CC44` Green | 2 occurrences |
| `#0000FF` Blue | 3 occurrences |
| `#CCCC00` Yellow | 4 occurrences |
| `#800080` Purple | More than 4 |
| `#FFA500` Orange | Single word, middle of aya |

---

## Git
- Main working branch: `dev`
- Remote: `https://github.com/SomaiaSaeed/Quraan.git`
- TLS verification disabled on this machine (warning on push — expected, not an error)
- No Co-Authored-By in commits (user preference)
