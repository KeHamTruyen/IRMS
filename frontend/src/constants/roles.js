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
    subtitle: 'Phục vụ sảnh',
  },
  {
    id: APP_ROLES.MANAGER,
    label: 'Quản lý',
    subtitle: 'Điều hành',
  },
  {
    id: APP_ROLES.CHEF,
    label: 'Bếp',
    subtitle: 'Khu bếp',
  },
  {
    id: APP_ROLES.CASHIER,
    label: 'Thu ngân',
    subtitle: 'Thanh toán',
  },
  {
    id: APP_ROLES.HOST,
    label: 'Lễ tân',
    subtitle: 'Quầy đón khách',
  },
]

export const ROLE_META = {
  ADMIN: {
    title: 'Quản trị hệ thống',
    dashboardTitle: 'Dashboard quản trị',
    dashboardSubtitle: 'Người dùng, phân tích và toàn cảnh hệ thống',
  },
  MANAGER: {
    title: 'Quản lý',
    dashboardTitle: 'Dashboard vận hành',
    dashboardSubtitle: 'Doanh thu, tình trạng bàn và luồng phục vụ',
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
    title: 'Thu ngân',
    dashboardTitle: 'Dashboard thanh toán',
    dashboardSubtitle: 'Hóa đơn mở, trạng thái thanh toán và đối soát',
  },
  HOST: {
    title: 'Lễ tân',
    dashboardTitle: 'Dashboard đón khách',
    dashboardSubtitle: 'Đặt chỗ, hàng chờ và vòng quay bàn',
  },
}

export const getRoleMeta = (role) => ROLE_META[role] ?? ROLE_META.SERVER
