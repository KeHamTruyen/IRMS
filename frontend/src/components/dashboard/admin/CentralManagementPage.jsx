import { formatCurrency, formatDateTime } from './utils'

function ManagementStat({ label, value, note }) {
  return (
    <article className="rounded-2xl bg-[#f8fafc] p-4">
      <div className="text-sm text-[#62707f]">{label}</div>
      <div className="mt-2 text-2xl font-bold text-[#16202a]">{value}</div>
      <div className="mt-2 text-sm text-[#62707f]">{note}</div>
    </article>
  )
}

function MenuForm({
  categories,
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
            {mode === 'edit' ? 'Chỉnh sửa món' : 'Thêm món mới'}
          </h2>
          <p className="mt-1 text-sm text-[#62707f]">
            Form đang bám theo cấu trúc `menuCatalog.items` và bổ sung trường vận hành cho quản trị.
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

function CentralManagementPage({
  management,
  menuItems,
  activeCategory,
  onChangeCategory,
  form,
  formMode,
  onFormChange,
  onSubmitForm,
  onStartEdit,
  onDeleteItem,
  onCancelEdit,
}) {
  const filteredItems =
    activeCategory === 'Tất cả'
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory)

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0d9488]">7. Administrative Tools</p>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight text-[#16202a]">
              Quản trị tập trung thực đơn
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#62707f]">
              Khu vực này tập trung vào quản lý menu configuration và theo dõi audit logs cho các thay đổi quan trọng.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-1 xl:w-[220px]">
            <ManagementStat
              label="Món trong thực đơn"
              value={`${menuItems.length}`}
              note="Đồng bộ từ dữ liệu menu hiện có"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Quản lý menu</h2>
                <p className="mt-1 text-sm text-[#62707f]">Thêm, sửa, xóa món với dữ liệu fallback bám cấu trúc backend</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Tất cả', ...management.menuCategories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onChangeCategory(category)}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold ${
                      activeCategory === category
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
              {filteredItems.map((item) => (
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
                        onClick={() => onStartEdit(item)}
                        className="rounded-2xl border border-[#d8e0e7] bg-white px-4 py-2 text-sm font-semibold text-[#16202a]"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
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

          <section className="rounded-[28px] border border-[#e7edf2] bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#16202a]">Audit logs</h2>
                <p className="mt-1 text-sm text-[#62707f]">Theo dõi hoàn tiền, hủy đơn và thay đổi cấu hình quan trọng</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#94a3b8]">
                  <tr>
                    <th className="pb-3 font-medium">Thao tác</th>
                    <th className="pb-3 font-medium">Module</th>
                    <th className="pb-3 font-medium">Đối tượng</th>
                    <th className="pb-3 font-medium">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eef2f7]">
                  {management.auditLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="py-3">
                        <div className="font-medium text-[#16202a]">{log.action}</div>
                        <div className="mt-1 text-xs text-[#62707f]">{log.actor}</div>
                      </td>
                      <td className="py-3 text-[#516072]">{log.module}</td>
                      <td className="py-3 text-[#516072]">{log.target}</td>
                      <td className="py-3 text-[#516072]">{formatDateTime(log.occurredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <MenuForm
            categories={management.menuCategories}
            form={form}
            mode={formMode}
            onChange={onFormChange}
            onSubmit={onSubmitForm}
            onCancelEdit={onCancelEdit}
          />
        </div>
      </section>
    </div>
  )
}

export default CentralManagementPage
