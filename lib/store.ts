"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Podcast, Video, Ebook, PhysicalBook, Order, EbookOrder, SiteSettings, UpcomingProgram, HeroSlide, ContactMessage } from './types'
import { mockSiteSettings, shippingFees as defaultShippingFees } from './mock-data'
import { api } from './api'

// Admin credentials type
export interface AdminCredentials {
  email: string
  password: string
}

// Notification type
export interface Notification {
  id: string
  type: 'order' | 'payment' | 'info'
  title: string
  message: string
  orderId?: string
  read: boolean
  createdAt: string
}

// Store state type
interface StoreState {
  // Data
  podcasts: Podcast[]
  videos: Video[]
  ebooks: Ebook[]
  physicalBooks: PhysicalBook[]
  orders: Order[]
  ebookOrders: EbookOrder[]
  siteSettings: SiteSettings
  shippingFees: { france: number; benin: number }
  notifications: Notification[]
  upcomingPrograms: UpcomingProgram[]
  heroSlides: HeroSlide[]
  contactMessages: ContactMessage[]
  isApiLoading: boolean
  apiError: string | null
  loadApiData: () => Promise<void>
  
  // Auth
  isAdminAuthenticated: boolean
  adminEmail: string | null
  
  // Podcast actions
  addPodcast: (podcast: Omit<Podcast, 'id'>) => void
  updatePodcast: (id: string, podcast: Partial<Podcast>) => void
  deletePodcast: (id: string) => void
  
  // Video actions
  addVideo: (video: Omit<Video, 'id'>) => void
  updateVideo: (id: string, video: Partial<Video>) => void
  deleteVideo: (id: string) => void
  
  // Ebook actions
  addEbook: (ebook: Omit<Ebook, 'id'>) => void
  updateEbook: (id: string, ebook: Partial<Ebook>) => void
  deleteEbook: (id: string) => void
  
  // Physical Book actions
  addPhysicalBook: (book: Omit<PhysicalBook, 'id'>) => void
  updatePhysicalBook: (id: string, book: Partial<PhysicalBook>) => void
  deletePhysicalBook: (id: string) => void
  updateBookStock: (id: string, quantityChange: number) => void
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => string
  updateOrderStatus: (id: string, status: Order['status']) => void
  updateOrderDeliveryStep: (id: string, step: 1 | 2 | 3) => void
  getOrderById: (id: string) => Order | undefined
  
  // Ebook Order actions
  addEbookOrder: (order: Omit<EbookOrder, 'id' | 'createdAt'>) => string
  updateEbookOrderStatus: (id: string, status: EbookOrder['status']) => void
  getEbookOrderById: (id: string) => EbookOrder | undefined
  
  // Settings actions
  updateSiteSettings: (settings: Partial<SiteSettings>) => void
  updateShippingFees: (fees: { france?: number; benin?: number }) => void
  
  // Upcoming Program actions
  addUpcomingProgram: (program: Omit<UpcomingProgram, 'id'>) => void
  updateUpcomingProgram: (id: string, program: Partial<UpcomingProgram>) => void
  deleteUpcomingProgram: (id: string) => void
  
  // Hero Slide actions
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => void
  updateHeroSlide: (id: string, slide: Partial<HeroSlide>) => void
  deleteHeroSlide: (id: string) => void
  toggleHeroSlideActive: (id: string) => void
  
  // Contact Message actions
  addContactMessage: (message: Omit<ContactMessage, 'id' | 'createdAt' | 'isRead'>) => void
  markContactMessageRead: (id: string) => void
  deleteContactMessage: (id: string) => void
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  getUnreadCount: () => number
  
  // Auth actions
  login: (email: string, password: string) => boolean
  logout: () => void
}

// Default admin credentials (in production, use environment variables and proper auth)
const DEFAULT_ADMIN_EMAIL = 'admin@ccr.com'
const DEFAULT_ADMIN_PASSWORD = 'admin123'

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial data
      podcasts: [],
      videos: [],
      ebooks: [],
      physicalBooks: [],
      orders: [],
      ebookOrders: [],
      siteSettings: mockSiteSettings,
      shippingFees: defaultShippingFees,
      notifications: [],
      upcomingPrograms: [],
      heroSlides: [],
      contactMessages: [],
      isApiLoading: false,
      apiError: null,
      
      // Auth state
      isAdminAuthenticated: false,
      adminEmail: null,
      
      // Podcast actions
      loadApiData: async () => {
        set({ isApiLoading: true, apiError: null })
        try {
          const [podcasts, videos, ebooks, physicalBooks, upcomingPrograms, heroSlides] = await Promise.all([
            api.list<Podcast>('/podcasts'),
            api.list<Video>('/videos'),
            api.list<Ebook>('/ebooks'),
            api.list<PhysicalBook>('/physical-books'),
            api.list<UpcomingProgram>('/programs'),
            api.list<HeroSlide>('/hero-slides'),
          ])
          set({ podcasts, videos, ebooks, physicalBooks, upcomingPrograms, heroSlides, isApiLoading: false })
        } catch (error) {
          set({ apiError: error instanceof Error ? error.message : 'Erreur API', isApiLoading: false })
        }
      },
      
      addPodcast: async (podcast) => {
        const created = await api.create<Podcast, Omit<Podcast, 'id'>>('/podcasts', podcast)
        set((state) => ({ podcasts: [created, ...state.podcasts] }))
      },
      
      updatePodcast: async (id, podcast) => {
        const updated = await api.update<Podcast, Partial<Podcast>>('/podcasts', id, podcast)
        set((state) => ({ podcasts: state.podcasts.map(p => p.id === id ? updated : p) }))
      },
      
      deletePodcast: async (id) => {
        await api.delete('/podcasts', id)
        set((state) => ({ podcasts: state.podcasts.filter(p => p.id !== id) }))
      },
      
      // Video actions
      addVideo: async (video) => {
        const created = await api.create<Video, Omit<Video, 'id'>>('/videos', video)
        set((state) => ({ videos: [created, ...state.videos] }))
      },
      
      updateVideo: async (id, video) => {
        const updated = await api.update<Video, Partial<Video>>('/videos', id, video)
        set((state) => ({ videos: state.videos.map(v => v.id === id ? updated : v) }))
      },
      
      deleteVideo: async (id) => {
        await api.delete('/videos', id)
        set((state) => ({ videos: state.videos.filter(v => v.id !== id) }))
      },
      
      // Ebook actions
      addEbook: async (ebook) => {
        const created = await api.create<Ebook, Omit<Ebook, 'id'>>('/ebooks', ebook)
        set((state) => ({ ebooks: [created, ...state.ebooks] }))
      },
      
      updateEbook: async (id, ebook) => {
        const updated = await api.update<Ebook, Partial<Ebook>>('/ebooks', id, ebook)
        set((state) => ({ ebooks: state.ebooks.map(e => e.id === id ? updated : e) }))
      },
      
      deleteEbook: async (id) => {
        await api.delete('/ebooks', id)
        set((state) => ({ ebooks: state.ebooks.filter(e => e.id !== id) }))
      },
      
      // Physical Book actions
      addPhysicalBook: async (book) => {
        const created = await api.create<PhysicalBook, Omit<PhysicalBook, 'id'>>('/physical-books', book)
        set((state) => ({ physicalBooks: [created, ...state.physicalBooks] }))
      },
      
      updatePhysicalBook: async (id, book) => {
        const updated = await api.update<PhysicalBook, Partial<PhysicalBook>>('/physical-books', id, book)
        set((state) => ({ physicalBooks: state.physicalBooks.map(b => b.id === id ? updated : b) }))
      },
      
      deletePhysicalBook: async (id) => {
        await api.delete('/physical-books', id)
        set((state) => ({ physicalBooks: state.physicalBooks.filter(b => b.id !== id) }))
      },
      
      updateBookStock: (id, quantityChange) => set((state) => ({
        physicalBooks: state.physicalBooks.map(b => 
          b.id === id ? { ...b, stock: Math.max(0, b.stock + quantityChange) } : b
        )
      })),
      
      // Order actions
      addOrder: (order) => {
        const id = `ORD-${Date.now()}`
        const newOrder: Order = {
          ...order,
          id,
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          orders: [newOrder, ...state.orders]
        }))
        
        // Add notification for admin
        get().addNotification({
          type: 'order',
          title: 'Nouvelle commande',
          message: `Commande ${id} de ${order.userName} - ${order.totalAmount.toFixed(2)} EUR`,
          orderId: id
        })
        
        // Update stock for ordered items
        order.items.forEach(item => {
          get().updateBookStock(item.bookId, -item.quantity)
        })
        
        return id
      },
      
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
        }))
        
        const order = get().orders.find(o => o.id === id)
        if (order) {
          get().addNotification({
            type: 'info',
            title: 'Statut mis a jour',
            message: `Commande ${id} - Statut: ${status === 'en_attente' ? 'En attente' : status === 'paye' ? 'Paye' : 'Livre'}`,
            orderId: id
          })
        }
      },

      updateOrderDeliveryStep: (id, step) => {
        const now = new Date().toISOString()

        const updateOrder = (order: Order): Order => {
          const currentStep = order.deliveryStep ?? 0
          let newStep: 1 | 2 | 3 | undefined = order.deliveryStep
          let newStatus = order.status
          const updatedAt = { ...(order.stepUpdatedAt ?? {}) }

          if (currentStep >= step) {
            if (step === 1) {
              newStep = undefined
              delete updatedAt.step1
              delete updatedAt.step2
              delete updatedAt.step3
              newStatus = "en_attente"
            } else if (step === 2) {
              newStep = 1
              delete updatedAt.step2
              delete updatedAt.step3
              newStatus = order.status === "livre" ? "paye" : order.status
            } else {
              newStep = 2
              delete updatedAt.step3
              newStatus = order.status === "livre" ? "paye" : order.status
            }
          } else {
            if (step === 1) {
              newStep = 1
              updatedAt.step1 = now
              newStatus = order.status === "en_attente" ? "paye" : order.status
            } else if (step === 2 && currentStep >= 1) {
              newStep = 2
              updatedAt.step2 = now
            } else if (step === 3 && currentStep >= 2) {
              newStep = 3
              updatedAt.step3 = now
              newStatus = "livre"
            } else {
              return order
            }
          }

          return { ...order, deliveryStep: newStep, stepUpdatedAt: updatedAt, status: newStatus }
        }

        set((state) => ({
          orders: state.orders.map(o => o.id === id ? updateOrder(o) : o)
        }))

        const order = get().orders.find(o => o.id === id)
        if (order) {
          get().addNotification({
            type: 'info',
            title: 'Suivi commande mis a jour',
            message: `Commande ${id} - Etape de livraison: ${order.deliveryStep ?? 0}/3`,
            orderId: id
          })
        }
      },
      
      getOrderById: (id) => get().orders.find(o => o.id === id),
      
      // Ebook Order actions
      addEbookOrder: (order) => {
        const id = `EBOOK-${Date.now()}`
        const newOrder: EbookOrder = {
          ...order,
          id,
          createdAt: new Date().toISOString()
        }
        
        set((state) => ({
          ebookOrders: [newOrder, ...state.ebookOrders]
        }))
        
        // Add notification for admin
        get().addNotification({
          type: 'order',
          title: 'Nouvelle commande e-book',
          message: `Commande ${id} de ${order.userName} - ${order.ebookTitle}`,
          orderId: id
        })
        
        return id
      },
      
      updateEbookOrderStatus: (id, status) => {
        set((state) => ({
          ebookOrders: state.ebookOrders.map(o => o.id === id ? { ...o, status } : o)
        }))
        
        const order = get().ebookOrders.find(o => o.id === id)
        if (order) {
          get().addNotification({
            type: 'info',
            title: 'Statut e-book mis a jour',
            message: `Commande ${id} - Statut: ${status === 'en_attente' ? 'En attente' : status === 'paye' ? 'Paye' : 'Livre'}`,
            orderId: id
          })
        }
      },
      
      getEbookOrderById: (id) => get().ebookOrders.find(o => o.id === id),
      
      // Settings actions
      updateSiteSettings: (settings) => set((state) => ({
        siteSettings: { ...state.siteSettings, ...settings }
      })),
      
      updateShippingFees: (fees) => set((state) => ({
        shippingFees: { ...state.shippingFees, ...fees }
      })),
      
      // Upcoming Program actions
      addUpcomingProgram: async (program) => {
        const created = await api.create<UpcomingProgram, Omit<UpcomingProgram, 'id'>>('/programs', program)
        set((state) => ({ upcomingPrograms: [created, ...state.upcomingPrograms] }))
      },
      
      updateUpcomingProgram: async (id, program) => {
        const updated = await api.update<UpcomingProgram, Partial<UpcomingProgram>>('/programs', id, program)
        set((state) => ({ upcomingPrograms: state.upcomingPrograms.map(p => p.id === id ? updated : p) }))
      },
      
      deleteUpcomingProgram: async (id) => {
        await api.delete('/programs', id)
        set((state) => ({ upcomingPrograms: state.upcomingPrograms.filter(p => p.id !== id) }))
      },
      
      // Hero Slide actions
      addHeroSlide: async (slide) => {
        const created = await api.create<HeroSlide, Omit<HeroSlide, 'id'>>('/hero-slides', slide)
        set((state) => ({ heroSlides: [created, ...state.heroSlides] }))
      },
      
      updateHeroSlide: async (id, slide) => {
        const updated = await api.update<HeroSlide, Partial<HeroSlide>>('/hero-slides', id, slide)
        set((state) => ({ heroSlides: state.heroSlides.map(s => s.id === id ? updated : s) }))
      },
      
      deleteHeroSlide: async (id) => {
        await api.delete('/hero-slides', id)
        set((state) => ({ heroSlides: state.heroSlides.filter(s => s.id !== id) }))
      },
      
      toggleHeroSlideActive: async (id) => {
        const slide = get().heroSlides.find(s => s.id === id)
        if (!slide) return
        const updated = await api.update<HeroSlide, Partial<HeroSlide>>('/hero-slides', id, { isActive: !slide.isActive })
        set((state) => ({ heroSlides: state.heroSlides.map(s => s.id === id ? updated : s) }))
      },
      
      // Contact Message actions
      addContactMessage: (message) => {
        const newMessage: ContactMessage = {
          ...message,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          isRead: false
        }
        set((state) => ({
          contactMessages: [newMessage, ...state.contactMessages]
        }))
        get().addNotification({
          type: 'info',
          title: 'Nouveau message',
          message: `Message de ${message.name}: ${message.subject}`
        })
      },
      
      markContactMessageRead: (id) => set((state) => ({
        contactMessages: state.contactMessages.map(m => m.id === id ? { ...m, isRead: true } : m)
      })),
      
      deleteContactMessage: (id) => set((state) => ({
        contactMessages: state.contactMessages.filter(m => m.id !== id)
      })),
      
      // Notification actions
      addNotification: (notification) => set((state) => ({
        notifications: [
          {
            ...notification,
            id: Date.now().toString(),
            read: false,
            createdAt: new Date().toISOString()
          },
          ...state.notifications
        ]
      })),
      
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      })),
      
      markAllNotificationsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      getUnreadCount: () => get().notifications.filter(n => !n.read).length,
      
      // Auth actions
      login: (email, password) => {
        if (email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD) {
          set({ isAdminAuthenticated: true, adminEmail: email })
          return true
        }
        return false
      },
      
      logout: () => set({ isAdminAuthenticated: false, adminEmail: null })
    }),
    {
      name: 'ccr-library-store',
      version: 5,
      migrate: (persistedState: unknown, version: number) => {
        // Version 3 : suppression de la fusion forcée des vidéos mock.
        // Le store persiste maintenant l'état tel que géré par l'admin.
        // Si ancienne version sans données persistées, on initialise avec les mocks.
        const state = persistedState as Partial<StoreState>
        if (version < 5) {
          return {
            ...state,
            podcasts: [],
            videos: [],
            ebooks: [],
            physicalBooks: [],
            orders: [],
            ebookOrders: [],
            upcomingPrograms: [],
            heroSlides: [],
            contactMessages: [],
            notifications: []
          }
        }
        return state
      },
      partialize: (state) => ({
        podcasts: state.podcasts,
        videos: state.videos,
        ebooks: state.ebooks,
        physicalBooks: state.physicalBooks,
        orders: state.orders,
        siteSettings: state.siteSettings,
        shippingFees: state.shippingFees,
        notifications: state.notifications,
        upcomingPrograms: state.upcomingPrograms,
        heroSlides: state.heroSlides,
        contactMessages: state.contactMessages,
        isAdminAuthenticated: state.isAdminAuthenticated,
        adminEmail: state.adminEmail
      })
    }
  )
)
