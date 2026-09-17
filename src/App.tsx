import { useState } from 'react'
import {
  compareCropPrices, crops, filterPriceRecords, markets, SAMPLE_DATA_LABEL,
  SAMPLE_DATE, samplePriceRecords, type CropId, type Market,
} from './data/prices'
import './App.css'

const currency = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })

function App() {
  const [cropId, setCropId] = useState<CropId>('tomato')
  const [market, setMarket] = useState<Market | 'all'>('all')
  const records = filterPriceRecords(samplePriceRecords, {
    cropId,
    market: market === 'all' ? undefined : market,
  })
  const comparison = compareCropPrices(samplePriceRecords, cropId, SAMPLE_DATE)
  const crop = crops.find((item) => item.id === cropId)!

  return (
    <main>
      <header>
        <p className="eyebrow">AgriPriceSL</p>
        <h1>Produce price examples</h1>
        <p>Explore six common produce items across three Sri Lankan markets.</p>
        <p className="notice">{SAMPLE_DATA_LABEL}. Figures are in LKR per kg, dated {SAMPLE_DATE}.</p>
      </header>

      <section aria-labelledby="browse-heading">
        <h2 id="browse-heading">Browse sample records</h2>
        <div className="filters">
          <label>
            Crop
            <select value={cropId} onChange={(event) => setCropId(event.target.value as CropId)}>
              {crops.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label>
            Market
            <select value={market} onChange={(event) => setMarket(event.target.value as Market | 'all')}>
              <option value="all">All markets</option>
              {markets.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
        </div>
        <div className="table-wrap">
          <table>
            <caption>{SAMPLE_DATA_LABEL}</caption>
            <thead><tr><th>Crop</th><th>Category</th><th>Market</th><th>Sample date</th><th>Sample price (LKR/kg)</th></tr></thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.cropId}-${record.market}-${record.sampleDate}`}>
                  <td>{record.name}</td><td>{record.category}</td><td>{record.market}</td>
                  <td>{record.sampleDate}</td><td>Rs {currency.format(record.priceLkrPerKg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="compare-heading">
        <h2 id="compare-heading">Compare {crop.name} across markets</h2>
        <p className="section-note">{SAMPLE_DATA_LABEL} · {SAMPLE_DATE} · LKR per kg</p>
        <div className="comparison">
          {comparison.map((record) => (
            <div className="price-card" key={record.market}>
              <span>{record.market}</span>
              <strong>Rs {currency.format(record.priceLkrPerKg)}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
