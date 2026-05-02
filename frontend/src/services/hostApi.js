import { api } from './api'

const toStatusLabel = (status) => {
  if (status === 'PENDING') return 'Chờ xác nhận'
  if (status === 'CONFIRMED') return 'Đã xác nhận'
  if (status === 'SEATED') return 'Đã vào bàn'
  if (status === 'CANCELLED') return 'Đã hủy'
  return status
}

const normalizeReservation = (reservation) => ({
  ...reservation,
  statusLabel: toStatusLabel(reservation.status),
  startsAt: `${reservation.reservationDate} ${reservation.reservationTime}`,
})

export const hostApi = {
  async getDashboard() {
    const [tables, reservations] = await Promise.all([
      api.get('/tables'),
      api.get('/reservations'),
    ])

    return {
      roleLabel: 'Lễ tân',
      sourceLabel: 'Dữ liệu đặt bàn từ backend',
      snapshotTime: `Cập nhật lúc ${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`,
      tables,
      reservations: (reservations ?? []).map(normalizeReservation).sort((left, right) => left.startsAt.localeCompare(right.startsAt)),
    }
  },

  createReservation(payload) {
    return api.post('/reservations', payload)
  },

  updateReservationStatus(id, status) {
    return api.patch(`/reservations/${id}/status?status=${status}`)
  },

  assignTable(id, tableId) {
    return api.patch(`/reservations/${id}/table?tableId=${tableId}`)
  },

  updateTableStatus(id, status) {
    return api.patch(`/tables/${id}/status?status=${status}`)
  },
}
