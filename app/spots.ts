export type Spot = {
  slug: string;
  name: string;
  location: string;
  country: string;
  type: 'surf' | 'ski';
  lat: number;
  lon: number;
  airportCode: string;
  flag: string;
  tagline: string;
  description: string;
  bestMonths: number[];
  flightFrom: string;
  flightPrice: number;
  hotelPrice: number;
  weekendTrip: {
    title: string;
    days: { day: string; plan: string }[];
  };
  weekTrip: {
    title: string;
    days: { day: string; plan: string }[];
  };
  localTips: string[];
  bestBreak?: string;
  bestRun?: string;
  idealConditions?: string;
};

export const ALL_SPOTS: Spot[] = [
  // ── SURF ──────────────────────────────────────────────
  {
    slug: 'pipeline',
    name: 'Pipeline',
    location: 'Oahu, Hawaii',
    country: 'USA',
    type: 'surf',
    lat: 21.6653,
    lon: -158.0530,
    airportCode: 'HNL',
    flag: '🇺🇸',
    tagline: 'The most famous wave on earth',
    description: 'Banzai Pipeline on the North Shore of Oahu is the crown jewel of surfing. A shallow reef break that produces perfect, hollow barrels — when it fires, there is nowhere else on earth you would rather be.',
    bestMonths: [11, 12, 1, 2, 3],
    flightFrom: 'NYC',
    flightPrice: 420,
    hotelPrice: 120,
    bestBreak: 'Banzai Pipeline — take off on the peak and aim for the barrel. Backdoor (right) is slightly less crowded.',
    idealConditions: 'NW swell 8-15ft, NE trade winds, low tide',
    weekendTrip: {
      title: 'North Shore Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into HNL, grab a rental car, stay in Haleiwa or Sunset Beach. Hit Foodland Farms for supplies. Sunset surf check at Sunset Beach.' },
        { day: 'Saturday', plan: 'Dawn patrol at Pipeline — get there by 6am before the crowds. Watch from the beach if it is solid overhead+. Afternoon at Waimea Bay. Sunset beers at Haleiwa Joes.' },
        { day: 'Sunday', plan: 'Morning session at Off The Wall or Rockpiles (less crowded than Pipe). Grab a plate lunch at Giovanni\'s Shrimp Truck. Fly home evening.' },
      ]
    },
    weekTrip: {
      title: 'Full North Shore Week',
      days: [
        { day: 'Day 1', plan: 'Arrive, settle in Haleiwa, explore the town, early night.' },
        { day: 'Day 2', plan: 'Dawn patrol Pipeline. Spend the day watching surfers and exploring the beach parks along Kam Highway.' },
        { day: 'Day 3', plan: 'Surf Laniakea or Chuns Reef (more forgiving). Afternoon: drive to the east side, snorkel Hanauma Bay.' },
        { day: 'Day 4', plan: 'Full day North Shore session. Try Sunset Beach if the swell is right. Evening: traditional Hawaiian dinner at Ola at Turtle Bay.' },
        { day: 'Day 5', plan: 'Day trip to Waikiki — surf the long peelers, different vibe, fun waves. See the city side of Oahu.' },
        { day: 'Day 6', plan: 'Hike to the top of Diamond Head in the morning. Afternoon free surf wherever conditions are best.' },
        { day: 'Day 7', plan: 'Final dawn patrol, grab coffee at Haleiwa Coffee Gallery, fly home.' },
      ]
    },
    localTips: [
      'Respect the lineup — Pipeline has a strict local hierarchy. Watch from the beach your first session.',
      'Stay in Haleiwa town — cheaper than Turtle Bay and you are central to everything.',
      'Rent a car — public transport on the North Shore is basically non-existent.',
      'Giovanni\'s Shrimp Truck is not a tourist trap — the garlic shrimp is genuinely incredible.',
      'Check surfline.com/surf-report/banzai-pipeline for the most accurate local forecast.',
      'November to February is peak season — expect crowds in the water and on the road.',
    ],
  },
  {
    slug: 'supertubes',
    name: 'Supertubes',
    location: 'Jeffreys Bay, South Africa',
    country: 'South Africa',
    type: 'surf',
    lat: -34.0522,
    lon: 26.7950,
    airportCode: 'PLZ',
    flag: '🇿🇦',
    tagline: 'The longest, most perfect right-hander on earth',
    description: 'Jeffreys Bay is a small town on the Eastern Cape of South Africa that produces one of the most perfect pointbreaks in the world. Long, fast, mechanical rights that seem to go on forever.',
    bestMonths: [6, 7, 8, 9],
    flightFrom: 'NYC',
    flightPrice: 820,
    hotelPrice: 45,
    bestBreak: 'Supertubes main peak — take off deep and run the wall. Kitchen and Impossibles sections link up on a good day.',
    idealConditions: 'SSW swell 6-10ft, light NW offshore winds, mid tide',
    weekendTrip: {
      title: 'J-Bay Quick Hit',
      days: [
        { day: 'Friday', plan: 'Fly into Port Elizabeth (PLZ), 75min drive to J-Bay. Check into a surf lodge on Da Gama Road — you can see the waves from your room.' },
        { day: 'Saturday', plan: 'All day Supertubes if it is on. The walk from the top of the point back up after each wave is part of the experience. Braai (BBQ) dinner at the lodge.' },
        { day: 'Sunday', plan: 'Morning session, then explore the J-Bay markets and surf shops. Fly back from PLZ in the afternoon.' },
      ]
    },
    weekTrip: {
      title: 'Eastern Cape Surf Week',
      days: [
        { day: 'Day 1', plan: 'Arrive J-Bay, settle in, surf check, early night.' },
        { day: 'Day 2', plan: 'Full day Supertubes — get in the water at dawn before the wind picks up.' },
        { day: 'Day 3', plan: 'If Supers is maxed out, surf Boneyards or Point. Afternoon: visit the Sharks Board display.' },
        { day: 'Day 4', plan: 'Day trip to St Francis Bay — boat-shaped pool at Bruce\'s Beauties, explore the canals.' },
        { day: 'Day 5', plan: 'Back to Supers for another full day. Evening: sundowners at the Walskipper.' },
        { day: 'Day 6', plan: 'Safari day trip to Addo Elephant Park — 1.5hrs from J-Bay, worth every minute.' },
        { day: 'Day 7', plan: 'Final morning session, drive to PLZ, fly home.' },
      ]
    },
    localTips: [
      'J-Bay in July is cold — 4/3mm wetsuit minimum, boots if you run cold.',
      'Da Gama Road is where you want to stay — walking distance to the point.',
      'The rand (ZAR) is weak against USD/EUR — South Africa is incredible value right now.',
      'Watch for sharks — J-Bay has a shark history. Locals surf it anyway but stay aware.',
      'Billabong Pro is held here in July — waves are usually pumping during the contest window.',
      'Hire a local guide for your first session to learn the lineup etiquette.',
    ],
  },
  {
    slug: 'uluwatu',
    name: 'Uluwatu',
    location: 'Bukit Peninsula, Bali',
    country: 'Indonesia',
    type: 'surf',
    lat: -8.8291,
    lon: 115.0849,
    airportCode: 'DPS',
    flag: '🇮🇩',
    tagline: 'Bali\'s most iconic wave at the edge of a clifftop temple',
    description: 'Uluwatu is a world-class left-hander that wraps around the tip of Bali\'s Bukit Peninsula beneath a cliffside Hindu temple. Warm water, consistent swell, and magical sunsets make this one of the most special surf destinations on the planet.',
    bestMonths: [5, 6, 7, 8, 9, 10],
    flightFrom: 'NYC',
    flightPrice: 980,
    hotelPrice: 35,
    bestBreak: 'The Peak for the main takeoff, Racetracks for long walls, The Cave for hollow barrels at low tide.',
    idealConditions: 'SW swell 5-8ft, light SE trade winds, mid to high tide',
    weekendTrip: {
      title: 'Bali Quick Strike',
      days: [
        { day: 'Friday', plan: 'Fly into Ngurah Rai (DPS). Stay at a surf villa in Uluwatu — Omnia area or Bingin. Bintang beers and nasi goreng to recover from the flight.' },
        { day: 'Saturday', plan: 'Dawn session at Uluwatu before the crowds. Afternoon at Padang Padang if the swell is smaller. Sunset at the Uluwatu temple warung.' },
        { day: 'Sunday', plan: 'Morning session at Bingin — more relaxed vibe. Explore the cliff restaurants. Fly home or extend.' },
      ]
    },
    weekTrip: {
      title: 'Bukit Peninsula Week',
      days: [
        { day: 'Day 1', plan: 'Arrive DPS, get to the Bukit, recover, check the breaks.' },
        { day: 'Day 2', plan: 'Full day Uluwatu — morning session, watch from the clifftop warung at noon, afternoon session.' },
        { day: 'Day 3', plan: 'Explore — Padang Padang, Impossibles, Bingin. Find your favourite.' },
        { day: 'Day 4', plan: 'Scooter north to Canggu for a different vibe — beach clubs, Echo Beach surf.' },
        { day: 'Day 5', plan: 'Back on the Bukit. Nyang Nyang beach — 30min walk in, almost always empty.' },
        { day: 'Day 6', plan: 'Sunrise at the Uluwatu temple. Surf Racetracks. Sunset at Single Fin — best view in Bali.' },
        { day: 'Day 7', plan: 'Final morning session, fly home from DPS.' },
      ]
    },
    localTips: [
      'Rent a scooter — it is the only sensible way to get between breaks on the Bukit.',
      'The warung at the top of the Uluwatu stairs has the best view of the lineup. Order a Bintang and watch before paddling out.',
      'Low tide at The Cave produces the most intense barrels — intermediate to advanced only.',
      'Bali is cheap — $35/night gets you a great villa with a pool on the Bukit.',
      'Respect the temple — cover up when visiting Uluwatu temple above the break.',
      'June-August is peak season, still worth it — the trade winds clean it up perfectly.',
    ],
  },
  {
    slug: 'hossegor',
    name: 'Hossegor',
    location: 'Landes, France',
    country: 'France',
    type: 'surf',
    lat: 43.6647,
    lon: -1.4320,
    airportCode: 'BIQ',
    flag: '🇫🇷',
    tagline: 'Europe\'s surf capital — powerful beach break perfection',
    description: 'Hossegor is a small town in southwest France that punches way above its weight in the surf world. A unique underwater canyon funnels Atlantic swell into powerful, hollow beach breaks that rival anything in the world.',
    bestMonths: [9, 10, 11, 3, 4],
    flightFrom: 'NYC',
    flightPrice: 550,
    hotelPrice: 80,
    bestBreak: 'La Gravière for the heaviest barrels, La Nord for more forgiving peaks, Capbreton harbour for beginners.',
    idealConditions: 'NW swell 4-8ft, light E offshore winds, mid tide',
    weekendTrip: {
      title: 'Basque Country Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into Biarritz (BIQ), 20min drive to Hossegor. Check into a rental near La Gravière. Dinner in Capbreton — the seafood is outstanding.' },
        { day: 'Saturday', plan: 'Dawn patrol La Gravière if it is pumping. Afternoon explore the markets in Hossegor town. Evening in Biarritz — the grande plage at sunset is stunning.' },
        { day: 'Sunday', plan: 'Morning session, then drive south to San Sebastian (45min) for the best pintxos of your life before flying home.' },
      ]
    },
    weekTrip: {
      title: 'Landes Surf Week',
      days: [
        { day: 'Day 1', plan: 'Arrive Biarritz, drive to Hossegor, settle in.' },
        { day: 'Day 2', plan: 'Full day La Gravière — one of the most powerful beach breaks in Europe.' },
        { day: 'Day 3', plan: 'Surf La Nord in the morning. Afternoon: bike ride through the Landes pine forest.' },
        { day: 'Day 4', plan: 'Day trip to San Sebastian, Spain — 1hr drive, incredible food, great city beach break.' },
        { day: 'Day 5', plan: 'Back to Hossegor. Sunset surf session at Capbreton. Dinner at Le Surfing restaurant.' },
        { day: 'Day 6', plan: 'Explore Biarritz — surf the grande plage, visit the surf museum, explore the old port.' },
        { day: 'Day 7', plan: 'Final session, drive to BIQ, fly home.' },
      ]
    },
    localTips: [
      'La Gravière is not for the faint-hearted — it is a serious beach break that closes out fast. Know your limits.',
      'The Quiksilver Pro France is held here in October — the swell is usually firing during contest season.',
      'Rent a van or camper — it is the classic Hossegor way and cheaper than hotels.',
      'Croissants and coffee at a Hossegor boulangerie before your dawn patrol is non-negotiable.',
      'San Sebastian is 1 hour south and has some of the best food in Europe — go.',
      'Spring (March-April) is underrated — less crowds, still solid swell, mild temperatures.',
    ],
  },
  {
    slug: 'cloudbreak',
    name: 'Cloudbreak',
    location: 'Tavarua Island, Fiji',
    country: 'Fiji',
    type: 'surf',
    lat: -17.8667,
    lon: 177.2167,
    airportCode: 'NAN',
    flag: '🇫🇯',
    tagline: 'The most perfect left in the South Pacific',
    description: 'Cloudbreak is a mythical left-hand reef break off Tavarua Island in Fiji. On its day it produces long, perfect barrels in crystal clear warm water over a shallow coral reef. One of the most coveted waves on earth.',
    bestMonths: [5, 6, 7, 8, 9],
    flightFrom: 'NYC',
    flightPrice: 1100,
    hotelPrice: 150,
    bestBreak: 'The main Cloudbreak peak — take off on the sets and thread the inside sections. Restaurants section offers longer walls.',
    idealConditions: 'SW swell 6-12ft, light SE trade winds, mid tide',
    weekendTrip: {
      title: 'Fiji Quick Strike',
      days: [
        { day: 'Friday', plan: 'Fly into Nadi (NAN). Stay at Waidroka or book a boat trip from the Coral Coast. Long travel day — rest up.' },
        { day: 'Saturday', plan: 'Boat out to Cloudbreak at dawn. Full day session if conditions allow. Sunset kava ceremony with locals.' },
        { day: 'Sunday', plan: 'Morning session, fly home from NAN.' },
      ]
    },
    weekTrip: {
      title: 'Fiji Islands Surf Week',
      days: [
        { day: 'Day 1', plan: 'Arrive Nadi, get to your base on the Coral Coast.' },
        { day: 'Day 2', plan: 'Boat to Cloudbreak — full day, bring lunch.' },
        { day: 'Day 3', plan: 'Boat to Restaurants — longer, more forgiving walls than Cloudbreak.' },
        { day: 'Day 4', plan: 'Rest day — snorkelling the reef, village visit, kava with locals.' },
        { day: 'Day 5', plan: 'Back to Cloudbreak if swell is still up.' },
        { day: 'Day 6', plan: 'Explore the Mamanuca Islands — Monuriki (Cast Away island), snorkel.' },
        { day: 'Day 7', plan: 'Final morning session, fly home.' },
      ]
    },
    localTips: [
      'You need to book a boat — Cloudbreak is only accessible by sea. Arrange in advance.',
      'Booties are essential — the reef is shallow and very sharp on the inside.',
      'Fiji time is real — build extra flexibility into your plans.',
      'Kava is part of the culture — accept it graciously when offered by locals.',
      'June-August produces the most consistent swell but is also the busiest.',
      'The Fijian people are incredibly warm and welcoming — one of the most special travel experiences on earth.',
    ],
  },
  {
    slug: 'puerto-escondido',
    name: 'Puerto Escondido',
    location: 'Oaxaca, Mexico',
    country: 'Mexico',
    type: 'surf',
    lat: 15.8667,
    lon: -97.0667,
    airportCode: 'PXM',
    flag: '🇲🇽',
    tagline: 'The Mexican Pipeline — the heaviest beach break in the world',
    description: 'Puerto Escondido\'s Zicatela beach is home to one of the most powerful and dangerous beach breaks on the planet. Massive closeout sets and perfect barrels on the right days make this a bucket list wave for advanced surfers.',
    bestMonths: [5, 6, 7, 8, 9, 10],
    flightFrom: 'NYC',
    flightPrice: 380,
    hotelPrice: 40,
    bestBreak: 'Zicatela main peak for big barrels, La Punta for long mellow rights, Carrizalillo for beginners.',
    idealConditions: 'S-SW swell 6-12ft, light N offshore winds, low to mid tide',
    weekendTrip: {
      title: 'Puerto Quick Hit',
      days: [
        { day: 'Friday', plan: 'Fly into Puerto Escondido (PXM) or via Mexico City. Stay on Zicatela beach — you can hear the waves from bed.' },
        { day: 'Saturday', plan: 'Dawn patrol Zicatela if it is pumping. Watch from the beach if it is huge — the wipeouts are spectacular. Evening mezcal on the strip.' },
        { day: 'Sunday', plan: 'Morning session at La Punta — longer, more fun waves. Fly home.' },
      ]
    },
    weekTrip: {
      title: 'Oaxacan Coast Week',
      days: [
        { day: 'Day 1', plan: 'Arrive Puerto, get oriented, beach check.' },
        { day: 'Day 2', plan: 'Full day Zicatela — surf or watch depending on size.' },
        { day: 'Day 3', plan: 'Day trip to Mazunte and Zipolite — beautiful beaches, different vibe.' },
        { day: 'Day 4', plan: 'La Punta all day — the right-hander is world class when it links up.' },
        { day: 'Day 5', plan: 'Day trip to Oaxaca city — 6hr bus or short flight. The food alone is worth it.' },
        { day: 'Day 6', plan: 'Back to Zicatela for your best session of the trip.' },
        { day: 'Day 7', plan: 'Final morning, fly home.' },
      ]
    },
    localTips: [
      'Zicatela is NOT a beginner wave — people die here every year. Be honest about your ability.',
      'The town is small and walkable — you do not need a car if you stay on Zicatela.',
      'Mezcal is the local spirit — try it at a proper mezcaleria, not a tourist bar.',
      'June-September is prime season but also peak hurricane season — check forecasts.',
      'La Punta neighbourhood is more chilled than the main Zicatela strip.',
      'Oaxacan food is some of the best in Mexico — mole negro, tlayudas, chapulines.',
    ],
  },
  {
    slug: 'mentawais',
    name: 'Mentawai Islands',
    location: 'West Sumatra, Indonesia',
    country: 'Indonesia',
    type: 'surf',
    lat: -2.1333,
    lon: 99.6833,
    airportCode: 'PDG',
    flag: '🇮🇩',
    tagline: 'The greatest concentration of perfect waves on the planet',
    description: 'The Mentawai Islands off the coast of Sumatra contain more world-class waves per square kilometre than anywhere else on earth. Hollow rights, perfect lefts, warm water, and virtually no crowds if you find the right spot.',
    bestMonths: [3, 4, 5, 6, 7, 8, 9, 10],
    flightFrom: 'NYC',
    flightPrice: 1200,
    hotelPrice: 200,
    bestBreak: 'HT\'s for perfect rights, Macaronis for playful lefts, Kandui for hollow barrels.',
    idealConditions: 'SW swell 4-8ft, light E trades, all tides depending on the spot',
    weekendTrip: {
      title: 'Mentawai Boat Charter',
      days: [
        { day: 'Friday', plan: 'Fly into Padang (PDG), board your surf charter boat. Overnight sail to the islands.' },
        { day: 'Saturday', plan: 'Full day surfing — your captain will chase the best conditions. Multiple sessions.' },
        { day: 'Sunday', plan: 'Morning session, sail back to Padang, fly home.' },
      ]
    },
    weekTrip: {
      title: 'Mentawai Week Charter',
      days: [
        { day: 'Day 1', plan: 'Arrive Padang, board the charter boat, sail overnight.' },
        { day: 'Day 2', plan: 'HT\'s or Macaronis depending on swell. 3-4 sessions.' },
        { day: 'Day 3', plan: 'Chase swell — your captain tracks the best waves daily.' },
        { day: 'Day 4', plan: 'Kandui or Rifles if the swell is solid.' },
        { day: 'Day 5', plan: 'Village visit — Mentawai culture is fascinating. Afternoon surf.' },
        { day: 'Day 6', plan: 'Final full day — hit your favourite spot one more time.' },
        { day: 'Day 7', plan: 'Sail back to Padang, fly home.' },
      ]
    },
    localTips: [
      'A surf charter is the best and really the only way to do the Mentawais properly.',
      'Budget $200-400/day for a good charter split between 8-12 people — worth every cent.',
      'Bring a fish — the waves are so good you will want boards for different conditions.',
      'The water is warm (28-30°C) — boardshorts only, no wetsuit needed.',
      'Bring reef boots for the shallower spots — some reefs are very sharp.',
      'The Mentawais are remote — bring all medications, sunscreen, and any specialty items you need.',
    ],
  },
  {
    slug: 'mavericks',
    name: 'Mavericks',
    location: 'Half Moon Bay, California',
    country: 'USA',
    type: 'surf',
    lat: 37.4943,
    lon: -122.5018,
    airportCode: 'SFO',
    flag: '🇺🇸',
    tagline: 'Northern California\'s legendary big wave',
    description: 'Mavericks is one of the most famous big wave spots in the world, breaking off Pillar Point in Half Moon Bay just south of San Francisco. Cold water, giant peaks, and a heavy hold-down make this a spot that commands serious respect.',
    bestMonths: [11, 12, 1, 2, 3],
    flightFrom: 'NYC',
    flightPrice: 280,
    hotelPrice: 150,
    bestBreak: 'The main Mavericks peak — outer bowl for the biggest sets, the channel for safety.',
    idealConditions: 'NW swell 15ft+, light NE offshore winds, mid tide',
    weekendTrip: {
      title: 'NorCal Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into SFO. Drive down to Half Moon Bay — 45min. Stay at the Half Moon Bay Inn. Dungeness crab dinner at Barbara\'s Fishtrap.' },
        { day: 'Saturday', plan: 'Dawn patrol at Mavericks — watch from the cliff path if it is massive. Surf the beachbreak at Francis Beach if you want to get in the water. Drive up to San Francisco for the afternoon.' },
        { day: 'Sunday', plan: 'Explore the coast — Pacifica beachbreak, Fort Funston. Fly home from SFO.' },
      ]
    },
    weekTrip: {
      title: 'Northern California Coast Week',
      days: [
        { day: 'Day 1', plan: 'Arrive SFO, drive to Half Moon Bay.' },
        { day: 'Day 2', plan: 'Mavericks watch or surf depending on your level. The view from the cliff is incredible regardless.' },
        { day: 'Day 3', plan: 'Drive north — Ocean Beach SF, a punishing beachbreak for experienced surfers.' },
        { day: 'Day 4', plan: 'Continue north — Bolinas, Stinson Beach. More mellow surf, beautiful scenery.' },
        { day: 'Day 5', plan: 'Day in San Francisco — Golden Gate, Mission burritos, Tartine bakery.' },
        { day: 'Day 6', plan: 'Drive south — Santa Cruz, Steamer Lane. Classic California pointbreak.' },
        { day: 'Day 7', plan: 'Final session, drive back to SFO, fly home.' },
      ]
    },
    localTips: [
      'Mavericks is experts only — it is a life-threatening wave. Watch from the cliff path if in doubt.',
      'The water is cold year round — 5/4mm wetsuit, boots, gloves, and hood in winter.',
      'Half Moon Bay is a beautiful small town — great base for the NorCal coast.',
      'The Mavericks surf contest (when it runs) draws the best big wave surfers in the world.',
      'Parking at the trailhead fills up fast on good swell days — get there early.',
      'Barbara\'s Fishtrap in Princeton-by-the-Sea is the best seafood in the area.',
    ],
  },

  // ── SKI ──────────────────────────────────────────────
  {
    slug: 'whistler',
    name: 'Whistler Blackcomb',
    location: 'British Columbia, Canada',
    country: 'Canada',
    type: 'ski',
    lat: 50.1163,
    lon: -122.9574,
    airportCode: 'YVR',
    flag: '🇨🇦',
    tagline: 'The biggest ski resort in North America',
    description: 'Whistler Blackcomb is a giant — two massive mountains connected by the Peak 2 Peak gondola, over 8,100 acres of skiable terrain, and a legendary village at the base. Two-and-a-half hours north of Vancouver in one of the most beautiful mountain settings on earth.',
    bestMonths: [12, 1, 2, 3, 4],
    flightFrom: 'NYC',
    flightPrice: 280,
    hotelPrice: 180,
    bestRun: 'Spanky\'s Ladder on Blackcomb for big mountain feel, Harmony Bowl on Whistler for powder days.',
    idealConditions: 'Fresh snowfall overnight, cold temperatures, light winds',
    weekendTrip: {
      title: 'Whistler Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into Vancouver (YVR). Rent a car or take the Whistler Shuttle (easier). Arrive Whistler village, grab gear from rental shops on Village Stroll. Dinner at Araxi.' },
        { day: 'Saturday', plan: 'On snow by 8:30am — Whistler Mountain first, hit Harmony Bowl, then Peak chair. Lunch at Roundhouse Lodge. Afternoon on Blackcomb. Après ski at Garfinkel\'s.' },
        { day: 'Sunday', plan: 'Early start Blackcomb — Spanky\'s Ladder if conditions allow. Afternoon: speed down easier groomers before driving back to YVR.' },
      ]
    },
    weekTrip: {
      title: 'Whistler Full Week',
      days: [
        { day: 'Day 1', plan: 'Arrive, get settled, afternoon ski to get your legs.' },
        { day: 'Day 2', plan: 'Full day Whistler Mountain — explore every zone.' },
        { day: 'Day 3', plan: 'Full day Blackcomb — Glacier, 7th Heaven, Spanky\'s.' },
        { day: 'Day 4', plan: 'Powder day plan — whichever mountain got the most snow. Hit trees early before they get tracked out.' },
        { day: 'Day 5', plan: 'Snowmobile tour or cat skiing in the backcountry for something different.' },
        { day: 'Day 6', plan: 'Peak 2 Peak day — ski from one mountain to the other all day.' },
        { day: 'Day 7', plan: 'Final morning laps, drive back to Vancouver, fly home.' },
      ]
    },
    localTips: [
      'Buy lift tickets in advance online — they are significantly cheaper and sometimes sell out.',
      'Stay in Whistler Village or Upper Village — ski-in ski-out makes the whole trip easier.',
      'Powder days happen fast — follow @WhistlerBlackcomb on Instagram for overnight snow alerts.',
      'The Peak 2 Peak gondola has glass-bottomed cabins — do this at least once even if you are not skiing.',
      'Après ski culture at Whistler is serious — GLC and Longhorn Saloon are the classics.',
      'February is the sweet spot — good snowpack, fewer holiday crowds than December-January.',
    ],
  },
  {
    slug: 'snowbird',
    name: 'Snowbird',
    location: 'Little Cottonwood Canyon, Utah',
    country: 'USA',
    type: 'ski',
    lat: 40.5830,
    lon: -111.6556,
    airportCode: 'SLC',
    flag: '🇺🇸',
    tagline: 'Greatest snow on earth — Utah\'s crown jewel',
    description: 'Snowbird sits at the top of Little Cottonwood Canyon, 29 miles from Salt Lake City. Utah\'s legendary light, dry powder combined with Snowbird\'s steep terrain and 3,000ft vertical drop make this one of the most exciting ski mountains in the world.',
    bestMonths: [12, 1, 2, 3],
    flightFrom: 'NYC',
    flightPrice: 180,
    hotelPrice: 120,
    bestRun: 'Regulator Johnson for steep powder, The Cirque for big mountain terrain, Chips Run for intermediate cruising.',
    idealConditions: 'Storm cycle dropping 12"+ overnight, cold temperatures, groomed morning',
    weekendTrip: {
      title: 'SLC Powder Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into Salt Lake City (SLC) — one of the closest airports to world class skiing anywhere. 45min drive up the canyon. Dinner at The Aerie at the Snowbird Center.' },
        { day: 'Saturday', plan: 'On the tram at 9am. Mineral Basin for morning warm up, then Cirque traverse for big mountain terrain. Afternoon groomers when legs start burning.' },
        { day: 'Sunday', plan: 'If it snowed overnight hit the trees first thing. Drive back to SLC for afternoon flight.' },
      ]
    },
    weekTrip: {
      title: 'Wasatch Week',
      days: [
        { day: 'Day 1', plan: 'Arrive SLC, drive up canyon, get settled.' },
        { day: 'Day 2', plan: 'Full day Snowbird — learn the mountain layout.' },
        { day: 'Day 3', plan: 'Day trip to Alta — skiers only, incredible snow, old-school charm. Shares a ridgeline with Snowbird.' },
        { day: 'Day 4', plan: 'Back to Snowbird — Mineral Basin all day if conditions are good.' },
        { day: 'Day 5', plan: 'Park City day trip — 45min drive, different terrain, great town.' },
        { day: 'Day 6', plan: 'Powder day at Snowbird — wake up at 6am, check the snow report, get on the tram first chair.' },
        { day: 'Day 7', plan: 'Final morning, drive to SLC, fly home.' },
      ]
    },
    localTips: [
      'Utah\'s snow is famously light and dry — it skis completely differently to heavy East Coast snow.',
      'The tram holds 125 people and has a long line on weekends — get there early or ski the lifts first.',
      'Alta is next door and has some of the best snow in Utah — combine both mountains in a trip.',
      'SLC airport is genuinely 45 minutes from world class skiing — one of the best ski access points in the world.',
      'Snowbird has terrain for all levels but its reputation is for experts — intermediates will love Mineral Basin.',
      'The canyon road can close after heavy snowfall — check UDOT road conditions before driving up.',
    ],
  },
  {
    slug: 'niseko',
    name: 'Niseko United',
    location: 'Hokkaido, Japan',
    country: 'Japan',
    type: 'ski',
    lat: 42.8042,
    lon: 140.6875,
    airportCode: 'CTS',
    flag: '🇯🇵',
    tagline: 'The powder capital of the world',
    description: 'Niseko on Japan\'s northernmost island of Hokkaido receives some of the most consistent, light, dry powder snow on earth — up to 15 metres per season. Combined with Japanese culture, incredible food, and an onsen on every corner, this is a ski destination unlike any other.',
    bestMonths: [12, 1, 2, 3],
    flightFrom: 'NYC',
    flightPrice: 780,
    hotelPrice: 120,
    bestRun: 'Hanazono for untouched powder stashes, Gate 3 backcountry for the adventurous, Ace Family for long cruising runs.',
    idealConditions: 'Siberian storm cycle dropping powder overnight, cold temperatures below -5°C',
    weekendTrip: {
      title: 'Niseko Powder Hit',
      days: [
        { day: 'Friday', plan: 'Fly into New Chitose (CTS). Bus or hire car 2hrs to Niseko. Check into a lodge in Hirafu village. Ramen dinner to warm up.' },
        { day: 'Saturday', plan: 'If it snowed — trees at Hanazono first thing before they get tracked. Midday groomer run warm up. Afternoon backcountry gates if you are experienced. Onsen at the hotel.' },
        { day: 'Sunday', plan: 'Morning session on Annupuri or Grand Hirafu. Drive back to CTS, fly home.' },
      ]
    },
    weekTrip: {
      title: 'Hokkaido Ski Week',
      days: [
        { day: 'Day 1', plan: 'Arrive CTS, bus to Niseko, get settled in Hirafu.' },
        { day: 'Day 2', plan: 'Grand Hirafu — get your powder legs.' },
        { day: 'Day 3', plan: 'Hanazono — smaller mountain, incredible tree runs.' },
        { day: 'Day 4', plan: 'Annupuri — the locals\' mountain, less crowds, great powder.' },
        { day: 'Day 5', plan: 'Backcountry tour with a guide — the terrain outside the gates is world class.' },
        { day: 'Day 6', plan: 'Day trip to Rusutsu — neighbouring resort, massive and often uncrowded.' },
        { day: 'Day 7', plan: 'Final morning laps, bus to CTS, fly home.' },
      ]
    },
    localTips: [
      'Japan\'s powder is the lightest in the world — it skis like floating on air. Completely different to anywhere else.',
      'The backcountry gates at Niseko open when the patrol decides — check in the morning and be ready to go.',
      'An onsen (hot spring bath) after skiing is mandatory — most lodges have one or use the public baths.',
      'Hirafu village has an incredible restaurant scene — the Japanese food is exceptional.',
      'January is statistically the best powder month — book early as it fills up fast.',
      'Rent skis in Hirafu rather than bringing your own — good quality, cheaper, and saves the hassle.',
    ],
  },
  {
    slug: 'chamonix',
    name: 'Chamonix',
    location: 'Haute-Savoie, France',
    country: 'France',
    type: 'ski',
    lat: 45.9237,
    lon: 6.8694,
    airportCode: 'GVA',
    flag: '🇫🇷',
    tagline: 'The birthplace of alpinism — big mountain skiing at its finest',
    description: 'Chamonix sits in the shadow of Mont Blanc, Europe\'s highest peak. It is less a ski resort and more a world-class mountain town that happens to have extraordinary skiing. The Vallée Blanche — a 20km off-piste glacier run — is one of the greatest skiing experiences on earth.',
    bestMonths: [1, 2, 3, 4],
    flightFrom: 'NYC',
    flightPrice: 650,
    hotelPrice: 120,
    bestRun: 'Vallée Blanche for the epic glacier descent, Les Grands Montets for steep off-piste, Brévent for the Mont Blanc views.',
    idealConditions: 'Fresh snow, clear skies for the Vallée Blanche, cold temperatures to keep the powder dry',
    weekendTrip: {
      title: 'Cham Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into Geneva (GVA). 1hr transfer to Chamonix. Check into a hotel in town. Fondue and vin chaud in one of the historic chalets.' },
        { day: 'Saturday', plan: 'Aiguille du Midi cable car at 8am — the views of Mont Blanc are staggering. Ski Les Grands Montets. Après ski at MBC (Mont Blanc Brewing Company).' },
        { day: 'Sunday', plan: 'Vallée Blanche if conditions allow — book a guide in advance. Drive back to Geneva, fly home.' },
      ]
    },
    weekTrip: {
      title: 'Mont Blanc Week',
      days: [
        { day: 'Day 1', plan: 'Arrive Geneva, transfer to Chamonix, get settled.' },
        { day: 'Day 2', plan: 'Les Grands Montets — the steepest and most challenging skiing in the valley.' },
        { day: 'Day 3', plan: 'Brévent and Flégère — incredible views across to Mont Blanc.' },
        { day: 'Day 4', plan: 'Vallée Blanche with a guide — the most famous off-piste run in the world.' },
        { day: 'Day 5', plan: 'Day trip to Verbier — 1.5hr drive, completely different vibe, great terrain.' },
        { day: 'Day 6', plan: 'Le Tour and Balme — gentler terrain, beautiful scenery, great for a powder day.' },
        { day: 'Day 7', plan: 'Final morning, transfer to Geneva, fly home.' },
      ]
    },
    localTips: [
      'The Vallée Blanche requires a guide — do not attempt it without one. It is a glacier with crevasses.',
      'Chamonix town is beautiful — spend time in the streets, the food and wine scene is excellent.',
      'The ski areas are spread around the valley — a bus pass is included with your lift ticket.',
      'January-February is best for snow but can have bad weather — March has more stable conditions and spring sun.',
      'Book the Aiguille du Midi cable car in advance — it sells out, especially on clear days.',
      'The MBC (Mont Blanc Brewing Company) is the best après ski spot in town.',
    ],
  },
  {
    slug: 'verbier',
    name: 'Verbier',
    location: 'Valais, Switzerland',
    country: 'Switzerland',
    type: 'ski',
    lat: 46.0959,
    lon: 7.2283,
    airportCode: 'GVA',
    flag: '🇨🇭',
    tagline: 'Switzerland\'s most glamorous ski resort',
    description: 'Verbier is the jewel of the Swiss 4 Vallées ski area — a glamorous, high-altitude resort with world-class off-piste terrain, legendary après ski, and the famous Freeride World Tour stop. Big mountain terrain for confident skiers.',
    bestMonths: [1, 2, 3],
    flightFrom: 'NYC',
    flightPrice: 700,
    hotelPrice: 200,
    bestRun: 'Mont Fort off-piste for big mountain feel, Lac des Vaux for powder, Stairway to Heaven couloir for experts.',
    idealConditions: 'Fresh powder, high pressure for clear skies, cold temperatures',
    weekendTrip: {
      title: 'Verbier Weekend',
      days: [
        { day: 'Friday', plan: 'Fly Geneva, transfer to Verbier. Switzerland is expensive — budget accordingly. Dinner at Sonalon or Les Ruinettes.' },
        { day: 'Saturday', plan: 'Mont Fort cable car first thing — the highest point and best views. Off-piste from the top if conditions allow. Après at Farm Club or Fer à Cheval.' },
        { day: 'Sunday', plan: 'Morning laps, transfer back to Geneva, fly home.' },
      ]
    },
    weekTrip: {
      title: 'Swiss Alps Week',
      days: [
        { day: 'Day 1', plan: 'Arrive Geneva, transfer to Verbier.' },
        { day: 'Day 2', plan: 'Explore the 4 Vallées — massive interconnected ski area.' },
        { day: 'Day 3', plan: 'Mont Fort and the off-piste zones with a guide.' },
        { day: 'Day 4', plan: 'Day trip to Zermatt and the Matterhorn — unforgettable.' },
        { day: 'Day 5', plan: 'Powder day — wherever it snowed most.' },
        { day: 'Day 6', plan: 'Day trip to Chamonix across the border in France.' },
        { day: 'Day 7', plan: 'Final morning, transfer to Geneva, fly home.' },
      ]
    },
    localTips: [
      'Verbier is expensive even by Swiss standards — budget at least $200/day for food, drinks, and lift tickets.',
      'The off-piste terrain is world class but should only be skied with a guide after a storm.',
      'Farm Club is the legendary Verbier night spot — if you are into that scene.',
      'The Freeride World Tour stop in January draws the best big mountain riders in the world.',
      'Book accommodation way in advance — Verbier is a small village and fills up fast.',
      'The 4 Vallées lift pass covers Verbier, Nendaz, Veysonnaz, and Thyon — enormous terrain.',
    ],
  },
  {
    slug: 'jackson-hole',
    name: 'Jackson Hole',
    location: 'Wyoming, USA',
    country: 'USA',
    type: 'ski',
    lat: 43.5875,
    lon: -110.8277,
    airportCode: 'JAC',
    flag: '🇺🇸',
    tagline: 'America\'s most legendary big mountain resort',
    description: 'Jackson Hole Mountain Resort has the greatest continuous vertical drop of any US resort at 4,139ft, with notoriously steep terrain and legendary off-piste skiing. The adjacent town of Jackson is one of the coolest mountain towns in America.',
    bestMonths: [12, 1, 2, 3],
    flightFrom: 'NYC',
    flightPrice: 320,
    hotelPrice: 160,
    bestRun: 'Corbet\'s Couloir for the brave, Rendezvous Bowl for big mountain powder, Laramie Bowl for intermediate powder.',
    idealConditions: 'Storm cycle dropping 12"+ powder, cold Wyoming temperatures, calm winds',
    weekendTrip: {
      title: 'Jackson Weekend',
      days: [
        { day: 'Friday', plan: 'Fly into Jackson Hole (JAC) — one of the most scenic airport approaches in the world. 20min to Teton Village. Million Dollar Cowboy Bar in Jackson town for the vibe.' },
        { day: 'Saturday', plan: 'Aerial tram to the top at 9am. Rendezvous Bowl, then work your way across the mountain. Watch Corbet\'s Couloir from the catwalk.' },
        { day: 'Sunday', plan: 'Apres skiing Cowboys, final laps, fly home.' },
      ]
    },
    weekTrip: {
      title: 'Teton Week',
      days: [
        { day: 'Day 1', plan: 'Arrive JAC, Teton Village base, get sorted.' },
        { day: 'Day 2', plan: 'Top to bottom exploration day — learn the mountain.' },
        { day: 'Day 3', plan: 'Powder day if it snowed — Hobacks and trees in Casper Bowl.' },
        { day: 'Day 4', plan: 'Grand Targhee day trip — other side of the Tetons, incredible snow, no crowds.' },
        { day: 'Day 5', plan: 'Snowmobile tour in Yellowstone — world class experience 1hr from Jackson.' },
        { day: 'Day 6', plan: 'Back to JHMR for your best day — you know the mountain now.' },
        { day: 'Day 7', plan: 'Final morning laps, fly home from JAC.' },
      ]
    },
    localTips: [
      'The aerial tram line can be 45min+ on weekends — get there at 8:30am when the mountain opens.',
      'Corbet\'s Couloir requires a mandatory air and is experts only — watch from the catwalk first.',
      'Grand Targhee on the other side of the range gets more snow and has no crowds — do not skip it.',
      'Jackson town is 20min from the mountain but worth visiting — great bars, restaurants, and Western vibe.',
      'The National Elk Refuge sleigh rides in winter are a great non-ski activity.',
      'Wyoming has no state income tax — Jackson attracts a wealthy crowd but the skiing is for everyone.',
    ],
  },
];

export const SURF_SPOTS = ALL_SPOTS.filter(s => s.type === 'surf');
export const SKI_RESORTS = ALL_SPOTS.filter(s => s.type === 'ski');