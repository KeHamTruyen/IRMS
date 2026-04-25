export const APP_ROLES = {
  ADMIN: 'ADMIN',
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
    id: APP_ROLES.CHEF,
    label: 'Bếp',
    subtitle: 'Khu bếp',
  },
]

export const ROLE_META = {
  ADMIN: {
    title: 'Quản trị hệ thống',
    dashboardTitle: 'Dashboard quản trị',
    dashboardSubtitle: 'Người dùng, phân tích và toàn cảnh hệ thống',
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
}

export const getRoleMeta = (role) => ROLE_META[role] ?? ROLE_META.SERVER
