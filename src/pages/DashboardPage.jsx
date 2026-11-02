import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useCount } from '../api/useCount.js';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../components/ui/chart.jsx';
import { BadgeIcon, HomeIcon, UsersIcon } from '../components/icons.jsx';
import { titleCase } from '../lib/format.js';

const SELLING_STATUSES = ['forSale', 'underOffer', 'reserved', 'exchanged', 'completed'];

const chartConfig = {
  count: { label: 'Properties', color: 'var(--chart-1)' },
};

export default function DashboardPage() {
  const navigate = useNavigate();

  const { count: vendorsTotal, isLoading: vendorsLoading } = useCount('/vendors/?pageSize=1');
  const { count: propertiesTotal, isLoading: propertiesLoading } = useCount('/properties/?pageSize=1');
  const { count: negotiatorsTotal, isLoading: negotiatorsLoading } = useCount('/negotiators/?pageSize=1');
  const { count: forSaleCount, isLoading: forSaleLoading } = useCount(
    '/properties/?pageSize=1&sellingStatus=forSale',
  );

  // One useCount per selling status — each is a cheap pageSize=1 request, so
  // this stays lightweight while giving the chart real emulator data.
  const statusCounts = SELLING_STATUSES.map((status) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { count, isLoading } = useCount(`/properties/?pageSize=1&sellingStatus=${status}`);
    return { status, count, isLoading };
  });

  const chartData = statusCounts.map(({ status, count }) => ({
    status: titleCase(status),
    count: count ?? 0,
  }));
  const chartLoading = statusCounts.some((s) => s.isLoading);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader title="Dashboard" subtitle="A live snapshot of the Reapit emulator's data." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={UsersIcon}
          label="Vendors"
          value={vendorsTotal ?? '—'}
          loading={vendorsLoading}
        />
        <StatCard
          icon={HomeIcon}
          label="Properties"
          value={propertiesTotal ?? '—'}
          loading={propertiesLoading}
        />
        <StatCard
          icon={BadgeIcon}
          label="Negotiators"
          value={negotiatorsTotal ?? '—'}
          loading={negotiatorsLoading}
        />
        <StatCard
          icon={HomeIcon}
          label="For sale"
          value={forSaleCount ?? '—'}
          loading={forSaleLoading}
          sublabel="current listings"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Properties by selling status</CardTitle>
          <CardDescription>Live counts from the emulator, grouped by status.</CardDescription>
        </CardHeader>
        <CardContent>
          {chartLoading ? (
            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-[260px] w-full">
              <BarChart data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          title="Vendors"
          description="Property owners instructing a sale."
          onClick={() => navigate('/vendors')}
        />
        <QuickLink
          title="Properties"
          description="Listings, offers, viewings and checks."
          onClick={() => navigate('/properties')}
        />
        <QuickLink
          title="Negotiators"
          description="Agents working the pipeline."
          onClick={() => navigate('/negotiators')}
        />
      </div>
    </div>
  );
}

function QuickLink({ title, description, onClick }) {
  return (
    <button onClick={onClick} className="text-left">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </button>
  );
}
