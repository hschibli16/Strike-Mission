export type RegionType = 'surf' | 'ski';

export interface Region {
  slug: string;
  name: string;
  type: RegionType;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  bestMonths: number[];
  seasonNote: string;
  countries: string[];
  centroidLat?: number;
  centroidLon?: number;
  focusZoom?: number;
}

/*
  SQL migration (do not run automatically):
  ALTER TABLE regions ADD COLUMN IF NOT EXISTS centroid_lat numeric;
  ALTER TABLE regions ADD COLUMN IF NOT EXISTS centroid_lon numeric;
  ALTER TABLE regions ADD COLUMN IF NOT EXISTS focus_zoom integer;
*/

export const REGIONS: Region[] = [
  // SURF REGIONS (24)
  { slug: 'hawaii', name: 'Hawaii', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [10,11,12,1,2,3], seasonNote: '', countries: ['United States'], centroidLat: 21.0, centroidLon: -157.8, focusZoom: 7 },
  { slug: 'south-pacific-islands', name: 'South Pacific Islands', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['Fiji','French Polynesia','Samoa','Tonga','Cook Islands','New Caledonia','Vanuatu'], centroidLat: -17.5, centroidLon: 178.0, focusZoom: 4 },
  { slug: 'pacific-northwest-california-coast', name: 'Pacific Northwest & California Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [10,11,12,1,2,3,4], seasonNote: '', countries: ['United States','Canada'], centroidLat: 42.0, centroidLon: -124.0, focusZoom: 4 },
  { slug: 'baja-mexico-pacific', name: 'Baja & Mexico Pacific Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [5,6,7,8,9,10], seasonNote: '', countries: ['Mexico'], centroidLat: 24.0, centroidLon: -109.0, focusZoom: 5 },
  { slug: 'central-america-pacific', name: 'Central America Pacific Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['Guatemala','El Salvador','Nicaragua','Costa Rica','Panama'], centroidLat: 11.0, centroidLon: -85.0, focusZoom: 6 },
  { slug: 'south-america-pacific', name: 'South America Pacific Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['Ecuador','Peru','Chile'], centroidLat: -15.0, centroidLon: -76.0, focusZoom: 4 },
  { slug: 'japan-coast', name: 'Japan Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [8,9,10,11], seasonNote: '', countries: ['Japan'], centroidLat: 35.0, centroidLon: 138.0, focusZoom: 5 },
  { slug: 'philippines-taiwan', name: 'Philippines & Taiwan Archipelago', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [8,9,10,11,12], seasonNote: '', countries: ['Philippines','Taiwan'], centroidLat: 13.0, centroidLon: 122.0, focusZoom: 5 },
  { slug: 'indonesia-archipelago', name: 'Indonesia Archipelago', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['Indonesia'], centroidLat: -5.0, centroidLon: 115.0, focusZoom: 5 },
  { slug: 'southeast-asia-mainland', name: 'Southeast Asia Mainland Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [5,6,7,8,9,10], seasonNote: '', countries: ['Vietnam','Thailand','Malaysia','Myanmar','Cambodia'], centroidLat: 13.0, centroidLon: 104.0, focusZoom: 5 },
  { slug: 'east-australia-coast', name: 'East Australia Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [3,4,5,6,7,8,9], seasonNote: '', countries: ['Australia'], centroidLat: -28.0, centroidLon: 153.5, focusZoom: 5 },
  { slug: 'west-australia-coast', name: 'West Australia Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['Australia'], centroidLat: -25.0, centroidLon: 114.0, focusZoom: 5 },
  { slug: 'south-australia-coast', name: 'South Australia Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [3,4,5,6,7,8,9,10], seasonNote: '', countries: ['Australia'], centroidLat: -38.0, centroidLon: 145.0, focusZoom: 5 },
  { slug: 'new-zealand-coast', name: 'New Zealand Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [3,4,5,6,7,8,9,10], seasonNote: '', countries: ['New Zealand'], centroidLat: -41.0, centroidLon: 174.0, focusZoom: 5 },
  { slug: 'atlantic-canada-new-england', name: 'Atlantic Canada & New England Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [9,10,11,12,1,2,3], seasonNote: '', countries: ['United States','Canada'], centroidLat: 43.5, centroidLon: -69.0, focusZoom: 5 },
  { slug: 'us-mid-atlantic-southeast', name: 'US Mid-Atlantic & Southeast Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [9,10,11,12,1,2,3,4], seasonNote: '', countries: ['United States'], centroidLat: 33.0, centroidLon: -77.5, focusZoom: 5 },
  { slug: 'caribbean-islands', name: 'Caribbean Islands', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [11,12,1,2,3,4], seasonNote: '', countries: ['Barbados','Puerto Rico','Dominican Republic','Jamaica','Bahamas'], centroidLat: 17.0, centroidLon: -65.0, focusZoom: 5 },
  { slug: 'atlantic-south-america', name: 'Atlantic South America', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9], seasonNote: '', countries: ['Brazil','Uruguay','Argentina'], centroidLat: -20.0, centroidLon: -40.0, focusZoom: 4 },
  { slug: 'atlantic-europe', name: 'Atlantic Europe', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [9,10,11,12,1,2,3], seasonNote: '', countries: ['Portugal','Spain','France','United Kingdom','Ireland','Netherlands'], centroidLat: 44.0, centroidLon: -5.0, focusZoom: 5 },
  { slug: 'north-atlantic-arctic', name: 'North Atlantic & Arctic', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [9,10,11,12,1,2,3], seasonNote: '', countries: ['Iceland','Norway','Faroe Islands','United Kingdom'], centroidLat: 65.0, centroidLon: -18.0, focusZoom: 4 },
  { slug: 'west-african-atlantic', name: 'West African Atlantic Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [10,11,12,1,2,3,4], seasonNote: '', countries: ['Morocco','Senegal','Cape Verde','Mauritania','Ghana','Liberia','Sierra Leone'], centroidLat: 20.0, centroidLon: -16.0, focusZoom: 4 },
  { slug: 'southern-african-coast', name: 'Southern African Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['South Africa','Namibia','Mozambique'], centroidLat: -32.0, centroidLon: 22.0, focusZoom: 5 },
  { slug: 'indian-ocean-east-africa', name: 'Indian Ocean Islands & East Africa', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [5,6,7,8,9,10], seasonNote: '', countries: ['Madagascar','Réunion','Mauritius','Kenya','Tanzania'], centroidLat: -15.0, centroidLon: 55.0, focusZoom: 4 },
  { slug: 'south-asia-coast', name: 'South Asia Coast', type: 'surf', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [4,5,6,7,8,9,10], seasonNote: '', countries: ['Sri Lanka','Maldives','India'], centroidLat: 8.0, centroidLon: 79.0, focusZoom: 5 },

  // SKI REGIONS (21)
  { slug: 'french-alps', name: 'French Alps', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['France'], centroidLat: 45.6, centroidLon: 6.5, focusZoom: 7 },
  { slug: 'swiss-alps', name: 'Swiss Alps', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['Switzerland'], centroidLat: 46.5, centroidLon: 8.5, focusZoom: 7 },
  { slug: 'austrian-alps', name: 'Austrian Alps', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['Austria'], centroidLat: 47.3, centroidLon: 12.5, focusZoom: 7 },
  { slug: 'italian-alps-dolomites', name: 'Italian Alps & Dolomites', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['Italy'], centroidLat: 46.2, centroidLon: 11.5, focusZoom: 7 },
  { slug: 'pyrenees', name: 'Pyrenees', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['France','Spain','Andorra'], centroidLat: 42.6, centroidLon: 1.0, focusZoom: 6 },
  { slug: 'scandinavian-mountains', name: 'Scandinavian Mountains', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4,5], seasonNote: '', countries: ['Norway','Sweden','Finland'], centroidLat: 64.0, centroidLon: 16.0, focusZoom: 5 },
  { slug: 'carpathians-balkans', name: 'Carpathians & Balkans', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3], seasonNote: '', countries: ['Romania','Bulgaria','Poland','Slovakia','Slovenia','Czech Republic'], centroidLat: 46.0, centroidLon: 24.0, focusZoom: 5 },
  { slug: 'caucasus', name: 'Caucasus', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['Georgia','Russia','Turkey','Armenia'], centroidLat: 42.5, centroidLon: 44.0, focusZoom: 5 },
  { slug: 'us-rocky-mountains', name: 'US Rocky Mountains', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['United States'], centroidLat: 40.0, centroidLon: -109.0, focusZoom: 5 },
  { slug: 'sierra-nevada-cascades', name: 'Sierra Nevada & Cascades', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['United States'], centroidLat: 40.0, centroidLon: -121.0, focusZoom: 5 },
  { slug: 'appalachians', name: 'Appalachians', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3], seasonNote: '', countries: ['United States','Canada'], centroidLat: 44.0, centroidLon: -72.0, focusZoom: 5 },
  { slug: 'canadian-rockies-coast', name: 'Canadian Rockies & Coast Mountains', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['Canada'], centroidLat: 51.0, centroidLon: -117.0, focusZoom: 4 },
  { slug: 'eastern-canadian-shield', name: 'Eastern Canadian Shield', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3], seasonNote: '', countries: ['Canada'], centroidLat: 47.0, centroidLon: -72.0, focusZoom: 5 },
  { slug: 'alaska-range-chugach', name: 'Alaska Range & Chugach', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [2,3,4,5], seasonNote: '', countries: ['United States'], centroidLat: 61.0, centroidLon: -148.0, focusZoom: 5 },
  { slug: 'japanese-alps-hokkaido', name: 'Japanese Alps & Hokkaido', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3], seasonNote: '', countries: ['Japan'], centroidLat: 43.0, centroidLon: 142.5, focusZoom: 5 },
  { slug: 'korean-peninsula', name: 'Korean Peninsula', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2], seasonNote: '', countries: ['South Korea'], centroidLat: 37.5, centroidLon: 128.5, focusZoom: 6 },
  { slug: 'chinese-northeast-xinjiang', name: 'Chinese Northeast & Xinjiang', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3], seasonNote: '', countries: ['China'], centroidLat: 44.0, centroidLon: 86.0, focusZoom: 4 },
  { slug: 'central-asian-ranges', name: 'Central Asian Ranges', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [12,1,2,3,4], seasonNote: '', countries: ['Kazakhstan','Kyrgyzstan','Uzbekistan','Tajikistan','Iran'], centroidLat: 42.0, centroidLon: 77.0, focusZoom: 5 },
  { slug: 'himalaya-nepal-india', name: 'Indian & Nepali Himalaya', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [1,2,3], seasonNote: '', countries: ['India','Nepal','Bhutan'], centroidLat: 28.0, centroidLon: 85.0, focusZoom: 5 },
  { slug: 'andes', name: 'Andes', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [6,7,8,9], seasonNote: '', countries: ['Chile','Argentina','Peru','Bolivia'], centroidLat: -35.0, centroidLon: -70.0, focusZoom: 4 },
  { slug: 'australian-nz-alps', name: 'Australian Alps & NZ Southern Alps', type: 'ski', shortDescription: '', longDescription: '', heroImage: '', bestMonths: [6,7,8,9], seasonNote: '', countries: ['Australia','New Zealand'], centroidLat: -42.5, centroidLon: 170.0, focusZoom: 5 },
];
