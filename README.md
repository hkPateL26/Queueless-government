# 🏛️ QueueLess Kacheri (NagrikSeva AI)
> **Code Carnival 3.0 • Team Just Code (Team ID: NTQD)**  
> **Atmiya Developer Students Club (ADSC) • Atmiya University**  
> *"Skip The Queue, Not Your Work"* • કચેરીની લાંબી લાઈનો અને દસ્તાવેજ રિજેક્શનમાંથી કાયમી મુક્તિ

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Google Gemini Vision](https://img.shields.io/badge/Google_Gemini-3.1_Flash--Lite-blue?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 🌟 Executive Overview
**QueueLess Kacheri (NagrikSeva AI)** is an AI-powered Digital Public Infrastructure (DPI) platform engineered for all **33 Districts, 250+ Talukas, and Jan Seva Kendras** across Gujarat.

It eliminates physical queues, repeat office visits, and last-minute document rejections by deploying:
1. **Multimodal AI Pre-Verification:** Instant in-browser scanning of identity, income, caste, and institutional bonafide certificates before citizens leave their homes.
2. **Dynamic Slot & Digital Token Pass:** Cryptographically validated QR tokens with guaranteed arrival windows.
3. **GPS Kacheri Radar:** Geolocation engine navigating citizens to their nearest Jan Seva Kendra with live queue wait-times.
4. **Mamlatdar Counter Admin Desk:** Real-time queue calling and citizen throughput tracking for government officers.

---

## 🏗️ System Architecture & Workflow

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CITIZEN INTERACTION TIER                        │
│                                                                        │
│   [Smartphone / Laptop (PWA)]      [GPS Kacheri Radar]                 │
│   • Browse 39 Gujarat Schemes      • Nearest Jan Seva Kendra Discovery │
│   • Bilingual Audio & Voice UI     • Live Distance (km) & Crowd Status │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Uploads Documents (Images/PDFs)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                INTELLIGENT AI PRE-VERIFICATION TIER                    │
│                                                                        │
│   [Google Gemini 3.1 Flash-Lite Vision API + Canvas Edge Classifier]   │
│   • Persona: STRICT Chief Document Verification Officer                │
│   • UIDAI Aadhaar 12-Digit & Ashok Stambh Seal Check                   │
│   • School / University Bonafide Certificate Verification              │
│   • Revenue Dept 3-Year Income Certificate Statutory RTS Rule          │
│   • Code-Level Double Safeguard: Zero Mismatch, Zero Fraud             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ 100% Pre-Verified & Authenticated
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   SMART QUEUE & TOKEN ENGINE                           │
│                                                                        │
│   [Next.js Serverless Engine + Event State Store]                      │
│   • Capped Capacity Slot Allocator (e.g., 10:15 - 10:30 AM)            │
│   • 2FA Civic Authentication (Mobile OTP + Aadhaar 4-digits)           │
│   • Cryptographically Signed QR Digital Token Pass Generation          │
│   • Offline LocalStorage Cache (Works in remote village network drops) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Fast-Track Entry at Office
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     GOVERNMENT COUNTER DESK TIER                       │
│                                                                        │
│   [Counter Operator Dashboard]     [Taluka Mamlatdar / Collector SLA]  │
│   • Line-Free QR Code Scanner      • Live Taluka Queue Heatmap         │
│   • Counter Token Calling Control  • Sub-2 Minute Transaction Target   │
│   • Digitally-Stamped e-Receipt    • Zero Last-Minute Citizen Rejection│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Modules & Feature Highlights

### 1. 🌾 39 Verified Gujarat Government Schemes
Covers real statutory circulars, actual official fees (₹0 vs ₹20), and required document checklists across 4 critical departments:
- **ખેતીવાડી (Agriculture & Farming - 12 Schemes):** i-Khedut Tractor Subsidy, Drip Irrigation, Tarpaulin, Seeds, Godown, PM-KISAN, MKSY, Deshi Gay Sahay, Smartphone Sahay.
- **આરોગ્ય & સુરક્ષા (Healthcare & Social Security - 9 Schemes):** PM-JAY Ayushman Bharat (₹10 Lakh), MA Vatsalya, Ganga Swarupa, PMSBY, Matrushakti (MMY), Chiranjeevi, Poshan Sudha, Janani Suraksha, Niradhar Vrudh Pension.
- **શિક્ષણ & સ્કોલરશિપ (Education & Study - 8 Schemes):** Namo Lakshmi (Class 9-12), MYSY, Namo Saraswati Vigyan Sadhana, Digital Gujarat Pre & Post Matric, CMSS, Saraswati Cycle, Foreign Study Loan (₹15 Lakh).
- **આવાસ & સામાજિક કલ્યાણ (Housing & Welfare - 10 Schemes):** PMAY-Gramin, PMAY-Urban, Dr. Ambedkar Awas, Pandit Deendayal Awas, Manav Garima, Vahli Dikri, Kunwarbai Mameru, Sant Surdas Divyang, Income Certificate (3-Year Validity), Caste Certificate.

### 2. 🤖 Gemini Multimodal Vision AI Verification Engine
- **STRICT Chief Verification Officer Prompt:** Enforces exact document matching with a strict temperature of `0.1`.
- **Aadhaar Card Acceptance:** Identifies UIDAI emblems, Ashok Stambh, photo, and 12-digit patterns.
- **Bonafide Certificates:** Full support for School, College, and University bonafide certificates (including Atmiya University, GSEB, GTU) with official round seals and student roll numbers.
- **Statutory RTS 3-Year Expiry:** Automatically flags income certificates older than 3 financial years as expired under the Gujarat Public Services Act (GRTSA 2013).
- **Strict Anti-Fraud Rejection:** Rejects fee receipts, lecture notes (`unit1Material.pdf`), and blurry images with clear Gujarati & English guidance.

### 3. 📍 GPS Live Kacheri Radar & Office Locator
- Automatically detects the citizen's GPS location.
- Identifies the nearest Jan Seva Kendra / Mamlatdar Kacheri / Taluka Seva Sadan.
- Displays real-time road distance in kilometers and current crowd congestion levels before citizens start their commute.

### 4. 🎟️ Scheduled Digital Token Pass & Fast-Track QR
- Citizen receives an authenticated Digital Token Pass with an exact arrival window.
- Integrated QR code for instant scanner validation at the kacheri gate.
- Offline-first persistence via `localStorage`: Citizens can present their pass even if mobile data drops at the office.

### 5. 🏛️ Dual-Sided Admin Counter Desk
- Dedicated portal at `/admin/counter` for Counter Operators (Counter 1 to 6).
- 1-click token calling, live active queue counter, and conflict-free multi-desk coordination.
- Central Collector Command Room (`/admin/collector`) tracking taluka-wide SLA compliance.

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, Tailwind CSS | High-performance PWA, bilingual UI (Gujarati/English), responsive design |
| **Backend** | Next.js API Routes, Node.js (TypeScript) | Type-safe serverless backend, zero-leak API key protection |
| **AI Vision** | Google Gemini 3.1 Flash-Lite Multimodal API | Multimodal OCR, fraud prevention, strict statutory validation |
| **Storage / State** | In-Memory Realtime Event Store & LocalStorage | Sub-millisecond queue events, offline citizen pass storage |
| **Deployment** | Vercel Cloud Platform & Edge Network | Instant automated CI/CD deployment, 99.99% uptime |
| **Design System** | Official Government of Gujarat Civic Palette | `#003366` (Navy), `#FF9933` (Saffron), `#138808` (Green) |

---

## 🛠️ Local Development & Setup

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/hkPateL26/Queueless-government.git
cd Queueless-government

# 2. Install dependencies
npm install

# 3. Configure Environment Variables
# Create a .env.local file in the root directory:
GEMINI_API_KEY=your_gemini_api_key_here

# 4. Run development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## 👥 Team Information

- **Team Name:** Just Code
- **Team ID:** NTQD
- **Team Leader:** Hari Patel
- **Hackathon:** Code Carnival 3.0
- **Organization:** Atmiya Developer Students Club (ADSC) • Atmiya University, Rajkot

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).