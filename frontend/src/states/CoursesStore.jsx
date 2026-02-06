import { create } from "zustand";

export const useCoursesStore = create(set => ({
  courseList: [],
    
  setCourses: courseList =>
    set(state =>({
      courseList: courseList
    })),

  addNode: courseObject =>
    set(state => ({
      courseList: ([...state.courseList, courseObject])
    })),

  removeNode: courseObject =>
    set(state => ({
      courseList: state.courseList.filter(o => o.label !== courseObject.label)
    })),

  clear: () => set({ courseList: [] })
}));
