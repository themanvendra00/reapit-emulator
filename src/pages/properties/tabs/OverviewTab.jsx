import { Section, InfoGrid, InfoItem } from '../../../components/InfoGrid.jsx';
import JsonViewer from '../../../components/ui/JsonViewer.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import {
  formatAddress,
  formatCurrency,
  formatDate,
  formatDateTime,
  titleCase,
} from '../../../lib/format.js';

export default function OverviewTab({ property }) {
  const address = property.address || {};

  return (
    <div>
      <Section title="Address">
        <InfoGrid cols={3}>
          <InfoItem label="Full address">{formatAddress(address)}</InfoItem>
          <InfoItem label="Postcode">{address.postcode}</InfoItem>
          <InfoItem label="Country">{address.countryId}</InfoItem>
        </InfoGrid>
      </Section>

      <Section title="Selling details">
        <InfoGrid cols={3}>
          <InfoItem label="Status">
            {property.selling?.status ? (
              <Badge status={property.selling.status}>
                {titleCase(property.selling.status)}
              </Badge>
            ) : (
              '—'
            )}
          </InfoItem>
          <InfoItem label="Price">
            {formatCurrency(property.selling?.price, property.currency)}
          </InfoItem>
          <InfoItem label="Vendor ID">{property.selling?.vendorId}</InfoItem>
          <InfoItem label="Qualifier">{property.selling?.qualifier}</InfoItem>
          <InfoItem label="Tenure">{property.selling?.tenure?.typeId}</InfoItem>
          <InfoItem label="Instructed">{formatDate(property.selling?.instructed)}</InfoItem>
        </InfoGrid>
      </Section>

      <Section title="Specification">
        <InfoGrid cols={4}>
          <InfoItem label="Bedrooms">{property.bedrooms}</InfoItem>
          <InfoItem label="Bathrooms">{property.bathrooms}</InfoItem>
          <InfoItem label="Receptions">{property.receptions}</InfoItem>
          <InfoItem label="Parking spaces">{property.parkingSpaces}</InfoItem>
        </InfoGrid>
      </Section>

      <Section title="People & office">
        <InfoGrid cols={3}>
          <InfoItem label="Negotiator">{property.negotiatorId}</InfoItem>
          <InfoItem label="Department">{property.departmentId}</InfoItem>
          <InfoItem label="Area">{property.areaId}</InfoItem>
        </InfoGrid>
      </Section>

      <Section title="Marketing">
        <InfoGrid cols={1}>
          <InfoItem label="Strapline">{property.strapline}</InfoItem>
          <InfoItem label="Summary">{property.summary}</InfoItem>
          <InfoItem label="Description">
            <span className="whitespace-pre-wrap">{property.description}</span>
          </InfoItem>
        </InfoGrid>
      </Section>

      <Section title="Record metadata">
        <InfoGrid cols={3}>
          <InfoItem label="Created">{formatDateTime(property.created)}</InfoItem>
          <InfoItem label="Modified">{formatDateTime(property.modified)}</InfoItem>
          <InfoItem label="Property ID">
            <span className="font-mono">{property.id}</span>
          </InfoItem>
        </InfoGrid>
      </Section>

      <JsonViewer data={property} label="Full property response (JSON)" />
    </div>
  );
}
