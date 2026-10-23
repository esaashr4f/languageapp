export type ItemId = 'churros' | 'paella';

export interface ItemDef {
  name: string;
  icon: string;
  desc: string;
}

export const ITEMS: Record<ItemId, ItemDef> = {
  churros: { name: 'Churros', icon: '🥖', desc: '+8 seconds on your next answer' },
  paella: { name: 'Paella', icon: '🥘', desc: 'Restores 15 voice' },
};
