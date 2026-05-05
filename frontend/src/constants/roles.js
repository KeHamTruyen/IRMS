export const APP_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SERVER: 'SERVER',
  CHEF: 'CHEF',
  CASHIER: 'CASHIER',
  HOST: 'HOST',
}

export const EMPLOYEE_ROLES = [
  {
    id: APP_ROLES.SERVER,
    label: 'Nhân viên',
    subtitle: 'Phục vụ bàn',
  },
  {
    id: APP_ROLES.CHEF,
    label: 'Bếp',
    subtitle: 'Khu bếp',
  },
  {
    id: APP_ROLES.CASHIER,
    label: 'Cashier',
    subtitle: 'Payments',
  },
  {
    id: APP_ROLES.HOST,
    label: 'Lễ tân',
    subtitle: 'Đặt bàn',
  },
  {
    id: APP_ROLES.MANAGER,
    label: 'Quản lý',
    subtitle: 'Vận hành',
  }
]

export const ROLE_META = {
  ADMIN: {
    title: 'Quản trị hệ thống',
    dashboardTitle: 'Dashboard quản trị',
    dashboardSubtitle: 'Người dùng, phân tích và toàn cảnh hệ thống',
  },
  MANAGER: {
    title: 'Quản lý',
    dashboardTitle: 'Dashboard quản lý',
    dashboardSubtitle: 'Doanh thu, nhân sự và hiệu suất vận hành',
  },
  SERVER: {
    title: 'Nhân viên',
    dashboardTitle: 'Dashboard phục vụ',
    dashboardSubtitle: 'Bàn, đơn đang xử lý và phối hợp phục vụ khách',
  },
  CHEF: {
    title: 'Bếp',
    dashboardTitle: 'Dashboard bếp',
    dashboardSubtitle: 'Hàng chờ chế biến, trạng thái món và tải tại quầy',
  },
  CASHIER: {
    title: 'Cashier',
    dashboardTitle: 'Cashier dashboard',
    dashboardSubtitle: 'Bills, payments, and receipts',
  },
  HOST: {
    title: 'Lễ tân',
    dashboardTitle: 'Dashboard lễ tân',
    dashboardSubtitle: 'Theo dõi đặt chỗ, đón khách và luồng tiếp nhận',
  },
}

export const getRoleMeta = (role) => ROLE_META[role] ?? ROLE_META.SERVER
