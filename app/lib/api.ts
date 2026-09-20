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
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
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
  }
) {
  const res = await fetch(`${API_BASE_URL}/vendor/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "فشل إضافة المنتج");
  }
  return res.json();
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
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل الرسائل");
  const json = await res.json();
  return json.data;
}

export async function sendMessage(token: string, conversationId: number, body: string) {
  const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error("فشل إرسال الرسالة");
  const json = await res.json();
  return json.data;
}

export interface CreateOrderPayload {
  items: { product_id: number; quantity: number }[];
  payment_method: "cod" | "online";
  shipping_address: string;
  shipping_governorate: string;
}

export async function createOrder(token: string, data: CreateOrderPayload) {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
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
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
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
  const res = await fetch(`${API_BASE_URL}/conversations`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("فشل تحميل المحادثات");
  const json = await res.json();
  return json.data;
}

export interface AdminOverview {
  total_users: number;
  total_vendors: number;
  pending_vendors: number;
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
  const res = await fetch(`${API_BASE_URL}/vendor/register`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
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

export async function startPayment(token: string, orderId: number): Promise<{ payment_url: string }> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/pay`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
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