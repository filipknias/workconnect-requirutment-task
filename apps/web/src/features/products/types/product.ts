export type ProductStatus = "available" | "unavailable";

export type Product = {
  id: string;
  name: string;
  sku: string;
  description: string;
  manufacturer: string;
  category: string;
  features: string[];
  priceNet: number;
  price: number;
  vatRate: number;
  currency: string;
  status: ProductStatus;
  stock: number | null;
  minQuantity: number;
  maxQuantity: number;
};

export type ProductsPage = {
  products: Product[];
  page: number;
  totalPages: number;
  total: number;
};

export type ProductOption<TValue = string> = {
  value: TValue;
  label: string;
};
