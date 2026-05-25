export interface Extra {
  name: string;
  nameTa: string;
  price: number;
}

export interface FoodItem {
  id: string;
  name: string;
  nameTa: string;
  category: string;
  price: number;
  description: string;
  descriptionTa: string;
  image: string;
  rating: number;
  prepTime: number; // in minutes
  isVeg: boolean;
  isBestSeller?: boolean;
  extras?: Extra[];
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  selectedExtras: string[]; // name of extras
  spicySelection: 'Mild' | 'Medium' | 'Hot';
  notes?: string;
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: 'Delivery' | 'Table';
  tableNumber?: string;
  deliveryAddress?: string;
  createdAt: string; // ISO String
  estimatedWaitTime: number; // minutes remaining
  originalEstimatedWaitTime: number; // total duration
  riderProgress: number; // 0 to 100 representing map position
  riderState?: 'Assigned' | 'AtStore' | 'EnRoute' | 'Delivered';
  riderChat?: { sender: 'rider' | 'customer'; text: string; time: string }[];
  rating?: number;
  review?: string;
}

export type Language = 'en' | 'ta';

export interface MenuCategory {
  id: string;
  name: string;
  nameTa: string;
  icon: string;
}
