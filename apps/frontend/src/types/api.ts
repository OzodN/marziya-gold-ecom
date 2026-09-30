/**
 * Canonical Domain DTOs reflecting docs/api/openapi.yaml
 * Marziya Gold Master Jewelry Catalog API
 */

export interface CharacteristicEntryDto {
  name: string;
  value: string;
}

export interface ProductImageDto {
  id?: number;
  url: string;
  sortOrder?: number;
}

export interface ProductStoneDto {
  id?: number;
  stoneTypeId?: number;
  stoneTypeName?: string;
  sortOrder?: number;
  characteristics?: CharacteristicEntryDto[];
}

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  sortOrder?: number;
}

export interface StoneTypeDto {
  id: number;
  name: string;
  isActive?: boolean;
}

export interface ProductFilterParams {
  page?: number;
  size?: number;
  q?: string;
  categorySlug?: string;
  stoneTypeId?: number;
  metal?: string;
  probe?: string;
}

export interface ProductSummaryDto {
  id: number;
  sku: string;
  name: string;
  slug: string;
  categoryName?: string;
  mainImageUrl?: string;
  imageUrls?: string[];
  images?: string[];
  isVisible: boolean;
}

export interface ProductDetailDto {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description?: string;
  category?: CategoryDto;
  categoryName?: string;
  categorySlug?: string;
  images?: ProductImageDto[];
  characteristics?: CharacteristicEntryDto[];
  stones?: ProductStoneDto[];
  createdAt?: string;
  isVisible?: boolean;
}

export interface PageResponseProductSummaryDto {
  content: ProductSummaryDto[];
  totalElements: number;
  totalPages: number;
  pageNumber: number;
}

export interface ProductAvailabilityDto {
  productId: number;
  isAvailable: boolean;
  name?: string;
  mainImageUrl?: string;
}

export interface FilterGroupDto {
  name: string;
  values: string[];
}

export interface ContactSettingsDto {
  telegramUsername?: string;
  phoneNumber?: string;
  masterBio?: string;
}

export interface InquiryItemRequestDto {
  productId: number;
  quantity: number;
}

export interface InquiryCreateRequestDto {
  clientName: string;
  clientPhone: string;
  comment?: string;
  items: InquiryItemRequestDto[];
}

export interface InquiryResponseDto {
  id: number;
  status: string;
  message?: string;
}

export type InquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";

export interface ProductSnapshotDto {
  productId?: number;
  sku: string;
  name: string;
  mainImageUrl?: string;
  characteristics?: CharacteristicEntryDto[];
  stones?: {
    stoneTypeName?: string;
    characteristics?: CharacteristicEntryDto[];
  }[];
}

export interface InquirySummaryDto {
  id: number;
  clientName: string;
  clientPhone: string;
  itemCount: number;
  status: InquiryStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface InquiryStatusHistoryDto {
  id?: number;
  oldStatus?: InquiryStatus | string | null;
  newStatus: InquiryStatus | string;
  changedBy?: string | null;
  changedAt: string;
}

export interface InquiryItemDetailDto {
  id: number;
  productId?: number;
  quantity: number;
  snapshot?: ProductSnapshotDto;
  productSnapshot?: ProductSnapshotDto;
}

export interface InquiryDetailDto {
  id: number;
  clientName: string;
  clientPhone: string;
  comment?: string | null;
  status: InquiryStatus;
  createdAt: string;
  updatedAt?: string;
  items: InquiryItemDetailDto[];
  statusHistory?: InquiryStatusHistoryDto[];
  history?: InquiryStatusHistoryDto[];
}

export interface AdminInquiriesResponse {
  items: InquirySummaryDto[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface ProductSaveRequestDto {
  sku: string;
  name: string;
  description?: string;
  categoryId: number;
  isVisible: boolean;
  imageUrls?: string[];
  characteristics?: CharacteristicEntryDto[];
  stones?: {
    stoneTypeId?: number;
    sortOrder?: number;
    characteristics?: CharacteristicEntryDto[];
  }[];
}

export interface AdminUserDto {
  id?: number;
  username: string;
  role: string;
  createdAt?: string;
  token?: string;
}

export interface AdminLoginRequestDto {
  username: string;
  password: string;
}

export interface NewInquiriesCountDto {
  count?: number;
  newCount: number;
}

export interface CategoryAdminDto {
  id: number;
  name: string;
  slug: string;
  sortOrder: number;
  isVisible: boolean;
  productCount?: number;
}

export interface CategorySaveDto {
  name: string;
  slug?: string;
  sortOrder?: number;
  isVisible?: boolean;
}

export interface CharacteristicKeyDto {
  id: number;
  name: string;
  unit?: string;
  sortOrder?: number;
  isFilterable?: boolean;
}

export interface CharacteristicKeySaveDto {
  name: string;
  unit?: string;
  sortOrder?: number;
  isFilterable?: boolean;
}

export interface StoneTypeAdminDto {
  id: number;
  name: string;
  isActive: boolean;
}

export interface StoneTypeSaveDto {
  name: string;
  isActive?: boolean;
}

export interface ContactSettingsUpdateDto {
  telegramUsername?: string;
  phoneNumber?: string;
  masterBio?: string;
}
