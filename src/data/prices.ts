/** All figures in this module are illustrative sample data, not live prices. */
export const SAMPLE_DATA_LABEL = 'Illustrative sample data — not live prices'
export const SAMPLE_DATE = '2026-09-17'

export const crops = [
  { id: 'tomato', name: 'Tomato', category: 'Vegetable' },
  { id: 'potato', name: 'Potato', category: 'Vegetable' },
  { id: 'carrot', name: 'Carrot', category: 'Vegetable' },
  { id: 'onion', name: 'Red onion', category: 'Vegetable' },
  { id: 'banana', name: 'Banana', category: 'Fruit' },
  { id: 'papaya', name: 'Papaya', category: 'Fruit' },
] as const

export const markets = ['Pettah', 'Dambulla', 'Kandy'] as const
export type CropId = (typeof crops)[number]['id']
export type CropCategory = (typeof crops)[number]['category']
export type Market = (typeof markets)[number]

export interface PriceRecord {
  cropId: CropId
  name: string
  category: CropCategory
  market: Market
  /** Illustrative Sri Lankan rupees per kilogram. */
  priceLkrPerKg: number
  /** ISO 8601 calendar date (YYYY-MM-DD). */
  sampleDate: string
}

const samplePrices: Record<CropId, readonly [number, number, number]> = {
  tomato: [240, 190, 220],
  potato: [310, 270, 290],
  carrot: [360, 320, 340],
  onion: [420, 380, 400],
  banana: [180, 150, 170],
  papaya: [140, 120, 130],
}

export const samplePriceRecords: PriceRecord[] = crops.flatMap((crop) =>
  markets.map((market, index) => ({
    cropId: crop.id,
    name: crop.name,
    category: crop.category,
    market,
    priceLkrPerKg: samplePrices[crop.id][index],
    sampleDate: SAMPLE_DATE,
  })),
)

export interface PriceFilters {
  cropId?: CropId
  category?: CropCategory
  market?: Market
  sampleDate?: string
}

export function filterPriceRecords(records: readonly PriceRecord[], filters: PriceFilters): PriceRecord[] {
  return records.filter((record) =>
    (filters.cropId === undefined || record.cropId === filters.cropId) &&
    (filters.category === undefined || record.category === filters.category) &&
    (filters.market === undefined || record.market === filters.market) &&
    (filters.sampleDate === undefined || record.sampleDate === filters.sampleDate),
  )
}

/** Compare one crop across markets on one sample date, lowest price first. */
export function compareCropPrices(records: readonly PriceRecord[], cropId: CropId, sampleDate: string): PriceRecord[] {
  return filterPriceRecords(records, { cropId, sampleDate }).sort(
    (a, b) => a.priceLkrPerKg - b.priceLkrPerKg || a.market.localeCompare(b.market),
  )
}
