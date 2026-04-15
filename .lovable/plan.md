

# TapxHub — Premium CRM & Operations Hub

## Overview
A bespoke, Apple-grade dashboard for TapxMedia — a one-person digital agency. Built with a white-primary theme (#F9FAFB background, #1E2A3A navy accent, #3B82F6 blue interactive), glassmorphic cards, Framer Motion animations, and full Supabase backend.

---

## Phase 1: Foundation & Layout Shell

### Design System & Theme
- Custom color tokens: Tapx Navy, Tapx Blue, soft status glows (green/amber/red)
- Navy-tinted floating shadows on all cards
- Inter font with strict typographic hierarchy
- Glassmorphic card components with large rounded corners

### Navigation Bar (matching reference images)
- Top horizontal nav with pill-style active indicators
- Sections: Dashboard, Clients, Projects, Tasks, Calendar, Services, Invoices, Settings
- Notification bell + user avatar on the right
- TapxHub logo on the left

### Responsive Layout Shell
- Bento-grid layout system for desktop
- Tablet: 2-column stacked grid
- Mobile: single column with bottom-sheet patterns

---

## Phase 2: Dashboard

### Admin Dashboard
- KPI cards (active projects, monthly revenue, outstanding invoices, projects at risk) with count-up animations and soft health glows
- AI "Daily Pulse" summary card
- Calendar preview widget showing upcoming deadlines
- Revenue chart with animated left-to-right draw
- Recent activity feed

### Client Dashboard (simplified view)
- Project status with animated progress bars
- Invoice summary (paid/unpaid)
- Upsell service cards (non-pushy)
- Uploaded media section

---

## Phase 3: Clients / People View (matching reference image 1)

- Filterable, searchable data table with columns: Name, Role, Department, Site, Salary/Retainer, Start Date, Status
- Row hover highlight + selected row golden glow (matching image)
- Status pills (Active, Retainer, One-off, Completed)
- Click row → inline expansion showing client details, documents, and stats (right panel like reference)
- Filter dropdowns: Department, Status, Lifecycle, Entity
- Pagination at bottom

---

## Phase 4: Projects & Kanban

- Kanban board with columns: Backlog, In Progress, Review, Complete
- Drag-and-drop cards with lift + shadow animation
- Health score indicator per project (green/amber/red glow based on activity)
- 48-hour inactivity detection → amber/red status
- Mobile: horizontal snap-to-grid swipe carousel with long-press drag

---

## Phase 5: Calendar & Time View (matching reference image 2)

- Monthly calendar grid matching the reference layout
- Event types: project deadlines, admin tasks, retainer cycles, client milestones
- Color-coded event bars spanning date ranges (Work day, Vacation, Sickness)
- Hours/salary summary at top with progress bars
- Employee/client sidebar with basic info, documents, and statistics
- Google Calendar sync preparation (edge function ready)

---

## Phase 6: Services & Upsells

- Glass card grid for each service (Brand Strategy, Websites, SEO, Social Media, Email Marketing, Paid Media, Funnels, CRO, Automation, Chatbots, Analytics)
- Each card: icon + short value description, no prices
- Click → card zooms forward with background blur, shows detailed explanation + "Add to Service" CTA
- Shared layout animation (layoutId) for smooth transitions

---

## Phase 7: Invoices & Billing

- Admin: Monthly turnover chart, paid vs unpaid breakdown, retainer vs one-off revenue
- Client: Invoice list with status indicators (Paid, Pending, Overdue with glow)
- PDF download action per invoice

---

## Phase 8: Backend (Supabase)

### Database Tables
- `clients` — name, email, type (retainer/one-off), status, metadata
- `projects` — client_id, name, status, health_score, deadlines
- `tasks` — project_id, title, status (kanban column), assignee, due_date
- `services` — name, description, icon, category
- `invoices` — client_id, amount, status, due_date, pdf_url
- `calendar_events` — title, type, start_date, end_date, linked entity
- `profiles` — user profile data
- `user_roles` — role-based access (admin vs client)

### Auth
- Magic link (passwordless) login
- Role-based views (admin sees everything, client sees their data only)
- RLS policies on all tables

### Edge Functions
- AI Daily Pulse summary generation
- Media auto-expiry (90-day cleanup + zip/email)
- Notification triggers (project start/completion)

---

## Phase 9: AI Concierge

- Chat interface with Siri-style waveform animation
- Admin mode: move projects, update tasks, generate invoices, daily summary
- Client mode: ask project status, upload images, view invoices
- Typing indicator + subtle success confirmations

---

## Animations (Framer Motion throughout)
- Page load: staggered fade + slide-in for all cards
- Hover: card lift with deepening shadow
- Click: zoom forward with background blur
- KPI numbers: count-up on mount
- Health indicators: soft pulsing glow
- Shared layout transitions between views

