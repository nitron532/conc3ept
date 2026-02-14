import { create } from 'zustand'

export const useQuestionStore = create((set) => ({
  question: {},
  setQuestion: () => set((state) => ({ question: state })),
  clearQuestion: () => set({ question: {} }),
}))

