import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import { Input, Label, Select } from '../../components/ui/Field.jsx';
import { Spinner } from '../../components/ui/Feedback.jsx';
import { useUpdateVendor, useVendor } from '../../features/vendors/api.js';
import {
  formatDate,
  toDateTimeLocalInput,
  vendorDisplayName,
  vendorEmail,
} from '../../lib/format.js';

const VENDOR_TYPES = ['vendor', 'landlord', 'applicant', 'other'];

export default function VendorEditModal({ vendorId, onClose }) {
  const open = !!vendorId;
  const { data: vendor, isLoading } = useVendor(vendorId);
  const updateVendor = useUpdateVendor();

  const [form, setForm] = useState(null);

  useEffect(() => {
    if (vendor) {
      setForm({
        typeId: vendor.typeId || '',
        sellingReasonId: vendor.sellingReasonId || '',
        solicitorId: vendor.solicitorId || '',
        lastCall: toDateTimeLocalInput(vendor.lastCall),
        nextCall: toDateTimeLocalInput(vendor.nextCall),
      });
    } else {
      setForm(null);
    }
  }, [vendor]);

  const handleSave = async () => {
    if (!form) return;
    const body = {
      typeId: form.typeId || undefined,
      sellingReasonId: form.sellingReasonId || undefined,
      solicitorId: form.solicitorId || undefined,
      lastCall: form.lastCall ? new Date(form.lastCall).toISOString() : undefined,
      nextCall: form.nextCall ? new Date(form.nextCall).toISOString() : undefined,
    };
    try {
      await updateVendor.mutateAsync({ id: vendorId, body, etag: vendor._eTag });
      toast.success('Vendor updated');
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vendor ? vendorDisplayName(vendor) : 'Vendor'}
      footer={
        form && (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={updateVendor.isPending}>
              Save changes
            </Button>
          </>
        )
      }
    >
      {isLoading || !form ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-line bg-mist p-3 text-xs text-inkmuted">
            <div>
              <div className="font-medium text-inkmuted">Vendor ID</div>
              <div className="font-mono text-ink">{vendor.id}</div>
            </div>
            <div>
              <div className="font-medium text-inkmuted">Email</div>
              <div className="text-ink">{vendorEmail(vendor) || '—'}</div>
            </div>
            <div>
              <div className="font-medium text-inkmuted">Created</div>
              <div className="text-ink">{formatDate(vendor.created)}</div>
            </div>
            <div>
              <div className="font-medium text-inkmuted">Negotiator</div>
              <div className="text-ink">{vendor.negotiatorId || '—'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="typeId">Vendor type</Label>
              <Select
                id="typeId"
                value={form.typeId}
                onChange={(e) => setForm({ ...form, typeId: e.target.value })}
              >
                <option value="">—</option>
                {VENDOR_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="sellingReasonId">Selling reason</Label>
              <Input
                id="sellingReasonId"
                value={form.sellingReasonId}
                onChange={(e) => setForm({ ...form, sellingReasonId: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="solicitorId">Solicitor ID</Label>
              <Input
                id="solicitorId"
                value={form.solicitorId}
                onChange={(e) => setForm({ ...form, solicitorId: e.target.value })}
              />
            </div>
            <div />
            <div>
              <Label htmlFor="lastCall">Last call</Label>
              <Input
                id="lastCall"
                type="datetime-local"
                value={form.lastCall}
                onChange={(e) => setForm({ ...form, lastCall: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="nextCall">Next call</Label>
              <Input
                id="nextCall"
                type="datetime-local"
                value={form.nextCall}
                onChange={(e) => setForm({ ...form, nextCall: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
