# Design Guidelines: Wiki Profile Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Wikipedia's content clarity + Medium's reading experience + Notion's clean profile aesthetics

**Core Principles:**
- Content-first hierarchy with exceptional readability
- Clean, spacious layouts that prioritize user-generated content
- Wikipedia-inspired typography for descriptions, modern card design for profiles
- Professional moderation interface borrowing from Linear's efficiency

---

## Typography

**Font Families:**
- Primary: Inter (via Google Fonts CDN) - headings, UI elements, navigation
- Content: Georgia - wiki descriptions for enhanced readability

**Type Scale:**
- Responsive headings:
  - Profile names: text-2xl (mobile) → text-3xl (tablet) → text-4xl (desktop)
  - Section headers: text-lg (mobile) → text-xl (tablet) → text-2xl (desktop)
  - Entry titles: text-base (mobile) → text-lg (tablet) → text-xl (desktop)
- Body: text-sm (mobile/tablet), text-base (desktop descriptions)
- UI Elements: text-xs (mobile), text-sm (tablet/desktop buttons, labels)
- Metadata: text-xs (mobile), text-sm (desktop)
- Tags & Badges: text-xs (always, compact)

**Weights:** 400 (regular), 600 (semibold for headings), 700 (bold for emphasis)

---

## Layout System

**Spacing Units:** Tailwind units of 3, 4, 6, 8, 12, 16
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8, space-y-12
- Grid gaps: gap-4, gap-6, gap-8

**Container Widths:**
- Search/Home: max-w-4xl (focused search experience)
- Wiki Profile: max-w-5xl (optimal reading width with images)
- Admin Dashboard: max-w-7xl (data-dense view)

**Grid System:**
- Profile entries: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 (masonry-style)
- Admin moderation: grid-cols-1 lg:grid-cols-2 (split view for efficiency)

---

## Component Library

### Navigation
- Sticky top header (h-16) with logo, search icon, user avatar/login button
- Admin sidebar navigation (w-64) with icon + label pattern for moderation tools

### Search Interface (Home)
- Centered search bar (w-full max-w-2xl) with large text input
- Search suggestions dropdown appearing below input
- Recent/popular profiles grid below search (3-column on desktop)

### Authentication
- Centered card layout (max-w-md) with form fields
- Social auth buttons (Google, GitHub) with icon + text
- Clear visual separation between login and registration states

### Wiki Profile View
- Profile header: Avatar (large, 120px), username, bio, stats (entries count, join date)
- Entry cards: Image thumbnail (aspect-video), title, excerpt, timestamp
- Full entry view: Hero image (w-full, max-h-96), full description with proper text formatting

### Profile Editor
- Side-by-side layout: image upload area (left) + text editor (right)
- Rich text toolbar for description formatting
- Entry management list showing all user's posts

### Admin Moderation
- Table view with thumbnails, username, entry title, status, action buttons
- Filter tabs: Pending, Approved, Flagged, All
- Quick action buttons: Approve (green), Reject (red), View Detail

### Cards & Containers
- Border style: border border-gray-200 with rounded-lg
- Hover states: subtle scale (hover:scale-102) and shadow enhancement
- Consistent padding: p-6 for content cards

### Forms
- Input fields: border-2, rounded-md, px-4 py-3, focus ring
- Labels: text-sm font-semibold mb-2
- Buttons: px-6 py-3, rounded-lg, font-semibold

### Buttons
- Primary: Full rounded (rounded-lg), semibold text
- Secondary: Outlined with border-2
- Icon buttons: Square (w-10 h-10) with centered icon

---

## Images

**Hero Images:**
- Search/Home page: NO hero image (search-first interface)
- Wiki Profile page: YES - User's featured/latest entry image as subtle background (opacity-20) behind profile header
- Login/Register: NO hero image (focused form experience)
- Admin Dashboard: NO hero image (data-focused)

**Content Images:**
- Entry thumbnails: aspect-video (16:9) ratio, object-cover
- Profile avatars: Circular, 40px (navigation), 120px (profile header)
- Entry detail images: Full-width, max-h-96 with object-cover
- Placeholder: Use solid background with icon when no image uploaded

**Image Placement:**
- Entry cards: Image top, content below
- Profile header: Avatar left, info right (flex layout)
- Admin moderation: Small thumbnail (64px) in table rows

---

## Page-Specific Layouts

**Search/Home:**
- Centered search bar with generous top margin (mt-24)
- Below: Popular profiles in 3-column grid with profile cards (avatar, name, entry count)

**Authentication:**
- Centered card, social auth buttons at top, divider, then email/password form

**Wiki Profile:**
- Header section (full-width) with background treatment
- Entries grid below (masonry layout, 3 columns)
- Floating "Create Entry" button (bottom-right, fixed position)

**Admin Dashboard:**
- Left sidebar navigation (fixed)
- Main content area with filters (top) + table/grid view
- Pagination controls at bottom

---

## Key Design Details

- Use subtle shadows for depth (shadow-sm for cards, shadow-md for modals)
- Minimal animations: smooth transitions on hover (transition-all duration-200)
- Icons via Heroicons (CDN)
- Consistent 8px border radius for buttons and cards
- Focus states: ring-2 ring-blue-500 ring-offset-2