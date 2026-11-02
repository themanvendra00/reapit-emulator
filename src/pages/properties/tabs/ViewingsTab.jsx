import { useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.jsx';
import { FullPageSpinner, ErrorBanner, EmptyState } from '../../../components/ui/Feedback.jsx';
import {
  attendeeNames,
  dublinInputToIso,
  formatDateTime,
  titleCase,
  toDateTimeLocalInput,
} from '../../../lib/format.js';

const ATTENDEE_TYPES = ['applicant', 'vendor', 'landlord', 'tenant', 'buyer', 'contact'];

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
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="h-10 px-4">Start</TableHead>
                <TableHead className="px-4">End</TableHead>
                <TableHead className="px-4">Attendee</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((viewing) => (
                <TableRow key={viewing.id}>
                  <TableCell className="px-4 py-3 text-[13px] font-medium text-foreground">{formatDateTime(viewing.start)}</TableCell>
                  <TableCell className="px-4 py-3 text-[13px] text-muted-foreground">{formatDateTime(viewing.end)}</TableCell>
                  <TableCell className="px-4 py-3 text-[13px] text-muted-foreground">{attendeeNames(viewing)}</TableCell>
                  <TableCell className="px-4 py-3">
                    {viewing.cancelled ? (
                      <Badge color="danger">Cancelled</Badge>
                    ) : (
                      <Badge color="success">Confirmed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
        followUpOn: viewing.followUpOn || '',
        negotiatorId: (viewing.negotiatorIds || [])[0] || '',
        description: viewing.description || '',
        accompanied: viewing.accompanied ?? true,
        virtual: viewing.virtual ?? false,
        attendeeType: viewing.attendee?.type || 'applicant',
        attendeeId: viewing.attendee?.id || '',
        negotiatorConfirmed: viewing.negotiatorConfirmed ?? true,
        attendeeConfirmed: viewing.attendeeConfirmed ?? false,
        propertyConfirmed: viewing.propertyConfirmed ?? true,
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
      followUpOn: '',
      negotiatorId: '',
      description: '',
      accompanied: true,
      virtual: false,
      attendeeType: 'applicant',
      attendeeId: '',
      negotiatorConfirmed: true,
      attendeeConfirmed: false,
      propertyConfirmed: true,
    };
  }

  const handleSubmit = async () => {
    if (!form.start || !form.end) {
      toast.error('Start and end time are required');
      return;
    }
    const negotiator = (negotiators?.items || []).find((n) => n.id === form.negotiatorId);

    const body = {
      start: dublinInputToIso(form.start),
      end: dublinInputToIso(form.end),
      followUpOn: form.followUpOn || undefined,
      description: form.description || undefined,
      negotiatorIds: form.negotiatorId ? [form.negotiatorId] : undefined,
      organiserId: form.negotiatorId || undefined,
      officeIds: negotiator?.officeId ? [negotiator.officeId] : undefined,
      accompanied: form.accompanied,
      virtual: form.virtual,
      cancelled: false,
      recurrence: { interval: 0, type: null, until: null },
      negotiatorConfirmed: form.negotiatorConfirmed,
      attendeeConfirmed: form.attendeeConfirmed,
      propertyConfirmed: form.propertyConfirmed,
      attendee: form.attendeeId.trim()
        ? { id: form.attendeeId.trim(), type: form.attendeeType }
        : undefined,
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
        <p className="-mt-2 text-xs text-muted-foreground">Times are shown and saved in Irish time (Europe/Dublin).</p>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="attendeeType">Attendee type</Label>
            <Select
              id="attendeeType"
              value={form.attendeeType}
              onChange={(e) => setForm({ ...form, attendeeType: e.target.value })}
            >
              {ATTENDEE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {titleCase(t)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="attendeeId">Attendee ID</Label>
            <Input
              id="attendeeId"
              value={form.attendeeId}
              onChange={(e) => setForm({ ...form, attendeeId: e.target.value })}
              placeholder="e.g. OXF20001"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="followUpOn">Follow up on</Label>
          <Input
            id="followUpOn"
            type="date"
            value={form.followUpOn}
            onChange={(e) => setForm({ ...form, followUpOn: e.target.value })}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              id="accompanied"
              type="checkbox"
              checked={form.accompanied}
              onChange={(e) => setForm({ ...form, accompanied: e.target.checked })}
              className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
            />
            <Label htmlFor="accompanied">Negotiator accompanying</Label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="virtual"
              type="checkbox"
              checked={form.virtual}
              onChange={(e) => setForm({ ...form, virtual: e.target.checked })}
              className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
            />
            <Label htmlFor="virtual">Virtual viewing</Label>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex items-center gap-2">
            <input
              id="allConfirmed"
              type="checkbox"
              checked={form.negotiatorConfirmed && form.attendeeConfirmed && form.propertyConfirmed}
              onChange={(e) => {
                const checked = e.target.checked;
                setForm({
                  ...form,
                  negotiatorConfirmed: checked,
                  attendeeConfirmed: checked,
                  propertyConfirmed: checked,
                });
              }}
              className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
            />
            <Label htmlFor="allConfirmed" className="font-semibold">All confirmed</Label>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 border-t border-border pt-2">
            <div className="flex items-center gap-2">
              <input
                id="negotiatorConfirmed"
                type="checkbox"
                checked={form.negotiatorConfirmed}
                onChange={(e) => setForm({ ...form, negotiatorConfirmed: e.target.checked })}
                className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
              />
              <Label htmlFor="negotiatorConfirmed">Negotiator</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="attendeeConfirmed"
                type="checkbox"
                checked={form.attendeeConfirmed}
                onChange={(e) => setForm({ ...form, attendeeConfirmed: e.target.checked })}
                className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
              />
              <Label htmlFor="attendeeConfirmed">Attendee</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="propertyConfirmed"
                type="checkbox"
                checked={form.propertyConfirmed}
                onChange={(e) => setForm({ ...form, propertyConfirmed: e.target.checked })}
                className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
              />
              <Label htmlFor="propertyConfirmed">Property</Label>
            </div>
          </div>
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
