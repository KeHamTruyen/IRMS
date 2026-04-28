function AppFooter({ session, dashboard }) {
  return (
    <footer className="flex flex-wrap gap-4 pt-2.5 text-sm text-[#62707f]">
      <span>Vai trò: {dashboard?.roleLabel ?? session.role}</span>
      <span>Nguồn dữ liệu: {dashboard?.sourceLabel ?? session.source}</span>
      <span>
        {dashboard?.footerNote ?? 'Dữ liệu lấy trực tiếp từ backend'}
      </span>
    </footer>
  )
}

export default AppFooter
