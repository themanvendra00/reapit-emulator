import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  useCreateOffer,
  usePropertyOffers,
  useUpdateOffer,
} from '../../../features/offers/api.js';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import { Input, Label, Select, Textarea } from '../../../components/ui/Field.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.jsx';
import Pagination from '../../../components/ui/Pagination.jsx';
import { FullPageSpinner, ErrorBanner, EmptyState } from '../../../components/ui/Feedback.jsx';
import { formatCurrency, formatDate, offerApplicantName, titleCase } from '../../../lib/format.js';

const STATUSES = ['pending', 'noteOfInterest', 'accepted', 'rejected', 'withdrawn'];
const PAGE_SIZE = 20;

export default function OffersTab({ propertyId }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePropertyOffers(propertyId, { page, pageSize: PAGE_SIZE });
  const [createOpen, setCreateOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const updateOffer = useUpdateOffer(propertyId);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await updateOffer.mutateAsync({
        offerId: withdrawTarget.id,
        body: { status: 'withdrawn' },
        etag: withdrawTarget._eTag,
      });
      toast.success('Offer withdrawn');
      setWithdrawTarget(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>+ Make offer</Button>
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : isError ? (
        <ErrorBanner message={error.message} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No offers yet" message="Record an offer from an applicant." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="h-10 px-4">Applicant</TableHead>
                <TableHead className="px-4">Amount</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Date</TableHead>
                <TableHead className="px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="px-4 py-3 text-[13px] font-medium text-foreground">{offerApplicantName(offer)}</TableCell>
                  <TableCell className="px-4 py-3 text-[13px] font-medium tabular-nums text-foreground">
                    {formatCurrency(offer.amount, offer.currency)}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge status={offer.status}>{titleCase(offer.status)}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[13px] text-muted-foreground">{formatDate(offer.date)}</TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setEditingOffer(offer)}>
                        Edit
                      </Button>
                      {offer.status !== 'withdrawn' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger-bg"
                          onClick={() => setWithdrawTarget(offer)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Pagination
            page={page}
            totalPages={data.totalPageCount}
            totalCount={data.totalCount}
            onPageChange={setPage}
          />
        </div>
      )}

      <OfferFormModal
        mode="create"
        propertyId={propertyId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      <OfferFormModal
        mode="edit"
        propertyId={propertyId}
        offer={editingOffer}
        open={!!editingOffer}
        onClose={() => setEditingOffer(null)}
      />

      <ConfirmDialog
        open={!!withdrawTarget}
        title="Withdraw offer"
        message="The emulator doesn't support deleting offers — withdrawing sets its status to “withdrawn” instead. Continue?"
        confirmLabel="Withdraw"
        loading={updateOffer.isPending}
        onConfirm={handleWithdraw}
        onClose={() => setWithdrawTarget(null)}
      />
    </div>
  );
}

function OfferFormModal({ mode, propertyId, offer, open, onClose }) {
  const isEdit = mode === 'edit';
  const createOffer = useCreateOffer(propertyId);
  const updateOffer = useUpdateOffer(propertyId);
  const saving = isEdit ? updateOffer.isPending : createOffer.isPending;

  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (isEdit && offer && open) {
      setForm({
        applicantId: offer.applicantId || '',
        negotiatorId: offer.negotiatorId || '',
        amount: offer.amount ?? '',
        date: offer.date ? offer.date.slice(0, 10) : '',
        status: offer.status || 'pending',
        inclusions: offer.inclusions || '',
        exclusions: offer.exclusions || '',
        conditions: offer.conditions || '',
      });
    } else if (!isEdit && open) {
      setForm(emptyForm());
    }
  }, [isEdit, offer, open]);

  function dateWithCurrentTime(dateStr) {
    if (!dateStr) return undefined;
    const [year, month, day] = dateStr.split('-').map(Number);
    const now = new Date();
    return new Date(
      year,
      month - 1,
      day,
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds(),
    ).toISOString();
  }

  function emptyForm() {
    return {
      applicantId: '',
      negotiatorId: '',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      inclusions: '',
      exclusions: '',
      conditions: '',
    };
  }

  const handleSubmit = async () => {
    if (!isEdit && !form.applicantId.trim()) {
      toast.error('Applicant ID is required');
      return;
    }
    if (!form.amount) {
      toast.error('Amount is required');
      return;
    }
    try {
      if (isEdit) {
        await updateOffer.mutateAsync({
          offerId: offer.id,
          etag: offer._eTag,
          body: {
            negotiatorId: form.negotiatorId || undefined,
            amount: Number(form.amount),
            date: dateWithCurrentTime(form.date),
            status: form.status,
            inclusions: form.inclusions || undefined,
            exclusions: form.exclusions || undefined,
            conditions: form.conditions || undefined,
          },
        });
        toast.success('Offer updated');
      } else {
        await createOffer.mutateAsync({
          applicantId: form.applicantId.trim(),
          negotiatorId: form.negotiatorId || undefined,
          amount: Number(form.amount),
          date: dateWithCurrentTime(form.date),
          status: form.status,
          inclusions: form.inclusions || undefined,
          exclusions: form.exclusions || undefined,
          conditions: form.conditions || undefined,
        });
        toast.success('Offer created');
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
      title={isEdit ? 'Edit offer' : 'Make offer'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Create offer'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="applicantId">Applicant ID</Label>
            <Input
              id="applicantId"
              value={form.applicantId}
              disabled={isEdit}
              onChange={(e) => setForm({ ...form, applicantId: e.target.value })}
              placeholder="e.g. APP001"
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
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="inclusions">Inclusions</Label>
            <Textarea
              id="inclusions"
              rows={2}
              value={form.inclusions}
              onChange={(e) => setForm({ ...form, inclusions: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="exclusions">Exclusions</Label>
            <Textarea
              id="exclusions"
              rows={2}
              value={form.exclusions}
              onChange={(e) => setForm({ ...form, exclusions: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="conditions">Conditions</Label>
            <Textarea
              id="conditions"
              rows={2}
              value={form.conditions}
              onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
