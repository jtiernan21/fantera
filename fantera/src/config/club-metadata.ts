export type ClubMetadata = {
  country: string;
  league: string;
  marketContext: string;
};

const CLUB_METADATA: Record<string, ClubMetadata> = {
  'JUVE.MI': {
    country: 'Italy',
    league: 'Serie A',
    marketContext: "Italy's most successful club with 36 league titles. Listed on the Borsa Italiana, Juventus is one of only a handful of publicly traded football clubs in the world.",
  },
  'BVB.DE': {
    country: 'Germany',
    league: 'Bundesliga',
    marketContext: "Germany's second-largest club by revenue, famous for the 'Yellow Wall' at Signal Iduna Park. Listed on the Frankfurt Stock Exchange since 2000.",
  },
  'AJAX.AS': {
    country: 'Netherlands',
    league: 'Eredivisie',
    marketContext: "Amsterdam's legendary club, known for its youth academy and Total Football philosophy. Listed on Euronext Amsterdam.",
  },
  'SLB.LS': {
    country: 'Portugal',
    league: 'Primeira Liga',
    marketContext: "Portugal's most decorated club with 38 league titles and two European Cups. Listed on the Euronext Lisbon exchange.",
  },
  'FCP.LS': {
    country: 'Portugal',
    league: 'Primeira Liga',
    marketContext: "Two-time Champions League winners and Portugal's dominant European competitor. Listed on Euronext Lisbon.",
  },
  'SCP.LS': {
    country: 'Portugal',
    league: 'Primeira Liga',
    marketContext: "One of Portugal's 'Big Three', famous for developing world-class talent including Cristiano Ronaldo. Listed on Euronext Lisbon.",
  },
  'SCB.LS': {
    country: 'Portugal',
    league: 'Primeira Liga',
    marketContext: "The 'Warriors of Minho' — a rising force in Portuguese football with European ambitions. Listed on Euronext Lisbon.",
  },
  'SSL.MI': {
    country: 'Italy',
    league: 'Serie A',
    marketContext: "Rome-based club with a passionate fanbase and a legacy in Italian football. Listed on the Borsa Italiana.",
  },
  'ASR.MI': {
    country: 'Italy',
    league: 'Serie A',
    marketContext: "The 'Giallorossi' — Roma is one of Italy's most followed clubs with a storied European history. Listed on the Borsa Italiana.",
  },
  'OLG.PA': {
    country: 'France',
    league: 'Ligue 1',
    marketContext: "France's most successful club in European competition with seven league titles. Listed on Euronext Paris.",
  },
  'CCP.L': {
    country: 'Scotland',
    league: 'Scottish Premiership',
    marketContext: "Glasgow's green and white, one of the most iconic clubs in world football. Listed on the London Stock Exchange.",
  },
  'PARKEN.CO': {
    country: 'Denmark',
    league: 'Superliga',
    marketContext: "Denmark's dominant club and regular Champions League participant. Listed on the Copenhagen Stock Exchange.",
  },
  'GSRAY.IS': {
    country: 'Turkey',
    league: 'Super Lig',
    marketContext: "Turkey's most successful club with a record 24 league titles and passionate global fanbase. Listed on Borsa Istanbul.",
  },
  MANU: {
    country: 'England',
    league: 'Premier League',
    marketContext: "One of the most valuable and widely followed football clubs in the world. Listed on the New York Stock Exchange since 2012.",
  },
  'TICA.MX': {
    country: 'Mexico',
    league: 'Liga MX',
    marketContext: "Mexico's most successful club with 14 league titles, nicknamed 'Las Águilas'. Part of the Televisa group, listed on BMV Mexico.",
  },
};

const DEFAULT_METADATA: ClubMetadata = {
  country: 'Unknown',
  league: 'Unknown',
  marketContext: 'A publicly traded football club available for fractional ownership on Fantera.',
};

export function getClubMetadata(ticker: string): ClubMetadata {
  return CLUB_METADATA[ticker] ?? DEFAULT_METADATA;
}
