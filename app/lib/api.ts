const API_BASE_URL = "https://dokanelbalad-api-production.up.railway.app/api/v1";

export interface Category {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  image: string | null;
  image_url: string | null;
}

export interface Vendor {
  id: number;
  store_name: string;
  vendor_type: "shop" | "individual";
  is_founding_seller: boolean;
  rating_avg: string;
}

export interface ProductImage {
  id: number;
  image_path: string;
  image_url: string | null;
  is_primary: boolean;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  condition: "new" | "used" | "like_new";
  price: string;
  discount_percentage: string;
  price_after_discount: number;
  shipping_fee: string;
  shipping_paid_by: "vendor" | "buyer";
  display_price: number;
  display_shipping_fee: number;
  total_display_price: number;
  governorate: string;
  images: ProductImage[];
  category: Category;
  vendor: Vendor;
}

interface ProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
}

/**
 * خطأ خاص لما الحساب يكون مجمّد (كود 423 من الـ backend) - سواء بسبب عمولة
 * متأخرة أو مخالفة مشاركة أرقام تواصل أو تجميد يدوي من الإدارة. أي صفحة
 * بتستخدم دالة محتاجة تسجيل دخول تقدر تمسك الخطأ ده لوحده وتوريه للمستخدم
 * برسالة واضحة، بدل ما يظهر كـ"حصل خطأ" عام.
 */
export class FrozenAccountError extends Error {
  reason: string;

  constructor(message: string, reason: string) {
    super(message);
    this.name = "FrozenAccountError";
    this.reason = reason;
  }
}

/**
 * نسخة من fetch بتحط التوكن أوتوماتيك وبتفحص حالة "الحساب مجمّد" (423) مركزياً.
 * أي دالة هنا بتحتاج تسجيل دخول تقدر تستخدمها بدل fetch العادي.
 */
async function authFetch(url: string, token: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 423) {
    const err = await res.json().catch(() => ({}) as any);
    throw new FrozenAccountError(
      err.message || "حسابك مجمّد مؤقتاً",
      err.frozen_reason || "unknown"
    );
  }

  return res;
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data;
}

export async function getProducts(category?: string, hasDiscount?: boolean): Promise<Product[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (hasDiscount) params.set("has_discount", "1");
  const query = params.toString();
  const url = query ? `${API_BASE_URL}/products?${query}` : `${API_BASE_URL}/products`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const json: ProductsResponse = await res.json();
  return json.data;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "admin";
  governorate: string | null;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export async function registerUser(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إنشاء الحساب");
  }
  return res.json();
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "بيانات الدخول غير صحيحة");
  }
  return res.json();
}

export async function getMe(token: string) {
  const res = await authFetch(`${API_BASE_URL}/auth/me`, token);
  if (!res.ok) throw new Error("فشل التحقق من الجلسة");
  return res.json();
}

export interface VendorStats {
  products_count: number;
  orders_count: number;
  total_sales: number;
  pending_commission_balance: string;
}

export interface VendorDashboard {
  vendor: {
    id: number;
    store_name: string;
    vendor_type: string;
    is_founding_seller: boolean;
    rating_avg: string;
    status: string;
    commission_rate: string;
  };
  stats: VendorStats;
}

export async function getVendorDashboard(token: string): Promise<VendorDashboard> {
  const res = await fetch(`${API_BASE_URL}/vendor/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل بيانات لوحة التحكم");
  return res.json();
}

export async function getVendorProducts(token: string) {
  const res = await fetch(`${API_BASE_URL}/vendor/products`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل المنتجات");
  return res.json();
}

export async function createVendorProduct(
  token: string,
  data: {
    category_id: number;
    title: string;
    description: string;
    condition: "new" | "used" | "like_new";
    price: number;
    discount_percentage?: number;
    shipping_fee?: number;
    shipping_paid_by?: "vendor" | "buyer";
    quantity: number;
    governorate: string;
  },
  images?: File[]
) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  });
  (images || []).forEach((file) => formData.append("images[]", file));

  const res = await authFetch(`${API_BASE_URL}/vendor/products`, token, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إضافة المنتج");
  }
  return res.json();
}

export async function addProductImages(token: string, productId: number, images: File[]) {
  const formData = new FormData();
  images.forEach((file) => formData.append("images[]", file));

  const res = await authFetch(`${API_BASE_URL}/vendor/products/${productId}/images`, token, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إضافة الصور");
  }
  return res.json();
}

export async function deleteProductImage(token: string, productId: number, imageId: number) {
  const res = await authFetch(`${API_BASE_URL}/vendor/products/${productId}/images/${imageId}`, token, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل حذف الصورة");
  }
  return res.json();
}

export async function updateVendorProduct(
  token: string,
  productId: number,
  data: Partial<{
    category_id: number;
    title: string;
    description: string;
    condition: "new" | "used" | "like_new";
    price: number;
    discount_percentage: number;
    shipping_fee: number;
    shipping_paid_by: "vendor" | "buyer";
    quantity: number;
    governorate: string;
  }>
) {
  const res = await authFetch(`${API_BASE_URL}/products/${productId}`, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل تعديل المنتج");
  }
  return res.json();
}

export async function getVendorProduct(token: string, productId: number): Promise<Product> {
  const res = await authFetch(`${API_BASE_URL}/products/${productId}`, token, { cache: "no-store" });
  if (!res.ok) throw new Error("فشل تحميل المنتج");
  const json = await res.json();
  return json.data;
}

export async function deleteVendorProduct(token: string, productId: number) {
  const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل حذف المنتج");
  }
  return res.json();
}

export async function getProduct(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: "no-store" });
  const json = await res.json();
  return json.data;
}

export async function startConversation(token: string, productId: number) {
  const res = await authFetch(`${API_BASE_URL}/conversations`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل بدء المحادثة");
  }
  const json = await res.json();
  return json.data;
}

export async function getMessages(token: string, conversationId: number) {
  const res = await authFetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, token, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل الرسائل");
  const json = await res.json();
  return json.data;
}

export interface SendMessageResult {
  data: any;
  /** موجودة بس لما الرسالة اتبعتت مع تحذير مشاركة رقم تواصل (المحاولة الأولى أو التانية) */
  warning?: string;
}

export async function sendMessage(
  token: string,
  conversationId: number,
  body: string
): Promise<SendMessageResult> {
  const res = await authFetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });

  const json = await res.json().catch(() => ({}) as any);

  if (!res.ok) {
    // 422: الرسالة اتمنعت (المحاولة التالتة أو الرابعة لمشاركة رقم)
    throw new Error(json.message || "فشل إرسال الرسالة");
  }

  return { data: json.data, warning: json.warning };
}

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number }[];
  payment_method: "cod" | "online";
  shipping_address: string;
  shipping_governorate: string;
}

export async function createOrder(token: string, data: CreateOrderPayload) {
  const res = await authFetch(`${API_BASE_URL}/orders`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إتمام الطلب");
  }
  const json = await res.json();
  return json.data;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  product: Product;
}

export interface Order {
  id: number;
  order_number: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment_method: "cod" | "online";
  payment_status?: string;
  subtotal: string;
  total: string;
  shipping_address: string;
  shipping_governorate: string;
  created_at: string;
  vendor: Vendor;
  items: OrderItem[];
}

interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  total: number;
}

export async function getMyOrders(token: string): Promise<OrdersResponse> {
  const res = await authFetch(`${API_BASE_URL}/orders`, token, { cache: "no-store" });
  if (!res.ok) throw new Error("فشل تحميل الطلبات");
  return res.json();
}

export interface ConversationUser {
  id: number;
  name: string;
}

export interface ConversationVendor {
  id: number;
  store_name: string;
}

export interface Conversation {
  id: number;
  product_id: number;
  buyer_id: number;
  vendor_id: number;
  last_message_at: string | null;
  product: Product;
  buyer: ConversationUser;
  vendor: ConversationVendor;
}

export async function getConversations(token: string): Promise<Conversation[]> {
  const res = await authFetch(`${API_BASE_URL}/conversations`, token, { cache: "no-store" });
  if (!res.ok) throw new Error("فشل تحميل المحادثات");
  const json = await res.json();
  return json.data;
}

export interface AdminOverview {
  total_users: number;
  total_vendors: number;
  pending_vendors: number;
  frozen_accounts: number;
  offplatform_sales_needing_review: number;
  total_products: number;
  total_orders: number;
  total_pending_commission: number;
}

export async function getAdminOverview(token: string): Promise<AdminOverview> {
  const res = await fetch(`${API_BASE_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل البيانات");
  const json = await res.json();
  return json.data;
}

export interface AdminVendor {
  id: number;
  store_name: string;
  vendor_type: string;
  status: "pending" | "approved" | "rejected";
  commission_rate: string;
  pending_commission_balance: string;
  created_at: string;
  user: { id: number; name: string; email: string; phone: string };
}

export async function getAdminVendors(token: string, status?: string): Promise<AdminVendor[]> {
  const url = status ? `${API_BASE_URL}/admin/vendors?status=${status}` : `${API_BASE_URL}/admin/vendors`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل البائعين");
  const json = await res.json();
  return json.data;
}

export async function approveVendor(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل قبول البائع");
  return res.json();
}

export async function rejectVendor(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل رفض البائع");
  return res.json();
}

export async function blockVendor(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/block`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل تجميد الحساب");
  return res.json();
}

export async function unblockVendor(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/vendors/${id}/unblock`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل رفع التجميد");
  return res.json();
}

export async function getAdminCategories(token: string): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/admin/categories`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل التصنيفات");
  const json = await res.json();
  return json.data;
}

export async function createCategory(token: string, formData: FormData) {
  const res = await fetch(`${API_BASE_URL}/admin/categories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إضافة التصنيف");
  }
  return res.json();
}

export async function updateCategory(token: string, id: number, formData: FormData) {
  formData.append("_method", "PUT");
  const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل تعديل التصنيف");
  }
  return res.json();
}

export async function deleteCategory(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل حذف التصنيف");
  return res.json();
}

export interface PendingCommissionVendor {
  id: number;
  store_name: string;
  pending_commission_balance: string;
  user: { name: string };
}

export async function getPendingCommissions(token: string): Promise<PendingCommissionVendor[]> {
  const res = await fetch(`${API_BASE_URL}/admin/commissions/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل العمولات");
  const json = await res.json();
  return json.data;
}

export async function collectCommission(token: string, vendorId: number) {
  const res = await fetch(`${API_BASE_URL}/admin/commissions/${vendorId}/collect`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل تحصيل العمولة");
  return res.json();
}

export async function sendOtp(email: string) {
  const res = await fetch(`${API_BASE_URL}/otp/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إرسال الرمز");
  }
  return res.json();
}

export async function verifyOtp(email: string, code: string) {
  const res = await fetch(`${API_BASE_URL}/otp/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "الكود غلط أو منتهي الصلاحية");
  }
  return res.json();
}

export async function registerVendor(token: string, formData: FormData) {
  const res = await authFetch(`${API_BASE_URL}/vendor/register`, token, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل التسجيل كبائع");
  }
  return res.json();
}

export async function getAdminProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/admin/products`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل المنتجات");
  const json = await res.json();
  return json.data;
}

export async function updateProductCategory(token: string, productId: number, categoryId: number) {
  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/category`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ category_id: categoryId }),
  });
  if (!res.ok) throw new Error("فشل تعديل تصنيف المنتج");
  return res.json();
}

export async function updateProductDiscount(token: string, productId: number, discountPercentage: number) {
  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/discount`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ discount_percentage: discountPercentage }),
  });
  if (!res.ok) throw new Error("فشل تعديل الخصم");
  return res.json();
}

export interface ProductBuyer {
  id: number; // رقم المحادثة
  buyer_id: number;
  last_message_at: string | null;
  buyer: { id: number; name: string };
}

export async function getProductBuyers(token: string, productId: number): Promise<ProductBuyer[]> {
  const res = await authFetch(`${API_BASE_URL}/vendor/products/${productId}/buyers`, token, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل قايمة المشترين");
  const json = await res.json();
  return json.data;
}

export async function markSoldOffPlatform(
  token: string,
  productId: number,
  data: { sale_price: number; conversation_id: number; note?: string }
) {
  const res = await authFetch(`${API_BASE_URL}/vendor/products/${productId}/mark-sold-offplatform`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل تسجيل البيع");
  }
  return res.json();
}

export interface SaleConfirmation {
  id: number;
  amount: string;
  created_at: string;
  confirmation_deadline: string;
  vendor: { id: number; store_name: string };
  conversation: { id: number; product: { id: number; title: string } };
}

export async function getSaleConfirmations(token: string): Promise<SaleConfirmation[]> {
  const res = await authFetch(`${API_BASE_URL}/buyer/sale-confirmations`, token, { cache: "no-store" });
  if (!res.ok) throw new Error("فشل تحميل طلبات التأكيد");
  const json = await res.json();
  return json.data;
}

export async function respondToSaleConfirmation(token: string, id: number, confirm: boolean) {
  const res = await authFetch(`${API_BASE_URL}/buyer/sale-confirmations/${id}/respond`, token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirm }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إرسال ردك");
  }
  return res.json();
}

export interface FrozenAccount {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "buyer" | "seller" | "admin";
  frozen_reason: "phone_sharing" | "commission_overdue" | "admin_manual" | null;
  frozen_until: string | null;
  permanently_banned: boolean;
  phone_violation_strikes: number;
  phone_freeze_count: number;
  commission_freeze_count: number;
  updated_at: string;
  vendorProfile?: { id: number; store_name: string } | null;
}

export async function getFrozenAccounts(token: string): Promise<FrozenAccount[]> {
  const res = await fetch(`${API_BASE_URL}/admin/accounts/frozen`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل الحسابات المجمّدة");
  const json = await res.json();
  return json.data;
}

export async function freezeUserAccount(token: string, userId: number) {
  const res = await fetch(`${API_BASE_URL}/admin/accounts/${userId}/freeze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل تجميد الحساب");
  return res.json();
}

export async function unfreezeUserAccount(token: string, userId: number) {
  const res = await fetch(`${API_BASE_URL}/admin/accounts/${userId}/unfreeze`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل رفع التجميد");
  return res.json();
}

export interface OffplatformSale {
  id: number;
  amount: string;
  buyer_confirmation: "pending" | "confirmed" | "rejected" | "expired" | "admin_approved" | "dismissed";
  confirmation_deadline: string;
  created_at: string;
  vendor: { id: number; store_name: string; user: { name: string } };
  conversation: { id: number; buyer: { name: string }; product: { id: number; title: string } };
}

export async function getOffplatformSalesPendingReview(token: string): Promise<OffplatformSale[]> {
  const res = await fetch(`${API_BASE_URL}/admin/offplatform-sales/pending-review`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل البيعات المحتاجة مراجعة");
  const json = await res.json();
  return json.data;
}

export async function getOffplatformSalesPendingIntervention(token: string): Promise<OffplatformSale[]> {
  const res = await fetch(`${API_BASE_URL}/admin/offplatform-sales/pending-intervention`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل البيعات المستنية رد المشتري");
  const json = await res.json();
  return json.data;
}

export async function approveOffplatformSaleAdmin(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/offplatform-sales/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل اعتماد العمولة");
  return res.json();
}

export async function dismissOffplatformSaleAdmin(token: string, id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/offplatform-sales/${id}/dismiss`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("فشل إلغاء العمولة");
  return res.json();
}

export async function forceResolveOffplatformSale(token: string, id: number, decision: "approve" | "dismiss") {
  const res = await fetch(`${API_BASE_URL}/admin/offplatform-sales/${id}/force-resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ decision }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل التدخل في الحالة");
  }
  return res.json();
}

export async function startPayment(token: string, orderId: number): Promise<{ payment_url: string }> {
  const res = await authFetch(`${API_BASE_URL}/orders/${orderId}/pay`, token, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل بدء عملية الدفع");
  }
  const json = await res.json();
  return json.data;
}

export async function getPaymentStatus(token: string, orderId: number): Promise<{ payment_status: string; order_status: string }> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/payment-status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل حالة الدفع");
  const json = await res.json();
  return json.data;
}
export async function forgotPassword(email: string) {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "حصل خطأ");
  }
  return res.json();
}

export async function resetPassword(data: {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل تغيير كلمة المرور");
  }
  return res.json();
}
