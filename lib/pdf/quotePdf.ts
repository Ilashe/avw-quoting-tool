'use client'

import { jsPDF } from 'jspdf'
import type { QuoteDocument } from '@/lib/quote/buildQuoteDocument'
import { SALES_TAX_RATE } from '@/lib/quote/buildQuoteDocument'

/**
 * Renders the quote onto AVW's existing quote form — the same layout as the printed quotes the
 * client sent over (letter portrait, Times, logo + company block top-left, QUOTE + date/number
 * top-right, Bill to / Ship To boxes, Rep|Terms of Sale|FOB strip, then the
 * Item|Description|Qty|Unit Price|Total table, with the totals box on the final page).
 *
 * Every coordinate below is in points from the top-left of a 612 x 792 pt page, measured off
 * that sample form, so the output drops into the same filing as the quotes already in use.
 */

// ── page geometry ─────────────────────────────────────────────────────────────

const PAGE_W = 612
const MARGIN_L = 46.5
const MARGIN_R = 564 // right edge of every boxed element

const LOGO = { x: 46, y: 50, size: 56 }
const COMPANY_X = 113

const BOX_TOP = 152.6
const BOX_BOTTOM = 229.4
const BOX_HEADER_H = 13
const BILL_TO = { x: MARGIN_L, w: 227 }
const SHIP_TO = { x: 340.8, w: MARGIN_R - 340.8 }

const REP_TOP = 244
const REP_HEADER_BOTTOM = 259
const REP_BOTTOM = 273.6
// Rep | Terms of Sale | FOB — the client asked for all three to print empty.
const REP_COLS = [273.6, 335, 493, MARGIN_R]

const TABLE_TOP = 280
const TABLE_HEADER_BOTTOM = 294
const TABLE_BOTTOM = 643
// Item | Description | Qty | Unit Price | Total
const COLS = [MARGIN_L, 124.8, 388.8, 435.8, 493, MARGIN_R]
const CELL_PAD = 3
const ROW_LEAD = 9.6 // baseline-to-baseline within a wrapped cell
const ROW_GAP = 2.4 // breathing room under the last line of a row

const TOTALS_TOP = 645.6
const TOTALS_BOTTOM = 741.6
const TOTALS_SPLIT = 396 // legal text left of this, the three totals right of it

const FOOTER_Y = 745.4 + 12

const FONT = 'times'

// ── formatting ────────────────────────────────────────────────────────────────

function money(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function dollars(value: number): string {
  return `$${money(value)}`
}

function formatQuoteDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
}

const LEGAL_TEXT: Array<{ bold: string; body: string }> = [
  {
    bold: 'PRICE CHANGES:',
    body: ' Prices are valid for 30 days from Quote Date, then subject to change without notice.',
  },
  {
    bold: 'WARRANTY:',
    body:
      ' All products manufactured by AVW are warranted against any defects in workmanship. AVW further guarantees that any part/parts which within 90 days after installation to the purchaser is/are determined by us to be defective will be, as the exclusive remedy, repaired or replaced at the option of AVW provided that the equipment was properly maintained and subject to normal use.',
  },
  {
    bold: 'LIMITED LIABILITY:',
    body:
      ' AVW shall not be liable for any injury, loss, or damage, direct or consequential, arising out of the use or inability to use, any equipment sold by us. Before purchasing, the user must determine the suitability of the product for its intended use. The user assumes all risk in connection herewith.',
  },
]

// ── drawing ───────────────────────────────────────────────────────────────────

interface PreparedRow {
  item: string[]
  description: string[]
  qty: string
  unitPrice: string
  total: string
  height: number
  shaded: boolean
}

function drawLetterhead(pdf: jsPDF, logo: string | null, quoteNumber: string, quoteDate: Date) {
  if (logo) {
    try {
      pdf.addImage(logo, 'PNG', LOGO.x, LOGO.y, LOGO.size, LOGO.size)
    } catch {
      // A missing or unreadable logo must never cost the user their quote — the text
      // letterhead below identifies the company on its own.
    }
  }

  pdf.setTextColor(0)
  pdf.setFont(FONT, 'bold')
  pdf.setFontSize(15)
  pdf.text('A.V.W. Equipment Co., Inc.', COMPANY_X, 64)

  pdf.setFont(FONT, 'normal')
  pdf.setFontSize(9.5)
  const contact: Array<[string, string]> = [
    ['', '105 S. 9th Avenue'],
    ['', 'Maywood, IL 60153'],
    ['Phone:', '708-343-7738'],
    ['Fax:', '708-343-9065'],
    ['Web Site:', 'www.avwequipment.com'],
    ['E-mail:', 'marty@avwequipment.com'],
    ['Webstore:', 'www.avwequipmentstore.com'],
  ]
  // Seven lines have to land clear of the Bill to box at y=152.6 — hence the tight leading.
  let y = 74
  for (const [label, value] of contact) {
    if (label) pdf.text(label, COMPANY_X, y)
    pdf.text(value, label ? COMPANY_X + 57 : COMPANY_X, y)
    y += 12.1
  }

  pdf.setFont(FONT, 'bold')
  pdf.setFontSize(22)
  pdf.text('QUOTE', MARGIN_R, 68, { align: 'right' })

  pdf.setFontSize(9.5)
  pdf.text('Quote Date:', 453, 83, { align: 'right' })
  pdf.text('Quote Number:', 453, 101, { align: 'right' })
  pdf.setFont(FONT, 'normal')
  pdf.text(formatQuoteDate(quoteDate), MARGIN_R, 83, { align: 'right' })
  pdf.text(quoteNumber, MARGIN_R, 101, { align: 'right' })
}

function drawAddressBoxes(pdf: jsPDF, shipToLines: string[], customerName: string) {
  pdf.setDrawColor(0)
  pdf.setLineWidth(0.6)

  const boxes: Array<{ x: number; w: number; title: string; lines: string[] }> = [
    {
      ...BILL_TO,
      title: 'Bill to',
      // AVW's own quote form bills to AVW; the customer is the ship-to party.
      lines: ['AVW Equipment Co.', '105 S. 9th Ave.', 'Maywood, IL 60153'],
    },
    {
      ...SHIP_TO,
      title: 'Ship To',
      lines: [customerName, ...shipToLines].filter(Boolean),
    },
  ]

  for (const box of boxes) {
    pdf.rect(box.x, BOX_TOP, box.w, BOX_BOTTOM - BOX_TOP)
    pdf.line(box.x, BOX_TOP + BOX_HEADER_H, box.x + box.w, BOX_TOP + BOX_HEADER_H)

    pdf.setFont(FONT, 'bold')
    pdf.setFontSize(9.5)
    pdf.text(box.title, box.x + 5, BOX_TOP + 9.8)

    pdf.setFont(FONT, 'normal')
    let y = BOX_TOP + BOX_HEADER_H + 12
    for (const line of box.lines.slice(0, 5)) {
      pdf.text(pdf.splitTextToSize(line, box.w - 16)[0], box.x + 10, y)
      y += 12.4
    }
  }
}

function drawRepStrip(pdf: jsPDF) {
  pdf.setDrawColor(0)
  pdf.setLineWidth(0.6)
  pdf.rect(REP_COLS[0], REP_TOP, MARGIN_R - REP_COLS[0], REP_BOTTOM - REP_TOP)
  pdf.line(REP_COLS[0], REP_HEADER_BOTTOM, MARGIN_R, REP_HEADER_BOTTOM)
  for (const x of REP_COLS.slice(1, -1)) pdf.line(x, REP_TOP, x, REP_BOTTOM)

  pdf.setFont(FONT, 'bold')
  pdf.setFontSize(9.5)
  const titles = ['Rep', 'Terms of Sale', 'FOB']
  titles.forEach((title, i) => {
    const centre = (REP_COLS[i] + REP_COLS[i + 1]) / 2
    pdf.text(title, centre, REP_HEADER_BOTTOM - 4.5, { align: 'center' })
  })
  // Value row intentionally left blank — filled in by hand after printing.
}

function drawTableFrame(pdf: jsPDF) {
  pdf.setDrawColor(0)
  pdf.setLineWidth(0.6)
  pdf.rect(MARGIN_L, TABLE_TOP, MARGIN_R - MARGIN_L, TABLE_BOTTOM - TABLE_TOP)
  pdf.line(MARGIN_L, TABLE_HEADER_BOTTOM, MARGIN_R, TABLE_HEADER_BOTTOM)
  for (const x of COLS.slice(1, -1)) pdf.line(x, TABLE_TOP, x, TABLE_BOTTOM)

  pdf.setFont(FONT, 'bold')
  pdf.setFontSize(9.5)
  const headers = ['Item', 'Description', 'Qty', 'Unit Price', 'Total']
  headers.forEach((header, i) => {
    const centre = (COLS[i] + COLS[i + 1]) / 2
    pdf.text(header, centre, TABLE_HEADER_BOTTOM - 4, { align: 'center' })
  })
}

function prepareRows(pdf: jsPDF, doc: QuoteDocument): PreparedRow[] {
  pdf.setFont(FONT, 'normal')
  pdf.setFontSize(9)

  const itemW = COLS[1] - COLS[0] - CELL_PAD * 2
  const descW = COLS[2] - COLS[1] - CELL_PAD * 2
  const rows: PreparedRow[] = []

  const push = (
    item: string,
    description: string,
    qty = '',
    unitPrice = '',
    total = ''
  ) => {
    const itemLines = pdf.splitTextToSize(item, itemW) as string[]
    const descLines = pdf.splitTextToSize(description || '', descW) as string[]
    rows.push({
      item: itemLines,
      description: descLines,
      qty,
      unitPrice,
      total,
      height: Math.max(itemLines.length, descLines.length, 1) * ROW_LEAD + ROW_GAP,
      shaded: rows.length % 2 === 1,
    })
  }

  // General-tab answers (drive type, voltages, liftgate…) lead the table: only Customer and Ship
  // to Address have a home in the boxes above, and the rest still have to reach the customer.
  for (const header of doc.headerRows) {
    if (header.key === 'ship_to_address') continue
    push(header.label, header.value)
  }

  // Zero-priced configuration answers are carried in the Description column of their own row —
  // they describe the build and belong on the customer's copy even though they cost nothing.
  for (const row of doc.itemRows) {
    push(
      row.item,
      row.description,
      row.quantity !== null ? String(row.quantity) : '',
      row.unitPrice !== null ? money(row.unitPrice) : '',
      // The trailing T is the taxable marker used on AVW's existing quotes.
      row.price > 0 ? `${money(row.price)}T` : ''
    )
  }

  if (doc.comment.trim()) push('Comment', doc.comment.trim())

  push('', 'Subtotal', '', '', money(doc.subtotal))

  return rows
}

/**
 * Banding is painted before the table frame, not with the row — a filled rect drawn afterwards
 * covers the column rules it crosses and leaves them looking dashed.
 */
function drawRowShading(pdf: jsPDF, row: PreparedRow, y: number) {
  if (!row.shaded) return
  pdf.setFillColor(238, 242, 246)
  pdf.rect(MARGIN_L, y, MARGIN_R - MARGIN_L, row.height, 'F')
}

function drawRow(pdf: jsPDF, row: PreparedRow, y: number) {
  pdf.setFont(FONT, 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(0)

  const baseline = y + ROW_LEAD - 2
  row.item.forEach((line, i) => pdf.text(line, COLS[0] + CELL_PAD + 2, baseline + i * ROW_LEAD))
  row.description.forEach((line, i) => pdf.text(line, COLS[1] + CELL_PAD, baseline + i * ROW_LEAD))
  if (row.qty) pdf.text(row.qty, (COLS[2] + COLS[3]) / 2, baseline, { align: 'center' })
  if (row.unitPrice) pdf.text(row.unitPrice, COLS[4] - CELL_PAD, baseline, { align: 'right' })
  if (row.total) pdf.text(row.total, COLS[5] - CELL_PAD, baseline, { align: 'right' })
}

function drawTotalsBox(pdf: jsPDF, doc: QuoteDocument) {
  pdf.setDrawColor(0)
  pdf.setLineWidth(0.6)
  pdf.rect(MARGIN_L, TOTALS_TOP, MARGIN_R - MARGIN_L, TOTALS_BOTTOM - TOTALS_TOP)
  pdf.line(TOTALS_SPLIT, TOTALS_TOP, TOTALS_SPLIT, TOTALS_BOTTOM)

  const rowH = (TOTALS_BOTTOM - TOTALS_TOP) / 3
  pdf.line(TOTALS_SPLIT, TOTALS_TOP + rowH, MARGIN_R, TOTALS_TOP + rowH)
  pdf.line(TOTALS_SPLIT, TOTALS_TOP + rowH * 2, MARGIN_R, TOTALS_TOP + rowH * 2)

  const totals: Array<[string, string, number]> = [
    ['Subtotal', dollars(doc.subtotal), 11],
    [`Est. Sales Tax (${(SALES_TAX_RATE * 100).toFixed(1)}%)`, dollars(doc.salesTax), 11],
    ['Total', dollars(doc.total), 15],
  ]
  totals.forEach(([label, value, size], i) => {
    const centreY = TOTALS_TOP + rowH * i + rowH / 2 + size / 3
    pdf.setFont(FONT, 'bold')
    pdf.setFontSize(size)
    pdf.text(label, TOTALS_SPLIT + 8, centreY)
    pdf.setFont(FONT, 'normal')
    pdf.setFontSize(10)
    pdf.text(value, MARGIN_R - 8, centreY, { align: 'right' })
  })

  // Terms block, left of the split
  pdf.setFontSize(6.6)
  let y = TOTALS_TOP + 8
  const width = TOTALS_SPLIT - MARGIN_L - 12
  for (const { bold, body } of LEGAL_TEXT) {
    pdf.setFont(FONT, 'bold')
    const boldW = pdf.getTextWidth(bold)
    pdf.text(bold, MARGIN_L + 6, y)
    pdf.setFont(FONT, 'normal')
    // First line continues beside the bold lead-in; the rest wrap to the full width. The gap is
    // an x offset rather than a leading space, which jsPDF trims away.
    const bodyX = MARGIN_L + 6 + boldW + 2.4
    const firstLineW = width - boldW - 2.4
    const words = body.trim().split(/\s+/)
    let firstLine = ''
    while (words.length && pdf.getTextWidth(`${firstLine} ${words[0]}`.trim()) <= firstLineW) {
      firstLine = `${firstLine} ${words.shift()}`.trim()
    }
    pdf.text(firstLine, bodyX, y)
    y += 7.6
    for (const line of pdf.splitTextToSize(words.join(' '), width) as string[]) {
      pdf.text(line, MARGIN_L + 6, y)
      y += 7.6
    }
  }
}

function drawPageNumber(pdf: jsPDF, page: number) {
  pdf.setFont(FONT, 'normal')
  pdf.setFontSize(9.5)
  pdf.setTextColor(60)
  pdf.text(`Page ${page}`, PAGE_W / 2, FOOTER_Y, { align: 'center' })
  pdf.setTextColor(0)
}

async function loadLogo(): Promise<string | null> {
  try {
    const response = await fetch('/avw-logo.png')
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export interface QuotePdfOptions {
  quoteNumber: string
  quoteDate?: Date
  /** Filename without extension; defaults to the customer name + quote number. */
  fileName?: string
}

/** Builds the quote PDF and hands it to the browser as a download. */
export async function generateQuotePdf(doc: QuoteDocument, options: QuotePdfOptions): Promise<void> {
  const quoteDate = options.quoteDate ?? new Date()
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' })
  const logo = await loadLogo()

  // Lay the rows out first, then draw — each page paints its banding, then the frame over it,
  // then the text, so the column rules stay unbroken behind a shaded row.
  const pages: Array<Array<{ row: PreparedRow; y: number }>> = [[]]
  let y = TABLE_HEADER_BOTTOM
  for (const row of prepareRows(pdf, doc)) {
    // A row taller than the whole table area would loop forever if we kept paginating it, so
    // only break when there is already something on this page to push down.
    if (y + row.height > TABLE_BOTTOM && y > TABLE_HEADER_BOTTOM) {
      pages.push([])
      y = TABLE_HEADER_BOTTOM
    }
    pages[pages.length - 1].push({ row, y })
    y += row.height
  }

  pages.forEach((pageRows, index) => {
    if (index > 0) pdf.addPage()
    for (const { row, y: rowY } of pageRows) drawRowShading(pdf, row, rowY)
    drawLetterhead(pdf, logo, options.quoteNumber, quoteDate)
    drawAddressBoxes(pdf, doc.shipToLines, doc.customerName)
    drawRepStrip(pdf)
    drawTableFrame(pdf)
    for (const { row, y: rowY } of pageRows) drawRow(pdf, row, rowY)
    if (index === pages.length - 1) drawTotalsBox(pdf, doc)
    drawPageNumber(pdf, index + 1)
  })

  const safeName = (options.fileName ?? `${doc.customerName || 'AVW'} Quote ${options.quoteNumber}`)
    .replace(/[\\/:*?"<>|]/g, '-')
    .trim()
  pdf.save(`${safeName}.pdf`)
}
