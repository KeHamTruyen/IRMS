import { useMemo, useState } from 'react'
import { formatCurrency, formatDateTime, getRoleLabel, getStatusBadgeClass } from './utils'

function ManagementStat({ label, value, note }) {
  return (
    <article className="rounded-2xl bg-[#f8fafc] p-4">
      <div className="text-sm text-[#62707f]">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[#16202a]">{value}</div>
      <div className="mt-2 text-sm text-[#62707f]">{note}</div>
    </article>
  )
}

function ModuleTabs({ activeModule, onChangeModule }) {
  const tabs = [
    { id: 'menu', label: 'Quản lý menu' },
    { id: 'staff', label: 'Quản lý nhân sự' },
    { id: 'inventory', label: 'Quản lý nguyên liệu' },
    { id: 'tables', label: 'Quản lý bàn' },
    { id: 'orders', label: 'Quản lý đơn' },
  ]

  return (
    <section className="rounded-[24px] border border-[#e7edf2] bg-white p-3">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeModule(tab.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              activeModule === tab.id
                ? 'bg-[#eef9f7] text-[#2d7871]'
                : 'bg-[#f8fafc] text-[#516072] hover:bg-[#eef2f7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </section>
  )
}

function mapTableStateLabel(serviceState) {
  switch (serviceState) {
    case 'AVAILABLE':
      return 'Trống'
    case 'RESERVED':
      return 'Đã đặt trước'
    case 'WAITING_FOOD':
      return 'Đang chờ món'
    case 'SERVED':
      return 'Đã lên món'
    case 'CLEANING':
      return 'Chờ dọn'
    default:
      return 'Đang theo dõi'
  }
}

function mapBillingStatusLabel(status) {
  switch (status) {
    case 'PENDING':
      return 'Chờ thanh toán'
    case 'PARTIALLY_PAID':
      return 'Thanh toán một phần'
    case 'PAID':
      return 'Đã thanh toán'
    default:
      return 'Chưa mở bill'
  }
}

function getTableStateTone(serviceState) {
  switch (serviceState) {
    case 'AVAILABLE':
      return 'success'
    case 'WAITING_FOOD':
      return 'warning'
    case 'CLEANING':
      return 'danger'
    default:
      return 'neutral'
  }
}

function mapOrderStatusLabel(status) {
  switch (status) {
    case 'COMPLETED':
      return 'Đã hoàn thành'
    case 'WAITING':
    default:
      return 'Đang chờ'
  }
}

function getOrderStatusTone(status) {
  return status === 'COMPLETED' ? 'success' : 'warning'
}

function MenuForm({ categories, form, mode, onChange, onSubmit, onCancelEdit }) {
  return (
    <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#16202a]">
            {mode === 'edit' ? 'Chỉnh sửa món' : 'Thêm món mới'}
          </h2>
          <p className="mt-1 text-sm text-[#62707f]">
            Quản lý thông tin món ăn trong thực đơn.
          </p>
        </div>
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-2xl border border-[#d8e0e7] px-4 py-2 text-sm font-semibold text-[#516072]"
          >
            Hủy chỉnh sửa
          </button>
        ) : null}
      </div>

      <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[#16202a]">Tên món</span>
          <input
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[#16202a]">Danh mục</span>
          <select
            value={form.category}
            onChange={(event) => onChange('category', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[#16202a]">Giá bán</span>
          <input
            type="number"
            min="0"
            value={form.price}
            onChange={(event) => onChange('price', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[#16202a]">Thời gian chuẩn bị (phút)</span>
          <input
            type="number"
            min="0"
            value={form.preparationTime}
            onChange={(event) => onChange('preparationTime', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[#16202a]">Quầy / trạm</span>
          <input
            value={form.station}
            onChange={(event) => onChange('station', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[#16202a]">Kích cỡ</span>
          <input
            value={form.sizeOptions}
            onChange={(event) => onChange('sizeOptions', event.target.value)}
            placeholder="Ví dụ: S, M, L"
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[#16202a]">Mô tả</span>
          <textarea
            value={form.description}
            onChange={(event) => onChange('description', event.target.value)}
            rows={4}
            className="w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 py-3 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium text-[#16202a]">Ảnh món</span>
          <input
            value={form.imageUrl}
            onChange={(event) => onChange('imageUrl', event.target.value)}
            className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] bg-white px-4 outline-none focus:border-[#0d9488]"
          />
        </label>

        <label className="inline-flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3 md:col-span-2">
          <input
            type="checkbox"
            checked={form.isAvailable}
            onChange={(event) => onChange('isAvailable', event.target.checked)}
          />
          <span className="text-sm font-medium text-[#16202a]">Đang kinh doanh</span>
        </label>

        <div className="flex flex-wrap gap-3 md:col-span-2">
          <button
            type="submit"
            className="rounded-2xl bg-[#2d7871] px-5 py-3 text-sm font-semibold text-white"
          >
            {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm món'}
          </button>
        </div>
      </form>
    </section>
  )
}

function TableForm({
  locationOptions,
  form,
  mode,
  onChange,
  onSubmit,
  onCancelEdit,
}) {
  return (
    <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#16202a]">
            {mode === 'edit' ? 'Cập nhật bàn' : 'Thêm bàn mới'}
          </h2>
          <p className="mt-1 text-sm text-[#62707f]">
            Quản lý thông tin bàn tương tự luồng phục vụ: số bàn, khu vực, sức chứa và trạng thái vận hành.
          </p>
        </div>
        {mode === 'edit' ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-2xl border border-[#d8e0e7] px-4 py-2 text-sm font-semibold text-[#516072]"
          >
            Hủy chỉnh sửa
          </button>
        ) : null}
      </div>

      <form className="mt-5 space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#16202a]">Số bàn</span>
            <input
              value={form.tableNumber}
              onChange={(event) => onChange('tableNumber', event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#16202a]">Sức chứa</span>
            <input
              type="number"
              min="1"
              value={form.capacity}
              onChange={(event) => onChange('capacity', event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#16202a]">Khu vực</span>
            <select
              value={form.location}
              onChange={(event) => onChange('location', event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
            >
              {locationOptions.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#16202a]">Trạng thái bàn</span>
            <select
              value={form.serviceState}
              onChange={(event) => onChange('serviceState', event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
            >
              <option value="AVAILABLE">Trống</option>
              <option value="RESERVED">Đã đặt trước</option>
              <option value="WAITING_FOOD">Đang chờ món</option>
              <option value="SERVED">Đã lên món</option>
              <option value="CLEANING">Chờ dọn</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#16202a]">Khách hiện tại</span>
            <input
              type="number"
              min="0"
              value={form.currentGuests}
              onChange={(event) => onChange('currentGuests', event.target.value)}
              className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-[#16202a]">Khách đặt trước</span>
            <input
              value={form.reservationName}
              onChange={(event) => onChange('reservationName', event.target.value)}
              placeholder="Để trống nếu không có"
              className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
            />
          </label>
        </div>

        <button type="submit" className="rounded-2xl bg-[#2d7871] px-5 py-3 text-sm font-semibold text-white">
          {mode === 'edit' ? 'Lưu bàn' : 'Thêm bàn'}
        </button>
      </form>
    </section>
  )
}

function CentralManagementPage({
  management,
  menuItems,
  menuCategory,
  onChangeMenuCategory,
  menuForm,
  menuFormMode,
  onMenuFormChange,
  onSubmitMenuForm,
  onStartEditMenu,
  onDeleteMenuItem,
  onCancelMenuEdit,
  staffRoleFilter,
  onChangeStaffRoleFilter,
  staffForm,
  staffFormMode,
  onStaffFormChange,
  onSubmitStaffForm,
  onStartEditStaff,
  onDeleteStaff,
  onCancelStaffEdit,
  inventoryCategory,
  onChangeInventoryCategory,
  inventoryForm,
  inventoryFormMode,
  onInventoryFormChange,
  onSubmitInventoryForm,
  onStartEditInventory,
  onDeleteInventoryItem,
  onCancelInventoryEdit,
  tableStatusFilter,
  onChangeTableStatusFilter,
  tableForm,
  tableFormMode,
  onTableFormChange,
  onSubmitTableForm,
  onStartEditTable,
  onDeleteTable,
  onCancelTableEdit,
  orderStatusFilter,
  onChangeOrderStatusFilter,
}) {
  const [activeModule, setActiveModule] = useState('menu')

  const filteredMenuItems =
    menuCategory === 'Tất cả'
      ? menuItems
      : menuItems.filter((item) => item.category === menuCategory)

  const filteredStaff =
    staffRoleFilter === 'Tất cả'
      ? management.staffMembers
      : management.staffMembers.filter((staff) => staff.role === staffRoleFilter)

  const filteredInventory =
    inventoryCategory === 'Tất cả'
      ? management.inventoryItems
      : management.inventoryItems.filter((item) => item.category === inventoryCategory)

  const filteredTables =
    tableStatusFilter === 'Tất cả'
      ? management.tables
      : management.tables.filter((table) => table.serviceState === tableStatusFilter)

  const filteredOrders =
    orderStatusFilter === 'Tất cả'
      ? management.orders
      : management.orders.filter((order) => order.status === orderStatusFilter)

  const staffCountByRole = useMemo(
    () =>
      management.staffMembers.reduce((acc, staff) => {
        acc[staff.role] = (acc[staff.role] ?? 0) + 1
        return acc
      }, {}),
    [management.staffMembers]
  )

  const lowStockCount = management.inventoryItems.filter(
    (item) => Number(item.quantity || 0) <= Number(item.threshold || 0)
  ).length

  const outOfStockCount = management.inventoryItems.filter(
    (item) => item.status === 'OUT_OF_STOCK'
  ).length

  const inventoryStatusTone = (status) => {
    if (status === 'OUT_OF_STOCK') return 'danger'
    if (status === 'RESTOCKING') return 'warning'
    return 'success'
  }

  const tableStats = {
    total: management.tables.length,
    available: management.tables.filter((table) => table.serviceState === 'AVAILABLE').length,
    reserved: management.tables.filter((table) => table.serviceState === 'RESERVED').length,
    waiting: management.tables.filter((table) => table.serviceState === 'WAITING_FOOD').length,
    cleaning: management.tables.filter((table) => table.serviceState === 'CLEANING').length,
  }

  const orderStats = {
    total: management.orders.length,
    waiting: management.orders.filter((order) => order.status === 'WAITING').length,
    completed: management.orders.filter((order) => order.status === 'COMPLETED').length,
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">Administrative workspace</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#16202a]">
              Theo dõi chi tiết
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62707f]">
              Các công cụ quản lý cho quản trị viên.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:w-[560px]">
            <ManagementStat
              label="Món trong thực đơn"
              value={`${menuItems.length}`}
              note="Danh sách món hiện hành"
            />
            <ManagementStat
              label="Nhân sự đang hoạt động"
              value={`${management.staffMembers.filter((staff) => staff.isActive).length}`}
              note="Tổng user còn kích hoạt"
            />
            <ManagementStat
              label="Bàn đang trống"
              value={`${tableStats.available}`}
              note="Có thể nhận khách ngay"
            />
            <ManagementStat
              label="Đơn đang chờ"
              value={`${orderStats.waiting}`}
              note="Đơn chưa hoàn tất từ luồng bếp"
            />
          </div>
        </div>
      </section>

      <ModuleTabs activeModule={activeModule} onChangeModule={setActiveModule} />

      {activeModule === 'menu' ? (
        <section className="grid gap-5 2xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Danh sách menu</h2>
                <p className="mt-1 text-sm text-[#62707f]">Thêm, sửa, xóa món và quản lý trạng thái kinh doanh</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Tất cả', ...management.menuCategories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onChangeMenuCategory(category)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                      menuCategory === category
                        ? 'border-[#0d9488] bg-[#eef9f7] text-[#2d7871]'
                        : 'border-[#d8e0e7] bg-white text-[#516072]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {filteredMenuItems.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-3xl border border-[#e7edf2] bg-[#fbfcfd]">
                  <img src={item.imageUrl} alt={item.name} className="h-44 w-full object-cover" />
                  <div className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#16202a]">{item.name}</h3>
                        <p className="mt-1 text-sm leading-6 text-[#62707f]">{item.description}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#2d7871]">{formatCurrency(item.price)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-medium text-[#516072]">
                      <span className="rounded-full bg-white px-3 py-1">{item.category}</span>
                      <span className="rounded-full bg-white px-3 py-1">{item.station}</span>
                      <span className="rounded-full bg-white px-3 py-1">{item.preparationTime} phút</span>
                      <span
                        className={`rounded-full px-3 py-1 ${
                          item.isAvailable
                            ? 'bg-[#eef9f2] text-[#2f7a52]'
                            : 'bg-[#fff1f1] text-[#c25858]'
                        }`}
                      >
                        {item.isAvailable ? 'Đang bán' : 'Tạm ẩn'}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => onStartEditMenu(item)}
                        className="rounded-2xl border border-[#d8e0e7] bg-white px-4 py-2 text-sm font-semibold text-[#16202a]"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMenuItem(item.id)}
                        className="rounded-2xl border border-[#f0c8c8] bg-white px-4 py-2 text-sm font-semibold text-[#b85b5b]"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <MenuForm
            categories={management.menuCategories}
            form={menuForm}
            mode={menuFormMode}
            onChange={onMenuFormChange}
            onSubmit={onSubmitMenuForm}
            onCancelEdit={onCancelMenuEdit}
          />
        </section>
      ) : null}

      {activeModule === 'staff' ? (
        <section className="grid gap-5 2xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Danh sách nhân sự</h2>
                <p className="mt-1 text-sm text-[#62707f]">Quản lý thông tin, vai trò và trạng thái làm việc của nhân sự</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Tất cả', ...(management.staffRoles ?? [])].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => onChangeStaffRoleFilter(role)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                      staffRoleFilter === role
                        ? 'border-[#0d9488] bg-[#eef9f7] text-[#2d7871]'
                        : 'border-[#d8e0e7] bg-white text-[#516072]'
                    }`}
                  >
                    {role === 'Tất cả' ? role : `${getRoleLabel(role)} (${staffCountByRole[role] ?? 0})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-3xl border border-[#e7edf2]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#fbfcfd] text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                  <tr>
                    <th className="px-4 py-4">Nhân sự</th>
                    <th className="px-4 py-4">Vai trò</th>
                    <th className="px-4 py-4">Liên hệ</th>
                    <th className="px-4 py-4">Xác thực</th>
                    <th className="px-4 py-4">Trạng thái</th>
                    <th className="px-4 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f7] bg-white">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#16202a]">{staff.fullName}</p>
                        <p className="mt-1 text-xs text-[#62707f]">@{staff.username}</p>
                      </td>
                      <td className="px-4 py-4 text-[#516072]">{getRoleLabel(staff.role)}</td>
                      <td className="px-4 py-4 text-[#516072]">
                        <p>{staff.email || 'Chưa có email'}</p>
                        <p className="mt-1 text-xs">{staff.phone || 'Chưa có số điện thoại'}</p>
                      </td>
                      <td className="px-4 py-4 text-[#516072]">{staff.authMethod === 'PIN' ? 'PIN' : 'Mật khẩu'}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            staff.isActive ? 'success' : 'danger'
                          )}`}
                        >
                          {staff.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onStartEditStaff(staff)}
                            className="rounded-xl border border-[#d8e0e7] px-3 py-1.5 text-xs font-semibold text-[#16202a]"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteStaff(staff.id)}
                            className="rounded-xl border border-[#f0c8c8] px-3 py-1.5 text-xs font-semibold text-[#b85b5b]"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">
                  {staffFormMode === 'edit' ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}
                </h2>
                <p className="mt-1 text-sm text-[#62707f]">Quản lý thông tin tài khoản đăng nhập nội bộ</p>
              </div>
              {staffFormMode === 'edit' ? (
                <button
                  type="button"
                  onClick={onCancelStaffEdit}
                  className="rounded-2xl border border-[#d8e0e7] px-4 py-2 text-sm font-semibold text-[#516072]"
                >
                  Hủy chỉnh sửa
                </button>
              ) : null}
            </div>

            <form className="mt-5 space-y-4" onSubmit={onSubmitStaffForm}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#16202a]">Họ và tên</span>
                <input
                  value={staffForm.fullName}
                  onChange={(event) => onStaffFormChange('fullName', event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#16202a]">Tên đăng nhập</span>
                <input
                  value={staffForm.username}
                  onChange={(event) => onStaffFormChange('username', event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#16202a]">Vai trò</span>
                  <select
                    value={staffForm.role}
                    onChange={(event) => onStaffFormChange('role', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                  >
                    {(management.staffRoles ?? []).map((role) => (
                      <option key={role} value={role}>
                        {getRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#16202a]">Phương thức đăng nhập</span>
                  <select
                    value={staffForm.authMethod}
                    onChange={(event) => onStaffFormChange('authMethod', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                  >
                    <option value="PIN">PIN</option>
                    <option value="PASSWORD">Mật khẩu</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#16202a]">Email</span>
                <input
                  value={staffForm.email}
                  onChange={(event) => onStaffFormChange('email', event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#16202a]">Số điện thoại</span>
                <input
                  value={staffForm.phone}
                  onChange={(event) => onStaffFormChange('phone', event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                />
              </label>

              <label className="inline-flex items-center gap-3 rounded-2xl bg-[#f8fafc] px-4 py-3">
                <input
                  type="checkbox"
                  checked={staffForm.isActive}
                  onChange={(event) => onStaffFormChange('isActive', event.target.checked)}
                />
                <span className="text-sm font-medium text-[#16202a]">Tài khoản đang hoạt động</span>
              </label>

              <button type="submit" className="rounded-2xl bg-[#2d7871] px-5 py-3 text-sm font-semibold text-white">
                {staffFormMode === 'edit' ? 'Lưu nhân sự' : 'Thêm nhân sự'}
              </button>
            </form>
          </section>
        </section>
      ) : null}

      {activeModule === 'inventory' ? (
        <section className="grid gap-5 2xl:grid-cols-[1.35fr_0.65fr]">
          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Danh sách nguyên liệu</h2>
                <p className="mt-1 text-sm text-[#62707f]">Quản lý tồn kho theo danh sách thao tác nhanh</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Tất cả', ...(management.inventoryCategories ?? [])].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onChangeInventoryCategory(category)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                      inventoryCategory === category
                        ? 'border-[#0d9488] bg-[#eef9f7] text-[#2d7871]'
                        : 'border-[#d8e0e7] bg-white text-[#516072]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-3xl border border-[#e7edf2]">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[#fbfcfd] text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                  <tr>
                    <th className="px-4 py-4">Nguyên liệu</th>
                    <th className="px-4 py-4">Số lượng</th>
                    <th className="px-4 py-4">Ngưỡng</th>
                    <th className="px-4 py-4">Trạng thái</th>
                    <th className="px-4 py-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f7] bg-white">
                  {filteredInventory.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <p className="font-semibold text-[#16202a]">{item.name}</p>
                        <p className="mt-1 text-xs text-[#62707f]">{item.category}</p>
                      </td>
                      <td className="px-4 py-4 text-[#516072]">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-[#516072]">
                        {item.threshold} {item.unit}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                            inventoryStatusTone(item.status)
                          )}`}
                        >
                          {item.status === 'IN_STOCK'
                            ? 'Đang dùng'
                            : item.status === 'RESTOCKING'
                              ? 'Cần nhập'
                              : 'Đã hết'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => onStartEditInventory(item)}
                            className="rounded-xl border border-[#d8e0e7] px-3 py-1.5 text-xs font-semibold text-[#16202a]"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteInventoryItem(item.id)}
                            className="rounded-xl border border-[#f0c8c8] px-3 py-1.5 text-xs font-semibold text-[#b85b5b]"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">
                  {inventoryFormMode === 'edit' ? 'Cập nhật nguyên liệu' : 'Thêm nguyên liệu'}
                </h2>
                <p className="mt-1 text-sm text-[#62707f]">Quản lý thông tin nguyên liệu trong kho</p>
              </div>
              {inventoryFormMode === 'edit' ? (
                <button
                  type="button"
                  onClick={onCancelInventoryEdit}
                  className="rounded-2xl border border-[#d8e0e7] px-4 py-2 text-sm font-semibold text-[#516072]"
                >
                  Hủy chỉnh sửa
                </button>
              ) : null}
            </div>

            <form className="mt-5 space-y-4" onSubmit={onSubmitInventoryForm}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#16202a]">Tên nguyên liệu</span>
                <input
                  value={inventoryForm.name}
                  onChange={(event) => onInventoryFormChange('name', event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#16202a]">Danh mục</span>
                  <select
                    value={inventoryForm.category}
                    onChange={(event) => onInventoryFormChange('category', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                  >
                    {(management.inventoryCategories ?? []).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#16202a]">Đơn vị</span>
                  <input
                    value={inventoryForm.unit}
                    onChange={(event) => onInventoryFormChange('unit', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#16202a]">Số lượng</span>
                  <input
                    type="number"
                    min="0"
                    value={inventoryForm.quantity}
                    onChange={(event) => onInventoryFormChange('quantity', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[#16202a]">Ngưỡng tối thiểu</span>
                  <input
                    type="number"
                    min="0"
                    value={inventoryForm.threshold}
                    onChange={(event) => onInventoryFormChange('threshold', event.target.value)}
                    className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-[#16202a]">Trạng thái</span>
                <select
                  value={inventoryForm.status}
                  onChange={(event) => onInventoryFormChange('status', event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-[#d8e0e7] px-4 outline-none focus:border-[#0d9488]"
                >
                  <option value="IN_STOCK">Đang dùng</option>
                  <option value="RESTOCKING">Cần nhập</option>
                  <option value="OUT_OF_STOCK">Đã hết</option>
                </select>
              </label>

              <button type="submit" className="rounded-2xl bg-[#2d7871] px-5 py-3 text-sm font-semibold text-white">
                {inventoryFormMode === 'edit' ? 'Lưu nguyên liệu' : 'Thêm nguyên liệu'}
              </button>
            </form>
          </section>
        </section>
      ) : null}

      {activeModule === 'tables' ? (
        <section className="space-y-5">
          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Tổng quan bàn phục vụ</h2>
                <p className="mt-1 text-sm text-[#62707f]">
                  Theo dõi số lượng bàn đang trống, chờ món, đã đặt trước hoặc cần dọn tương tự trang phục vụ.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:w-[480px]">
                <ManagementStat label="Tổng số bàn" value={`${tableStats.total}`} note="Tất cả bàn đang cấu hình" />
                <ManagementStat label="Bàn đang trống" value={`${tableStats.available}`} note="Sẵn sàng nhận khách" />
                <ManagementStat label="Bàn chờ món" value={`${tableStats.waiting}`} note="Cần theo dõi phục vụ và bếp" />
                <ManagementStat label="Bàn cần dọn" value={`${tableStats.cleaning}`} note="Cần xoay vòng sớm" />
              </div>
            </div>
          </section>

          <section className="grid gap-5 2xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#16202a]">Danh sách bàn</h2>
                  <p className="mt-1 text-sm text-[#62707f]">Thêm, sửa, xóa bàn và điều chỉnh trạng thái vận hành</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['Tất cả', ...(management.tableStatusOptions ?? [])].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onChangeTableStatusFilter(status)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                        tableStatusFilter === status
                          ? 'border-[#0d9488] bg-[#eef9f7] text-[#2d7871]'
                          : 'border-[#d8e0e7] bg-white text-[#516072]'
                      }`}
                    >
                      {status === 'Tất cả' ? status : mapTableStateLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-3xl border border-[#e7edf2]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[#fbfcfd] text-xs font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
                    <tr>
                      <th className="px-4 py-4">Bàn</th>
                      <th className="px-4 py-4">Khu vực</th>
                      <th className="px-4 py-4">Khách / chỗ</th>
                      <th className="px-4 py-4">Trạng thái</th>
                      <th className="px-4 py-4">Thanh toán</th>
                      <th className="px-4 py-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eef2f7] bg-white">
                    {filteredTables.map((table) => (
                      <tr key={table.id}>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-[#16202a]">Bàn {table.tableNumber}</p>
                          <p className="mt-1 text-xs text-[#62707f]">
                            {table.reservationName || 'Không có đặt trước'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-[#516072]">{table.location}</td>
                        <td className="px-4 py-4 text-[#516072]">
                          {table.currentGuests} / {table.capacity}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              getTableStateTone(table.serviceState)
                            )}`}
                          >
                            {mapTableStateLabel(table.serviceState)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-[#516072]">{mapBillingStatusLabel(table.billingStatus)}</td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onStartEditTable(table)}
                              className="rounded-xl border border-[#d8e0e7] px-3 py-1.5 text-xs font-semibold text-[#16202a]"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteTable(table.id)}
                              className="rounded-xl border border-[#f0c8c8] px-3 py-1.5 text-xs font-semibold text-[#b85b5b]"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <TableForm
              locationOptions={management.tableLocations ?? []}
              form={tableForm}
              mode={tableFormMode}
              onChange={onTableFormChange}
              onSubmit={onSubmitTableForm}
              onCancelEdit={onCancelTableEdit}
            />
          </section>
        </section>
      ) : null}

      {activeModule === 'orders' ? (
        <section className="space-y-5">
          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Tổng quan đơn hàng</h2>
                <p className="mt-1 text-sm text-[#62707f]">
                  Danh sách đơn hàng trong hệ thống.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 xl:w-[540px]">
                <ManagementStat label="Tổng đơn" value={`${orderStats.total}`} note="Đơn đang có trong hệ thống" />
                <ManagementStat label="Đơn đang chờ" value={`${orderStats.waiting}`} note="Còn món chưa hoàn tất" />
                <ManagementStat label="Đơn hoàn thành" value={`${orderStats.completed}`} note="Tất cả món đã xong" />
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Danh sách đơn theo bàn</h2>
                <p className="mt-1 text-sm text-[#62707f]">Xem nhanh trạng thái đơn, số món chờ và các trạm đang xử lý</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Tất cả', 'WAITING', 'COMPLETED'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => onChangeOrderStatusFilter(status)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                      orderStatusFilter === status
                        ? 'border-[#0d9488] bg-[#eef9f7] text-[#2d7871]'
                        : 'border-[#d8e0e7] bg-white text-[#516072]'
                    }`}
                  >
                    {status === 'Tất cả' ? status : mapOrderStatusLabel(status)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {filteredOrders.map((order) => (
                <article key={order.orderId} className="rounded-[26px] border border-[#e7edf2] bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#94a3b8]">
                        Bàn {order.tableNumber}
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-[#16202a]">{order.orderNumber}</h3>
                      <p className="mt-1 text-sm text-[#62707f]">
                        {order.orderType} • {order.elapsedMinutes} phút
                      </p>
                      {order.createdAt ? (
                        <p className="mt-1 text-xs font-medium text-[#94a3b8]">
                          Ngày tạo: {formatDateTime(order.createdAt)}
                        </p>
                      ) : null}
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                        getOrderStatusTone(order.status)
                      )}`}
                    >
                      {mapOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#516072]">
                    <span className="rounded-full bg-[#f8fafc] px-3 py-1">{order.pendingItems} món chờ</span>
                    <span className="rounded-full bg-[#f8fafc] px-3 py-1">{order.completedItems} món hoàn tất</span>
                    {order.stations.map((station) => (
                      <span key={station} className="rounded-full bg-[#f8fafc] px-3 py-1">
                        {station}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-[20px] border px-4 py-4 ${
                          item.status === 'COMPLETED'
                            ? 'border-[#d2eadf] bg-[#f5fcf8]'
                            : 'border-[#e7edf2] bg-[#fbfcfd]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-3">
                            <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-sm font-bold text-[#2d7871]">
                              {item.quantity}
                            </span>
                            <div>
                              <h4 className="font-semibold text-[#16202a]">{item.name}</h4>
                              <p className="mt-1 text-sm text-[#62707f]">
                                {item.station}
                                {item.note ? ` • ${item.note}` : ''}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              getOrderStatusTone(item.status)
                            )}`}
                          >
                            {mapOrderStatusLabel(item.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      ) : null}
    </div>
  )
}

export default CentralManagementPage
