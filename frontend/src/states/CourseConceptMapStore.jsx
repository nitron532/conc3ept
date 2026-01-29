import { create } from "zustand";

export const useCourseConceptMapStore = create(set => ({
  courseConceptMap: [],

  addNode: label =>
    set(state => ({
      courseConceptMap: [...new Set([...state.courseConceptMap, label])]
    })),

  removeNode: label =>
    set(state => ({
      courseConceptMap: state.courseConceptMap.filter(l => l !== label)
    })),

  clear: () => set({ courseConceptMap: [] })
}));
