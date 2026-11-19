import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../components/ui/Modal.jsx';
import Button, { IconButton } from '../../components/ui/Button.jsx';
import { Input, Label, Select } from '../../components/ui/Field.jsx';
import { Spinner } from '../../components/ui/Feedback.jsx';
import { PlusIcon, TrashIcon } from '../../components/icons.jsx';
import { useUpdateVendor, useVendor } from '../../features/vendors/api.js';
import {
  dublinInputToIso,
  formatDate,
  toDateTimeLocalInput,
  vendorDisplayName,
  vendorEmail,
} from '../../lib/format.js';

const VENDOR_TYPES = ['vendor', 'landlord', 'applicant', 'other'];

function emptyOwner() {
  return {
    id: `CON${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    name: '',
    type: 'contact',
    homePhone: '',
    workPhone: '',
    mobilePhone: '',
    email: '',
    primaryAddress: {
      buildingName: '',
      buildingNumber: '',
      line1: '',
      line2: '',
      line3: '',
      line4: '',
      postcode: '',
    },
  };
}

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
        related: (vendor.related || []).map((owner) => ({
          ...owner,
          primaryAddress: {
            buildingName: '',
            buildingNumber: '',
            line1: '',
            line2: '',
            line3: '',
            line4: '',
            postcode: '',
            ...owner.primaryAddress,
          },
        })),
      });
    } else {
      setForm(null);
    }
  }, [vendor]);

  const addOwner = () => {
    setForm({ ...form, related: [...(form.related || []), emptyOwner()] });
  };

  const removeOwner = (id) => {
    setForm({ ...form, related: form.related.filter((owner) => owner.id !== id) });
  };

  const updateOwner = (id, field, value) => {
    setForm({
      ...form,
      related: form.related.map((owner) => (owner.id === id ? { ...owner, [field]: value } : owner)),
    });
  };

  const updateOwnerAddress = (id, field, value) => {
    setForm({
      ...form,
      related: form.related.map((owner) =>
        owner.id === id ? { ...owner, primaryAddress: { ...owner.primaryAddress, [field]: value } } : owner,
      ),
    });
  };

  const handleSave = async () => {
    if (!form) return;
    const body = {
      typeId: form.typeId || undefined,
      sellingReasonId: form.sellingReasonId || undefined,
      solicitorId: form.solicitorId || undefined,
      lastCall: form.lastCall ? dublinInputToIso(form.lastCall) : undefined,
      nextCall: form.nextCall ? dublinInputToIso(form.nextCall) : undefined,
      related: form.related,
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
      {isLoading || !vendor || !form ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted p-3 text-xs text-muted-foreground">
            <div>
              <div className="font-medium text-muted-foreground">Vendor ID</div>
              <div className="font-mono text-foreground">{vendor.id}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Email</div>
              <div className="text-foreground">{vendorEmail(vendor) || '—'}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Created</div>
              <div className="text-foreground">{formatDate(vendor.created)}</div>
            </div>
            <div>
              <div className="font-medium text-muted-foreground">Negotiator</div>
              <div className="text-foreground">{vendor.negotiatorId || '—'}</div>
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Owners</span>
              <Button type="button" variant="outline" size="sm" onClick={addOwner}>
                <PlusIcon />
                Add owner
              </Button>
            </div>

            {(form.related || []).length === 0 && (
              <p className="text-xs text-muted-foreground">No owners added yet.</p>
            )}

            {(form.related || []).map((owner, index) => (
              <div key={owner.id} className="space-y-3 rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Owner {index + 1}
                    {owner.id ? ` · ${owner.id}` : ''}
                  </span>
                  <IconButton
                    type="button"
                    aria-label="Remove owner"
                    onClick={() => removeOwner(owner.id)}
                  >
                    <TrashIcon />
                  </IconButton>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label htmlFor={`owner-${owner.id}-name`}>Name</Label>
                    <Input
                      id={`owner-${owner.id}-name`}
                      value={owner.name}
                      onChange={(e) => updateOwner(owner.id, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-email`}>Email</Label>
                    <Input
                      id={`owner-${owner.id}-email`}
                      type="email"
                      value={owner.email}
                      onChange={(e) => updateOwner(owner.id, 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-mobilePhone`}>Mobile phone</Label>
                    <Input
                      id={`owner-${owner.id}-mobilePhone`}
                      value={owner.mobilePhone}
                      onChange={(e) => updateOwner(owner.id, 'mobilePhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-workPhone`}>Work phone</Label>
                    <Input
                      id={`owner-${owner.id}-workPhone`}
                      value={owner.workPhone}
                      onChange={(e) => updateOwner(owner.id, 'workPhone', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-homePhone`}>Home phone</Label>
                    <Input
                      id={`owner-${owner.id}-homePhone`}
                      value={owner.homePhone}
                      onChange={(e) => updateOwner(owner.id, 'homePhone', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`owner-${owner.id}-buildingNumber`}>Building number</Label>
                    <Input
                      id={`owner-${owner.id}-buildingNumber`}
                      value={owner.primaryAddress.buildingNumber}
                      onChange={(e) => updateOwnerAddress(owner.id, 'buildingNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-buildingName`}>Building name</Label>
                    <Input
                      id={`owner-${owner.id}-buildingName`}
                      value={owner.primaryAddress.buildingName}
                      onChange={(e) => updateOwnerAddress(owner.id, 'buildingName', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`owner-${owner.id}-line1`}>Address line 1</Label>
                    <Input
                      id={`owner-${owner.id}-line1`}
                      value={owner.primaryAddress.line1}
                      onChange={(e) => updateOwnerAddress(owner.id, 'line1', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor={`owner-${owner.id}-line2`}>Address line 2</Label>
                    <Input
                      id={`owner-${owner.id}-line2`}
                      value={owner.primaryAddress.line2}
                      onChange={(e) => updateOwnerAddress(owner.id, 'line2', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-line4`}>County</Label>
                    <Input
                      id={`owner-${owner.id}-line4`}
                      value={owner.primaryAddress.line4}
                      onChange={(e) => updateOwnerAddress(owner.id, 'line4', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`owner-${owner.id}-postcode`}>Postcode / Eircode</Label>
                    <Input
                      id={`owner-${owner.id}-postcode`}
                      value={owner.primaryAddress.postcode}
                      onChange={(e) => updateOwnerAddress(owner.id, 'postcode', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
