import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProperty } from '../../features/properties/api.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { FullPageSpinner, ErrorBanner } from '../../components/ui/Feedback.jsx';
import { formatAddress, formatCurrency, titleCase } from '../../lib/format.js';
import OverviewTab from './tabs/OverviewTab.jsx';
import ChecksTab from './tabs/ChecksTab.jsx';
import OffersTab from './tabs/OffersTab.jsx';
import ViewingsTab from './tabs/ViewingsTab.jsx';
import PropertyEditModal from './PropertyEditModal.jsx';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'checks', label: 'Checks' },
  { key: 'offers', label: 'Offers' },
  { key: 'viewings', label: 'Viewings' },
];

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState('overview');
  const [editOpen, setEditOpen] = useState(false);
  const { data: property, isLoading, isError, error, refetch } = useProperty(id);

  if (isLoading) return <FullPageSpinner />;
  if (isError)
    return (
      <div className="mx-auto max-w-5xl px-6 py-8">
        <ErrorBanner message={error.message} onRetry={refetch} />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link to="/properties" className="text-xs font-medium text-ink hover:underline">
        ← Back to properties
      </Link>

      <div className="mt-3 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-ink">
            {formatAddress(property.address)}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {property.selling?.status && (
              <Badge status={property.selling.status}>
                {titleCase(property.selling.status)}
              </Badge>
            )}
            <span className="text-sm font-medium tabular-nums text-inkmuted">
              {formatCurrency(property.selling?.price, property.currency)}
            </span>
            <span className="font-mono text-xs text-inkmuted">{property.id}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          Edit property
        </Button>
      </div>

      <div className="mb-6 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-ink text-ink'
                : 'border-transparent text-inkmuted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && <OverviewTab property={property} />}
      {tab === 'checks' && <ChecksTab propertyId={id} />}
      {tab === 'offers' && <OffersTab propertyId={id} />}
      {tab === 'viewings' && <ViewingsTab propertyId={id} />}

      <PropertyEditModal
        property={property}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
