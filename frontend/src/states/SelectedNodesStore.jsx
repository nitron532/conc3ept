import { create } from "zustand";

export const useSelectedNodesStore = create(set => ({
  selectedNodes: [],

  addNode: nodeObject =>
    set(state => ({
      selectedNodes: [...new Set([...state.selectedNodes, nodeObject])]
    })),

  removeNode: nodeObject =>
    set(state => ({
      selectedNodes: state.selectedNodes.filter(o => o.label !== nodeObject.label)
    })),

  clear: () => set({ selectedNodes: [] })
}));
