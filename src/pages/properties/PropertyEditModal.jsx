import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, Label, Select, Textarea } from '../../components/ui/Field.jsx';
import { useUpdateProperty } from '../../features/properties/api.js';
import { titleCase } from '../../lib/format.js';

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

export default function PropertyEditModal({ property, open, onClose }) {
  const updateProperty = useUpdateProperty();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (property && open) {
      setForm({
        status: property.selling?.status || '',
        price: property.selling?.price ?? '',
        negotiatorId: property.negotiatorId || '',
        strapline: property.strapline || '',
        description: property.description || '',
        bedrooms: property.bedrooms ?? '',
        bathrooms: property.bathrooms ?? '',
        receptions: property.receptions ?? '',
        parkingSpaces: property.parkingSpaces ?? '',
      });
    }
  }, [property, open]);

  const handleSave = async () => {
    if (!form) return;
    const body = {
      selling: {
        status: form.status || undefined,
        price: form.price === '' ? undefined : Number(form.price),
      },
      negotiatorId: form.negotiatorId || undefined,
      strapline: form.strapline || undefined,
      description: form.description || undefined,
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

        <div>
          <Label htmlFor="strapline">Strapline</Label>
          <Input
            id="strapline"
            value={form.strapline}
            onChange={(e) => setForm({ ...form, strapline: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}
