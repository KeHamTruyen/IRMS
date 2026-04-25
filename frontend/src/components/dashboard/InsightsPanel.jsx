function InsightsPanel({ highlights }) {
  return (
    <section className="grid gap-3.5">
      {highlights.map((highlight) => (
        <article
          key={highlight.title}
          className={`min-h-[160px] rounded-[18px] border p-5 ${
            highlight.emphasis === 'dark'
              ? 'border-[#1e293b] bg-[#1e293b] text-[#f8fafc]'
              : 'border-[#d8e0e7] bg-white text-[#16202a]'
          }`}
        >
          <span
            className={`text-sm ${
              highlight.emphasis === 'dark' ? 'text-[#f8fafc]/80' : 'text-[#62707f]'
            }`}
          >
            {highlight.kicker}
          </span>
          <strong className="mt-2 block text-base">{highlight.title}</strong>
          <p
            className={`mt-2 text-sm leading-6 ${
              highlight.emphasis === 'dark' ? 'text-[#f8fafc]/80' : 'text-[#62707f]'
            }`}
          >
            {highlight.description}
          </p>
        </article>
      ))}
    </section>
  )
}

export default InsightsPanel
