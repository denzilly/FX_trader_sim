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
    patienceMax: 10,
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
    patienceMax: 10,
    sizeMin: 1,
    sizeMax: 5,
    direction: 'buy',
    frequencyMin: 60,
    frequencyMax: 300,
    banksAskedMin: 3,
    banksAskedMax: 5,
  },
  {
    id: 'abc-capital',
    name: 'ABC Capital',
    competitiveness: 0.4,
    patienceMin: 5,
    patienceMax: 10,
    sizeMin: 10,
    sizeMax: 50,
    direction: 'both',
    frequencyMin: 20,
    frequencyMax: 60,
    banksAskedMin: 10,
    banksAskedMax: 20,
  },
];
