# 🏛️ QueueLess Kacheri (NagrikSeva AI) – Team Development Roadmap & Architecture

> **Official Gujarat Government DPI Hackathon Project**  
> **Repository:** [hkPatel26/Queueless-government](https://github.com/hkPatel26/Queueless-government)  
> **Target Deployments:** 33 Districts, 250+ Talukas, 18,000+ Villages across Gujarat  

---

## 📌 ૧. ટીમ વિભાજન & બ્રાન્ચ સ્ટ્રેટેજી (Team Branch Split)

પ્રોજેક્ટનું ડેવલપમેન્ટ બે સ્વતંત્ર ટ્રેકમાં વહેંચવામાં આવ્યું છે જેથી ગિટ મર્જ કોન્ફ્લિક્ટ (Git Merge Conflict) ન થાય અને બંને ડેવલપર એકસાથે સ્પીડમાં કામ કરી શકે:

| ટ્રેક | ગિટ બ્રાન્ચ (Branch) | ફોકસ એરિયા (Scope) | ડેવલપર |
| :--- | :--- | :--- | :--- |
| **Track 1: Citizen Side** | `main` | નાગરિક પોર્ટલ (૩૯ યોજનાઓ, સ્લોટ બુકિંગ, ડિજિટલ પાસ, કચેરી રડાર) | Dev 1 (User Lead) |
| **Track 2: Admin Side** | `dev-hari` | મામલતદાર કાઉન્ટર ડેસ્ક, કલેક્ટર/DDO મોનિટરિંગ & SLA હીટમેપ | Dev 2 (Admin Lead - Hari) |

---

## 📂 ૨. ઝીરો-કોન્ફ્લિક્ટ ફોલ્ડર આર્કિટેક્ચર (Zero-Conflict Directory Layout)

બંને ડેવલપર અલગ ફોલ્ડર્સમાં કામ કરશે, જેથી જ્યારે અંતે બ્રાન્ચ મર્જ થાય ત્યારે ૧ લાઈનનો પણ કોન્ફ્લિક્ટ ન થાય:

```
Queueless-government/
├── app/
│   ├── page.tsx                  <-- [TRACK 1: main] Citizen Landing, Dashboard, 39 Schemes
│   ├── globals.css               <-- [SHARED] Global Styles, Mobile Scroll Locks, Theme
│   ├── layout.tsx                <-- [SHARED] Root App Layout & Safe-area Viewport
│   └── admin/                    <-- [TRACK 2: dev-hari] EXCLUSIVE FOR ADMIN TEAM
│       ├── page.tsx              <-- એડમિન પોર્ટલ હોમ (Login as Mamlatdar / Collector)
│       ├── counter/page.tsx      <-- કાઉન્ટર ઓપરેટર ડેસ્ક (Counter 1 to 6 Live Control)
│       └── collector/page.tsx    <-- ૩૩ જિલ્લાઓનો કલેક્ટર લાઇવ કમાન્ડ રૂમ & SLA ડેશબોર્ડ
│
├── components/
│   ├── SchemesCatalog.tsx        <-- [TRACK 1: main] ૩૯ સત્તાવાર યોજનાઓ કેટાલોગ
│   ├── SchemeDrawer.tsx          <-- [TRACK 1: main] યોજના જરૂરી દસ્તાવેજ ડ્રોઅર
│   ├── CameraScannerModal.tsx    <-- [TRACK 1: main] AI OCR & Google Drive અપલોડ
│   ├── SlotBookingModal.tsx      <-- [TRACK 1: main] ૩૩ જિલ્લા સરકારી સ્લોટ બુકિંગ શીટ
│   ├── DigitalTokenPass.tsx      <-- [TRACK 1: main] ત્રિરંગા QR ડિજિટલ પાસ + મોડું થાય છે
│   └── admin/                    <-- [TRACK 2: dev-hari] EXCLUSIVE ADMIN COMPONENTS
│       ├── CounterDesk.tsx       <-- કોલ નેક્સ્ટ, માર્ક કમ્પ્લીટ, સ્કીપ કંટ્રોલ પેનલ
│       ├── CollectorHeatmap.tsx  <-- ૩૩ જિલ્લા લાઈવ ભીડ & ટ્રાફિક ગેજ
│       ├── SlaBreachWatchdog.tsx <-- GRTSA ૨૦૧૩ સમયમર્યાદા ઉલ્લંઘન એલર્ટ સિસ્ટમ
│       └── DocumentReviewer.tsx  <-- નાગરિકે અપલોડ કરેલા કાગળોનું સ્ક્રીન પ્રિવ્યૂ
│
└── lib/                          <-- [SHARED CORE LAYER: બંને બ્રાન્ચ ઉપયોગ કરશે]
    ├── jurisdiction-data.ts      <-- ૩૩ જિલ્લા, ૨૫૦+ તાલુકા, જન સેવા કેન્દ્રો & કાઉન્ટર ૧-૬
    ├── slot-engine.ts            <-- ૧૦:૩૦-૧૮:૧૦ કેપ્ડ સ્લોટ્સ, લંચ બ્રેક & ૨૦૨૬ રજાઓ
    ├── schemes-data.ts           <-- ૩૯ સત્તાવાર ગુજરાત સરકારી યોજનાઓની વિગતો
    ├── ocr-validator.ts          <-- AI દસ્તાવેજ કાનૂની નિયમ ચકાસણી એન્જિન
    ├── realtime-bus.ts           <-- User & Admin વચ્ચેનું લાઈવ સિંક્રોનાઇઝેશન એન્જિન
    ├── voice.ts                  <-- ગુજરાતી/હિન્દી/અંગ્રેજી TTS ઓડિયો ગાઈડન્સ
    └── haptics.ts                <-- મોબાઈલ વાઇબ્રેશન ફીડબેક સિસ્ટમ
```

---

## 🚀 ૩. તબક્કાવાર રોડમેપ (Phase-wise Roadmap)

### ✅ Phase 1 થી 6 (સંપૂર્ણ પૂર્ણ થયેલ તબક્કા - 100% Completed)
- [x] **Phase 1:** Next.js 14 App Router, લાઇવ કતાર રડાર, કાઉન્ટર ૧-૬ ટીવી સ્ક્રીન, Mohanbhai & Mamlatdar 1-Click ડેમો, ગુજરાતી વોઇસ & વાઇબ્રેશન.
- [x] **Phase 2:** ૩૯ ગુજરાત યોજનાઓ, AI OCR નિયમ એન્જિન (૨૦૨૬: <૨૦૨૩ એક્સપાયરી ચેક), CamScanner & Google Drive/Folder અપલોડ, 2FA સિવિક લોગિન.
- [x] **Phase 3:** ૩૩ જિલ્લા & તાલુકા જન સેવા કેન્દ્ર ઓટો-કાઉન્ટર રાઉટીંગ, સરકારી કેપ્ડ સ્લોટ એન્જિન (૫ ટોકન/કલાક), લંચ રિસેસ & રજાઓ બ્લોકર, સત્તાવાર ડિજિટલ પાસ (QR), "+૩ સ્લોટ / ૩૬ મિનિટ મોડું થાય છે" શિફ્ટર, ઑફલાઇન LocalStorage કૅશ, વોટ્સએપ બોટ સિમ્યુલેટર.
- [x] **Phase 4:** ૧૦૦% મોબાઈલ રિસ્પોન્સિવ (૩૨૦px iPhone SE/Android ફિટ, ઝીરો વર્ડ કટ), બુલેટપ્રૂફ બેકગ્રાઉન્ડ બોડી સ્ક્રોલ લોક, આઉટસાઇડ ટેપ ક્લોઝ, નેટિવ બોટમ નેવિગેશન બાર, 48px ટચ ટાર્ગેટ્સ.
- [x] **Phase 5A:** કાઉન્ટર ઓપરેટર ડેસ્ક (`app/admin/counter/page.tsx`), GSWAN ઓફિસર HUD, વરિષ્ઠ નાગરિક (#P-XX) અગ્રતા સોર્ટિંગ, AI OCR દસ્તાવેજ નિરીક્ષક, GRTSA ૧૫m કાનૂની SLA ક્લોક, કાઉન્ટર ટ્રાન્સફર, લંચ રિસેસ ટોગલ.
- [x] **Phase 5B:** કલેક્ટર & DDO કમાન્ડ સેન્ટર (`app/admin/collector/page.tsx`), ગુજરાત ૩૩ જિલ્લા લાઈવ ભીડ હીટમેપ, GRTSA SLA વોચડોગ, પીક અવર્સ ચાર્ટ, દૈનિક MIS રિપોર્ટ એક્સપોર્ટ.
- [x] **Phase 5C:** સીમલેસ ક્રોસ-નેવિગેશન લિંક્સ (Header, Demo menu, Footer).
- [x] **Phase 6: રીઅલ-ટાઇમ સિંક્રોનાઇઝેશન આર્કિટેક્ચર (Real-Time Synchronization Layer):**
  - **Cross-Device Layer:** બેકએન્ડ રીઅલ-ટાઇમ ટ્રાન્સપોર્ટ (`/api/queue-events`) દ્વારા અલગ-અલગ ડિવાઇસીસ (ફોન ↔ લેપટોપ) વચ્ચે ઇવેન્ટ સિંક્રોનાઇઝેશન.
  - **Local Sync Layer:** `BroadcastChannel API` દ્વારા એક જ ડિવાઇસ પર બ્રાઉઝર ટેબ્સ વચ્ચે ફાસ્ટ લોકલ સિંક.
  - **Fallback Layer:** `localStorage` `StorageEvent` ફોલબેક.
  - **Audio Engine:** `Web Audio API` દ્વારા સિન્થેસાઇઝ્ડ બે-ટોન નોટિફિકેશન ચાઇમ (C5 523.25Hz → E5 659.25Hz).
  - **Voice Engine:** `Web Speech API` દ્વારા ગુજરાતી વોઇસ ઘોષણા.
  - **Haptic Engine:** સપોર્ટેડ ડિવાઇસ પર `navigator.vibrate([100, 50, 100])` હેપ્ટિક પલ્સ.

---

## 🏆 ૪. હેકાથોન જજ સામે લાઈવ ડેમો સ્ક્રિપ્ટ (Judge Presentation Pitch)

```text
                  QUEUELESS REALTIME LAYER

        OFFICER CONSOLE
          /admin/counter
               │
               │ TOKEN_CALLED
               ▼
      ┌─────────────────────┐
      │  Realtime Backend   │
      │   Event Transport   │
      └──────────┬──────────┘
                 │
        ┌────────┴─────────┐
        ▼                  ▼
 CITIZEN PORTAL      COLLECTOR DASHBOARD
    Mobile              /admin/collector
        │
        ├── 🔔 Chime
        ├── 🗣️ Gujarati Voice
        ├── 📳 Vibration
        └── 🟢 NOW SERVING
```

```text
BroadcastChannel
       │
       ├── Fast tab-to-tab synchronization
       └── Same-device local communication
```

### જજ સામે ડેમો પ્રસ્તુતિ સ્ક્રિપ્ટ:

1. **સ્ક્રીન ૧ (નાગરિકનો ફોન - `/`):**
   - "સાહેબ, આ નાગરિક (મોહનભાઈ પટેલ) નો ફોન છે. એમનો ટોકન `#A-42` કતારમાં પ્રતીક્ષારત છે."
2. **સ્ક્રીન ૨ (મામલતદાર લેપટોપ - `/admin/counter`):**
   - "અહીં ગોંડલ કચેરી કાઉન્ટર ૧ પર બેઠેલા મામલતદાર કે. એમ. ત્રિવેદી **'Call Next Token (#A-42)'** ક્લિક કરે છે."
3. **ધ 'Aha!' ક્ષણ:**
   - **અધિકારીને નાગરિકને મેન્યુઅલી બોલાવવાની જરૂર નથી.** એક જ ક્લિક રીઅલ-ટાઇમ બેકએન્ડ ટ્રાન્સપોર્ટ દ્વારા નાગરિકના મોબાઈલ સુધી પહોંચે છે:
     - 🔔 બે-ટોન ગવર્નમેન્ટ નોટિફિકેશન ચાઇમ વાગે છે.
     - 🗣️ ગુજરાતીમાં અવાજ આવે છે: *"ધ્યાન આપો, કાઉન્ટર ૧ પર ટોકન નંબર #A-42 નો વારો આવી ગયો છે."*
     - 📳 ફોન વાઇબ્રેટ થાય છે.
     - 🟢 સ્ક્રીન પર **`NOW SERVING AT COUNTER 1`** લાઈવ થઈ જાય છે.
4. **કલેક્ટર ડેશબોર્ડ બતાવો (`/admin/collector`):**
   - "અને કલેક્ટર સ્ક્રીન પર આ નિકાલ તુરંત ૩૩ જિલ્લાના લાઈવ આંકડા અને GRTSA SLA માં પ્રતિબિંબિત થાય છે."

---

## 🛠️ ૫. ડેવલપમેન્ટ કમાન્ડ્સ (Quick Commands)

### `main` બ્રાન્ચ પર કામ કરવા:
```bash
git checkout main
git pull origin main
npm run dev
```

### `dev-hari` બ્રાન્ચ પર કામ કરવા:
```bash
git checkout dev-hari
git pull origin dev-hari
npm run dev
# એડમિન પેનલ જોવા માટે બ્રાઉઝરમાં ખોલો: http://localhost:3000/admin
```

### પ્રોડક્શન બિલ્ડ ટેસ્ટ કરવા:
```bash
npm run build
```

---
*QueueLess Kacheri (NagrikSeva AI) • Government of Gujarat DPI Initiative © 2026*
