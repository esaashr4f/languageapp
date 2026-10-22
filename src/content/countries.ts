import type { CountryId } from '../state';

export interface Country {
  id: CountryId;
  flag: string;
  city: string;
  name: string;
  language: string;
  flight: string;
  available: boolean;
}

export const COUNTRIES: Country[] = [
  { id: 'spain', flag: '🇪🇸', city: 'Madrid', name: 'Spain', language: 'Spanish', flight: 'ZB101', available: true },
  { id: 'japan', flag: '🇯🇵', city: 'Tokyo', name: 'Japan', language: 'Japanese', flight: 'ZB202', available: false },
  { id: 'france', flag: '🇫🇷', city: 'Paris', name: 'France', language: 'French', flight: 'ZB303', available: false },
  { id: 'mexico', flag: '🇲🇽', city: 'Mexico City', name: 'Mexico', language: 'Spanish (Mexico)', flight: 'ZB404', available: false },
  { id: 'germany', flag: '🇩🇪', city: 'Berlin', name: 'Germany', language: 'German', flight: 'ZB505', available: false },
];
