import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  useCreateViewing,
  usePropertyViewings,
  useUpdateViewing,
} from '../../../features/viewings/api.js';
import { useNegotiatorOptions } from '../../../features/negotiators/api.js';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import { Input, Label, Select, Textarea } from '../../../components/ui/Field.jsx';
import { FullPageSpinner, ErrorBanner, EmptyState } from '../../../components/ui/Feedback.jsx';
import { attendeeNames, formatDateTime, toDateTimeLocalInput } from '../../../lib/format.js';

export default function ViewingsTab({ propertyId }) {
  const { data, isLoading, isError, error, refetch } = usePropertyViewings(propertyId);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingViewing, setEditingViewing] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const updateViewing = useUpdateViewing(propertyId);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await updateViewing.mutateAsync({
        viewingId: cancelTarget.id,
        body: { cancelled: true },
        etag: cancelTarget._eTag,
      });
      toast.success('Viewing cancelled');
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>+ Book viewing</Button>
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : isError ? (
        <ErrorBanner message={error.message} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No viewings booked" message="Book a viewing appointment for this property." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-flat">
          <table className="w-full text-sm">
            <thead className="h-10 border-b border-line bg-mist text-left text-xs font-medium text-inkmuted">
              <tr>
                <th className="px-4 font-medium">Start</th>
                <th className="px-4 font-medium">End</th>
                <th className="px-4 font-medium">Attendee</th>
                <th className="px-4 font-medium">Status</th>
                <th className="px-4 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-rowline">
              {data.items.map((viewing) => (
                <tr key={viewing.id} className="hover:bg-mist">
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] font-medium text-ink">{formatDateTime(viewing.start)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-[13px] text-inkmuted">{formatDateTime(viewing.end)}</td>
                  <td className="px-4 py-3 text-[13px] text-inkmuted">{attendeeNames(viewing)}</td>
                  <td className="px-4 py-3">
                    {viewing.cancelled ? (
                      <Badge color="danger">Cancelled</Badge>
                    ) : (
                      <Badge color="success">Confirmed</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditingViewing(viewing)}>
                        Edit
                      </Button>
                      {!viewing.cancelled && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger-bg"
                          onClick={() => setCancelTarget(viewing)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ViewingFormModal
        mode="create"
        propertyId={propertyId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <ViewingFormModal
        mode="edit"
        propertyId={propertyId}
        viewing={editingViewing}
        open={!!editingViewing}
        onClose={() => setEditingViewing(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel viewing"
        message="The emulator doesn't support deleting appointments — cancelling marks it as cancelled instead. Continue?"
        confirmLabel="Cancel viewing"
        loading={updateViewing.isPending}
        onConfirm={handleCancel}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}

function ViewingFormModal({ mode, propertyId, viewing, open, onClose }) {
  const isEdit = mode === 'edit';
  const createViewing = useCreateViewing(propertyId);
  const updateViewing = useUpdateViewing(propertyId);
  const { data: negotiators } = useNegotiatorOptions();
  const saving = isEdit ? updateViewing.isPending : createViewing.isPending;

  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (isEdit && viewing && open) {
      setForm({
        start: toDateTimeLocalInput(viewing.start),
        end: toDateTimeLocalInput(viewing.end),
        negotiatorId: (viewing.negotiatorIds || [])[0] || '',
        description: viewing.description || '',
      });
    } else if (!isEdit && open) {
      setForm(emptyForm());
    }
  }, [isEdit, viewing, open]);

  function emptyForm() {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 30 * 60_000);
    return {
      start: toDateTimeLocalInput(start.toISOString()),
      end: toDateTimeLocalInput(end.toISOString()),
      negotiatorId: '',
      description: '',
    };
  }

  const handleSubmit = async () => {
    if (!form.start || !form.end) {
      toast.error('Start and end time are required');
      return;
    }
    const body = {
      start: new Date(form.start).toISOString(),
      end: new Date(form.end).toISOString(),
      description: form.description || undefined,
      negotiatorIds: form.negotiatorId ? [form.negotiatorId] : undefined,
    };
    try {
      if (isEdit) {
        await updateViewing.mutateAsync({ viewingId: viewing.id, body, etag: viewing._eTag });
        toast.success('Viewing updated');
      } else {
        await createViewing.mutateAsync(body);
        toast.success('Viewing booked');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit viewing' : 'Book viewing'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Book viewing'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="start">Start</Label>
            <Input
              id="start"
              type="datetime-local"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end">End</Label>
            <Input
              id="end"
              type="datetime-local"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="negotiatorId">Negotiator</Label>
          <Select
            id="negotiatorId"
            value={form.negotiatorId}
            onChange={(e) => setForm({ ...form, negotiatorId: e.target.value })}
          >
            <option value="">—</option>
            {(negotiators?.items || []).map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="description">Notes</Label>
          <Textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
      </div>
    </Modal>
  );
}
