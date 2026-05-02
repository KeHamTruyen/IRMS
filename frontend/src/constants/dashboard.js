import { APP_ROLES } from './roles'

export const DASHBOARD_CONFIG = {
  [APP_ROLES.ADMIN]: {
    nav: ['Tổng quan', 'Người dùng', 'Phân tích', 'Hệ thống'],
  },
  [APP_ROLES.MANAGER]: {
    nav: ['Tổng quan', 'Doanh thu', 'Ca làm', 'Hiệu suất'],
  },
  [APP_ROLES.SERVER]: {
    nav: ['Tổng quan', 'Bàn', 'Đơn hàng', 'Hàng chờ'],
  },
  [APP_ROLES.CHEF]: {
    nav: ['Tổng quan', 'Bếp', 'Hàng chờ', 'Khu chế biến'],
  },
  [APP_ROLES.HOST]: {
    nav: ['Tổng quan', 'Hàng chờ', 'Bàn', 'Đặt chỗ'],
  },
}

export const DASHBOARD_VARIANT_TITLES = {
  analytics: 'Ảnh chụp phân tích',
  tables: 'Sơ đồ bàn hiện tại',
  orders: 'Đơn hàng đang phục vụ',
  kitchen: 'Hàng chờ bếp',
  bills: 'Tổng quan thanh toán',
  reservations: 'Bảng đón khách',
}
