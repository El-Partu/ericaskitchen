// 📁 types/index.ts

// ---------------------------------------------------------------------------
// Enums & union types
// ---------------------------------------------------------------------------

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "mobile_money" | "card" | "cash_on_delivery";

export type OrderType = "delivery" | "dine_in" | "takeaway";

export type PaymentStatus =
  | "initiated"
  | "pending"
  | "success"
  | "failed"
  | "refunded";

export type AuthMethod = "local" | "google" | "apple";

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ---------------------------------------------------------------------------
// Auth / User
// ---------------------------------------------------------------------------

export interface Role {
  _id: string;
  name: string;
  permissions: string[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  authMethod: AuthMethod;
  role: Role;
  avatar?: string;
  phoneNumber?: string;
  addresses: Address[];
  defaultAddress?: string;
  emailVerified: boolean;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Extra Items
// ---------------------------------------------------------------------------

export interface ExtraItemCategory {
  _id: string;
  name: string;
}

export interface ExtraItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: ExtraItemCategory | string; // populated or just ID
}

// ---------------------------------------------------------------------------
// Menu Item
// ---------------------------------------------------------------------------

export interface NutritionalInfo {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // GHS
  currency: string;
  category: Category; // populated
  images: string[];
  preparationTime: number; // minutes
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  isAvailable: boolean;
  isFeatured: boolean;
  likes: number;
  averageRating: number;
  totalReviews: number;
  extraItems?: string[]; // allowed ExtraItem ObjectIds
  createdAt: string;
}

export interface MenuItemsResponse {
  status: string;
  results: number;
  data: {
    items: MenuItem[];
    pagination: Pagination;
  };
}

export interface MenuItemFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

// ---------------------------------------------------------------------------
// Daily Special
// ---------------------------------------------------------------------------

export interface DailySpecial {
  _id: string;
  title: string;
  description: string;
  menuItem: Pick<MenuItem, "_id" | "name" | "price" | "images">;
  date: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ServiceItem {
  id?: string | number;
  icon: string;
  title: string;
  description: string;
}

export interface ProteinOption {
  id: string;
  name: string;
  price: number;
}

export interface SoupOption {
  id: string;
  name: string;
  price: number;
  note?: string;
}

// ---------------------------------------------------------------------------
// Hero Carousel
// ---------------------------------------------------------------------------

export interface HeroSlide {
  image: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

export interface Coordinates {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

export interface Address {
  _id: string;
  user: string;
  label?: string;
  location: string;
  landmark?: string;
  gpsAddress?: string;
  coordinates?: Coordinates;
  phoneNumber: string;
  isDefault: boolean;
}

export interface CreateAddressPayload {
  label?: string;
  location: string;
  landmark?: string;
  gpsAddress?: string;
  coordinates?: Coordinates;
  phoneNumber: string;
  isDefault?: boolean;
}

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface CartItem {
  _id: string;
  menuItem: Pick<MenuItem, "_id" | "name" | "price" | "images">;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedExtras?: Array<{
    extraItem:
      | string
      | {
          _id: string;
          name?: string;
          price?: number;
        };
    quantity: number;
  }>;
  addedAt: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
}

export interface SelectedExtraInput {
  extraItem: string;
  quantity: number;
  name?: string;
  price?: number;
}

export interface LocalCartItem {
  lineId?: string;
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  lineTotal?: number;
  customization?: string;
  selectedExtras?: SelectedExtraInput[];
}

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------
export interface OrderItem {
  menuItem: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedExtras?: Array<{
    extraItem: string | { _id: string; name?: string; price?: number };
    quantity: number;
    name?: string;
    price?: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
  extraItems?: Array<{
    extraItem: string | { _id: string; name?: string; price?: number };
    quantity: number;
    name?: string;
    price?: number;
    unitPrice?: number;
    lineTotal?: number;
  }>;
}

export interface DeliveryAddress {
  sourceAddressId?: string;
  customerName: string;
  addressLabel?: string;
  location: string;
  landmark?: string;
  gpsAddress?: string;
  phoneNumber: string;
}

export interface StatusHistoryEntry {
  status: string;
  changedBy?: string;
  changedAt: string;
  note?: string;
}

export interface DeliveryCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  capturedAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  orderType: OrderType;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  deliveryFee: number;
  subtotal: number;
  processingFee: number;
  discount?: number;
  promoCode?: string;
  tax: number;
  totalAmount: number;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  assignedRider?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  notes?: string;
  cancellationReason?: string;
  deliveryCoordinates?: DeliveryCoordinates;
  areaName?: string;
  liveLocationUpdatedAt?: string;
  createdAt: string;
}

export interface CreateOrderPayload {
  orderType?: OrderType;
  addressId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  promoCode?: string;
}

// ---------------------------------------------------------------------------
// Super Admin Settings
// ---------------------------------------------------------------------------

export type ProcessingFeeType = "fixed" | "percentage";

export interface ProcessingFeeConfig {
  type: ProcessingFeeType;
  amount: number;
}

export type PromoDiscountType = "percent" | "fixed";

export interface PromoCode {
  _id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxRedemptions?: number;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export type CommissionType = "percent" | "fixed";

export interface CommissionConfig {
  type: CommissionType;
  value: number;
}

export interface CommissionTodaySummary {
  totalCommission: number;
  orderCount: number;
  date?: string;
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export interface Payment {
  _id: string;
  order: string;
  user: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  provider?: string;
  providerRef?: string;
  status: PaymentStatus;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  createdAt: string;
}

export interface PaystackInitializeResponse {
  status: string;
  data: {
    payment: Payment;
    authorizationUrl: string;
    reference: string;
  };
}

// ---------------------------------------------------------------------------
// Testimonial
// ---------------------------------------------------------------------------

export interface Testimonial {
  _id: string;
  id?: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  rating: number;
  menuItem?: {
    _id: string;
    name: string;
  };
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// API response wrappers
// ---------------------------------------------------------------------------

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface ApiListResponse<T> {
  status: string;
  results: number;
  data: T;
}

export interface ApiMessageResponse {
  status: string;
  message: string;
}
