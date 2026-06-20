'use client'

import { create } from 'zustand'

export interface ListItem {
  productId: string
  name: string
  price: number
  image: string
  size: string
  color: string
  quantity: number
}

interface StoreState {
  currentView: 'home' | 'product' | 'checkout'
  selectedProductId: string | null
  list: ListItem[]
  isListOpen: boolean
  setSelectedProduct: (id: string | null) => void
  goHome: () => void
  goCheckout: () => void
  addToList: (item: ListItem) => void
  removeFromList: (productId: string, size: string, color: string) => void
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void
  toggleList: () => void
  clearList: () => void
  listTotal: () => number
  listCount: () => number
}

export const useStore = create<StoreState>((set, get) => ({
  currentView: 'home',
  selectedProductId: null,
  list: [],
  isListOpen: false,

  setSelectedProduct: (id) =>
    set({ selectedProductId: id, currentView: 'product' }),

  goHome: () =>
    set({ selectedProductId: null, currentView: 'home' }),

  goCheckout: () =>
    set({ currentView: 'checkout' }),

  addToList: (item) =>
    set((state) => {
      const existing = state.list.find(
        (c) => c.productId === item.productId && c.size === item.size && c.color === item.color
      )
      if (existing) {
        return {
          list: state.list.map((c) =>
            c.productId === item.productId && c.size === item.size && c.color === item.color
              ? { ...c, quantity: c.quantity + item.quantity }
              : c
          ),
        }
      }
      return { list: [...state.list, item] }
    }),

  removeFromList: (productId, size, color) =>
    set((state) => ({
      list: state.list.filter(
        (c) => !(c.productId === productId && c.size === size && c.color === color)
      ),
    })),

  updateQuantity: (productId, size, color, quantity) =>
    set((state) => ({
      list: state.list.map((c) =>
        c.productId === productId && c.size === size && c.color === color
          ? { ...c, quantity }
          : c
      ),
    })),

  toggleList: () => set((state) => ({ isListOpen: !state.isListOpen })),
  clearList: () => set({ list: [] }),

  listTotal: () =>
    get().list.reduce((sum, item) => sum + item.price * item.quantity, 0),

  listCount: () =>
    get().list.reduce((sum, item) => sum + item.quantity, 0),
}))
