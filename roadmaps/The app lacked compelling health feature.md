The app lacked compelling health features and a meaningful dashboard — it was an auth skeleton with a "working!" message. This adds three substantive features that make the product demo-worthy.

Dashboard (/dashboard)
Replaced placeholder content with a full health hub
Time-of-day greeting with user's first name
Mood logger: 6-emoji picker, persists to localStorage, awards +2 🥕
Hydration tracker: animated progress bar, per-glass buttons, +1/+5 🥕 rewards
Stats grid: streak / level / carrots
Level XP progress bar
Quick-action grid (Medical ID, First Aid, Journal, Profile) with gradient icon tiles
Recent carrot activity feed
First Aid Guide (/first-aid)
8 emergency procedures: CPR, Choking, Burns, Bleeding, Fracture, Shock, Anaphylaxis, Seizure
Severity tiers: 🚨 Critical / ⚠️ Urgent / 💙 Moderate with color-coded cards
Keyword search + severity filter pills
Expandable step-by-step accordion with numbered steps
Sticky tel:112 emergency call button always in header
Fully static — works offline out of the box
Health Journal (/journal)
6-emoji mood selector + free-text entry per day
localStorage persistence with streak counter
Timeline of past entries with inline delete
+3 🥕 per entry via RewardsService
Supporting changes
Added /first-aid and /journal lazy routes behind authGuard
Extended en.json / fr.json with all new keys (DASHBOARD.*, FIRST_AID.*, JOURNAL.*)
Used TranslateService.instant() for runtime-computed strings (greetings, relative dates, severity labels)
Fixed [(ngModel)] ↔ signal incompatibility in journal by using a plain property with explicit [ngModel] / (ngModelChange) binding
