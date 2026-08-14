/**
 * Horizontal bar list — magnitude across a handful of named categories.
 *
 * Horizontal (not vertical) because category names are long; one hue rather
 * than a categorical palette because there is a single measure, so colour
 * carries no identity. Every bar is directly labelled, so the value is never
 * conveyed by length alone.
 */
export default function BarList({ title, subtitle, data, valueLabel, formatValue = (v) => v.toLocaleString(), emptyMessage = 'No data yet' }) {
  const max = Math.max(...data.map((d) => d.value), 0);

  return (
    <section className="card p-5">
      <div className="mb-4">
        <h3 className="text-heading text-ink-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-500">{subtitle}</p>}
      </div>

      {data.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-400">{emptyMessage}</p>
      ) : (
        <ol className="space-y-3">
          {data.map((item) => {
            const pct = max > 0 ? (item.value / max) * 100 : 0;
            return (
              <li key={item.label} className="group">
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-ink-700" title={item.label}>
                    {item.label}
                  </span>
                  {/* Direct label: the number is always readable, never inferred from length */}
                  <span className="shrink-0 text-sm font-bold tabular-nums text-ink-900">
                    {formatValue(item.value)}
                  </span>
                </div>
                <div
                  className="h-2 w-full overflow-hidden rounded-full bg-ink-100"
                  role="img"
                  aria-label={`${item.label}: ${formatValue(item.value)}${valueLabel ? ` ${valueLabel}` : ''}`}
                >
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-500 group-hover:bg-brand-700"
                    style={{ width: `${Math.max(pct, item.value > 0 ? 2 : 0)}%` }}
                  />
                </div>
                {item.meta && <p className="mt-1 text-xs text-ink-400">{item.meta}</p>}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
