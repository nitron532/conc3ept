import { create } from "zustand";

export const useCourseEdgesStore = create((set) => ({
  courseId: -1,
  courseEdges: [],

  setCourseId: (courseId) =>
    set({
      courseId: courseId,
    }),

  setEdges: (edgeList) =>
    set({
      courseEdges: edgeList,
    }),

  addEdge: (edgeObject) =>
    set((state) => ({
      courseEdges: [...state.courseEdges, edgeObject],
    })),

  removeEdge: (edgeObject) =>
    set((state) => ({
      courseEdges: state.courseEdges.filter(
        (o) => o.source !== edgeObject.id && o.target !== edgeObject.id,
      ),
    })),

  clear: () => set({ courseEdges: [] }),
}));
