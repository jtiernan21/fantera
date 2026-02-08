export type ClubColorConfig = {
  primary: string;
  secondary: string;
  gradientStart: string;
  gradientEnd: string;
  glowColor: string;
  crestUrl: string;
};

export const CLUB_CONFIGS: Record<string, ClubColorConfig> = {
  'JUVE.MI': {
    primary: '#000000',
    secondary: '#FFFFFF',
    gradientStart: '#1a1a1a',
    gradientEnd: '#000000',
    glowColor: 'rgba(255, 255, 255, 0.3)',
    crestUrl: '/crests/juve.png',
  },
  'BVB.DE': {
    primary: '#FDE100',
    secondary: '#000000',
    gradientStart: '#FDE100',
    gradientEnd: '#B8A000',
    glowColor: 'rgba(253, 225, 0, 0.3)',
    crestUrl: '/crests/bvb.png',
  },
  'AJAX.AS': {
    primary: '#D2122E',
    secondary: '#FFFFFF',
    gradientStart: '#D2122E',
    gradientEnd: '#8B0000',
    glowColor: 'rgba(210, 18, 46, 0.3)',
    crestUrl: '/crests/ajax.png',
  },
  'SLB.LS': {
    primary: '#FF0000',
    secondary: '#FFFFFF',
    gradientStart: '#FF0000',
    gradientEnd: '#B30000',
    glowColor: 'rgba(255, 0, 0, 0.3)',
    crestUrl: '/crests/benfica.png',
  },
  'FCP.LS': {
    primary: '#003893',
    secondary: '#FFFFFF',
    gradientStart: '#003893',
    gradientEnd: '#001F4D',
    glowColor: 'rgba(0, 56, 147, 0.3)',
    crestUrl: '/crests/porto.png',
  },
  'SCP.LS': {
    primary: '#006B3F',
    secondary: '#FFFFFF',
    gradientStart: '#006B3F',
    gradientEnd: '#004D2C',
    glowColor: 'rgba(0, 107, 63, 0.3)',
    crestUrl: '/crests/sporting.png',
  },
  'SCB.LS': {
    primary: '#C8102E',
    secondary: '#FFFFFF',
    gradientStart: '#C8102E',
    gradientEnd: '#8B0A1E',
    glowColor: 'rgba(200, 16, 46, 0.3)',
    crestUrl: '/crests/braga.png',
  },
  'SSL.MI': {
    primary: '#87CEEB',
    secondary: '#FFFFFF',
    gradientStart: '#87CEEB',
    gradientEnd: '#4682B4',
    glowColor: 'rgba(135, 206, 235, 0.3)',
    crestUrl: '/crests/lazio.png',
  },
  'ASR.MI': {
    primary: '#8E1F2F',
    secondary: '#F0BC42',
    gradientStart: '#8E1F2F',
    gradientEnd: '#5A1320',
    glowColor: 'rgba(142, 31, 47, 0.3)',
    crestUrl: '/crests/roma.png',
  },
  'OLG.PA': {
    primary: '#0033A0',
    secondary: '#FFFFFF',
    gradientStart: '#0033A0',
    gradientEnd: '#001F66',
    glowColor: 'rgba(0, 51, 160, 0.3)',
    crestUrl: '/crests/lyon.png',
  },
  'CCP.L': {
    primary: '#008000',
    secondary: '#FFFFFF',
    gradientStart: '#008000',
    gradientEnd: '#004D00',
    glowColor: 'rgba(0, 128, 0, 0.3)',
    crestUrl: '/crests/celtic.png',
  },
  'PARKEN.CO': {
    primary: '#006AB5',
    secondary: '#FFFFFF',
    gradientStart: '#006AB5',
    gradientEnd: '#003D66',
    glowColor: 'rgba(0, 106, 181, 0.3)',
    crestUrl: '/crests/copenhagen.png',
  },
  'GSRAY.IS': {
    primary: '#FF6600',
    secondary: '#8B0000',
    gradientStart: '#FF6600',
    gradientEnd: '#CC5200',
    glowColor: 'rgba(255, 102, 0, 0.3)',
    crestUrl: '/crests/galatasaray.png',
  },
  MANU: {
    primary: '#DA291C',
    secondary: '#FBE122',
    gradientStart: '#DA291C',
    gradientEnd: '#8B1A12',
    glowColor: 'rgba(218, 41, 28, 0.3)',
    crestUrl: '/crests/manu.png',
  },
  'TICA.MX': {
    primary: '#FFDD00',
    secondary: '#002366',
    gradientStart: '#FFDD00',
    gradientEnd: '#CCB100',
    glowColor: 'rgba(255, 221, 0, 0.3)',
    crestUrl: '/crests/america.png',
  },
};

export function getClubConfig(ticker: string): ClubColorConfig | undefined {
  return CLUB_CONFIGS[ticker];
}

const EXCHANGE_CURRENCY: Record<string, string> = {
  'Borsa Italiana': '€',
  'Frankfurt SE': '€',
  'Euronext Amsterdam': '€',
  'Euronext Lisbon': '€',
  'Euronext Paris': '€',
  'London SE': '£',
  'Copenhagen SE': 'kr ',
  'Borsa Istanbul': '₺',
  'NYSE': '$',
  'BMV Mexico': 'MX$',
};

export function getCurrencySymbol(exchange: string): string {
  return EXCHANGE_CURRENCY[exchange] ?? '$';
}
