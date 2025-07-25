export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise'
  createdAt: Date
  updatedAt: Date
  // Novos campos para sistema de usuários da loja
  role?: 'dono' | 'gerente' | 'operador'
  cpf?: string
  whatsapp?: string
  isStoreUser?: boolean
}

export interface Subscription {
  id: string
  userId: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  canAccessUsers: () => boolean
}

export interface DashboardStats {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  conversionRate: number
}

export interface StoreUser {
  id: string
  email: string
  name: string
  cpf: string
  whatsapp: string
  role: 'dono' | 'gerente' | 'operador'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  storeId: string
} 