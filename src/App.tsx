import { useState } from 'react'
import {
  compareCropPrices, crops, filterPriceRecords, markets, SAMPLE_DATA_LABEL,
  SAMPLE_DATE, samplePriceRecords, type CropCategory, type CropId, type Market,
} from './data/prices'
import './App.css'

type Page = 'prices' | 'compare' | 'report'
const money = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })
const dateLabel = new Intl.DateTimeFormat('en-LK', { dateStyle: 'medium', timeZone: 'UTC' })
  .format(new Date(`${SAMPLE_DATE}T00:00:00Z`))

function App() {
  const [page, setPage] = useState<Page>('prices')
  const [search, setSearch] = useState('')
  const [market, setMarket] = useState<Market | 'all'>('all')
  const [category, setCategory] = useState<CropCategory | 'all'>('all')
  const [compareCrop, setCompareCrop] = useState<CropId>('tomato')
  const [reportSubmitted, setReportSubmitted] = useState(false)

  const records = filterPriceRecords(samplePriceRecords, {
    search,
    market: market === 'all' ? undefined : market,
    category: category === 'all' ? undefined : category,
  })
  const comparison = compareCropPrices(samplePriceRecords, compareCrop, SAMPLE_DATE)
  const hasFilters = search !== '' || market !== 'all' || category !== 'all'

  function clearFilters() {
    setSearch('')
    setMarket('all')
    setCategory('all')
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand" aria-label="AgriPriceSL home">
            <span className="brand-mark" aria-hidden="true">✳</span>
            <span>AgriPrice<span className="brand-accent">SL</span></span>
          </div>
          <nav className="site-nav" aria-label="Main navigation">
            {(['prices', 'compare', 'report'] as const).map((item) => (
              <button
                key={item}
                type="button"
                className={page === item ? 'nav-item active' : 'nav-item'}
                aria-current={page === item ? 'page' : undefined}
                onClick={() => setPage(item)}
              >
                {item === 'report' ? 'Report Price' : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {page === 'prices' && (
          <>
            <div className="page-heading">
              <p className="eyebrow">MARKET OVERVIEW</p>
              <h1>Produce prices, at a glance.</h1>
              <p>Explore example prices for everyday crops across Sri Lankan markets.</p>
            </div>
            <div className="sample-banner" role="note">
              <span className="sample-icon" aria-hidden="true">i</span>
              <span><strong>Sample data</strong> · Illustrative figures only, not live prices. All prices shown in LKR per kg.</span>
            </div>

            <section className="filter-panel" aria-labelledby="filter-heading">
              <div className="panel-title"><h2 id="filter-heading">Find a price</h2><span>Search and filter the sample records</span></div>
              <div className="filter-grid">
                <label className="search-field">Search crop
                  <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. Tomato" />
                </label>
                <label>Market
                  <select value={market} onChange={(event) => setMarket(event.target.value as Market | 'all')}>
                    <option value="all">All markets</option>
                    {markets.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label>Category
                  <select value={category} onChange={(event) => setCategory(event.target.value as CropCategory | 'all')}>
                    <option value="all">All categories</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                  </select>
                </label>
              </div>
              <button className="clear-button" type="button" onClick={clearFilters} disabled={!hasFilters}>Clear filters</button>
            </section>

            <section className="results" aria-labelledby="results-heading">
              <div className="results-heading">
                <div><p className="eyebrow">PRICE DIRECTORY</p><h2 id="results-heading">Browse prices</h2></div>
                <span className="result-count" role="status">{records.length} {records.length === 1 ? 'result' : 'results'}</span>
              </div>
              {records.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon" aria-hidden="true">⌕</div>
                  <h3>No prices found</h3>
                  <p>Try a different crop, market, or category.</p>
                  <button type="button" onClick={clearFilters}>Clear filters</button>
                </div>
              ) : (
                <div className="price-grid">
                  {records.map((record) => (
                    <article className="price-card" key={`${record.cropId}-${record.market}-${record.sampleDate}`}>
                      <div className="card-top"><span className="category-chip">{record.category}</span><span className="sample-chip">Sample data</span></div>
                      <h3>{record.name}</h3>
                      <div className="price-line"><strong>Rs {money.format(record.priceLkrPerKg)}</strong><span>/ kg</span></div>
                      <div className="card-meta"><span><span aria-hidden="true">⌖</span> {record.market}</span><span>{dateLabel}</span></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {page === 'compare' && (
          <section className="secondary-page" aria-labelledby="compare-heading">
            <p className="eyebrow">MARKET COMPARISON</p>
            <h1 id="compare-heading">Compare prices</h1>
            <p>See how one crop's illustrative sample price differs across markets.</p>
            <div className="sample-banner" role="note"><span className="sample-icon" aria-hidden="true">i</span><span>{SAMPLE_DATA_LABEL}. LKR per kg · {dateLabel}.</span></div>
            <label className="compare-select">Crop
              <select value={compareCrop} onChange={(event) => setCompareCrop(event.target.value as CropId)}>
                {crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}
              </select>
            </label>
            <div className="price-grid comparison-grid">
              {comparison.map((record) => <article className="price-card" key={record.market}>
                <div className="card-top"><span className="category-chip">{record.market}</span><span className="sample-chip">Sample data</span></div>
                <h3>{record.name}</h3><div className="price-line"><strong>Rs {money.format(record.priceLkrPerKg)}</strong><span>/ kg</span></div>
                <div className="card-meta"><span>{record.market}</span><span>{dateLabel}</span></div>
              </article>)}
            </div>
          </section>
        )}

        {page === 'report' && (
          <section className="secondary-page" aria-labelledby="report-heading">
            <p className="eyebrow">COMMUNITY INPUT</p>
            <h1 id="report-heading">Report a price</h1>
            <p>This demo stores no reports. Use the form to preview the reporting flow.</p>
            {reportSubmitted ? <div className="sample-banner" role="status">Demo report noted on this screen only. No price was submitted or saved.</div> : null}
            <form className="report-form" onSubmit={(event) => { event.preventDefault(); setReportSubmitted(true) }}>
              <label>Crop<select required defaultValue=""><option value="" disabled>Select a crop</option>{crops.map((crop) => <option key={crop.id} value={crop.id}>{crop.name}</option>)}</select></label>
              <label>Market<select required defaultValue=""><option value="" disabled>Select a market</option>{markets.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Price (LKR per kg)<input required type="number" min="1" step="0.01" placeholder="e.g. 250" /></label>
              <button type="submit">Preview report</button>
            </form>
          </section>
        )}
      </main>
      <footer>AgriPriceSL · All displayed prices are illustrative sample data.</footer>
    </div>
  )
}

export default App
