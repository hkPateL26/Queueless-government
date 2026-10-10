/**
 * QueueLess Kacheri (NagrikSeva AI)
 * Government of Gujarat — Role-Based Access Control (RBAC) & Officer Directory
 * Statutory Governance Framework: Gujarat Land Revenue Code, 1879 & GRTSA 2013
 */

export type OfficerRole = 
  | 'STATE_SUPER_ADMIN' 
  | 'DISTRICT_COLLECTOR' 
  | 'TALUKA_MAMLATDAR' 
  | 'OFFICE_INCHARGE' 
  | 'COUNTER_OPERATOR';

export interface OfficerAccount {
  id: string;
  username: string;
  password: string;
  nameGu: string;
  nameEn: string;
  designationGu: string;
  designationEn: string;
  cadreGu: string;
  cadreEn: string;
  role: OfficerRole;
  officerCode: string;
  districtId?: string;
  districtNameGu?: string;
  districtNameEn?: string;
  talukaId?: string;
  talukaNameGu?: string;
  talukaNameEn?: string;
  officeId?: string;
  officeNameGu?: string;
  officeNameEn?: string;
  assignedCounter?: number;
  counterNameGu?: string;
  counterNameEn?: string;
  allowedRoutes: string[];
  defaultRoute: string;
  avatarBadge: string;
  descriptionGu: string;
  descriptionEn: string;
}

export const OFFICIAL_SEED_OFFICERS: OfficerAccount[] = [
  {
    id: 'off-state-01',
    username: 'admin.state',
    password: 'Gujarat@2026',
    nameGu: 'શ્રીમતી સુનૈના તોમર, IAS',
    nameEn: 'Smt. Sunaina Tomar, IAS',
    designationGu: 'અધિક મુખ્ય સચિવ (મહેસૂલ વિભાગ)',
    designationEn: 'Additional Chief Secretary (Revenue)',
    cadreGu: 'ભારતીય વહીવટી સેવા (IAS)',
    cadreEn: 'Indian Administrative Service (IAS)',
    role: 'STATE_SUPER_ADMIN',
    officerCode: 'GJ-REV-SEC-001',
    allowedRoutes: ['/admin/collector', '/admin/mamlatdar', '/admin/incharge', '/admin/counter'],
    defaultRoute: '/admin/collector?scope=state',
    avatarBadge: '🏛️',
    descriptionGu: 'રાજ્ય કક્ષાની સર્વોચ્ચ વહીવટી દેખરેખ • સમગ્ર ગુજરાતના ૩૩ જિલ્લાઓ & ૨૫૦+ તાલુકાઓ',
    descriptionEn: 'Apex State Oversight • All 33 Districts & 250+ Talukas of Gujarat'
  },
  {
    id: 'off-rajkot-coll',
    username: 'collector.rajkot',
    password: 'Rajkot@2026',
    nameGu: 'શ્રી પ્રભવ જોશી, IAS',
    nameEn: 'Shri Prabhav Joshi, IAS',
    designationGu: 'જિલ્લા કલેક્ટર & ડિસ્ટ્રિક્ટ મેજિસ્ટ્રેટ',
    designationEn: 'District Collector & District Magistrate',
    cadreGu: 'ભારતીય વહીવટી સેવા (IAS)',
    cadreEn: 'Indian Administrative Service (IAS)',
    role: 'DISTRICT_COLLECTOR',
    officerCode: 'GJ-REV-RAJ-1001',
    districtId: 'rajkot',
    districtNameGu: 'રાજકોટ',
    districtNameEn: 'Rajkot',
    allowedRoutes: ['/admin/collector', '/admin/mamlatdar', '/admin/incharge'],
    defaultRoute: '/admin/collector?district=rajkot',
    avatarBadge: '🎖️',
    descriptionGu: 'રાજકોટ જિલ્લા મહેસૂલ વહીવટ • તમામ ૧૪ તાલુકા જન સેવા કેન્દ્રોની મોનિટરિંગ',
    descriptionEn: 'Rajkot District Revenue Administration • Monitoring all 14 Taluka JSKs'
  },
  {
    id: 'off-gondal-mam',
    username: 'mamlatdar.gondal',
    password: 'Gondal@2026',
    nameGu: 'શ્રી કે. એમ. ત્રિવેદી, GAS',
    nameEn: 'Shri K. M. Trivedi, GAS',
    designationGu: 'મામલતદાર & કાર્યપાલક મેજિસ્ટ્રેટ',
    designationEn: 'Mamlatdar & Executive Magistrate',
    cadreGu: 'ગુજરાત વહીવટી સેવા (GAS)',
    cadreEn: 'Gujarat Administrative Service (GAS)',
    role: 'TALUKA_MAMLATDAR',
    officerCode: 'GJ-REV-GDL-2005',
    districtId: 'rajkot',
    districtNameGu: 'રાજકોટ',
    districtNameEn: 'Rajkot',
    talukaId: 'gondal',
    talukaNameGu: 'ગોંડલ',
    talukaNameEn: 'Gondal',
    officeId: 'gondal-jsk',
    officeNameGu: 'તાલુકા સેવા સદન, ગોંડલ',
    officeNameEn: 'Taluka Seva Sadan, Gondal',
    allowedRoutes: ['/admin/mamlatdar', '/admin/incharge', '/admin/counter'],
    defaultRoute: '/admin/mamlatdar',
    avatarBadge: '⚖️',
    descriptionGu: 'ગોંડલ તાલુકા મહેસૂલ વડા • વૈધાનિક પ્રમાણપત્ર મંજૂરી & કચેરી અધ્યક્ષતા',
    descriptionEn: 'Gondal Taluka Revenue Head • Statutory Certificate Approvals'
  },
  {
    id: 'off-gondal-inch',
    username: 'incharge.gondal',
    password: 'JanSeva@2026',
    nameGu: 'શ્રીમતી પી. આર. જાડેજા',
    nameEn: 'Smt. P. R. Jadeja',
    designationGu: 'નાયબ મામલતદાર (જન સેવા કેન્દ્ર ઇન્ચાર્જ)',
    designationEn: 'Deputy Mamlatdar (JSK In-Charge)',
    cadreGu: 'ગુજરાત મહેસૂલ સેવા (વર્ગ-૩ ગેઝેટેડ)',
    cadreEn: 'Gujarat Revenue Service (Class-3 Gazetted)',
    role: 'OFFICE_INCHARGE',
    officerCode: 'GJ-REV-GDL-3012',
    districtId: 'rajkot',
    districtNameGu: 'રાજકોટ',
    districtNameEn: 'Rajkot',
    talukaId: 'gondal',
    talukaNameGu: 'ગોંડલ',
    talukaNameEn: 'Gondal',
    officeId: 'gondal-jsk',
    officeNameGu: 'જન સેવા કેન્દ્ર (ATVT), ગોંડલ',
    officeNameEn: 'Jan Seva Kendra (ATVT), Gondal',
    allowedRoutes: ['/admin/incharge', '/admin/counter'],
    defaultRoute: '/admin/incharge',
    avatarBadge: '🏢',
    descriptionGu: 'ગોંડલ જન સેવા સદન ફ્લોર ઇન્ચાર્જ • કાઉન્ટર ૧ થી ૬ સ્ટાફ સંચાલન & ભીડ નિયંત્રણ',
    descriptionEn: 'Gondal JSK Floor In-Charge • Counters 1 to 6 Crowd & Staff Management'
  },
  {
    id: 'off-gondal-c1',
    username: 'operator.c1',
    password: 'Counter1@2026',
    nameGu: 'શ્રી આર. વી. ચૌહાણ',
    nameEn: 'Shri R. V. Chauhan',
    designationGu: 'મહેસૂલ કારકૂન (કાઉન્ટર ૧ ઓપરેટર)',
    designationEn: 'Revenue Clerk (Counter 1 Operator)',
    cadreGu: 'મહેસૂલ કારકૂન સંવર્ગ',
    cadreEn: 'Revenue Clerk Cadre',
    role: 'COUNTER_OPERATOR',
    officerCode: 'GJ-REV-GDL-4011',
    districtId: 'rajkot',
    districtNameGu: 'રાજકોટ',
    districtNameEn: 'Rajkot',
    talukaId: 'gondal',
    talukaNameGu: 'ગોંડલ',
    talukaNameEn: 'Gondal',
    officeId: 'gondal-jsk',
    officeNameGu: 'જન સેવા કેન્દ્ર, ગોંડલ',
    officeNameEn: 'Jan Seva Kendra, Gondal',
    assignedCounter: 1,
    counterNameGu: 'આવક & જાતિ પ્રમાણપત્રો (Revenue Desk)',
    counterNameEn: 'Income & Caste Certificates (Revenue Desk)',
    allowedRoutes: ['/admin/counter'],
    defaultRoute: '/admin/counter',
    avatarBadge: '💻',
    descriptionGu: 'કાઉન્ટર ૧: આવકનો દાખલો, જાતિ પ્રમાણપત્ર & વિધવા સહાય સ્ક્રુટિની',
    descriptionEn: 'Counter 1: Income, Caste & Social Welfare Certificate Scrutiny'
  },
  {
    id: 'off-gondal-c2',
    username: 'operator.c2',
    password: 'Counter2@2026',
    nameGu: 'શ્રીમતી બી. એમ. વાળા',
    nameEn: 'Smt. B. M. Vala',
    designationGu: 'પુરવઠા કારકૂન (કાઉન્ટર ૨ ઓપરેટર)',
    designationEn: 'Civil Supplies Clerk (Counter 2 Operator)',
    cadreGu: 'અન્ન & નાગરિક પુરવઠા સંવર્ગ',
    cadreEn: 'Civil Supplies Cadre',
    role: 'COUNTER_OPERATOR',
    officerCode: 'GJ-REV-GDL-4012',
    districtId: 'rajkot',
    districtNameGu: 'રાજકોટ',
    districtNameEn: 'Rajkot',
    talukaId: 'gondal',
    talukaNameGu: 'ગોંડલ',
    talukaNameEn: 'Gondal',
    officeId: 'gondal-jsk',
    officeNameGu: 'જન સેવા કેન્દ્ર, ગોંડલ',
    officeNameEn: 'Jan Seva Kendra, Gondal',
    assignedCounter: 2,
    counterNameGu: 'રેશનકાર્ડ & અન્ન પુરવઠો (Food & Civil Supplies)',
    counterNameEn: 'Ration Card & Civil Supplies',
    allowedRoutes: ['/admin/counter'],
    defaultRoute: '/admin/counter',
    avatarBadge: '🌾',
    descriptionGu: 'કાઉન્ટર ૨: નવું રેશનકાર્ડ, નામ ઉમેરો/કમી & વિભાજન અરજીઓ',
    descriptionEn: 'Counter 2: New Ration Card, Member Addition & Separation'
  }
];

const SESSION_STORAGE_KEY = 'qless_officer_session';
const COOKIE_NAME = 'qless_officer_token';

/**
 * Authenticate officer by username and password
 */
export function authenticateOfficer(username: string, password: string): OfficerAccount | null {
  const cleanUsername = username.trim().toLowerCase();
  const found = OFFICIAL_SEED_OFFICERS.find(
    o => o.username.toLowerCase() === cleanUsername && o.password === password
  );
  return found || null;
}

/**
 * Persist officer session in localStorage & client cookie
 */
export function saveOfficerSession(officer: OfficerAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const serialized = JSON.stringify(officer);
    localStorage.setItem(SESSION_STORAGE_KEY, serialized);
    // Write cookie for middleware/session check
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(officer.id)}; path=/; max-age=86400; SameSite=Lax`;
  } catch (err) {
    console.error('Failed to save officer session:', err);
  }
}

/**
 * Get active officer session (falls back to Counter 1 Operator if demo mode)
 */
export function getActiveOfficer(allowFallback: boolean = false): OfficerAccount | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as OfficerAccount;
      // Re-verify against seed list to ensure updated metadata
      const matched = OFFICIAL_SEED_OFFICERS.find(o => o.id === parsed.id);
      if (matched) return matched;
      return parsed;
    }
  } catch {}

  if (allowFallback) {
    // Default demo fallback: Shri R. V. Chauhan (Counter 1 Operator)
    return OFFICIAL_SEED_OFFICERS[4];
  }
  return null;
}

/**
 * Clear officer session
 */
export function clearOfficerSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  } catch {}
}

/**
 * Check if officer has permission for a specific route
 */
export function isRouteAllowed(officer: OfficerAccount | null, pathname: string): boolean {
  if (!officer) return false;
  if (officer.role === 'STATE_SUPER_ADMIN') return true;
  return officer.allowedRoutes.some(route => pathname.startsWith(route));
}
