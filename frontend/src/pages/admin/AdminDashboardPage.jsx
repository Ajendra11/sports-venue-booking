import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, Wallet, Building2, Gauge } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getAnalytics } from '../../api/adminApi.js';
import { ErrorState } from '../../components/ui/States.jsx';
import BarList from '../../components/admin/BarList.jsx';

const rupees = (n) => `Rs. ${Number(n || 0).toLocaleString()}`;

/** Headline number — a stat tile, not a chart, because there's nothing to compare. */
function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 text-ink-400">
        <Icon size={15} aria-hidden="true" />
        <span className="text-label uppercase">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums text-ink-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton mb-3 h-3 w-20" />
            <div className="skeleton h-8 w-24" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton mb-4 h-5 w-40" />
            {Array.from({ length: 4 }, (_, j) => <div key={j} className="skeleton mb-3 h-8" />)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setData(await getAnalytics(token));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <ErrorState title="Couldn't load analytics" message={error} onRetry={load} />;

  const { summary, today, byVenue, bySport, byDate } = data;

  return (
    <div className="space-y-6">
      {/* Headline numbers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={CalendarCheck}
          label="Total bookings"
          value={summary.totalBookings.toLocaleString()}
          hint={`${summary.totalHours || 0} hours booked`}
        />
        <StatTile
          icon={Wallet}
          label="Revenue"
          value={rupees(summary.totalRevenue)}
          hint={`Avg ${(summary.avgDuration || 0).toFixed(1)} hr per booking`}
        />
        <StatTile
          icon={Building2}
          label="Venues"
          value={summary.venueCount}
          hint={`${summary.userCount} registered users`}
        />
        <StatTile
          icon={Gauge}
          label="Occupancy today"
          value={`${today.occupancyPct}%`}
          hint={`${today.bookedHours} of ${today.capacityHours} hrs on ${today.date}`}
        />
      </div>

      {/* Today's utilisation — a single proportion, so a meter rather than a chart */}
      <section className="card p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-heading text-ink-900">Today's utilisation</h3>
          <p className="text-sm font-semibold tabular-nums text-ink-700">
            {today.bookedHours} / {today.capacityHours} hours
            <span className="ml-2 text-ink-400">({today.occupancyPct}%)</span>
          </p>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-ink-100"
          role="img"
          aria-label={`Occupancy today: ${today.occupancyPct} percent, ${today.bookedHours} of ${today.capacityHours} bookable hours`}
        >
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-700"
            style={{ width: `${Math.max(today.occupancyPct, today.bookedHours > 0 ? 2 : 0)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Across {summary.venueCount} venues × 16 hourly slots (06:00–22:00)
        </p>
      </section>

      {/* Magnitude comparisons */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BarList
          title="Revenue by venue"
          subtitle="All confirmed bookings to date"
          valueLabel="rupees"
          formatValue={rupees}
          data={byVenue.map((v) => ({
            label: v.venueName,
            value: v.revenue,
            meta: `${v.bookings} booking${v.bookings === 1 ? '' : 's'} · ${v.hours} hr`,
          }))}
          emptyMessage="No bookings recorded yet"
        />

        <BarList
          title="Bookings by sport"
          subtitle="Which sports are in demand"
          valueLabel="bookings"
          data={bySport.map((s) => ({
            label: s._id || 'Unknown',
            value: s.bookings,
            meta: rupees(s.revenue),
          }))}
          emptyMessage="No bookings recorded yet"
        />
      </div>

      {/* Discrete days, so bars rather than a line — the dates aren't contiguous */}
      <BarList
        title="Bookings by date"
        subtitle="Days with at least one confirmed booking"
        valueLabel="bookings"
        data={byDate.map((d) => ({
          label: d._id,
          value: d.bookings,
          meta: rupees(d.revenue),
        }))}
        emptyMessage="No bookings recorded yet"
      />
    </div>
  );
}
