// Full configurations for all 57 Supabase tables
export const TABLE_CATEGORIES = {
  ECOMMERCE: 'E-Commerce & Catalog',
  CONTENT: 'Content & CMS',
  SETTINGS: 'Store & Site Settings',
  USERS_LOGS: 'Users, Sessions & Logs',
  AI_BOTS: 'AI & Chatbot'
}

export const TABLES = [
  // --- E-COMMERCE & CATALOG ---
  {
    table: 'products',
    slug: 'products',
    name: 'Products',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Package',
    description: 'Manage fragrance catalog, pricing, variants, and stock',
    fields: [
      { key: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Royal Oud Eau De Parfum', required: true },
      { key: 'slug', label: 'Slug', type: 'text', placeholder: 'royal-oud-edp' },
      { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Fragrance notes and details...' },
      { key: 'price', label: 'Price (LKR)', type: 'number', placeholder: '4500', required: true },
      { key: 'compare_price', label: 'Compare at Price (LKR)', type: 'number', placeholder: '5500' },
      { key: 'cost_price', label: 'Cost Price (LKR)', type: 'number', placeholder: '2200' },
      { key: 'stock', label: 'Inventory Stock', type: 'number', placeholder: '50' },
      { key: 'sku', label: 'SKU', type: 'text', placeholder: 'ARM-ROYAL-50' },
      { key: 'barcode', label: 'Barcode', type: 'text', placeholder: '793573194821' },
      { key: 'category_id', label: 'Category ID / Name', type: 'text', placeholder: 'Men / Unisex' },
      { key: 'type_id', label: 'Product Type', type: 'text', placeholder: 'Eau de Parfum / Extrait' },
      { key: 'image_url', label: 'Primary Image URL', type: 'image', placeholder: 'https://...' },
      { key: 'volume_ml', label: 'Volume (ml)', type: 'number', placeholder: '50' },
      { key: 'fragrance_notes', label: 'Fragrance Notes', type: 'text', placeholder: 'Top: Bergamot, Heart: Rose, Base: Amber' },
      { key: 'is_active', label: 'Active in Store', type: 'boolean', defaultValue: true },
      { key: 'is_featured', label: 'Featured on Homepage', type: 'boolean', defaultValue: false }
    ]
  },
  {
    table: 'product_images',
    slug: 'product-images',
    name: 'Product Images',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Image',
    description: 'Gallery photos and angles for products',
    fields: [
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'image_url', label: 'Image URL', type: 'image', required: true },
      { key: 'alt_text', label: 'Alt Text', type: 'text', placeholder: 'Bottle view' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_primary', label: 'Is Primary Cover', type: 'boolean', defaultValue: false }
    ]
  },
  {
    table: 'product_variants',
    slug: 'variants',
    name: 'Product Variants',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Layers',
    description: 'Sizes, concentrations, and bottle volume options',
    fields: [
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'title', label: 'Variant Title', type: 'text', placeholder: '50ml Spray / 100ml Tester', required: true },
      { key: 'sku', label: 'Variant SKU', type: 'text', placeholder: 'ARM-ROYAL-100' },
      { key: 'price', label: 'Price (LKR)', type: 'number', required: true },
      { key: 'compare_price', label: 'Compare Price', type: 'number' },
      { key: 'stock', label: 'Stock Count', type: 'number', defaultValue: 10 },
      { key: 'volume_ml', label: 'Volume (ml)', type: 'number', placeholder: '100' },
      { key: 'image_url', label: 'Variant Image URL', type: 'image' },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'product_types',
    slug: 'product-types',
    name: 'Product Types',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Tag',
    description: 'Perfume classifications (Eau de Parfum, Cologne, Attar)',
    fields: [
      { key: 'name', label: 'Type Name', type: 'text', placeholder: 'Eau De Parfum (EDP)', required: true },
      { key: 'slug', label: 'Slug', type: 'text', placeholder: 'eau-de-parfum' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'categories',
    slug: 'categories',
    name: 'Categories',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Folder',
    description: 'Fragrance families: Floral, Oriental, Woody, Fresh, etc.',
    fields: [
      { key: 'name', label: 'Category Name', type: 'text', placeholder: 'Woody & Smoky', required: true },
      { key: 'slug', label: 'Slug', type: 'text', placeholder: 'woody-smoky' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image_url', label: 'Category Banner Image', type: 'image' },
      { key: 'parent_id', label: 'Parent Category ID', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'collections',
    slug: 'collections',
    name: 'Collections',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Boxes',
    description: 'Curated sets: Summer Sensations, Premium Reserve, Gift Sets',
    fields: [
      { key: 'title', label: 'Collection Title', type: 'text', placeholder: 'Private Reserve 2026', required: true },
      { key: 'slug', label: 'Slug', type: 'text', placeholder: 'private-reserve' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'image_url', label: 'Thumbnail Image URL', type: 'image' },
      { key: 'banner_url', label: 'Hero Banner Image URL', type: 'image' },
      { key: 'is_featured', label: 'Featured on Home', type: 'boolean', defaultValue: false },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'collection_products',
    slug: 'collection-products',
    name: 'Collection Products',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Link',
    description: 'Assign products to specific collections',
    fields: [
      { key: 'collection_id', label: 'Collection ID', type: 'text', required: true },
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'sort_order', label: 'Display Order', type: 'number', defaultValue: 0 }
    ]
  },
  {
    table: 'orders',
    slug: 'orders',
    name: 'Orders',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'ShoppingCart',
    description: 'Customer purchases, fulfillment and payment tracking',
    fields: [
      { key: 'order_number', label: 'Order Number', type: 'text', placeholder: 'ARM-1001', required: true },
      { key: 'customer_name', label: 'Customer Name', type: 'text' },
      { key: 'customer_email', label: 'Customer Email', type: 'text', required: true },
      { key: 'customer_phone', label: 'Phone Number', type: 'text' },
      { key: 'total', label: 'Total Amount (LKR)', type: 'number', required: true },
      { key: 'subtotal', label: 'Subtotal (LKR)', type: 'number' },
      { key: 'discount', label: 'Discount Amount', type: 'number', defaultValue: 0 },
      { key: 'shipping_fee', label: 'Shipping Fee', type: 'number', defaultValue: 350 },
      { key: 'status', label: 'Order Status', type: 'select', options: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], defaultValue: 'pending' },
      { key: 'payment_status', label: 'Payment Status', type: 'select', options: ['unpaid', 'paid', 'refunded', 'failed'], defaultValue: 'unpaid' },
      { key: 'payment_method', label: 'Payment Method', type: 'text', placeholder: 'Cash on Delivery / Card' },
      { key: 'shipping_address', label: 'Shipping Address', type: 'textarea' },
      { key: 'notes', label: 'Customer / Admin Notes', type: 'textarea' }
    ]
  },
  {
    table: 'order_items',
    slug: 'order-items',
    name: 'Order Items',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'ClipboardList',
    description: 'Individual line items inside an order',
    fields: [
      { key: 'order_id', label: 'Order ID', type: 'text', required: true },
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'product_name', label: 'Product Name', type: 'text' },
      { key: 'variant_id', label: 'Variant ID', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number', defaultValue: 1, required: true },
      { key: 'unit_price', label: 'Unit Price (LKR)', type: 'number', required: true },
      { key: 'total_price', label: 'Total Price (LKR)', type: 'number' }
    ]
  },
  {
    table: 'carts',
    slug: 'carts',
    name: 'Carts',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'ShoppingBag',
    description: 'Active shopping carts and abandoned cart recovery',
    fields: [
      { key: 'customer_id', label: 'Customer ID', type: 'text' },
      { key: 'session_id', label: 'Session Token / ID', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'converted', 'abandoned'], defaultValue: 'active' },
      { key: 'total', label: 'Estimated Total', type: 'number', defaultValue: 0 },
      { key: 'item_count', label: 'Item Count', type: 'number', defaultValue: 0 }
    ]
  },
  {
    table: 'cart_items',
    slug: 'cart-items',
    name: 'Cart Items',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'ShoppingBasket',
    description: 'Items waiting in customer carts',
    fields: [
      { key: 'cart_id', label: 'Cart ID', type: 'text', required: true },
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'variant_id', label: 'Variant ID', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number', defaultValue: 1, required: true },
      { key: 'unit_price', label: 'Price (LKR)', type: 'number' }
    ]
  },
  {
    table: 'wishlists',
    slug: 'wishlists',
    name: 'Wishlists',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Heart',
    description: 'Customer saved favorite fragrances',
    fields: [
      { key: 'customer_id', label: 'Customer ID / Email', type: 'text', required: true },
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'created_at', label: 'Added Date', type: 'text' }
    ]
  },
  {
    table: 'coupons',
    slug: 'coupons',
    name: 'Coupons',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Ticket',
    description: 'Discount codes and promotional vouchers',
    fields: [
      { key: 'code', label: 'Coupon Code', type: 'text', placeholder: 'AROMA10', required: true },
      { key: 'description', label: 'Description', type: 'text', placeholder: '10% off launch celebration' },
      { key: 'discount_type', label: 'Discount Type', type: 'select', options: ['percentage', 'fixed_amount'], defaultValue: 'percentage' },
      { key: 'discount_value', label: 'Discount Value (% or LKR)', type: 'number', required: true },
      { key: 'min_spend', label: 'Minimum Spend (LKR)', type: 'number', defaultValue: 0 },
      { key: 'max_discount', label: 'Maximum Discount (LKR)', type: 'number' },
      { key: 'usage_limit', label: 'Total Usage Limit', type: 'number', defaultValue: 100 },
      { key: 'usage_count', label: 'Used Count', type: 'number', defaultValue: 0 },
      { key: 'valid_from', label: 'Valid From', type: 'text', placeholder: 'YYYY-MM-DD' },
      { key: 'valid_until', label: 'Valid Until', type: 'text', placeholder: 'YYYY-MM-DD' },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'payment_methods',
    slug: 'payments',
    name: 'Payment Methods',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'CreditCard',
    description: 'Gateways: COD, Bank Transfer, PayHere, Stripe, Koko',
    fields: [
      { key: 'name', label: 'Method Name', type: 'text', placeholder: 'Cash on Delivery (COD)', required: true },
      { key: 'code', label: 'Method Code', type: 'text', placeholder: 'cod' },
      { key: 'description', label: 'Customer Description', type: 'textarea' },
      { key: 'instructions', label: 'Checkout Instructions', type: 'textarea' },
      { key: 'icon_url', label: 'Icon URL', type: 'image' },
      { key: 'extra_fee', label: 'Processing Fee (LKR)', type: 'number', defaultValue: 0 },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'delivery_settings',
    slug: 'delivery',
    name: 'Delivery Settings',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Truck',
    description: 'Courier options, shipping rates, and delivery zones',
    fields: [
      { key: 'method_name', label: 'Delivery Method', type: 'text', placeholder: 'Standard Islandwide Courier', required: true },
      { key: 'fee', label: 'Delivery Fee (LKR)', type: 'number', defaultValue: 350, required: true },
      { key: 'estimated_days', label: 'Estimated Days', type: 'text', placeholder: '2 - 3 business days' },
      { key: 'free_shipping_threshold', label: 'Free Shipping Over (LKR)', type: 'number', placeholder: '10000' },
      { key: 'areas_covered', label: 'Areas Covered', type: 'text', placeholder: 'Western Province / Islandwide' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'costs',
    slug: 'costs',
    name: 'Costs',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'Coins',
    description: 'Operational expenses, packaging, fragrance oils, bottles',
    fields: [
      { key: 'title', label: 'Expense Title', type: 'text', placeholder: 'Bottles 50ml batch import', required: true },
      { key: 'category', label: 'Cost Category', type: 'select', options: ['Packaging', 'Raw Materials', 'Marketing', 'Delivery', 'Operations', 'Other'], defaultValue: 'Raw Materials' },
      { key: 'amount', label: 'Amount (LKR)', type: 'number', required: true },
      { key: 'currency', label: 'Currency', type: 'text', defaultValue: 'LKR' },
      { key: 'incurred_date', label: 'Date', type: 'text', placeholder: 'YYYY-MM-DD' },
      { key: 'reference_id', label: 'Invoice / Receipt Ref', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'textarea' }
    ]
  },
  {
    table: 'commissions',
    slug: 'commissions',
    name: 'Commissions',
    category: TABLE_CATEGORIES.ECOMMERCE,
    icon: 'BadgePercent',
    description: 'Influencer and affiliate referral commissions',
    fields: [
      { key: 'affiliate_name', label: 'Affiliate / Creator Name', type: 'text', required: true },
      { key: 'affiliate_email', label: 'Email', type: 'text' },
      { key: 'order_id', label: 'Associated Order ID', type: 'text' },
      { key: 'rate_percentage', label: 'Commission Rate (%)', type: 'number', defaultValue: 10 },
      { key: 'commission_amount', label: 'Commission Amount (LKR)', type: 'number', required: true },
      { key: 'status', label: 'Payout Status', type: 'select', options: ['pending', 'approved', 'paid', 'declined'], defaultValue: 'pending' },
      { key: 'paid_at', label: 'Paid At Date', type: 'text' }
    ]
  },

  // --- CONTENT & CMS ---
  {
    table: 'hero_sections',
    slug: 'hero',
    name: 'Hero Sections',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Sliders',
    description: 'Homepage high-impact slideshow, video and banners',
    fields: [
      { key: 'title', label: 'Main Headline', type: 'text', placeholder: 'Discover Your Signature Scent', required: true },
      { key: 'subtitle', label: 'Subtitle / Tagline', type: 'text', placeholder: 'Fine Fragrances Crafted in Sri Lanka' },
      { key: 'badge_text', label: 'Badge Pill', type: 'text', placeholder: 'New Arrival / Limited Edition' },
      { key: 'description', label: 'Description Paragraph', type: 'textarea' },
      { key: 'media_type', label: 'Media Type', type: 'select', options: ['image', 'video'], defaultValue: 'image' },
      { key: 'image_url', label: 'Hero Image URL', type: 'image' },
      { key: 'video_url', label: 'Hero Video URL (MP4)', type: 'text', placeholder: 'https://.../video.mp4' },
      { key: 'mobile_image_url', label: 'Mobile Specific Image URL', type: 'image' },
      { key: 'cta_text', label: 'Button Text', type: 'text', defaultValue: 'Shop Now' },
      { key: 'cta_link', label: 'Button Link URL', type: 'text', defaultValue: '/products' },
      { key: 'animation_type', label: 'Animation Effect', type: 'select', options: ['fade-zoom', 'fade', 'slide'], defaultValue: 'fade-zoom' },
      { key: 'duration', label: 'Slide Duration (Seconds)', type: 'number', defaultValue: 5 },
      { key: 'sort_order', label: 'Slide Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true },
      { key: 'is_visible', label: 'Visible on Homepage', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'announcement_bars',
    slug: 'announcement',
    name: 'Announcement Bars',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Megaphone',
    description: 'Top notice ticker bar (free shipping, sale, new arrivals)',
    fields: [
      { key: 'text', label: 'Announcement Message', type: 'text', placeholder: '✨ Free Islandwide Delivery on Orders Over Rs. 10,000', required: true },
      { key: 'link_url', label: 'Action URL (Optional)', type: 'text', placeholder: '/products' },
      { key: 'link_text', label: 'Link Text', type: 'text', placeholder: 'Shop Now' },
      { key: 'bg_color', label: 'Background Color', type: 'color', defaultValue: '#000000' },
      { key: 'text_color', label: 'Text Color', type: 'color', defaultValue: '#ffffff' },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'pages',
    slug: 'pages',
    name: 'Pages',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'FileText',
    description: 'Static and content pages: About, Story, Privacy, Terms',
    fields: [
      { key: 'title', label: 'Page Title', type: 'text', placeholder: 'Our Heritage & Story', required: true },
      { key: 'slug', label: 'Slug', type: 'text', placeholder: 'about', required: true },
      { key: 'content', label: 'Page Content (Markdown / HTML)', type: 'textarea' },
      { key: 'meta_title', label: 'Meta SEO Title', type: 'text' },
      { key: 'meta_description', label: 'Meta SEO Description', type: 'textarea' },
      { key: 'template', label: 'Page Template', type: 'text', defaultValue: 'default' },
      { key: 'is_published', label: 'Published Live', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'page_sections',
    slug: 'page-sections',
    name: 'Page Sections',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'LayoutGrid',
    description: 'Modular content blocks placed inside pages',
    fields: [
      { key: 'page_id', label: 'Page Slug / ID', type: 'text', required: true },
      { key: 'section_name', label: 'Section Name', type: 'text', placeholder: 'Perfumer Quote', required: true },
      { key: 'section_type', label: 'Section Type', type: 'select', options: ['hero', 'text_banner', 'features', 'split_image', 'gallery', 'faq'], defaultValue: 'text_banner' },
      { key: 'content', label: 'Content (JSON or Text)', type: 'json' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'section_elements',
    slug: 'section-elements',
    name: 'Section Elements',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Puzzle',
    description: 'Granular sub-elements within page sections',
    fields: [
      { key: 'section_id', label: 'Section ID', type: 'text', required: true },
      { key: 'element_type', label: 'Element Type', type: 'text', placeholder: 'card / testimonial / bullet' },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'image_url', label: 'Image URL', type: 'image' },
      { key: 'content', label: 'Element Content / JSON', type: 'json' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 }
    ]
  },
  {
    table: 'blogs',
    slug: 'blogs',
    name: 'Blogs & Articles',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'PenSquare',
    description: 'Fragrance guides, scent layering tips, and company news',
    fields: [
      { key: 'title', label: 'Article Title', type: 'text', placeholder: 'How to Choose Your Signature Scent', required: true },
      { key: 'slug', label: 'Slug', type: 'text', placeholder: 'how-to-choose-signature-scent' },
      { key: 'excerpt', label: 'Short Excerpt', type: 'textarea' },
      { key: 'content', label: 'Full Article Body', type: 'textarea' },
      { key: 'cover_image', label: 'Cover Image URL', type: 'image' },
      { key: 'author', label: 'Author Name', type: 'text', defaultValue: 'Aroma Perfumer' },
      { key: 'tags', label: 'Tags (Comma separated)', type: 'text', placeholder: 'perfume, luxury, styling' },
      { key: 'published_at', label: 'Publish Date', type: 'text' },
      { key: 'is_published', label: 'Published', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'faqs',
    slug: 'faqs',
    name: 'FAQs',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'HelpCircle',
    description: 'Frequently asked questions about shipping, perfumes, lasting time',
    fields: [
      { key: 'question', label: 'Question', type: 'text', placeholder: 'How long do Aroma perfumes last?', required: true },
      { key: 'answer', label: 'Answer', type: 'textarea', placeholder: 'Our extrait formulations last 10-14 hours on skin...', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Products & Longevity', 'Orders & Delivery', 'Returns & Exchanges', 'Payment Options'], defaultValue: 'Products & Longevity' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Is Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'popups',
    slug: 'popups',
    name: 'Popups & Modals',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Zap',
    description: 'Promotional overlay modals and newsletter captures',
    fields: [
      { key: 'title', label: 'Internal Popup Title', type: 'text', placeholder: 'First Order 10% Off', required: true },
      { key: 'headline', label: 'Display Headline', type: 'text', placeholder: 'Unlock 10% Off Your First Scent' },
      { key: 'description', label: 'Sub-text Description', type: 'textarea' },
      { key: 'image_url', label: 'Modal Image URL', type: 'image' },
      { key: 'button_text', label: 'Button Text', type: 'text', defaultValue: 'Claim Offer' },
      { key: 'button_url', label: 'Button Redirect URL', type: 'text', defaultValue: '/products' },
      { key: 'trigger_type', label: 'Trigger Event', type: 'select', options: ['time_delay', 'exit_intent', 'scroll_depth'], defaultValue: 'time_delay' },
      { key: 'trigger_delay', label: 'Delay (seconds)', type: 'number', defaultValue: 5 },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'testimonials',
    slug: 'testimonials',
    name: 'Testimonials',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'MessageSquare',
    description: 'VIP and client praise displayed across the site',
    fields: [
      { key: 'author_name', label: 'Client Name', type: 'text', required: true },
      { key: 'author_title', label: 'Title / City', type: 'text', placeholder: 'Colombo, Sri Lanka' },
      { key: 'quote', label: 'Testimonial Quote', type: 'textarea', required: true },
      { key: 'rating', label: 'Star Rating (1-5)', type: 'number', defaultValue: 5 },
      { key: 'avatar_url', label: 'Client Photo URL', type: 'image' },
      { key: 'company', label: 'Company / Credential', type: 'text' },
      { key: 'is_featured', label: 'Featured on Homepage', type: 'boolean', defaultValue: true },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'reviews',
    slug: 'reviews',
    name: 'Reviews',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Star',
    description: 'Verified buyer product reviews and star feedback',
    fields: [
      { key: 'product_id', label: 'Product ID', type: 'text', required: true },
      { key: 'customer_name', label: 'Reviewer Name', type: 'text', required: true },
      { key: 'customer_email', label: 'Reviewer Email', type: 'text' },
      { key: 'rating', label: 'Rating (1 to 5)', type: 'number', defaultValue: 5, required: true },
      { key: 'title', label: 'Review Title', type: 'text', placeholder: 'Incredible projection and longevity!' },
      { key: 'comment', label: 'Review Comment', type: 'textarea', required: true },
      { key: 'is_verified_purchase', label: 'Verified Buyer', type: 'boolean', defaultValue: true },
      { key: 'is_approved', label: 'Approved & Visible', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'navigation_menus',
    slug: 'navigation-menus',
    name: 'Navigation Menus',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Compass',
    description: 'Menu groups: Header Main Menu, Footer Links, Mobile Drawer',
    fields: [
      { key: 'name', label: 'Menu Name', type: 'text', placeholder: 'Main Header Nav', required: true },
      { key: 'handle', label: 'Menu Handle / Key', type: 'text', placeholder: 'header-menu', required: true },
      { key: 'location', label: 'Menu Location', type: 'select', options: ['header', 'footer', 'mobile', 'sidebar'], defaultValue: 'header' },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'navigation_items',
    slug: 'navigation-items',
    name: 'Navigation Items',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Link2',
    description: 'Individual links inside navigation menus',
    fields: [
      { key: 'menu_id', label: 'Parent Menu ID / Handle', type: 'text', required: true },
      { key: 'title', label: 'Link Title', type: 'text', placeholder: 'Best Sellers', required: true },
      { key: 'url', label: 'Target URL', type: 'text', placeholder: '/products?category=best-sellers', required: true },
      { key: 'parent_id', label: 'Sub-menu Parent ID', type: 'text' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'open_new_tab', label: 'Open in New Tab', type: 'boolean', defaultValue: false }
    ]
  },
  {
    table: 'media',
    slug: 'media',
    name: 'Media',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Film',
    description: 'Uploaded banners, videos, and graphic assets',
    fields: [
      { key: 'title', label: 'Media Title', type: 'text', placeholder: 'Bottle Reflection Shoot', required: true },
      { key: 'file_url', label: 'File URL', type: 'image', required: true },
      { key: 'file_type', label: 'File Type (image/video/pdf)', type: 'text', placeholder: 'image/jpeg' },
      { key: 'file_size', label: 'File Size', type: 'text' },
      { key: 'alt_text', label: 'Alt Description', type: 'text' }
    ]
  },
  {
    table: 'media_library',
    slug: 'media-library',
    name: 'Media Library',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Archive',
    description: 'Asset repository with folders and searchable tags',
    fields: [
      { key: 'name', label: 'File Name', type: 'text', required: true },
      { key: 'url', label: 'Public URL', type: 'image', required: true },
      { key: 'mime_type', label: 'MIME Type', type: 'text' },
      { key: 'size_bytes', label: 'Size (Bytes)', type: 'number' },
      { key: 'folder', label: 'Folder Category', type: 'text', placeholder: 'banners / products' },
      { key: 'tags', label: 'Tags', type: 'text' }
    ]
  },
  {
    table: 'global_components',
    slug: 'global-components',
    name: 'Global Components',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Globe',
    description: 'Global site widgets (announcement bar, newsletter footer, etc.)',
    fields: [
      { key: 'component_key', label: 'Component Key', type: 'text', placeholder: 'footer-newsletter', required: true },
      { key: 'name', label: 'Component Name', type: 'text', required: true },
      { key: 'html_content', label: 'HTML / JSX Content', type: 'textarea' },
      { key: 'css_content', label: 'Custom CSS', type: 'textarea' },
      { key: 'settings', label: 'Settings (JSON)', type: 'json' },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'reusable_components',
    slug: 'reusable',
    name: 'Reusable Components',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Repeat',
    description: 'Template widgets reused across multiple sections',
    fields: [
      { key: 'name', label: 'Component Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'component_type', label: 'Type', type: 'text', placeholder: 'promo_banner' },
      { key: 'configuration', label: 'Configuration (JSON)', type: 'json' },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'custom_code',
    slug: 'custom-code',
    name: 'Custom Code',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'Code2',
    description: 'Custom CSS, Head scripts, Google Tag Manager, chat snippets',
    fields: [
      { key: 'name', label: 'Snippet Name', type: 'text', placeholder: 'Meta Pixel / Font Preload', required: true },
      { key: 'code_type', label: 'Code Type', type: 'select', options: ['header_script', 'footer_script', 'css', 'javascript'], defaultValue: 'header_script' },
      { key: 'code_content', label: 'Code Content', type: 'textarea', required: true },
      { key: 'placement', label: 'Placement', type: 'text', placeholder: 'Head / Body End' },
      { key: 'is_active', label: 'Active & Executing', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'redirects',
    slug: 'redirects',
    name: 'Redirects',
    category: TABLE_CATEGORIES.CONTENT,
    icon: 'CornerDownRight',
    description: '301 permanent and 302 temporary URL redirects',
    fields: [
      { key: 'source_path', label: 'Source Path', type: 'text', placeholder: '/old-scents', required: true },
      { key: 'target_url', label: 'Target URL', type: 'text', placeholder: '/products', required: true },
      { key: 'status_code', label: 'Status Code', type: 'select', options: ['301', '302'], defaultValue: '301' },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },

  // --- STORE & SITE SETTINGS ---
  {
    table: 'site_settings',
    slug: 'site-settings',
    name: 'Site Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'Settings',
    description: 'Brand identity, logos, store name, contact channels',
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text', placeholder: 'AROMA Perfumes Sri Lanka', required: true },
      { key: 'brand_name', label: 'Brand Name', type: 'text', placeholder: 'AROMA' },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Luxury Fragrance House' },
      { key: 'logo_url', label: 'Logo Image URL', type: 'image' },
      { key: 'favicon_url', label: 'Favicon URL', type: 'image' },
      { key: 'description', label: 'Store Description', type: 'textarea' },
      { key: 'contact_email', label: 'Customer Support Email', type: 'text', placeholder: 'hello@aromaperfumes.lk' },
      { key: 'contact_phone', label: 'Support Phone / WhatsApp', type: 'text', placeholder: '+94 77 123 4567' },
      { key: 'instagram_url', label: 'Instagram Profile URL', type: 'text' },
      { key: 'facebook_url', label: 'Facebook Page URL', type: 'text' }
    ]
  },
  {
    table: 'theme_settings',
    slug: 'theme',
    name: 'Theme Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'Palette',
    description: 'Dark/Light aesthetic, luxury gold accents, font family',
    fields: [
      { key: 'theme_name', label: 'Theme Name', type: 'text', defaultValue: 'Onyx Gold Luxury', required: true },
      { key: 'primary_color', label: 'Primary Accent Color', type: 'color', defaultValue: '#d4af37' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'color', defaultValue: '#1a1a1a' },
      { key: 'bg_color', label: 'Background Color', type: 'color', defaultValue: '#050505' },
      { key: 'text_color', label: 'Text Color', type: 'color', defaultValue: '#f5f5f5' },
      { key: 'font_family', label: 'Typography Font', type: 'text', defaultValue: 'Inter, sans-serif' },
      { key: 'border_radius', label: 'Border Radius', type: 'text', defaultValue: '16px' },
      { key: 'is_active', label: 'Is Active Theme', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'seo_settings',
    slug: 'seo',
    name: 'SEO Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'Search',
    description: 'Search engine optimization, OpenGraph sharing, keywords',
    fields: [
      { key: 'meta_title', label: 'Default Meta Title', type: 'text', placeholder: 'Aroma Perfumes | Premium Fragrances Sri Lanka', required: true },
      { key: 'meta_description', label: 'Default Meta Description', type: 'textarea' },
      { key: 'keywords', label: 'Keywords', type: 'text', placeholder: 'perfume sri lanka, eau de parfum, colombo fragrance' },
      { key: 'og_image_url', label: 'Social Share Card Image', type: 'image' },
      { key: 'canonical_url', label: 'Canonical Domain URL', type: 'text', placeholder: 'https://aromaperfumes.lk' },
      { key: 'twitter_handle', label: 'Twitter / X Handle', type: 'text', placeholder: '@aromaperfumes' },
      { key: 'robots_txt', label: 'Robots.txt Content', type: 'textarea' }
    ]
  },
  {
    table: 'analytics_settings',
    slug: 'analytics',
    name: 'Analytics Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'BarChart3',
    description: 'Google Analytics 4, Meta Pixel, TikTok, Hotjar tracking',
    fields: [
      { key: 'google_analytics_id', label: 'Google Analytics 4 ID', type: 'text', placeholder: 'G-XXXXXXXXXX' },
      { key: 'facebook_pixel_id', label: 'Meta Pixel ID', type: 'text', placeholder: '1234567890' },
      { key: 'tiktok_pixel_id', label: 'TikTok Pixel ID', type: 'text' },
      { key: 'hotjar_id', label: 'Hotjar Site ID', type: 'text' },
      { key: 'is_active', label: 'Analytics Enabled', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'feature_settings',
    slug: 'feature-settings',
    name: 'Feature Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'Flag',
    description: 'Feature toggles: WhatsApp buy button, gift wrapping, reviews',
    fields: [
      { key: 'feature_key', label: 'Feature Key', type: 'text', placeholder: 'whatsapp_checkout', required: true },
      { key: 'name', label: 'Feature Name', type: 'text', placeholder: 'Direct WhatsApp Checkout', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'is_enabled', label: 'Feature Enabled', type: 'boolean', defaultValue: true },
      { key: 'config_values', label: 'Configuration (JSON)', type: 'json' }
    ]
  },
  {
    table: 'cms_settings',
    slug: 'cms-settings',
    name: 'CMS Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'Wrench',
    description: 'Content editor preferences, cache timeouts, pagination sizes',
    fields: [
      { key: 'setting_key', label: 'Setting Key', type: 'text', required: true },
      { key: 'setting_value', label: 'Setting Value', type: 'text', required: true },
      { key: 'category', label: 'Setting Category', type: 'text' },
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'is_public', label: 'Expose to Public Frontend', type: 'boolean', defaultValue: false }
    ]
  },
  {
    table: 'maintenance_settings',
    slug: 'maintenance',
    name: 'Maintenance Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'AlertTriangle',
    description: 'Under maintenance screen, launch countdown, bypass key',
    fields: [
      { key: 'is_maintenance_mode', label: 'Maintenance Mode Active', type: 'boolean', defaultValue: false },
      { key: 'headline', label: 'Screen Headline', type: 'text', placeholder: 'We are blending something exquisite...' },
      { key: 'message', label: 'Screen Message', type: 'textarea', placeholder: 'Our boutique will reopen shortly with our new seasonal collection.' },
      { key: 'secret_bypass_key', label: 'Secret Bypass Key', type: 'text', placeholder: 'aroma-secret-2026' },
      { key: 'expected_end_time', label: 'Expected Reopen Time', type: 'text' }
    ]
  },
  {
    table: 'error_page_settings',
    slug: 'error-pages',
    name: 'Error Page Settings',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'AlertOctagon',
    description: 'Custom 404 Not Found & 500 Server Error messages',
    fields: [
      { key: 'error_code', label: 'Error Code', type: 'select', options: ['404', '500'], defaultValue: '404', required: true },
      { key: 'title', label: 'Error Title', type: 'text', placeholder: 'Scent Not Found' },
      { key: 'message', label: 'Error Message', type: 'textarea', placeholder: 'The fragrance page you are looking for has evaporated or moved.' },
      { key: 'redirect_button_text', label: 'Button Text', type: 'text', defaultValue: 'Explore Fragrances' },
      { key: 'redirect_button_url', label: 'Button URL', type: 'text', defaultValue: '/products' },
      { key: 'image_url', label: 'Illustration / Image URL', type: 'image' }
    ]
  },
  {
    table: 'social_links',
    slug: 'social',
    name: 'Social Links',
    category: TABLE_CATEGORIES.SETTINGS,
    icon: 'Share2',
    description: 'Instagram, TikTok, WhatsApp, Facebook, YouTube handles',
    fields: [
      { key: 'platform', label: 'Platform Name', type: 'text', placeholder: 'Instagram / WhatsApp', required: true },
      { key: 'url', label: 'Profile URL', type: 'text', placeholder: 'https://instagram.com/aromaperfumes', required: true },
      { key: 'icon_name', label: 'Icon Identifier', type: 'text', placeholder: 'Instagram / MessageCircle' },
      { key: 'display_label', label: 'Display Label', type: 'text', placeholder: '@aroma_lk' },
      { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      { key: 'is_active', label: 'Active', type: 'boolean', defaultValue: true }
    ]
  },

  // --- USERS, SESSIONS & LOGS ---
  {
    table: 'customers',
    slug: 'customers',
    name: 'Customers',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'Users',
    description: 'Registered shoppers, VIP client profiles, address books',
    fields: [
      { key: 'first_name', label: 'First Name', type: 'text' },
      { key: 'last_name', label: 'Last Name', type: 'text' },
      { key: 'email', label: 'Email Address', type: 'text', required: true },
      { key: 'phone', label: 'Phone Number', type: 'text' },
      { key: 'address', label: 'Default Address', type: 'textarea' },
      { key: 'city', label: 'City', type: 'text' },
      { key: 'postal_code', label: 'Postal Code', type: 'text' },
      { key: 'is_verified', label: 'Account Verified', type: 'boolean', defaultValue: true },
      { key: 'notes', label: 'Admin Notes on VIP Client', type: 'textarea' }
    ]
  },
  {
    table: 'customer_sessions',
    slug: 'customer-sessions',
    name: 'Customer Sessions',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'KeyRound',
    description: 'Active client login tokens and devices',
    fields: [
      { key: 'customer_id', label: 'Customer ID', type: 'text', required: true },
      { key: 'session_token', label: 'Session Token', type: 'text' },
      { key: 'ip_address', label: 'IP Address', type: 'text' },
      { key: 'user_agent', label: 'User Agent / Device', type: 'text' },
      { key: 'expires_at', label: 'Expiration Date', type: 'text' }
    ]
  },
  {
    table: 'admins',
    slug: 'admins',
    name: 'Admins',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'Shield',
    description: 'Staff members, warehouse dispatchers, and superadmins',
    fields: [
      { key: 'email', label: 'Admin Email', type: 'text', required: true },
      { key: 'name', label: 'Full Name', type: 'text', required: true },
      { key: 'role', label: 'Role & Permissions', type: 'select', options: ['superadmin', 'admin', 'manager', 'editor'], defaultValue: 'admin' },
      { key: 'is_active', label: 'Account Active', type: 'boolean', defaultValue: true },
      { key: 'last_login_at', label: 'Last Login Timestamp', type: 'text' }
    ]
  },
  {
    table: 'admin_sessions',
    slug: 'admin-sessions',
    name: 'Admin Sessions',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'Lock',
    description: 'Security session records of admin dashboard logins',
    fields: [
      { key: 'admin_id', label: 'Admin ID / Email', type: 'text', required: true },
      { key: 'session_token', label: 'Token', type: 'text' },
      { key: 'ip_address', label: 'IP Address', type: 'text' },
      { key: 'user_agent', label: 'Browser & OS', type: 'text' },
      { key: 'expires_at', label: 'Expires At', type: 'text' }
    ]
  },
  {
    table: 'activity_feed',
    slug: 'activity',
    name: 'Activity Feed',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'Activity',
    description: 'Live audit timeline of store events (new order, item out of stock)',
    fields: [
      { key: 'user_email', label: 'User Email / Actor', type: 'text' },
      { key: 'action', label: 'Action Performed', type: 'text', placeholder: 'Order #1001 Placed', required: true },
      { key: 'details', label: 'Details / Summary', type: 'textarea' },
      { key: 'entity_type', label: 'Entity Type', type: 'text', placeholder: 'order / product / user' },
      { key: 'entity_id', label: 'Entity ID', type: 'text' },
      { key: 'ip_address', label: 'IP Address', type: 'text' }
    ]
  },
  {
    table: 'audit_logs',
    slug: 'audit-logs',
    name: 'Audit Logs',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'ScrollText',
    description: 'Deep audit records of data modifications and changes',
    fields: [
      { key: 'actor_email', label: 'Staff Member Email', type: 'text', required: true },
      { key: 'action', label: 'Action (INSERT / UPDATE / DELETE)', type: 'text', required: true },
      { key: 'table_name', label: 'Target Table', type: 'text', required: true },
      { key: 'record_id', label: 'Record ID', type: 'text' },
      { key: 'old_values', label: 'Previous Values', type: 'json' },
      { key: 'new_values', label: 'New Values', type: 'json' }
    ]
  },
  {
    table: 'cms_audit',
    slug: 'cms-audit',
    name: 'CMS Audit',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'FileSearch',
    description: 'SEO missing tags, broken images, and missing prices report',
    fields: [
      { key: 'page_path', label: 'Page / Route Path', type: 'text', required: true },
      { key: 'issue_type', label: 'Issue Type', type: 'text', placeholder: 'missing_alt_tag / broken_link', required: true },
      { key: 'severity', label: 'Severity', type: 'select', options: ['info', 'warning', 'critical'], defaultValue: 'warning' },
      { key: 'description', label: 'Issue Description', type: 'textarea' },
      { key: 'resolved', label: 'Mark as Resolved', type: 'boolean', defaultValue: false }
    ]
  },
  {
    table: 'error_logs',
    slug: 'error-logs',
    name: 'Error Logs',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'Bug',
    description: 'Client frontend and API runtime crash diagnostics',
    fields: [
      { key: 'error_message', label: 'Error Message', type: 'textarea', required: true },
      { key: 'stack_trace', label: 'Stack Trace', type: 'textarea' },
      { key: 'path', label: 'Route / URL Path', type: 'text' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'fatal'], defaultValue: 'medium' },
      { key: 'user_agent', label: 'Browser User Agent', type: 'text' },
      { key: 'resolved', label: 'Issue Resolved', type: 'boolean', defaultValue: false }
    ]
  },
  {
    table: 'content_revisions',
    slug: 'revisions',
    name: 'Content Revisions',
    category: TABLE_CATEGORIES.USERS_LOGS,
    icon: 'History',
    description: 'Historical snapshots and restore points for articles and pages',
    fields: [
      { key: 'table_name', label: 'Table Name', type: 'text', required: true },
      { key: 'record_id', label: 'Record ID', type: 'text', required: true },
      { key: 'revision_number', label: 'Revision #', type: 'number', defaultValue: 1 },
      { key: 'author_email', label: 'Author Email', type: 'text' },
      { key: 'content', label: 'Historical Content Snapshot', type: 'json', required: true }
    ]
  },

  // --- AI & CHATBOT ---
  {
    table: 'bot_conversations',
    slug: 'bot-conversations',
    name: 'Bot Conversations',
    category: TABLE_CATEGORIES.AI_BOTS,
    icon: 'Bot',
    description: 'AI fragrance recommendation chat threads with visitors',
    fields: [
      { key: 'session_id', label: 'Session / Visitor ID', type: 'text', required: true },
      { key: 'user_email', label: 'Visitor Email (if provided)', type: 'text' },
      { key: 'channel', label: 'Chat Channel', type: 'select', options: ['website_widget', 'whatsapp', 'instagram'], defaultValue: 'website_widget' },
      { key: 'summary', label: 'Discussion Summary', type: 'textarea' },
      { key: 'status', label: 'Thread Status', type: 'select', options: ['active', 'handed_off_to_human', 'resolved', 'closed'], defaultValue: 'active' }
    ]
  },
  {
    table: 'bot_knowledge',
    slug: 'bot-knowledge',
    name: 'Bot Knowledge',
    category: TABLE_CATEGORIES.AI_BOTS,
    icon: 'Brain',
    description: 'AI knowledge base: note descriptions, seasonal advice, policies',
    fields: [
      { key: 'topic', label: 'Knowledge Topic', type: 'text', placeholder: 'Longevity & Concentration', required: true },
      { key: 'question', label: 'Common Question / Prompt', type: 'text', placeholder: 'What makes Extrait de Parfum last longer?', required: true },
      { key: 'answer', label: 'Expert AI Answer', type: 'textarea', placeholder: 'Extrait de Parfum contains 30-40% perfume oil concentration...', required: true },
      { key: 'tags', label: 'Search Keywords / Tags', type: 'text', placeholder: 'extrait, oil, longevity' },
      { key: 'confidence_score', label: 'Confidence Score (0.0 - 1.0)', type: 'number', defaultValue: 1.0 },
      { key: 'is_active', label: 'Active in AI Answers', type: 'boolean', defaultValue: true }
    ]
  },
  {
    table: 'bot_messages',
    slug: 'bot-messages',
    name: 'Bot Messages',
    category: TABLE_CATEGORIES.AI_BOTS,
    icon: 'MessageCircle',
    description: 'Chat transcripts exchanged between user and fragrance AI',
    fields: [
      { key: 'conversation_id', label: 'Conversation ID', type: 'text', required: true },
      { key: 'sender', label: 'Sender Role', type: 'select', options: ['user', 'bot', 'agent'], defaultValue: 'user', required: true },
      { key: 'message_text', label: 'Message Body', type: 'textarea', required: true },
      { key: 'metadata', label: 'Metadata / Recommended Products (JSON)', type: 'json' }
    ]
  },
  {
    table: 'bot_settings',
    slug: 'bot-settings',
    name: 'Bot Settings',
    category: TABLE_CATEGORIES.AI_BOTS,
    icon: 'SlidersHorizontal',
    description: 'AI Sommelier persona, tone of voice, welcome greetings',
    fields: [
      { key: 'bot_name', label: 'AI Fragrance Consultant Name', type: 'text', defaultValue: 'Aroma Scent Sommelier', required: true },
      { key: 'welcome_message', label: 'Welcome Greeting', type: 'textarea', defaultValue: 'Greetings! I am your personal Aroma fragrance concierge. What mood or occasion are you shopping for today?' },
      { key: 'default_fallback', label: 'Fallback Response', type: 'textarea', defaultValue: 'I would be delighted to connect you with our boutique perfumer in Colombo. May I have your WhatsApp number or email?' },
      { key: 'model_name', label: 'AI Model', type: 'text', defaultValue: 'gemini-2.5-flash' },
      { key: 'temperature', label: 'Creativity Temperature (0.0 - 1.0)', type: 'number', defaultValue: 0.7 },
      { key: 'is_active', label: 'AI Bot Widget Active', type: 'boolean', defaultValue: true }
    ]
  }
]

export function getTableConfig(slugOrTableName) {
  return TABLES.find(t => t.slug === slugOrTableName || t.table === slugOrTableName) || {
    table: slugOrTableName,
    slug: slugOrTableName,
    name: slugOrTableName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    category: 'Database Table',
    icon: 'Database',
    description: `Manage rows in ${slugOrTableName} table`,
    fields: []
  }
}
