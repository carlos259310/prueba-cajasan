export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled'

export interface Order {
  id: number
  customerName: string
  items: string[]
  status: OrderStatus
}

export type OrderFormData = Omit<Order, 'id' | 'status'>

export interface User {
  username: string
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
