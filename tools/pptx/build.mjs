// Builds docs/From-WordPress-to-Astro-Payload.pptx from docs/SLIDES.html.
//
//   npm --prefix tools/pptx install        # once; its deps stay out of the workshop install
//   node tools/pptx/build.mjs              # writes the .pptx next to SLIDES.html
//   node tools/pptx/team-deck.mjs && node tools/pptx/build.mjs --team   # attendee copies, no notes
//
// SLIDES.html is the source of truth for the deck. This script maps each slide's HTML layout
// (.compare, .models, .arch, table, .steps, .two, .timeline, .kv, .callout, .box, pre, ul)
// onto pptxgenjs shapes with the same colours and fonts, and copies the speaker notes.
// Text sizes are chosen with real IBM Plex glyph widths (widths.json) so titles
// stay on one line and boxes do not overflow. Re-run it after every deck edit.
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { JSDOM } from 'jsdom'

const require = createRequire(import.meta.url)
const pptxgen = require('pptxgenjs')

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '../..')
// `--team` builds the attendee copy from SLIDES-team.html (no speaker notes) into a separate file.
const TEAM = process.argv.includes('--team')
const SRC = resolve(root, TEAM ? 'docs/SLIDES-team.html' : 'docs/SLIDES.html')
const OUT = resolve(root, TEAM ? 'docs/From-WordPress-to-Astro-Payload-team.pptx' : 'docs/From-WordPress-to-Astro-Payload.pptx')
const WIDTHS = JSON.parse(readFileSync(resolve(here, 'widths.json'), 'utf8'))

// ── palette + fonts (mirrors the :root block in SLIDES.html) ─────────────
const C = {
  bg: '0E1014', stage: '14171D', surface: '1B1F27', line: '2A2F3A',
  text: 'ECEEF3', muted: '9EA7B8', faint: '6B7385', accent: 'FFCF3F',
  wp: '5AA9D6', kit: 'F0883E', sp: '6EA3FF', ok: '7ED3A0',
}
const SANS = 'IBM Plex Sans'
const MONO = 'IBM Plex Mono'

// ── geometry (inches, LAYOUT_WIDE 13.333 x 7.5) ───────────────────────────
const W = 13.333, H = 7.5, ML = 0.7, CW = 11.93
const TITLE_Y = 1.0, CONTENT_Y = 2.05, CONTENT_BOTTOM = 6.8

// ── measuring ─────────────────────────────────────────────────────────────
function textWidthIn(str, pt, face = 'sans') {
  const t = WIDTHS[face]
  let em = 0
  for (const ch of str) em += t[ch] ?? (face === 'mono' ? 0.6 : 0.56)
  return (em * pt) / 72
}
/** Lines a run-list needs in a box `w` inches wide, honouring explicit breaks. */
function linesFor(runs, w) {
  let lines = 0
  let cur = 0
  const avail = Math.max(0.5, w - 0.1)
  for (const r of runs) {
    const face = r.options.fontFace === MONO ? 'mono' : r.options.bold ? 'sansBold' : 'sans'
    const words = String(r.text).split(/(\s+)/)
    for (const wd of words) {
      if (!wd) continue
      const ww = textWidthIn(wd, r.options.fontSize, face)
      if (cur + ww > avail && cur > 0) { lines++; cur = /^\s+$/.test(wd) ? 0 : ww } else cur += ww
    }
    if (r.options.breakLine) { lines++; cur = 0 }
  }
  return lines + (cur > 0 ? 1 : 0)
}
const lineH = (pt, lh = 1.3) => (pt * lh) / 72
function fitTitle(text, startPt, boxW, minPt = 24) {
  let pt = startPt
  while (pt > minPt && textWidthIn(text, pt, 'sansBold') > boxW * 0.97) pt -= 1
  return pt
}

// ── HTML → runs ───────────────────────────────────────────────────────────
const dom = new JSDOM(readFileSync(SRC, 'utf8'))
const doc = dom.window.document
const NodeType = { ELEMENT: 1, TEXT: 3 }

function styleColor(el) {
  const st = el.getAttribute?.('style') || ''
  const m = st.match(/color:\s*var\(--([a-z]+)\)/)
  return m ? C[m[1]] : null
}
function run(text, o) { return { text, options: o } }
/**
 * Inline HTML → pptxgenjs runs. `base` sets fontSize/color/fontFace. <code> becomes mono in
 * `codeColor` (accent by default). <strong> bold, <em> italic, <br> a line break.
 */
function inlineRuns(node, base, ctx = {}) {
  const out = []
  const codeColor = ctx.codeColor ?? C.accent
  const walk = (n, o) => {
    if (n.nodeType === NodeType.TEXT) {
      const t = n.textContent.replace(/\s+/g, ' ')
      if (t) out.push(run(t, { ...o }))
      return
    }
    if (n.nodeType !== NodeType.ELEMENT) return
    const tag = n.tagName.toLowerCase()
    if (tag === 'br') { out.push(run('', { ...o, breakLine: true })); return }
    let no = { ...o }
    if (tag === 'code' || tag === 'kbd') no = { ...no, fontFace: MONO, color: codeColor, fontSize: Math.round(o.fontSize * 0.92 * 10) / 10 }
    if (tag === 'strong' || tag === 'b') no = { ...no, bold: true, color: C.text }
    if (tag === 'em' || tag === 'i') no = { ...no, italic: true }
    const sc = styleColor(n); if (sc) no = { ...no, color: sc }
    if (n.classList?.contains('big-cmd')) no = { ...no, fontFace: MONO, color: C.accent, fontSize: 22 }
    for (const ch of n.childNodes) walk(ch, no)
  }
  for (const ch of node.childNodes) walk(ch, base)
  // trim leading/trailing whitespace runs
  while (out.length && /^\s*$/.test(out[0].text) && !out[0].options.breakLine) out.shift()
  while (out.length && /^\s*$/.test(out[out.length - 1].text) && !out[out.length - 1].options.breakLine) out.pop()
  if (out.length) out[0].text = out[0].text.replace(/^\s+/, '')
  if (out.length) out[out.length - 1].text = out[out.length - 1].text.replace(/\s+$/, '')
  return out
}
/** <pre> → runs, preserving line breaks and the .k/.s/.c/.y token colours. */
function preRuns(pre, pt) {
  const out = []
  const walk = (n, color) => {
    if (n.nodeType === NodeType.TEXT) {
      const parts = n.textContent.split('\n')
      parts.forEach((p, i) => {
        if (i > 0) out.push(run('', { fontFace: MONO, fontSize: pt, color, breakLine: true }))
        if (p) out.push(run(p, { fontFace: MONO, fontSize: pt, color }))
      })
      return
    }
    if (n.nodeType !== NodeType.ELEMENT) return
    const cls = n.getAttribute('class') || ''
    const c = cls.includes('k') ? C.wp : cls.includes('s') ? C.ok : cls.includes('c') ? C.faint : cls.includes('y') ? C.accent : color
    for (const ch of n.childNodes) walk(ch, c)
  }
  for (const ch of pre.childNodes) walk(ch, C.text)
  return out
}
const preLineCount = (pre) => pre.textContent.replace(/\n$/, '').split('\n').length
const preMaxCols = (pre) => Math.max(...pre.textContent.split('\n').map((l) => l.length))

/** <ul> → bullet paragraphs. */
function bulletRuns(ul, base, ctx) {
  const out = []
  const items = [...ul.children].filter((li) => li.tagName === 'LI')
  items.forEach((li, i) => {
    const rs = inlineRuns(li, base, ctx)
    if (!rs.length) return
    rs[0].options = { ...rs[0].options, bullet: { indent: 14 }, paraSpaceAfter: base.paraSpaceAfter ?? 4 }
    if (i < items.length - 1) rs[rs.length - 1].options = { ...rs[rs.length - 1].options, breakLine: true }
    out.push(...rs)
  })
  return out
}

// ── drawing primitives ────────────────────────────────────────────────────
let pres, slide, shapes
function rect(x, y, w, h, fill, line) {
  slide.addShape(shapes.rect, { x, y, w, h, fill: { color: fill }, line: line ? { color: line, width: 0.75 } : { color: fill, width: 0 } })
}
// pptxgenjs writes paragraph properties for EVERY run that carries them, and a paragraph with
// several runs (text + <code>) would get a second <a:pPr> mid-paragraph, which loses the bullet in
// LibreOffice and Google Slides. So paragraph-level options live on the first run of each
// paragraph only, never on the text box.
const PARA_KEYS = ['align', 'lineSpacingMultiple', 'lineSpacing', 'paraSpaceAfter', 'paraSpaceBefore']
function text(runs, x, y, w, h, extra = {}) {
  const boxOpts = { ...extra }
  const para = {}
  for (const k of PARA_KEYS) if (k in boxOpts) { para[k] = boxOpts[k]; delete boxOpts[k] }
  const list = typeof runs === 'string' ? [run(runs, {})] : runs
  let startOfPara = true
  for (const r of list) {
    if (startOfPara) r.options = { ...para, ...r.options }
    startOfPara = Boolean(r.options.breakLine)
  }
  slide.addText(list, { x, y, w, h, margin: 0, isTextBox: true, valign: 'top', ...boxOpts })
}
function mono(str, x, y, w, h, pt, color, extra = {}) {
  text([run(str, { fontFace: MONO, fontSize: pt, color })], x, y, w, h, extra)
}
function dot(x, y, color) { slide.addShape(shapes.ellipse, { x, y, w: 0.14, h: 0.14, fill: { color }, line: { color, width: 0 } }) }
function tagPill(label, x, y, color, pt = 9) {
  const w = textWidthIn(label, pt, 'mono') + 0.22
  slide.addShape(shapes.roundRect, { x, y, w, h: 0.26, rectRadius: 0.13, fill: { color: C.stage }, line: { color, width: 0.75 } })
  text([run(label, { fontFace: MONO, fontSize: pt, color })], x, y + 0.045, w, 0.2, { align: 'center' })
  return w
}
function calloutBox(el, x, y, w, pt = 15) {
  const q = el.classList.contains('q')
  const runs = inlineRuns(el, { fontFace: SANS, fontSize: pt, color: C.text })
  const lines = linesFor(runs, w - 0.6)
  const h = lines * lineH(pt, 1.35) + 0.32
  rect(x, y, w, h, C.surface)
  rect(x, y, 0.06, h, q ? C.sp : C.accent)
  text(runs, x + 0.3, y + 0.16, w - 0.5, h - 0.32)
  return h
}
function codeBox(pre, x, y, w, h, pt) {
  rect(x, y, w, h, C.bg, C.line)
  text(preRuns(pre, pt), x + 0.2, y + 0.16, w - 0.4, h - 0.32, { lineSpacingMultiple: 1.15 })
}
/** Pick a mono size so `pre` fits w x h. */
function preSize(pre, w, h, maxPt = 13) {
  const lines = preLineCount(pre), cols = preMaxCols(pre)
  let pt = maxPt
  while (pt > 8 && (lines * lineH(pt, 1.38) + 0.34 > h || (cols * 0.6 * pt) / 72 > w - 0.4)) pt -= 0.5
  return pt
}

// ── chrome ────────────────────────────────────────────────────────────────
function chrome(sec, n, total) {
  slide.background = { color: C.stage }
  const eyebrow = sec.querySelector('.eyebrow')
  if (eyebrow) {
    const dots = [...eyebrow.querySelectorAll('.dot')].map((d) => d.classList.contains('m1') ? C.accent : d.classList.contains('m2') ? C.ok : d.classList.contains('m3') ? C.sp : C.faint)
    let x = ML
    for (const c of dots) { dot(x, 0.62, c); x += 0.2 }
    const time = eyebrow.querySelector('.time')?.textContent.trim() ?? ''
    const label = [...eyebrow.childNodes].filter((k) => k.nodeType === NodeType.TEXT).map((k) => k.textContent).join('').trim().toUpperCase()
    mono(label, x + 0.07, 0.55, 8.5, 0.3, 11, C.muted, { charSpacing: 1.5 })
    mono(time, 9.63, 0.55, 3.0, 0.3, 11, C.faint, { align: 'right' })
  }
  mono('WEBEE L&D · ASTRO + PAYLOAD WITH CLAUDE CODE', ML, 7.0, 6.0, 0.3, 10, C.faint, { charSpacing: 1 })
  const time = sec.getAttribute('data-time') || ''
  mono(`${n} / ${total}${time ? '  ·  ' + time : ''}`, 8.63, 7.0, 4.0, 0.3, 10, C.faint, { align: 'right' })
  rect(0, 7.46, (n / total) * W, 0.04, C.accent)
}
function title(sec) {
  const h2 = sec.querySelector('h2')
  if (!h2) return CONTENT_Y
  const runs = inlineRuns(h2, { fontFace: SANS, fontSize: 38, color: C.text, bold: true }, { codeColor: C.accent })
  const plain = h2.textContent.replace(/\s+/g, ' ').trim()
  const pt = fitTitle(plain, 38, CW)
  for (const r of runs) { r.options.fontSize = pt; if (r.options.fontFace === MONO) r.options.fontFace = SANS }
  // the <span class="accent"> in a title
  for (const sp of h2.querySelectorAll('span.accent')) {
    const t = sp.textContent
    for (const r of runs) if (r.text.trim() === t.trim()) r.options.color = C.accent
  }
  text(runs, ML, TITLE_Y, CW, 1.0, { valign: 'middle', lineSpacingMultiple: 1.0 })
  return CONTENT_Y
}

// ── layouts ───────────────────────────────────────────────────────────────
function layoutTitleSlide(sec) {
  slide.background = { color: C.stage }
  text([run('Webee', { fontFace: SANS, fontSize: 20, color: C.text, bold: true }), run('.', { fontFace: SANS, fontSize: 20, color: C.accent, bold: true }), run('  L&D', { fontFace: SANS, fontSize: 20, color: C.text, bold: true })], ML, 0.6, 6, 0.5)
  const h1 = sec.querySelector('h1')
  text(inlineRuns(h1, { fontFace: SANS, fontSize: 60, color: C.text, bold: true }), ML, 2.5, 11, 2.3, { valign: 'bottom', lineSpacingMultiple: 0.95 })
  const lede = sec.querySelector('.lede')
  text(inlineRuns(lede, { fontFace: SANS, fontSize: 20, color: C.muted }), ML, 5.05, 9.5, 1.0)
  const meta = [...sec.querySelectorAll('.meta span')].map((s) => s.textContent.trim()).join('     ')
  mono(meta, ML, 6.15, 12, 0.4, 12, C.muted)
  mono('WEBEE L&D · ASTRO + PAYLOAD WITH CLAUDE CODE', ML, 7.0, 6.0, 0.3, 10, C.faint, { charSpacing: 1 })
}

function layoutCompare(el, x, y, w, bottom) {
  const sides = [...el.querySelectorAll(':scope > .side')]
  const gap = 0.5, cw = (w - gap) / 2
  sides.forEach((side, i) => {
    const sx = x + i * (cw + gap)
    const color = side.classList.contains('side-wp') ? C.wp : C.accent
    rect(sx, y, cw, 0.05, color)
    let cy = y + 0.14
    const label = side.querySelector(':scope > .label')
    if (label) { mono(label.textContent.trim().toUpperCase(), sx, cy, cw, 0.3, 11, color, { charSpacing: 1.5 }); cy += 0.34 }
    const file = side.querySelector(':scope > .file')
    if (file) { mono(file.textContent.trim(), sx, cy, cw, 0.3, 11, C.muted); cy += 0.32 }
    const ul = side.querySelector(':scope > ul')
    const pre = side.querySelector(':scope > pre')
    const ps = [...side.querySelectorAll(':scope > p')]
    if (ul) {
      let pt = 17
      let runs = bulletRuns(ul, { fontFace: SANS, fontSize: pt, color: C.text, paraSpaceAfter: 6 })
      while (pt > 12 && linesFor(runs, cw - 0.3) * lineH(pt, 1.4) + 0.1 * ul.children.length > bottom - cy) { pt -= 1; runs = bulletRuns(ul, { fontFace: SANS, fontSize: pt, color: C.text, paraSpaceAfter: 6 }) }
      text(runs, sx, cy, cw, bottom - cy, { lineSpacingMultiple: 1.1 })
    }
    if (pre) {
      let ph = bottom - cy
      let pRuns = [], pH = 0
      if (ps.length) {
        pRuns = ps.flatMap((p) => inlineRuns(p, { fontFace: SANS, fontSize: 14, color: C.muted }))
        pH = linesFor(pRuns, cw) * lineH(14, 1.3) + 0.15
        ph -= pH
      }
      const pt = preSize(pre, cw, ph, 13)
      const needed = Math.min(ph, preLineCount(pre) * lineH(pt, 1.38) + 0.4)
      codeBox(pre, sx, cy, cw, needed, pt)
      if (ps.length) text(pRuns, sx, cy + needed + 0.12, cw, pH)
    }
  })
}

function layoutModels(el, x, y, w, bottom) {
  const models = [...el.querySelectorAll(':scope > .model')]
  const gap = 0.35, cw = (w - gap * (models.length - 1)) / models.length
  const defaults = [C.accent, C.ok, C.sp]
  models.forEach((m, i) => {
    const mx = x + i * (cw + gap)
    const color = styleColor({ getAttribute: () => (m.getAttribute('style') || '').replace('border-top-color', 'color') }) || defaults[i] || C.accent
    rect(mx, y, cw, 0.05, color)
    let cy = y + 0.18
    const n = m.querySelector(':scope > .n')
    if (n) { mono(n.textContent.trim().toUpperCase(), mx, cy, cw, 0.3, 10.5, C.muted, { charSpacing: 1.5 }); cy += 0.36 }
    const h3 = m.querySelector(':scope > h3')
    if (h3) {
      const runs = inlineRuns(h3, { fontFace: SANS, fontSize: 21, color: C.text, bold: true })
      const lh = linesFor(runs, cw) * lineH(21, 1.2) + 0.1
      text(runs, mx, cy, cw, lh, { lineSpacingMultiple: 1.0 }); cy += lh + 0.12
    }
    const p = m.querySelector(':scope > p')
    if (p) text(inlineRuns(p, { fontFace: SANS, fontSize: 16, color: C.muted }), mx, cy, cw, bottom - cy, { lineSpacingMultiple: 1.15 })
    const ul = m.querySelector(':scope > ul')
    if (ul) {
      let pt = 15
      let runs = bulletRuns(ul, { fontFace: SANS, fontSize: pt, color: C.text, paraSpaceAfter: 5 })
      while (pt > 11 && linesFor(runs, cw - 0.25) * lineH(pt, 1.35) + 0.07 * ul.children.length > bottom - cy) { pt -= 1; runs = bulletRuns(ul, { fontFace: SANS, fontSize: pt, color: C.text, paraSpaceAfter: 5 }) }
      text(runs, mx, cy, cw, bottom - cy, { lineSpacingMultiple: 1.1 })
    }
  })
}

function layoutArch(el, x, y, w, bottom) {
  const boxes = [...el.querySelectorAll(':scope > .box')]
  const arrows = [...el.querySelectorAll(':scope > .arrow')]
  const aw = 0.95, bw = (w - aw * arrows.length) / boxes.length
  const by = y + 0.35, bh = 3.3
  boxes.forEach((b, i) => {
    const bx = x + i * (bw + aw)
    rect(bx, by, bw, bh, C.surface, b.classList.contains('hot') ? C.accent : C.line)
    text(inlineRuns(b.querySelector('h3'), { fontFace: SANS, fontSize: 24, color: C.text, bold: true }), bx + 0.25, by + 0.2, bw - 0.5, 0.5)
    mono(b.querySelector('.sub')?.textContent.trim() ?? '', bx + 0.25, by + 0.7, bw - 0.5, 0.3, 11, C.muted)
    text(bulletRuns(b.querySelector('ul'), { fontFace: SANS, fontSize: 14, color: C.muted, paraSpaceAfter: 4 }, { codeColor: C.accent }), bx + 0.25, by + 1.1, bw - 0.5, bh - 1.3, { lineSpacingMultiple: 1.1 })
    if (arrows[i]) {
      const ax = bx + bw
      const spans = [...arrows[i].querySelectorAll('span')].map((s) => s.textContent.trim())
      mono(spans[0] || '', ax, by + 1.2, aw, 0.3, 9, C.accent, { align: 'center' })
      slide.addShape(shapes.rightArrow, { x: ax + 0.1, y: by + 1.55, w: aw - 0.2, h: 0.22, fill: { color: C.accent }, line: { color: C.accent, width: 0 } })
      mono(spans[1] || '', ax, by + 1.85, aw, 0.3, 9, C.accent, { align: 'center' })
    }
  })
}

function layoutTable(tbl, x, y, w, bottom, opts = {}) {
  const thead = [...tbl.querySelectorAll('thead th')]
  const rows = [...tbl.querySelectorAll('tbody tr')].map((tr) => [...tr.children])
  const ncols = thead.length
  const colW = opts.colW ?? (ncols === 3 ? [w * 0.235, w * 0.503, w * 0.262] : ncols === 2 ? [w * 0.5, w * 0.5] : Array(ncols).fill(w / ncols))
  const cellRuns = (td, pt) => {
    const cls = td.getAttribute('class') || ''
    const color = cls.includes('none') ? C.faint : cls.includes('new') ? C.accent : cls.includes('wp') ? C.wp : C.text
    const codeColor = cls.includes('new') ? C.accent : cls.includes('none') ? C.faint : C.text
    const runs = inlineRuns(td, { fontFace: SANS, fontSize: pt, color, italic: cls.includes('none') }, { codeColor })
    return runs.length ? runs : [run(' ', { fontFace: SANS, fontSize: pt, color })]
  }
  // Pick a size so the whole table fits between y and bottom.
  let pt = opts.maxPt ?? 12
  let rowH
  const measure = () => {
    rowH = rows.map((cells) => Math.max(...cells.map((td, ci) => linesFor(cellRuns(td, pt), colW[ci] - 0.2))) * lineH(pt, 1.2) + 0.14)
    return 0.36 + rowH.reduce((a, b) => a + b, 0)
  }
  while (pt > 8 && measure() > bottom - y) pt -= 0.5
  const total = measure()
  const data = [
    thead.map((th) => {
      const cls = th.getAttribute('class') || ''
      const color = cls.includes('wp') ? C.wp : cls.includes('new') ? C.accent : C.muted
      return { text: th.textContent.trim().toUpperCase(), options: { fontFace: MONO, fontSize: Math.min(10.5, pt), color, fill: { color: C.surface }, bold: false, charSpacing: 1.2 } }
    }),
    ...rows.map((cells) => cells.map((td) => ({ text: cellRuns(td, pt), options: { fill: { color: C.stage } } }))),
  ]
  slide.addTable(data, {
    x, y, w, colW, rowH: [0.36, ...rowH],
    fontFace: SANS, fontSize: pt, color: C.text, valign: 'middle', margin: [0.06, 0.1, 0.06, 0.1],
    border: { type: 'solid', pt: 0.5, color: C.line },
  })
  return total
}

function layoutSteps(el, x, y, w, bottom, opts = {}) {
  const steps = [...el.querySelectorAll(':scope > .step')]
  const cols = opts.cols ?? (w > 8 ? 2 : 1)
  const rowsN = Math.ceil(steps.length / cols)
  const gapX = 0.5, cw = (w - gapX * (cols - 1)) / cols
  const rowH = Math.min(1.75, (bottom - y) / rowsN)
  const numW = 0.7
  const hPt = rowsN >= 3 ? 17 : 19, pPt = rowsN >= 3 ? 13.5 : 15
  steps.forEach((s, i) => {
    const sx = x + (i % cols) * (cw + gapX)
    const sy = y + Math.floor(i / cols) * rowH
    const n = s.querySelector(':scope > .n')?.textContent.trim() ?? ''
    text([run(n, { fontFace: SANS, fontSize: n.length > 1 ? 22 : 30, color: C.accent, bold: true })], sx, sy - 0.05, numW, 0.7)
    const h3 = s.querySelector('h3'), p = s.querySelector('p')
    text(inlineRuns(h3, { fontFace: SANS, fontSize: hPt, color: C.text, bold: true }), sx + numW + 0.05, sy, cw - numW - 0.05, 0.4)
    if (p) text(inlineRuns(p, { fontFace: SANS, fontSize: pPt, color: C.muted }), sx + numW + 0.05, sy + 0.4, cw - numW - 0.05, rowH - 0.45, { lineSpacingMultiple: 1.1 })
  })
  return rowsN * rowH
}

function layoutKv(dl, x, y, w, bottom, opts = {}) {
  const dts = [...dl.querySelectorAll(':scope > dt')], dds = [...dl.querySelectorAll(':scope > dd')]
  const dtW = opts.dtW ?? 1.35
  const pt = opts.pt ?? 15
  let cy = y
  dts.forEach((dt, i) => {
    const dd = dds[i]
    const tag = dt.querySelector('.tag')
    if (tag) {
      const color = tag.classList.contains('kit') ? C.kit : tag.classList.contains('y') ? C.accent : tag.classList.contains('sp') ? C.sp : C.muted
      tagPill(tag.textContent.trim(), x, cy + 0.02, color)
    } else {
      mono(dt.textContent.trim(), x, cy + 0.04, dtW, 0.3, 11, C.muted)
    }
    const runs = inlineRuns(dd, { fontFace: SANS, fontSize: pt, color: C.text })
    const big = dd.querySelector('.big-cmd')
    const lines = linesFor(runs, w - dtW - 0.1)
    const h = big ? 0.45 : lines * lineH(pt, 1.3) + 0.06
    text(runs, x + dtW, cy, w - dtW, h, { lineSpacingMultiple: 1.05 })
    cy += h + (opts.gap ?? 0.12)
  })
  return cy - y
}

function layoutBox(box, x, y, w) {
  const h3 = box.querySelector('h3'), p = box.querySelector('p')
  const tag = h3?.querySelector('.tag')
  const pt = 13
  const pRuns = p ? inlineRuns(p, { fontFace: SANS, fontSize: pt, color: C.muted }) : []
  const pLines = linesFor(pRuns, w - 0.4)
  const h = 0.52 + pLines * lineH(pt, 1.3) + 0.2
  rect(x, y, w, h, C.surface, C.line)
  let tx = x + 0.2
  if (tag) {
    const color = tag.classList.contains('kit') ? C.kit : tag.classList.contains('y') ? C.accent : tag.classList.contains('sp') ? C.sp : C.muted
    tx += tagPill(tag.textContent.trim(), x + 0.2, y + 0.16, color) + 0.12
  }
  const titleText = [...(h3?.childNodes ?? [])].filter((n) => n.nodeType === NodeType.TEXT).map((n) => n.textContent).join('').replace(/ /g, ' ').trim()
  text([run(titleText, { fontFace: SANS, fontSize: 17, color: C.text, bold: true })], tx, y + 0.12, w - (tx - x) - 0.2, 0.4)
  if (p) text(pRuns, x + 0.2, y + 0.55, w - 0.4, h - 0.65, { lineSpacingMultiple: 1.1 })
  return h
}

function layoutTimeline(el, x, y, w, bottom) {
  const cards = [...el.querySelectorAll(':scope > .tl')]
  const cols = 4, rowsN = Math.ceil(cards.length / cols)
  const gap = 0.16, cw = (w - gap * (cols - 1)) / cols
  const ch = Math.min(1.75, (bottom - y - gap * (rowsN - 1)) / rowsN)
  cards.forEach((c, i) => {
    const cx = x + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (ch + gap)
    const border = (c.getAttribute('style') || '').includes('border-color:var(--sp)') ? C.sp : C.line
    const whenColor = (c.querySelector('.when')?.getAttribute('style') || '').includes('--sp') ? C.sp : C.accent
    rect(cx, cy, cw, ch, C.surface, border)
    mono(c.querySelector('.when')?.textContent.trim() ?? '', cx + 0.18, cy + 0.14, cw - 0.36, 0.25, 9.5, whenColor, { charSpacing: 1 })
    text(inlineRuns(c.querySelector('h3'), { fontFace: SANS, fontSize: 15, color: C.text, bold: true }), cx + 0.18, cy + 0.42, cw - 0.36, 0.35)
    text(inlineRuns(c.querySelector('p'), { fontFace: SANS, fontSize: 12, color: C.muted }), cx + 0.18, cy + 0.8, cw - 0.36, ch - 0.9, { lineSpacingMultiple: 1.1 })
  })
  return rowsN * ch + gap * (rowsN - 1)
}

/** Vertical flow of a .col's children. `pre` takes whatever height is left. */
function layoutColumn(col, x, y, w, bottom) {
  const kids = [...col.children]
  let cy = y
  const gap = 0.18
  // Reserve height for everything that is not <pre>, so pre gets the remainder.
  const pre = kids.find((k) => k.tagName === 'PRE')
  const after = pre ? kids.slice(kids.indexOf(pre) + 1) : []
  let reservedAfter = 0
  for (const k of after) reservedAfter += estimateHeight(k, w) + gap
  for (const k of kids) {
    const tag = k.tagName.toLowerCase()
    if (tag === 'pre') {
      const avail = bottom - cy - reservedAfter
      const pt = preSize(k, w, avail, 12.5)
      const need = Math.min(avail, preLineCount(k) * lineH(pt, 1.38) + 0.4)
      codeBox(k, x, cy, w, need, pt); cy += need + gap
    } else if (tag === 'table') {
      cy += layoutTable(k, x, cy, w, bottom - reservedAfter, { maxPt: 11.5 }) + gap
    } else if (tag === 'dl') {
      const compact = (k.getAttribute('style') || '').includes('font-size:19px')
      cy += layoutKv(k, x, cy, w, bottom, compact ? { pt: 13.5, dtW: 1.2, gap: 0.14 } : { pt: 15, dtW: 1.3 }) + gap
    } else if (k.classList.contains('callout')) {
      cy += calloutBox(k, x, cy, w, 14) + gap
    } else if (k.classList.contains('box')) {
      cy += layoutBox(k, x, cy, w) + gap
    } else if (k.classList.contains('step')) {
      const n = k.querySelector('.n')?.textContent.trim() ?? ''
      const h3 = k.querySelector('h3'), p = k.querySelector('p')
      text([run(n, { fontFace: SANS, fontSize: 22, color: C.accent, bold: true })], x, cy - 0.04, 0.5, 0.5)
      text(inlineRuns(h3, { fontFace: SANS, fontSize: 16, color: C.text, bold: true }), x + 0.5, cy, w - 0.5, 0.35)
      const pr = inlineRuns(p, { fontFace: SANS, fontSize: 13, color: C.muted })
      const ph = linesFor(pr, w - 0.5) * lineH(13, 1.25) + 0.05
      text(pr, x + 0.5, cy + 0.33, w - 0.5, ph, { lineSpacingMultiple: 1.05 })
      cy += 0.33 + ph + 0.12
    } else if (tag === 'span' || tag === 'p') {
      const isFile = k.classList.contains('file') || (k.getAttribute('style') || '').includes('--mono')
      const runs = isFile
        ? [run(k.textContent.trim(), { fontFace: MONO, fontSize: 11, color: C.muted })]
        : inlineRuns(k, { fontFace: SANS, fontSize: 14, color: styleColor(k) || C.text })
      const h = linesFor(runs, w) * lineH(isFile ? 11 : 14, 1.3) + 0.05
      text(runs, x, cy, w, h); cy += h + (isFile ? 0.08 : gap)
    }
  }
  return cy - y
}
function estimateHeight(k, w) {
  const tag = k.tagName.toLowerCase()
  if (k.classList.contains('callout')) return linesFor(inlineRuns(k, { fontFace: SANS, fontSize: 14, color: C.text }), w - 0.6) * lineH(14, 1.35) + 0.32
  if (k.classList.contains('box')) return 0.55 + linesFor(inlineRuns(k.querySelector('p') || k, { fontFace: SANS, fontSize: 13.5, color: C.muted }), w - 0.4) * lineH(13.5, 1.3) + 0.25
  if (tag === 'p' || tag === 'span') return linesFor(inlineRuns(k, { fontFace: SANS, fontSize: 14, color: C.text }), w) * lineH(14, 1.3) + 0.05
  if (k.classList.contains('step')) return 0.9
  return 0.6
}

function layoutTwo(el, x, y, w, bottom) {
  const cols = [...el.querySelectorAll(':scope > .col')]
  const gap = 0.5
  const lw = (w - gap) * (1.1 / 2.1), rw = (w - gap) * (1 / 2.1)
  layoutColumn(cols[0], x, y, lw, bottom)
  if (cols[1]) layoutColumn(cols[1], x + lw + gap, y, rw, bottom)
}

// ── slide dispatcher ──────────────────────────────────────────────────────
function buildSlide(sec, n, total) {
  slide = pres.addSlide()
  const notes = sec.querySelector('.notes-src')
  if (notes) slide.addNotes([...notes.querySelectorAll('p')].map((p) => p.textContent.replace(/\s+/g, ' ').trim()).join('\n\n'))

  if (sec.classList.contains('title-slide')) { layoutTitleSlide(sec); mono(`${n} / ${total}`, 8.63, 7.0, 4.0, 0.3, 10, C.faint, { align: 'right' }); rect(0, 7.46, (n / total) * W, 0.04, C.accent); return }
  chrome(sec, n, total)
  let y = title(sec)
  const kids = [...sec.children].filter((k) => !['eyebrow', 'notes-src'].some((c) => k.classList.contains(c)) && k.tagName !== 'H2')
  // Trailing callout / p gets reserved space at the bottom.
  const trailing = kids.filter((k) => k.classList.contains('callout') || k.tagName === 'P')
  const mainKids = kids.filter((k) => !trailing.includes(k))
  let bottom = CONTENT_BOTTOM
  const trailingH = trailing.map((k) => (k.classList.contains('callout') ? linesFor(inlineRuns(k, { fontFace: SANS, fontSize: 15, color: C.text }), CW - 0.6) * lineH(15, 1.35) + 0.32 : linesFor(inlineRuns(k, { fontFace: SANS, fontSize: 14, color: C.muted }), CW) * lineH(14, 1.3) + 0.05))
  bottom -= trailingH.reduce((a, b) => a + b + 0.2, 0)
  let used = 0
  for (const k of mainKids) {
    const cls = k.classList
    if (cls.contains('compare')) { layoutCompare(k, ML, y, CW, bottom); used = bottom - y }
    else if (cls.contains('models')) { layoutModels(k, ML, y, CW, bottom); used = bottom - y }
    else if (cls.contains('arch')) { layoutArch(k, ML, y, CW, bottom); used = bottom - y }
    else if (k.tagName === 'TABLE') { used = layoutTable(k, ML, y, CW, bottom, { maxPt: sec.classList.contains('glossary') ? 10 : 12 }) }
    else if (cls.contains('steps')) { used = layoutSteps(k, ML, y, CW, bottom) }
    else if (cls.contains('two')) { layoutTwo(k, ML, y, CW, bottom); used = bottom - y }
    else if (cls.contains('timeline')) { used = layoutTimeline(k, ML, y, CW, bottom) }
  }
  let ty = Math.min(CONTENT_BOTTOM - trailingH.reduce((a, b) => a + b + 0.2, 0) + 0.2, y + used + 0.25)
  // Trailing items sit just under the content, never below the footer.
  trailing.forEach((k, i) => {
    if (k.classList.contains('callout')) calloutBox(k, ML, ty, CW, 15)
    else text(inlineRuns(k, { fontFace: SANS, fontSize: 14, color: styleColor(k) || C.muted }), ML, ty, CW, trailingH[i])
    ty += trailingH[i] + 0.2
  })
}

// ── main ──────────────────────────────────────────────────────────────────
pres = new pptxgen()
pres.layout = 'LAYOUT_WIDE'
pres.author = 'Webee L&D'
pres.title = doc.querySelector('title')?.textContent ?? 'From WordPress to Astro + Payload'
shapes = pres.ShapeType
const sections = [...doc.querySelectorAll('section.slide')]
sections.forEach((sec, i) => buildSlide(sec, i + 1, sections.length))
// pptxgenjs emits an <a:pPr> for every run, so a paragraph with several runs (text + <code>)
// carries extra <a:pPr><a:buNone/></a:pPr> blocks after its first run. PowerPoint tolerates
// them; LibreOffice and Google Slides drop the bullet. Keep only the first pPr of each paragraph.
const JSZip = createRequire(require.resolve('pptxgenjs'))('jszip')
const zip = await JSZip.loadAsync(await pres.write({ outputType: 'nodebuffer' }))
for (const name of Object.keys(zip.files).filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))) {
  const xml = await zip.file(name).async('string')
  const fixed = xml.replace(/<a:p>([\s\S]*?)<\/a:p>/g, (m, inner) => {
    let seen = false
    const cleaned = inner.replace(/<a:pPr\b[^>]*\/>|<a:pPr\b[^>]*>[\s\S]*?<\/a:pPr>/g, (ppr) => (seen ? '' : ((seen = true), ppr)))
    return `<a:p>${cleaned}</a:p>`
  })
  zip.file(name, fixed)
}
writeFileSync(OUT, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }))
console.log(`wrote ${OUT} (${sections.length} slides)`)
