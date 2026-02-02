/**
 * Client System
 * Manages client behaviors and trade requests
 */

export interface Client {
  id: string;
  name: string;
  competitiveness: number; // 0-1, willingness to trade at given price
  patienceMin: number; // seconds
  patienceMax: number;
  sizeMin: number; // millions
  sizeMax: number;
  direction: 'buy' | 'sell' | 'both';
  frequencyMin: number; // seconds between requests
  frequencyMax: number;
  banksAskedMin: number; // for market impact calculation
  banksAskedMax: number;
}

export interface TradeRequest {
  id: string;
  client: Client;
  side: 'buy' | 'sell';
  size: number;
  requestTime: number;
  expiryTime: number;
  status: 'pending' | 'quoted' | 'done' | 'rejected' | 'expired';
  type: 'electronic' | 'voice';
  quotedPrice?: number;
}

// Sample clients for initial development
export const SAMPLE_CLIENTS: Client[] = [
  {
    id: 'macrohard',
    name: 'MacroHard Corp',
    competitiveness: 0.7,
    patienceMin: 5,
    patienceMax: 15,
    sizeMin: 5,
    sizeMax: 25,
    direction: 'both',
    frequencyMin: 30,
    frequencyMax: 120,
    banksAskedMin: 5,
    banksAskedMax: 15,
  },
  {
    id: 'bills-bakery',
    name: "Bill's Bakery",
    competitiveness: 0.9,
    patienceMin: 5,
    patienceMax: 15,
    sizeMin: 1,
    sizeMax: 5,
    direction: 'buy',
    frequencyMin: 60,
    frequencyMax: 300,
    banksAskedMin: 1,
    banksAskedMax: 1,
  },
  {
    id: 'abc-capital',
    name: 'ABC Capital',
    competitiveness: 0.4,
    patienceMin: 5,
    patienceMax: 15,
    sizeMin: 10,
    sizeMax: 50,
    direction: 'both',
    frequencyMin: 20,
    frequencyMax: 60,
    banksAskedMin: 10,
    banksAskedMax: 20,
  },
  {
    id: 'eurotech-ag',
    name: 'EuroTech AG',
    competitiveness: 0.8,
    patienceMin: 3,
    patienceMax: 10,
    sizeMin: 2,
    sizeMax: 10,
    direction: 'sell',
    frequencyMin: 45,
    frequencyMax: 180,
    banksAskedMin: 2,
    banksAskedMax: 5,
  },
  {
    id: 'pacific-trading',
    name: 'Pacific Trading Co',
    competitiveness: 0.5,
    patienceMin: 8,
    patienceMax: 20,
    sizeMin: 15,
    sizeMax: 40,
    direction: 'both',
    frequencyMin: 40,
    frequencyMax: 150,
    banksAskedMin: 8,
    banksAskedMax: 15,
  },
  {
    id: 'momentum-fund',
    name: 'Momentum Fund LP',
    competitiveness: 0.3,
    patienceMin: 2,
    patienceMax: 8,
    sizeMin: 20,
    sizeMax: 50,
    direction: 'both',
    frequencyMin: 15,
    frequencyMax: 45,
    banksAskedMin: 12,
    banksAskedMax: 20,
  },
  {
    id: 'casa-del-vino',
    name: 'Casa del Vino',
    competitiveness: 0.95,
    patienceMin: 10,
    patienceMax: 30,
    sizeMin: 1,
    sizeMax: 3,
    direction: 'buy',
    frequencyMin: 90,
    frequencyMax: 360,
    banksAskedMin: 1,
    banksAskedMax: 2,
  },
  {
    id: 'nordic-pension',
    name: 'Nordic Pension Fund',
    competitiveness: 0.6,
    patienceMin: 10,
    patienceMax: 25,
    sizeMin: 25,
    sizeMax: 50,
    direction: 'both',
    frequencyMin: 60,
    frequencyMax: 240,
    banksAskedMin: 6,
    banksAskedMax: 12,
  },
  {
    id: 'rapid-arb',
    name: 'Rapid Arb Systems',
    competitiveness: 0.2,
    patienceMin: 2,
    patienceMax: 8,
    sizeMin: 5,
    sizeMax: 15,
    direction: 'both',
    frequencyMin: 10,
    frequencyMax: 30,
    banksAskedMin: 15,
    banksAskedMax: 20,
  },
  {
    id: 'schmidt-motors',
    name: 'Schmidt Motors GmbH',
    competitiveness: 0.75,
    patienceMin: 5,
    patienceMax: 15,
    sizeMin: 3,
    sizeMax: 12,
    direction: 'sell',
    frequencyMin: 50,
    frequencyMax: 200,
    banksAskedMin: 3,
    banksAskedMax: 8,
  },
];
