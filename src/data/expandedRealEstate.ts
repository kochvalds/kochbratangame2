import { RealEstateProperty } from '../types/game';

const CITIES = [
  { city: 'Дубай, ОАЭ', tag: 'Villa', districts: ['Palm Jumeirah', 'Downtown Burj', 'Emirates Hills', 'Bulgari Mansions', 'Dubai Marina', 'Bluewaters Island', 'Jumeirah Bay'] },
  { city: 'Нью-Йорк, США', tag: 'Penthouse', districts: ['Billionaires Row', 'Tribeca', 'Central Park South', 'SoHo Cast Iron', 'Upper East Side', 'Hudson Yards', 'DUMBO Clocktower'] },
  { city: 'Монте-Карло, Монако', tag: 'Sky Duplex', districts: ['Port Hercule', 'Larvotto Beach', 'Avenue Princesse Grace', 'Tour Odéon', 'Carré d’Or', 'Fontvieille Harbor'] },
  { city: 'Лондон, Великобритания', tag: 'Mansion', districts: ['Mayfair', 'Knightsbridge', 'Belgravia', 'Kensington Palace Gardens', 'Chelsea Waterfront', 'Regent’s Park Outer Circle'] },
  { city: 'Токио, Япония', tag: 'Sky Villa', districts: ['Roppongi Hills', 'Ginza Central', 'Minato Sky Sanctuary', 'Shibuya Prime', 'Toranomon Hills', 'Aoyama Modern'] },
  { city: 'Париж, Франция', tag: 'Hôtel Particulier', districts: ['Avenue Montaigne', 'Champs-Élysées', 'Place Vendôme', 'Saint-Germain-des-Prés', 'Île Saint-Louis', 'Triangle d’Or'] },
  { city: 'Майами, США', tag: 'Waterfront Estate', districts: ['Star Island', 'Fisher Island', 'Indian Creek', 'Brickell Flatiron', 'South Beach Continuum', 'Sunny Isles Mansions'] },
  { city: 'Лос-Анджелес, США', tag: 'Hilltop Mansion', districts: ['Bel Air', 'Beverly Hills 90210', 'Malibu Carbon Beach', 'Hollywood Hills Bird Streets', 'Holmby Hills', 'Pacific Palisades'] },
  { city: 'Цюрих & Женева, Швейцария', tag: 'Lakeside Residence', districts: ['Lake Zurich Gold Coast', 'Cologny Waterfront', 'Zürichberg Prime', 'Geneva Old Town', 'Küssnacht Grand Villa'] },
  { city: 'Санкт-Мориц & Аспен, Альпы', tag: 'Alpine Chalet', districts: ['Suvretta Hill', 'Red Mountain Aspen', 'Corviglia Ski Chalet', 'Snowmass Peak Estate', 'Badrutt’s Palace Enclave'] },
  { city: 'Сингапур', tag: 'Bungalow', districts: ['Marina Bay Sands Sky Residence', 'Sentosa Cove Waterfront', 'Nassim Road Good Class', 'Orchard Boulevard', 'Claymore Hill'] },
  { city: 'Гонконг', tag: 'Peak Villa', districts: ['Victoria Peak', 'Deep Water Bay', 'Repulse Bay', 'Mount Nicholson', 'Mid-Levels Sky Haven'] },
  { city: 'Милан, Италия', tag: 'Attico', districts: ['Via Montenapoleone', 'Brera Historic', 'Quadrilatero della Moda', 'CityLife Penthouse', 'Porta Nuova Varesine'] },
  { city: 'Сидней, Австралия', tag: 'Harbour Estate', districts: ['Point Piper', 'Darling Point', 'Vaucluse Cliffside', 'Bondi Beachfront', 'Sydney Opera View Quay'] },
  { city: 'Сен-Тропе & Канны, Франция', tag: 'Riviera Palace', districts: ['Saint-Tropez Pampelonne', 'Cap d’Antibes Private Bay', 'Cannes La Croisette', 'Villefranche-sur-Mer', 'Cap Ferrat Peninsula'] }
];

const PROPERTY_TYPES = [
  'Royal Signature Villa',
  'Panoramic Sky Penthouse',
  'Waterfront Mega-Mansion',
  'Historic Architectural Residence',
  'Crown Jewel Duplex',
  'Private Beachfront Estate',
  'Infinity Pool Oasis',
  'Executive Luxury Suite',
  'Superyacht Mooring Residence',
  'Modernist Glass Pavilion',
  'Haute Couture Sky Flat',
  'Ultra-Secure Hillside Sanctuary',
  'Subterranean Cinema & Spa Estate',
  'Helipad Vineyard Chateau',
  'Penthouse with Rooftop Helipad',
  'Bespoke Designer Loft',
  'Classical Marble Villa',
  'Secluded Forest Sanctuary',
  'Minimalist Zen Haven',
  'High-Roller Presidential Suite'
];

export function generate300Properties(): RealEstateProperty[] {
  const result: RealEstateProperty[] = [];
  let idCounter = 1;

  for (let cIdx = 0; cIdx < CITIES.length; cIdx++) {
    const loc = CITIES[cIdx];

    for (let pIdx = 0; pIdx < 20; pIdx++) {
      const typeName = PROPERTY_TYPES[pIdx % PROPERTY_TYPES.length];
      const district = loc.districts[pIdx % loc.districts.length];
      const name = `${typeName} #${idCounter} — ${district}`;

      // Scaled realistic luxury pricing between $1.2M and $95M
      const baseTier = (idCounter % 5) + 1; // 1 to 5
      const price = Math.round(
        (850000 * Math.pow(1.9, baseTier - 1) + (pIdx * 450000) + (cIdx * 320000)) / 10000
      ) * 10000;

      // Monthly rental yield: approx 6.5% to 8.5% annual return
      const monthlyRental = Math.round((price * (0.0055 + (pIdx % 4) * 0.0006)) / 100) * 100;
      const appreciation = Number((0.035 + (pIdx % 5) * 0.008).toFixed(3));

      result.push({
        id: `prop_world_${idCounter}`,
        name,
        location: `${district}, ${loc.city}`,
        city: loc.city,
        price,
        monthlyRentalYield: monthlyRental,
        appreciationRate: appreciation,
        isOwned: idCounter === 1 ? false : false,
        imageTag: loc.tag,
        description: `Премиальный объект в престижном районе ${district}. Частный консьерж-сервис, винный погреб, охрана 24/7 и панорамный вид.`
      });

      idCounter++;
    }
  }

  return result;
}

export const EXPANDED_300_REAL_ESTATE: RealEstateProperty[] = generate300Properties();
