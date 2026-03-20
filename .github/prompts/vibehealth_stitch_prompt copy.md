# 🐰 VibeHealth — Design Prompt
> Use this document as input for Google's Stitch vibe design tool to generate full UI mockups for both **desktop** and **mobile (PWA)** layouts.

### Master Prompt
```
Design a comprehensive, modern health & wellness Progressive Web App called "VibeHealth".
The app has a friendly bunny mascot 🐰 and uses a warm, premium aesthetic.
Generate both DESKTOP (1440px wide) and MOBILE (390px wide, PWA — no native chrome) versions for every screen.

BRAND IDENTITY:
- Name: VibeHealth
- Mascot: a cute, expressive bunny 🐰 that reacts to user actions (happy, sad, encouraging, idle)
- Tagline: "Your personal health companion"
- Logo style: rounded icon with the bunny face inside a soft-colored circle

DESIGN SYSTEM:
- Fonts: "Outfit" for headings (bold, tight tracking), "Plus Jakarta Sans" for body text
- Primary color: Vibrant Rose scale (#f43f5e core, ranging #fff1f2 to #4c0519)
- Secondary/accent: Sage green scale (#34d399 core, ranging #f6fbf9 to #047857)
- Neutrals: cool gray scale (50–950)
- Border radius: 2xl–3xl (generous rounding), cards use rounded-3xl
- Glass panels: white/80 bg + backdrop blur + subtle border + shadow (glassmorphism)
- Dark mode: gray-900/950 backgrounds, all components must have dark variants
- Animations: fade-in-up on page load, float on mascot, hover scale on cards, smooth transitions
- Spacing: generous, airy, breathing room — premium feel
- Icons: emoji-based feature icons in rounded containers with shadow
- Navigation: bottom tab bar on mobile, sidebar on desktop

```

---

## SCREENS TO GENERATE:


### Screen 1 — Authentication (Login & Register)

```
SCREEN: Login Page
— Split layout on desktop: left side with gradient illustration + bunny mascot + tagline, right side with form
— Mobile: full-width form with bunny illustration at top
— Glass-panel card containing:
  • Email input field (rounded-xl, subtle border, focus ring in primary color)
  • Password input field with show/hide toggle
  • "Remember me" checkbox
  • Primary CTA button: gradient from primary-500 to primary-600, bold white text, shadow-lg, hover scale
  • "Forgot password?" link
  • Divider with "or continue with"
  • Social login buttons row: Google, Apple, GitHub (outlined, rounded-xl)
  • "Don't have an account? Sign up" link at bottom
— Background: soft gradient blobs (primary-300/10 and sage-300/10) blurred behind content
— i18n: show a small language switcher (FR / EN) in top-right corner

SCREEN: Register Page
— Same layout style as login
— Form fields: Full name, Email, Password, Confirm password
— Password strength indicator bar
— Terms & conditions checkbox
— Primary CTA: "Create Account"
— "Already have an account? Log in" link

SCREEN: Email Verification
— Centered card with large envelope/mail icon
— "Check your inbox" heading
— Subtitle with email address partially masked
— Resend email button (secondary style)
— "Back to login" link
```

---

### Screen 2 — Onboarding Wizard

```
SCREEN: Onboarding Wizard (multi-step, 6 steps)
— Progress bar at top showing current step (dots or segmented bar with primary color fill)
— Bunny mascot in corner reacting to each step (encouraging!)
— Each step in a glass-panel card, centered, max-width 600px

Step 1 — "Let's get to know you"
  • Name, Date of birth (date picker), Biological sex (segmented toggle: Male/Female/Other)
  • Height (slider or input with unit toggle cm/ft), Weight (input with unit toggle kg/lbs)

Step 2 — "Your health background"
  • Medical conditions (multi-select chips: Diabetes, Asthma, Hypertension, Heart disease, etc. + custom add)
  • Allergies (tag input with autocomplete)
  • Current medications (add multiple: name + dose + frequency)

Step 3 — "Your fitness & goals"
  • Fitness level (illustrated cards: Beginner, Intermediate, Advanced)
  • Goals (selectable cards with icons: Weight loss, Muscle gain, Better sleep, Stress management, General wellness)

Step 4 — "Cycle tracking" (optional, skippable)
  • "Do you want to track your menstrual cycle?" toggle
  • If yes: average cycle length, last period start date
  • Pregnancy status toggle

Step 5 — "Notification preferences"
  • Toggle switches for: Push notifications, Email reminders, Medication alerts, Workout reminders
  • Quiet hours time range picker

Step 6 — "All set!"
  • Celebration screen with confetti animation
  • Bunny mascot doing a happy dance
  • Summary of selected preferences
  • "Go to Dashboard" primary CTA

— Navigation: "Back" and "Continue" buttons at bottom, skip option for optional steps
```

---

### Screen 3 — Main Dashboard

```
SCREEN: Dashboard (the main home screen after login)
— DESKTOP: sidebar navigation on left (240px), content area on right
— MOBILE: content area full-width, bottom tab navigation bar (5 tabs)

Sidebar (desktop) / Bottom tabs (mobile):
  • Home (dashboard icon)
  • Vitals (heart icon)
  • Wellness (lotus icon)
  • Medical (pill/stethoscope icon)
  • Profile (user icon)

Dashboard content:
— Top greeting: "Good morning, [Name]! 🐰" with current date, weather icon
— Bunny mascot widget: small floating bunny in encouraging state with a speech bubble ("Keep it up! 3-day streak!")

— Quick Stats Row (horizontal scrollable on mobile, grid on desktop):
  • Steps today: circular progress ring, number in center, goal underneath
  • Heart rate: current BPM with mini sparkline
  • Sleep last night: hours with quality badge
  • Hydration: water glass fill animation with ml/goal
  • Calories: consumed vs burned donut chart

— Today's Schedule (timeline-style card):
  • Medication reminders with time
  • Workout planned
  • Appointment
  • Each item with icon, time, and status chip (done/upcoming/missed)

— Weekly Trends Section:
  • Tab bar: Steps | Sleep | Heart | Mood
  • Area chart with gradient fill under the line (primary color)
  • 7-day x-axis, data points highlighted

— Quick Actions Grid (2x2 on mobile, 4-column on desktop):
  • Log Meal (food emoji)
  • Log Water (water emoji)
  • Log Mood (face emoji)
  • Start Workout (running emoji)
  Each as a rounded-2xl button with icon + label, subtle shadow, hover/tap effect

— Recent Activity Feed (last 5 items):
  • Each item: icon, description, timestamp
  • "Walked 8,432 steps — 2 hours ago"
  • "Took Ibuprofen 400mg — 4 hours ago"
```

---

### Screen 4 — Vitals Dashboard

```
SCREEN: Vitals Dashboard
— Category tabs at top: All | Steps | Heart Rate | Sleep | Blood Pressure | Weight | Temperature

— Current Vitals Grid (cards):
  Each vital shown as a glass-panel card with:
  • Large current value (big number)
  • Unit label
  • Trend arrow (up/down/stable) with percentage change
  • Mini sparkline (last 7 days)
  • Tap to expand to full detail view

— Steps Detail View:
  • Large circular progress ring (primary gradient)
  • Daily/Weekly/Monthly toggle
  • Bar chart of daily steps
  • Averages section: 7d, 30d, 90d with comparison to previous period
  • Streaks counter (with bunny carrot reward icon)
  • Goal adjustment slider

— Heart Rate Detail View:
  • Current resting HR with status badge (Normal/Elevated/Low)
  • Line chart: resting HR over time
  • Min/Max/Avg cards
  • Abnormal alert threshold settings
  • Zones: Resting, Fat burn, Cardio, Peak — color-coded bars

— Sleep Detail View:
  • Last night summary: duration, quality score (out of 100), bedtime, wake time
  • Sleep stages bar (Awake, Light, Deep, REM — color-coded horizontal stacked bar)
  • Weekly sleep duration bar chart
  • Sleep consistency score
  • Tips from bunny mascot

— Blood Pressure / Weight / Temperature:
  • Similar card + chart pattern
  • Input button for manual logging
  • History list with date, value, notes
```

---

### Screen 5 — Medical Features

```
SCREEN: Medicine Tracker
— "My Medications" list:
  Each medication as a card with:
  • Pill icon (color-coded by type)
  • Name, dose, frequency
  • Next reminder time
  • Adherence percentage ring
  • Quick actions: Mark taken, Snooze, Skip
— "Add Medication" floating action button (FAB) → bottom sheet/modal:
  • Name (autocomplete from drug database)
  • Dose input + unit
  • Frequency selector (daily, twice daily, weekly, as needed)
  • Time pickers (multiple)
  • Duration (ongoing or end date)
  • Notes field
  • Side effects section (auto-populated from database, collapsible)
— Interaction warnings banner (if conflicts detected) — amber alert style
— Refill reminder toggle per medication

SCREEN: Medical ID
— Card-style layout resembling an emergency ID card
— Top section: Name, Age, Blood type (large, bold)
— Sections: Allergies (red chips), Medications (list), Emergency contacts (with call button)
— QR code (large, centered, scannable)
— "Share" and "Export PDF" buttons
— Always-accessible badge icon in the app header
— Offline indicator: "Available offline ✓"

SCREEN: Health Checks & Vaccines
— Split view: Upcoming | History
— Upcoming: timeline of recommended screenings/vaccines based on profile
  Each item: name, recommended date, reason, "Schedule" button
— History: list of past appointments with date, type, result notes
— Vaccine card: visual passport-style layout with check marks

SCREEN: Guides & Articles
— Search bar at top with category filter chips (All, Heart, Diabetes, Nutrition, Mental Health, etc.)
— Article grid: cards with thumbnail, title, category badge, read time
— Article detail: clean reading layout with markdown-rendered content, bookmark icon, related articles at bottom

SCREEN: First Aid Guide
— Grid of emergency categories with large icons:
  Burns, Choking, CPR, Fractures, Allergic Reactions, Bleeding, Poisoning, Shock
— Each taps into step-by-step illustrated guide
— Emergency numbers section with country selector and one-tap call buttons
— Offline badge prominently shown
— Helpline directory: crisis hotlines with call/chat buttons, bunny comfort message
```

---

### Screen 6 — Lifestyle & Wellness

```
SCREEN: Mood Tracker
— Today's mood: large emoji selector (5 faces from very sad to very happy)
— Tag chips below: Anxious, Energetic, Calm, Stressed, Happy, Tired, etc.
— Optional note text field
— Mood history: calendar heatmap (colored by mood)
— Correlation insights card: "Your mood tends to be better on days you sleep 7+ hours"
— Bunny reacts empathetically to mood selection

SCREEN: Period Tracker
— Cycle calendar: circular/ring visualization showing current day in cycle, predicted period, fertile window
— Quick log buttons: Period started/ended, Flow intensity (light/medium/heavy), Symptoms chips
— Predictions card: next period date, next fertile window
— Pill reminder toggle with time setting
— History timeline: past cycles with duration and symptoms
— Pregnancy mode toggle (disables period predictions, shows pregnancy tracker)

SCREEN: Journal
— Entry list: cards with date, mood, preview text, media thumbnails
— New entry form: rich text editor (Markdown), attach images/audio/video, location tag, mood & tags
— Calendar view toggle
— Media gallery tab with thumbnails grid
— Privacy lock icon per entry

SCREEN: Workouts
— Today's workout suggestion card (based on profile): exercise name, duration, difficulty, muscle groups
— Categories tabs: Strength, Cardio, Flexibility, HIIT, Yoga
— Workout cards: name, duration, difficulty badge, equipment needed, preview illustration
— Active workout screen: timer, rep counter, rest interval timer, exercise illustration, next exercise preview
— Post-workout summary: duration, calories, average HR, personal record badges

SCREEN: Relaxation & Meditation
— Ambient sounds grid: Rain, Ocean, Forest, White Noise, Fireplace — each with play button and waveform visual
— Guided meditation list: cards with title, duration, category (Breathing, Body Scan, Sleep)
— Timer mode: beautiful minimal circular timer with breathing animation
— Session history and streaks counter

SCREEN: Focus Helper
— Large circular timer (Pomodoro: 25min default, customizable)
— Bunny mascot prominently shown: "Stay focused or bunny doesn't get its carrot! 🥕"
— Start/Pause/Reset controls
— Session counter (pomodoros completed today)
— Stats: total focus time today/week, streak counter
— Leave penalty visualization: sad bunny, carrot counter resets
```

---

### Screen 7 — Nutrition & Hydration

```
SCREEN: Nutrition / Food Diary
— Daily summary ring: Calories consumed vs goal, Macros breakdown (Protein/Carbs/Fat donut chart)
— Meal sections: Breakfast, Lunch, Dinner, Snacks — each expandable
  • Each food item: name, calories, macro badges
  • "Add food" button per section
— Add food modal: search bar, recent foods, barcode scanner button, manual entry form
— Weekly nutritional summary: stacked bar chart by day

SCREEN: Hydration Tracker
— Large circular water fill animation (glass/bottle filling up)
— Current intake vs goal (e.g., "1,200 / 2,500 ml")
— Quick-log buttons: +250ml (glass), +500ml (bottle), custom amount
— Today's log: timeline of water intake entries
— Reminder settings: interval picker
— Weekly bar chart of daily intake
```

---

### Screen 8 — Social, Export & Advanced

```
SCREEN: Data Sharing
— Shared profiles list: name, relationship, permissions summary, last active
— Invite form: email input, relationship selector, permission toggles per data category
— Shared dashboard preview (read-only view as caregiver would see it)

SCREEN: Export & Data
— Export options: Medical ID (PDF), Health Report (PDF), Raw Data (CSV), Full Archive (ZIP)
— Date range picker
— Category checkboxes: Vitals, Medications, Meals, Mood, etc.
— Scheduled exports: weekly/monthly toggle with email delivery
— "Generate Export" button with progress indicator

SCREEN: Pregnancy Tracker (when pregnancy mode is ON)
— Week-by-week timeline: current week highlighted, fetal size comparison illustration
— Kick counter: large tap button with counter
— Contraction timer: start/stop with interval tracking
— Upcoming appointments: ultrasounds, blood tests
— Symptom log adapted for pregnancy

SCREEN: Practitioner Map
— Full-width interactive map (placeholder map tiles)
— Search bar at top with filter chips: Doctors, Dentists, Pharmacies, Specialists
— Results list overlaying bottom of map (draggable sheet on mobile)
— Each result: name, specialty, distance, rating stars, "Directions" button
— Favorite practitioners section
```

---

### Screen 9 — Settings & Profile

```
SCREEN: Profile / Settings
— Profile header: avatar (initials or photo), name, email, edit button
— Settings sections (grouped):

  Account:
  • Edit profile
  • Change password
  • Connected accounts (Google, Apple)
  • Delete account (danger zone)

  Preferences:
  • Language switcher (FR / EN with flags)
  • Dark mode toggle
  • Units (Metric / Imperial)
  • Notification settings

  Health Profile:
  • Update medical conditions
  • Update allergies
  • Update medications
  • Update fitness level & goals

  Data & Privacy:
  • Export data
  • Shared access management
  • Privacy dashboard (GDPR)
  • Consent management

  About:
  • App version
  • Terms of service
  • Privacy policy
  • Open source licenses
```

---

### Screen 10 — Notifications & Empty States

```
SCREEN: Notifications Center
— Grouped by date (Today, Yesterday, This week)
— Each notification: icon, title, description, timestamp, read/unread indicator
— Types: Medication reminder, Goal achieved, Streak milestone, Appointment reminder, Abnormal vital alert
— Swipe actions: Mark read, Dismiss
— "Mark all as read" header action

EMPTY STATES (generate one for each):
— No medications added: bunny holding a pill bottle, "Add your first medication"
— No vitals data: bunny with a stethoscope, "Start tracking your vitals"
— No journal entries: bunny with a notebook, "Write your first entry"
— No workouts logged: bunny stretching, "Let's get moving!"
— First-time dashboard: bunny waving, "Welcome! Let's set up your health profile"
Each empty state: centered illustration, heading, subtitle, CTA button
```

---

## 📐 Layout & Responsive Rules

```
RESPONSIVE BEHAVIOR:
— Desktop (≥1024px): Sidebar navigation (240px) + main content area, max-width 1280px centered
— Tablet (768–1023px): Collapsible sidebar + adaptive grid (2 columns)
— Mobile (<768px): Full-width content + fixed bottom tab bar (5 tabs with icons + labels)

COMPONENT PATTERNS:
— Cards: glass-panel (bg-white/80, backdrop-blur-xl, rounded-3xl, subtle border + shadow)
— Buttons primary: gradient primary-500→600, rounded-xl, shadow, hover:scale-1.02
— Buttons secondary: outlined, rounded-xl, hover:bg-gray-50
— Input fields: rounded-xl, gray-50 bg, focus:primary border + ring
— Charts: gradient fills matching palette, rounded line caps, subtle grid
— Modals: centered overlay with backdrop blur, slide-up on mobile (bottom sheet)
— Toast notifications: rounded-2xl, slide in from top-right on desktop, top on mobile
```

---

## 🎨 Color Reference (Exact Values)

| Token | Value | Usage |
|---|---|---|
| `primary-50` | `#fff1f2` | Lightest rose background |
| `primary-100` | `#ffe4e6` | Hover states, badges |
| `primary-200` | `#fecdd3` | Focus rings |
| `primary-300` | `#fda4af` | Decorative elements |
| `primary-400` | `#fb7185` | Active states |
| `primary-500` | `#f43f5e` | **Main brand color** |
| `primary-600` | `#e11d48` | Button gradients, links |
| `primary-700` | `#be123c` | Hover on primary buttons |
| `sage-50` | `#f6fbf9` | Lightest green bg |
| `sage-300` | `#a7f3d0` | Success indicators |
| `sage-500` | `#34d399` | **Secondary accent** |
| `sage-600` | `#059669` | Success text |
| Dark bg | `gray-900` / `gray-950` | Dark mode backgrounds |

---

## ✅ Checklist — What to Generate

| # | Screen | Desktop | Mobile |
|---|---|:---:|:---:|
| 1 | Login | ☐ | ☐ |
| 2 | Register | ☐ | ☐ |
| 3 | Email Verification | ☐ | ☐ |
| 4 | Onboarding (6 steps) | ☐ | ☐ |
| 5 | Dashboard (Home) | ☐ | ☐ |
| 6 | Vitals Overview | ☐ | ☐ |
| 7 | Steps Detail | ☐ | ☐ |
| 8 | Heart Rate Detail | ☐ | ☐ |
| 9 | Sleep Detail | ☐ | ☐ |
| 10 | Medicine Tracker | ☐ | ☐ |
| 11 | Medical ID | ☐ | ☐ |
| 12 | Health Checks & Vaccines | ☐ | ☐ |
| 13 | Guides & Articles | ☐ | ☐ |
| 14 | First Aid Guide | ☐ | ☐ |
| 15 | Mood Tracker | ☐ | ☐ |
| 16 | Period Tracker | ☐ | ☐ |
| 17 | Journal | ☐ | ☐ |
| 18 | Workouts | ☐ | ☐ |
| 19 | Relaxation & Meditation | ☐ | ☐ |
| 20 | Focus Helper | ☐ | ☐ |
| 21 | Nutrition / Food Diary | ☐ | ☐ |
| 22 | Hydration Tracker | ☐ | ☐ |
| 23 | Data Sharing | ☐ | ☐ |
| 24 | Export & Data | ☐ | ☐ |
| 25 | Pregnancy Tracker | ☐ | ☐ |
| 26 | Practitioner Map | ☐ | ☐ |
| 27 | Profile & Settings | ☐ | ☐ |
| 28 | Notifications Center | ☐ | ☐ |
| 29 | Empty States (5 variants) | ☐ | ☐ |
| 30 | Dark Mode variants (key screens) | ☐ | ☐ |
