import { Product } from '../types';

// Importing assets to let Vite resolve them perfectly in BOTH dev and production environments
import berlinProImg from '../assets/images/berlin_pro_1780218483955.png';
import ultrapodsMaxImg from '../assets/images/ultrapods_max_1780218465012.png';
import sporthookEliteImg from '../assets/images/sporthook_elite_1780218501711.png';
import ringclipProImg from '../assets/images/ringclip_pro_1780221557003.png';
import prosuiteBundleImg from '../assets/images/prosuite_bundle_1780221578997.png';

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'berlin-open-ear-pro',
    name: 'Berlin Open-Ear Pro',
    description: 'Futuristic open-ear design with robot charging case. 5-year warranty. Bluetooth 5.4 chip.',
    price: 130,
    originalPrice: 180,
    batteryLife: '36 Hours Gym Endurance',
    hasLeds: false,
    image: berlinProImg,
    colors: ['Robot Grey', 'Studio White'],
    features: [
      'Futuristic open-ear design for zero pressure wear',
      'Cool robotic theme charging case with interactive status',
      'Industry-leading 5-year warranty for full peace of mind',
      'Advanced high speed Bluetooth 5.4 wireless protocol chip'
    ],
    badge: 'Hot Deal',
    isPromo: true
  },
  {
    id: 'ultrapods-max-white',
    name: 'Ultrapods Max - White',
    description: 'Transparent case with LED display. Noise cancelling. Hi-Res audio. Bluetooth 5.3.',
    price: 120,
    originalPrice: 160,
    batteryLife: '32 Hours Total Playback',
    hasLeds: true,
    image: ultrapodsMaxImg,
    colors: ['Sleek White'],
    features: [
      'Smart transparent glass theme charging case',
      'Clear digital LED battery level percentage status',
      'High-performance active noise cancellation (ANC)',
      'Certified Hi-Res lossless acoustic sound signature'
    ],
    isPromo: true
  },
  {
    id: 'ultrapods-max-blue',
    name: 'Ultrapods Max - Blue',
    description: 'Sky blue color. Transparent LED case. Noise cancelling. Hi-Res audio. Bluetooth 5.3.',
    price: 120,
    originalPrice: 160,
    batteryLife: '32 Hours Total Playback',
    hasLeds: true,
    image: ultrapodsMaxImg,
    colors: ['Sky Blue'],
    features: [
      'Bright and vibrant sky blue premium coloring',
      'Self-charging transparent LED battery power panel',
      'Intelligent digital audio noise cancelling response',
      'Dual-mic HD call streaming and high stability'
    ],
    isPromo: true
  },
  {
    id: 'ultrapods-max-black',
    name: 'Ultrapods Max - Black',
    description: 'Smoked black case. Noise cancelling. Hi-Res audio. Bluetooth 5.3.',
    price: 120,
    originalPrice: 160,
    batteryLife: '32 Hours Total Playback',
    hasLeds: true,
    image: ultrapodsMaxImg,
    colors: ['Smoked Black'],
    features: [
      'Chic dark smoked black transparent case shell',
      'Acoustic surround sound channels for great depth',
      'Optimized digital noise reduction technology',
      'Low latency Bluetooth 5.3 gaming transmission'
    ],
    badge: 'Best Seller',
    isPromo: true
  },
  {
    id: 'ringclip-pro-black',
    name: 'RingClip Pro - Black',
    description: 'Lightweight ring-clip ear hook. Perfect for calls. Bluetooth 5.2. Best value.',
    price: 40,
    originalPrice: 65,
    batteryLife: '24 Hours Total Playback',
    hasLeds: false,
    image: ringclipProImg,
    colors: ['Carbon Black'],
    features: [
      'Zero fatigue clip-on ear cartilage styling design',
      'Featherlight weight for long duration comfort calls',
      'Ultra low power consuming bluetooth 5.2 engine',
      'Superior budget value representing incredible quality'
    ],
    badge: 'Best Value',
    isPromo: true
  },
  {
    id: 'ringclip-pro-white',
    name: 'RingClip Pro - White',
    description: 'White ring-clip ear hook. Perfect for calls. Bluetooth 5.2. Best value.',
    price: 40,
    originalPrice: 65,
    batteryLife: '24 Hours Total Playback',
    hasLeds: false,
    image: ringclipProImg,
    colors: ['Pearl White'],
    features: [
      'Stunning pearl white polished cosmetic look',
      'Safe open surroundings awareness while commuting',
      'Dual active mics with smart echo reduction logic',
      'Secure hold posture perfectly suited for daily runs'
    ],
    badge: 'Best Value',
    isPromo: true
  },
  {
    id: 'sporthook-elite',
    name: 'SportHook Elite',
    description: 'Over-ear sport hooks. 48 hour battery. LED mirror case. IPX6 sweat proof. Premium.',
    price: 220,
    originalPrice: 290,
    batteryLife: '48 Hours Sports Beast',
    hasLeds: true,
    image: sporthookEliteImg,
    colors: ['Matrix Black', 'Cloud White'],
    features: [
      'Heavy duty over-ear sports active retention bands',
      'Gigantic 48-hour combined play time endurance',
      'Stunning built-in LED mirror face charging base',
      'IPX6 certified total water and sweat safety'
    ],
    badge: 'Premium',
    isPromo: true
  },
  {
    id: 'prosuite-bundle',
    name: 'ProSuite Bundle',
    description: '6 earbud styles in one box. LED display case. Noise cancelling. Perfect gift.',
    price: 220,
    originalPrice: 300,
    batteryLife: '50 Hours Multi-Pack Power',
    hasLeds: true,
    image: prosuiteBundleImg,
    colors: ['Multi-Style Prism Pack'],
    features: [
      '6 distinct premium earbud wearing styles included',
      'Main shared modern LED power battery block case',
      'Acoustic noise blocking filtering for premium calls',
      'Makes the perfect high-class gift for audio lovers'
    ],
    isPromo: true
  }
];
