import { create } from "zustand";

export const useSelectedItemsStore = create(set => ({
  selectedItems: [],

  addItem: itemObject =>
    set(state => ({
      selectedItems: [...new Set([...state.selectedItems, itemObject])]
    })),

  removeItem: itemObject =>
    set(state => ({
      selectedItems: state.selectedItems.filter(o => o.id !== itemObject.id)
    })),

  clear: () => set({ selectedItems: [] })
}));
