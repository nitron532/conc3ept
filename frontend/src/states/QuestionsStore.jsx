import { create } from 'zustand'

//store to hold backend response questions

export const useQuestionsStore = create((set) => ({
  questions: [],
  setQuestions: questionList =>
    set(state =>({
      questions: questionList
    })),
  addQuestion: questionObject =>
    set(state => ({
      selectedNodes: [...new Set([...state.questions, questionObject])]
    })),
    clearQuestions: () => set({ questions: [] })
}))

