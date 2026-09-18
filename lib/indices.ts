// Curated "custom indexes" for the Indian market.
// Each index clubs together the NSE-listed stocks of a theme/group and is
// tracked as a single equal-weighted line, rebased to 100 at the start of the
// selected range (the same idea the S&P 500 uses, scaled down to a theme).

export type Constituent = {
  /** Yahoo Finance symbol, e.g. "ADANIENT.NS" */
  symbol: string;
  /** Display name shown in the UI */
  name: string;
  /** Optional custom portfolio weight. Built-in indexes default to equal weight. */
  weight?: number;
};

/** A cited news/press source backing an index's thesis. */
export type IndexSource = {
  /** Short display title of the article/report. */
  title: string;
  /** Outlet or publisher. */
  outlet: string;
  /** Publication date, e.g. "Sep 9, 2026". */
  date: string;
  /** Link to the source. */
  url: string;
};

export type IndexDef = {
  slug: string;
  name: string;
  tagline: string;
  blurb: string;
  /** Tailwind gradient stops used for the card + hero */
  gradient: string;
  /** Accent color (hex) used for the chart line/glow */
  accent: string;
  /** Why this index exists — a short, sourced summary of the theme. */
  thesis: string;
  /** News/press sources behind the thesis. */
  sources: IndexSource[];
  constituents: Constituent[];
  /** A user-created index uses this flag to select its explicit weights. */
  custom?: boolean;
};

export const INDICES: IndexDef[] = [
  {
    slug: "kalyani",
    name: "Kalyani Group Index",
    tagline: "Engineering India's industrial edge",
    blurb:
      "The Kalyani Group's listed engineering, automotive and industrial businesses, spanning forging, steel, infrastructure and advanced manufacturing.",
    gradient: "from-fuchsia-500 via-purple-600 to-indigo-700",
    accent: "#a855f7",
    thesis:
      "The Kalyani Group has transformed from an auto-forging supplier into a defence and advanced-manufacturing powerhouse. Bharat Forge's defence order pipeline hit ₹10,961 crore in FY26 — headlined by a 255,000-unit CQB carbine contract, the ATAGS artillery gun and a new naval-systems order — while the group's forging core keeps riding India's indigenisation and exports push.",
    sources: [
      {
        title: "From the CMD's Desk — Annual Report 2025-26",
        outlet: "Bharat Forge",
        date: "Jul 2026",
        url: "https://www.bharatforge.com/AR2026/from-the-cmds-desk.html",
      },
      {
        title:
          "Bharat Forge writes down Tork Motors EV bet, sees 25% growth in FY27 on defence orders",
        outlet: "The Hindu BusinessLine",
        date: "May 7, 2026",
        url: "https://www.thehindubusinessline.com/companies/bharat-forge-writes-down-tork-motors-ev-bet-sees-25-growth-in-fy27-on-defence-orders/article70950771.ece",
      },
    ],
    constituents: [
      { symbol: "BHARATFORG.NS", name: "Bharat Forge" },
      { symbol: "KSL.NS", name: "Kalyani Steels" },
      { symbol: "BFUTILITIE.NS", name: "BF Utilities" },
      { symbol: "BFINVEST.NS", name: "BF Investment" },
      { symbol: "KICL.NS", name: "Kalyani Investment Company" },
      { symbol: "HIKAL.NS", name: "Hikal" },
      { symbol: "AUTOAXLES.NS", name: "Automotive Axles" },
      { symbol: "KALYANIFRG.NS", name: "Kalyani Forge" },
    ],
  },
  {
    slug: "kirloskar",
    name: "Kirloskar Group Index",
    tagline: "Pumps, engines and industrial power",
    blurb:
      "The Kirloskar group's listed industrial companies, building pumps, engines, compressors, process equipment and other critical infrastructure.",
    gradient: "from-sky-500 via-cyan-600 to-teal-700",
    accent: "#06b6d4",
    thesis:
      "The Kirloskar group is the quiet backbone of India's water, power and industrial infrastructure — pumps, engines, compressors and process equipment. Kirloskar Brothers ended FY26 with domestic order book up 30% y-o-y to ₹2,468 crore and is targeting double-digit growth in FY27 across water, defence, oil & gas and nuclear segments, aided by its international pump businesses.",
    sources: [
      {
        title: "Kirloskar Brothers FY26 Analyst Meet Presentation",
        outlet: "Kirloskar Brothers Ltd",
        date: "May 14, 2026",
        url: "https://www.kirloskarpumps.com/wp-content/uploads/2026/05/20260514_AnalystMeet_Presentation.pdf",
      },
      {
        title:
          "Kirloskar Brothers Q4 2026 Earnings Call Highlights: Strong International Growth",
        outlet: "Yahoo Finance / GuruFocus",
        date: "May 19, 2026",
        url: "https://finance.yahoo.com/markets/stocks/articles/kirloskar-brothers-ltd-bom-500241-010236247.html",
      },
    ],
    constituents: [
      { symbol: "KIRLOSBROS.NS", name: "Kirloskar Brothers" },
      { symbol: "KIRLOSENG.NS", name: "Kirloskar Oil Engines" },
      { symbol: "KIRLOSIND.NS", name: "Kirloskar Industries" },
      { symbol: "KIRLPNU.NS", name: "Kirloskar Pneumatic" },
      { symbol: "KIRLFER.NS", name: "Kirloskar Ferrous Industries" },
      { symbol: "KSB.NS", name: "KSB" },
    ],
  },
  {
    slug: "psu",
    name: "PSU Index",
    tagline: "The state-owned backbone",
    blurb:
      "A basket of major listed public-sector enterprises across banking, energy, defence, railways, mining and infrastructure.",
    gradient: "from-amber-500 via-orange-600 to-red-700",
    accent: "#f97316",
    thesis:
      "State-owned enterprises are the primary channel for India's record public capital expenditure. Central PSUs spent ~99% of their ₹7.47 lakh crore FY26 capex target, and the Union Budget 2026-27 lifted public capex to ₹12.2 lakh crore — a fourth consecutive year of target-beating state investment that flows straight through PSU order books.",
    sources: [
      {
        title: "Central PSUs Capex FY26: 99% Target Hit | ₹12.2 Lakh Cr Boost in FY27",
        outlet: "PSU Connect",
        date: "Jun 19, 2026",
        url: "https://www.psuconnect.in/psu-news/central-psus-capex-fy26-99-target-hit",
      },
      {
        title: "Union Budget FY 2026-27: Strengthening Capital Goods",
        outlet: "Press Information Bureau",
        date: "Feb 3, 2026",
        url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2222521",
      },
    ],
    constituents: [
      { symbol: "SBIN.NS", name: "State Bank of India" },
      { symbol: "ONGC.NS", name: "Oil & Natural Gas Corporation" },
      { symbol: "NTPC.NS", name: "NTPC" },
      { symbol: "COALINDIA.NS", name: "Coal India" },
      { symbol: "BEL.NS", name: "Bharat Electronics" },
      { symbol: "HAL.NS", name: "Hindustan Aeronautics" },
      { symbol: "POWERGRID.NS", name: "Power Grid Corporation" },
      { symbol: "IRFC.NS", name: "Indian Railway Finance" },
      { symbol: "GAIL.NS", name: "GAIL (India)" },
      { symbol: "BHEL.NS", name: "Bharat Heavy Electricals" },
      { symbol: "IOC.NS", name: "Indian Oil Corporation" },
      { symbol: "BPCL.NS", name: "Bharat Petroleum" },
      { symbol: "PFC.NS", name: "Power Finance Corporation" },
      { symbol: "RECLTD.NS", name: "REC" },
      { symbol: "BDL.NS", name: "Bharat Dynamics" },
      { symbol: "MAZDOCK.NS", name: "Mazagon Dock Shipbuilders" },
    ],
  },
  {
    slug: "adani",
    name: "Adani Index",
    tagline: "Ports, power & the infra empire",
    blurb:
      "The Adani conglomerate, from ports and airports to green energy, power transmission and cement. A single line for one of India's most-watched industrial groups.",
    gradient: "from-emerald-500 via-teal-500 to-cyan-600",
    accent: "#10b981",
    thesis:
      "The Adani group is India's largest infrastructure builder — ports, airports, power, green energy and cement. In September 2026 it raised $1 billion by selling a 5.54% stake in its airport unit to Temasek, BlackRock, Premji Invest and Alpha Wave at an $18 billion pre-money valuation, financing airport expansion and the Adani Airport City ecosystem.",
    sources: [
      {
        title: "Adani's airport unit to raise up to $1 billion from Temasek, BlackRock",
        outlet: "Reuters",
        date: "Sep 9, 2026",
        url: "https://www.reuters.com/world/india/adani-enterprises-sell-up-554-stake-airport-unit-temasek-blackrock-2026-09-09/",
      },
      {
        title: "Adani Enterprises shares jump as airport unit enters $1 billion fundraising deal",
        outlet: "CNBC",
        date: "Sep 9, 2026",
        url: "https://www.cnbc.com/2026/09/09/adani-enterprises-airport-fundraise-shares.html",
      },
    ],
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
    tagline: "The salt-to-software house",
    blurb:
      "India's most trusted conglomerate, software, cars, steel, power, consumer goods, jewellery and hotels. The Tata group in one tracker.",
    gradient: "from-indigo-500 via-blue-500 to-sky-600",
    accent: "#3b82f6",
    thesis:
      "Under N Chandrasekaran the Tata group's combined market value grew roughly 3.3-fold to ₹22.5–27 lakh crore, turning the 158-year-old conglomerate into a wealth-creation engine spanning software, autos, steel, power, consumer goods and hotels. The group now enters a leadership transition, making the house-wide line a bet on India's most storied conglomerate through uncertainty.",
    sources: [
      {
        title: "N Chandrasekaran era delivered 3.3X market cap growth",
        outlet: "The Economic Times",
        date: "Aug 12, 2026",
        url: "https://economictimes.indiatimes.com/markets/stocks/news/n-chandrasekaran-era-delivered-3-3x-market-cap-growth-can-tata-stocks-keep-winning-after-his-exit/articleshow/133176756.cms",
      },
      {
        title: "Tata Group's market cap rose nearly three times during Chandrasekaran's tenure",
        outlet: "Business Today",
        date: "Aug 13, 2026",
        url: "https://www.businesstoday.in/markets/stocks/story/tata-groups-market-cap-rose-nearly-three-times-during-chandrasekarans-tenure-548963-2026-08-13",
      },
    ],
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
    tagline: "India's electric-vehicle supply chain",
    blurb:
      "The companies electrifying Indian roads, carmakers, e-bus builders, battery makers and the components powering the EV transition.",
    gradient: "from-lime-400 via-green-500 to-emerald-600",
    accent: "#22c55e",
    thesis:
      "India crossed 10 million cumulative EV sales since 2017, and penetration hit 11% in 2026 — with 2.26 million EVs sold in the first eight months of CY2026, up 48% y-o-y. The transition has moved from subsidy-led two-wheeler adoption to a full-vehicle, full-supply-chain story spanning cars, e-buses, batteries and precision components.",
    sources: [
      {
        title:
          "10 Million EVs Sold in India Since 2017, Penetration at 11%",
        outlet: "Autocar Professional",
        date: "Sep 9, 2026",
        url: "https://www.autocarpro.in/analysis-sales/world-ev-day-special-10-million-evs-sold-in-india-since-2017-ev-penetration-at-11-percent-in-2026-134599",
      },
      {
        title:
          "India's electric mobility journey showcases scale, speed of transformation",
        outlet: "The Hindu BusinessLine",
        date: "Sep 9, 2026",
        url: "https://www.thehindubusinessline.com/news/indias-electric-mobility-journey-showcases-scale-speed-of-transformation-kumaraswamy/article71447850.ece",
      },
    ],
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
    tagline: "Feeding the world's most populous nation",
    blurb:
      "Fertilisers, crop protection, seeds and agro-chemicals, the businesses behind India's farms and one of its biggest employment engines.",
    gradient: "from-amber-400 via-yellow-500 to-lime-600",
    accent: "#eab308",
    thesis:
      "India's farm economy is entering a fresh capex cycle. ICRA expects fertiliser companies to commit ₹80,000–90,000 crore of new urea capacity under the New Investment Policy for Urea-2026 (NIPU-2026), improving urea self-sufficiency from 2030-31 — on top of perennial crop-protection and seed demand that tracks the monsoon and minimum support prices.",
    sources: [
      {
        title: "Fertiliser sector set for ₹80,000–90,000 cr capex revival under NIPU-2026: ICRA",
        outlet: "Fortune India",
        date: "Aug 19, 2026",
        url: "https://www.fortuneindia.com/economy/fertiliser-sector-set-for-80000-90000-crore-capex-revival-under-nipu-2026-icra/154683",
      },
    ],
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
    tagline: "The metals that build everything",
    blurb:
      "Copper, aluminium, zinc and steel, the base-metal producers whose fortunes swing with global commodity cycles and India's build-out.",
    gradient: "from-orange-500 via-amber-600 to-yellow-700",
    accent: "#f97316",
    thesis:
      "ICRA revised its outlook on India's non-ferrous metals industry to Positive in September 2026, expecting 8–9% domestic demand growth in FY27 (vs 1–2% globally) and a ~400 bps expansion in sector operating margins to ~35%, as aluminium, copper and zinc prices stay elevated on global supply constraints.",
    sources: [
      {
        title:
          "Robust pricing and healthy demand to drive performance of domestic non-ferrous metal companies; outlook revised to Positive",
        outlet: "ICRA",
        date: "Sep 15, 2026",
        url: "https://www.icra.in/Research/ViewResearchReport/robust-pricing-and-healthy-demand-to-drive-the-performance-of-domestic-non-ferrous-metal-companies-outlook-revised-to-positive/7107",
      },
    ],
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
    tagline: "Blending fuel from the fields",
    blurb:
      "Sugar mills and distilleries riding India's ethanol-blending push, a bet on cleaner fuel, cane economics and government blending targets.",
    gradient: "from-rose-400 via-pink-500 to-fuchsia-600",
    accent: "#ec4899",
    thesis:
      "India hit its 20% ethanol-blending (E20) target five years ahead of schedule in November 2025, then built ~1,990 crore litres of distillation capacity against ~1,050 crore litres of demand. The government is now pushing beyond E20 — enabling flexi-fuel vehicles and higher blending — even as mills wrestle a surplus-capacity glut. It's a policy-driven bet on energy security that hinges on oil marketing offtake.",
    sources: [
      {
        title: "Ethanol surplus looms over India's sugar mills as E20 milestone meets capacity glut",
        outlet: "The Hindu BusinessLine",
        date: "Jan 17, 2026",
        url: "https://www.thehindubusinessline.com/economy/agri-business/ethanol-surplus-looms-over-indias-ssugar-mills-as-e20-milestone-meets-capacity-glut/article70515864.ece",
      },
      {
        title: "Government working to allow ethanol blending beyond E20 via flexi-fuel vehicles",
        outlet: "The Hindu",
        date: "Sep 9, 2026",
        url: "https://www.thehindu.com/business/government-working-to-allow-ethanol-blending-beyond-e20-via-flexi-fuel-vehicles-tarun-kapoor/article71447856.ece",
      },
    ],
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
    tagline: "Atmanirbhar in arms",
    blurb:
      "India's defence manufacturing story, shipyards, aircraft, missiles, electronics and explosives, powered by indigenisation and a rising order book.",
    gradient: "from-slate-500 via-gray-600 to-zinc-700",
    accent: "#64748b",
    thesis:
      "India's defence budget jumped 15% to ₹7.85 lakh crore in FY27 — the highest allocation of any ministry — with ~75% of capital acquisitions reserved for domestic industry and ₹1.39 lakh crore earmarked for Indian firms. Production hit a record ₹1.78 lakh crore in FY26 (more than doubling in five years) and exports reached ₹38,424 crore, amid a pipeline that includes a ₹3.25 lakh crore Rafale programme.",
    sources: [
      {
        title: "Defence in Union Budget 2026-27",
        outlet: "Press Information Bureau",
        date: "Feb 2026",
        url: "https://static.pib.gov.in/WriteReadData/specificdocs/documents/2026/feb/doc202623778301.pdf",
      },
      {
        title:
          "India's defence production more than doubles in five years, hits record ₹1.78 lakh crore",
        outlet: "The Times of India",
        date: "Jun 17, 2026",
        url: "https://timesofindia.indiatimes.com/defence/news/indias-defence-production-more-than-doubles-in-five-years-hits-record-rs-1-78-lakh-crore/articleshow/131786444.cms",
      },
    ],
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
    tagline: "The backbone on rails",
    blurb:
      "Coaches, wagons, financing, ticketing and construction, the listed players riding India's massive railway modernisation and capex cycle.",
    gradient: "from-cyan-500 via-sky-600 to-blue-700",
    accent: "#0ea5e9",
    thesis:
      "Indian Railways is in the middle of its largest modernisation cycle in decades. It spent ~98% of its FY26 capex by February, is preparing a ₹40,000 crore mega-tender for ~100,000 freight wagons, and just completed its 2,843-km Dedicated Freight Corridor network — even as freight loading (1,670 MT in FY26) targets 3,000 MT under the National Rail Plan.",
    sources: [
      {
        title: "Indian Railways plans ₹40,000-cr mega wagon tender for 100,000 units",
        outlet: "Mint",
        date: "May 25, 2026",
        url: "https://www.livemint.com/politics/policy/indian-railways-rs40000-crore-mega-tender-1-lakh-wagons-11779605523866.html",
      },
      {
        title: "Railways' 98% Capex Spend Puts Rail Infra Stocks In Focus",
        outlet: "Kotak Neo",
        date: "May 11, 2026",
        url: "https://www.kotakneo.com/news/market-news/railways-98-percent-capex-rail-infra-stocks-focus/",
      },
    ],
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
    tagline: "The world's back office",
    blurb:
      "India's software export machine, the large-caps and mid-caps that write code, run systems and consult for clients across the globe.",
    gradient: "from-violet-500 via-purple-600 to-indigo-700",
    accent: "#8b5cf6",
    thesis:
      "India's IT industry is resetting around AI. TCS ended FY26 with a record $40.7 billion order book and $2.3 billion in annualised AI revenue, even as AI deflates 2–3% a year off traditional services and the Nifty IT sold off hard in 2026. The index tracks both the AI-reset debate and the world's back office through a turbulent transition.",
    sources: [
      {
        title: "Indian IT firms face muted Q1 as AI shift, weak demand weigh",
        outlet: "Reuters",
        date: "Jul 6, 2026",
        url: "https://www.reuters.com/world/india/indian-it-firms-face-muted-q1-ai-shift-weak-demand-weigh-2026-07-06/",
      },
      {
        title: "TCS closes FY26 with improving sequential growth momentum and strong deal wins",
        outlet: "TCS press release",
        date: "Apr 2026",
        url: "https://www.tcs.com/content/dam/tcs/investor-relations/financial-statements/2025-26/q4/IFRS/Press%20Release%20-%20USD.pdf",
      },
      {
        title: "Indian IT faces AI reset: Top-5 firms post mixed FY26 amid macro headwinds",
        outlet: "The Hindu BusinessLine",
        date: "Apr 26, 2026",
        url: "https://www.thehindubusinessline.com/info-tech/indian-it-faces-ai-reset-top-5-firms-post-mixed-fy26-amid-macro-headwinds/article70908441.ece",
      },
    ],
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
    tagline: "Pharmacy to the world",
    blurb:
      "India's drug makers, generics giants and specialty players supplying medicines across the US, Europe and emerging markets.",
    gradient: "from-teal-400 via-emerald-500 to-green-600",
    accent: "#14b8a6",
    thesis:
      "India is the world's pharmacy — third by volume, ~20% of global generic supply — and pharma exports hit a record $31.12 billion in FY26 even as US shipments dipped 10%. Q1 FY27 exports grew 6.8% with vaccines (+36%) and bulk drugs (+14%) leading, while the product mix shifts toward complex generics, biosimilars and injectables.",
    sources: [
      {
        title: "India's pharma exports grew 6.8% in Q1 FY27: Pharmexcil",
        outlet: "Hindustan Times",
        date: "Aug 12, 2026",
        url: "https://www.hindustantimes.com/india-news/indias-pharma-exports-grew-6-8-in-q1-fy27-pharmexcil-101786533694817.html",
      },
      {
        title: "Drug exports to US fall 10% in FY26 as EU and Africa drive growth",
        outlet: "Business Standard",
        date: "May 1, 2026",
        url: "https://www.business-standard.com/industry/news/drug-exports-to-us-fall-10-in-fy26-as-eu-and-africa-drive-growth-126050100811_1.html",
      },
    ],
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
    tagline: "Where the money moves",
    blurb:
      "India's biggest private and public-sector lenders, the engines of credit growth for the fastest-growing major economy.",
    gradient: "from-red-500 via-rose-600 to-pink-700",
    accent: "#ef4444",
    thesis:
      "India's banking system is in its healthiest state in decades: PSB gross NPAs hit a record low of 1.9% in FY26 with a highest-ever net profit of ₹1.98 lakh crore, and system credit growth accelerated to ~14.5% in FY26, with India Ratings raising its FY27 forecast to 15% — even as new expected-credit-loss provisioning rules and margin pressure temper the upside.",
    sources: [
      {
        title:
          "GNPA of PSBs at historic low of 1.9%, highest-ever net profit of ₹1.98 lakh crore",
        outlet: "Press Information Bureau",
        date: "Jul 28, 2026",
        url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2290384&lang=1&reg=3",
      },
      {
        title: "Bank credit may grow 15% in FY27, but new provisioning rules could hurt profits",
        outlet: "CNBC TV18",
        date: "Aug 27, 2026",
        url: "https://www.cnbctv18.com/economy/india-ratings-revises-fy27-bank-credit-growth-upward-15-pc-provisioning-expected-loss-may-hit-profit-19978567.htm",
      },
    ],
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
  {
    slug: "doublestack",
    name: "Double-Stack Rail Index",
    tagline: "Two containers, one train",
    blurb:
      "Container corridor operators, ports, railway logistics and wagon/railway equipment makers built to carry two containers per wagon on the Western & Eastern Dedicated Freight Corridors.",
    gradient: "from-yellow-500 via-amber-600 to-orange-700",
    accent: "#f59e0b",
    thesis:
      "India just completed the world's only fully electrified freight corridor built for routine double-stack container operations — all 2,843 km of the Western (1,506 km) and Eastern (1,337 km) Dedicated Freight Corridors, commissioned in September 2026. In August 2026 Indian Railways ran its first double-stack long-haul train (JNPT → Varnama, 360 TEUs over 422 km), roughly doubling container throughput per rake and cutting door-to-port transit from days to ~12 hours. The index tracks the listed beneficiaries across the double-stack supply chain: container terminal operators and ports, logistics & freight providers, wagon and railway equipment makers, and corridor EPC contractors.",
    sources: [
      {
        title:
          "India gets today what no country has: world's first fully electrified corridor for routine double-stack container operations",
        outlet: "India Today",
        date: "Sep 8, 2026",
        url: "https://www.indiatoday.in/india/story/wdfc-western-dedicated-freight-corridor-fully-operational-pm-modi-double-stack-electric-route-2989551-2026-09-08",
      },
      {
        title: "First double-stack long-haul container train covers 422 km from JNPT to Vadodara",
        outlet: "The Times of India",
        date: "Aug 22, 2026",
        url: "https://timesofindia.indiatimes.com/city/allahabad/first-double-stack-long-haul-container-train-covers-422-km-from-jnpt-to-vadodara/articleshow/133429316.cms",
      },
      {
        title: "Indian Railways plans ₹40,000-cr mega wagon tender for 100,000 units",
        outlet: "Mint",
        date: "May 25, 2026",
        url: "https://www.livemint.com/politics/policy/indian-railways-rs40000-crore-mega-tender-1-lakh-wagons-11779605523866.html",
      },
    ],
    constituents: [
      { symbol: "CONCOR.NS", name: "Container Corporation" },
      { symbol: "GATEWAY.NS", name: "Gateway Distriparks" },
      { symbol: "ADANIPORTS.NS", name: "Adani Ports & SEZ" },
      { symbol: "GPPL.NS", name: "Gujarat Pipavav Port" },
      { symbol: "TCI.NS", name: "Transport Corporation of India" },
      { symbol: "ALLCARGO.NS", name: "Allcargo Logistics" },
      { symbol: "SNOWMAN.NS", name: "Snowman Logistics" },
      { symbol: "TITAGARH.NS", name: "Titagarh Rail Systems" },
      { symbol: "JWL.NS", name: "Jupiter Wagons" },
      { symbol: "TEXRAIL.NS", name: "Texmaco Rail & Engineering" },
      { symbol: "LT.NS", name: "Larsen & Toubro" },
      { symbol: "IRCON.NS", name: "Ircon International" },
      { symbol: "RVNL.NS", name: "Rail Vikas Nigam" },
      { symbol: "JINDALSTEL.NS", name: "Jindal Steel & Power" },
    ],
  },
];

export function getIndex(slug: string): IndexDef | undefined {
  return INDICES.find((i) => i.slug === slug);
}
