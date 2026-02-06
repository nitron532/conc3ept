import { create } from "zustand";

export const useCourseEdgesStore = create(set => ({
  courseId: -1,
  courseEdges: [],

  setCourseId: courseId =>
    set({
        courseId: courseId
    }),

  setEdges: edgeList =>
    set({
      courseEdges: edgeList
    }),

  addNode: edgeObject =>
    set(state => ({
      courseEdges: ([...state.courseEdges, edgeObject])
    })),

  removeNode: edgeObject =>
    set(state => ({
      courseEdges: state.courseEdges.filter(o => o.label !== edgeObject.label)
    })),

  clear: () => set({ courseEdges: [] })
}));
