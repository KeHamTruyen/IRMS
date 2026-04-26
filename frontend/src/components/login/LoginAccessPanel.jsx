const modeButtonClass =
  'min-h-[46px] rounded-xl border border-transparent px-4 text-sm font-semibold transition'

const inputClass =
  'min-h-[60px] rounded-[14px] border border-[#d8e0e7] bg-white px-4 text-[#16202a] outline-none transition placeholder:text-[#94a3b8] focus:border-[#0d9488] focus:ring-2 focus:ring-[#0d9488]/10'

const pinButtonClass =
  'min-h-[62px] rounded-xl border border-[#e7edf2] bg-[#f6f8fa] text-base font-bold text-[#16202a] transition hover:border-[#d8e0e7]'

function AuthModeSwitcher({ authMode, onSelectAuthMode }) {
  return (
    <div
      className="grid grid-cols-2 gap-2 rounded-[14px] bg-[#f3f6f8] p-1.5"
      role="tablist"
      aria-label="Chế độ xác thực"
    >
      <button
        type="button"
        className={`${modeButtonClass} ${authMode === 'employee' ? 'bg-[#0d9488] text-white' : 'bg-white text-[#16202a]'}`}
        onClick={() => onSelectAuthMode('employee')}
      >
        Nhân viên
      </button>
      <button
        type="button"
        className={`${modeButtonClass} ${authMode === 'admin' ? 'bg-[#0d9488] text-white' : 'bg-white text-[#16202a]'}`}
        onClick={() => onSelectAuthMode('admin')}
      >
        Quản trị
      </button>
    </div>
  )
}

function EmployeeRoleSelector({ roles, selectedRole, onSelectRole }) {
  return (
    <div
      className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3"
      role="tablist"
      aria-label="Chọn vai trò nhân viên"
    >
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          className={`min-h-[82px] rounded-xl border px-3.5 py-3 text-left transition ${
            selectedRole === role.id
              ? 'border-[#0d9488] bg-[#0d9488]/8'
              : 'border-[#d8e0e7] bg-white'
          }`}
          onClick={() => onSelectRole(role.id)}
        >
          <span className="block font-bold text-[#16202a]">{role.label}</span>
          <small className="mt-1.5 block text-sm text-[#62707f]">{role.subtitle}</small>
        </button>
      ))}
    </div>
  )
}

function PinDisplay({ pin }) {
  return (
    <div className="grid grid-cols-4 gap-2.5" aria-label="Hiển thị mã PIN">
      {[0, 1, 2, 3].map((slot) => (
        <div
          key={slot}
          className="grid min-h-[60px] place-items-center rounded-[14px] border border-[#d8e0e7] bg-white text-[2rem] text-[#16202a]"
        >
          {pin[slot] ? '•' : ''}
        </div>
      ))}
    </div>
  )
}

function PinPad({ onAppendPin, onRemoveLastPinDigit, onSubmitPinLogin, isSubmitting }) {
  return (
    <div className="grid grid-cols-3 gap-2.5" aria-label="Bàn phím mã PIN">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
        <button
          key={digit}
          type="button"
          className={pinButtonClass}
          onClick={() => onAppendPin(String(digit))}
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        className="min-h-[62px] rounded-xl border border-[#f0d2cb] bg-[#f8e1db] text-base font-bold text-[#b85438]"
        onClick={onRemoveLastPinDigit}
      >
        Xóa
      </button>
      <button type="button" className={pinButtonClass} onClick={() => onAppendPin('0')}>
        0
      </button>
      <button
        type="button"
        className="min-h-[62px] rounded-xl border border-[#0d9488]/15 bg-[#0d9488]/12 text-base font-bold text-[#0d9488]"
        onClick={onSubmitPinLogin}
        disabled={isSubmitting}
      >
        {isSubmitting ? '...' : 'OK'}
      </button>
    </div>
  )
}

function AdminCredentialsForm({
  adminForm,
  onUpdateAdminField,
  onSubmitAdminLogin,
  isSubmitting,
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmitAdminLogin}>
      <label className="flex flex-col gap-2 text-sm text-[#62707f]">
        <span>Tên đăng nhập</span>
        <input
          type="text"
          className={inputClass}
          value={adminForm.username}
          onChange={(event) => onUpdateAdminField('username', event.target.value)}
          placeholder="admin"
          autoComplete="username"
        />
      </label>

      <label className="flex flex-col gap-2 text-sm text-[#62707f]">
        <span>Mật khẩu</span>
        <input
          type="password"
          className={inputClass}
          value={adminForm.password}
          onChange={(event) => onUpdateAdminField('password', event.target.value)}
          placeholder="password123"
          autoComplete="current-password"
        />
      </label>

      <button
        type="submit"
        className="min-h-[52px] rounded-[14px] bg-[#0d9488] px-[18px] font-bold text-white transition hover:bg-[#0b7f76]"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}

function DemoAccessList({ demoAccess }) {
  if (!demoAccess.length) return null

  return (
    <div className="grid gap-2.5 pt-1">
      {demoAccess.map((item) => (
        <div
          key={`${item.role}-${item.label}`}
          className="flex flex-col gap-1 rounded-xl border border-[#e7edf2] bg-[#fbfcfd] px-3.5 py-3 md:flex-row md:items-center md:justify-between md:gap-3"
        >
          <strong>{item.label}</strong>
          <span className="text-sm text-[#62707f]">{item.value}</span>
        </div>
      ))}
    </div>
  )
}

function LoginAccessPanel({
  authMode,
  selectedEmployeeRole,
  employeeRoles,
  pin,
  adminForm,
  authError,
  isSubmitting,
  demoAccess,
  onSelectAuthMode,
  onSelectEmployeeRole,
  onAppendPin,
  onRemoveLastPinDigit,
  onSubmitPinLogin,
  onSubmitAdminLogin,
  onUpdateAdminField,
  onResetPin,
}) {
  return (
    <section className="flex flex-col gap-5 bg-white p-8 md:p-7 lg:p-10">
      <header>
        <h2 className="mt-2 text-[clamp(2rem,2.4vw,2.75rem)] leading-[1.05] tracking-normal text-[#16202a]">
          Chào mừng quay lại!
        </h2>
        <p className="mt-2 text-base leading-7 text-[#62707f]">
          Chọn hình thức đăng nhập phù hợp với vai trò của bạn.
        </p>
      </header>

      <AuthModeSwitcher authMode={authMode} onSelectAuthMode={onSelectAuthMode} />

      {authMode === 'employee' ? (
        <div className="flex flex-col gap-4">
          <EmployeeRoleSelector
            roles={employeeRoles}
            selectedRole={selectedEmployeeRole}
            onSelectRole={onSelectEmployeeRole}
          />

          <div className="flex items-center justify-between">
            <span className="text-sm text-[#62707f]">Mã PIN</span>
            <button
              type="button"
              className="border-none bg-transparent p-0 text-sm font-semibold text-[#0d9488]"
              onClick={onResetPin}
            >
              Làm mới
            </button>
          </div>

          <PinDisplay pin={pin} />
          <PinPad
            onAppendPin={onAppendPin}
            onRemoveLastPinDigit={onRemoveLastPinDigit}
            onSubmitPinLogin={onSubmitPinLogin}
            isSubmitting={isSubmitting}
          />

          {/* <button
            type="button"
            className="min-h-[52px] rounded-[14px] bg-[#0d9488] px-[18px] font-bold text-white transition hover:bg-[#0b7f76]"
            onClick={onSubmitPinLogin}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang xác thực...' : 'Mở dashboard'}
          </button> */}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <AdminCredentialsForm
            adminForm={adminForm}
            onUpdateAdminField={onUpdateAdminField}
            onSubmitAdminLogin={onSubmitAdminLogin}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      <p className={`min-h-6 text-sm ${authError ? 'text-[#b85438]' : 'text-transparent'}`}>
        {authError || ' '}
      </p>

      <DemoAccessList demoAccess={demoAccess} />
    </section>
  )
}

export default LoginAccessPanel
