import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePropertiesList } from '../../features/properties/api.js';
import { useCount } from '../../api/useCount.js';
import PageHeader from '../../components/PageHeader.jsx';
import ListCard from '../../components/ListCard.jsx';
import { Select } from '../../components/ui/Field.jsx';
import Badge from '../../components/ui/Badge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { IconButton } from '../../components/ui/Button.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { FullPageSpinner, ErrorBanner, EmptyState } from '../../components/ui/Feedback.jsx';
import { ChevronRightIcon, HomeIcon } from '../../components/icons.jsx';
import { downloadCsv } from '../../lib/csv.js';
import { formatAddress, formatCurrency, formatDate, titleCase } from '../../lib/format.js';

const PAGE_SIZE = 15;

const SELLING_STATUSES = [
  'preAppraisal',
  'valuation',
  'paidValuation',
  'forSale',
  'forSaleUnavailable',
  'underOffer',
  'reserved',
  'exchanged',
  'completed',
  'soldExternally',
  'withdrawn',
];

export default function PropertiesListPage() {
  const [page, setPage] = useState(1);
  const [address, setAddress] = useState('');
  const [sellingStatus, setSellingStatus] = useState('');
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = usePropertiesList({
    page,
    pageSize: PAGE_SIZE,
    address,
    sellingStatus,
  });

  const { count: totalCount, isLoading: totalLoading } = useCount('/properties/?pageSize=1');
  const { count: forSaleCount, isLoading: forSaleLoading } = useCount(
    '/properties/?pageSize=1&sellingStatus=forSale',
  );
  const { count: underOfferCount, isLoading: underOfferLoading } = useCount(
    '/properties/?pageSize=1&sellingStatus=underOffer',
  );
  const { count: completedCount, isLoading: completedLoading } = useCount(
    '/properties/?pageSize=1&sellingStatus=completed',
  );

  const handleExport = () => {
    if (!data?.items.length) return;
    downloadCsv(
      'properties.csv',
      data.items.map((p) => ({
        id: p.id,
        address: formatAddress(p.address),
        status: p.selling?.status,
        price: p.selling?.price,
        bedrooms: p.bedrooms,
        created: p.created,
      })),
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Properties"
        subtitle="Instructed properties, their checks, offers and viewings."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard icon={HomeIcon} label="Total properties" value={totalCount ?? '—'} loading={totalLoading} />
        <StatCard icon={HomeIcon} label="For sale" value={forSaleCount ?? '—'} loading={forSaleLoading} />
        <StatCard icon={HomeIcon} label="Under offer" value={underOfferCount ?? '—'} loading={underOfferLoading} />
        <StatCard icon={HomeIcon} label="Completed" value={completedCount ?? '—'} loading={completedLoading} />
      </div>

      <ListCard
        title="Property list"
        searchValue={address}
        onSearchChange={(v) => {
          setAddress(v);
          setPage(1);
        }}
        searchPlaceholder="Search by address…"
        onExport={handleExport}
        filters={
          <Select
            value={sellingStatus}
            onChange={(e) => {
              setSellingStatus(e.target.value);
              setPage(1);
            }}
            className="h-9 w-40 rounded-full py-1.5 text-xs"
          >
            <option value="">All statuses</option>
            {SELLING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </Select>
        }
      >
        {isLoading ? (
          <FullPageSpinner />
        ) : isError ? (
          <div className="p-5">
            <ErrorBanner message={error.message} onRetry={refetch} />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No properties found" message="Try adjusting the filters." />
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="h-10 border-b border-line bg-mist text-left text-xs font-medium text-inkmuted">
                <tr>
                  <th className="px-5 font-medium">Address</th>
                  <th className="px-5 font-medium">Status</th>
                  <th className="px-5 font-medium">Price</th>
                  <th className="px-5 font-medium">Beds</th>
                  <th className="px-5 font-medium">Created</th>
                  <th className="px-5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rowline">
                {data.items.map((property) => (
                  <tr
                    key={property.id}
                    className="h-16 cursor-pointer hover:bg-mist"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-mist text-inkmuted">
                          <HomeIcon className="h-4 w-4" strokeWidth={1.5} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-ink" title={formatAddress(property.address)}>
                            {formatAddress(property.address)}
                          </p>
                          <p className="truncate font-mono text-[11px] text-inkmuted">{property.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {property.selling?.status ? (
                        <Badge status={property.selling.status}>
                          {titleCase(property.selling.status)}
                        </Badge>
                      ) : (
                        <span className="text-inkmuted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[13px] font-medium tabular-nums text-ink">
                      {formatCurrency(property.selling?.price, property.currency)}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-inkmuted">{property.bedrooms ?? '—'}</td>
                    <td className="px-5 py-3 whitespace-nowrap text-[13px] text-inkmuted">{formatDate(property.created)}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <IconButton
                          title="View property"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/properties/${property.id}`);
                          }}
                        >
                          <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page}
              totalPages={data.totalPageCount}
              totalCount={data.totalCount}
              onPageChange={setPage}
            />
          </>
        )}
      </ListCard>
    </div>
  );
}
