export const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export const formatDateTime = (value) =>
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))

export const getInitials = (value = '') =>
  value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const createEmptyMenuForm = (categories = []) => ({
  name: '',
  category: categories[0] ?? 'Món chính',
  price: '',
  preparationTime: '',
  description: '',
  imageUrl: '',
  station: '',
  isAvailable: true,
  sizeOptions: 'Mặc định',
})

export const normalizeSizeOptions = (value) =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

export const getRoleLabel = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'Quản trị'
    case 'MANAGER':
      return 'Quản lý'
    case 'SERVER':
      return 'Phục vụ'
    case 'CHEF':
      return 'Bếp'
    case 'HOST':
      return 'Lễ tân'
    default:
      return role
  }
}

export const getStatusBadgeClass = (tone = 'neutral') => {
  switch (tone) {
    case 'success':
      return 'bg-[#eef9f2] text-[#2f7a52]'
    case 'warning':
      return 'bg-[#fff7ed] text-[#b8691d]'
    case 'danger':
      return 'bg-[#fff1f1] text-[#c25858]'
    default:
      return 'bg-[#f1f5f9] text-[#516072]'
  }
}
