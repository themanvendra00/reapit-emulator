import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProperty } from '../../features/properties/api.js';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs.jsx';
import { FullPageSpinner, ErrorBanner } from '../../components/ui/Feedback.jsx';
import { formatAddress, formatCurrency, titleCase } from '../../lib/format.js';
import OverviewTab from './tabs/OverviewTab.jsx';
import ChecksTab from './tabs/ChecksTab.jsx';
import OffersTab from './tabs/OffersTab.jsx';
import ViewingsTab from './tabs/ViewingsTab.jsx';
import PropertyEditModal from './PropertyEditModal.jsx';

export default function PropertyDetailPage() {
  const { id } = useParams();
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
      <Link to="/properties" className="text-xs font-medium text-foreground hover:underline">
        ← Back to properties
      </Link>

      <div className="mt-3 mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-foreground">
            {formatAddress(property.address)}
          </h1>
          <div className="mt-2 flex items-center gap-2">
            {property.selling?.status && (
              <Badge status={property.selling.status}>
                {titleCase(property.selling.status)}
              </Badge>
            )}
            <span className="text-sm font-medium tabular-nums text-muted-foreground">
              {formatCurrency(property.selling?.price, property.currency)}
            </span>
            <span className="font-mono text-xs text-muted-foreground">{property.id}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          Edit property
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checks">Checks</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="viewings">Viewings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <OverviewTab property={property} />
        </TabsContent>
        <TabsContent value="checks">
          <ChecksTab propertyId={id} />
        </TabsContent>
        <TabsContent value="offers">
          <OffersTab propertyId={id} />
        </TabsContent>
        <TabsContent value="viewings">
          <ViewingsTab propertyId={id} />
        </TabsContent>
      </Tabs>

      <PropertyEditModal
        property={property}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </div>
  );
}
