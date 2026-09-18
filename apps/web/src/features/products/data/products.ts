import type { Product } from "../types/product";

/**
 * Mocked catalogue — there is no API yet. The first five rows are the ones the
 * Figma frames show; the last two exist so page two exercises both badge
 * states. Seven is deliberate: the design's copy says "7 produktów".
 */
export const PRODUCTS: Product[] = [
  {
    id: "mbp14m3pro",
    name: 'MacBook Pro 14"',
    sku: "MBP14M3PRO",
    category: "Komputery",
    price: 9999,
    status: "available",
    stock: null,
  },
  {
    id: "sgs24u256",
    name: "Galaxy S24 Ultra",
    sku: "SGS24U256",
    category: "Telefony",
    price: 6299,
    status: "available",
    stock: 45,
  },
  {
    id: "snwh1000xm5",
    name: "Sony WH-1000XM5",
    sku: "SNWH1000XM5",
    category: "RTV",
    price: 1599,
    status: "available",
    stock: null,
  },
  {
    id: "bswau28p40",
    name: "Bosch Serie 6 WAU28P40",
    sku: "BSWAU28P40",
    category: "AGD",
    price: 3299,
    status: "unavailable",
    stock: 0,
  },
  {
    id: "xmsb8blk",
    name: "Xiaomi Smart Band 8",
    sku: "XMSB8BLK",
    category: "Akcesoria",
    price: 179,
    status: "available",
    stock: null,
  },
  {
    id: "dlu2723qe",
    name: "Dell UltraSharp U2723QE",
    sku: "DLU2723QE",
    category: "Komputery",
    price: 2799,
    status: "available",
    stock: 12,
  },
  {
    id: "phbri950",
    name: "Philips Lumea IPL BRI950",
    sku: "PHBRI950",
    category: "AGD",
    price: 1899,
    status: "unavailable",
    stock: 0,
  },
];
