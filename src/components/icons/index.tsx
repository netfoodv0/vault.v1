import React from 'react'
import {
  ShoppingBag,
  Clock,
  BarChart3,
  ChefHat,
  Settings,
  Ticket,
  Zap,
  Building2,
  LogOut,
  Receipt,
  Users,
  MapPin,
  CreditCard,
  Printer,
  Truck,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Store,
  Timer,
  Bike,
  FileText,
  PieChart,
  Target,
  Wallet
} from 'lucide-react'

// Icon wrapper component for consistent styling
interface IconProps {
  className?: string
  size?: number
}

// Navigation Icons
export const OrdersIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <ShoppingBag className={className} size={size} />
)

export const OrderHistoryIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Clock className={className} size={size} />
)

export const ReportsIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <BarChart3 className={className} size={size} />
)

export const MenuIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <ChefHat className={className} size={size} />
)

export const AdminIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Settings className={className} size={size} />
)

export const CouponsIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Ticket className={className} size={size} />
)

export const IntegrationsIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Zap className={className} size={size} />
)

export const StoreIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Building2 className={className} size={size} />
)

export const LogoutIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <LogOut className={className} size={size} />
)

// Sub-navigation Icons for Reports
export const GeneralReportIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <FileText className={className} size={size} />
)

export const SalesReportIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <TrendingUp className={className} size={size} />
)

export const CustomersReportIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Users className={className} size={size} />
)

export const ProductsReportIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Package className={className} size={size} />
)

export const FinancialReportIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <DollarSign className={className} size={size} />
)

// Sub-navigation Icons for Admin
export const StoreDataIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Store className={className} size={size} />
)

export const ScheduleIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Calendar className={className} size={size} />
)

export const DeliveryIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Truck className={className} size={size} />
)

export const PaymentIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <CreditCard className={className} size={size} />
)

export const MotoboyIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Bike className={className} size={size} />
)

export const PrintIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" className={className}>
    <path d="M720-680H240v-160h480v160Zm0 220q17 0 28.5-11.5T760-500q0-17-11.5-28.5T720-540q-17 0-28.5 11.5T680-500q0 17 11.5 28.5T720-460Zm-80 260v-160H320v160h320Zm80 80H240v-160H80v-240q0-51 35-85.5t85-34.5h560q51 0 85.5 34.5T880-520v240H720v160Z"/>
  </svg>
)

export const UsersIcon = ({ className = "w-5 h-5", size }: IconProps) => (
  <Users className={className} size={size} />
)

// Utility Icons
export const ChevronRightIcon = ({ className = "w-4 h-4", size }: IconProps) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

// Dashboard/Analytics Icons
export const DashboardIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <PieChart className={className} size={size} />
)

export const MetricsIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Target className={className} size={size} />
)

export const RevenueIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <Wallet className={className} size={size} />
)

// Map/Location Icons
export const LocationIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <MapPin className={className} size={size} />
)

// Status Icons
export const ActiveIcon = ({ className = "w-4 h-4 text-green-500", size }: IconProps) => (
  <div className={`${className} rounded-full bg-current`} />
)

export const InactiveIcon = ({ className = "w-4 h-4 text-gray-400", size }: IconProps) => (
  <div className={`${className} rounded-full bg-current`} />
)

// Export all icons as a collection for easy access
export const Icons = {
  // Navigation
  Orders: OrdersIcon,
  OrderHistory: OrderHistoryIcon,
  Reports: ReportsIcon,
  Menu: MenuIcon,
  Admin: AdminIcon,
  Coupons: CouponsIcon,
  Integrations: IntegrationsIcon,
  Store: StoreIcon,
  Logout: LogoutIcon,
  
  // Reports Sub-nav
  GeneralReport: GeneralReportIcon,
  SalesReport: SalesReportIcon,
  CustomersReport: CustomersReportIcon,
  ProductsReport: ProductsReportIcon,
  FinancialReport: FinancialReportIcon,
  
  // Admin Sub-nav
  StoreData: StoreDataIcon,
  Schedule: ScheduleIcon,
  Delivery: DeliveryIcon,
  Payment: PaymentIcon,
  Motoboy: MotoboyIcon,
  Print: PrintIcon,
  Users: UsersIcon,
  
  // Utility
  ChevronRight: ChevronRightIcon,
  Dashboard: DashboardIcon,
  Metrics: MetricsIcon,
  Revenue: RevenueIcon,
  Location: LocationIcon,
  Active: ActiveIcon,
  Inactive: InactiveIcon
}