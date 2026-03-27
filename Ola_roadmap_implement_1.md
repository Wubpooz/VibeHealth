










***

# VibeHealth — Ola Wellness Feature: Complete Vibe-Code Guide

This covers all 4 milestones from `roadmap-ola-wellness.md` — Mood Journal, Period Tracker, Pregnancy Mode, and Relaxation/Focus Sessions — with library recommendations for each domain and ready-to-paste prompts aligned with your Angular 21 + Hono + Prisma stack.

***

## Library Deep-Dive

### 🔊 Audio (Milestone 4 Priority)

**Howler.js** is the clear winner for the ambient audio player. It defaults to Web Audio API with an HTML5 Audio fallback, handles autoplay policy edge cases automatically, supports audio sprites (great for looping ambient tracks seamlessly), and is framework-agnostic so you wire it directly into an Angular `Injectable` service. You won't need `ngx-howler` (abandoned) — just use `howler` directly. [howlerjs](https://howlerjs.com)

```ts
// WellnessAudioService
import { Howl, Howler } from 'howler';
const rain = new Howl({ src: ['assets/audio/rain.webm', 'assets/audio/rain.mp3'], loop: true, volume: 0.5 });
rain.play();
```

**Tone.js** is worth knowing for generative synthesis (e.g., binaural beats for deep focus mode), but it's a heavy dependency (~200kb). Only reach for it if you want synthesized ambient tones, not pre-recorded audio. [tonejs.github](https://tonejs.github.io)

### 🎨 Visuals & Interaction

| Library | Use Case in Ola | Notes |
|---|---|---|
| **Motion.dev** (`motion/mini`) | Entry animations for mood cards, journal timeline, contraction timer pulses  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/ce803ee8-003f-4d4c-9005-e1d68da58e89/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYESLOK5XYI&Signature=Rz4%2BlNRpCZdTk8Zku5H%2F0egPaMM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJGMEQCICp%2FzmdwW3cKDu0VBBv%2BFUVm9tSV8LmbZ%2Ft4QdrGu9EiAiAs5w9me5V1s1flmXiFUvM%2Fq9YEnMaDGDZBvP6fsuItcCr8BAjk%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMsqplay3Xeofi3xp2KtAEnqYW8wGCC%2F2b9n1C%2FtbSXjj0oXsdwhiPBNUA9GP0mFhN14vJgeX21LYpnqNJornOyiqUr4nmk%2BbRyxHVGcBM%2FxaGF%2BhGLQNg%2BnqdjkIPQDeWrd1eZCmjkJm6rpTNBZEbs4CSQ7ikpD4v2hvVY1HKY1Vqh8hRP53jXlJqzbBDpMpvOACc6%2FWTqNUpT3FSq%2B6w8e9k9NoGh%2Ft0bzcliHK6AomPjrTMe9L5pUC6Ye2h5enVRyMSrmsZ%2BV4rH%2BseWqFis3N514No9Dh2BC6rATTliN6%2FAZYST7q8gh6Hstj5GbLuHc8FWOt%2F9n6rA7X6keF5Y5NHFIGwAR20hK6Wg1cUq1v%2Fx2xtg6d4scSdDRWQrVROpphPryBHTrPcLLXCp8X5ED0WohV0RZ5duQpD%2Bd7sztUVNpJjgOmySllqAAuqj1e5zPFbZM61T01v6oBHLA4mU19sIsxc4l%2BysvE2YHg1yDfVxRUrU%2FJ2%2FpCq8exjytBVI0vBrnfin12CPApr28ZjzTm1z%2BAopLyWHRaMaagOaXh2crbY3vn1z%2BEmK5JZoAYk%2BQtzU7eIDsGgYTI6bISp2lZ2fPNy%2B88ffUmD55CvM95awEDTgD9%2FMaBlqsWsOnZMU5SdxVPtHfzPwv4B40Bw9GN1RIyihYKR40fCqJyvypt2VMxOppUnIwChgIN0%2BM2%2Fiy2hc12Bxmp2QTBhPRIWHQkWyERe0in3Q5qvDUjZvZzvTffE1BA%2BouGa667LIxrWRjP8wVk5h41SDbSJmnwkJT20bJJWhBKKBa3tpPsnuTCtn5vOBjqZAY6QT2u7rlajrzw9PAGK3BvDmRt0zKTKr6vK8WmF3FnxkgwW39dTjcmPYeU6QhtEkH3Zp9e%2FJah6f%2F47zRg7S50%2FGG8Xl3P92af8kEfJkRyXOqoChP%2F5sD5peeVMqsr0YUO8j9ZedgGl1m6pRdBnZtQQ1t8k3z16W%2B%2BGnDjxBxOrOp491vLvFqi0fmOpMUpN8fvBZgpqggIssQ%3D%3D&Expires=1774637957) | Already in your stack, 2.3kb mini |
| **ngx-lottie** | Pregnancy week-by-week illustrations, mascot reward on streak  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/ce803ee8-003f-4d4c-9005-e1d68da58e89/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYESLOK5XYI&Signature=Rz4%2BlNRpCZdTk8Zku5H%2F0egPaMM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJGMEQCICp%2FzmdwW3cKDu0VBBv%2BFUVm9tSV8LmbZ%2Ft4QdrGu9EiAiAs5w9me5V1s1flmXiFUvM%2Fq9YEnMaDGDZBvP6fsuItcCr8BAjk%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMsqplay3Xeofi3xp2KtAEnqYW8wGCC%2F2b9n1C%2FtbSXjj0oXsdwhiPBNUA9GP0mFhN14vJgeX21LYpnqNJornOyiqUr4nmk%2BbRyxHVGcBM%2FxaGF%2BhGLQNg%2BnqdjkIPQDeWrd1eZCmjkJm6rpTNBZEbs4CSQ7ikpD4v2hvVY1HKY1Vqh8hRP53jXlJqzbBDpMpvOACc6%2FWTqNUpT3FSq%2B6w8e9k9NoGh%2Ft0bzcliHK6AomPjrTMe9L5pUC6Ye2h5enVRyMSrmsZ%2BV4rH%2BseWqFis3N514No9Dh2BC6rATTliN6%2FAZYST7q8gh6Hstj5GbLuHc8FWOt%2F9n6rA7X6keF5Y5NHFIGwAR20hK6Wg1cUq1v%2Fx2xtg6d4scSdDRWQrVROpphPryBHTrPcLLXCp8X5ED0WohV0RZ5duQpD%2Bd7sztUVNpJjgOmySllqAAuqj1e5zPFbZM61T01v6oBHLA4mU19sIsxc4l%2BysvE2YHg1yDfVxRUrU%2FJ2%2FpCq8exjytBVI0vBrnfin12CPApr28ZjzTm1z%2BAopLyWHRaMaagOaXh2crbY3vn1z%2BEmK5JZoAYk%2BQtzU7eIDsGgYTI6bISp2lZ2fPNy%2B88ffUmD55CvM95awEDTgD9%2FMaBlqsWsOnZMU5SdxVPtHfzPwv4B40Bw9GN1RIyihYKR40fCqJyvypt2VMxOppUnIwChgIN0%2BM2%2Fiy2hc12Bxmp2QTBhPRIWHQkWyERe0in3Q5qvDUjZvZzvTffE1BA%2BouGa667LIxrWRjP8wVk5h41SDbSJmnwkJT20bJJWhBKKBa3tpPsnuTCtn5vOBjqZAY6QT2u7rlajrzw9PAGK3BvDmRt0zKTKr6vK8WmF3FnxkgwW39dTjcmPYeU6QhtEkH3Zp9e%2FJah6f%2F47zRg7S50%2FGG8Xl3P92af8kEfJkRyXOqoChP%2F5sD5peeVMqsr0YUO8j9ZedgGl1m6pRdBnZtQQ1t8k3z16W%2B%2BGnDjxBxOrOp491vLvFqi0fmOpMUpN8fvBZgpqggIssQ%3D%3D&Expires=1774637957) | Already in stack; pair with LottieFiles free assets |
| **CSS keyframes** | Floating blob backgrounds, emoji mood selector hover, period calendar chip animations  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/9d9f22f2-f913-40e5-a1bd-bb89687f6654/SKILL.md?AWSAccessKeyId=ASIA2F3EMEYESLOK5XYI&Signature=M9AJywi5PWLzCVNsPOS35EJW544%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJGMEQCICp%2FzmdwW3cKDu0VBBv%2BFUVm9tSV8LmbZ%2Ft4QdrGu9EiAiAs5w9me5V1s1flmXiFUvM%2Fq9YEnMaDGDZBvP6fsuItcCr8BAjk%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMsqplay3Xeofi3xp2KtAEnqYW8wGCC%2F2b9n1C%2FtbSXjj0oXsdwhiPBNUA9GP0mFhN14vJgeX21LYpnqNJornOyiqUr4nmk%2BbRyxHVGcBM%2FxaGF%2BhGLQNg%2BnqdjkIPQDeWrd1eZCmjkJm6rpTNBZEbs4CSQ7ikpD4v2hvVY1HKY1Vqh8hRP53jXlJqzbBDpMpvOACc6%2FWTqNUpT3FSq%2B6w8e9k9NoGh%2Ft0bzcliHK6AomPjrTMe9L5pUC6Ye2h5enVRyMSrmsZ%2BV4rH%2BseWqFis3N514No9Dh2BC6rATTliN6%2FAZYST7q8gh6Hstj5GbLuHc8FWOt%2F9n6rA7X6keF5Y5NHFIGwAR20hK6Wg1cUq1v%2Fx2xtg6d4scSdDRWQrVROpphPryBHTrPcLLXCp8X5ED0WohV0RZ5duQpD%2Bd7sztUVNpJjgOmySllqAAuqj1e5zPFbZM61T01v6oBHLA4mU19sIsxc4l%2BysvE2YHg1yDfVxRUrU%2FJ2%2FpCq8exjytBVI0vBrnfin12CPApr28ZjzTm1z%2BAopLyWHRaMaagOaXh2crbY3vn1z%2BEmK5JZoAYk%2BQtzU7eIDsGgYTI6bISp2lZ2fPNy%2B88ffUmD55CvM95awEDTgD9%2FMaBlqsWsOnZMU5SdxVPtHfzPwv4B40Bw9GN1RIyihYKR40fCqJyvypt2VMxOppUnIwChgIN0%2BM2%2Fiy2hc12Bxmp2QTBhPRIWHQkWyERe0in3Q5qvDUjZvZzvTffE1BA%2BouGa667LIxrWRjP8wVk5h41SDbSJmnwkJT20bJJWhBKKBa3tpPsnuTCtn5vOBjqZAY6QT2u7rlajrzw9PAGK3BvDmRt0zKTKr6vK8WmF3FnxkgwW39dTjcmPYeU6QhtEkH3Zp9e%2FJah6f%2F47zRg7S50%2FGG8Xl3P92af8kEfJkRyXOqoChP%2F5sD5peeVMqsr0YUO8j9ZedgGl1m6pRdBnZtQQ1t8k3z16W%2B%2BGnDjxBxOrOp491vLvFqi0fmOpMUpN8fvBZgpqggIssQ%3D%3D&Expires=1774637957) | Zero cost, already defined in design system |
| **lucide-angular** | All icons (calendar, mic, timer, heart, baby)  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/ce803ee8-003f-4d4c-9005-e1d68da58e89/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYESLOK5XYI&Signature=Rz4%2BlNRpCZdTk8Zku5H%2F0egPaMM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJGMEQCICp%2FzmdwW3cKDu0VBBv%2BFUVm9tSV8LmbZ%2Ft4QdrGu9EiAiAs5w9me5V1s1flmXiFUvM%2Fq9YEnMaDGDZBvP6fsuItcCr8BAjk%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMsqplay3Xeofi3xp2KtAEnqYW8wGCC%2F2b9n1C%2FtbSXjj0oXsdwhiPBNUA9GP0mFhN14vJgeX21LYpnqNJornOyiqUr4nmk%2BbRyxHVGcBM%2FxaGF%2BhGLQNg%2BnqdjkIPQDeWrd1eZCmjkJm6rpTNBZEbs4CSQ7ikpD4v2hvVY1HKY1Vqh8hRP53jXlJqzbBDpMpvOACc6%2FWTqNUpT3FSq%2B6w8e9k9NoGh%2Ft0bzcliHK6AomPjrTMe9L5pUC6Ye2h5enVRyMSrmsZ%2BV4rH%2BseWqFis3N514No9Dh2BC6rATTliN6%2FAZYST7q8gh6Hstj5GbLuHc8FWOt%2F9n6rA7X6keF5Y5NHFIGwAR20hK6Wg1cUq1v%2Fx2xtg6d4scSdDRWQrVROpphPryBHTrPcLLXCp8X5ED0WohV0RZ5duQpD%2Bd7sztUVNpJjgOmySllqAAuqj1e5zPFbZM61T01v6oBHLA4mU19sIsxc4l%2BysvE2YHg1yDfVxRUrU%2FJ2%2FpCq8exjytBVI0vBrnfin12CPApr28ZjzTm1z%2BAopLyWHRaMaagOaXh2crbY3vn1z%2BEmK5JZoAYk%2BQtzU7eIDsGgYTI6bISp2lZ2fPNy%2B88ffUmD55CvM95awEDTgD9%2FMaBlqsWsOnZMU5SdxVPtHfzPwv4B40Bw9GN1RIyihYKR40fCqJyvypt2VMxOppUnIwChgIN0%2BM2%2Fiy2hc12Bxmp2QTBhPRIWHQkWyERe0in3Q5qvDUjZvZzvTffE1BA%2BouGa667LIxrWRjP8wVk5h41SDbSJmnwkJT20bJJWhBKKBa3tpPsnuTCtn5vOBjqZAY6QT2u7rlajrzw9PAGK3BvDmRt0zKTKr6vK8WmF3FnxkgwW39dTjcmPYeU6QhtEkH3Zp9e%2FJah6f%2F47zRg7S50%2FGG8Xl3P92af8kEfJkRyXOqoChP%2F5sD5peeVMqsr0YUO8j9ZedgGl1m6pRdBnZtQQ1t8k3z16W%2B%2BGnDjxBxOrOp491vLvFqi0fmOpMUpN8fvBZgpqggIssQ%3D%3D&Expires=1774637957) | Already in stack |
| **Chart.js via `ng2-charts`** | Cycle length history graph, mood trend over time, focus session streak graph | Lightweight, tree-shakeable, Angular-friendly |
| **`@ks89/angular-modal-gallery`** | Lightbox for journal image attachments | Or use a simple custom overlay matching Soft Pop style |

### 📸 Media Uploads (Milestone 1)

Use the **File API** + `@angular/common/http` multipart POST natively. For image previews, `URL.createObjectURL` gives instant local preview before upload. No extra library needed. For audio recording in the journal, use the native **MediaRecorder API** wrapped in a service — no library required.

### 📅 Calendar / Date Logic (Milestones 2–3)

**`date-fns`** (already likely in your project via Prisma/Zod tooling) handles all cycle math cleanly — `addDays`, `differenceInDays`, `eachDayOfInterval` for building the cycle calendar. For the calendar grid UI itself, a custom Angular component is cleaner than a heavy library given your Soft Pop design constraints.

For period prediction math, implement the standard formula:
- Next period: \(\text{lastPeriodStart} + \text{avgCycleLength}\)
- Fertile window: \(\text{nextPeriod} - 14 \pm 2\) days

***

## Milestone 1 — Mood Journal Foundations

> **Prompt 1: Backend Schema & Routes**

```
You are working on VibeHealth, a wellness PWA. The backend uses Bun + Hono + Prisma + PostgreSQL with Zod validation. Auth is handled by BetterAuth.

Add the following to `backend/prisma/schema.prisma`:
- `MoodLog` model: id, userId (FK User), date (DateTime, unique per user per day), mood (enum: GREAT GOOD NEUTRAL BAD AWFUL), freeText (String?), tags (String[]), streakDay (Int default 0), createdAt
- `JournalEntry` model: id, userId (FK User), title (String?), content (String richtext), mood (enum same), date (DateTime), tags (String[]), createdAt, updatedAt
- `MediaAttachment` model: id, journalEntryId (FK JournalEntry), type (enum: IMAGE AUDIO), url (String), filename (String), sizeBytes (Int), createdAt

Then create `backend/src/routes/wellness.routes.ts` under the `/api/v1/wellness` namespace with:
- POST /mood — create or upsert today's mood log, award 3 carrots via a call to RewardsService.awardCarrots(userId, 3)
- GET /mood — list mood logs for authenticated user, sorted by date desc
- POST /journal — create journal entry
- GET /journal — list journal entries with pagination, optional ?tag= and ?mood= filters
- GET /journal/:id — single entry with attached media
- DELETE /journal/:id — soft-check ownership then delete
- POST /journal/:id/media — multipart upload, store to /uploads, persist MediaAttachment record
All routes must use the existing BetterAuth session middleware and Zod input validation. Follow the pattern in `backend/src/routes/metrics.routes.ts`.
```

***

> **Prompt 2: Journal Frontend Feature**

```
You are building the `wellness` feature in VibeHealth's Angular 21 frontend. Follow all conventions from the SKILL files: standalone components, signals, inject(), OnPush, native control flow (@if/@for), motion/mini for animations, and the Soft Pop design system (coral/peach gradients, --radius-xl cards, --shadow-md).

Create `frontend/src/app/features/wellness/` with:

1. `wellness.routes.ts` — lazy routes: `/wellness/journal`, `/wellness/mood`

2. `WellnessService` (core service) with signals:
   - `moodLogs = signal<MoodLog[]>([])`
   - `journalEntries = signal<JournalEntry[]>([])`
   - `streak = computed(...)` counting consecutive days with an entry
   - Methods: `loadMoodLogs()`, `logMood(payload)`, `loadJournal()`, `createEntry(payload)`, `deleteEntry(id)`, `uploadMedia(entryId, file)`

3. `MoodSelectorComponent` — displays 6 emoji options (😁 😊 😐 😔 😢 😤) as pill chips using `.chip` design token styles. Selected mood gets coral background. Emits `moodSelected` output signal.

4. `JournalTimelineComponent` — vertical timeline of past `JournalEntry` items. Each card uses `.card` styles with a subtle left border color-coded by mood. Include inline delete with a confirm chip. Animate entrance with motion/mini stagger (delay i * 0.1s).

5. `JournalEditorComponent` — modal/overlay for creating entries. Contains: title input, rich textarea, MoodSelectorComponent, tag chip input (comma-separated), image/audio file uploader (File API + preview via URL.createObjectURL). On submit, POST to WellnessService.

6. `MoodCalendarComponent` — month grid (7×5 divs). Each day cell colored by mood enum (great=mint, good=coral-light, neutral=lavender, bad=peach, awful=error). Days without entries are muted.

All i18n strings must be added to both `en.json` and `fr.json`.
```

***

## Milestone 2 — Period Cycle Tracker

> **Prompt 3: Cycle Schema & Prediction Logic**

```
In VibeHealth backend, add to `schema.prisma`:
- `PeriodLog` model: id, userId (FK), startDate (DateTime), endDate (DateTime?), cycleLength (Int?), flow (enum: LIGHT MEDIUM HEAVY SPOTTING), symptoms (String[]), notes (String?), createdAt

Create `backend/src/services/cycle-prediction.service.ts`:
- `predictNextPeriod(logs: PeriodLog[]): Date` — computes average cycle length from last 3 cycles, adds to most recent startDate
- `getFertileWindow(nextPeriodDate: Date): { start: Date, end: Date }` — ovulation = nextPeriod minus 14 days, fertile = ovulation ± 3 days
- Export types `CyclePrediction { nextPeriod, fertileWindow, avgCycleLength }`

Add to `wellness.routes.ts`:
- POST /period — log period start/end, symptoms
- GET /period — list all period logs for user
- GET /period/prediction — return CyclePrediction from the service
- POST /period/reminder — save contraceptive pill reminder config: { time: string HH:MM, snooze: boolean } stored in user's profile JSON settings field
```

***

> **Prompt 4: Period Tracker UI**

```
Create `frontend/src/app/features/wellness/period/` in VibeHealth Angular 21.

1. `PeriodTrackerPageComponent` — main page with three sections:
   - Cycle calendar: month grid with color bands for period days (coral), fertile window (mint-light), predicted period (dashed coral border). Use date-fns `eachDayOfInterval` to compute ranges.
   - Prediction card: shows "Next period in X days" and fertile window dates. Use `.card-gradient` style with a subtle blob background.
   - Log button: opens `PeriodLogModalComponent`.

2. `PeriodLogModalComponent` — modal overlay with:
   - "Period started today" / "Period ended today" toggle buttons
   - Flow intensity selector (4 options as chips: Light, Medium, Heavy, Spotting)  
   - Symptom multi-select using the existing `AutocompleteComponent` (pre-populated list: cramps, bloating, headache, fatigue, mood-swings, back-pain, nausea)
   - Notes textarea
   - Submit calls WellnessService.logPeriod()

3. `PillReminderComponent` — small settings card. Time picker input (type="time"), snooze toggle, Save button. On save, register a Web Push notification using the existing Angular Service Worker setup. Show a `.chip-coral` confirmation badge on success.

Use Soft Pop design tokens throughout. Add all strings to en.json/fr.json.
```

***

## Milestone 3 — Pregnancy Mode

> **Prompt 5: Pregnancy Schema & Toggle**

```
In VibeHealth backend, add to schema.prisma:
- `Pregnancy` model: id, userId (FK, unique), dueDate (DateTime), lastPeriodDate (DateTime), mode (enum: TRACKING PREGNANCY, default TRACKING), createdAt, updatedAt
- `PregnancyLog` model: id, pregnancyId (FK), week (Int), weight (Float?), symptoms (String[]), notes (String?), kickCount (Int default 0), contractionLogs (Json default []), createdAt

Add to wellness.routes.ts:
- GET/POST/PATCH /pregnancy — manage pregnancy record
- POST /pregnancy/kick — increment kickCount for today's log
- POST /pregnancy/contraction — append { start, end, duration } to contractionLogs JSON array
- GET /pregnancy/week-guide/:week — return static week guide data (fetal size comparison, development milestone, adapted symptom list) from a seeded JSON file at backend/src/data/pregnancy-weeks.json (create entries for weeks 1–40)
```

***

> **Prompt 6: Pregnancy UI**

```
Create `frontend/src/app/features/wellness/pregnancy/` in VibeHealth Angular 21.

1. `PregnancyModeToggleComponent` — settings card showing current mode (Period Tracker vs Pregnancy Mode). Toggle switch with a confirmation modal ("Switch to Pregnancy Mode — enter your due date"). Animates transition with motion/mini scale spring. Update user profile via WellnessService.

2. `WeekGuideComponent` — week-by-week card showing:
   - Fetal size comparison (e.g., "Your baby is the size of a lemon 🍋") — use emoji + text
   - Development milestone paragraph from week-guide API
   - Adapted symptom checklist (checkboxes log to PregnancyLog symptoms)
   Use ngx-lottie with a free baby/growth Lottie animation (path: assets/animations/baby-growth.json)

3. `KickCounterComponent` — large tappable button (full coral gradient circle, --radius-full). Each tap POSTs to /pregnancy/kick and increments a local signal counter with a spring scale animation via motion/mini. Show today's kick count with a mint chip badge.

4. `ContractionTimerComponent` — Start/Stop button. On Start: record timestamp to signal, start a visible mm:ss counter using RxJS interval. On Stop: compute duration, POST to /pregnancy/contraction, append to local contractionLogs signal. Display last 5 contractions in a table (start time, duration, gap from previous). Color-code gap: green >10min, yellow 5-10min, red <5min.
```

***

## Milestone 4 — Relaxation & Focus Sessions

> **Prompt 7: Focus Session Backend**

```
In VibeHealth backend, add to schema.prisma:
- `FocusSession` model: id, userId (FK), type (enum: POMODORO MEDITATION AMBIENT), durationMinutes (Int), completedAt (DateTime?), interrupted (Boolean default false), carrotsEarned (Int default 0), createdAt

Add to wellness.routes.ts:
- POST /focus/start — create a FocusSession record with status pending
- PATCH /focus/:id/complete — mark completed, award carrots via RewardsService.awardCarrots(userId, 5)
- PATCH /focus/:id/interrupt — mark interrupted (no carrot reward)
- GET /focus/streak — aggregate query: count consecutive days with at least one completed session
```

***

> **Prompt 8: Ambient Audio Player**

```
Create `frontend/src/app/features/wellness/focus/audio/` in VibeHealth Angular 21.

Install howler: `npm install howler` and `npm install -D @types/howler`.

1. `WellnessAudioService` (Injectable providedIn root):
   - Signals: `currentTrack = signal<AmbientTrack | null>(null)`, `isPlaying = signal(false)`, `volume = signal(0.6)`
   - `AmbientTrack` type: { id, label, labelFr, file, emoji }
   - Tracks list (signal): Rain 🌧, Forest 🌲, Ocean 🌊, White Noise 🌫, Cafe ☕, Fire 🔥 — files from assets/audio/ambient/*.webm
   - Use `Howl` with `loop: true`. On play, fade in over 1.5s with `howl.fade(0, volume, 1500)`. On stop, fade out then unload.
   - `setVolume(v: number)` updates both signal and `Howler.volume(v)`
   - Handle AudioContext autoplay policy: only instantiate Howl after first user gesture

2. `AmbientPlayerComponent` — compact player card with:
   - 6 track tiles (emoji + label) as selectable chips. Active track gets coral shadow.
   - Play/Pause button (lucide-angular Play/Pause icon, animated with app-animated-icon)
   - Volume slider (range input, styled with Soft Pop tokens)
   - Displays currently playing label with a subtle pulsing dot indicator (CSS pulse-soft keyframe)

Use Soft Pop design tokens. Respect prefers-reduced-motion for the pulsing dot.
```

***

> **Prompt 9: Pomodoro & Focus Timer**

```
Create `FocusTimerComponent` in `frontend/src/app/features/wellness/focus/` in VibeHealth Angular 21.

The timer supports 3 modes: Pomodoro (25/5), Deep Work (50/10), Custom (user-defined).

State (all signals):
- `phase: signal<'work' | 'break'>('work')`
- `timeLeft: signal<number>` (seconds)
- `sessionId: signal<string | null>(null)`
- `isRunning: signal<boolean>(false)`

Timer logic: use RxJS `interval(1000).pipe(takeUntilDestroyed(...))` to tick down. On reaching 0: play a soft completion chime via WellnessAudioService (a short bell.mp3 from assets/audio/sfx/), PATCH /focus/:id/complete, award carrots, trigger mascot happy state via MascotComponent, switch phase.

Bunny penalty: if the user navigates away mid-session (use `HostListener('window:beforeunload')`), PATCH /focus/:id/interrupt and show a sad mascot state.

Screen lock mechanism: on session start, use the Screen Wake Lock API (`navigator.wakeLock.request('screen')`) to prevent sleep. Release lock on session end/interrupt.

UI:
- Large circular countdown ring: SVG circle with `stroke-dasharray` / `stroke-dashoffset` driven by timeLeft signal. Coral gradient stroke.
- Below: mode selector chips, Start/Pause/Reset buttons using `.btn-primary` / `.btn-secondary`
- Streak badge: displays today's completed session count as a `.chip-coral`
- Wire to WellnessAudioService: auto-start ambient audio on work phase start, pause on break.
```

***

## Integration & Routing

> **Prompt 10: Wellness Shell & Navigation**

```
Create the wellness feature shell in VibeHealth Angular 21.

1. Add wellness routes to `app.routes.ts` (lazy-loaded, behind authGuard):
   { path: 'wellness', children: [
     { path: 'journal', component: JournalTimelineComponent },
     { path: 'mood', component: MoodCalendarComponent },
     { path: 'period', component: PeriodTrackerPageComponent },
     { path: 'pregnancy', component: WeekGuideComponent },
     { path: 'focus', component: FocusTimerComponent },
   ]}

2. Add a Wellness section to the dashboard navigation with a lavender accent chip. Use lucide-angular icons: BookOpen (journal), Heart (mood), Calendar (period), Baby (pregnancy), Timer (focus).

3. Create a `WellnessStreakBannerComponent` — displays across all wellness sub-pages: "🔥 X day streak — keep going!" using streak computed from WellnessService. Animate entrance with motion/mini fade-in-up. Award 3 carrots on reaching streaks of 7, 14, 30 via RewardsService.

4. Add i18n keys for all wellness sections to both en.json and fr.json. Use namespace pattern: `wellness.journal.*`, `wellness.mood.*`, `wellness.period.*`, `wellness.pregnancy.*`, `wellness.focus.*`.
```

***

## Key Library Summary

| Milestone | Library | Install |
|---|---|---|
| Audio playback (M4) | **howler** + `@types/howler` | `npm i howler` |
| Mood/Focus trends chart | **ng2-charts** + **chart.js** | `npm i ng2-charts chart.js` |
| Date math (cycles, weeks) | **date-fns** | `npm i date-fns` |
| Animations | motion/mini, ngx-lottie | already in stack  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/ce803ee8-003f-4d4c-9005-e1d68da58e89/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYESLOK5XYI&Signature=Rz4%2BlNRpCZdTk8Zku5H%2F0egPaMM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJGMEQCICp%2FzmdwW3cKDu0VBBv%2BFUVm9tSV8LmbZ%2Ft4QdrGu9EiAiAs5w9me5V1s1flmXiFUvM%2Fq9YEnMaDGDZBvP6fsuItcCr8BAjk%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMsqplay3Xeofi3xp2KtAEnqYW8wGCC%2F2b9n1C%2FtbSXjj0oXsdwhiPBNUA9GP0mFhN14vJgeX21LYpnqNJornOyiqUr4nmk%2BbRyxHVGcBM%2FxaGF%2BhGLQNg%2BnqdjkIPQDeWrd1eZCmjkJm6rpTNBZEbs4CSQ7ikpD4v2hvVY1HKY1Vqh8hRP53jXlJqzbBDpMpvOACc6%2FWTqNUpT3FSq%2B6w8e9k9NoGh%2Ft0bzcliHK6AomPjrTMe9L5pUC6Ye2h5enVRyMSrmsZ%2BV4rH%2BseWqFis3N514No9Dh2BC6rATTliN6%2FAZYST7q8gh6Hstj5GbLuHc8FWOt%2F9n6rA7X6keF5Y5NHFIGwAR20hK6Wg1cUq1v%2Fx2xtg6d4scSdDRWQrVROpphPryBHTrPcLLXCp8X5ED0WohV0RZ5duQpD%2Bd7sztUVNpJjgOmySllqAAuqj1e5zPFbZM61T01v6oBHLA4mU19sIsxc4l%2BysvE2YHg1yDfVxRUrU%2FJ2%2FpCq8exjytBVI0vBrnfin12CPApr28ZjzTm1z%2BAopLyWHRaMaagOaXh2crbY3vn1z%2BEmK5JZoAYk%2BQtzU7eIDsGgYTI6bISp2lZ2fPNy%2B88ffUmD55CvM95awEDTgD9%2FMaBlqsWsOnZMU5SdxVPtHfzPwv4B40Bw9GN1RIyihYKR40fCqJyvypt2VMxOppUnIwChgIN0%2BM2%2Fiy2hc12Bxmp2QTBhPRIWHQkWyERe0in3Q5qvDUjZvZzvTffE1BA%2BouGa667LIxrWRjP8wVk5h41SDbSJmnwkJT20bJJWhBKKBa3tpPsnuTCtn5vOBjqZAY6QT2u7rlajrzw9PAGK3BvDmRt0zKTKr6vK8WmF3FnxkgwW39dTjcmPYeU6QhtEkH3Zp9e%2FJah6f%2F47zRg7S50%2FGG8Xl3P92af8kEfJkRyXOqoChP%2F5sD5peeVMqsr0YUO8j9ZedgGl1m6pRdBnZtQQ1t8k3z16W%2B%2BGnDjxBxOrOp491vLvFqi0fmOpMUpN8fvBZgpqggIssQ%3D%3D&Expires=1774637957) |
| Icons | lucide-angular | already in stack  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/ce803ee8-003f-4d4c-9005-e1d68da58e89/SKILL-2.md?AWSAccessKeyId=ASIA2F3EMEYESLOK5XYI&Signature=Rz4%2BlNRpCZdTk8Zku5H%2F0egPaMM%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEBsaCXVzLWVhc3QtMSJGMEQCICp%2FzmdwW3cKDu0VBBv%2BFUVm9tSV8LmbZ%2Ft4QdrGu9EiAiAs5w9me5V1s1flmXiFUvM%2Fq9YEnMaDGDZBvP6fsuItcCr8BAjk%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDY5OTc1MzMwOTcwNSIMsqplay3Xeofi3xp2KtAEnqYW8wGCC%2F2b9n1C%2FtbSXjj0oXsdwhiPBNUA9GP0mFhN14vJgeX21LYpnqNJornOyiqUr4nmk%2BbRyxHVGcBM%2FxaGF%2BhGLQNg%2BnqdjkIPQDeWrd1eZCmjkJm6rpTNBZEbs4CSQ7ikpD4v2hvVY1HKY1Vqh8hRP53jXlJqzbBDpMpvOACc6%2FWTqNUpT3FSq%2B6w8e9k9NoGh%2Ft0bzcliHK6AomPjrTMe9L5pUC6Ye2h5enVRyMSrmsZ%2BV4rH%2BseWqFis3N514No9Dh2BC6rATTliN6%2FAZYST7q8gh6Hstj5GbLuHc8FWOt%2F9n6rA7X6keF5Y5NHFIGwAR20hK6Wg1cUq1v%2Fx2xtg6d4scSdDRWQrVROpphPryBHTrPcLLXCp8X5ED0WohV0RZ5duQpD%2Bd7sztUVNpJjgOmySllqAAuqj1e5zPFbZM61T01v6oBHLA4mU19sIsxc4l%2BysvE2YHg1yDfVxRUrU%2FJ2%2FpCq8exjytBVI0vBrnfin12CPApr28ZjzTm1z%2BAopLyWHRaMaagOaXh2crbY3vn1z%2BEmK5JZoAYk%2BQtzU7eIDsGgYTI6bISp2lZ2fPNy%2B88ffUmD55CvM95awEDTgD9%2FMaBlqsWsOnZMU5SdxVPtHfzPwv4B40Bw9GN1RIyihYKR40fCqJyvypt2VMxOppUnIwChgIN0%2BM2%2Fiy2hc12Bxmp2QTBhPRIWHQkWyERe0in3Q5qvDUjZvZzvTffE1BA%2BouGa667LIxrWRjP8wVk5h41SDbSJmnwkJT20bJJWhBKKBa3tpPsnuTCtn5vOBjqZAY6QT2u7rlajrzw9PAGK3BvDmRt0zKTKr6vK8WmF3FnxkgwW39dTjcmPYeU6QhtEkH3Zp9e%2FJah6f%2F47zRg7S50%2FGG8Xl3P92af8kEfJkRyXOqoChP%2F5sD5peeVMqsr0YUO8j9ZedgGl1m6pRdBnZtQQ1t8k3z16W%2B%2BGnDjxBxOrOp491vLvFqi0fmOpMUpN8fvBZgpqggIssQ%3D%3D&Expires=1774637957) |
| MediaRecorder (journal audio) | Native browser API | no install |
| Screen Wake Lock (Pomodoro) | Native browser API | no install |

Howler.js is the most important new dependency here — it gives you seamless looping, cross-browser codec fallbacks, and fade in/out APIs with a single clean service wrapper. All other audio needs (SFX bell chimes) can be simple `Howl` instances. Avoid `ngx-audio-player` as it targets Angular ≤16 and breaks with Angular 21 standalone patterns. [github](https://github.com/goldfire/howler.js/)


Here's a complete breakdown of every asset you'll need for the Ola wellness feature, where to find each one, and how to prepare it for the app.

***

## Asset Map by Category

### 🔊 Ambient Audio (Milestone 4)

You need 6 looping ambient tracks + 1 short SFX bell for the Pomodoro completion. The format strategy is: **primary `.webm` (Opus codec) + fallback `.mp3`** — Howler.js handles the fallback automatically. [stackoverflow](https://stackoverflow.com/questions/67034367/how-to-add-mp3-to-webm-file)

**Best free sources (no attribution required):**

- **Pixabay** (pixabay.com/music) — all tracks are CC0, free commercial use, direct MP3 download. Search: `rain ambient`, `forest ambience`, `ocean waves`, `white noise`, `cafe background`, `fireplace crackling` [youtube](https://www.youtube.com/watch?v=SoOTDt_EZ7Q)
- **Mixkit** (mixkit.co/free-sound-effects) — Mixkit License allows free use in apps, no credit needed. Has clean looping nature/rain/ocean files ready to go [mixkit](https://mixkit.co/free-sound-effects/ocean/)
- **99Sounds** (99sounds.org/nature-sounds) — professional 24-bit field recordings, royalty-free, great for rain/forest/water [99sounds](https://99sounds.org/nature-sounds/)

**Convert to WebM/Opus after downloading:**
```bash
# Single file MP3 → WebM (Opus)
ffmpeg -i rain.mp3 -c:a libopus -b:a 96k rain.webm

# Batch convert all MP3s in a folder
for f in *.mp3; do ffmpeg -i "$f" -c:a libopus -b:a 96k "${f%.mp3}.webm"; done
```
WebM/Opus gives you half the file size of MP3 at equivalent quality. Place both files in `frontend/src/assets/audio/ambient/` and `assets/audio/sfx/` for the bell. [stackoverflow](https://stackoverflow.com/questions/67034367/how-to-add-mp3-to-webm-file)

**Target file tree:**
```
assets/audio/
├── ambient/
│   ├── rain.webm / rain.mp3
│   ├── forest.webm / forest.mp3
│   ├── ocean.webm / ocean.mp3
│   ├── whitenoise.webm / whitenoise.mp3
│   ├── cafe.webm / cafe.mp3
│   └── fire.webm / fire.mp3
└── sfx/
    └── bell.webm / bell.mp3
```

For the bell SFX, search **Mixkit** → "bell chime" or "soft notification" — pick something under 2 seconds.

***

### 🎞️ Lottie Animations (Milestones 3 & 4)

You need 3 Lottie JSON files. All are available free under the **Lottie Simple License** (free for use in products).

| Asset | Where to Find | Search Query |
|---|---|---|
| `baby-growth.json` (week guide) | [LottieFiles](https://lottiefiles.com/free-animations/baby-care)  [lottiefiles](https://lottiefiles.com/free-animations/baby-care) | "pregnancy", "baby growth", "fetal" |
| `meditation.json` (focus/relaxation) | [LottieFiles](https://lottiefiles.com/free-animations/meditating)  [lottiefiles](https://lottiefiles.com/free-animations/meditating) | "meditation", "breathe", "mindfulness" |
| `mascot-happy.json` / `mascot-sad.json` | Already in your stack  [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/ce803ee8-003f-4d4c-9005-e1d68da58e89/SKILL-2.md) | Already exists as `assets/animations/mascot.json` |

On LottieFiles, filter by **"Free"** and **"Lottie JSON"** format. Download the `.json` file directly and drop it in `frontend/src/assets/animations/`. For IconScout, the same applies. [iconscout](https://iconscout.com/lottie-animations/pregnancy-exercise)

> ⚠️ Always check the specific animation's license — most LottieFiles community animations use "Lottie Simple License" which allows product use but not redistribution of the raw file.

***

### 😊 Mood Emoji / Icons (Milestone 1)

You have two good approaches depending on how custom you want to go:

**Option A — Native Unicode emoji (recommended for speed)**
Just use the emoji characters directly in the template — no asset needed. They render cross-platform and respect the Soft Pop playful tone:
```
😁 GREAT  😊 GOOD  😐 NEUTRAL  😔 BAD  😢 AWFUL  😤 STRESSED
```

**Option B — Custom SVG emoji set (for pixel-perfect consistency)**
- **Twemoji** (github.com/twitter/twemoji) — MIT licensed, open source, consistent rendering across all platforms. Download individual SVGs per emoji or use the CDN
- **Noto Emoji** (fonts.google.com/noto/specimen/Noto+Emoji) — Apache 2.0, Google's open emoji set

Place any custom SVGs in `frontend/src/assets/icons/mood/`.

***

### 📅 Pregnancy Week Guide Data (Milestone 3)

This is a **JSON data asset**, not a visual. You need to create `backend/src/data/pregnancy-weeks.json` with 40 entries. The content (fetal sizes, milestones) is factual/medical — you can:

1. **Generate it with an AI prompt** — ask your vibe-coding AI: *"Generate a JSON array of 40 objects, each with fields: week (1–40), fetalSize (object with comparison and emoji, e.g. {label: 'poppy seed', emoji: '🌱'}), milestone (1-sentence development note), symptoms (array of 3-5 strings)"*
2. Cross-reference with public health sources (WHO, NHS) for accuracy

***

### 🖼️ Soft Pop Backgrounds & Textures

These are **generated in CSS** — no external files needed. Your design system already defines everything: [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/103996491/9d9f22f2-f913-40e5-a1bd-bb89687f6654/SKILL.md)
- Gradient mesh backgrounds → `radial-gradient` in CSS
- Noise texture → inline SVG `<feTurbulence>` data URI
- Blob morphing → CSS `@keyframes blob-morph`

The only exception is if you want a subtle **paper/grain texture image**. For that, generate one with [Noise Texture Generator](https://www.noisetexturegenerator.com/) (free, no license issues) and export as a 200×200 WebP at ~3KB.

***

### 🔔 Web Push Notification Icon (Milestone 2)

For pill reminders, the PWA needs a notification icon (`assets/icons/notification-icon.png`, 192×192). Use your existing app icon or export a coral-colored pill emoji variant. Your Angular Service Worker config in `ngsw-config.json` already supports this.

***

## Complete Asset Checklist

```
frontend/src/assets/
├── audio/
│   ├── ambient/        ← 6 tracks × 2 formats (Pixabay / Mixkit)
│   └── sfx/
│       └── bell.*      ← 1 short chime (Mixkit)
├── animations/
│   ├── mascot.json     ← already exists
│   ├── baby-growth.json   ← LottieFiles
│   └── meditation.json    ← LottieFiles
├── icons/
│   └── mood/           ← optional SVG emojis (Twemoji) or use Unicode
└── images/
    └── noise.webp      ← optional grain texture (~3KB)

backend/src/data/
└── pregnancy-weeks.json  ← AI-generated + medically reviewed
```

The total added asset weight should stay under **~2MB** if you encode ambient audio at 96kbps Opus (each ~1.5min loop ≈ 1MB) — keep loops short (60–90s) since Howler loops them seamlessly anyway.