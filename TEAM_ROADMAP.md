# 🏛️ QueueLess Kacheri (NagrikSeva AI) – Team Development Roadmap & Architecture

> **Gujarat Government–Inspired Design System & Citizen Service Framework**  
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
│   ├── CameraScannerModal.tsx    <-- [TRACK 1: main] Document OCR & Pre-Verification (Client-Side OCR + Rule Engine)
│   ├── SlotBookingModal.tsx      <-- [TRACK 1: main] અધિકારક્ષેત્ર, સેવા કેન્દ્ર & કેપેસિટી સ્લોટ બુકિંગ
│   ├── DigitalTokenPass.tsx      <-- [TRACK 1: main] સહી કરેલ QR પાસ, વિલંબ એડજસ્ટમેન્ટ & ઑફલાઇન એક્સેસ
│   └── admin/                    <-- [TRACK 2: dev-hari] EXCLUSIVE ADMIN COMPONENTS
│       ├── CounterDesk.tsx       <-- કોલ નેક્સ્ટ, માર્ક કમ્પ્લીટ, સ્કીપ કંટ્રોલ પેનલ
│       ├── CollectorHeatmap.tsx  <-- ૩૩ જિલ્લા લાઈવ ભીડ & ટ્રાફિક ગેજ
│       ├── SlaBreachWatchdog.tsx <-- GRTSA ૨૦૧૩ સમયમર્યાદા ઉલ્લંઘન એલર્ટ સિસ્ટમ
│       └── DocumentReviewer.tsx  <-- નાગરિકે અપલોડ કરેલા કાગળોનું સ્ક્રીન પ્રિવ્યૂ
│
└── lib/                          <-- [SHARED CORE LAYER: બંને બ્રાન્ચ ઉપયોગ કરશે]
    ├── jurisdiction-data.ts      <-- ૩૩ જિલ્લા, તાલુકા, સેવા કેન્દ્રો & કાઉન્ટર રાઉટીંગ
    ├── slot-engine.ts            <-- કોન્ફિગરેબલ સેવા કલાકો, કેપેસિટી લિમિટ, હોલિડે કેલેન્ડર & સાઇન્ડ QR
    ├── schemes-data.ts           <-- ૩૯ સત્તાવાર ગુજરાત સરકારી યોજનાઓની વિગતો
    ├── ocr-validator.ts          <-- Client-Side OCR + Rule Engine (ઓટોમેટેડ પ્રી-ચેક)
    ├── realtime-bus.ts           <-- User & Admin વચ્ચેનું લાઈવ સિંક્રોનાઇઝેશન એન્જિન
    ├── voice.ts                  <-- ગુજરાતી Text-to-Speech (TTS via Web Speech API gu-IN)
    └── haptics.ts                <-- Mobile Haptic Feedback સિસ્ટમ (Web Vibration API)
```

---

## 🚀 ૩. તબક્કાવાર રોડમેપ (Phase-wise Roadmap)

### ✅ Phase 1 થી 6 (સંપૂર્ણ પૂર્ણ થયેલ તબક્કા - 100% Completed)
- [x] **Phase 1: Foundation & Citizen Experience:**
  - **Gujarat Government–Inspired Design System:** Government-Service Visual Palette (`#003366` Navy Blue, `#005A9C` Royal Blue, `#FF9933` Saffron, `#138808` India Green). Designed to fit naturally into existing government-service environments and adaptable for government infrastructure.
  - **Live Queue Visualization / Kacheri Radar:** Phase 1 queue display focus (waiting time, crowd gauge, capacity).
  - **6 Detailed Counter Cards:** Counter 1 to 6 displaying Counter #, Department name, Officer name, Status with Color + Icon + Text (`🟢 OPEN`, `🟡 BUSY`, `🟡 LUNCH BREAK` with resume time), NOW SERVING, NEXT token, Waiting count, and Estimated wait time.
  - **Gujarati-First Accessibility:** Multi-modal notification channels (Visual `🟢 NOW SERVING`, Web Audio `🔔 Notification Chime`, Voice `🗣️ Gujarati Text-to-Speech (TTS)` via `gu-IN`, Haptic `📳 Mobile Haptic Feedback` with tap 15ms / success 40ms / warning 80ms / error [50,100,50]).
  - **One-Click Demo Personas:** Evaluation test personas (Hari Patel `#A-42`, Officer Counter 1, Reset Session) for instant evaluation without entering OTPs or phone numbers.
- [x] **Phase 2: 39 Schemes Discovery & Document Pre-Verification:**
  - **39 Schemes Discovery Catalog:** ૩૯ સેવાઓ/યોજનાઓ, કેટેગરી ફિલ્ટરિંગ, સર્ચ, "Can I Apply?" યોગ્યતા પૂર્વાવલોકન, સંકેતાત્મક સહાય (Indicative Benefits), સત્તાવાર સરકારી વિભાગ સ્ત્રોત (Official Sources), સેવા ફી અને SLA પારદર્શકતા.
  - **Client-Side OCR + Rule Engine:** દસ્તાવેજ OCR & પ્રી-વેરિફિકેશન પાઇપલાઇન (`Document Image ➔ OCR ➔ Extracted Data ➔ Rule Engine ➔ Pre-Verification Result`).
  - **Automated Pre-Check (ઓટોમેટેડ પ્રી-ચેક):** કાનૂની સુરક્ષા સાથે `Pre-check Passed`, `Action Required`, અથવા `Needs Review` સ્ટેટસ; સ્પષ્ટ ડિસ્ક્લેમર: *"This is an automated pre-check. Final verification is performed by the authorized government officer."*
  - **રૂલ એન્જિન & કોન્ફિગરેબલ વેલિડિટી:** આવક પ્રમાણપત્ર અને દસ્તાવેજો માટે તારીખ, યોજનાના નિયમ અને વર્તમાન તારીખ આધારિત ડાયનેમિક મૂલ્યાંકન.
  - **નોન-બ્લોકિંગ સિટિઝન UX:** સ્કેન અનિશ્ચિતતામાં `Needs Review`, મેન્યુઅલ તારીખ સુધારો અથવા "Continue with officer review" વિકલ્પ (કોઈ પરમેનન્ટ ટોકન બ્લોક નહીં).
  - **Aadhaar Privacy Masking & Identity Check:** માસ્ક્ડ આધાર (`XXXX-XXXX-8842` છેલ્લા ૪ આંકડા) અને Citizen Identity Check (મોબાઇલ OTP + આધાર લાસ્ટ-૪).
  - **CamScanner Viewfinder & Demo Cloud Import:** ગુણવત્તા માર્ગદર્શિકા (sharpness, lighting, framing) અને સ્પષ્ટ "Cloud Import — Demo" / "DigiLocker Import — Demo".
  - **ડિફેન્સિબલ પિચ ધ્યેય (Pitch Goal):** *"Our goal is to reduce avoidable counter rejections by helping citizens identify missing, unreadable, or potentially outdated documents before they visit the office."*
- [x] **Phase 3: Jurisdiction Routing, Appointment Scheduling & Digital Token Pass:**
  - **અધિકારક્ષેત્ર & સેવા કેન્દ્ર પસંદગી (Jurisdiction & Center Selection):** Citizen Location ➔ District ➔ Taluka ➔ Applicable Service Center (જન સેવા કેન્દ્ર / મામલતદાર સેવા સદન with distance km) ➔ કાઉન્ટર રાઉટીંગ.
  - **કોન્ફિગરેબલ સેવા કલાકો & ક્ષમતા મર્યાદા (Configurable Hours & Capacity):** કેન્દ્ર મુજબ કામકાજના કલાકો (serviceHours, lunchBreak, workingDays) અને પ્રતિ કલાક કેપેસિટી લિમિટ (દા.ત. 5 એપોઇન્ટમેન્ટ/કલાક) દ્વારા અપેક્ષિત ભીડ નિયંત્રણ.
  - **સ્લોટ પ્રાપ્યતા & કતાર અંદાજ (Slot Availability Details):** `🟢 3 slots available • Queue: Low`, `🟡 1 slot left • Moderate queue`, `🔴 Full • Choose another time`, ભોજન રિસેસ બ્લેકઆઉટ.
  - **સત્તાવાર સ્ત્રોત આધારિત રજા કેલેન્ડર (Source-Based Holidays):** GAD જાહેર રજા યાદી આધારે માન્ય (રવિવાર, ૨જા/૪થા શનિવાર અને ૨૦૨૬ જાહેર રજાઓ બ્લોકર).
  - **પ્રાથમિકતા અપોઇન્ટમેન્ટ સપોર્ટ (Priority Appointment Support):** વરિષ્ઠ નાગરિકો (૬૦+) અને દિવ્યાંગજનો માટે વહીવટી માર્ગદર્શિકા હેઠળ `#P-` ટોકન ફ્લેગ.
  - **ડબલ-બુકિંગ કોન્ફ્લિક્ટ પ્રોટેક્શન (Conflict Protection):** કન્ફર્મેશન પહેલાં રિયલ-ટાઇમ સ્લોટ કેપેસિટી ચકાસણી.
  - **સહી કરેલ ટેમ્પર-એવિડન્ટ QR ટોકન (Signed / Tamper-Evident QR Token):** પ્રાઇવસી-સુરક્ષિત સહી ચેકસમ (કોઈ આધાર નંબર કે ખાનગી વિગતો QR માં શામેલ નથી).
  - **લાઇવ ટોકન વેલિડિટી & ઑફલાઇન પાસ (Live Indicator & Offline Pass):** લોકલ સ્ટોરેજમાં સેવ થયેલ પાસ (ઇન્ટરનેટ વગર ઓપન કરી શકાય), લાઈવ સેકન્ડ્સ ક્લોક ઇન્ડિકેટર.
  - **ડાયનેમિક વિલંબ નોંધણી (Dynamic Running Late):** +૧૦/+૨૦/+૩૦ મિનિટ વિકલ્પ સાથે અધિકારી HUD પર નવી ETA અપડેટ.
  - **રિશિડ્યુલ & કેન્સલેશન (Rescheduling & Cancellation):** નવો સ્લોટ પસંદ કરવાની સુવિધા અને સ્લોટ મુક્ત કરવા માટે રદ કરવાનો વિકલ્પ.
  - **મલ્ટી-ચેનલ ટચપોઇન્ટ્સ (Multi-Channel Touchpoints):** SMS Notification (Demo), WhatsApp Service Assistant (Demo), Add to Google Calendar લિંક, Gate Security Kiosk સિમ્યુલેશન.
  - **ડિફેન્સિબલ પિચ ધ્યેય (Pitch Claims):** *"Reduces the need for early-morning physical queuing by allowing citizens to reserve available service capacity in advance, with configurable capacity limits helping administrations manage expected footfall."*
- [x] **Phase 4: Mobile-First Experience, Touch Accessibility & PWA:**
  - **આર્કિટેક્ચર & ડિઝાઇન સિદ્ધાંતો (Architecture & Design Principles):**
    - Viewport Target: **320px+ Mobile-First Responsive Layout** (ગ્રેસફુલી સ્કેલિંગ 320px, 360px, 390px થી ડેસ્કટોપ સુધી).
    - Navigation Layer: **Mobile Bottom Navigation + Safe-Area Support** (PWA/વેબ નેવિગેશન કમ્પોનન્ટ with `env(safe-area-inset-bottom)`).
    - Touch Target Standard: **Minimum ~44px Touch Targets for Primary Controls** (પ્રાથમિક ઇન્ટરેક્ટિવ બટનો અને કંટ્રોલ્સ).
    - Accessibility Standard: **Gujarati-First Labels, High Contrast, Clear Focus States & Optional Haptic Feedback**.
  - **રિસ્પોન્સિવ લેઆઉટ વેલિડેશન (Responsive Layout Validation):** 320px, 360px, 390px કટોકટી સ્ક્રીન ટેસ્ટિંગ, ફ્લેક્સિબલ કન્ટેનર્સ (`min-width: 0`), ટેક્સ્ટ રેપિંગ, નો-ફિક્સ્ડ મોબાઇલ વિડ્થ, અનિચ્છનીય હોરિઝોન્ટલ સ્ક્રોલ અને ક્લિપિંગ અટકાવેલ.
  - **રિસ્પોન્સિવ ટાઇપોગ્રાફી & હાઇ કોન્ટ્રાસ્ટ:** ટોકન નંબર (`A-42`), સ્ટેટસ, કાઉન્ટર, વેઇટ ટાઇમ, તારીખ માત્ર રંગ પર આધાર રાખ્યા વગર આઇકોન + ગુજરાતી ટેક્સ્ટ સાથે મોટા, સ્પષ્ટ ફોન્ટમાં દર્શાવેલ.
  - **મોબાઇલ બોટમ નેવિગેશન બાર (Mobile Bottom Navigation Bar):** ૪ નેવિગેશન આઇટમ્સ (🏠 હોમ, 📑 ૩૯ યોજનાઓ, 🎟️ ટોકન પાસ, 📡 કચેરી રડાર). જો સક્રિય ટોકન ન હોય તો ન્યુટ્રલ `ટોકન પાસ` (No active token), અને જો સક્રિય ટોકન હોય તો કેસરી હાઇલાઇટ સાથે ટોકન નંબર (દા.ત. `A-42`).
  - **સેફ-એરિયા & ઓવરલેપ સુરક્ષા (Safe-Area Support):** `env(safe-area-inset-bottom)` પેડિંગ, બોડી કન્ટેન્ટ માટે પર્યાપ્ત બોટમ પેડિંગ (`pb-24`) જેથી બટનો, કાર્ડ્સ કે મોડલ્સ ઓવરલેપ ન થાય; ફ્લોટિંગ PWA બેનર બોટમ નેવની ઉપર (`bottom-[56px] md:bottom-0`).
  - **કીબોર્ડ & ફોકસ સુલભતા (Keyboard & Focus Accessibility):** વિઝિબલ કીબોર્ડ ફોકસ રિંગ્સ (`*:focus-visible`), લોજિકલ ટેબ ઓર્ડર, આઇકોન કંટ્રોલ્સ માટે `aria-label`, ડેમો મેનૂ માટે `aria-expanded`, કતાર અપડેટ્સ માટે સ્ક્રીન રીડર `aria-live="polite"` રીજન, અને એસ્કેપ કી (`Escape`) દ્વારા ડાયલોગ/ડ્રોઅર ક્લોઝ.
  - **વૈકલ્પિક હેપ્ટિક ફીડબેક (Optional Haptic Feedback):** સપોર્ટેડ ડિવાઇસીસ/બ્રાઉઝર્સ પર Web Vibration API (`tap`, `success`, `warning`, `error`) દ્વારા વૈકલ્પિક સ્પર્શ ખાતરી, જ્યારે તમામ ક્રિયાઓ માટે વિઝ્યુઅલ અને સાઉન્ડ ચાઇમ હંમેશા પ્રાથમિક સુનિશ્ચિત.
- [x] **Phase 5: Administrative Portals & Real-Time Desk Operations:**
  - **સત્તાવાર સારાંશ (Official Summary):** *Phase 5 provides the operational backbone for QueueLess Kacheri. Counter operators can manage live queues, call and complete tokens, handle missed citizens, transfer cases between counters, review document pre-check results, and record operational actions. Supervisory dashboards provide configurable queue, service-time, delay and workload analytics across offices. Administrative actions are permission-controlled and audit logged, while the realtime layer propagates queue events to connected citizen and administrative interfaces.*
  - **Phase 5A: કાઉન્ટર ઓપરેટર ડેસ્ક (`app/admin/counter/page.tsx`):**
    - **કોન્ફિગરેબલ સેવા કાઉન્ટર્સ (Configurable Service Counters):** કાઉન્ટર ૧ થી ૬ (મહેસૂલ, રેશન, જમીન રેકોર્ડ, સમાજ સુરક્ષા, આયુષ્માન, એટેસ્ટેશન) - દરેક કચેરી મુજબ વિભાગ, સેવાઓ અને ક્ષમતા કોન્ફિગરેબલ.
    - **ડેમો ઓફિસર પર્સોના (Role-Based Access Control):** શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર) ડેમો પર્સોના સાથે સ્પષ્ટ `🟠 DEMO MODE` બેજ (વાસ્તવિક ડિપ્લોયમેન્ટ માટે RBAC ઓથેન્ટિકેશન આવશ્યક).
    - **પ્રાથમિકતા કતાર નીતિ એન્જિન (Priority Queue Policy Engine):** વહીવટી માર્ગદર્શિકા મુજબ `#P-` ટોકન્સ (વરિષ્ઠ નાગરિકો ૬૦+, દિવ્યાંગજનો) નું કોન્ફિગરેબલ પ્રાયોરિટી ઇવેલ્યુએશન.
    - **સેવા હેન્ડલિંગ સ્ટોપવોચ (Service SLA / Handling-Time Stopwatch):** કોન્ફિગરેબલ હેન્ડલિંગ ટાર્ગેટ (દા.ત. ૧૫ મિનિટ લક્ષ્ય, ૧૦ મિનિટ ચેતવણી) સાથે સ્પષ્ટ સ્થિતિ: `🟢 Within Target`, `🟡 Approaching Target`, `🔴 Target Exceeded`.
    - **સમય વિભાજન મેટ્રિક્સ (Time Separation):** કતાર પ્રતીક્ષા સમય (Queue Waiting Time) અને ડેસ્ક સેવા સમય (Desk Handling Time) અલગ-અલગ ટ્રેકિંગ.
    - **ડેસ્ક લાઇફસાઇકલ ક્રિયાઓ (Desk Action Suite):**
      - `CALL NEXT`: ડબલ-કોલ કન્ફ્લિક્ટ પ્રોટેક્શન સાથે ટોકન બોલાવો, `TOKEN_CALLED` બ્રોડકાસ્ટ.
      - `RE-CALL`: ગેરહાજર અથવા ધ્યાન ન આપેલ નાગરિકને ચાઇમ અને અવાજ સાથે પુનઃ ઘોષણા.
      - `MARK COMPLETE`: સેવા સમય ઓડિટ સાથે સફળ નિકાલ, `TOKEN_COMPLETED` બ્રોડકાસ્ટ.
      - `SKIP`: નાગરિક ગેરહાજરી નોંધણી (ઓડિટ રેકોર્ડ રહે છે, ડીલીટ થતો નથી), રી-કોલ માટે ઉપલબ્ધ.
      - `TRANSFER`: સ્પષ્ટ મોડલ દ્વારા મૂળ કાઉન્ટર, નવું કાઉન્ટર, અધિકારી, કારણ અને નોંધ સાથે ટ્રાન્સફર.
      - `LUNCH RECESS`: કોન્ફિગરેબલ ભોજન વિરામ (1:10 PM થી 2:00 PM) અને રિઝ્યુમ ટાઇમ પ્રદર્શન.
    - **દસ્તાવેજ પ્રી-ચેક સમીક્ષા (Document Pre-Verification Reviewer):** નાગરિકે અપલોડ કરેલા કાગળો અને ઓટોમેટેડ પ્રી-ચેક પરિણામોનું નિરીક્ષણ (`✓ Pre-check Passed`, `Officer Review Required`, માસ્ક્ડ આધાર `XXXX-XXXX-8842`).
    - **પ્રશાસનિક ઓડિટ લોગ (Administrative Audit Log):** અધિકારી દ્વારા લેવાયેલ દરેક પગલાં (CALLED, COMPLETED, SKIPPED, RECALLED, TRANSFERRED, LUNCH) નું ટાઈમસ્ટેમ્પ સાથે ઓટોમેટેડ ઓડિટ રેકોર્ડિંગ.
    - **કતાર સૂચના ચાઇમ (Queue Notification Chime):** Web Audio API આધારિત સિન્થેસાઇઝ્ડ નોટિફિકેશન ચાઇમ (`playNotificationChime()`) અને ગુજરાતી વૉઇસ ઘોષણા.
  - **Phase 5B: કલેક્ટર & DDO કમાન્ડ ડેશબોર્ડ (`app/admin/collector/page.tsx`):**
    - **કોન્ફિગરેબલ ભીડ સૂચકાંક (Capacity-Relative Congestion Index):** કચેરી ક્ષમતાના ગુણોત્તર મુજબ ૩૩ જિલ્લા લાઈવ હીટમેપ (`OPTIMAL < 45%`, `MODERATE 45-80%`, `CONGESTED > 80%`).
    - **કતાર વિલંબ વોચડોગ (Queue Delay Watchdog):** ૩૦+ મિનિટથી વધુ પ્રતીક્ષાવાળી અરજીઓ માટે `🔴 Delayed` ચેતવણી અને અરજદાર ડેટા સુરક્ષા.
    - **એસ્કેલેટ — ડેમો (Create Escalation Alert):** ફેક SMS ના દાવા વગર વિગતવાર પ્રશાસનિક વિલંબ એલર્ટ જનરેશન.
    - **વિસ્તૃત રાજ્ય મેટ્રિક્સ:** કુલ ટોકન્સ, નિકાલ દર, સરેરાશ કતાર પ્રતીક્ષા સમય, સરેરાશ ડેસ્ક સેવા સમય, નો-શો સંખ્યા, ટ્રાન્સફર સંખ્યા.
    - **પીક અવર્સ સમયરેખા (Peak Queue Timeline):** નોંધાયેલ કતાર ડેટા આધારિત પીક અવર્સ (10:30 AM – 6:00 PM) ભીડ વિશ્લેષણ ચાર્ટ.
    - **દૈનિક MIS રિપોર્ટ — ડેમો (Daily MIS Bulletin — Demo):** પ્રિન્ટ / PDF ડાઉનલોડ સાથે વહીવટી ડેમો સારાંશ.
  - **Phase 5C: સીમલેસ ક્રોસ-નેવિગેશન & રીઅલ-ટાઇમ ક્રોસ-ટોક:**
    - ડેમો પર્સોના સ્વિચિંગ (Citizen Hari Patel `#A-42` ↔ Officer K. M. Trivedi ↔ Collector Prabhatkumar Sharma).
    - ઓફિસર ડેસ્ક પર `CALL NEXT` ક્લિક કરવાથી બેકએન્ડ રીઅલ-ટાઇમ લેયર મારફતે નાગરિક મોબાઇલ અને કલેક્ટર ડેશબોર્ડ પર તાત્કાલિક સિંક.
- [x] **Phase 6: રીઅલ-ટાઇમ સિંક્રોનાઇઝેશન આર્કિટેક્ચર (Real-Time Synchronization Layer):**
  - **Cross-Device Layer:** બેકએન્ડ રીઅલ-ટાઇમ ટ્રાન્સપોર્ટ (`/api/queue-events`) દ્વારા અલગ-અલગ ડિવાઇસીસ (ફોન ↔ લેપટોપ) વચ્ચે ઇવેન્ટ સિંક્રોનાઇઝેશન.
  - **Local Sync Layer:** `BroadcastChannel API` દ્વારા એક જ ડિવાઇસ પર બ્રાઉઝર ટેબ્સ વચ્ચે ફાસ્ટ લોકલ સિંક.
  - **Fallback Layer:** `localStorage` `StorageEvent` ફોલબેક.
  - **Audio Engine:** `Web Audio API` દ્વારા સિન્થેસાઇઝ્ડ બે-ટોન નોટિફિકેશન ચાઇમ (C5 523.25Hz → E5 659.25Hz).
  - **Voice Engine:** `Web Speech API` દ્વારા ગુજરાતી Text-to-Speech (TTS gu-IN) ઘોષણા.
  - **Haptic Engine:** `Mobile Haptic Feedback` સપોર્ટેડ ડિવાઇસ પર Web Vibration API (tap 15ms, success 40ms, warning 80ms, error [50, 100, 50]).

---

## 🏆 ૪. હેકાથોન જજ સામે લાઈવ ડેમો સ્ક્રિપ્ટ (Judge Presentation Pitch)

```text
                         ┌──────────────────────────┐
                         │   AUTHENTICATED ADMIN    │
                         │        USERS             │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │   ROLE / PERMISSION      │
                         │        LAYER             │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┴──────────────────────┐
              ▼                                              ▼
     COUNTER OPERATOR DESK                         COLLECTOR DASHBOARD
        /admin/counter                              /admin/collector
              │                                              │
              └──────────────────┬───────────────────────────┘
                                 │
                        AUTHORITATIVE BACKEND
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
         Queue State         Audit Log        MIS / Analytics
              │
              ▼
        REALTIME EVENT LAYER
              │
       ┌──────┼───────┐
       ▼      ▼       ▼
   Citizen  Radar  Admin Screens
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
