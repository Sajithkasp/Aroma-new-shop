# Implementation Plan: Shopify-Style No-Code Store Customizer for Aroma

Build a comprehensive, Shopify-style visual theme customizer and no-code site manager within the admin panel, allowing complete real-time customization of the storefront (Hero slides, Announcement bar, Scent Matcher Quiz, Catalog, Brand Story, Scent Pyramid, Testimonials, Delivery, and Branding) without writing a single line of code.

---

## 1. Architecture & Design

### A. Dual-Pane Shopify Theme Editor (`/admin/dashboard/customizer`)
* **Left Sidebar (Section Inspector & Controls)**:
  * **Header & Announcement Bar**: Edit ticker messages, rotation duration, top contact details, and visibility toggle.
  * **Hero Slider Studio**: Add/reorder/delete slides, upload or set media URLs (video vs high-res image, mobile image), customize badge text, title, subtitle, CTA text & link, animation effects (Zoom Slow, Fade Up, Slide In), and slide duration.
  * **Trust Pillars**: Customize the 4 value badges (Extrait Concentration, Ceylon Botanicals, Express Delivery, IFRA Certified).
  * **Fragrance Catalog & Best Sellers**: Customize collection headlines, badge labels, visible categories, and layout.
  * **Interactive Scent Quiz Editor**: Customize questions, answer choices, icons, and fragrance matches.
  * **Olfactory Scent Pyramid Masterclass**: Customize the descriptions and notes for Top, Heart, and Base notes.
  * **Atelier Heritage Story**: Edit headline, history copy, master distiller quote, stats pills (35% Extrait, 12 Yrs Oud, etc.), and atelier image.
  * **Customer Reviews & Testimonials**: Add, approve, and edit customer testimonials, star ratings, and perfume wear impressions.
  * **VIP Private Circle / Newsletter**: Customize the signup promo code (e.g., `AROMA10`), discount percentage, and perks.
  * **Footer & Concierge**: Edit brand tagline, Colombo atelier address, WhatsApp concierge hotline number, and links.
  * **Theme & Colors**: Select brand accent tones (Gold Amber, Emerald, Royal Rose Gold, Monochrome Noir).

* **Center/Right Canvas (Live Interactive Preview)**:
  * Live responsive viewport with **Desktop, Tablet, and Mobile device frame switchers**.
  * **Live Section Clicking**: Clicking any section in the live preview directly focuses its corresponding configuration panel in the sidebar.
  * **Top Action Bar**: Quick buttons for "Save & Publish Changes", "Discard Changes", "Preview in New Tab", and "Revert to Factory Defaults".

---

## 2. Dynamic Live Synchronization

* **Unified Configuration Store (`lib/siteConfigStore.ts`)**:
  * Central reactive state containing all customizable storefront parameters.
  * Reads from Supabase tables (`site_settings`, `hero_sections`, `announcement_bars`, `page_sections`, `theme`) with immediate local persistence fallback.
  * Real-time listener (`supabase.channel('site_customizer_sync')`) so any change made in the admin immediately updates the customer storefront.

* **Customer Storefront Wiring (`app/(customer)/page.tsx` & components)**:
  * Connect all visual elements to read directly from the configuration store.
  * When an admin edits a slide, hero headline, announcement text, or scent quiz question, the customer site updates instantly without requiring any code deployment.

---

## 3. Dedicated Visual Product & Order Studio

* **Visual Fragrance Creator (`/admin/dashboard/products`)**:
  * Form with visual bottle preview, multi-image gallery, volume options (10ml, 50ml, 100ml), olfactory notes builder (Top, Heart, Base), pricing, and stock status.
* **Orders & WhatsApp Dispatch Studio (`/admin/dashboard/orders`)**:
  * View orders placed by customers, filter by status (Pending, Dispatched, Delivered), and send 1-click WhatsApp dispatch confirmations to Sri Lankan phone numbers.

---

## 4. Verification & Testing

* Test full customizer lifecycle: editing hero slides, changing announcement bar, tweaking scent quiz questions, adjusting prices, and verifying that the live customer page updates immediately.
* Verify mobile/desktop responsiveness in the preview iframe.
* Run `compile_applet` and `lint_applet` to ensure zero compilation or type errors.
