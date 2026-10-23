import type { GameState } from '../../state';

// Madrid in the phone's map: real places, laid out roughly as they sit in the city.
// You see an area once OMNI has a relay close enough to it (in the story: reclaiming a
// relay gives OMNI eyes on the streets around it).

export interface Area {
  id: string;
  name: string;
  blurb: string;
  /** Grid position on the phone map (5 columns x 4 rows). */
  col: number;
  row: number;
  w?: number;
  h?: number;
  /** The flag that reveals it; omitted = known from the start. */
  revealedBy?: string;
}

export const MADRID: Area[] = [
  { id: 'debod', name: 'Templo de Debod', blurb: 'An Egyptian temple on a hill, the best sunsets in Madrid.', col: 0, row: 0 },
  { id: 'granvia', name: 'Gran Vía', blurb: 'Theatres, neon and shopping. Every sign has gone red.', col: 1, row: 0, w: 2 },
  { id: 'malasana', name: 'Malasaña', blurb: 'Bars, vintage shops, the old heart of la Movida.', col: 3, row: 0 },
  { id: 'palacio', name: 'Palacio Real', blurb: 'The Royal Palace and its gardens.', col: 0, row: 1 },
  { id: 'plazamayor', name: 'Plaza Mayor', blurb: 'The grand old square. Thick with static.', col: 1, row: 1, revealedBy: 'relayMercado' },
  { id: 'sol', name: 'Puerta del Sol', blurb: 'Kilometre zero, where every road in Spain starts.', col: 2, row: 1, revealedBy: 'relayMercado' },
  { id: 'letras', name: 'Barrio de las Letras', blurb: 'Where Cervantes lived. Quotes are painted on the streets.', col: 3, row: 1 },
  { id: 'retiro', name: 'El Retiro', blurb: 'The great park, its lake and the Crystal Palace.', col: 4, row: 0, h: 3 },
  { id: 'latina', name: 'La Latina', blurb: 'Tapas, Sunday flea market (El Rastro) and narrow streets.', col: 0, row: 2, revealedBy: 'relayMercado' },
  { id: 'mercado', name: 'Mercado de la Luz', blurb: 'The market where it all started.', col: 1, row: 2 },
  { id: 'lavapies', name: 'Lavapiés', blurb: 'Madrid\'s most international neighbourhood.', col: 2, row: 2, w: 2 },
  { id: 'barajas', name: 'Aeropuerto (Barajas)', blurb: 'Where you landed. The borders are locked until Spain is free.', col: 0, row: 3, w: 5 },
];

export type AreaStatus = 'here' | 'free' | 'static' | 'unknown' | 'locked';

export function areaStatus(area: Area, state: GameState): AreaStatus {
  if (area.id === 'mercado') return 'here';
  if (area.id === 'barajas') return 'locked';
  if (area.revealedBy && state.flags[area.revealedBy]) return 'static';
  return 'unknown';
}
