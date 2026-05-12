export interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

export type ProductFormData = Omit<Product, 'id'>

export interface User {
  username: string
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
