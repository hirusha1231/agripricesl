import { useRef, useState, type FormEvent } from 'react'
import { crops, markets, type CropId, type Market } from './data/prices'

const STORAGE_KEY = 'agripricesl-price-reports-v1'
const money = new Intl.NumberFormat('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

type Field = 'cropId' | 'market' | 'price' | 'date' | 'note'
type FormValues = Record<Field, string>
type Errors = Partial<Record<Field, string>>

interface SavedReport {
  id: string
  cropId: CropId
  market: Market
  priceLkrPerKg: number
  date: string
  note: string
}

function localToday(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function validCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(0)
  parsed.setUTCFullYear(year, month - 1, day)
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() + 1 === month && parsed.getUTCDate() === day
}

function isSavedReport(value: unknown): value is SavedReport {
  if (typeof value !== 'object' || value === null) return false
  const report = value as Partial<SavedReport>
  return typeof report.id === 'string' &&
    crops.some((crop) => crop.id === report.cropId) &&
    markets.some((market) => market === report.market) &&
    typeof report.priceLkrPerKg === 'number' && Number.isFinite(report.priceLkrPerKg) && report.priceLkrPerKg > 0 &&
    typeof report.date === 'string' && validCalendarDate(report.date) &&
    typeof report.note === 'string'
}

function readReports(): { reports: SavedReport[]; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { reports: [], error: '' }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return { reports: [], error: 'Saved reports could not be read in this browser.' }
    return { reports: parsed.filter(isSavedReport), error: '' }
  } catch {
    return { reports: [], error: 'Saved reports could not be read in this browser.' }
  }
}

function validate(values: FormValues): Errors {
  const errors: Errors = {}
  if (!values.cropId) errors.cropId = 'Select a crop.'
  else if (!crops.some((crop) => crop.id === values.cropId)) errors.cropId = 'Select a valid crop.'
  if (!values.market) errors.market = 'Select a market.'
  else if (!markets.some((market) => market === values.market)) errors.market = 'Select a valid market.'
  if (!values.price.trim()) errors.price = 'Enter a price per kg.'
  else if (!Number.isFinite(Number(values.price)) || Number(values.price) <= 0) errors.price = 'Enter a price greater than zero.'
  if (!values.date) errors.date = 'Select a date.'
  else if (!validCalendarDate(values.date)) errors.date = 'Enter a valid calendar date.'
  else if (values.date > localToday()) errors.date = 'Date cannot be in the future.'
  return errors
}

function ReportPrice() {
  const cropRef = useRef<HTMLSelectElement>(null)
  const marketRef = useRef<HTMLSelectElement>(null)
  const priceRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const [initial] = useState(readReports)
  const [reports, setReports] = useState(initial.reports)
  const [values, setValues] = useState<FormValues>({ cropId: '', market: '', price: '', date: localToday(), note: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [storageError, setStorageError] = useState(initial.error)
  const [status, setStatus] = useState('')

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    setStatus('')
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setStatus('')
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.cropId) cropRef.current?.focus()
      else if (nextErrors.market) marketRef.current?.focus()
      else if (nextErrors.price) priceRef.current?.focus()
      else if (nextErrors.date) dateRef.current?.focus()
      return
    }

    const report: SavedReport = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      cropId: values.cropId as CropId,
      market: values.market as Market,
      priceLkrPerKg: Number(values.price),
      date: values.date,
      note: values.note.trim(),
    }
    const next = [report, ...reports]
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setReports(next)
      setValues({ cropId: '', market: '', price: '', date: localToday(), note: '' })
      setStorageError('')
      setStatus('Report saved in this browser.')
    } catch {
      setStorageError('Could not save this report. Check that browser storage is available.')
    }
  }

  function remove(id: string) {
    const next = reports.filter((report) => report.id !== id)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      setReports(next)
      setStorageError('')
      setStatus('Report deleted from this browser.')
    } catch {
      setStorageError('Could not delete this report. Check that browser storage is available.')
    }
  }

  return <section className="secondary-page" aria-labelledby="report-heading">
    <p className="eyebrow">COMMUNITY INPUT</p>
    <h1 id="report-heading">Report a price</h1>
    <p>Record a price you observed at a market.</p>
    <div className="sample-banner" role="note"><span className="sample-icon" aria-hidden="true">i</span><span><strong>Saved only in this browser.</strong> Reports are not shared, verified, or included in the sample Prices and Compare pages.</span></div>
    {storageError && <p className="report-storage-error" role="alert">{storageError}</p>}
    {status && <p className="report-status" role="status">{status}</p>}
    <form className="report-form" onSubmit={save} noValidate>
      <label>Crop
        <select ref={cropRef} value={values.cropId} onChange={(event) => update('cropId', event.target.value)} aria-invalid={!!errors.cropId} aria-describedby={errors.cropId ? 'crop-error' : undefined}>
          <option value="">Select a crop</option>{crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
        </select>
        {errors.cropId && <span className="form-error" id="crop-error">{errors.cropId}</span>}
      </label>
      <label>Market
        <select ref={marketRef} value={values.market} onChange={(event) => update('market', event.target.value)} aria-invalid={!!errors.market} aria-describedby={errors.market ? 'market-error' : undefined}>
          <option value="">Select a market</option>{markets.map((market) => <option key={market} value={market}>{market}</option>)}
        </select>
        {errors.market && <span className="form-error" id="market-error">{errors.market}</span>}
      </label>
      <label>Price (LKR per kg)
        <input ref={priceRef} type="number" min="0" step="any" inputMode="decimal" value={values.price} onChange={(event) => update('price', event.target.value)} placeholder="e.g. 250" aria-invalid={!!errors.price} aria-describedby={errors.price ? 'price-error' : undefined} />
        {errors.price && <span className="form-error" id="price-error">{errors.price}</span>}
      </label>
      <label>Date observed
        <input ref={dateRef} type="date" max={localToday()} value={values.date} onChange={(event) => update('date', event.target.value)} aria-invalid={!!errors.date} aria-describedby={errors.date ? 'date-error' : undefined} />
        {errors.date && <span className="form-error" id="date-error">{errors.date}</span>}
      </label>
      <label>Note <span className="optional-label">(optional)</span>
        <textarea value={values.note} onChange={(event) => update('note', event.target.value)} rows={3} placeholder="Any details about the price or market" />
      </label>
      <button type="submit">Save report</button>
    </form>
    <section className="saved-reports" aria-labelledby="saved-heading">
      <div className="results-heading"><div><p className="eyebrow">YOUR OBSERVATIONS</p><h2 id="saved-heading">Saved reports</h2></div><span className="result-count">{reports.length} {reports.length === 1 ? 'report' : 'reports'}</span></div>
      {reports.length === 0 ? <div className="empty-state"><h3>No reports saved yet</h3><p>Saved reports will appear here and remain after a refresh in this browser.</p></div> :
        <div className="saved-list">{reports.map((report) => <article className="saved-report" key={report.id}>
          <div><h3>{crops.find((crop) => crop.id === report.cropId)?.name}</h3><p>{report.market} · {report.date}</p><strong>Rs {money.format(report.priceLkrPerKg)} / kg</strong>{report.note && <p className="saved-note">{report.note}</p>}</div>
          <button type="button" onClick={() => remove(report.id)} aria-label={`Delete ${report.cropId} report from ${report.market} on ${report.date}`}>Delete</button>
        </article>)}</div>}
    </section>
  </section>
}

export default ReportPrice
