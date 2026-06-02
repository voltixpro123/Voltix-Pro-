export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  batteryLife: string;
  hasLeds: boolean;
  image: string;
  colors: string[];
  features: string[];
  badge?: string;
  isPromo?: boolean;
}

export interface VideoScene {
  id: number;
  title: string;
  timeStart: number;
  timeEnd: number;
  speech: string;
  visual: string;
  tips?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface OrderDetails {
  customerName: string;
  customerPhone: string;
  deliveryLocation: string;
  paymentMethod: 'MTN MoMo' | 'Telecel Cash' | 'Airtel Money' | 'Visa Card' | 'Cash on Delivery';
  notes?: string;
}
