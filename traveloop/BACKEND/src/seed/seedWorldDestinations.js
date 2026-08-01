require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Destination = require('../models/Destination');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';
const LIMIT = parseInt(process.env.SEED_DESTINATION_LIMIT || '4000', 10);
const MIN_POPULATION = parseInt(process.env.SEED_MIN_POPULATION || '250000', 10);
const SOURCE = 'wikidata';

const CITY_TYPES = [
  'wd:Q515', // city
  'wd:Q5119', // capital city
  'wd:Q133442', // city-state
  'wd:Q174844', // megacity
  'wd:Q208511', // global city
  'wd:Q1549591', // big city
  'wd:Q3184121', // municipality of Brazil
  'wd:Q70208', // municipality of Switzerland
  'wd:Q15284', // municipality
  'wd:Q484170', // commune of France
];

const SPARQL_QUERY = `
SELECT DISTINCT ?item ?itemLabel ?countryLabel ?continentLabel ?pop ?coord ?image ?desc WHERE {
  ?item wdt:P31 ?type .
  VALUES ?type { ${CITY_TYPES.join(' ')} }
  ?item wdt:P17 ?country .
  OPTIONAL { ?item wdt:P30 ?continent . }
  OPTIONAL { ?item wdt:P1082 ?pop . }
  OPTIONAL { ?item wdt:P625 ?coord . }
  OPTIONAL { ?item wdt:P18 ?image . }
  OPTIONAL { ?item schema:description ?desc . FILTER(LANG(?desc) = "en") }
  FILTER(?pop > ${MIN_POPULATION})
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?pop)
LIMIT ${LIMIT}
`;

const popularityFromPopulation = (pop) => {
  const p = parseInt(pop, 10);
  if (!p || Number.isNaN(p)) return 1;
  return Math.min(100, Math.max(1, Math.round(10 * Math.sqrt(p / 1000000))));
};

const parseCoordinates = (wkt) => {
  if (!wkt) return { lat: null, lng: null };
  const match = wkt.match(/Point\(([^ ]+)\s+([^)]+)\)/);
  if (!match) return { lat: null, lng: null };
  return { lng: parseFloat(match[1]) || null, lat: parseFloat(match[2]) || null };
};

const normalizeImageUrl = (url) => {
  if (!url) return '';
  let normalized = url.replace(/^http:\/\//, 'https://');
  normalized += normalized.includes('?') ? '&width=1200' : '?width=1200';
  return normalized;
};

const fetchCities = async () => {
  const response = await axios.post(
    WIKIDATA_SPARQL_URL,
    SPARQL_QUERY,
    {
      headers: {
        'Content-Type': 'application/sparql-query',
        Accept: 'application/sparql-results+json',
        'User-Agent': 'TraveloopSeed/1.0 (destination seeding; contact: local project)',
      },
      timeout: 120000,
    }
  );
  return response.data?.results?.bindings || [];
};

const bindingValue = (binding, key) => binding?.[key]?.value || null;

const buildDestination = (binding) => {
  const coords = parseCoordinates(bindingValue(binding, 'coord'));
  const continent = bindingValue(binding, 'continentLabel');
  const tags = ['city'];
  if (continent) tags.push(continent.toLowerCase());

  return {
    name: bindingValue(binding, 'itemLabel'),
    country: bindingValue(binding, 'countryLabel'),
    city: bindingValue(binding, 'itemLabel'),
    description: bindingValue(binding, 'desc') || '',
    image: normalizeImageUrl(bindingValue(binding, 'image')),
    type: 'city',
    tags,
    rating: null,
    reviewCount: null,
    popularity: popularityFromPopulation(bindingValue(binding, 'pop')),
    estimatedBudget: { budget: null, mid: null, luxury: null, currency: 'USD' },
    location: coords,
    source: SOURCE,
  };
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/traveloop', {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Seeding destinations from Wikidata (limit: ${LIMIT})...`);

    const bindings = await fetchCities();
    console.log(`Fetched ${bindings.length} cities from Wikidata`);

    const seenItems = new Set();
    const uniqueBindings = bindings.filter((binding) => {
      const itemUri = binding?.item?.value;
      if (!itemUri || seenItems.has(itemUri)) return false;
      seenItems.add(itemUri);
      return true;
    });

    const docs = uniqueBindings
      .map(buildDestination)
      .filter((d) => d.name && d.country);

    await Destination.deleteMany({ source: SOURCE });
    const inserted = await Destination.insertMany(docs, { ordered: false });

    console.log(`Inserted ${inserted.length} destinations (source: ${SOURCE})`);
    await mongoose.connection.syncIndexes();
    console.log('Text search indexes synchronized');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
