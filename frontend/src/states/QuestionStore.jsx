import { create } from 'zustand'

export const useQuestionStore = create((set) => ({
  question: {},
  setQuestion: (state) => set({ question: state }),
  clearQuestion: () => set({ question: {} }),
}))

