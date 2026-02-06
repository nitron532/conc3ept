import { create } from "zustand";

export const useCourseNodesStore = create(set => ({
  courseNodes: [],
  courseId: -1,

  setCourseId: courseId =>
    set({
        courseId: courseId
    }),
    
  setNodes: nodeList =>
    set(state =>({
      courseNodes: nodeList
    })),

  addNode: nodeObject =>
    set(state => ({
      courseNodes: ([...state.courseNodes, nodeObject])
    })),

  removeNode: nodeObject =>
    set(state => ({
      courseNodes: state.courseNodes.filter(o => o.label !== nodeObject.label)
    })),

  clear: () => set({ courseNodes: [] })
}));
