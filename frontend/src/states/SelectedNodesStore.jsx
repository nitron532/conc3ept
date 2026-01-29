import { create } from "zustand";

export const useSelectedNodesStore = create(set => ({
  selectedNodes: [],

  addNode: label =>
    set(state => ({
      selectedNodes: [...new Set([...state.selectedNodes, label])]
    })),

  removeNode: label =>
    set(state => ({
      selectedNodes: state.selectedNodes.filter(l => l !== label)
    })),

  clear: () => set({ selectedNodes: [] })
}));
