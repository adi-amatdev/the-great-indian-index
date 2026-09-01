// Curated "custom indexes" for the Indian market.
// Each index clubs together the NSE-listed stocks of a theme/group and is
// tracked as a single equal-weighted line, rebased to 100 at the start of the
// selected range (the same idea the S&P 500 uses, scaled down to a theme).

export type Constituent = {
  /** Yahoo Finance symbol, e.g. "ADANIENT.NS" */
  symbol: string;
  /** Display name shown in the UI */
  name: string;
};

export type IndexDef = {
  slug: string;
  name: string;
  emoji: string;
  tagline: string;
  blurb: string;
  /** Tailwind gradient stops used for the card + hero */
  gradient: string;
  /** Accent color (hex) used for the chart line/glow */
  accent: string;
  constituents: Constituent[];
};

export const INDICES: IndexDef[] = [
  {
    slug: "adani",
    name: "Adani Index",
    emoji: "🏗️",
    tagline: "Ports, power & the infra empire",
    blurb:
      "The Adani conglomerate — from ports and airports to green energy, power transmission and cement. A single line for one of India's most-watched industrial groups.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    accent: "#10b981",
    constituents: [
      { symbol: "ADANIENT.NS", name: "Adani Enterprises" },
      { symbol: "ADANIPORTS.NS", name: "Adani Ports & SEZ" },
      { symbol: "ADANIPOWER.NS", name: "Adani Power" },
      { symbol: "ADANIGREEN.NS", name: "Adani Green Energy" },
      { symbol: "ADANIENSOL.NS", name: "Adani Energy Solutions" },
      { symbol: "AWL.NS", name: "AWL Agri Business" },
      { symbol: "ACC.NS", name: "ACC (Cement)" },
      { symbol: "AMBUJACEM.NS", name: "Ambuja Cements" },
    ],
  },
  {
    slug: "tata",
    name: "Tata Index",
    emoji: "🧿",
    tagline: "The salt-to-software house",
    blurb:
      "India's most trusted conglomerate — software, cars, steel, power, consumer goods, jewellery and hotels. The Tata group in one tracker.",
    gradient: "from-indigo-500 via-blue-500 to-sky-600",
    accent: "#3b82f6",
    constituents: [
      { symbol: "TCS.NS", name: "Tata Consultancy Services" },
      { symbol: "TMPV.NS", name: "Tata Motors (Passenger)" },
      { symbol: "TMCV.NS", name: "Tata Motors (Commercial)" },
      { symbol: "TATASTEEL.NS", name: "Tata Steel" },
      { symbol: "TATAPOWER.NS", name: "Tata Power" },
      { symbol: "TATACONSUM.NS", name: "Tata Consumer Products" },
      { symbol: "TITAN.NS", name: "Titan Company" },
      { symbol: "TRENT.NS", name: "Trent (Westside/Zudio)" },
      { symbol: "INDHOTEL.NS", name: "Indian Hotels (Taj)" },
      { symbol: "VOLTAS.NS", name: "Voltas" },
      { symbol: "TATACHEM.NS", name: "Tata Chemicals" },
      { symbol: "TATAELXSI.NS", name: "Tata Elxsi" },
    ],
  },
  {
    slug: "ev",
    name: "EV & Mobility Index",
    emoji: "⚡",
    tagline: "India's electric-vehicle supply chain",
    blurb:
      "The companies electrifying Indian roads — carmakers, e-bus builders, battery makers and the components powering the EV transition.",
    gradient: "from-lime-400 via-green-500 to-emerald-600",
    accent: "#22c55e",
    constituents: [
      { symbol: "TMPV.NS", name: "Tata Motors (Passenger/EV)" },
      { symbol: "M&M.NS", name: "Mahindra & Mahindra" },
      { symbol: "OLECTRA.NS", name: "Olectra Greentech" },
      { symbol: "EXIDEIND.NS", name: "Exide Industries" },
      { symbol: "ARE&M.NS", name: "Amara Raja Energy" },
      { symbol: "BHARATFORG.NS", name: "Bharat Forge" },
      { symbol: "TIINDIA.NS", name: "Tube Investments" },
      { symbol: "SONACOMS.NS", name: "Sona BLW Precision" },
      { symbol: "UNOMINDA.NS", name: "Uno Minda" },
    ],
  },
  {
    slug: "agri",
    name: "Agri Index",
    emoji: "🌾",
    tagline: "Feeding the world's most populous nation",
    blurb:
      "Fertilisers, crop protection, seeds and agro-chemicals — the businesses behind India's farms and one of its biggest employment engines.",
    gradient: "from-amber-400 via-yellow-500 to-lime-600",
    accent: "#eab308",
    constituents: [
      { symbol: "UPL.NS", name: "UPL" },
      { symbol: "PIIND.NS", name: "PI Industries" },
      { symbol: "COROMANDEL.NS", name: "Coromandel International" },
      { symbol: "CHAMBLFERT.NS", name: "Chambal Fertilisers" },
      { symbol: "KSCL.NS", name: "Kaveri Seed" },
      { symbol: "RALLIS.NS", name: "Rallis India" },
      { symbol: "DHANUKA.NS", name: "Dhanuka Agritech" },
      { symbol: "GNFC.NS", name: "Gujarat Narmada Valley" },
      { symbol: "EIDPARRY.NS", name: "EID Parry" },
    ],
  },
  {
    slug: "copper",
    name: "Copper & Metals Index",
    emoji: "⛏️",
    tagline: "The metals that build everything",
    blurb:
      "Copper, aluminium, zinc and steel — the base-metal producers whose fortunes swing with global commodity cycles and India's build-out.",
    gradient: "from-orange-500 via-amber-600 to-yellow-700",
    accent: "#f97316",
    constituents: [
      { symbol: "HINDCOPPER.NS", name: "Hindustan Copper" },
      { symbol: "VEDL.NS", name: "Vedanta" },
      { symbol: "HINDALCO.NS", name: "Hindalco Industries" },
      { symbol: "NATIONALUM.NS", name: "National Aluminium" },
      { symbol: "HINDZINC.NS", name: "Hindustan Zinc" },
      { symbol: "JSWSTEEL.NS", name: "JSW Steel" },
      { symbol: "TATASTEEL.NS", name: "Tata Steel" },
      { symbol: "SAIL.NS", name: "Steel Authority (SAIL)" },
    ],
  },
  {
    slug: "ethanol",
    name: "Ethanol & Sugar Index",
    emoji: "🛢️",
    tagline: "Blending fuel from the fields",
    blurb:
      "Sugar mills and distilleries riding India's ethanol-blending push — a bet on cleaner fuel, cane economics and government blending targets.",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
    accent: "#ec4899",
    constituents: [
      { symbol: "BALRAMCHIN.NS", name: "Balrampur Chini Mills" },
      { symbol: "TRIVENI.NS", name: "Triveni Engineering" },
      { symbol: "DALMIASUG.NS", name: "Dalmia Bharat Sugar" },
      { symbol: "DWARKESH.NS", name: "Dwarikesh Sugar" },
      { symbol: "BAJAJHIND.NS", name: "Bajaj Hindusthan Sugar" },
      { symbol: "EIDPARRY.NS", name: "EID Parry" },
      { symbol: "RENUKA.NS", name: "Shree Renuka Sugars" },
      { symbol: "DCMSHRIRAM.NS", name: "DCM Shriram" },
    ],
  },
  {
    slug: "defence",
    name: "Defence Index",
    emoji: "🛡️",
    tagline: "Atmanirbhar in arms",
    blurb:
      "India's defence manufacturing story — shipyards, aircraft, missiles, electronics and explosives, powered by indigenisation and a rising order book.",
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    accent: "#64748b",
    constituents: [
      { symbol: "HAL.NS", name: "Hindustan Aeronautics" },
      { symbol: "BEL.NS", name: "Bharat Electronics" },
      { symbol: "BDL.NS", name: "Bharat Dynamics" },
      { symbol: "MAZDOCK.NS", name: "Mazagon Dock Shipbuilders" },
      { symbol: "COCHINSHIP.NS", name: "Cochin Shipyard" },
      { symbol: "DATAPATTNS.NS", name: "Data Patterns" },
      { symbol: "SOLARINDS.NS", name: "Solar Industries" },
      { symbol: "BEML.NS", name: "BEML" },
    ],
  },
  {
    slug: "railways",
    name: "Railways Index",
    emoji: "🚆",
    tagline: "The backbone on rails",
    blurb:
      "Coaches, wagons, financing, ticketing and construction — the listed players riding India's massive railway modernisation and capex cycle.",
    gradient: "from-cyan-500 via-sky-600 to-blue-700",
    accent: "#0ea5e9",
    constituents: [
      { symbol: "IRCTC.NS", name: "IRCTC" },
      { symbol: "IRFC.NS", name: "Indian Railway Finance" },
      { symbol: "RVNL.NS", name: "Rail Vikas Nigam" },
      { symbol: "IRCON.NS", name: "Ircon International" },
      { symbol: "RAILTEL.NS", name: "RailTel" },
      { symbol: "TITAGARH.NS", name: "Titagarh Rail Systems" },
      { symbol: "CONCOR.NS", name: "Container Corporation" },
      { symbol: "JWL.NS", name: "Jupiter Wagons" },
    ],
  },
  {
    slug: "it",
    name: "IT Services Index",
    emoji: "💻",
    tagline: "The world's back office",
    blurb:
      "India's software export machine — the large-caps and mid-caps that write code, run systems and consult for clients across the globe.",
    gradient: "from-violet-500 via-purple-600 to-indigo-700",
    accent: "#8b5cf6",
    constituents: [
      { symbol: "TCS.NS", name: "Tata Consultancy Services" },
      { symbol: "INFY.NS", name: "Infosys" },
      { symbol: "HCLTECH.NS", name: "HCLTech" },
      { symbol: "WIPRO.NS", name: "Wipro" },
      { symbol: "TECHM.NS", name: "Tech Mahindra" },
      { symbol: "LTTS.NS", name: "L&T Technology Services" },
      { symbol: "PERSISTENT.NS", name: "Persistent Systems" },
      { symbol: "COFORGE.NS", name: "Coforge" },
      { symbol: "MPHASIS.NS", name: "Mphasis" },
    ],
  },
  {
    slug: "pharma",
    name: "Pharma Index",
    emoji: "💊",
    tagline: "Pharmacy to the world",
    blurb:
      "India's drug makers — generics giants and specialty players supplying medicines across the US, Europe and emerging markets.",
    gradient: "from-teal-400 via-emerald-500 to-green-600",
    accent: "#14b8a6",
    constituents: [
      { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical" },
      { symbol: "DRREDDY.NS", name: "Dr. Reddy's Labs" },
      { symbol: "CIPLA.NS", name: "Cipla" },
      { symbol: "DIVISLAB.NS", name: "Divi's Laboratories" },
      { symbol: "LUPIN.NS", name: "Lupin" },
      { symbol: "AUROPHARMA.NS", name: "Aurobindo Pharma" },
      { symbol: "ALKEM.NS", name: "Alkem Laboratories" },
      { symbol: "TORNTPHARM.NS", name: "Torrent Pharmaceuticals" },
    ],
  },
  {
    slug: "banks",
    name: "Banks Index",
    emoji: "🏦",
    tagline: "Where the money moves",
    blurb:
      "India's biggest private and public-sector lenders — the engines of credit growth for the fastest-growing major economy.",
    gradient: "from-red-500 via-rose-600 to-pink-700",
    accent: "#ef4444",
    constituents: [
      { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
      { symbol: "ICICIBANK.NS", name: "ICICI Bank" },
      { symbol: "SBIN.NS", name: "State Bank of India" },
      { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank" },
      { symbol: "AXISBANK.NS", name: "Axis Bank" },
      { symbol: "INDUSINDBK.NS", name: "IndusInd Bank" },
      { symbol: "BANKBARODA.NS", name: "Bank of Baroda" },
      { symbol: "PNB.NS", name: "Punjab National Bank" },
    ],
  },
];

export function getIndex(slug: string): IndexDef | undefined {
  return INDICES.find((i) => i.slug === slug);
}
