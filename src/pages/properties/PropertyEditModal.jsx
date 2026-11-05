import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, Label, Select } from '../../components/ui/Field.jsx';
import { useUpdateProperty } from '../../features/properties/api.js';
import { useVendorOptions } from '../../features/vendors/api.js';
import { titleCase, vendorDisplayName } from '../../lib/format.js';

const SELLING_STATUSES = [
  'preAppraisal',
  'valuation',
  'paidValuation',
  'forSale',
  'forSaleUnavailable',
  'underOffer',
  'underOfferUnavailable',
  'reserved',
  'exchanged',
  'completed',
  'soldExternally',
  'withdrawn',
];

export default function PropertyEditModal({ property, open, onClose }) {
  const updateProperty = useUpdateProperty();
  const { data: vendorOptions } = useVendorOptions();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (property && open) {
      setForm({
        status: property.selling?.status || '',
        price: property.selling?.price ?? '',
        vendorId: property.selling?.vendorId || '',
        berRating: property.regional?.irl?.buildingEnergyRating?.rating || '',
        negotiatorId: property.negotiatorId || '',
        bedrooms: property.bedrooms ?? '',
        bathrooms: property.bathrooms ?? '',
        receptions: property.receptions ?? '',
        parkingSpaces: property.parkingSpaces ?? '',
      });
    }
  }, [property, open]);

  const handleSave = async () => {
    if (!form) return;
    // The emulator replaces nested objects (selling, regional, etc.) wholesale
    // on PATCH rather than merging field-by-field, so we have to spread the
    // existing nested object back in or unedited fields (tenure, fee,
    // vendorId, refNumber, epi, etc.) get silently dropped.
    const body = {
      selling: {
        ...property.selling,
        status: form.status || undefined,
        price: form.price === '' ? undefined : Number(form.price),
        vendorId: form.vendorId || undefined,
      },
      regional: {
        ...property.regional,
        irl: {
          ...property.regional?.irl,
          buildingEnergyRating: {
            ...property.regional?.irl?.buildingEnergyRating,
            rating: form.berRating || undefined,
          },
        },
      },
      negotiatorId: form.negotiatorId || undefined,
      bedrooms: form.bedrooms === '' ? undefined : Number(form.bedrooms),
      bathrooms: form.bathrooms === '' ? undefined : Number(form.bathrooms),
      receptions: form.receptions === '' ? undefined : Number(form.receptions),
      parkingSpaces: form.parkingSpaces === '' ? undefined : Number(form.parkingSpaces),
    };
    try {
      await updateProperty.mutateAsync({ id: property.id, body, etag: property._eTag });
      toast.success('Property updated');
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!form) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit property"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={updateProperty.isPending}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="status">Selling status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="">—</option>
              {SELLING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="negotiatorId">Negotiator ID</Label>
            <Input
              id="negotiatorId"
              value={form.negotiatorId}
              onChange={(e) => setForm({ ...form, negotiatorId: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="vendorId">Vendor</Label>
            <Select
              id="vendorId"
              value={form.vendorId}
              onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
            >
              <option value="">—</option>
              {(vendorOptions?.items || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {vendorDisplayName(v)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="berRating">BER rating</Label>
            <Input
              id="berRating"
              placeholder="e.g. C3"
              value={form.berRating}
              onChange={(e) => setForm({ ...form, berRating: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input
              id="bedrooms"
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input
              id="bathrooms"
              type="number"
              min="0"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="receptions">Receptions</Label>
            <Input
              id="receptions"
              type="number"
              min="0"
              value={form.receptions}
              onChange={(e) => setForm({ ...form, receptions: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="parkingSpaces">Parking</Label>
            <Input
              id="parkingSpaces"
              type="number"
              min="0"
              value={form.parkingSpaces}
              onChange={(e) => setForm({ ...form, parkingSpaces: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
