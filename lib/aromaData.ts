// Curated Luxury Fragrances and Aroma Brand Presets
export interface Fragrance {
  id: string
  name: string
  slug: string
  subtitle: string
  category: string
  concentration: 'Extrait de Parfum' | 'Eau de Parfum' | 'Parfum Cologne'
  concentration_pct: number
  price: number
  compare_price?: number
  volume_ml: number
  volume_options: number[]
  gender: 'Unisex' | 'Pour Homme' | 'Pour Femme'
  image_url: string
  gallery: string[]
  description: string
  fragrance_notes: string
  notes_top: string[]
  notes_heart: string[]
  notes_base: string[]
  longevity: string // e.g. "14+ Hours"
  sillage: 'Moderate' | 'Strong' | 'Intense / Enormous'
  season: string
  is_featured: boolean
  is_best_seller: boolean
  rating: number
  reviews_count: number
  stock: number
}

export const AROMA_FRAGRANCES: Fragrance[] = [
  {
    id: 'prod-1',
    name: 'Ceylon Royal Oud',
    slug: 'ceylon-royal-oud',
    subtitle: 'Distilled Wild Agarwood & Ceylon Cinnamon',
    category: 'Oud & Woody',
    concentration: 'Extrait de Parfum',
    concentration_pct: 35,
    price: 18500,
    compare_price: 22000,
    volume_ml: 50,
    volume_options: [10, 50, 100],
    gender: 'Unisex',
    image_url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=85'
    ],
    description: 'An opulent symphony of sustainably harvested Ceylon Agarwood aged for 12 years, enveloped by sun-dried organic Ceylon cinnamon quills, dark Sumatran patchouli, and warm smoked amber.',
    fragrance_notes: 'Top: Bergamot, Pink Pepper | Heart: Ceylon Cinnamon, Taif Rose | Base: Aged Oud, Amber, Vetiver',
    notes_top: ['Calabrian Bergamot', 'Pink Peppercorn', 'Bitter Orange'],
    notes_heart: ['Ceylon Cinnamon Bark', 'Taif Rose', 'Nutmeg', 'Smoked Cardamom'],
    notes_base: ['12-Year Aged Agarwood Oud', 'Golden Ambergris', 'Haitian Vetiver', 'Dark Patchouli'],
    longevity: '16+ Hours',
    sillage: 'Intense / Enormous',
    season: 'Evening & All Seasons',
    is_featured: true,
    is_best_seller: true,
    rating: 4.95,
    reviews_count: 142,
    stock: 28
  },
  {
    id: 'prod-2',
    name: 'Midnight Cinnamon Noir',
    slug: 'midnight-cinnamon-noir',
    subtitle: 'Artisanal Spice Island Reserve',
    category: 'Warm Spices',
    concentration: 'Extrait de Parfum',
    concentration_pct: 32,
    price: 16500,
    compare_price: 19500,
    volume_ml: 50,
    volume_options: [10, 50, 100],
    gender: 'Unisex',
    image_url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=85'
    ],
    description: 'A dark, seductive nocturnal elixir highlighting the golden spice of Sri Lanka. Hand-distilled Ceylon cinnamon absolute enriched with French black rose, bourbon vanilla, and dark roasted tonka bean.',
    fragrance_notes: 'Top: Cardamom, Saffron | Heart: Ceylon Cinnamon Quill, Black Rose | Base: Smoked Vanilla, Tonka, Cedarwood',
    notes_top: ['Green Cardamom', 'Persian Saffron', 'Wild Plum'],
    notes_heart: ['Organic Cinnamon Absolute', 'Velvet Black Rose', 'Clove Bud'],
    notes_base: ['Madagascar Bourbon Vanilla', 'Roasted Tonka Bean', 'Atlas Cedarwood'],
    longevity: '14+ Hours',
    sillage: 'Strong',
    season: 'Autumn / Winter / Nights',
    is_featured: true,
    is_best_seller: true,
    rating: 4.9,
    reviews_count: 98,
    stock: 34
  },
  {
    id: 'prod-3',
    name: 'Aqua de Ceylon',
    slug: 'aqua-de-ceylon',
    subtitle: 'Indian Ocean Breeze & Driftwood',
    category: 'Fresh Aquatic',
    concentration: 'Eau de Parfum',
    concentration_pct: 25,
    price: 13500,
    compare_price: 15500,
    volume_ml: 50,
    volume_options: [10, 50, 100],
    gender: 'Unisex',
    image_url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&auto=format&fit=crop&q=85'
    ],
    description: 'Inspired by sunrise on the southern coastline of Mirissa. Crisp sea spray, crushed green bergamot, mineral ambergris, and sun-bleached coastal driftwood for unmatched tropical freshness.',
    fragrance_notes: 'Top: Ocean Mist, Bergamot | Heart: Marine Salt, Crushed Sage | Base: Driftwood, White Ambergris, Musk',
    notes_top: ['Indian Ocean Spray', 'Crushed Bergamot', 'Mandarin Leaf'],
    notes_heart: ['Marine Salt accord', 'Clary Sage', 'Water Lily'],
    notes_base: ['Sun-bleached Driftwood', 'White Ambergris', 'Clean Musk'],
    longevity: '10+ Hours',
    sillage: 'Moderate',
    season: 'Spring / Summer / Day',
    is_featured: true,
    is_best_seller: false,
    rating: 4.88,
    reviews_count: 67,
    stock: 45
  },
  {
    id: 'prod-4',
    name: 'Ceylon Santal 33',
    slug: 'ceylon-santal-33',
    subtitle: 'Creamy Sri Lankan Sandalwood & Cardamom',
    category: 'Oud & Woody',
    concentration: 'Extrait de Parfum',
    concentration_pct: 30,
    price: 17500,
    compare_price: 20000,
    volume_ml: 50,
    volume_options: [10, 50, 100],
    gender: 'Unisex',
    image_url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800&auto=format&fit=crop&q=85',
    gallery: [],
    description: 'Sublime, creamy Mysore & Ceylon sandalwood warmed with roasted cardamom pods, dry papyrus, leather, and powdery violet leaves.',
    fragrance_notes: 'Top: Cardamom, Violet | Heart: Iris, Papyrus, Leather | Base: Sri Lankan Sandalwood, Cedar, Amber',
    notes_top: ['Violet Leaf', 'Ceylon Green Cardamom'],
    notes_heart: ['Florentine Iris', 'Egyptian Papyrus', 'Smoked Leather'],
    notes_base: ['Artisanal Sandalwood', 'Virginia Cedar', 'Cashmere Wood'],
    longevity: '14+ Hours',
    sillage: 'Strong',
    season: 'Year-Round Signature',
    is_featured: false,
    is_best_seller: true,
    rating: 4.92,
    reviews_count: 110,
    stock: 19
  },
  {
    id: 'prod-5',
    name: 'Golden Ambergris Extrait',
    slug: 'golden-ambergris-extrait',
    subtitle: 'Warm Solar Amber & Bourbon Vanilla',
    category: 'Amber Gourmand',
    concentration: 'Extrait de Parfum',
    concentration_pct: 35,
    price: 19000,
    compare_price: 23000,
    volume_ml: 50,
    volume_options: [10, 50, 100],
    gender: 'Pour Femme',
    image_url: 'https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&auto=format&fit=crop&q=85',
    gallery: [],
    description: 'A luminous, radiant oriental masterwork. Golden solar amber infused with warm honey nectar, scorched vanilla pod, and powdery almond blossom.',
    fragrance_notes: 'Top: Sweet Almond, Mandarin | Heart: Orange Blossom, Honey Nectar | Base: Golden Ambergris, Benzoin, Vanilla',
    notes_top: ['Sweet Almond Blossom', 'Blood Mandarin'],
    notes_heart: ['Wild Forest Honey', 'Tunisian Orange Blossom', 'Heliotrope'],
    notes_base: ['Golden Ambergris', 'Siamese Benzoin', 'Scorched Vanilla Pod'],
    longevity: '15+ Hours',
    sillage: 'Intense / Enormous',
    season: 'Evenings & Celebrations',
    is_featured: true,
    is_best_seller: false,
    rating: 4.96,
    reviews_count: 53,
    stock: 22
  },
  {
    id: 'prod-6',
    name: 'Discovery Coffret (5 x 10ml)',
    slug: 'discovery-coffret-set',
    subtitle: 'The Complete Luxury Flight',
    category: 'Discovery Sets',
    concentration: 'Extrait de Parfum',
    concentration_pct: 32,
    price: 12500,
    compare_price: 16000,
    volume_ml: 50,
    volume_options: [50],
    gender: 'Unisex',
    image_url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=85',
    gallery: [],
    description: 'Experience the entire Aroma fine fragrance collection in travel-ready atomizers: Royal Oud, Cinnamon Noir, Aqua de Ceylon, Santal, and Golden Ambergris. Includes an LKR 3,000 voucher towards a full-size bottle.',
    fragrance_notes: 'Includes 5 bespoke 10ml Extrait de Parfum travel sprays + Discovery Guide + Voucher',
    notes_top: ['Assorted Flight'],
    notes_heart: ['5 Master Blends'],
    notes_base: ['High-Concentration Extraits'],
    longevity: 'All Day',
    sillage: 'Moderate',
    season: 'Gifting & Discovery',
    is_featured: true,
    is_best_seller: true,
    rating: 5.0,
    reviews_count: 215,
    stock: 40
  }
]

export const FRAGRANCE_CATEGORIES = [
  'All',
  'Oud & Woody',
  'Warm Spices',
  'Fresh Aquatic',
  'Amber Gourmand',
  'Discovery Sets'
]

export const ANNOUNCEMENT_MESSAGES = [
  '✦ COMPLIMENTARY EXPRESS DELIVERY ON ALL ORDERS OVER LKR 10,000 ISLAND-WIDE ✦',
  '✦ 2 FREE BESPOKE 3ML SAMPLES INCLUDED WITH EVERY FULL-SIZE BOTTLE ✦',
  '✦ HAND-CRAFTED & DISTILLED IN COLOMBO, SRI LANKA · 100% CRUELTY-FREE ✦'
]

export const TESTIMONIALS = [
  {
    name: 'Dr. Shanil Wickramasinghe',
    location: 'Colombo 07',
    scent: 'Ceylon Royal Oud (Extrait)',
    rating: 5,
    review: 'The longevity is unlike anything else available in Sri Lanka. 14 hours after application I was still receiving compliments during a dinner reception. True international niche quality with genuine Ceylon spice character.',
    date: '2 days ago'
  },
  {
    name: 'Kavindi Senaratne',
    location: 'Kandy',
    scent: 'Midnight Cinnamon Noir',
    rating: 5,
    review: 'Pure luxury from the presentation box to the drydown. The cinnamon is genuine and warm, not synthetic like mass-market designer perfumes. My new signature scent.',
    date: '1 week ago'
  },
  {
    name: 'Thilina Perera',
    location: 'Galle Fort',
    scent: 'Aqua de Ceylon',
    rating: 5,
    review: 'The perfect aquatic for our tropical heat. Stays vibrant and fresh in high humidity without breaking down. Beautiful bottle design too.',
    date: '2 weeks ago'
  }
]
