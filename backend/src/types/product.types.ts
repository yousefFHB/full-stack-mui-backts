/**
 * Product lifecycle status
 */
export type ProductStatus = "active" | "draft" | "archived" | "out_of_stock";

/**
 * Filter operators allowed by security-config.js
 */
export type AllowedQueryOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "in"
  | "nin"
  | "regex"
  | "exists"
  | "size"
  | "or"
  | "and";

/**
 * Base Product entity definition
 */
export interface IProduct {
  _id?: string;
  title: string;
  slug?: string;
  description: string;
  price: number;
  discountPrice?: number;
  countInStock: number;
  images: string[];
  coverImage?: string;
  category: string;
  tags?: string[];
  rating?: number;
  numReviews?: number;
  status?: ProductStatus;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * DTO for creating a new product
 */
export interface CreateProductDTO {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  countInStock: number;
  images?: string[];
  coverImage?: string;
  category: string;
  tags?: string[];
  status?: ProductStatus;
}

/**
 * DTO for updating an existing product
 */
export type UpdateProductDTO = Partial<CreateProductDTO>;

/**
 * Query parameters for filtering, sorting and paginating products
 */
export interface ProductQueryFilters {
  page?: number | string;
  limit?: number | string;
  sort?: string;
  order?: "asc" | "desc";
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  search?: string;
  inStock?: boolean | string;
  status?: ProductStatus;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Generic Paginated API Response
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}
