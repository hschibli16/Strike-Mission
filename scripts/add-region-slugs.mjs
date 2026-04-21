import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const spotsPath = path.join(__dirname, '../app/spots.ts');

const SPOT_REGION_MAP = {
  // SURF
  'pipeline': 'hawaii',
  'cloudbreak': 'south-pacific-islands',
  'teahupoo': 'south-pacific-islands',
  'mavericks': 'pacific-northwest-california-coast',
  'trestles': 'pacific-northwest-california-coast',
  'puerto-escondido': 'baja-mexico-pacific',
  'salina-cruz': 'baja-mexico-pacific',
  'pavones': 'central-america-pacific',
  'playa-hermosa-cr': 'central-america-pacific',
  'playa-hermosa': 'central-america-pacific',
  'witch-rock': 'central-america-pacific',
  'witchs-rock': 'central-america-pacific',
  'chicama': 'south-america-pacific',
  'punta-de-lobos': 'south-america-pacific',
  'uluwatu': 'indonesia-archipelago',
  'padang-padang': 'indonesia-archipelago',
  'g-land': 'indonesia-archipelago',
  'desert-point': 'indonesia-archipelago',
  'lakey-peak': 'indonesia-archipelago',
  'mentawais': 'indonesia-archipelago',
  'lance-right': 'indonesia-archipelago',
  'lance-left': 'indonesia-archipelago',
  'siargao': 'philippines-taiwan',
  'snapper-rocks': 'east-australia-coast',
  'bells-beach': 'south-australia-coast',
  'raglan': 'new-zealand-coast',
  'cape-hatteras': 'us-mid-atlantic-southeast',
  'gloucester-cape-ann': 'atlantic-canada-new-england',
  'soup-bowls': 'caribbean-islands',
  'nazare': 'atlantic-europe',
  'ericeira': 'atlantic-europe',
  'mundaka': 'atlantic-europe',
  'hossegor': 'atlantic-europe',
  'bundoran': 'atlantic-europe',
  'anchor-point': 'west-african-atlantic',
  'skeleton-bay': 'southern-african-coast',
  'jeffreys-bay': 'southern-african-coast',
  'supertubes': 'southern-african-coast',
};

// US ski spots by slug override
const US_SKI_OVERRIDES = {
  'mammoth': 'sierra-nevada-cascades',
  'stowe': 'appalachians',
  'killington': 'appalachians',
  'sugarbush': 'appalachians',
  'jay-peak': 'appalachians',
  'alyeska': 'alaska-range-chugach',
  'alyeska-alaska': 'alaska-range-chugach',
  'taos': 'us-rocky-mountains',
};

// Canadian ski spots by slug override
const CANADIAN_SKI_OVERRIDES = {
  // all current Canadian spots are BC/Alberta → canadian-rockies-coast
};

function skiRegionFromSlugAndCountry(slug, country) {
  // Check US overrides first
  if (US_SKI_OVERRIDES[slug]) return US_SKI_OVERRIDES[slug];
  if (CANADIAN_SKI_OVERRIDES[slug]) return CANADIAN_SKI_OVERRIDES[slug];

  const c = (country || '').toLowerCase();
  if (c === 'france') return 'french-alps';
  if (c === 'switzerland') return 'swiss-alps';
  if (c === 'austria') return 'austrian-alps';
  if (c === 'italy') return 'italian-alps-dolomites';
  if (c === 'japan') return 'japanese-alps-hokkaido';
  if (c === 'canada') return 'canadian-rockies-coast';
  if (c === 'chile' || c === 'argentina') return 'andes';
  if (c === 'australia') return 'australian-nz-alps';
  if (c === 'new zealand') return 'australian-nz-alps';
  if (c === 'norway' || c === 'sweden' || c === 'finland') return 'scandinavian-mountains';
  if (c === 'usa' || c === 'united states') return 'us-rocky-mountains';
  return 'us-rocky-mountains';
}

let content = fs.readFileSync(spotsPath, 'utf8');

// Split into logical "spot blocks" by finding slug: '...' occurrences
// We'll do a global regex replacement inserting regionSlug after each slug line (if not already present)

// First pass: collect all slug → country mappings so we can determine ski regions
const slugCountryMap = {};
const slugCountryRegex = /slug:\s*['"]([^'"]+)['"]\s*,\s*\n(?:[^}]*?\n)*?\s*country:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = slugCountryRegex.exec(content)) !== null) {
  slugCountryMap[m[1]] = m[2];
}

let surfUpdated = 0;
let skiUpdated = 0;
let skipped = 0;

// For each spot block (identified by "slug: 'xxx',"), inject regionSlug after the slug line if not present
// We process line by line to avoid regex complexity
const lines = content.split('\n');
const result = [];
let i = 0;
while (i < lines.length) {
  const line = lines[i];
  const slugMatch = line.match(/^(\s*)slug:\s*['"]([^'"]+)['"]\s*,\s*$/);
  if (slugMatch) {
    result.push(line);
    const indent = slugMatch[1];
    const slug = slugMatch[2];
    // Check if regionSlug already on next line
    const nextLine = lines[i + 1] || '';
    if (nextLine.includes('regionSlug:')) {
      skipped++;
      i++;
      continue;
    }
    // Look up region
    const region = SPOT_REGION_MAP[slug];
    if (region) {
      result.push(`${indent}regionSlug: '${region}',`);
      surfUpdated++;
    } else {
      // Try ski lookup
      const country = slugCountryMap[slug] || '';
      const skiRegion = skiRegionFromSlugAndCountry(slug, country);
      result.push(`${indent}regionSlug: '${skiRegion}',`);
      skiUpdated++;
    }
    i++;
    continue;
  }
  result.push(line);
  i++;
}

fs.writeFileSync(spotsPath, result.join('\n'), 'utf8');
console.log(`Done! Updated ${surfUpdated} surf spots, ${skiUpdated} ski spots. ${skipped} spots skipped (already had regionSlug).`);
console.log(`Total updated: ${surfUpdated + skiUpdated}`);
