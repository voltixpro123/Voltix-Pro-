import { useState, useEffect, useRef, FormEvent } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Sparkles, 
  Sliders, 
  Film, 
  User, 
  Music, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Check, 
  Clock, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Smartphone,
  ChevronRight,
  Sparkle,
  MessageCircle,
  HelpCircle,
  Star,
  ThumbsUp,
  Lock,
  CreditCard,
  Copy,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { PRODUCTS_DATA } from './data/products';
import { VIDEO_SCENES_DATA } from './data/videoScenes';
import { startBackgroundMusic, stopBackgroundMusic } from './utils/audioSynth';
import { CartItem, Product, OrderDetails } from './types';

// Let Vite compile and resolve these images perfectly
import berlinProImg from './assets/images/berlin_pro_1780218483955.png';
import ultrapodsMaxImg from './assets/images/ultrapods_max_1780218465012.png';
import sporthookEliteImg from './assets/images/sporthook_elite_1780218501711.png';
import ringclipProImg from './assets/images/ringclip_pro_1780221557003.png';
import prosuiteBundleImg from './assets/images/prosuite_bundle_1780221578997.png';

// Image mapper supporting user's uploaded images by code selection
const getProductColorImage = (productId: string, color: string): string => {
  const c = color.toLowerCase();
  switch (productId) {
    case 'berlin-open-ear-pro':
      return berlinProImg;
    case 'ultrapods-max-white':
    case 'ultrapods-max-blue':
    case 'ultrapods-max-black':
      return ultrapodsMaxImg;
    case 'ringclip-pro-black':
    case 'ringclip-pro-white':
      return ringclipProImg;
    case 'sporthook-elite':
      return sporthookEliteImg;
    case 'prosuite-bundle':
      return prosuiteBundleImg;
    default:
      return ultrapodsMaxImg;
  }
};

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  productJoined: string;
  avatarChar: string;
}

const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 't-1',
    name: 'Emelia Darko',
    location: 'Tema, Greater Accra',
    rating: 5,
    text: 'The RingClip Pro earbuds are a lifesaver for my active runs! Zero ear fatigue, they don\'t fall off, and the sound is surprisingly clear for open-ear design. Paid with MoMo and got it delivered within 4 hours. Absolute gold!',
    productJoined: 'RingClip Pro - White',
    avatarChar: 'E'
  },
  {
    id: 't-2',
    name: 'Derrick Boateng',
    location: 'Kumasi, Ashanti',
    rating: 5,
    text: 'Ultrapods Max White has amazing noise isolation for this price segment. I use it at the busy Kejetia market and it completely blocks the noise. The transparent LED charging case looks super futuristic. Kudos to Kodiya!',
    productJoined: 'Ultrapods Max - White',
    avatarChar: 'D'
  },
  {
    id: 't-3',
    name: 'Naa Ayele',
    location: 'East Legon, Accra',
    rating: 5,
    text: 'I was sceptical about Ghc 40 earpods but the RingClip Pro is premium quality. Battery lasted me almost 3 full days of calls and music at my boutique. Everyone asks me about the ear-cuff design! Trust God brand stands for truth.',
    productJoined: 'RingClip Pro - Black',
    avatarChar: 'N'
  },
  {
    id: 't-4',
    name: 'Kwame Owusu',
    location: 'Sunyani, Bono Region',
    rating: 5,
    text: 'The SportHook Elite is a beast! 48 hours of pure endurance is no joke. I’ve dropped them in water and run under rain—still working perfectly. Delivery to Sunyani was super quick via VIP bus courier. Highly satisfied buyer.',
    productJoined: 'SportHook Elite',
    avatarChar: 'K'
  }
];

const openPaystackPayment = (options: {
  email: string;
  amount: number;
  ref: string;
  onSuccess: (ref: string) => void;
  onCancel: () => void;
}) => {
  const PaystackPop = (window as any).PaystackPop;
  if (!PaystackPop) {
    alert("Paystack secure engine is loading in your browser. Please try again in 3 seconds.");
    return;
  }
  
  const amountInPesewas = Math.round(options.amount * 100);
  
  try {
    // Try the modern newTransaction format first (used by the latest Inline JS framework)
    const paystackInstance = new PaystackPop();
    paystackInstance.newTransaction({
      key: 'pk_live_9136ecd40ccc704b3e337e4168138f97186bff96',
      email: options.email,
      amount: amountInPesewas,
      currency: 'GHS',
      ref: options.ref,
      onSuccess: (response: any) => {
        const ref = response.reference || response.trxref || options.ref;
        options.onSuccess(ref);
      },
      onCancel: () => {
        options.onCancel();
      }
    });
  } catch (error) {
    console.warn("Paystack modern constructor format failed, falling back to legacy setup method:", error);
    try {
      // Fallback to legacy setup method if needed
      const handler = PaystackPop.setup({
        key: 'pk_live_9136ecd40ccc704b3e337e4168138f97186bff96',
        email: options.email,
        amount: amountInPesewas,
        currency: 'GHS',
        ref: options.ref,
        callback: (response: any) => {
          const ref = response.reference || response.trxref || options.ref;
          options.onSuccess(ref);
        },
        onClose: () => {
          options.onCancel();
        }
      });
      handler.openIframe();
    } catch (fallbackError) {
      console.error("Both Paystack setup patterns failed:", fallbackError);
      alert("Billing Error: Could not launch Paystack checkout overlay. Please change payment choice to Cash on Delivery or contact +233536193862.");
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'shop' | 'customizer' | 'video-creator' | 'founder'>('shop');
  
  // Products catalogs & state
  const [products] = useState<Product[]>(PRODUCTS_DATA);
  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS_DATA[0]);
  const [selectedColor, setSelectedColor] = useState<string>(PRODUCTS_DATA[0].colors[0]);
  const [activeImage, setActiveImage] = useState<string>(getProductColorImage(PRODUCTS_DATA[0].id, PRODUCTS_DATA[0].colors[0]));

  // Sync color select image change
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    const img = getProductColorImage(selectedProduct.id, color);
    setActiveImage(img);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSelectedColor(product.colors[0]);
    setActiveImage(getProductColorImage(product.id, product.colors[0]));
  };

  // Cart logic
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Customizer state
  const [customMold, setCustomMold] = useState<string>('berlin-open-ear-pro');
  const [customFinish, setCustomFinish] = useState<string>('Frosted Satin Glass'); // design theme match!
  const [customLED, setCustomLED] = useState<string>('Ice Pink Glow');
  const [customEngraving, setCustomEngraving] = useState<string>('VOLTIX PRO');
  const [isCustomGift, setIsCustomGift] = useState<boolean>(true);

  // Video generator state
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isPlayingNarration, setIsPlayingNarration] = useState<boolean>(false);
  const [narrationProgress, setNarrationProgress] = useState<number>(0);
  const [narrationVoice, setNarrationVoice] = useState<'kodiya-male' | 'pro-announcer' | 'cheerful-female'>('kodiya-male');
  const [videoRatio, setVideoRatio] = useState<'9:16' | '16:9'>('9:16');
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [narrationSpeed, setNarrationSpeed] = useState<number>(1);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // Checkout form info
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: '',
    customerPhone: '',
    deliveryLocation: 'Accra Greater Area (Ghc 25)',
    paymentMethod: 'MTN MoMo',
    notes: ''
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  // Paystack checkout and Order confirmation states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [generatedRef, setGeneratedRef] = useState('');
  const [showConfirmationPage, setShowConfirmationPage] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    reference: string;
    items: CartItem[];
    total: number;
    paymentMethod: string;
    customerName: string;
    customerPhone: string;
    deliveryLocation: string;
  } | null>(null);

  // Synchronize dynamic ad text ticker intervals
  const sceneTimerRef = useRef<any>(null);
  const animationFrameRef = useRef<any>(null);
  const synthTimeAcc = useRef<number>(0);

  // Customizer calculations
  const getCustomizerProduct = () => {
    return products.find(p => p.id === customMold) || products[0];
  };

  const calculateCustomizerPrice = () => {
    const basePrice = getCustomizerProduct().price;
    let addOn = 0;
    if (customFinish.includes('Majesty') || customFinish.includes('Carbon')) addOn += 15;
    if (customEngraving.trim().length > 0) addOn += 5;
    if (isCustomGift) addOn += 4;
    return basePrice + addOn;
  };

  // Web Audio Music toggle
  const toggleSynthMusic = () => {
    if (isPlayingMusic) {
      stopBackgroundMusic();
      setIsPlayingMusic(false);
    } else {
      startBackgroundMusic();
      setIsPlayingMusic(true);
    }
  };

  // Scene simulator loop (for reviewing the 8 scenes 0-80s)
  const currentScene = VIDEO_SCENES_DATA[currentSceneIndex];

  useEffect(() => {
    if (isPlayingNarration) {
      const activeScene = VIDEO_SCENES_DATA[currentSceneIndex];
      const duration = (activeScene.timeEnd - activeScene.timeStart) * 1000 / narrationSpeed;
      
      const startTime = Date.now();
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const percent = Math.min((elapsed / duration) * 100, 100);
        setNarrationProgress(percent);
      }, 50);

      sceneTimerRef.current = setTimeout(() => {
        if (currentSceneIndex < VIDEO_SCENES_DATA.length - 1) {
          setCurrentSceneIndex(prev => prev + 1);
          setNarrationProgress(0);
        } else {
          setIsPlayingNarration(false);
          setCurrentSceneIndex(0);
          setNarrationProgress(0);
        }
      }, duration);

      return () => {
        clearTimeout(sceneTimerRef.current);
        clearInterval(interval);
      };
    }
  }, [isPlayingNarration, currentSceneIndex, narrationSpeed]);

  const toggleNarrationPlayback = () => {
    if (isPlayingNarration) {
      setIsPlayingNarration(false);
      setNarrationProgress(0);
    } else {
      setIsPlayingNarration(true);
      if (currentSceneIndex === VIDEO_SCENES_DATA.length - 1) {
        setCurrentSceneIndex(0);
      }
    }
  };

  // Background audio teardown safely
  useEffect(() => {
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  // Cart operations
  const addToCart = (product: Product, color: string) => {
    const existingIndex = cart.findIndex(
      item => item.product.id === product.id && item.selectedColor === color
    );
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1, selectedColor: color }]);
    }
    setIsCartOpen(true);
  };

  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  };

  const getCartTotalOriginal = () => {
    return cart.reduce((sum, item) => sum + (item.product.originalPrice || item.product.price) * item.quantity, 0);
  };

  const getDeliveryCost = (locationString: string) => {
    const match = locationString.match(/Ghc\s*(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Render video render export simulation
  const handleExportSimulation = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            alert("Video generated successfully! You can now share it down to your WhatsApp Status, TikTok, Facebook or download it as MP4.");
          }, 300);
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  // Send purchase details directly to Ghana WhatsApp
  const handleWhatsAppCheckout = (e: FormEvent) => {
    e.preventDefault();
    if (!orderDetails.customerName || !orderDetails.customerPhone) {
      alert("Please fill in your Name and Phone Number to order.");
      return;
    }

    const refNumber = `VLX-GH-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedRef(refNumber);

    if (orderDetails.paymentMethod === 'Cash on Delivery') {
      // Cash on Delivery option: Skip Paystack payment, go straight to WhatsApp message, show order confirmation page!
      const itemsStr = cart.map(item => {
        return `• ${item.product.name} [Color: ${item.selectedColor}] (Qty: ${item.quantity}) - Ghc ${item.product.price * item.quantity}`;
      }).join('\n');

      const customText = tabAndEngravingMessage();
      const finalBill = getCartTotal();
      const sfee = getDeliveryCost(orderDetails.deliveryLocation);
      const grandTotal = finalBill + sfee;

      const message = `⚡ *VOLTIX PRO GH ORDER* 🇬🇭\n` +
        `---------------------------------------\n` +
        `*Order Reference:* #${refNumber}\n` +
        `*Customer:* ${orderDetails.customerName}\n` +
        `*Phone:* ${orderDetails.customerPhone}\n` +
        `*Location:* ${orderDetails.deliveryLocation}\n` +
        `*Payment Method:* Cash on Delivery 💵\n` +
        `*Payment Status:* Pending (Pay on Delivery) ⏳\n` +
        `---------------------------------------\n` +
        `*Ordered Items:*\n${itemsStr}\n` +
        (customText ? `\n*Custom Lab Request:*\n${customText}` : '') +
        `---------------------------------------\n` +
        `*Subtotal:* Ghc ${finalBill}\n` +
        `*Delivery:* Ghc ${sfee}\n` +
        `*Grand Total:* Ghc ${grandTotal}\n` +
        `---------------------------------------\n` +
        `Thank you for your support. A Trust God Company Brand! 🙏✨`;

      const encoded = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/233356193862?text=${encoded}`;

      setConfirmedOrder({
        reference: refNumber,
        items: [...cart],
        total: grandTotal,
        paymentMethod: 'Cash on Delivery',
        customerName: orderDetails.customerName,
        customerPhone: orderDetails.customerPhone,
        deliveryLocation: orderDetails.deliveryLocation
      });

      setSubmittedMessage("Preparing your Cash on Delivery Order... Redirecting to WhatsApp!");
      setOrderSubmitted(true);

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        setCart([]);
        setOrderSubmitted(false);
        setIsCartOpen(false);
        setShowConfirmationPage(true);
      }, 1500);

    } else {
      // Paystack Payment Option selected: Show custom premium payment summary modal first
      setIsPaymentModalOpen(true);
      setPaymentStatus('idle');
    }
  };

  // Convert customizer selections to a custom item and add it directly to cart to checkout securely of Paystack
  const handleCustomizerCheckout = () => {
    const prod = getCustomizerProduct();
    const customPrice = calculateCustomizerPrice();
    
    const customProduct: Product = {
      id: `custom-${prod.id}-${Date.now()}`,
      name: `Voltix Custom: ${prod.name}`,
      description: `Finish: ${customFinish} | Accent: ${customLED} | Engraving: "${customEngraving || "None"}"`,
      price: customPrice,
      originalPrice: customPrice + 45,
      batteryLife: prod.batteryLife,
      hasLeds: true,
      image: prod.image || ultrapodsMaxImg,
      colors: [customFinish],
      features: [
        `Finish style: ${customFinish}`,
        `LED Lights option: ${customLED}`,
        `Custom personal engraving: "${customEngraving || "None"}"`,
        isCustomGift ? 'Premium Gift Velvet Wrap Box Included' : 'Standard Eco Pack'
      ],
      badge: 'Bespoke Lab'
    };

    // Add custom product to cart
    setCart([...cart, { product: customProduct, quantity: 1, selectedColor: customFinish }]);
    setIsCartOpen(true);
    
    // Smooth user alert feedback
    alert(`🎨 Your customized Earpod Design (${prod.name}) has been built in the Special Lab and added to your Cart! Please enter your details on the checkout form to proceed to payment.`);
  };

  const tabAndEngravingMessage = () => {
    if (customEngraving.trim().length > 0) {
      return `⚙️ Custom Finish: ${customFinish} | Engraving: "${customEngraving}" | LED: ${customLED}`;
    }
    return '';
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#2e1065] via-[#701a75] to-[#0f172a] text-pink-50 overflow-hidden pb-12">
      
      {/* Dynamic Ambient Background Mesh Orbs (Frosted Glass Theme Requirement) */}
      <div className="mesh-circle circle-1 absolute w-[450px] h-[450px] bg-pink-600/20 top-[-100px] left-[-80px] rounded-full blur-[90px] -z-10 animate-pulse-glow pointer-events-none" />
      <div className="mesh-circle circle-2 absolute w-[380px] h-[380px] bg-purple-600/15 bottom-[50px] right-[-100px] rounded-full blur-[80px] -z-10 animate-float pointer-events-none" />
      <div className="absolute w-[200px] h-[200px] bg-yellow-500/5 top-[30%] left-[40%] rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Modern Top Header Nav */}
      <header className="sticky top-0 z-[40] transition-all bg-[#2e1065]/40 backdrop-blur-xl border-b border-white/10 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 bg-black/40 rounded-xl flex items-center justify-center border border-white/15 p-1 shadow-md shadow-pink-500/10">
              <img src="/input_file_0.png" alt="Voltix Pro Logo" className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                Voltix Pro GH <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/60 border border-yellow-500/40 text-yellow-500 flex items-center gap-1">🇬🇭 GHANA'S #1</span>
              </h1>
              <p className="text-[10px] text-pink-300 font-semibold tracking-wider uppercase">Premium Earpods & Lifestyle</p>
            </div>
          </div>

          {/* Quick Stats Banner & Music Toggle */}
          <div className="flex items-center gap-4">
            <button 
              id="music-control-btn"
              onClick={toggleSynthMusic} 
              className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                isPlayingMusic 
                ? 'bg-pink-600 border-pink-400 text-white animate-pulse' 
                : 'bg-white/5 border-white/10 text-pink-200 hover:bg-white/10'
              }`}
              title="Toggle Cozy Background Synthesizer Music"
            >
              {isPlayingMusic ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-pink-300" />}
              <span className="hidden md:inline">{isPlayingMusic ? 'Ambient Live' : 'Play Store Music'}</span>
            </button>

            <button 
              id="cart-trigger-btn"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-extrabold text-pink-100">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce border border-white">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Global Navigation Tabs (Structured Design Theme Matches Template Option) */}
        <div className="max-w-7xl mx-auto mt-3.5 flex justify-center">
          <nav className="flex items-center p-1 bg-black/40 border border-white/10 rounded-2xl gap-1 w-full max-w-lg shadow-inner z-[30]">
            <button
              id="tab-shop"
              onClick={() => setActiveTab('shop')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'shop'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-pink-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-pink-200" />
              <span>Shop Earpods</span>
            </button>
            <button
              id="tab-customizer"
              onClick={() => setActiveTab('customizer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'customizer'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-pink-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-pink-200" />
              <span>Design Lab</span>
            </button>
            <button
              id="tab-video"
              onClick={() => setActiveTab('video-creator')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'video-creator'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-pink-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-pink-200" />
              <span>Ad Studio</span>
            </button>
            <button
              id="tab-founder"
              onClick={() => setActiveTab('founder')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'founder'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-pink-200/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="w-3.5 h-3.5 text-pink-200" />
              <span>Founder</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
        
        {showConfirmationPage && confirmedOrder ? (
          <div className="glass-panel-heavy p-6 md:p-10 max-w-2xl mx-auto text-center space-y-6 relative overflow-hidden border border-pink-500/30 shadow-2xl shadow-pink-500/10 rounded-3xl my-6">
            {/* Ambient glows */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/15 border-2 border-green-500 rounded-full flex items-center justify-center text-green-400 mb-4 shadow-lg shadow-green-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Order Confirmed Successfully!</h2>
              <p className="text-xs text-pink-300 mt-1 uppercase tracking-wider font-semibold">Your order is queued in our Accra Delivery hub</p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-left space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block">Order Reference</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-yellow-400 font-mono tracking-wider">#{confirmedOrder.reference}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(confirmedOrder.reference);
                      alert("Order Reference copied! Reference: #" + confirmedOrder.reference);
                    }}
                    className="p-1 text-pink-300 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer animate-pulse"
                    title="Copy Reference"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">Items Ordered</span>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs text-neutral-200">
                      <span>{item.product.name} ({item.selectedColor}) <span className="text-pink-300 font-bold">x{item.quantity}</span></span>
                      <span className="font-mono text-white">Ghc {item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/5 pt-2.5 flex justify-between text-xs font-bold">
                <span className="text-neutral-300">Delivery Address</span>
                <span className="text-neutral-100">{confirmedOrder.deliveryLocation}</span>
              </div>

              <div className="border-t border-white/5 pt-2.5 flex justify-between text-xs font-bold">
                <span className="text-neutral-300">Payment Option</span>
                <span className="text-pink-400 uppercase tracking-wider">{confirmedOrder.paymentMethod}</span>
              </div>

              <div className="border-t border-white/10 pt-2.5 flex justify-between text-sm font-black uppercase text-white">
                <span>Grand Total Paid</span>
                <span className="text-yellow-400 font-mono">Ghc {confirmedOrder.total}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left bg-white/5 border border-white/5 p-4 rounded-2xl">
              <div>
                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block">Estimated Delivery</span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5 animate-pulse">
                  <Truck className="w-3.5 h-3.5 text-pink-400" />
                  1 - 3 Days Max
                </span>
              </div>

              <div>
                <span className="text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest block">Customer Support</span>
                <a href="tel:+233536193862" className="text-xs font-bold text-white hover:text-pink-400 flex items-center gap-1.5 mt-0.5 transition-colors">
                  <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                  +233 536 193 862
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setShowConfirmationPage(false);
                  setConfirmedOrder(null);
                  setActiveTab('shop');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg shadow-pink-500/20 cursor-pointer"
              >
                Back to Product Catalog
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: SHOPPING SHOWPLACE */}
            {activeTab === 'shop' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDE: GLOSS DETAIL CARD PRESENTATION */}
            <section id="interactive-product-viewer" className="lg:col-span-7 glass-panel-heavy p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-4 right-4 z-10">
                <span className="bg-pink-600/90 text-[10px] font-black tracking-widest text-white px-3 py-1 rounded bg-gradient-to-r from-pink-600 to-purple-600 uppercase shadow-lg shadow-pink-500/20">
                  {selectedProduct.badge}
                </span>
              </div>

              {/* Product Info */}
              <div>
                <span className="text-xs font-extrabold tracking-widest text-pink-400 uppercase">⚡ NOW STOCKING IN GHANA</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-1 leading-tight">{selectedProduct.name}</h2>
                <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                  <div className="text-pink-300 line-through text-sm">Ghc {selectedProduct.originalPrice}</div>
                  <div className="text-4xl font-black text-white flex items-baseline gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-xs font-medium text-pink-300">Ghc</span> {selectedProduct.price}
                  </div>
                  <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-400/20 px-2.5 py-1 rounded-full flex items-center gap-1 uppercase">
                    💥 You Save Ghc {selectedProduct.originalPrice - selectedProduct.price}!
                  </span>
                </div>
              </div>

              {/* Interactive Color Specific Image (Uses exact User Uploaded Images list) */}
              <div className="relative w-full aspect-square md:h-[350px] bg-black/40 rounded-3xl border border-white/15 flex items-center justify-center p-6 group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-pink-950/10 pointer-events-none" />
                <img 
                  id="product-hero-image"
                  src={activeImage} 
                  alt={selectedProduct.name} 
                  className="max-h-full max-w-full object-contain transition-all duration-500 transform group-hover:scale-105 filter drop-shadow-[0_15px_15px_rgba(219,39,119,0.35)]"
                />

                {/* Battery and LEDs pills overlay */}
                <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-2 flex-wrap pointer-events-none">
                  <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full bg-black/70 backdrop-blur border border-white/10 text-pink-200">
                    🔋 {selectedProduct.batteryLife}
                  </span>
                  {selectedProduct.hasLeds && (
                    <span className="text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full bg-purple-900/80 backdrop-blur border border-purple-400/30 text-purple-200 flex items-center gap-1 animate-pulse">
                      <span>✨</span> LED Screen Display
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Color Selection Switches (Triggers uploaded image swap!) */}
              <div>
                <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wider mb-2.5">Select Color Accent (Dynamic Photo Update)</h3>
                <div className="flex gap-2 flex-wrap">
                  {selectedProduct.colors.map(color => (
                    <button
                      key={color}
                      id={`color-btn-${color.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-2 cursor-pointer ${
                        selectedColor === color
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400 shadow-md shadow-pink-500/20 scale-102'
                        : 'bg-white/5 border-white/10 text-pink-200/90 hover:bg-white/10'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full border border-white/30 ${
                        color.includes('Pink') ? 'bg-pink-500' :
                        color.includes('Cyan') ? 'bg-cyan-400' :
                        color.includes('White') ? 'bg-white' :
                        color.includes('Purple') ? 'bg-purple-500' :
                        color.includes('Gold') ? 'bg-yellow-400' : 'bg-neutral-800'
                      }`} />
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Outstanding Feature bullets */}
              <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                <h3 className="text-xs font-bold text-pink-300 uppercase tracking-wide mb-2.5">Key Product Specifications</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-pink-100/95">
                  {selectedProduct.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 bg-white/5 p-2 rounded-lg">
                      <div className="text-pink-500 text-sm">✓</div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action row with Buy Now */}
              <div className="flex gap-3">
                <button
                  id="add-to-cart-cta"
                  onClick={() => addToCart(selectedProduct, selectedColor)}
                  className="flex-1 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-2xl font-black text-sm tracking-wide text-white glow-btn-pink transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5 text-white" />
                  <span>ADD TO MOMO CART · Ghc {selectedProduct.price}</span>
                </button>
              </div>
            </section>

            {/* RIGHT SIDE: BENTO GRID WITH OTHER PRODUCTS SELECTOR */}
            <section className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="glass-panel p-5">
                <h3 className="text-sm font-black text-white tracking-tight uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>Browse Our Collection</span>
                </h3>
                <p className="text-xs text-pink-300 mt-1">Select an item below to load dynamic view & photo parameters</p>

                <div className="grid grid-cols-1 gap-3.5 mt-4">
                  {products.map(prod => (
                    <button
                      key={prod.id}
                      id={`prod-card-${prod.id}`}
                      onClick={() => handleProductSelect(prod)}
                      className={`w-full text-left p-4.5 rounded-2xl border transition-all flex gap-4 relative overflow-hidden group cursor-pointer ${
                        selectedProduct.id === prod.id
                        ? 'bg-gradient-to-br from-pink-950/40 to-purple-950/40 border-pink-500/40 shadow-inner'
                        : 'bg-white/5 border-white/15 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Product Preview Thumbnail */}
                      <div className="w-20 h-20 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                        <img 
                          src={getProductColorImage(prod.id, prod.colors[0])} 
                          alt={prod.name} 
                          className="w-16 h-16 object-contain group-hover:scale-105 transition-all"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex gap-2 justify-between items-start">
                          <h4 className="text-sm font-bold text-white group-hover:text-pink-300 transition-colors">{prod.name}</h4>
                          <span className="text-xs font-black text-right text-white">Ghc {prod.price}</span>
                        </div>
                        <p className="text-xs text-pink-200/70 mt-1 line-clamp-2 leading-relaxed">{prod.description}</p>
                        <div className="flex gap-2 items-center mt-2 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-pink-300">{prod.batteryLife}</span>
                          <span className="text-[10px] font-bold text-pink-400-cyan-400 text-xs">{prod.colors.length} Color Select{prod.colors.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      {/* Side check decorator */}
                      {selectedProduct.id === prod.id && (
                        <div className="absolute right-2 bottom-2 bg-pink-500 text-white rounded-full p-1 border border-white/10">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Trust Credentials panel */}
              <div className="glass-panel p-5 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <ShieldCheck className="w-5 h-5 text-pink-400 mx-auto" />
                  <h4 className="text-[10px] font-black text-white uppercase mt-1.5">7-Day Return</h4>
                  <p className="text-[9px] text-pink-300/80 mt-0.5">Defective swap</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <Truck className="w-5 h-5 text-purple-400 mx-auto" />
                  <h4 className="text-[10px] font-black text-white uppercase mt-1.5">FAST GH Delivery</h4>
                  <p className="text-[9px] text-pink-300/80 mt-0.5">Accra, Kumasi & more</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <Smartphone className="w-5 h-5 text-yellow-400 mx-auto" />
                  <h4 className="text-[10px] font-black text-white uppercase mt-1.5">Pay via MoMo</h4>
                  <p className="text-[9px] text-pink-300/80 mt-0.5">100% Secure Transaction</p>
                </div>
              </div>

              {/* Special Limited Offer Promo Banner */}
              <div className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 border border-pink-500/20 rounded-2xl p-4 flex gap-4 items-center">
                <div className="text-2xl">📦</div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">⚡ TRUST GOD QUALITY PROMISE</h4>
                  <p className="text-xs text-pink-200 mt-0.5 leading-relaxed">
                    Kodiya Nekara hand-selects every batch of earpods. We test microphone response and bass frequencies to ensure you only receive the best.
                  </p>
                </div>
              </div>

            </section>

          </div>

          {/* Customer Success Stories Section */}
          <section id="customer-success" className="mt-16 pt-10 border-t border-white/10">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-extrabold tracking-widest text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full uppercase flex items-center justify-center gap-1.5 w-max mx-auto mb-3">
                <ThumbsUp className="w-3.5 h-3.5 text-pink-400" />
                <span>Verified Customer Success stories</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Loved by Ghanaians Nationwide 🇬🇭</h2>
              <p className="text-sm text-pink-200/80 mt-2.5">
                From Accra to Sunyani, music lovers trust Voltix for exceptional audio, fast MoMo checkouts, and premium, robust customer care.
              </p>
            </div>

            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {TESTIMONIALS_DATA.map((t) => (
                <div 
                  key={t.id} 
                  className="glass-panel p-5 flex flex-col justify-between border-white/10 hover:border-pink-500/40 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300"
                >
                  <div>
                    {/* Top block: verified badge and star rating */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[9px] font-black tracking-wider text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded uppercase flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400"></span>
                        <span>Verified Buyer</span>
                      </span>
                      <div className="flex text-yellow-400 gap-0.5" aria-label={`Rating: ${t.rating} stars`}>
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-xs text-pink-100/90 leading-relaxed italic mb-4 font-sans">
                      "{t.text}"
                    </p>
                  </div>

                  {/* Profile & Location block */}
                  <div className="border-t border-white/5 pt-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-extrabold text-sm text-white shadow-md">
                      {t.avatarChar}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white leading-none">{t.name}</h4>
                      <p className="text-[10px] text-pink-300/80 font-medium mt-1 uppercase tracking-wide">{t.location}</p>
                      <p className="text-[9px] text-neutral-400 mt-0.5 truncate max-w-[150px]" title={t.productJoined}>
                        📦 {t.productJoined}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Share your story Call to Action */}
            <div className="mt-8 bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-black/40 border border-white/10 hover:border-pink-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all">
              <div className="flex items-center gap-4.5">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-2xl flex-shrink-0 animate-bounce">
                  ✨
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                     <span>HAVE A STORY TO SHARE WITH KODIYA?</span>
                     <span className="text-[10px] font-bold text-yellow-400 bg-yellow-450/10 px-2 py-0.5 rounded border border-yellow-400/20">WIN PRIZES</span>
                  </h4>
                  <p className="text-xs text-pink-200 mt-1.5 leading-relaxed">
                    Tell us how much you love your customized Voltix pods! Send your story directly to Kodiya, and stand a chance to get a free personalized laser-engraved charging case and custom gift packaging.
                  </p>
                </div>
              </div>

              <a
                href={`https://wa.me/233536193862?text=${encodeURIComponent(
                  "Hello Kodiya! I am a happy Voltix Pro GH customer, and I'd love to share my customer success story:\n\nMy Name: \nMy Location: \nModel I bought: \nMy Story: "
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 hover:scale-103 whitespace-nowrap cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-white animate-bounce" />
                <span>SHARE YOUR VOLTIX STORY</span>
              </a>
            </div>
          </section>
        </>
      )}

        {/* TAB 2: INTERACTIVE CUSTOMIZER DESIGN LAB */}
        {activeTab === 'customizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT CONFIGURATION INTERACTIVE LIVE MOCKUP PREVIEW */}
            <section className="lg:col-span-6 glass-panel-heavy p-6 flex flex-col items-center gap-6 justify-between min-h-[500px]">
              
              <div className="w-full text-center">
                <span className="text-[10.5px] font-extrabold tracking-widest text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full uppercase">
                  ⭐ DYNAMIC SOUND LAB PREVIEWER
                </span>
                <p className="text-xs text-pink-300 mt-1.5">Interactive virtual render matching the selected style</p>
              </div>

              {/* Interactive Virtual Earbud Render Frame */}
              <div className="relative w-full aspect-square max-w-[340px] bg-black/60 rounded-full border-2 border-white/15 flex items-center justify-center p-8 overflow-hidden shadow-2xl">
                
                {/* Dynamic LED Underglow Ring */}
                <div className={`absolute inset-4 rounded-full filter blur-[15px] opacity-40 transition-all duration-500 ${
                  customLED.includes('Pink') ? 'bg-pink-500' :
                  customLED.includes('Green') ? 'bg-emerald-400' :
                  customLED.includes('Violet') ? 'bg-fuchsia-500' :
                  customLED.includes('Crimson') ? 'bg-rose-600' : 'bg-yellow-400'
                }`} />

                {/* Simulated Earpod graphic image (reloads matching selected product style) */}
                <img 
                  src={getProductColorImage(customMold, 'white')} 
                  alt="Customized Earbud" 
                  className="w-48 h-48 object-contain z-10 transition-all duration-500 drop-shadow-[0_10px_20px_rgba(219,39,119,0.3)] filter contrast-[1.1]"
                />

                {/* Laser Engraving overlay placement */}
                {customEngraving.trim().length > 0 && (
                  <div className="absolute bottom-1/3 z-20 bg-black/75 backdrop-blur-xs border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider shadow-md animate-bounce">
                    ⚡ {customEngraving}
                  </div>
                )}

                {/* Specifications badge overlay */}
                <div className="absolute bottom-4 bg-white/10 backdrop-blur border border-white/10 px-4 py-1 rounded-full text-[10px] text-pink-100 uppercase tracking-widest font-extrabold">
                  {customFinish}
                </div>

              </div>

              {/* Dynamic Live Cost Calculator */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-black text-white uppercase">CRAFTED SHOP PRICE</h4>
                  <p className="text-[10px] text-pink-300">Base Price + Custom finishes (+ Gift Pack)</p>
                </div>
                <div className="text-3xl font-black text-white flex items-baseline gap-1 bg-pink-500/10 border border-pink-400/20 px-4 py-1.5 rounded-xl">
                  <span className="text-xs font-medium text-pink-400">Ghc</span> {calculateCustomizerPrice()}
                </div>
              </div>

            </section>

            {/* RIGHT SIDE SETTINGS LABORATORY CONTROLS */}
            <section className="lg:col-span-6 glass-panel p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-pink-400" />
                  <span>Configure Your Custom Sound</span>
                </h3>
                <p className="text-xs text-pink-300 mt-0.5">Customize finishes, custom laser engraving initials, and package style.</p>
              </div>

              {/* Mold Select */}
              <div>
                <label className="block text-xs font-extrabold text-pink-300 uppercase tracking-wider mb-2">1. Choose Earpod Mold Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {products.map(prod => (
                    <button
                      key={prod.id}
                      onClick={() => setCustomMold(prod.id)}
                      className={`p-3 rounded-xl border text-xs font-extrabold text-left transition-all cursor-pointer ${
                        customMold === prod.id
                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white border-pink-400'
                        : 'bg-white/5 border-white/10 text-pink-200 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold">{prod.name}</div>
                      <div className="text-[10px] text-pink-300 font-medium mt-0.5">Base: Ghc {prod.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Case Material Texture */}
              <div>
                <label className="block text-xs font-extrabold text-pink-300 uppercase tracking-wider mb-2">2. Shell Case Material Finish</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Frosted Satin Glass',
                    'Carbon Stealth Fiber (+Ghc 15)',
                    'Gold Majesty Foil (+Ghc 15)',
                    'Metallic Pink Titanium',
                    'Electric Aura Cyber'
                  ].map(styleName => (
                    <button
                      key={styleName}
                      onClick={() => setCustomFinish(styleName)}
                      className={`p-2.5 rounded-xl border text-[11px] font-bold text-center transition-all cursor-pointer ${
                        customFinish === styleName
                        ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                        : 'bg-white/5 border-white/10 text-pink-200/90 hover:bg-white/10'
                      }`}
                    >
                      {styleName}
                    </button>
                  ))}
                </div>
              </div>

              {/* LED Lighting Color Settings */}
              <div>
                <label className="block text-xs font-extrabold text-pink-300 uppercase tracking-wider mb-2">3. Internal LED Illumination Color</label>
                <div className="flex gap-2 flex-wrap">
                  {['Ice Pink Glow', 'Acid Green Neon', 'Cosmic Violet Ring', 'Fire Crimson Accent', 'Golden Aura Beam'].map(colorToken => (
                    <button
                      key={colorToken}
                      onClick={() => setCustomLED(colorToken)}
                      className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        customLED === colorToken
                        ? 'bg-[#210c4a] border-purple-400 text-white shadow-glow'
                        : 'bg-white/5 border-white/10 text-pink-200/80 hover:bg-white/10'
                      }`}
                    >
                      {colorToken}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Laser Engravnig Name Input */}
              <div>
                <label className="block text-xs font-extrabold text-pink-300 uppercase tracking-wider mb-1.5">
                  4. Custom Laser Engraving Word/Initials (+Ghc 5)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={customEngraving}
                  onChange={(e) => setCustomEngraving(e.target.value.toUpperCase())}
                  placeholder="EX: KODIYA PRO 1"
                  className="w-full bg-black/40 border border-white/15 rounded-xl px-4 py-3 text-xs text-white uppercase tracking-wider focus:outline-none focus:border-pink-500 placeholder:text-neutral-500 font-mono"
                />
                <p className="text-[10px] text-pink-400 mt-1">Laser engraved forever directly onto your charging case lid!</p>
              </div>

              {/* Gift Wrapping checkbox */}
              <div className="flex items-center justify-between p-3.5 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎁</span>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase">Voltix Premium Gift Wrap (+Ghc 4)</h4>
                    <p className="text-[10px] text-pink-300/80">Includes a handwritten blessings card signed by Kodiya!</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isCustomGift}
                  onChange={(e) => setIsCustomGift(e.target.checked)}
                  className="w-5 h-5 rounded-md border-pink-400 focus:ring-transparent accent-pink-500"
                />
              </div>

              {/* Dispatch Customized Order */}
              <button
                id="design-lab-checkout-btn"
                onClick={handleCustomizerCheckout}
                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-pink-500/20 glow-btn-pink cursor-pointer"
              >
                📥 PLACE SPECIAL CUSTOM ORDER VIA WHATSAPP
              </button>

            </section>
          </div>
        )}

        {/* TAB 3: VIRAL SOUND ADS VIDEO GENERATOR */}
        {activeTab === 'video-creator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: LIVE VIDEO PHONE EMULATOR PREVIEW */}
            <section id="phone-emulator-container" className="lg:col-span-5 flex flex-col items-center gap-4">
              
              <div className="text-center w-full">
                <span className="text-[10px] font-black tracking-widest text-pink-400 uppercase bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
                  📱 TikTok & Status Ad Previewer
                </span>
                <p className="text-xs text-pink-300 mt-1">Simulating real-time compilation rendering and overlays</p>
              </div>

              {/* Phone Emulator frame with changeable aspect ratios (9:16 vs 16:9) */}
              <div className={`relative transition-all duration-500 bg-gradient-to-br from-[#1a0a2e] to-[#2d0a35] border-[6px] border-neutral-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col justify-between ${
                videoRatio === '9:16' ? 'w-[300px] h-[530px]' : 'w-[450px] h-[253px]'
              }`}>
                
                {/* Phone Speaker & Camera Notch decoration (only for 9:16) */}
                {videoRatio === '9:16' && (
                  <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-24 h-4.5 bg-neutral-800 rounded-full z-30 flex items-center justify-center">
                    <div className="w-12 h-1 bg-neutral-900 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full ml-2" />
                  </div>
                )}

                {/* Sound Logo Watermark (Corner dynamic toggle!) */}
                {showWatermark && (
                  <div className="absolute top-8 right-4 z-20 bg-black/60 backdrop-blur-xs border border-white/10 p-1.5 rounded-lg flex items-center gap-1">
                    <span className="text-[9px] font-extrabold text-pink-300 tracking-wider">⚡ Voltix GH</span>
                    <span className="text-[10px]">🇬🇭</span>
                  </div>
                )}

                {/* Interactive Dynamic Canvas Slide corresponding to Scene (1 to 8) */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative">
                  
                  {/* Subtle grid background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

                  {/* Scene visual simulations */}
                  {currentSceneIndex === 0 && (
                    <div className="flex flex-col items-center animate-pulse z-10">
                      <div className="w-16 h-16 bg-black/40 rounded-2xl flex items-center justify-center border border-white/10 p-2 mb-3 shadow-lg shadow-pink-500/10">
                        <img src="/input_file_0.png" alt="Voltix Pro Logo" className="h-full w-auto object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <h4 className="text-sm font-black tracking-widest text-white uppercase">Voltix Pro GH</h4>
                      <p className="text-[10px] text-pink-300 mt-1 uppercase">A Trust God Company Brand</p>
                    </div>
                  )}

                  {currentSceneIndex === 1 && (
                    <div className="flex flex-col items-center z-10 transition-all">
                      <div className="w-14 h-14 rounded-full border-2 border-pink-500 overflow-hidden mb-2 shadow-lg shadow-pink-500/20 bg-neutral-800">
                        <img src="/input_file_1.png" alt="Founder Portrait" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <h4 className="text-xs font-black text-white">Kodiya Nekara</h4>
                      <p className="text-[9px] text-yellow-400 mt-0.5 uppercase tracking-widest">Store Founder & Owner</p>
                    </div>
                  )}

                  {currentSceneIndex === 2 && (
                    <div className="flex flex-col items-center text-center z-10 transition-all">
                      <div className="text-4xl animate-bounce mb-2">🎁🎧</div>
                      <h4 className="text-xs font-black text-white px-2">Premium sound technology at sensible prices!</h4>
                      <div className="mt-2 text-2xl font-black text-yellow-400 animate-pulse">Ghc 40</div>
                      <span className="text-[8px] text-pink-300 font-bold uppercase tracking-widest mt-1">STARTING VALUE</span>
                    </div>
                  )}

                  {currentSceneIndex === 3 && (
                    <div className="flex flex-col items-center z-10 transition-all">
                      <div className="w-24 h-24 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center p-2 mb-2">
                        <img 
                          src={ultrapodsMaxImg} 
                          alt="Ultrapods" 
                          className="max-h-full max-w-full object-contain filter drop-shadow-[0_5px_8px_rgba(219,39,119,0.4)]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <h4 className="text-xs font-black text-white text-center">Ultrapods Max with LED Case</h4>
                      <p className="text-[8px] text-pink-300 mt-0.5">Plus Berlin Pro & SportHook Elite</p>
                    </div>
                  )}

                  {currentSceneIndex === 4 && (
                    <div className="flex flex-col items-center z-10 text-center transition-all">
                      <div className="text-3xl mb-1.5 animate-bounce">🛵💳</div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Accepting: MTN MoMo & Telecel</h4>
                      <p className="text-[9px] text-pink-300 mt-1">FAST EXPRESS GHANA-WIDE DELIVERY!</p>
                    </div>
                  )}

                  {currentSceneIndex === 5 && (
                    <div className="flex flex-col items-center z-10 text-center transition-all">
                      <div className="text-3xl text-yellow-400 mb-1">⭐🛡️⭐</div>
                      <h4 className="text-xs font-black text-white uppercase">100% Genuine Guaranteed</h4>
                      <p className="text-[9px] text-pink-300 mt-1">No-Questions-Asked 7 days swap return</p>
                    </div>
                  )}

                  {currentSceneIndex === 6 && (
                    <div className="flex flex-col items-center z-10 text-center transition-all">
                      <h4 className="text-xs font-bold text-white uppercase">Shop online at website link:</h4>
                      <p className="text-[10px] font-mono text-purple-300 bg-black/50 px-2 py-1.5 rounded-lg border border-purple-500/20 mt-1">voltix-pro-gh.netlify.app</p>
                      <div className="mt-2 text-xs font-bold text-green-400 flex items-center gap-1 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                        <span>💬 WhatsApp:</span> 0536 193 862
                      </div>
                    </div>
                  )}

                  {currentSceneIndex === 7 && (
                    <div className="flex flex-col items-center text-center z-10 transition-all">
                      <span className="text-3xl animate-bounce">🎧🇬🇭🎧</span>
                      <h4 className="text-[11px] font-black tracking-tight mt-1 text-white uppercase">Premium Sound. Real Prices.</h4>
                      <p className="text-[9px] text-pink-300 mt-0.5">Trust God Company Brand</p>
                    </div>
                  )}

                  {/* Active Text Subtitles overlays */}
                  <div className="absolute bottom-6 left-3 right-3 bg-black/80 backdrop-blur-md px-3 py-2.5 rounded-2xl border border-white/10 z-20 text-center">
                    <p className="text-[10.5px] font-black text-rose-300 leading-normal tracking-wide">
                      {currentScene.speech}
                    </p>
                  </div>

                  {/* Synthesized music visualization bar graphs */}
                  {isPlayingMusic && (
                    <div className="absolute top-1/3 left-4 right-4 flex justify-between h-4 leading-none pointer-events-none items-end gap-0.5">
                      {[1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 3, 2, 1].map((n, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-gradient-to-t from-purple-500 to-pink-500 rounded" 
                          style={{ 
                            height: `${n * 20}%`, 
                            animationDelay: `${i * 100}ms`,
                            animationName: 'pulseGlow',
                            animationDuration: '1.2s'
                          }} 
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Subtitle Rehearse progress track indicator bar */}
                <div className="h-1.5 bg-black/40 w-full relative">
                  <div 
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100"
                    style={{ width: `${narrationProgress}%` }}
                  />
                </div>

                {/* Play controls below */}
                <div className="bg-black/80 border-t border-white/10 py-3.5 px-6 flex justify-between items-center bg-gradient-to-r from-pink-950/20 to-purple-950/20 z-10">
                  <span className="text-[9px] font-extrabold text-neutral-400 font-mono tracking-tight">
                    {currentScene.timeStart}s - {currentScene.timeEnd}s
                  </span>
                  
                  <button 
                    onClick={toggleNarrationPlayback} 
                    className="w-9 h-9 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center font-bold tracking-wide transition-all shadow shadow-pink-500/20 cursor-pointer"
                  >
                    {isPlayingNarration ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>

                  <span className="text-[9px] font-extrabold text-neutral-400 font-mono">
                    Scene {currentScene.id} / 8
                  </span>
                </div>

              </div>

            </section>

            {/* RIGHT COLUMN: ADS CONTROLLERS & TIMELINES */}
            <section className="lg:col-span-7 glass-panel p-6 flex flex-col gap-6">
              
              <div>
                <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <Film className="w-5 h-5 text-pink-400" />
                  <span>Voltix Video Ad Creator</span>
                </h3>
                <p className="text-xs text-pink-300 mt-0.5">
                  Configure marketing templates, rehearsal narration speeds, synthesized store play music, and review scripts.
                </p>
              </div>

              {/* Template Configuration */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                
                {/* Ratio Selector */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Ratio Template</label>
                  <select 
                    value={videoRatio} 
                    onChange={(e: any) => setVideoRatio(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs text-white uppercase tracking-wider"
                  >
                    <option value="9:16">9:16 Vertical (TikTok/WA)</option>
                    <option value="16:9">16:9 Horizontal (YouTube)</option>
                  </select>
                </div>

                {/* Voice Profile select */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Voice Tone Profile</label>
                  <select 
                    value={narrationVoice} 
                    onChange={(e: any) => setNarrationVoice(e.target.value)}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs text-white"
                  >
                    <option value="kodiya-male">Kodiya Nekara Male GH</option>
                    <option value="pro-announcer">Premium Announcer UK</option>
                    <option value="cheerful-female">Joyful Female Accent</option>
                  </select>
                </div>

                {/* Speed Multiplier slider */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Narration Tempo</label>
                  <select 
                    value={narrationSpeed} 
                    onChange={(e: any) => setNarrationSpeed(parseFloat(e.target.value))}
                    className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-2.5 text-xs text-white"
                  >
                    <option value="0.8">0.8x Slo-mo Rehearse</option>
                    <option value="1.0">1.0x Real-time (80s)</option>
                    <option value="1.25">1.25x Fast Status Pitch</option>
                  </select>
                </div>

                {/* Watermark checkbox toggle */}
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Watermark Logo</label>
                  <button 
                    onClick={() => setShowWatermark(!showWatermark)}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                      showWatermark ? 'bg-pink-600/30 border-pink-400 text-white' : 'bg-black/30 border-white/10 text-neutral-400'
                    }`}
                  >
                    Overlay {showWatermark ? 'ON' : 'OFF'}
                  </button>
                </div>

              </div>

              {/* Music generator box & synthesis play */}
              <div className="bg-black/30 border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="text-xs font-black text-rose-300 uppercase flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-pink-400" />
                    <span>SYNTHESIZED AMBIENT MUSIC COMPOSER</span>
                  </h4>
                  <p className="text-[10px] text-pink-200 mt-0.5 leading-relaxed">
                    Generating cozy professional background chords and bell chimes live in the browser using HTML5 Web Audio oscillators.
                  </p>
                </div>

                <button
                  onClick={toggleSynthMusic}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    isPlayingMusic
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 border border-pink-300 text-white shadow-pink-500/30'
                    : 'bg-white/10 border border-white/15 text-pink-100 hover:bg-white/15'
                  }`}
                >
                  {isPlayingMusic ? <Volume2 className="w-3.5 h-3.5 text-white animate-bounce" /> : <VolumeX className="w-3.5 h-3.5 text-pink-300" />}
                  <span>{isPlayingMusic ? 'MUTE BACKGROUND' : 'SYNTH BG MUSIC'}</span>
                </button>
              </div>

              {/* Timeline scenes list 1 to 8 scrolling view */}
              <div className="flex flex-col gap-2.5 max-h-[300px] overflow-y-auto pr-2">
                <h4 className="text-[10.5px] font-black text-white uppercase tracking-wider">FULL AD CHRONOGRAM TIMELINE SCRIPT (SCENES 1-8)</h4>
                
                {VIDEO_SCENES_DATA.map((scene, i) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      setCurrentSceneIndex(i);
                      setNarrationProgress(0);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                      currentSceneIndex === i
                      ? 'bg-gradient-to-r from-pink-950/40 to-purple-950/40 border-pink-500/40 shadow-inner'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-neutral-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-white text-xs">{scene.title}</span>
                      <span className="bg-black/50 text-[9px] font-extrabold text-pink-400 px-2 py-0.5 rounded uppercase font-mono">
                        ⏱️ {scene.timeStart}s - {scene.timeEnd}s ({(scene.timeEnd - scene.timeStart)}s)
                      </span>
                    </div>

                    <p className="mt-1.5 text-pink-100 font-bold leading-relaxed">
                      💬 Narration Line: "{scene.speech}"
                    </p>

                    <div className="mt-2 text-[10px] text-pink-300/80 leading-normal border-t border-white/5 pt-1.5">
                      🎬 Frame: <span className="text-neutral-300">{scene.visual}</span>
                    </div>

                    {scene.tips && (
                      <div className="mt-1 text-[9.5px] text-yellow-400/80 font-semibold uppercase font-sans">
                        💡 Tip: {scene.tips}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Export Rendering panel action bar */}
              <div className="bg-white/5 border border-white/10 p-4.5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-left w-full md:w-auto">
                  <h4 className="text-xs font-black text-white uppercase">RENDER & CONVERT PRO VIDEO</h4>
                  <p className="text-[10px] text-pink-300 mt-1">Ready for WhatsApp Status, Facebook, Instagram and TikTok reels.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                  {isExporting && (
                    <div className="text-right flex-1 min-w-[124px]">
                      <div className="text-xs font-black text-rose-300 animate-pulse">Encoding... {exportProgress}%</div>
                      <div className="w-full bg-black/60 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${exportProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <button
                    disabled={isExporting}
                    onClick={handleExportSimulation}
                    className="px-5 py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-xs font-black tracking-widest uppercase glow-btn-pink disabled:opacity-50 cursor-pointer"
                  >
                    🤖 RENDER EXPORT MP4 AD
                  </button>
                </div>
              </div>

            </section>
          </div>
        )}

        {/* TAB 4: ABOUT FOUNDER KODIYA NEKARA */}
        {activeTab === 'founder' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* LEFT PORTRAIT GRAPHIC: Gorgeous Founder Portrait Framed under Glass Ring */}
            <section className="md:col-span-5 flex justify-center">
              <div className="relative w-[280px] h-[370px] md:w-[320px] md:h-[420px] group">
                
                {/* Glowing neon borders ring */}
                <div className="absolute inset-[-6px] rounded-[30px] bg-gradient-to-br from-pink-500 via-purple-500 to-yellow-500 bg-[size:300%_300%] animate-pulse-glow z-0" />
                <div className="absolute inset-[3px] rounded-[27px] bg-gradient-to-br from-[#1a0a2e] to-[#2d0a35] z-[1]" />

                {/* Main Image content, matches exact user local file */}
                <div className="absolute inset-[6px] rounded-[24px] overflow-hidden z-[2] bg-gradient-to-br from-pink-900/40 to-purple-900/40">
                  <img 
                    src="/input_file_1.png" 
                    alt="Kodiya Nekara — Founder of Voltix Pro GH"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-103"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle glass fade overlay at footer */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                </div>

                {/* Floating identity badge */}
                <div className="absolute bottom-[-14px] left-1/2 transform -translate-x-1/2 z-[10] bg-gradient-to-r from-pink-600 to-purple-600 border border-white/20 hover:border-pink-300 rounded-full py-2 px-6 shadow-xl shadow-pink-500/30 text-xs font-black tracking-wider text-white uppercase text-center whitespace-nowrap animate-bounce leading-none">
                  ⚡ KODIYA NEKARA — FOUNDER
                </div>
              </div>
            </section>

            {/* RIGHT TEXT DETAILS: STORY OF VOLTIX PRO GH AND "A TRUST GOD" PHILOSOPHY */}
            <section className="md:col-span-7 glass-panel p-6 md:p-8 flex flex-col gap-5 justify-between">
              
              <div>
                <span className="text-xs font-extrabold tracking-widest text-pink-400 bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full uppercase">
                  🇬🇭 A TRUST GOD COMPANY BRAND
                </span>
                <h2 className="text-3xl font-black text-white mt-3 leading-tight">"Premium Sound. Real Prices."</h2>
                <h3 className="text-sm font-semibold text-rose-300 mt-1">Message from Kodiya Nekara</h3>
              </div>

              <div className="text-xs text-pink-100/90 leading-relaxed font-sans space-y-3.5 border-l-2 border-pink-500 pl-4">
                <p>
                  "Hi everyone! I am Kodiya Nekara, founder of Voltix Pro GH. When I set out to build Ghana's number one premium earpods store, my goal was plain and simple: bringing the absolute best, crystal clear bass and audio technology to every Ghanaian at authentic, fair value prices starting from just Ghc 40!"
                </p>
                <p>
                  "Why pay hundreds of cedis for overpriced products when you can get genuine high fidelity, digital battery LED displays, or active noise cancellation that lasts an entire weekend? Every single pair of earbuds in our warehouse is thoroughly tested under strict quality regulations before getting delivered across Ghana."
                </p>
                <p>
                  "As a proud brand of the 'Trust God Company', we believe in absolute integrity, clean customer service, and solid support. That is why we offer an unconditional 7-Day defection replacement return warranty to guarantee your satisfaction."
                </p>
              </div>

              {/* Founder's Sign-off and contacts */}
              <div className="bg-black/30 rounded-2xl p-4.5 border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase">📞 TALK DIRECTLY TO THE CEO</h4>
                  <p className="text-[10.5px] text-pink-300 mt-1 leading-normal font-medium">Have questions or want bulk purchase pricing discounts?</p>
                </div>

                <a 
                  href="https://wa.me/233536193862" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-green-500/20"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>WHATSAPP KODIYA</span>
                </a>
              </div>

            </section>

          </div>
        )}
        </>
      )}
      </main>

      {/* FOOTER SECTION */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t border-white/10 text-center relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto mb-8">
          
          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <span className="text-xl">💳</span>
            <h4 className="text-xs font-bold text-white uppercase mt-1">MoMo Accepted</h4>
            <p className="text-[11px] text-pink-300/80 mt-1">Accept MTN MoMo, Telecel Cash, Airtel Money, Visa Card and Cash on Delivery.</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <span className="text-xl">🛵</span>
            <h4 className="text-xs font-bold text-white uppercase mt-1">FAST Express Delivery</h4>
            <p className="text-[11px] text-pink-300/80 mt-1">Dispatched from Accra across Greater Accra, Kumasi, Takoradi, Tamale and all-Ghana!</p>
          </div>

          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl">
            <span className="text-xl">🛡️</span>
            <h4 className="text-xs font-bold text-white uppercase mt-1">100% Quality Swap</h4>
            <p className="text-[11px] text-pink-300/80 mt-1">Guaranteed authentic audio. Hassle-free 7-day swap replacement if not content.</p>
          </div>

        </div>

        <p className="text-xs text-pink-300/60 tracking-wider">
          ⚡ Voltix Pro GH 🇬🇭 • voltix-pro-gh.netlify.app • 0536 193 862
        </p>
        <p className="text-[10px] text-neutral-500 mt-2">
          © 2026 Voltix Pro GH. Crafted under the Frosted Glass Theme. A Trust God Company Brand.
        </p>
      </footer>

      {/* FLOATING RETRACTABLE SHOPPING CART DRAWER (For clean intuitive user checkout) */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[50] flex justify-end transition-opacity duration-300">
          
          {/* Backdrop Click close */}
          <div className="absolute inset-0 cursor-pointer" onClick={() => setIsCartOpen(false)} />

          <aside className="relative w-full max-w-md bg-gradient-to-b from-[#250d4a] to-[#0d041e] border-l border-white/15 h-full p-6 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-pink-400" />
                  <span>MoMo Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                </h3>
                <button 
                  id="close-cart-btn"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-pink-300 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Items List scroll holder */}
              {cart.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-3">
                  <div className="text-4xl text-neutral-600">🛒</div>
                  <h4 className="text-xs font-bold text-neutral-400">Your Cart is Empty!</h4>
                  <p className="text-[11px] text-pink-300/80 px-4">Browse our premium earpods and click "ADD TO MOMO CART" to build your custom setup.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 mt-4 max-h-[350px] overflow-y-auto pr-1">
                  {cart.map((item, index) => (
                    <div key={`${item.product.id}-${item.selectedColor}`} className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 items-center">
                      <div className="w-12 h-12 bg-black/40 rounded-lg flex items-center justify-center border border-white/10 flex-shrink-0">
                        <img 
                          src={getProductColorImage(item.product.id, item.selectedColor)} 
                          alt={item.product.name} 
                          className="w-10 h-10 object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.product.name}</h4>
                        <p className="text-[10px] text-pink-300 font-semibold uppercase">{item.selectedColor}</p>
                        <span className="text-[11px] font-black text-rose-300">Ghc {item.product.price} each</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(index, -1)}
                          className="w-6 h-6 rounded bg-white/10 hover:bg-white/15 text-white flex items-center justify-center text-xs cursor-pointer"
                        >
                          -
                        </button>
                        <span className="text-xs font-black text-white font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(index, 1)}
                          className="w-6 h-6 rounded bg-white/10 hover:bg-white/15 text-white flex items-center justify-center text-xs cursor-pointer"
                        >
                          +
                        </button>
                        <button 
                          onClick={() => {
                            const updated = [...cart];
                            updated.splice(index, 1);
                            setCart(updated);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300 ml-1.5 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bill Summary and Checkout details Form */}
            {cart.length > 0 && (
              <div className="border-t border-white/10 pt-4 mt-4">
                
                {/* Promo billing details */}
                <div className="space-y-1.5 text-xs text-pink-200/90 mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between">
                    <span>Retail List price:</span>
                    <span className="line-through">Ghc {getCartTotalOriginal()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-green-400">
                    <span>Direct Shop Savings:</span>
                    <span>-Ghc {getCartTotalOriginal() - getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between font-black text-white border-t border-white/15 pt-1.5 text-sm uppercase">
                    <span>Final Bill:</span>
                    <span className="text-pink-300">Ghc {getCartTotal()}</span>
                  </div>
                </div>

                {/* Localized checkout forms */}
                <form id="checkout-form" onSubmit={handleWhatsAppCheckout} className="space-y-2.5">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">🇬🇭 Streamlined Ghana Delivery details</h4>
                  
                  <div>
                    <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Your Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={orderDetails.customerName}
                      onChange={(e) => setOrderDetails({...orderDetails, customerName: e.target.value})}
                      placeholder="EX: Kofi Mensah"
                      className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Phone Number (MTN / Telecel / Airtel)</label>
                    <input 
                      type="tel" 
                      required
                      value={orderDetails.customerPhone}
                      onChange={(e) => setOrderDetails({...orderDetails, customerPhone: e.target.value})}
                      placeholder="EX: 0536 193 862"
                      className="w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-pink-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Select Delivery Location</label>
                      <select
                        value={orderDetails.deliveryLocation}
                        onChange={(e) => setOrderDetails({...orderDetails, deliveryLocation: e.target.value})}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-2 py-2 text-xs text-white"
                      >
                        <option value="Accra Central (Ghc 20)">Accra Airport / Central (Ghc 20)</option>
                        <option value="Greater Accra Area (Ghc 25)">Greater Accra Area (Ghc 25)</option>
                        <option value="Kumasi Metropolis (Ghc 35)">Kumasi Metropolis (Ghc 35)</option>
                        <option value="Takoradi / Cape Coast (Ghc 40)">Takoradi / Cape Coast (Ghc 40)</option>
                        <option value="Tamale Northern Area (Ghc 50)">Tamale Northern Area (Ghc 50)</option>
                        <option value="Custom Address Delivery via Courier">Other / Custom Courier Location</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold text-neutral-400 uppercase tracking-widest mb-1">Payment Method Type</label>
                      <select
                        value={orderDetails.paymentMethod}
                        onChange={(e: any) => setOrderDetails({...orderDetails, paymentMethod: e.target.value})}
                        className="w-full bg-black/50 border border-white/15 rounded-lg px-2 py-2 text-xs text-white"
                      >
                        <option value="MTN MoMo">MTN MoMo Wallet</option>
                        <option value="Telecel Cash">Telecel Cash</option>
                        <option value="Airtel Money">Airtel Money</option>
                        <option value="Visa Card">Visa / Mastercard Credit</option>
                        <option value="Cash on Delivery">Cash on Delivery</option>
                      </select>
                    </div>
                  </div>

                  {orderSubmitted ? (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-center">
                      <p className="text-xs font-bold text-green-400 animate-pulse">{submittedMessage}</p>
                    </div>
                  ) : orderDetails.paymentMethod === 'Cash on Delivery' ? (
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:brightness-110 text-white rounded-xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-white fill-white" />
                      <span>ORDER VIA WHATSAPP (CASH ON DELIVERY)</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110 text-white rounded-xl text-xs font-black tracking-widest uppercase flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-white" />
                      <span>SECURE MOMO / CARD PAYMENT (Ghc {getCartTotal() + getDeliveryCost(orderDetails.deliveryLocation)})</span>
                    </button>
                  )}
                </form>

              </div>
            )}
          </aside>

        </div>
      )}

      {/* SECURE PREMIUM PAYSTACK BILLING MODAL OVERLAY */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1b083d] to-[#04010a] border border-pink-500/30 rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-2xl shadow-pink-500/20 max-h-[90vh] overflow-y-auto">
            
            {/* Padlock Encrypted Premium Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">Secure Checkout Console</h3>
                  <p className="text-[9px] text-pink-300 font-semibold uppercase tracking-widest">Powered by Paystack & MoMo Hub</p>
                </div>
              </div>
              
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-pink-300 hover:text-white transition-colors cursor-pointer text-xs"
              >
                ✕ Close
              </button>
            </div>

            {/* Error alerts if payment status changes */}
            {paymentStatus === 'failed' && (
              <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-3 flex gap-2.5 items-center">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="text-xs font-black text-white uppercase">Transaction Failed</h4>
                  <p className="text-[10px] text-red-300 mt-0.5">Please check your wallet balance and try again, or switch to Cash on Delivery.</p>
                </div>
              </div>
            )}

            {/* Step-by-step custom status */}
            {paymentStatus === 'processing' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Awaiting MoMo Confirmation</h4>
                  <p className="text-xs text-pink-300 max-w-xs mt-1">Please authorize the prompt on your mobile phone or complete checkout in the secure Paystack popup window.</p>
                </div>
              </div>
            ) : paymentStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-green-500/10 border-2 border-green-500 rounded-full flex items-center justify-center text-green-400 animate-bounce">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Payment Success!</h4>
                  <p className="text-xs text-green-400 font-bold max-w-xs mt-1">Ghc {getCartTotal() + getDeliveryCost(orderDetails.deliveryLocation)} paid securely via Paystack.</p>
                  <p className="text-[10px] text-neutral-400 mt-2">Redirecting to WhatsApp to submit details...</p>
                </div>
              </div>
            ) : (
              // Idle checkout review content
              <>
                {/* Details list */}
                <div>
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Delivery & Customer Summary</h4>
                  <div className="bg-white/5 border border-white/5 p-3.5 rounded-2xl grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase">Customer Name</span>
                      <span className="font-bold text-white block truncate">{orderDetails.customerName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase">Mobile Number</span>
                      <span className="font-mono text-white block truncate">{orderDetails.customerPhone}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase">Delivery Area</span>
                      <span className="font-semibold text-white block truncate">{orderDetails.deliveryLocation}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block text-[9px] uppercase">Chosen Method</span>
                      <span className="text-pink-300 font-black block truncate">{orderDetails.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Items Summaries */}
                <div>
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Review Items (Qty: {cart.reduce((sum, item) => sum + item.quantity, 0)})</h4>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-3 space-y-2 max-h-36 overflow-y-auto">
                    {cart.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center justify-between text-xs text-neutral-200">
                        <div className="flex gap-2 items-center min-w-0">
                          <span className="bg-white/10 border border-white/10 w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] text-pink-300 shrink-0">
                            {item.quantity}
                          </span>
                          <span className="truncate font-semibold text-white">{item.product.name}</span>
                          <span className="text-[10px] font-bold text-neutral-400">({item.selectedColor})</span>
                        </div>
                        <span className="font-mono text-pink-200 shrink-0">Ghc {item.product.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itemized Billing details */}
                <div className="border-t border-white/10 pt-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between text-neutral-300">
                    <span>Retail Items Subtotal:</span>
                    <span className="font-mono">Ghc {getCartTotal()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-300">
                    <span>Express Delivery Service:</span>
                    <span className="font-mono">Ghc {getDeliveryCost(orderDetails.deliveryLocation)}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/15 pt-2 text-sm font-black text-white uppercase">
                    <span>Total Amount Due:</span>
                    <span className="text-yellow-400 font-mono text-base">Ghc {getCartTotal() + getDeliveryCost(orderDetails.deliveryLocation)}</span>
                  </div>
                </div>

                {/* Secure checkout info copy */}
                <div className="text-[10px] text-neutral-400 border border-white/10 bg-white/5 rounded-2xl p-3 space-y-1 leading-normal">
                  <p className="font-bold text-neutral-300 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-pink-400 inline" />
                    Secure Local Ghana MoMo Integration
                  </p>
                  <p>When you click the button below, Paystack's encrypted Ghana gateway overlay will launch. Complete the MoMo authorization to proceed.</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="flex-shrink-0 px-4 py-3 border border-white/10 rounded-xl text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setPaymentStatus('processing');
                      
                      const customerEmail = `${orderDetails.customerName.replace(/\s+/g, '').toLowerCase() || 'customer'}_checkout@voltixpro.com`;
                      const grandTotal = getCartTotal() + getDeliveryCost(orderDetails.deliveryLocation);

                      openPaystackPayment({
                        email: customerEmail,
                        amount: grandTotal,
                        ref: generatedRef,
                        onSuccess: (finalRef) => {
                          setPaymentStatus('success');

                          // Complete purchase details
                          const itemsStr = cart.map(item => {
                            return `• ${item.product.name} [Color: ${item.selectedColor}] (Qty: ${item.quantity}) - Ghc ${item.product.price * item.quantity}`;
                          }).join('\n');

                          const customText = tabAndEngravingMessage();
                          const message = `⚡ *VOLTIX PRO GH ORDER* 🇬🇭\n` +
                            `---------------------------------------\n` +
                            `*Order Reference:* #${finalRef}\n` +
                            `*Customer:* ${orderDetails.customerName}\n` +
                            `*Phone:* ${orderDetails.customerPhone}\n` +
                            `*Location:* ${orderDetails.deliveryLocation}\n` +
                            `*Payment Method:* ${orderDetails.paymentMethod}\n` +
                            `*Payment Status:* PAID (via Paystack) ✅\n` +
                            `---------------------------------------\n` +
                            `*Ordered Items:*\n${itemsStr}\n` +
                            (customText ? `\n*Custom Lab Request:*\n${customText}` : '') +
                            `---------------------------------------\n` +
                            `*Subtotal:* Ghc ${getCartTotal()}\n` +
                            `*Delivery:* Ghc ${getDeliveryCost(orderDetails.deliveryLocation)}\n` +
                            `*Grand Total Paid:* Ghc ${grandTotal}\n` +
                            `---------------------------------------\n` +
                            `Thank you for your support. A Trust God Company Brand! 🙏✨`;

                          const encoded = encodeURIComponent(message);
                          const whatsappUrl = `https://wa.me/233356193862?text=${encoded}`;

                          setConfirmedOrder({
                            reference: finalRef,
                            items: [...cart],
                            total: grandTotal,
                            paymentMethod: orderDetails.paymentMethod,
                            customerName: orderDetails.customerName,
                            customerPhone: orderDetails.customerPhone,
                            deliveryLocation: orderDetails.deliveryLocation
                          });

                          setTimeout(() => {
                            window.open(whatsappUrl, '_blank');
                            setCart([]);
                            setPaymentStatus('idle');
                            setIsPaymentModalOpen(false);
                            setIsCartOpen(false);
                            setShowConfirmationPage(true);
                          }, 1500);
                        },
                        onCancel: () => {
                          setPaymentStatus('idle');
                        }
                      });
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:brightness-110 text-white font-black text-xs tracking-widest uppercase rounded-xl shadow-lg shadow-pink-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ PAY NOW (Ghc {getCartTotal() + getDeliveryCost(orderDetails.deliveryLocation)})</span>
                  </button>
                </div>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
