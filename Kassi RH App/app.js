/* =====================================================================
   kassirh — interactive frontend demo (dummy, no backend)
   Flow: Sign In / Sign Up → Create Organization → Choose → Create
   Employee → Dashboard
   ===================================================================== */

const $app = document.getElementById('app');

/* ------------------------------ state ------------------------------ */
function mkEmployee(o) {
  const e = Object.assign({
    id: 'EMP' + Math.floor(100000 + (o._n || 1) * 45673 % 900000),
    first: '', last: '', gender: 'Male', birth: '—', nat: 'Gabon', city: '—',
    email: '', phone: '—', postal: '—', service: 'General', role: 'Employee',
    contractType: 'CDI', status: 'active', contracts: [], documents: [], initials: 'NA',
  }, o);
  // nested tab data (dummy defaults, overridable via o)
  e.identite = Object.assign({ genre: e.gender, naissance: e.birth, nationalite: e.nat, ville: e.city, email: e.email, telephone: e.phone, codePostal: e.postal }, o.identite);
  e.address = Object.assign({ province: '—', ville: e.city, quartier: '—', codePostal: e.postal }, o.address);
  e.family = Object.assign({ situation: 'Single', enfants: '00', conjoint: '—', nifConjoint: '—', nssConjoint: '—', pere: '—', mere: '—' }, o.family);
  e.identification = Object.assign({ typePiece: 'National ID', numeroPiece: '—', nif: '—', matricule: '#' + e.id }, o.identification);
  e.emploi = Object.assign({ poste: e.role, typeContrat: e.contractType, dateDebut: '—', salaireNet: '—', categorie: 'Junior', echelon: '-' }, o.emploi);
  e.admin = Object.assign({ cnss: 'Non', numeroCnss: '—', cnamgs: 'Non', derniereVisite: '—' }, o.admin);
  e.banque = Object.assign({ nomBanque: '—', compte: '—' }, o.banque);
  e.formation = Object.assign({ niveau: '—', specialite: '—', competences: [] }, o.formation);
  return e;
}

const state = {
  user: { first: '', last: '', email: '', initials: 'CN' },
  org: { name: '', country: '' },
  choice: 'employee',
  employees: [
    mkEmployee({
      _n: 1, first: 'Carine', last: 'Nanté', gender: 'Female', birth: '23 March 2000', nat: 'Cameroon', city: 'Douala',
      email: 'Carine@kassirh.com', phone: '+237 699 999 999', postal: '000237', service: 'Design', role: 'Graphic Designer', contractType: 'CDI', initials: 'CN', id: '564357P',
      // exact values from Figma get_design_context (node 2586:11193)
      identite: { genre: 'Female', naissance: '23 March 2000', nationalite: 'Cameroonian', ville: 'Douala', email: 'Carine Nanté@gmail.com', telephone: '+237 699 999 999', codePostal: '000237' },
      address: { province: 'Littoral', ville: 'Douala', quartier: 'Yassa', codePostal: '000237' },
      family: { situation: 'Married', enfants: '02', conjoint: 'Alex Meloné Ekoka', nifConjoint: 'P1234567890', nssConjoint: '123456789012345', pere: 'Liopaul mathieu Mukosso', mere: 'Marie ngombé Ep Mukosso' },
      identification: { typePiece: 'National ID', numeroPiece: '1000010000', nif: '0123456789', matricule: '#564357P' },
      emploi: { poste: 'Graphic Designer', typeContrat: 'CDI', dateDebut: '18 April 2025', salaireNet: '700,000 CFA', categorie: 'Senior', echelon: '-' },
      admin: { cnss: 'Yes', numeroCnss: '1234567890', cnamgs: 'No', derniereVisite: '18 April 2025' },
      banque: { nomBanque: 'Ecobank', compte: '10005 00001 00211648150 18' },
      formation: { niveau: "Bachelor's degree", specialite: 'Software Engineering', competences: ['Graphic Designer', 'UI Designer', 'Mobile Dev'] },
    }),
    mkEmployee({
      _n: 2, first: 'Serge', last: 'Moko', gender: 'Male', birth: '12 June 1996', nat: 'Cameroon', city: 'Yaoundé',
      email: 'moko@kassirh.com', phone: '+237 690 000 000', postal: '000237', service: 'Dev', role: 'Mobile Developer', contractType: 'CDD', initials: 'SM', id: '564358M',
      address: { province: 'Centre', ville: 'Yaoundé', quartier: 'Bastos', codePostal: '000237' },
      family: { situation: 'Single', enfants: '00', conjoint: '—', nifConjoint: '—', nssConjoint: '—', pere: 'Jean Moko', mere: 'Estelle Ngo Bikai' },
      identification: { typePiece: 'Passport', numeroPiece: 'CM2093841', nif: '0987654321', matricule: '#564358M' },
      emploi: { poste: 'Mobile Developer', typeContrat: 'CDD', dateDebut: '02 January 2025', salaireNet: '550 000 CFA', categorie: 'Confirmed', echelon: '2' },
      admin: { cnss: 'Yes', numeroCnss: '9988776655', cnamgs: 'Yes', derniereVisite: '10 February 2025' },
      banque: { nomBanque: 'Afriland First Bank', compte: '10033 05100 09876543210 44' },
      formation: { niveau: "Bachelor's degree (Bac+3)", specialite: 'Computer Science', competences: ['Flutter', 'React Native', 'Kotlin'] },
    }),
  ],
  activeNav: 'employees',
  detailIdx: null,
  detailTab: 'identite',
  detailSub: 'contrats',
  editing: false,
};

const COUNTRIES = ['Gabon', 'Cameroon', 'France', 'Senegal', 'Ivory Coast', 'Morocco', 'Canada', 'Belgium', 'Congo', 'Togo'];
const FLAGS = { Gabon: '🇬🇦', Cameroon: '🇨🇲', France: '🇫🇷', Senegal: '🇸🇳', "Ivory Coast": '🇨🇮', Morocco: '🇲🇦', Canada: '🇨🇦', Belgium: '🇧🇪', Congo: '🇨🇬', Togo: '🇹🇬' };
const ROLES = ['Developer', 'Designer', 'HR Manager', 'Accountant', 'Sales Rep', 'Project Manager'];
const CONTRACT_TYPES = [
  'Permanent contract (CDI)',
  'Fixed-term contract CDD (fixed end date)',
  'Fixed-term contract CDD (open-ended / project)',
  'Daily / Weekly',
  'Seasonal contract',
  'Temp / Assignment contract',
  'Part-time contract',
  'Intermittent contract',
  'Apprenticeship contract',
  'Internship contract',
];
const DETAIL_TABS = [
  ['identite', 'Identity information'], ['adresse', 'Address'], ['famille', 'Family & civil'],
  ['identification', 'Identification'], ['emploi', 'Employment info'], ['admin', 'Administrative'],
  ['banques', 'Banking'], ['formation', 'Education'],
];

/* ------------------------------ svg ------------------------------ */
const svg = {
  // Official kassirh wordmark (123x22). Sized by height; width auto-scales.
  wordmark: (h = 24) => `<img class="logo-img" src="logo.svg" alt="kassirh" style="height:${h}px" draggable="false" />`,
  eye: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
  eyeOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 3.9M6.2 6.4A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4-.9"/></svg>`,
  check: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  back: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  bell: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>`,
  grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>`,
  doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h6"/></svg>`,
  plus: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  apps: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="5" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/></svg>`,
  calendar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="18" rx="2.5"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  team: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><circle cx="19" cy="8" r="2.6"/><path d="M23 21v-2a3.5 3.5 0 0 0-3-3.4"/></svg>`,
  gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></svg>`,
  arrow: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  search: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>`,
  filter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 5h18M6 12h12M10 19h4"/></svg>`,
  dots: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>`,
  pencil: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>`,
  copy: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  eyeSm: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
  mail: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 6 10-6"/></svg>`,
  phone: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/></svg>`,
  userLine: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>`,
  cake: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 21h16v-7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7Z"/><path d="M4 15c1.5 1.2 2.5 1.2 4 0s2.5-1.2 4 0 2.5 1.2 4 0"/><path d="M12 8V5M9 8V6M15 8V6"/></svg>`,
  pin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s7-5.6 7-11a7 7 0 0 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
  flagIco: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 22V4s2-1 5-1 4 2 7 2 4-1 4-1v10s-1 1-4 1-4-2-7-2-5 1-5 1"/></svg>`,
  chevD: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  bldg: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M12 9h.01M15 9h.01M9 13h.01M12 13h.01M15 13h.01M10 21v-4h4v4"/></svg>`,
  hash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>`,
  shield: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z"/></svg>`,
  wallet: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2"/><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H5a2 2 0 0 1-2-2Z"/><path d="M16 13h.01"/></svg>`,
  bank: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 10l9-6 9 6M4 10v8M20 10v8M8 10v8M16 10v8M3 21h18"/></svg>`,
  card2: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></svg>`,
  cap: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M22 9L12 5 2 9l10 4 10-4Z"/><path d="M6 11v5c0 1 2.7 3 6 3s6-2 6-3v-5"/></svg>`,
  brief: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M2 13h20"/></svg>`,
  medal: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="15" r="5"/><path d="M8.5 11L6 3h12l-2.5 8M12 13v.01"/></svg>`,
  heart: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 21C7 17.5 3 14 3 9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 9 2.5C21 14 17 17.5 12 21Z"/></svg>`,
  baby: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M9 12h.01M15 12h.01M10 16c.5.5 1.2.8 2 .8s1.5-.3 2-.8"/><path d="M12 3a4 4 0 0 0-4 4c0 1 .3 1.7.8 2.4M12 3a4 4 0 0 1 4 4c0 1-.3 1.7-.8 2.4"/><circle cx="12" cy="13" r="8"/></svg>`,
  file2: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`,
  save: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>`,
  download: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>`,
  info: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5" stroke-linecap="round"/><circle cx="12" cy="8" r=".6" fill="currentColor"/></svg>`,
  checkSm: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`,
  docThumb: `<svg width="56" height="56" viewBox="0 0 56 56" fill="none"><rect x="14" y="10" width="28" height="36" rx="3" fill="#fff"/><rect x="19" y="17" width="15" height="2.4" rx="1.2" fill="#EAD9CE"/><rect x="19" y="22.5" width="18" height="2.4" rx="1.2" fill="#EAD9CE"/><rect x="19" y="28" width="15" height="2.4" rx="1.2" fill="#EAD9CE"/><rect x="19" y="33.5" width="18" height="2.4" rx="1.2" fill="#EAD9CE"/></svg>`,
  confused: `<img class="illus illus--thinking" src="illus-thinking.svg" alt="" draggable="false" />`,
  star: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 18.3 6.2 21l1.1-6.5L2.6 9.8l6.5-.9L12 3Z"/></svg>`,
  greenCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.5 2.5 4.5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  tbSidebar: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>`,
  tbArrow: (dir) => `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="transform:scaleX(${dir === 'r' ? -1 : 1})"><path d="M15 18l-6-6 6-6"/></svg>`,
  tbReload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 4v5h-5"/></svg>`,
  tbLink: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg>`,
  tbDownload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v6m0 0l-2.5-2.5M12 14l2.5-2.5"/></svg>`,
  lock: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  empImg: `<img class="illus" src="illus-employee.svg" alt="Create an employee" draggable="false" />`,
  docImg: `<img class="illus" src="illus-document.svg" alt="Create a document" draggable="false" />`,
  emptyImg: `<img class="illus illus--empty" src="illus-employee.svg" alt="" draggable="false" />`,
};

/* ------------------------------ helpers ------------------------------ */
function initials(first, last) {
  const a = (first || '').trim()[0] || '';
  const b = (last || '').trim()[0] || '';
  return (a + b).toUpperCase() || 'CN';
}
function toast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = `<span class="tk">${svg.check}</span>${msg}`;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
function mount(html) {
  $app.innerHTML = `<div class="view-enter">${html}</div>`;
}
function countryOptions(sel) {
  return COUNTRIES.map(c => `<option ${c === sel ? 'selected' : ''}>${c}</option>`).join('');
}

/* password eye toggling (delegated) */
$app.addEventListener('click', (e) => {
  const eye = e.target.closest('.eye');
  if (eye) {
    const inp = eye.parentElement.querySelector('input');
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    eye.innerHTML = show ? svg.eyeOff : svg.eye;
  }
});

/* ============================ SCREENS ============================ */

/* ---- shared right decorative panel (Figma 171:275) ---- */
function rightPanel(kind = 'browser') {
  if (kind === 'dash') {
    return `<div class="auth__right">
      <img class="auth-blob" src="assets/blob-left.svg" alt="" />
      <img class="org-preview" src="assets/dashboard-preview.png" alt="Dashboard preview" />
    </div>`;
  }
  return `
    <div class="auth__right">
      <img class="auth-blob" src="assets/blob-left.svg" alt="" />
      <div class="auth-bw">${landingBrowser()}</div>
    </div>`;
}

function dashMock() {
  return `
    <div class="mock-dash">
      <svg width="560" height="360" viewBox="0 0 560 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="558" height="358" rx="18" fill="#fff" stroke="#EFE9E4"/>
        <rect x="1" y="1" width="150" height="358" rx="18" fill="#FCFBFA"/>
        <rect x="18" y="26" width="70" height="12" rx="6" fill="#F15A2B" opacity=".85"/>
        <rect x="18" y="70" width="112" height="26" rx="7" fill="#FDEEE7"/>
        <rect x="28" y="78" width="70" height="10" rx="5" fill="#F15A2B" opacity=".7"/>
        <rect x="18" y="104" width="112" height="10" rx="5" fill="#E7E1DC"/>
        <rect x="18" y="126" width="90" height="10" rx="5" fill="#E7E1DC"/>
        <rect x="180" y="30" width="120" height="16" rx="6" fill="#3A322D"/>
        <g stroke="#C79A82" stroke-width="1.4" fill="none" transform="translate(360 150)">
          <circle cx="30" cy="20" r="12"/><path d="M8 70c0-16 10-26 22-26s22 10 22 26"/>
          <circle cx="78" cy="30" r="11"/><path d="M60 80c0-13 8-22 18-22s18 9 18 22"/>
        </g>
        <rect x="330" y="250" width="180" height="12" rx="6" fill="#D9D3CD"/>
        <rect x="360" y="286" width="128" height="30" rx="8" fill="#F15A2B"/>
        <rect x="378" y="296" width="92" height="10" rx="5" fill="#fff" opacity=".9"/>
      </svg>
    </div>`;
}

/* ---- 0. LANDING PAGE (built from Figma reference 1654:5454) ---- */
function landingBrowser() {
  // Toolbar + peach body with the kassirh logo — matches node 1654:5498
  return `
    <div class="lp-browser">
      <div class="lp-browser__bar">
        <div class="lp-tb lp-tb--left">
          <div class="lp-dots"><i></i><i></i><i></i></div>
          <span class="lp-tbico">${svg.tbSidebar}</span>
          <span class="lp-tbico">${svg.tbArrow('l')}</span>
          <span class="lp-tbico">${svg.tbArrow('r')}</span>
          <span class="lp-tbico">${svg.tbReload}</span>
        </div>
        <div class="lp-url">${svg.lock}<span>Kassirh.com</span>${svg.tbLink}</div>
        <div class="lp-tb lp-tb--right">
          <span class="lp-tbico">${svg.tbDownload}</span>
          <span class="lp-tbico">${svg.plus}</span>
        </div>
      </div>
      <div class="lp-browser__body"><img class="lp-browser__logo" src="logo.svg" alt="kassirh" /></div>
    </div>`;
}

function reviewCard(side, photo, badge, name, role, company) {
  return `
    <div class="lp-review lp-review--${side}">
      <img class="lp-star" src="assets/star.svg" alt="" />
      <div class="lp-av">
        <img class="lp-av__photo" src="assets/${photo}" alt="${name}" />
        ${badge}
      </div>
      <div class="lp-review__txt">
        <b>${name}</b>
        <span>${role}, <em>${company}</em></span>
      </div>
    </div>`;
}

function Landing() {
  const badgeJeremy = `<img class="lp-av__badge" src="assets/badge-synergy.svg" alt="" />`;
  const badgeJamilia = `<span class="lp-av__badge lp-av__badge--ring"><img src="assets/badge-zumho.svg" alt="" /></span>`;
  mount(`
    <div class="lp">
      <img class="lp-blob lp-blob--l" src="assets/blob-left.svg" alt="" />
      <img class="lp-blob lp-blob--r" src="assets/blob-right.svg" alt="" />

      <header class="lp-nav">
        <img class="logo-img" src="logo.svg" alt="kassirh" style="height:24px" />
        <div class="lp-nav__links">
          <a id="lp-signin">Log in</a>
          <a class="lp-nav__cta" id="lp-start">Get started</a>
        </div>
      </header>

      <div class="lp-hero">
        <div class="lp-hero-head">
          <span class="lp-badge">Launching soon ...</span>
          <h1 class="lp-title">We're building a powerful tool for you</h1>
        </div>
        <form class="lp-form" id="waitlist">
          <input id="lp-email" type="email" placeholder="Email address" autocomplete="email" />
          <button type="submit" class="lp-form__btn">Join the waitlist</button>
        </form>
      </div>

      <div class="lp-stage">
        ${landingBrowser()}
        ${reviewCard('l', 'avatar-jeremy.png', badgeJeremy, 'Jeremy Kouamou', 'Senior Developer', 'Mouv Tech')}
        ${reviewCard('r', 'avatar-jamilia.png', badgeJamilia, 'Jamilia Nguema Ndo', 'Product Manager', 'Zumho')}
      </div>

      <div class="landing-alert" id="lp-alert"><span class="ac">${svg.greenCheck}</span>You're on the list! We'll let you know as soon as we launch. 🎉</div>
    </div>
  `);

  const form = document.getElementById('waitlist');
  const email = document.getElementById('lp-email');
  const alertEl = document.getElementById('lp-alert');
  form.onsubmit = (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email.value)) { email.focus(); email.classList.add('shake'); setTimeout(() => email.classList.remove('shake'), 400); return; }
    email.value = '';
    alertEl.classList.add('show');
    clearTimeout(Landing._t);
    Landing._t = setTimeout(() => alertEl.classList.remove('show'), 3800);
  };
  document.getElementById('lp-signin').onclick = SignIn;
  document.getElementById('lp-start').onclick = SignUp;
}

/* ---- 1. SIGN IN ---- */
function SignIn() {
  mount(`
    <div class="auth">
      <div class="auth__left">
        <div class="auth__form">
          ${svg.wordmark(26)}
          <h1 style="margin-top:52px">Access my account</h1>
          <div class="field">
            <label>Email</label>
            <div class="input-wrap"><input class="inp" id="si-email" type="email" placeholder="Enter your email address" /></div>
          </div>
          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <input class="inp" id="si-pass" type="password" placeholder="Enter your password" />
              <button class="eye" type="button">${svg.eye}</button>
            </div>
          </div>
          <a class="forgot" id="si-forgot">Forgot password?</a>
          <button class="btn btn--disabled" id="si-submit" disabled>Log in</button>
          <p class="auth-foot">Don't have an account yet? <a id="go-signup">Sign up</a></p>
        </div>
      </div>
      ${rightPanel('browser')}
    </div>
  `);

  const email = document.getElementById('si-email');
  const pass = document.getElementById('si-pass');
  const btn = document.getElementById('si-submit');
  const validate = () => {
    const ok = /\S+@\S+\.\S+/.test(email.value) && pass.value.length >= 1;
    btn.disabled = !ok;
    btn.className = 'btn ' + (ok ? 'btn--primary' : 'btn--disabled');
  };
  email.oninput = pass.oninput = validate;
  btn.onclick = () => {
    if (btn.disabled) return;
    // demo: any credentials accepted
    if (!state.user.email) state.user = { first: 'Danyls', last: 'Ngongang', email: email.value, initials: 'DN' };
    toast('Signed in successfully');
    setTimeout(() => (state.employees.length ? Dashboard() : StartScreen()), 500);
  };
  document.getElementById('go-signup').onclick = SignUp;
  document.getElementById('si-forgot').onclick = () => toast('A reset link has been sent');
}

/* ---- 2. SIGN UP ---- */
function SignUp() {
  mount(`
    <div class="auth">
      <div class="auth__left">
        <div class="auth__form">
          ${svg.wordmark(26)}
          <div class="progress"><i class="on"></i><i></i></div>
          <h1>Sign up</h1>
          <div class="field">
            <label>Last name <span class="req">*</span></label>
            <div class="input-wrap"><input class="inp" id="su-last" placeholder="Enter your last name" /></div>
          </div>
          <div class="field">
            <label>First name <span class="req">*</span></label>
            <div class="input-wrap"><input class="inp" id="su-first" placeholder="Enter your first name" /></div>
          </div>
          <div class="field">
            <label>Email <span class="req">*</span></label>
            <div class="input-wrap"><input class="inp" id="su-email" type="email" placeholder="Enter your email" /></div>
            <div class="err" id="su-email-err">Invalid email address</div>
          </div>
          <div class="field">
            <label>Password</label>
            <div class="input-wrap">
              <input class="inp" id="su-pass" type="password" placeholder="Enter your password" />
              <button class="eye" type="button">${svg.eye}</button>
            </div>
          </div>
          <div class="check-row" id="su-terms">
            <span class="check-box">${svg.check}</span>
            <span>I agree to KassiRH's Terms of Service and Privacy Policy</span>
          </div>
          <button class="btn btn--disabled" id="su-submit" disabled>Continue</button>
          <p class="auth-foot">Already have an account? <a id="go-signin">Log in</a></p>
        </div>
      </div>
      ${rightPanel('browser')}
    </div>
  `);

  const last = document.getElementById('su-last');
  const first = document.getElementById('su-first');
  const email = document.getElementById('su-email');
  const pass = document.getElementById('su-pass');
  const terms = document.getElementById('su-terms');
  const btn = document.getElementById('su-submit');
  let agreed = false;

  const validate = () => {
    const ok = last.value.trim() && first.value.trim() && /\S+@\S+\.\S+/.test(email.value) && pass.value.length >= 4 && agreed;
    btn.disabled = !ok;
    btn.className = 'btn ' + (ok ? 'btn--primary' : 'btn--disabled');
  };
  [last, first, email, pass].forEach(i => (i.oninput = validate));
  terms.onclick = () => { agreed = !agreed; terms.classList.toggle('on', agreed); validate(); };
  email.onblur = () => document.getElementById('su-email-err').classList.toggle('show', email.value && !/\S+@\S+\.\S+/.test(email.value));

  btn.onclick = () => {
    if (btn.disabled) return;
    state.user = { first: first.value.trim(), last: last.value.trim(), email: email.value.trim(), initials: initials(first.value, last.value) };
    toast('Account created successfully');
    setTimeout(OrgCreation, 450);
  };
  document.getElementById('go-signin').onclick = SignIn;
}

/* ---- 3. ORGANIZATION CREATION ---- */
function OrgCreation() {
  mount(`
    <div class="auth">
      <div class="auth__left">
        <div class="auth__topbar"><span class="logout-link" id="logout">Log out</span></div>
        <div class="auth__form">
          ${svg.wordmark(26)}
          <div class="progress"><i class="on"></i><i></i></div>
          <h1>Create an organization</h1>
          <div class="field">
            <label>Organization name <span class="req">*</span></label>
            <div class="input-wrap"><input class="inp" id="org-name" placeholder="Enter the organization name" value="${state.org.name}" /></div>
          </div>
          <div class="field">
            <label>Country <span class="req">*</span></label>
            <div class="select-wrap">
              <select class="inp" id="org-country">
                <option value="" disabled ${state.org.country ? '' : 'selected'}>Label</option>
                ${countryOptions(state.org.country)}
              </select>
            </div>
          </div>
          <button class="btn btn--disabled" id="org-submit" disabled>Next</button>
        </div>
      </div>
      ${rightPanel('dash')}
    </div>
  `);

  const name = document.getElementById('org-name');
  const country = document.getElementById('org-country');
  const btn = document.getElementById('org-submit');
  const validate = () => {
    const ok = name.value.trim() && country.value;
    btn.disabled = !ok;
    btn.className = 'btn ' + (ok ? 'btn--primary' : 'btn--disabled');
  };
  name.oninput = country.onchange = validate;
  validate();
  btn.onclick = () => {
    if (btn.disabled) return;
    state.org = { name: name.value.trim(), country: country.value };
    toast('Organization created');
    setTimeout(StartScreen, 450);
  };
  document.getElementById('logout').onclick = SignIn;
}

/* ---- 4. START / "Commencer dès maintenant" ---- */
function StartScreen() {
  mount(`
    <div>
      ${appbar()}
      <div class="start-wrap">
        <h1>Get started now</h1>
        <p class="lead">What would you like to do next? Select an option to continue.</p>
        <div class="choice-grid">
          <div class="choice ${state.choice === 'employee' ? 'sel' : ''}" data-c="employee">
            <div class="choice__illus">${svg.empImg}</div>
            <div class="choice__div"></div>
            <h3>Create an employee</h3>
            <p>Add a team member to manage their contracts, pay and time off.</p>
          </div>
          <div class="choice ${state.choice === 'document' ? 'sel' : ''}" data-c="document">
            <div class="choice__illus">${svg.docImg}</div>
            <div class="choice__div"></div>
            <h3>Create a document</h3>
            <p>Generate a contract, a certificate or an HR document.</p>
          </div>
        </div>
        <div class="start-actions">
          <button class="btn btn--neutral" id="start-continue">Continue</button>
        </div>
      </div>
    </div>
  `);

  $app.querySelectorAll('.choice').forEach(c => {
    c.onclick = () => {
      state.choice = c.dataset.c;
      $app.querySelectorAll('.choice').forEach(x => x.classList.toggle('sel', x === c));
    };
  });
  document.getElementById('start-continue').onclick = () => {
    if (state.choice === 'employee') EmployeeCreation();
    else { state.activeNav = 'dashboard'; Dashboard(); toast('HR documents available on the dashboard'); }
  };
}

/* ---- 5. EMPLOYEE CREATION ---- */
function EmployeeCreation() {
  mount(`
    <div>
      ${appbar()}
      <div class="center-form">
        <div class="back-btn" id="emp-back">${svg.back}</div>
        <div class="progress"><i class="on"></i><i></i></div>
        <h1>Create my employee</h1>
        <div class="field">
          <label>Last name <span class="req">*</span></label>
          <div class="input-wrap"><input class="inp" id="e-last" placeholder="Enter the last name" /></div>
        </div>
        <div class="field">
          <label>First name <span class="req">*</span></label>
          <div class="input-wrap"><input class="inp" id="e-first" placeholder="Enter the first name" /></div>
        </div>
        <div class="field">
          <label>Phone number</label>
          <div class="phone-row">
            <div class="flag-select"><span class="flag">🇬🇦</span>${chevron()}</div>
            <input class="inp" id="e-phone" placeholder="+241 (555) 123-4567" />
          </div>
        </div>
        <div class="field">
          <label>Nationality</label>
          <div class="select-wrap">
            <select class="inp" id="e-nat">${countryOptions('Gabon')}</select>
          </div>
        </div>
        <div class="field">
          <label>Job title</label>
          <div class="select-wrap">
            <select class="inp" id="e-role">${ROLES.map(r => `<option>${r}</option>`).join('')}</select>
          </div>
        </div>
        <button class="btn btn--disabled" id="e-submit" disabled>Continue</button>
      </div>
    </div>
  `);

  const last = document.getElementById('e-last');
  const first = document.getElementById('e-first');
  const btn = document.getElementById('e-submit');
  const validate = () => {
    const ok = last.value.trim() && first.value.trim();
    btn.disabled = !ok;
    btn.className = 'btn ' + (ok ? 'btn--primary' : 'btn--disabled');
  };
  last.oninput = first.oninput = validate;
  btn.onclick = () => {
    if (btn.disabled) return;
    const nat = document.getElementById('e-nat').value;
    const role = document.getElementById('e-role').value;
    state.employees.push(mkEmployee({
      _n: state.employees.length + 3,
      first: first.value.trim(),
      last: last.value.trim(),
      phone: document.getElementById('e-phone').value || '—',
      nat,
      city: '—',
      email: `${first.value.trim().toLowerCase()}.${last.value.trim().toLowerCase()}@${(state.org.name || 'kassirh').toLowerCase().replace(/\s/g, '')}.com`,
      service: role.includes('Design') ? 'Design' : role.includes('Develop') ? 'Dev' : 'General',
      role,
      contractType: 'CDI',
      initials: initials(first.value, last.value),
    }));
    state.activeNav = 'employees';
    state.detailIdx = null;
    toast('Employee added successfully');
    setTimeout(Dashboard, 500);
  };
  document.getElementById('emp-back').onclick = StartScreen;
}

/* ---- shared appbar ---- */
function appbar() {
  // Figma 1829:11890 — header bar, icons right-aligned (calendar + bell + avatar)
  return `
    <div class="appbar appbar--end">
      <div class="appbar__right">
        <button class="icon-btn" title="Calendar">${svg.calendar}</button>
        <button class="icon-btn" title="Notifications">${svg.bell}</button>
        <div class="avatar">${state.user.initials}</div>
      </div>
    </div>`;
}
function chevron() {
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8A8681" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
}

/* ---- 6. DASHBOARD (two-tier sidebar) ---- */
const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { id: 'employees', label: 'My Employees', icon: 'users' },
  { id: 'plannings', label: 'Schedules', icon: 'calendar' },
  { id: 'teams', label: 'My Teams', icon: 'team' },
];

function Dashboard() {
  const nav = state.activeNav;
  const meta = {
    dashboard: ['Dashboard', 'Find all your HR tasks here'],
    employees: ['My Employees', 'Manage your team members'],
    plannings: ['Schedules', 'Organize shifts and time off'],
    teams: ['My Teams', 'Structure your teams and departments'],
    settings: ['Settings', 'Manage your organization and account'],
  }[nav] || ['Dashboard', ''];
  const inDetail = nav === 'employees' && state.detailIdx != null;

  mount(`
    <div class="dash2">
      <header class="topbar">
        <div class="topbar__brand">${svg.wordmark(22)}</div>
        <div class="topbar__right">
          <button class="icon-btn" title="Notifications">${svg.bell}</button>
          <div class="avatar" title="${state.user.first} ${state.user.last}">${state.user.initials}</div>
        </div>
      </header>
      <div class="dash2__body">
        <div class="rail">
          <button class="rail__btn rail__apps" title="Apps">${svg.apps}</button>
          <div class="rail-add-wrap">
            <button class="rail__btn rail__add" id="rail-add" title="Create">${svg.plus}</button>
            <div class="rail-menu" id="rail-menu">
              <div class="rail-menu__label">Create</div>
              <button data-create="employee">${svg.users} Create an employee</button>
              <button data-create="company">${svg.bldg} Add a company</button>
            </div>
          </div>
        </div>
        <nav class="side">
          <div class="side__label">Home</div>
          <div class="side__nav">
            ${NAV.map(n => `<button class="navlink ${nav === n.id ? 'active' : ''}" data-nav="${n.id}">${svg[n.icon]}<span>${n.label}</span></button>`).join('')}
          </div>
          <div class="side__foot">
            <button class="navlink ${nav === 'settings' ? 'active' : ''}" data-nav="settings">${svg.gear}<span>Settings</span></button>
          </div>
        </nav>
        <main class="main2">
          ${inDetail ? '' : `<div class="main2__head"><h1>${meta[0]}</h1><p>${meta[1]}</p></div>`}
          <div class="main2__body ${inDetail ? 'main2__body--flush' : ''}" id="dash-content"></div>
        </main>
      </div>
    </div>
  `);

  $app.querySelectorAll('.navlink').forEach(n => {
    n.onclick = () => { state.activeNav = n.dataset.nav; Dashboard(); };
  });
  const railMenu = document.getElementById('rail-menu');
  document.getElementById('rail-add').onclick = (ev) => { ev.stopPropagation(); railMenu.classList.toggle('open'); };
  railMenu.querySelectorAll('[data-create]').forEach(b => b.onclick = () => {
    railMenu.classList.remove('open');
    if (b.dataset.create === 'employee') CreateEmployeeForm();
    else AddCompanyForm();
  });
  renderDashContent(nav);
}

function renderDashContent(nav) {
  const el = document.getElementById('dash-content');
  if (nav === 'employees' && state.detailIdx != null) { el.innerHTML = employeeDetail(state.detailIdx); wireDetail(el); return; }
  if (nav === 'dashboard') el.innerHTML = dashOverview();
  else if (nav === 'plannings') el.innerHTML = planningsPage();
  else if (nav === 'teams') el.innerHTML = teamsPage();
  else if (nav === 'settings') el.innerHTML = settingsPage();
  else el.innerHTML = employeesPage();
  el.querySelectorAll('[data-add]').forEach(b => (b.onclick = CreateEmployeeForm));
  el.querySelectorAll('[data-add-company]').forEach(b => (b.onclick = AddCompanyForm));
  el.querySelectorAll('[data-org-settings]').forEach(b => (b.onclick = OrgSettingsForm));
  el.querySelectorAll('[data-nav-to]').forEach(b => (b.onclick = () => { state.activeNav = b.dataset.navTo; Dashboard(); }));
  wireList(el);
}

/* open the employee detail view */
function openDetail(idx, editing = false) { state.detailIdx = idx; state.detailTab = 'identite'; state.detailSub = 'contrats'; state.editing = editing; state.activeNav = 'employees'; Dashboard(); }

/* wire the employees list: search, row "..." menus, row clicks */
function wireList(el) {
  const search = el.querySelector('#emp-search');
  if (search) search.oninput = () => {
    const q = search.value.toLowerCase();
    el.querySelectorAll('tbody tr[data-idx]').forEach(tr => {
      const emp = state.employees[+tr.dataset.idx];
      const hay = `${emp.first} ${emp.last} ${emp.role} ${emp.email} ${emp.id}`.toLowerCase();
      tr.style.display = hay.includes(q) ? '' : 'none';
    });
  };
  el.querySelectorAll('[data-menu]').forEach(btn => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const open = btn.parentElement.classList.contains('open');
      el.querySelectorAll('.rowmenu-wrap.open').forEach(m => m.classList.remove('open'));
      if (!open) btn.parentElement.classList.add('open');
    };
  });
  el.querySelectorAll('[data-action]').forEach(a => {
    a.onclick = (ev) => {
      ev.stopPropagation();
      const idx = +a.dataset.idx, act = a.dataset.action;
      el.querySelectorAll('.rowmenu-wrap.open').forEach(m => m.classList.remove('open'));
      if (act === 'view') openDetail(idx);
      else if (act === 'edit') openDetail(idx, true);
      else if (act === 'doc') { openDetail(idx); setTimeout(() => openContractMenu(), 60); }
      else if (act === 'delete') openDeleteModal(idx);
    };
  });
  el.querySelectorAll('tbody tr[data-idx]').forEach(tr => {
    tr.querySelector('.emp-cell')?.addEventListener('click', () => openDetail(+tr.dataset.idx));
  });
}
document.addEventListener('click', () => {
  document.querySelectorAll('.rowmenu-wrap.open').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.rail-menu.open').forEach(m => m.classList.remove('open'));
});

function dashOverview() {
  const count = state.employees.length;
  return `
    <div class="stat-grid">
      <div class="stat"><div class="stat__top"><div class="stat__ico">${svg.users}</div><span class="trend ${count > 0 ? 'trend--up' : ''}">+${count > 0 ? 100 : 0}%</span></div><h2>${count}</h2><small>Active employees</small></div>
      <div class="stat"><div class="stat__top"><div class="stat__ico">${svg.doc}</div><span class="trend">+0%</span></div><h2>${count}</h2><small>Contracts generated</small></div>
      <div class="stat"><div class="stat__top"><div class="stat__ico">${svg.calendar}</div><span class="trend">100%</span></div><h2>${count ? '3.2k' : '0'}<span class="unit">€</span></h2><small>Payroll / month</small></div>
    </div>
    ${count === 0 ? emptyEmployees() : recentPanel()}
    <h3 class="section-title">HR documents</h3>
    ${docsGrid()}
  `;
}

function planningsPage() {
  return `
    <div class="empty">
      <div class="empty-ico">${svg.calendar}</div>
      <h3>No schedules yet</h3>
      <p>Create schedules to organize your team's shifts, time off and absences.</p>
      <button class="btn btn--primary" style="margin-top:22px" onclick="toast('Schedule creation — coming soon')">${svg.plus} New schedule</button>
    </div>`;
}

function teamsPage() {
  if (state.employees.length === 0) {
    return `
      <div class="empty">
        <div class="empty-ico">${svg.team}</div>
        <h3>You don't have any teams yet</h3>
        <p>Add employees, then group them into teams and departments.</p>
        <button class="btn btn--primary" style="margin-top:22px" data-add>${svg.plus} Add an employee</button>
      </div>`;
  }
  const teams = [
    { name: 'Product & Design', members: state.employees.slice(0, 2) },
    { name: 'Engineering', members: state.employees.slice(0, 3) },
  ];
  return `
    <div class="team-grid">
      ${teams.map(t => `
        <div class="team-card">
          <div class="team-card__head"><b>${t.name}</b><span class="badge badge--active">${t.members.length} member${t.members.length > 1 ? 's' : ''}</span></div>
          <div class="team-avatars">${t.members.map(m => `<div class="avatar" style="width:34px;height:34px;font-size:12px">${m.initials}</div>`).join('')}</div>
        </div>`).join('')}
    </div>`;
}

function settingsPage() {
  return `
    <div class="panel" style="max-width:640px">
      <div class="panel__head"><h3>Organization</h3><div style="display:flex;gap:10px">
        <button class="btn-outline btn-outline--sm" data-org-settings>${svg.gear} Organization settings</button>
        <button class="btn-sm" data-add-company>${svg.plus} Add a company</button>
      </div></div>
      <div style="padding:22px">
        <div class="field" style="margin-top:0"><label>Organization name</label><div class="input-wrap"><input class="inp" value="${state.org.name || 'KassiRH'}" /></div></div>
        <div class="field"><label>Country</label><div class="input-wrap"><input class="inp" value="${state.org.country || 'Gabon'}" /></div></div>
        <div class="field"><label>Account email</label><div class="input-wrap"><input class="inp" value="${state.user.email || 'contact@kassirh.com'}" /></div></div>
        <button class="btn btn--primary" style="width:auto;padding:0 24px" onclick="toast('Changes saved')">Save</button>
      </div>
    </div>`;
}

function recentPanel() {
  return `
    <div class="panel">
      <div class="panel__head"><h3>Recent employees</h3><button class="btn-sm" data-add>${svg.plus} Add</button></div>
      ${employeeTableCompact()}
    </div>`;
}

function employeeTableCompact() {
  return `
    <table class="table">
      <thead><tr><th>Employee</th><th>Job title</th><th>Department</th><th>Contract</th><th>Status</th></tr></thead>
      <tbody>
        ${state.employees.map((e, i) => `
          <tr data-idx="${i}">
            <td><div class="emp-cell"><div class="avatar">${e.initials}</div><div><b>${e.first} ${e.last}</b><small>${e.email}</small></div></div></td>
            <td>${e.role}</td><td>${e.service}</td><td>${e.contractType}</td>
            <td><span class="badge badge--active">Active</span></td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function employeesPage() {
  if (state.employees.length === 0) return emptyEmployees();
  return `
    <div class="list-head">
      <button class="btn-sm" data-add>${svg.plus} Add an employee</button>
    </div>
    <div class="list-tools">
      <div class="search-box">${svg.search}<input id="emp-search" placeholder="Search by last name, first name, ID" /></div>
      <button class="btn-outline" onclick="toast('Filters — coming soon')">${svg.filter} Filter by</button>
    </div>
    ${employeeTable()}`;
}

function emptyEmployees() {
  return `
    <div class="empty">
      ${svg.emptyImg}
      <h3>You haven't added any employees yet</h3>
      <p>Start by creating your first employee to manage contracts, pay and HR documents.</p>
      <button class="btn btn--primary" data-add style="margin-top:22px">${svg.plus} Create your first employee</button>
    </div>`;
}

function employeeTable() {
  return `
    <div class="panel panel--menu">
    <table class="table table--rich">
      <thead><tr>
        <th class="cbx"><span class="checkbox"></span></th>
        <th>Full name</th><th>Job title / Role</th><th>Email</th><th>Phone</th><th>Department</th><th>Contract type</th><th></th>
      </tr></thead>
      <tbody>
        ${state.employees.map((e, i) => `
          <tr data-idx="${i}">
            <td class="cbx"><span class="checkbox"></span></td>
            <td><div class="emp-cell"><div class="avatar">${e.initials}</div><b>${e.first} ${e.last}</b></div></td>
            <td>${e.role}</td>
            <td>${e.email}</td>
            <td>${e.phone}</td>
            <td>${e.service}</td>
            <td>${e.contractType}</td>
            <td class="act-cell">
              <div class="rowmenu-wrap">
                <button class="dots-btn" data-menu title="Actions">${svg.dots}</button>
                <div class="rowmenu">
                  <button data-action="view" data-idx="${i}">${svg.eyeSm} View profile</button>
                  <button data-action="doc" data-idx="${i}">${svg.file2} Create a document</button>
                  <button data-action="edit" data-idx="${i}">${svg.pencil} Edit information</button>
                  <button data-action="delete" data-idx="${i}" class="danger">${svg.trash} Delete user</button>
                </div>
              </div>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>
    </div>`;
}

/* ---- EMPLOYEE DETAIL ---- */
function employeeDetail(idx) {
  const e = state.employees[idx];
  const infoField = (ico, label, val, copy) => `
    <div class="ifield">${ico}<div><small>${label}</small><b>${val}${copy ? ` <span class="copy-ic" title="Copy">${svg.copy}</span>` : ''}</b></div></div>`;
  return `
    <div class="detail">
      <button class="back-btn back-btn--sm" id="d-back">${svg.back}</button>
      <h1 class="detail__title">Employee details</h1>

      <div class="detail__head">
        <div class="detail__id"><div class="avatar avatar--lg">${e.initials}</div><div><b>${e.first} ${e.last}</b><small>ID: ${e.id}</small></div></div>
        <div class="split-btn">
          <button class="split-btn__main" id="d-docs">Documents</button>
          <button class="split-btn__toggle" id="d-docs-t">${svg.chevD}</button>
          <div class="split-menu" id="d-docs-menu">
            <button data-doc-action="contract">${svg.file2} Create a contract</button>
            <button data-doc-action="generate">${svg.doc} Generate a document</button>
          </div>
        </div>
      </div>

      <div class="detail__tabs">
        ${DETAIL_TABS.map(([k, l]) => `<button class="dtab ${state.detailTab === k ? 'active' : ''}" data-dtab="${k}">${l}</button>`).join('')}
      </div>

      <div class="detail__card" id="detail-card">${detailCard(e)}</div>

      <div class="subtabs">
        <button class="subtab ${state.detailSub === 'contrats' ? 'active' : ''}" data-sub="contrats">Contracts</button>
        <button class="subtab ${state.detailSub === 'documents' ? 'active' : ''}" data-sub="documents">Documents</button>
      </div>
      <div id="detail-sub">${detailSub(e)}</div>
    </div>`;
}

/* nested-path get/set for inline editing */
function getPath(e, p) {
  if (p === 'fullname') return `${e.first} ${e.last}`.trim();
  return p.split('.').reduce((o, k) => (o == null ? o : o[k]), e);
}
function setPath(e, p, v) {
  if (p === 'fullname') { const parts = v.trim().split(/\s+/); e.first = parts.shift() || e.first; e.last = parts.join(' '); e.initials = initials(e.first, e.last); return; }
  const ks = p.split('.'); let o = e;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  const last = ks[ks.length - 1];
  o[last] = (p === 'formation.competences') ? v.split(',').map(s => s.trim()).filter(Boolean) : v;
}

/* per-tab field spec: [icon, label, path, opts] — opts {copy, sel:[…], chips} */
const GENRE = ['Male', 'Female', 'Other'];
const OUINON = ['Yes', 'No'];
function TAB_SPEC() {
  return {
    identite: { title: 'Personal information',
      left: [[svg.userLine, 'Full name', 'fullname'], [svg.team, 'Gender', 'identite.genre', { sel: GENRE }], [svg.cake, 'Date of birth', 'identite.naissance'], [svg.flagIco, 'Nationality', 'identite.nationalite'], [svg.pin, 'City', 'identite.ville']],
      rightTitle: 'Contact information',
      right: [[svg.mail, 'Email', 'identite.email', { copy: 1 }], [svg.phone, 'Phone', 'identite.telephone'], [svg.card2, 'Postal code', 'identite.codePostal']] },
    adresse: { title: 'Address information', one: 1,
      left: [[svg.bldg, 'Province', 'address.province'], [svg.pin, 'City', 'address.ville'], [svg.pin, 'District', 'address.quartier'], [svg.card2, 'Postal code', 'address.codePostal']] },
    famille: { title: 'Family situation',
      left: [[svg.heart, 'Marital status', 'family.situation'], [svg.baby, 'No. of children (under 21)', 'family.enfants'], [svg.userLine, "Spouse's name", 'family.conjoint'], [svg.shield, "Spouse's tax ID (NIF)", 'family.nifConjoint'], [svg.shield, "Spouse's social security no. (NSS)", 'family.nssConjoint']],
      rightTitle: 'Parents information',
      right: [[svg.userLine, "Full name (father)", 'family.pere'], [svg.userLine, "Full name (mother)", 'family.mere']] },
    identification: { title: 'ID & identification', one: 1,
      left: [[svg.card2, 'ID document type', 'identification.typePiece'], [svg.hash, 'Document number', 'identification.numeroPiece'], [svg.userLine, 'Worker tax ID (NIF)', 'identification.nif'], [svg.hash, 'Employee number', 'identification.matricule']] },
    emploi: { title: 'Professional information',
      left: [[svg.brief, 'Job title', 'emploi.poste'], [svg.file2, 'Contract type', 'emploi.typeContrat'], [svg.calendar, 'Start date', 'emploi.dateDebut']],
      right: [[svg.wallet, 'Net salary', 'emploi.salaireNet'], [svg.medal, 'Category', 'emploi.categorie'], [svg.shield, 'Grade', 'emploi.echelon']] },
    admin: { title: 'Administrative & social', one: 1,
      left: [[svg.file2, 'CNSS enrolled', 'admin.cnss', { sel: OUINON }], [svg.hash, 'CNSS number', 'admin.numeroCnss'], [svg.file2, 'CNAMGS enrolled', 'admin.cnamgs', { sel: OUINON }], [svg.calendar, 'Last medical check-up', 'admin.derniereVisite']] },
    banques: { title: 'Banking information', one: 1,
      left: [[svg.bank, 'Bank name', 'banque.nomBanque'], [svg.card2, 'Bank account no.', 'banque.compte']] },
    formation: { title: 'Education and qualifications', one: 1,
      left: [[svg.cap, 'Education level', 'formation.niveau'], [svg.brief, 'Specialization', 'formation.specialite'], [svg.medal, 'Skills', 'formation.competences', { chips: 1 }]] },
  };
}

/* render one field (display or, when state.editing, an input/select) */
function editField(e, f) {
  const [ico, label, path, opts = {}] = f;
  const val = getPath(e, path) ?? '';
  let inner;
  if (state.editing) {
    if (opts.sel) inner = `<div class="select-wrap"><select class="einp" data-path="${path}">${opts.sel.map(o => `<option ${o === val ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
    else if (opts.chips) inner = `<input class="einp" data-path="${path}" value="${Array.isArray(val) ? val.join(', ') : val}" placeholder="Separate with commas" />`;
    else inner = `<input class="einp" data-path="${path}" value="${val}" />`;
  } else if (opts.chips) {
    inner = (val && val.length) ? `<div class="chips">${val.map(c => `<span class="chip">${c}</span>`).join('')}</div>` : '<b>—</b>';
  } else {
    inner = `<b>${val || '—'}${opts.copy ? ` <span class="copy-ic">${svg.copy}</span>` : ''}</b>`;
  }
  return `<div class="ifield ${state.editing ? 'ifield--edit' : ''}">${ico}<div class="ifield__body"><small>${label}</small>${inner}</div></div>`;
}

function detailCard(e) {
  const spec = TAB_SPEC()[state.detailTab];
  const cols = spec.left.map(f => editField(e, f)).join('');
  const body = spec.one
    ? `<div class="ifield-grid ifield-grid--one">${cols}</div>`
    : `<div class="ifield-grid">
        <div>${cols}</div>
        <div class="${spec.rightTitle ? 'ifield-col--titled' : ''}">
          ${spec.rightTitle ? `<h4 class="ifield-sub">${spec.rightTitle}</h4>` : ''}
          ${spec.right.map(f => editField(e, f)).join('')}
        </div></div>`;

  const actions = state.editing
    ? `<div class="card-actions">
         <button class="btn-outline btn-outline--sm" id="d-cancel">${svgX(15)} Cancel</button>
         <button class="btn-outline btn-outline--sm" id="d-save">${svg.save} Save</button>
       </div>`
    : `<button class="btn-outline btn-outline--sm" id="d-modify">${svg.pencil} Edit</button>`;

  return `<div class="card-top"><h3>${spec.title}</h3>${actions}</div>${body}`;
}

function detailSub(e) {
  if (state.detailSub === 'documents') {
    const docs = e.documents || [];
    if (!docs.length) return emptyDocs();
    return `
      <div class="docs-head"><b>${docs.length} Document${docs.length > 1 ? 's' : ''}</b>
        <button class="btn-sm" data-gen-new>${svg.plus} Add new document</button></div>
      <div class="gdoc-list">${docs.map(docCard).join('')}</div>`;
  }
  if (!e.contracts.length) {
    return `
      <div class="empty">
        ${svg.confused}
        <p class="empty-lead">No contract yet. Create one by clicking the button below.</p>
        <button class="btn btn--primary" id="d-create-contract" style="margin-top:8px">${svg.plus} Create a contract</button>
      </div>`;
  }
  return e.contracts.map(c => `
    <div class="contract-card">
      <div class="contract-card__head">
        <div><b>${c.short}</b> <span class="badge badge--active">Active</span></div>
        <div class="contract-card__actions">
          <button class="btn-outline btn-outline--sm" data-preview="${c.short}">${svg.eyeSm} View contract</button>
          <button class="btn-sm" data-generate="${c.type}">${svg.file2} Generate document</button>
        </div>
      </div>
      <div class="contract-card__grid">
        <div><small>Position</small><b>${c.position}</b></div>
        <div><small>Duration</small><b>${c.duration}</b></div>
        <div><small>Salary</small><b>${c.salary}</b></div>
      </div>
    </div>`).join('');
}

function emptyDocs() {
  return `
    <div class="empty">${svg.confused}
      <p class="empty-lead">No documents generated yet. Generate one from a contract.</p>
      <button class="btn btn--primary" data-gen-new style="margin-top:8px">${svg.plus} Generate a document</button>
    </div>`;
}

/* rich generated-document card (Figma 3789:14443) */
function docCard(d) {
  return `
    <div class="gdoc-card">
      <div class="gdoc-thumb">${svg.docThumb}</div>
      <div class="gdoc-main">
        <div class="gdoc-top"><b>${d.title}</b><span class="badge badge--done">${svg.checkSm} Completed</span></div>
        <div class="gdoc-meta">
          <div><small>Document ID:</small><b>${d.id}</b></div>
          <div><small>Date Generated</small><b>${d.date}</b></div>
          <div><small>Employee</small><b>${d.employee}</b></div>
          <div class="gdoc-actions">
            <button class="gdoc-act" data-dl>${svg.download} Download</button>
            <button class="gdoc-act gdoc-act--orange" data-view>${svg.eyeSm} View Details</button>
          </div>
        </div>
      </div>
    </div>`;
}

function wireDetail(el) {
  const e = state.employees[state.detailIdx];
  el.querySelector('#d-back').onclick = () => { state.detailIdx = null; Dashboard(); };
  el.querySelectorAll('[data-dtab]').forEach(t => t.onclick = () => {
    state.detailTab = t.dataset.dtab;
    state.editing = false;
    el.querySelectorAll('[data-dtab]').forEach(x => x.classList.toggle('active', x === t));
    document.getElementById('detail-card').innerHTML = detailCard(e);
    bindCardButtons(el, e);
  });
  el.querySelectorAll('[data-sub]').forEach(s => s.onclick = () => {
    state.detailSub = s.dataset.sub;
    el.querySelectorAll('[data-sub]').forEach(x => x.classList.toggle('active', x === s));
    document.getElementById('detail-sub').innerHTML = detailSub(e);
    bindSub(el, e);
  });
  // split button
  const toggle = () => document.getElementById('d-docs-menu').classList.toggle('open');
  el.querySelector('#d-docs').onclick = toggle;
  el.querySelector('#d-docs-t').onclick = toggle;
  el.querySelectorAll('[data-doc-action]').forEach(b => b.onclick = () => {
    document.getElementById('d-docs-menu').classList.remove('open');
    if (b.dataset.docAction === 'contract') openContractMenu();
    else generateDocument();
  });
  bindCardButtons(el, e);
  bindSub(el, e);
}
function bindCardButtons(el, e) {
  const rerenderCard = () => { document.getElementById('detail-card').innerHTML = detailCard(e); bindCardButtons(el, e); };
  const m = el.querySelector('#d-modify');
  if (m) m.onclick = () => { state.editing = true; rerenderCard(); };
  const cancel = el.querySelector('#d-cancel');
  if (cancel) cancel.onclick = () => { state.editing = false; rerenderCard(); };
  const save = el.querySelector('#d-save');
  if (save) save.onclick = () => {
    el.querySelectorAll('#detail-card [data-path]').forEach(inp => setPath(e, inp.dataset.path, inp.value));
    state.editing = false;
    // keep list/table in sync with identity edits
    document.getElementById('detail-card').innerHTML = detailCard(e);
    // refresh the header name/avatar in case fullname changed
    const idEl = el.querySelector('.detail__id b'); if (idEl) idEl.textContent = `${e.first} ${e.last}`;
    const avEl = el.querySelector('.detail__id .avatar'); if (avEl) avEl.textContent = e.initials;
    bindCardButtons(el, e);
    toast('Information updated');
  };
  el.querySelectorAll('.copy-ic').forEach(c => c.onclick = () => toast('Copied to clipboard'));
}
function bindSub(el, e) {
  const c = el.querySelector('#d-create-contract'); if (c) c.onclick = openContractMenu;
  el.querySelectorAll('[data-generate]').forEach(g => g.onclick = generateDocument);
  el.querySelectorAll('[data-preview]').forEach((b, i) => b.onclick = () => previewContract(e.contracts[i], e));
  el.querySelectorAll('[data-gen-new]').forEach(g => g.onclick = generateDocument);
  el.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => toast('Downloading document…'));
  el.querySelectorAll('[data-view]').forEach(b => b.onclick = () => toast('Opening document…'));
  el.querySelectorAll('[data-doc]').forEach(d => d.onclick = () => toast(`Document "${d.dataset.doc}" opened`));
}

function docsGrid() {
  const docs = [
    { t: 'Employment contract', d: 'CDI, CDD, internship — generated automatically.' },
    { t: 'Work certificate', d: 'Proof of end of contract.' },
    { t: 'Payslip', d: 'Monthly pay statement.' },
    { t: 'Employer certificate', d: 'Supporting document for your employees.' },
  ];
  return `
    <div class="docs-grid">
      ${docs.map(d => `<div class="doc-card" data-doc="${d.t}"><div class="doc-ico">${svg.doc}</div><b>${d.t}</b><p>${d.d}</p></div>`).join('')}
    </div>`;
}

/* ---- generic modal ---- */
function openModal(html, opts = {}) {
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal ${opts.wide ? 'modal--wide' : ''} ${opts.gd ? 'modal--gd' : ''} ${opts.preview ? 'modal--preview' : ''}">${html}</div>`;
  document.body.appendChild(ov);
  const close = () => ov.remove();
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  ov.querySelectorAll('[data-close]').forEach(b => b.onclick = close);
  requestAnimationFrame(() => ov.classList.add('in'));
  return { ov, close };
}

/* ---- contract type menu (dropdown from Documents button) ---- */
function openContractMenu() { CreateContractForm(); }

/* ===== Création d'un contrat — 5-step modal (Figma 2791:14857 / 3034:15298) ===== */
const CC_STEPS = ['Contract information', 'Job description', 'Salary information', 'Contract summary', 'Contract generation'];
const CC_SALARY = ['Hourly', 'Monthly', 'Per task'];

function ccBody(step, d) {
  const g = k => d[k] || '';
  if (step === 0) return `
    ${cefField('type', 'Contract type', { options: CONTRACT_TYPES, ph: 'Select', val: g('type') || 'Permanent contract (CDI)' })}
    ${cefField('clause', 'Contract clause', { textarea: 1, info: 1, ph: 'Describe the contract clauses…', val: g('clause') })}
    ${cefField('debut', 'Contract start date', { ph: 'DD/MM/YYYY', val: g('debut') || '05/05/2026' })}
    ${cefField('fin', 'Contract end date', { ph: 'DD/MM/YYYY', val: g('fin') || '05/08/2026' })}
    ${cefField('lieu', "Place of work <span class='ac-opt'>(optional)</span>", { ph: 'Workplace address', val: g('lieu') })}`;
  if (step === 1) return `
    ${cefField('tache', 'Main task', { ph: 'e.g. Backend Developer', val: g('tache') })}
    ${cefField('resp', 'Responsibility', { textarea: 1, ph: 'Description of the task responsibility…', val: g('resp') })}`;
  if (step === 2) return `
    ${cefField('typeSalaire', 'Salary type', { options: CC_SALARY, ph: 'Select', val: g('typeSalaire') })}
    ${cefField('salaire', 'Salary', { ph: 'e.g. 4,000 CFA', val: g('salaire') })}
    ${cefField('salaireTache', 'Per-task salary', { ph: '-', val: g('salaireTache') })}
    ${cefField('infoSupp', 'Additional info', { textarea: 1, ph: 'e.g. Vouchers…', val: g('infoSupp') })}`;
  if (step === 3) return ccReview(d);
  return `
    <div class="cc-gen">
      <div class="cc-gen__ico">${svg.docThumb}</div>
      <p>All the information is ready. Generate the contract to finalize it, then preview and download the document.</p>
      <button type="button" class="btn-outline" id="cc-preview">${svg.eyeSm} Preview the contract</button>
    </div>`;
}

function ccReview(d) {
  const list = (title, items) => `
    <div class="cc-list"><div class="cc-list__head">${title}</div>
      ${items.map(([k, v]) => `<div class="cc-row"><span>${k}</span><b>${v || '—'}</b></div>`).join('')}
    </div>`;
  return `
    ${list('Contract information', [['Contract type', contractShort(d.type || '')], ['Contract clause', d.clause || 'Clause description'], ['Start date', d.debut], ['End date', d.fin], ['Place of work', d.lieu]])}
    ${list('Job description', [['Main task', d.tache], ['Responsibility', d.resp]])}
    ${list('Salary information', [['Salary type', d.typeSalaire], ['Salary', d.salaire], ['Per-task salary', d.salaireTache || '-'], ['Additional info', d.infoSupp]])}`;
}

function ccNav(step) {
  return `<div class="ac-nav">${CC_STEPS.map((title, i) => {
    const s = i < step ? 'done' : i === step ? 'active' : '';
    return `<button type="button" class="ac-step ${s}" data-step="${i}">
      <span class="ac-step-num">${i < step ? svg.check : (i + 1)}</span>
      <div class="ac-step-txt"><small>Step ${i + 1}</small><b>${title}</b></div>
    </button>`;
  }).join('')}</div>`;
}

function CreateContractForm() {
  const e = state.employees[state.detailIdx];
  const data = {};
  let step = 0;
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal ac cc"></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  const modal = ov.querySelector('.cc');
  const close = () => ov.remove();
  ov.addEventListener('click', ev => { if (ev.target === ov) close(); });
  const collect = () => modal.querySelectorAll('[data-k]').forEach(i => { data[i.dataset.k] = i.value; });
  const goto = n => { collect(); step = Math.max(0, Math.min(CC_STEPS.length - 1, n)); render(); };

  function saveContract() {
    const short = contractShort(data.type || 'Permanent contract (CDI)');
    e.contracts.unshift({
      type: data.type || 'Permanent contract (CDI)', short,
      position: data.tache || e.role,
      duration: `${data.debut || '—'} - ${data.fin || '—'}`,
      salary: data.salaire || '—',
      clause: data.clause, resp: data.resp, lieu: data.lieu, typeSalaire: data.typeSalaire,
      date: new Date().toLocaleDateString('en-GB'),
    });
    e.contractType = short.includes('CDD') ? 'CDD' : short.includes('Internship') ? 'Internship' : 'CDI';
  }

  function render() {
    const last = step === CC_STEPS.length - 1;
    modal.innerHTML = `
      <div class="ac-head"><div><h2>Create a contract</h2><p class="ac-sub">Edit the organizer information</p></div><button class="modal-close ac-x" id="cc-close">${svgX(18)}</button></div>
      <div class="ac-content">
        ${ccNav(step)}
        <div class="ac-form">
          <div class="ac-section">${CC_STEPS[step]}</div>
          <div class="ac-fields cc-fields">${ccBody(step, data)}</div>
        </div>
      </div>
      <div class="ac-foot ac-foot--split">
        <button class="btn-outline" id="cc-back">Back</button>
        <button class="btn btn--primary ac-btn" id="cc-next">${last ? 'Generate contract' : 'Next'}</button>
      </div>`;
    modal.querySelector('#cc-close').onclick = close;
    modal.querySelectorAll('[data-step]').forEach(b => b.onclick = () => goto(+b.dataset.step));
    modal.querySelector('#cc-back').onclick = () => { if (step === 0) close(); else goto(step - 1); };
    const pv = modal.querySelector('#cc-preview'); if (pv) pv.onclick = () => { collect(); previewContract({ type: data.type, tache: data.tache }, e); };
    modal.querySelector('#cc-next').onclick = () => {
      if (last) { collect(); saveContract(); close(); state.detailSub = 'contrats'; Dashboard(); toast('Contract created successfully'); setTimeout(() => previewContract(e.contracts[0], e), 350); }
      else goto(step + 1);
    };
    modal.querySelector('.ac-form').scrollTop = 0;
  }
  render();
}

/* ===== Prévisualiser le contrat (Figma 2895:1971) ===== */
function previewContract(c, e) {
  const name = `${e.first} ${e.last}`.trim() || 'the employee';
  const company = state.org.name || 'KassiRH';
  const title = (c && c.tache) || e.role || 'Employee Title';
  const date = new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  const { close } = openModal(`
    <div class="pv-head"><h2>Preview the contract</h2><button class="modal-close pv-x" data-close>${svgX(18)}</button></div>
    <div class="pv-body">
      <div class="pv-paper">
        <div class="pv-date">${date}</div>
        <p class="pv-dear">Dear <span class="pv-name">${name}</span></p>
        <p><b>${company}</b> (the “Company”), is pleased to offer you employment with the Company on the terms described below. This offer of employment is conditioned on your satisfactory completion of certain requirements, as more fully explained in this letter. Your employment is subject to the terms and conditions set forth in this letter.</p>
        <p>• <b>Position.</b> You will start in a full-time position of <b>${title}</b>. In this capacity, you will perform duties and responsibilities that are reasonable and consistent with such position as may be assigned to you from time to time. You will report directly to your manager. You agree to devote your full business time, attention, and best efforts to the performance of your duties and to the furtherance of the Company's interests.</p>
        <p>• <b>Compensation and Employee Benefits.</b> In consideration of your services, you will be paid ${(c && c.salary) || 'your salary'}, payable in accordance with the standard payroll practices of the Company and subject to all withholdings and deductions as required by law. As a regular employee of the Company you will be eligible to participate in a number of Company-sponsored benefits.</p>
        <p>• <b>Employment Relationship.</b> Employment with the Company is for no specific period of time. Your employment with the Company will be “at will,” meaning that either you or the Company may terminate your employment at any time and for any reason, with or without cause. Any contrary representations which may have been made to you are superseded by this offer.</p>
      </div>
    </div>
    <div class="pv-foot">
      <button class="btn-outline" data-close>Close</button>
      <button class="btn btn--primary pv-dl" id="pv-dl">${svg.download} Download the contract</button>
    </div>`, { preview: 1 });
  document.getElementById('pv-dl').onclick = () => toast('Downloading contract…');
}

function contractShort(type) {
  if (type.includes('CDI')) return 'Permanent Contract (CDI)';
  if (type.includes('CDD')) return 'Fixed-term Contract (CDD)';
  if (type.includes('Internship')) return 'Internship Contract';
  if (type.includes('Apprenticeship')) return 'Apprenticeship Contract';
  if (type.includes('Seasonal')) return 'Seasonal Contract';
  return type;
}

/* ---- generate document (produces a document from a contract) ---- */
const DOC_TYPES = ['Proof of Employment', 'Organization Certificate', 'Ownership Certificate', 'Work Certificate'];

/* Generate Document modal (Figma 3720:14489) */
function generateDocument() {
  const e = state.employees[state.detailIdx];
  const org = state.org.name || 'KassiRH Company';
  const { ov, close } = openModal(`
    <div class="gd-head"><h2>Generate Document</h2><button class="modal-close gd-x" data-close>${svgX(18)}</button></div>
    <div class="gd-body">
      <div class="gd-section">Organization information</div>
      <div class="cef-field">
        <label>Organization <span class="req">*</span></label>
        <input class="inp gd-locked" value="${org}" disabled />
        <p class="gd-hint">Pre-filled (Can be changed by admin for multi-org)</p>
      </div>
      <div class="cef-field">
        <label>Document Type <span class="req">*</span></label>
        <div class="select-wrap"><select class="inp" id="gd-type">
          <option value="" selected disabled>Select document type…</option>
          ${DOC_TYPES.map(t => `<option>${t}</option>`).join('')}
        </select></div>
      </div>
      <div class="gd-warn" id="gd-warn">
        <b>Missing Required Information:</b>
        <div class="gd-warn-row"><span class="gd-tag">DOCUMENT TYPE</span> Required Information Missing</div>
      </div>
    </div>
    <div class="gd-foot">
      <button class="btn-outline" data-close>Cancel</button>
      <button class="btn btn--primary gd-gen" id="gd-gen">Generate</button>
    </div>`, { gd: 1 });

  const sel = ov.querySelector('#gd-type');
  const warn = ov.querySelector('#gd-warn');
  sel.onchange = () => { warn.classList.toggle('show', !sel.value); };
  ov.querySelector('#gd-gen').onclick = () => {
    if (!sel.value) { warn.classList.add('show'); sel.focus(); return; }
    e.documents = e.documents || [];
    e.documents.unshift({
      title: sel.value,
      id: 'DOC-' + Date.now(),
      date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      employee: `${e.first} ${e.last}`,
      status: 'Completed',
    });
    close();
    state.detailSub = 'documents';
    Dashboard();
    toast('Document generated 🎉');
  };
}

/* ---- edit employee ---- */
function openEditModal(idx) {
  const e = state.employees[idx];
  const { ov, close } = openModal(`
    <button class="modal-close" data-close>${svgX()}</button>
    <h2>Edit information</h2>
    <p class="modal-sub">${e.first} ${e.last} · ID ${e.id}</p>
    <div class="form-grid">
      <div class="field"><label>Last name</label><div class="input-wrap"><input class="inp" id="ed-last" value="${e.last}" /></div></div>
      <div class="field"><label>First name</label><div class="input-wrap"><input class="inp" id="ed-first" value="${e.first}" /></div></div>
      <div class="field"><label>Email</label><div class="input-wrap"><input class="inp" id="ed-email" value="${e.email}" /></div></div>
      <div class="field"><label>Phone</label><div class="input-wrap"><input class="inp" id="ed-phone" value="${e.phone}" /></div></div>
      <div class="field"><label>Job title / Role</label><div class="input-wrap"><input class="inp" id="ed-role" value="${e.role}" /></div></div>
      <div class="field"><label>Department</label><div class="input-wrap"><input class="inp" id="ed-service" value="${e.service}" /></div></div>
      <div class="field"><label>City</label><div class="input-wrap"><input class="inp" id="ed-city" value="${e.city}" /></div></div>
      <div class="field"><label>Nationality</label><div class="select-wrap"><select class="inp" id="ed-nat">${countryOptions(e.nat)}</select></div></div>
    </div>
    <div class="modal-actions">
      <button class="btn-outline" data-close>Cancel</button>
      <button class="btn btn--primary" id="ed-save" style="width:auto;padding:0 26px;margin-top:0">Save</button>
    </div>`, { wide: true });

  ov.querySelector('#ed-save').onclick = () => {
    e.last = ov.querySelector('#ed-last').value.trim() || e.last;
    e.first = ov.querySelector('#ed-first').value.trim() || e.first;
    e.email = ov.querySelector('#ed-email').value.trim();
    e.phone = ov.querySelector('#ed-phone').value.trim();
    e.role = ov.querySelector('#ed-role').value.trim();
    e.service = ov.querySelector('#ed-service').value.trim();
    e.city = ov.querySelector('#ed-city').value.trim();
    e.nat = ov.querySelector('#ed-nat').value;
    e.initials = initials(e.first, e.last);
    close();
    Dashboard();
    toast('Information updated');
  };
}

/* ---- delete employee ---- */
function openDeleteModal(idx) {
  const e = state.employees[idx];
  const { ov, close } = openModal(`
    <div class="del-icon">${svg.trash}</div>
    <h2>Delete this user?</h2>
    <p class="modal-sub">This will permanently delete <b>${e.first} ${e.last}</b> and their data. This action cannot be undone.</p>
    <div class="modal-actions" style="justify-content:center">
      <button class="btn-outline" data-close>Cancel</button>
      <button class="btn btn--danger" id="del-yes" style="width:auto;padding:0 24px;margin-top:0">Delete</button>
    </div>`);
  ov.querySelector('#del-yes').onclick = () => {
    state.employees.splice(idx, 1);
    state.detailIdx = null;
    close();
    Dashboard();
    toast('Employee deleted');
  };
}

function svgX(s = 18) { return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>`; }

/* ===== Create Employee form — "Identité de base" (Figma 1485:3988 / 1485:4040) ===== */
const CEF_ENFANTS = ['0-1', '2-3', '4-5', '6+'];
const CEF_SITUATION = ['Single', 'Married', 'Divorced', 'Widowed'];
const CEF_PIECE = ['National ID', 'Passport', "Driver's license", 'Residence permit'];
const CEF_CATEGORIE = ['Senior manager', 'Manager', 'Supervisor', 'Employee', 'Worker'];

function cefField(k, label, opts = {}) {
  const req = opts.req ? ' <span class="req">*</span>' : '';
  const val = (opts.val ?? '').toString().replace(/"/g, '&quot;');
  let control;
  if (opts.options) {
    control = `<div class="select-wrap"><select class="inp" data-k="${k}">
      ${opts.ph ? `<option value="" ${opts.val ? '' : 'selected'} disabled>${opts.ph}</option>` : ''}
      ${opts.options.map(o => `<option ${o === opts.val ? 'selected' : ''}>${o}</option>`).join('')}
    </select></div>`;
  } else if (opts.phone) {
    control = `<div class="phone-row"><div class="flag-select"><span class="flag">🇬🇦</span>${chevron()}</div><input class="inp" data-k="${k}" placeholder="${opts.ph || ''}" value="${val}" /></div>`;
  } else if (opts.suffix) {
    control = `<div class="cef-inwrap"><input class="inp" data-k="${k}" placeholder="${opts.ph || ''}" value="${val}" /><span class="cef-suffix">${opts.suffix}</span></div>`;
  } else if (opts.textarea) {
    control = `<textarea class="inp cef-textarea" data-k="${k}" rows="3" placeholder="${opts.ph || ''}">${val}</textarea>`;
  } else {
    control = `<input class="inp" data-k="${k}" placeholder="${opts.ph || ''}" value="${val}" />`;
  }
  const info = opts.info ? ` <span class="cef-info" title="Information">${svg.info || 'ⓘ'}</span>` : '';
  return `<div class="cef-field"><label>${label}${req}${info}</label>${control}</div>`;
}
const cefRow = (a, b) => `<div class="cef-row">${a}${b}</div>`;

function cefBody(step, d) {
  const g = k => d[k] || '';
  if (step === 1) {
    return `
      <div class="cef-section">Personal information</div>
      ${cefField('nom', 'Last name', { req: 1, ph: 'Last name', val: g('nom') })}
      ${cefField('prenom', 'First name', { req: 1, ph: 'First name', val: g('prenom') })}
      ${cefField('sexe', 'Gender', { req: 1, options: ['Male', 'Female'], val: g('sexe') || 'Male' })}
      ${cefRow(
        cefField('naissance', 'Date of birth', { req: 1, ph: 'DD/MM/YYYY', val: g('naissance') }),
        cefField('nationalite', 'Nationality', { req: 1, ph: 'e.g. Gabonese', val: g('nationalite') }))}
      ${cefField('email', 'Email', { ph: 'name@example.com', val: g('email') })}
      ${cefField('telephone', 'Phone', { phone: 1, ph: '+241 ...', val: g('telephone') })}
      ${cefRow(
        cefField('province', 'Province', { req: 1, options: COUNTRIES.length ? ['Estuaire', 'Haut-Ogooué', 'Littoral', 'Centre'] : [], ph: 'Label', val: g('province') }),
        cefField('ville', 'City', { req: 1, ph: 'City', val: g('ville') }))}
      ${cefRow(
        cefField('boite', 'P.O. box', { req: 1, ph: '000221', val: g('boite') }),
        cefField('quartier', 'District', { req: 1, ph: 'District', val: g('quartier') }))}
      ${cefRow(
        cefField('situation', 'Marital status', { options: CEF_SITUATION, ph: 'Label', val: g('situation') }),
        cefField('enfants', 'Number of children (under 21)', { options: CEF_ENFANTS, val: g('enfants') || '0-1' }))}
      ${cefField('conjoint', "Spouse's full name", { ph: "Spouse's name", val: g('conjoint') })}
      ${cefField('pere', "Father's full name", { ph: "Father's name", val: g('pere') })}
      ${cefField('mere', "Mother's full name", { ph: "Mother's name", val: g('mere') })}
      ${cefRow(
        cefField('piece', 'ID document', { req: 1, options: CEF_PIECE, ph: 'Label', val: g('piece') }),
        cefField('numDoc', 'Document number', { ph: '01234456790', val: g('numDoc') }))}

      <div class="cef-section">Job information</div>
      ${cefRow(
        cefField('poste', 'Job title', { req: 1, options: ROLES, ph: 'Label', val: g('poste') }),
        cefField('contrat', 'Contract type', { req: 1, options: ['CDI', 'CDD', 'Internship', 'Temp'], ph: 'Label', val: g('contrat') }))}
      ${cefRow(
        cefField('dateEntree', 'Start date', { req: 1, ph: 'DD/MM/YYYY', val: g('dateEntree') }),
        cefField('salaire', 'Net salary', { req: 1, ph: '700 000', suffix: 'XAF', val: g('salaire') }))}
      ${cefRow(
        cefField('numEmp', 'Employee number (unique)', { ph: 'Employee number', val: g('numEmp') }),
        cefField('nssConjoint', "Spouse's social security number", { req: 1, ph: 'Social security number', val: g('nssConjoint') }))}
    `;
  }
  return `
    <div class="cef-section">Administrative information</div>
    ${cefField('cnss', 'CNSS number', { req: 1, ph: '1234567890', val: g('cnss') })}
    ${cefField('cnamgs', 'CNAMGS number', { req: 1, ph: '2 85 04 10 123 456 01', val: g('cnamgs') })}
    ${cefField('niu', "NIU (worker's tax identification number)", { req: 1, ph: 'P 1290 100200300 K.', val: g('niu') })}
    ${cefField('categorie', 'Category', { req: 1, options: CEF_CATEGORIE, ph: 'Select a category …', val: g('categorie') })}
    ${cefField('medical', 'Last medical exam', { req: 1, ph: 'DD/MM/YYYY', val: g('medical') })}

    <div class="cef-section">Banking information</div>
    ${cefField('compte', 'Bank account number', { req: 1, ph: 'Enter the bank account number', val: g('compte') })}
    ${cefField('banque', 'Bank name', { req: 1, ph: 'Bank name', val: g('banque') })}

    <div class="cef-section">Education information</div>
    ${cefField('niveau', 'Education level', { options: ['High school', 'Associate (Bac+2)', "Bachelor's (Bac+3)", "Master's (Bac+5)", 'Doctorate'], ph: 'Label', val: g('niveau') })}
    ${cefField('specialite', 'Specialization', { ph: 'Enter the specialization', val: g('specialite') })}
  `;
}

function cefStepper(step) {
  const s1done = step > 1;
  return `<div class="cef-steps">
    <div class="cef-step ${step === 1 ? 'active' : ''} ${s1done ? 'done' : ''}"><span class="cef-num">${s1done ? svg.check : '1'}</span> Basic information</div>
    <span class="cef-line"></span>
    <div class="cef-step ${step === 2 ? 'active done' : ''}"><span class="cef-num">2</span> Administrative & social</div>
  </div>`;
}

function CreateEmployeeForm() {
  const data = {};
  let step = 1;
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal cef"></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  const modal = ov.querySelector('.cef');
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });

  const collect = () => modal.querySelectorAll('[data-k]').forEach(i => { data[i.dataset.k] = i.value; });

  function render() {
    const footer = step === 1
      ? `<button class="btn btn--primary cef-btn" id="cef-continue">Continue</button>`
      : `<button class="btn btn--neutral cef-btn" id="cef-back">Back</button><button class="btn btn--primary cef-btn" id="cef-save">Save</button>`;
    modal.innerHTML = `
      <div class="cef-head">
        <div><h2>Basic identity</h2><p>Create the employee profile</p></div>
        <button class="icon-btn cef-close" id="cef-close">${svgX(16)}</button>
      </div>
      <div class="cef-scroll">
        ${cefStepper(step)}
        <div class="cef-body">${cefBody(step, data)}</div>
      </div>
      <div class="cef-foot">${footer}</div>`;
    modal.querySelector('#cef-close').onclick = close;
    const cont = modal.querySelector('#cef-continue');
    if (cont) cont.onclick = () => { collect(); step = 2; render(); };
    const back = modal.querySelector('#cef-back');
    if (back) back.onclick = () => { collect(); step = 1; render(); };
    const save = modal.querySelector('#cef-save');
    if (save) save.onclick = () => { collect(); close(); saveEmployeeFromForm(data); };
  }
  render();
}

function saveEmployeeFromForm(d) {
  const first = (d.prenom || '').trim(), last = (d.nom || '').trim();
  const svc = (d.poste || '').includes('Design') ? 'Design' : /Develop/.test(d.poste || '') ? 'Dev' : 'General';
  const emp = mkEmployee({
    _n: state.employees.length + 3,
    first: first || 'New', last: last || 'Employee', initials: initials(first || 'N', last || 'E'),
    gender: d.sexe === 'Female' ? 'Female' : 'Male', birth: d.naissance || '—', nat: d.nationalite || '—', city: d.ville || '—',
    email: d.email || `${(first || 'employee').toLowerCase()}.${(last || '').toLowerCase()}@${(state.org.name || 'kassirh').toLowerCase().replace(/\s/g, '')}.com`,
    phone: d.telephone || '—', postal: d.boite || '—', service: svc, role: d.poste || 'Employee', contractType: d.contrat || 'CDI',
    id: d.numEmp || undefined,
    identite: { genre: d.sexe === 'Female' ? 'Female' : 'Male', naissance: d.naissance || '—', nationalite: d.nationalite || '—', ville: d.ville || '—', email: d.email || '—', telephone: d.telephone || '—', codePostal: d.boite || '—' },
    address: { province: d.province || '—', ville: d.ville || '—', quartier: d.quartier || '—', codePostal: d.boite || '—' },
    family: { situation: d.situation || '—', enfants: d.enfants || '—', conjoint: d.conjoint || '—', nifConjoint: '—', nssConjoint: d.nssConjoint || '—', pere: d.pere || '—', mere: d.mere || '—' },
    identification: { typePiece: d.piece || '—', numeroPiece: d.numDoc || '—', nif: d.niu || '—', matricule: '#' + (d.numEmp || '') },
    emploi: { poste: d.poste || '—', typeContrat: d.contrat || 'CDI', dateDebut: d.dateEntree || '—', salaireNet: d.salaire ? `${d.salaire} XAF` : '—', categorie: d.categorie || '—', echelon: '-' },
    admin: { cnss: d.cnss ? 'Yes' : 'No', numeroCnss: d.cnss || '—', cnamgs: d.cnamgs ? 'Yes' : 'No', derniereVisite: d.medical || '—' },
    banque: { nomBanque: d.banque || '—', compte: d.compte || '—' },
    formation: { niveau: d.niveau || '—', specialite: d.specialite || '—', competences: [] },
  });
  state.employees.push(emp);
  state.activeNav = 'employees'; state.detailIdx = null;
  Dashboard();
  toast('Employee created successfully');
}

/* documents click (delegated) */
$app.addEventListener('click', (e) => {
  const d = e.target.closest('.doc-card[data-doc]');
  if (d) toast(`Template "${d.dataset.doc}" opened`);
});

/* ===== Add Company modal — "Ajouter une entreprise" (Figma 2634:744997) ===== */
const AC_STEPS = [
  ['Basic information', 'Personal information'],
  ['Organization details', 'Organization details'],
  ['Legal identification', 'Legal identification'],
  ['Compliance and reporting dates', 'Compliance and reporting dates'],
];
const AC_TYPES = ['SARL', 'SA', 'SAS', 'SNC', 'Sole proprietorship', 'GIE'];
const AC_SECTORS = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Industry', 'Services', 'Construction', 'Agriculture'];
const AC_CONVENTIONS = ['Retail', 'Industry', 'Construction', 'Services', 'None'];

function acBody(step, d) {
  const g = k => d[k] || '';
  if (step === 0) {
    return `
      <div class="ac-logo">
        <div class="ac-logo__ph">${svg.bldg}</div>
        <div class="ac-logo__txt"><b>Upload logo</b><small>Min 400x400px, JPEG or PNG</small></div>
        <button type="button" class="btn-outline btn-outline--sm" id="ac-upload">Upload</button>
      </div>
      ${cefField('nom', "Organization name <span class='ac-opt'>(optional)</span>", { ph: 'Enter the organization name', val: g('nom') })}
      ${cefField('type', 'Company type', { options: AC_TYPES, ph: 'Select', val: g('type') })}
      ${cefField('secteur', 'Industry', { options: AC_SECTORS, ph: 'Label', val: g('secteur') })}
      ${cefField('convention', 'Collective agreement', { options: AC_CONVENTIONS, ph: 'Label', val: g('convention') })}
      ${cefField('creation', 'Founding date', { ph: 'DD/MM/YYYY', val: g('creation') })}`;
  }
  if (step === 1) {
    return `
      ${cefField('email', 'Email', { ph: 'Enter the email', val: g('email') })}
      ${cefField('tel', 'Phone', { ph: 'Enter the phone number', val: g('tel') })}
      ${cefField('boite', 'P.O. box', { ph: 'P.O. box', val: g('boite') })}
      ${cefField('quartier', 'District', { ph: 'District name', val: g('quartier') })}
      ${cefField('ville', 'City', { options: ['Douala', 'Yaoundé', 'Libreville', 'Port-Gentil'], ph: 'Label', val: g('ville') })}
      ${cefField('province', 'Province', { ph: 'Province', val: g('province') })}
      ${cefField('pays', 'Country', { options: COUNTRIES, ph: 'Label', val: g('pays') })}`;
  }
  if (step === 2) {
    return `
      ${cefField('gerant', 'Manager name', { req: 1, ph: 'Enter the manager name', val: g('gerant') })}
      ${cefField('rccm', 'RCCM number', { req: 1, ph: 'Enter the RCCM number', val: g('rccm') })}
      ${cefField('nif', 'NIF number', { req: 1, ph: 'Enter the NIF number', val: g('nif') })}
      ${cefField('cnss', 'Employer CNSS', { req: 1, ph: 'Enter the employer CNSS', val: g('cnss') })}
      ${cefField('cnamgs', 'Employer CNAMGS', { req: 1, ph: 'Enter the employer CNAMGS', val: g('cnamgs') })}`;
  }
  return `
    ${cefField('das', 'DAS filing date', { ph: 'DD/MM/YYYY', val: g('das') || '19/02/2026' })}
    ${cefField('depotCnss', 'CNSS filing date', { ph: 'DD/MM/YYYY', val: g('depotCnss') || '19/02/2026' })}
    ${cefField('depotCnamgs', 'CNAMGS filing date', { ph: 'DD/MM/YYYY', val: g('depotCnamgs') || '19/02/2026' })}`;
}

function acNav(step) {
  return `<div class="ac-nav">${AC_STEPS.map(([title], i) => {
    const state_ = i < step ? 'done' : i === step ? 'active' : '';
    return `<button type="button" class="ac-step ${state_}" data-step="${i}">
      <span class="ac-step-num">${i < step ? svg.check : (i + 1)}</span>
      <div class="ac-step-txt"><small>Step ${i + 1}</small><b>${title}</b></div>
    </button>`;
  }).join('')}</div>`;
}

function AddCompanyForm() {
  const data = {};
  let step = 0;
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal ac"></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  const modal = ov.querySelector('.ac');
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  const collect = () => modal.querySelectorAll('[data-k]').forEach(i => { data[i.dataset.k] = i.value; });
  const goto = n => { collect(); step = n; render(); };

  function render() {
    const last = step === AC_STEPS.length - 1;
    modal.innerHTML = `
      <div class="ac-head"><h2>Add a company</h2><button class="modal-close ac-x" id="ac-close">${svgX(18)}</button></div>
      <div class="ac-content">
        ${acNav(step)}
        <div class="ac-form">
          <div class="ac-section">${AC_STEPS[step][1]}</div>
          <div class="ac-fields">${acBody(step, data)}</div>
        </div>
      </div>
      <div class="ac-foot"><button class="btn btn--primary ac-btn" id="ac-next">${last ? 'Save' : 'Continue'}</button></div>`;
    modal.querySelector('#ac-close').onclick = close;
    const up = modal.querySelector('#ac-upload'); if (up) up.onclick = () => toast('Select a logo (max 400×400)');
    modal.querySelectorAll('[data-step]').forEach(b => b.onclick = () => goto(+b.dataset.step));
    modal.querySelector('#ac-next').onclick = () => {
      if (last) { collect(); close(); toast('Company added successfully'); }
      else goto(step + 1);
    };
    modal.querySelector('.ac-form').scrollTop = 0;
  }
  render();
}

/* ===== Paramètres d'organisation — org settings modal (Figma 2634:738442) ===== */
const OS_TABS = [
  ['bldg', 'Basic information'],
  ['card2', 'Organization details'],
  ['bank', 'Legal identification'],
  ['file2', 'Compliance & reporting date'],
];

function osBody(tab, d) {
  const g = k => d[k] || '';
  if (tab === 0) return `
    <div class="ac-section">Personal information</div>
    <div class="os-logo">
      <img class="os-logo__img" src="logo.svg" alt="logo" />
      <div class="os-logo__txt"><b>logo</b><small>1MB, PNG</small></div>
      <button type="button" class="os-logo__del" id="os-logodel" title="Delete">${svg.trash}</button>
      <button type="button" class="btn-outline btn-outline--sm" id="os-logochg">Change photo</button>
    </div>
    ${cefField('nom', "Organization name <span class='ac-opt'>(optional)</span>", { val: g('nom') || state.org.name || 'KassiRh Company' })}
    ${cefField('type', 'Company type', { options: AC_TYPES, ph: 'Label', val: g('type') })}
    ${cefField('secteur', 'Industry', { options: AC_SECTORS, ph: 'Label', val: g('secteur') })}
    ${cefField('convention', 'Collective agreement', { options: AC_CONVENTIONS, ph: 'Label', val: g('convention') })}
    ${cefField('creation', 'Founding date', { ph: 'DD-MM-YYYY', val: g('creation') })}`;
  if (tab === 1) return `
    <div class="ac-section">Organization details</div>
    ${cefField('email', 'Email', { val: g('email') || 'KassiRH@contact.com' })}
    ${cefField('tel', 'Phone', { phone: 1, val: g('tel') || '+221 789 567 56' })}
    ${cefField('boite', 'P.O. box', { val: g('boite') || '000221' })}
    ${cefField('quartier', 'District', { val: g('quartier') || 'Maka' })}
    ${cefField('ville', 'City', { ph: 'Enter your city', val: g('ville') })}
    ${cefField('province', 'Province', { ph: 'Enter your province', val: g('province') })}
    ${cefField('pays', 'Country', { options: COUNTRIES, ph: 'Select your country', val: g('pays') })}`;
  if (tab === 2) return `
    <div class="ac-section">Legal identification</div>
    ${cefField('gerant', 'Manager name', { req: 1, ph: 'Enter the manager name', val: g('gerant') })}
    ${cefField('rccm', 'RCCM number', { req: 1, ph: 'Enter the RCCM number', val: g('rccm') })}
    ${cefField('nif', 'NIF number', { req: 1, ph: 'Enter the NIF number', val: g('nif') })}
    ${cefField('cnss', 'Employer CNSS', { req: 1, ph: 'Enter the employer CNSS', val: g('cnss') })}
    ${cefField('cnamgs', 'Employer CNAMGS', { req: 1, ph: 'Enter the employer CNAMGS', val: g('cnamgs') })}`;
  return `
    <div class="ac-section">Compliance and reporting dates</div>
    ${cefField('das', 'DAS filing date', { ph: 'DD/MM/YYYY', val: g('das') || '19/02/2026' })}
    ${cefField('depotCnss', 'CNSS filing date', { ph: 'DD/MM/YYYY', val: g('depotCnss') || '19/02/2026' })}
    ${cefField('depotCnamgs', 'CNAMGS filing date', { ph: 'DD/MM/YYYY', val: g('depotCnamgs') || '19/02/2026' })}`;
}

function OrgSettingsForm() {
  const data = {};
  let tab = 0;
  const ov = document.createElement('div');
  ov.className = 'modal-overlay';
  ov.innerHTML = `<div class="modal ac os"></div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('in'));
  const modal = ov.querySelector('.os');
  const close = () => ov.remove();
  ov.addEventListener('click', e => { if (e.target === ov) close(); });
  const collect = () => modal.querySelectorAll('[data-k]').forEach(i => { data[i.dataset.k] = i.value; });

  function render() {
    modal.innerHTML = `
      <div class="ac-head"><h2>Organization settings</h2><button class="modal-close ac-x" id="os-close">${svgX(18)}</button></div>
      <div class="ac-content">
        <div class="os-menu">
          ${OS_TABS.map(([ico, label], i) => `<button type="button" class="os-menu-item ${i === tab ? 'active' : ''}" data-tab="${i}">${svg[ico]}<span>${label}</span></button>`).join('')}
        </div>
        <div class="ac-form"><div class="ac-fields">${osBody(tab, data)}</div></div>
      </div>
      <div class="ac-foot"><button class="btn btn--primary os-btn" id="os-save">Save changes</button></div>`;
    modal.querySelector('#os-close').onclick = close;
    modal.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { collect(); tab = +b.dataset.tab; render(); });
    const del = modal.querySelector('#os-logodel'); if (del) del.onclick = () => toast('Logo deleted');
    const chg = modal.querySelector('#os-logochg'); if (chg) chg.onclick = () => toast('Select an image (max 1 MB)');
    modal.querySelector('#os-save').onclick = () => {
      collect();
      if (data.nom) state.org.name = data.nom;
      close();
      if (state.activeNav === 'settings') Dashboard();
      toast('Changes saved');
    };
    modal.querySelector('.ac-form').scrollTop = 0;
  }
  render();
}

/* ------------------------------ boot ------------------------------ */
Landing();
