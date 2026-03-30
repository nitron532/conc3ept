import { create } from "zustand";

export const useSelectedItemsStore = create(set => ({
  selectedItems: [],

  addItem: itemObject =>
    set(state => ({
      selectedItems: [...new Set([...state.selectedItems, itemObject])]
    })),

  removeItem: itemObject =>
    //TODO might need to change this to support multiple types of items. what if a concept and a question have the same id?
    set(state => ({
      selectedItems: state.selectedItems.filter(o => o.id != itemObject.id && o.type === itemObject.type)
    })),

  clear: () => set({ selectedItems: [] })
}));
