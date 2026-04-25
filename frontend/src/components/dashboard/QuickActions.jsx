function QuickActions({ actions }) {
  if (!actions.length) return null

  return (
    <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          className="min-h-[110px] rounded-[18px] border border-[#d8e0e7] bg-white p-[18px] text-left transition hover:border-[#0d9488]/40"
        >
          <strong className="block text-[#16202a]">{action.label}</strong>
          <span className="mt-2 block text-sm leading-6 text-[#62707f]">{action.description}</span>
        </button>
      ))}
    </section>
  )
}

export default QuickActions
