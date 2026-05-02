import { useMemo, useState } from 'react'
import { hostApi } from '../../../services/hostApi'

const mapTableStatusLabel = (status) => {
  switch (status) {
    case 'AVAILABLE':
      return 'Trống'
    case 'RESERVED':
      return 'Đã giữ'
    case 'OCCUPIED':
      return 'Có khách'
    case 'CLEANING':
      return 'Chờ dọn'
    default:
      return status
  }
}

const tableTone = {
  AVAILABLE: 'border-[#d8e0e7] bg-white text-[#0d9488]',
  RESERVED: 'border-[#d8e8f6] bg-[#f6fbff] text-[#4f7ea8]',
  OCCUPIED: 'border-[#d7dde8] bg-[#f8fafc] text-[#475569]',
  CLEANING: 'border-[#f0d2cb] bg-[#fff6f4] text-[#c36d4b]',
}

function HostDashboard({ dashboard, onSignOut }) {
  const [tables, setTables] = useState(dashboard.tables ?? [])
  const [reservations, setReservations] = useState(dashboard.reservations ?? [])
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    reservationDate: new Date().toISOString().slice(0, 10),
    reservationTime: '19:00',
    notes: '',
  })
  const [walkInForm, setWalkInForm] = useState({
    tableId: '',
  })
  const [message, setMessage] = useState('')
  const [isBusy, setIsBusy] = useState(false)

  const availableTables = tables.filter((table) => table.status === 'AVAILABLE')
  const reservedTables = tables.filter((table) => table.status === 'RESERVED')
  const occupiedTables = tables.filter((table) => table.status === 'OCCUPIED')

  const reservationsByStatus = useMemo(() => ({
    pending: reservations.filter((item) => item.status === 'PENDING'),
    confirmed: reservations.filter((item) => item.status === 'CONFIRMED'),
    seated: reservations.filter((item) => item.status === 'SEATED'),
  }), [reservations])

  const refresh = async () => {
    const next = await hostApi.getDashboard()
    setTables(next.tables)
    setReservations(next.reservations)
  }

  const runAction = async (action, successMessage) => {
    setIsBusy(true)
    setMessage('')
    try {
      await action()
      setMessage(successMessage)
      await refresh()
    } catch (error) {
      setMessage(error.message || 'Thao tác không thành công.')
    } finally {
      setIsBusy(false)
    }
  }

  const createReservation = async (event) => {
    event.preventDefault()
    if (!form.customerName.trim() || !form.customerPhone.trim()) return

    await runAction(async () => {
      await hostApi.createReservation({
        ...form,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        guestCount: Number(form.guestCount || 1),
      })
      setForm((current) => ({ ...current, customerName: '', customerPhone: '', notes: '' }))
    }, 'Đã tạo đặt bàn mới.')
  }

  const seatWalkIn = async (event) => {
    event.preventDefault()
    if (!walkInForm.tableId) return

    await runAction(async () => {
      await hostApi.updateTableStatus(walkInForm.tableId, 'OCCUPIED')
      setWalkInForm((current) => ({ ...current, tableId: '' }))
    }, 'Đã cho khách walk-in vào bàn. Nhân viên phục vụ có thể bắt đầu gọi món.')
  }

  const updateStatus = async (reservation, status) => {
    await runAction(
      () => hostApi.updateReservationStatus(reservation.id, status),
      status === 'SEATED'
        ? 'Đã cho khách đặt trước vào bàn. Nhân viên phục vụ có thể bắt đầu gọi món.'
        : 'Đã cập nhật trạng thái đặt bàn.'
    )
  }

  const assignTable = async (reservationId, tableId) => {
    if (!tableId) return
    await runAction(
      () => hostApi.assignTable(reservationId, tableId),
      'Đã giữ bàn cho khách đặt trước.'
    )
  }

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6">
        <header className="flex flex-col gap-4 rounded-[24px] border border-[#d8e0e7] bg-white p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">Dashboard lễ tân</p>
            <h1 className="mt-2 text-3xl font-bold text-[#16202a]">Đón khách, giữ bàn và điều phối phục vụ</h1>
            <p className="mt-2 text-sm text-[#62707f]">{dashboard.snapshotTime}</p>
          </div>
          <button className="rounded-[14px] border border-[#d8e0e7] bg-white px-4 py-3 font-semibold text-[#16202a]" onClick={onSignOut}>Đăng xuất</button>
        </header>

        {message && <p className="rounded-2xl border border-[#d8e0e7] bg-white px-4 py-3 text-sm font-semibold text-[#516072]">{message}</p>}

        <section className="grid gap-4 md:grid-cols-5">
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5"><div className="text-sm text-[#62707f]">Bàn trống</div><div className="mt-3 text-3xl font-bold">{availableTables.length}</div></article>
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5"><div className="text-sm text-[#62707f]">Đã giữ</div><div className="mt-3 text-3xl font-bold">{reservedTables.length}</div></article>
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5"><div className="text-sm text-[#62707f]">Có khách</div><div className="mt-3 text-3xl font-bold">{occupiedTables.length}</div></article>
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5"><div className="text-sm text-[#62707f]">Chờ xác nhận</div><div className="mt-3 text-3xl font-bold">{reservationsByStatus.pending.length}</div></article>
          <article className="rounded-[18px] border border-[#d8e0e7] bg-white p-5"><div className="text-sm text-[#62707f]">Đã vào bàn</div><div className="mt-3 text-3xl font-bold">{reservationsByStatus.seated.length}</div></article>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-5">
            <form onSubmit={seatWalkIn} className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#16202a]">Khách walk-in</h2>
              <p className="mt-2 text-sm text-[#62707f]">Dành cho khách đến trực tiếp, chưa đặt bàn trước.</p>
              <div className="mt-4 grid gap-3">
                <select className="rounded-2xl border border-[#d8e0e7] px-4 py-3" value={walkInForm.tableId} onChange={(event) => setWalkInForm({ ...walkInForm, tableId: event.target.value })}>
                  <option value="">Chọn bàn trống</option>
                  {availableTables.map((table) => (
                    <option key={table.id} value={table.id}>Bàn {table.tableNumber} · {table.capacity} ghế</option>
                  ))}
                </select>
                <button disabled={isBusy || !walkInForm.tableId} className="rounded-2xl bg-[#16202a] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Cho khách vào bàn</button>
              </div>
            </form>

            <form onSubmit={createReservation} className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#16202a]">Tạo đặt bàn</h2>
              <div className="mt-4 grid gap-3">
                <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3" placeholder="Tên khách" value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} />
                <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3" placeholder="Số điện thoại" value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} />
                <div className="grid grid-cols-3 gap-3">
                  <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3" type="number" min="1" value={form.guestCount} onChange={(event) => setForm({ ...form, guestCount: event.target.value })} />
                  <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3" type="date" value={form.reservationDate} onChange={(event) => setForm({ ...form, reservationDate: event.target.value })} />
                  <input className="rounded-2xl border border-[#d8e0e7] px-4 py-3" type="time" value={form.reservationTime} onChange={(event) => setForm({ ...form, reservationTime: event.target.value })} />
                </div>
                <textarea className="rounded-2xl border border-[#d8e0e7] px-4 py-3" placeholder="Ghi chú" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                <button disabled={isBusy} className="rounded-2xl bg-[#0d9488] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Lưu đặt bàn</button>
              </div>
            </form>

            <section className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
              <h2 className="text-xl font-semibold text-[#16202a]">Sơ đồ bàn</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {tables.map((table) => (
                  <article key={table.id} className={`rounded-2xl border p-4 ${tableTone[table.status] ?? tableTone.AVAILABLE}`}>
                    <div className="text-xs font-bold uppercase tracking-[0.12em]">{mapTableStatusLabel(table.status)}</div>
                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-2xl font-bold text-[#16202a]">Bàn {table.tableNumber}</div>
                      <div className="text-sm text-[#62707f]">{table.capacity} ghế</div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="rounded-[24px] border border-[#d8e0e7] bg-white p-6">
            <h2 className="text-xl font-semibold text-[#16202a]">Danh sách đặt bàn</h2>
            <div className="mt-4 space-y-3">
              {reservations.map((reservation) => {
                const assignedTable = tables.find((table) => table.id === reservation.tableId)
                const selectableTables = tables.filter((table) => table.status === 'AVAILABLE' || table.id === reservation.tableId)

                return (
                  <article key={reservation.id} className="rounded-2xl border border-[#e7edf2] p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="font-semibold text-[#16202a]">{reservation.customerName}</div>
                        <div className="mt-1 text-sm text-[#62707f]">{reservation.customerPhone} · {reservation.guestCount} khách · {reservation.reservationDate} {reservation.reservationTime}</div>
                        <div className="mt-2 text-sm font-semibold text-[#0d9488]">{reservation.statusLabel}</div>
                        {assignedTable ? <div className="mt-1 text-sm text-[#62707f]">Bàn {assignedTable.tableNumber} · {mapTableStatusLabel(assignedTable.status)}</div> : null}
                      </div>
                      <select
                        className="rounded-xl border border-[#d8e0e7] px-3 py-2"
                        value={reservation.tableId ?? ''}
                        disabled={reservation.status === 'SEATED' || reservation.status === 'CANCELLED' || reservation.status === 'NO_SHOW' || isBusy}
                        onChange={(event) => assignTable(reservation.id, event.target.value)}
                      >
                        <option value="">Chọn bàn</option>
                        {selectableTables.map((table) => <option key={table.id} value={table.id}>Bàn {table.tableNumber} · {mapTableStatusLabel(table.status)}</option>)}
                      </select>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {reservation.status === 'PENDING' && <button disabled={isBusy} className="rounded-xl bg-[#0d9488] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50" onClick={() => updateStatus(reservation, 'CONFIRMED')}>Xác nhận</button>}
                      {reservation.status === 'CONFIRMED' && <button disabled={isBusy || !reservation.tableId} className="rounded-xl bg-[#16202a] px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" onClick={() => updateStatus(reservation, 'SEATED')}>Cho vào bàn</button>}
                      {reservation.status !== 'CANCELLED' && reservation.status !== 'SEATED' && <button disabled={isBusy} className="rounded-xl border border-[#f1b6b6] px-3 py-2 text-sm font-semibold text-[#c25858] disabled:opacity-50" onClick={() => updateStatus(reservation, 'CANCELLED')}>Hủy</button>}
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

export default HostDashboard
