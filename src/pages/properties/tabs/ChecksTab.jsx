import { useState } from 'react';
import { toast } from 'sonner';
import {
  useCreatePropertyCheck,
  useDeletePropertyCheck,
  usePropertyChecks,
  useUpdatePropertyCheck,
} from '../../../features/checks/api.js';
import Button from '../../../components/ui/Button.jsx';
import Badge from '../../../components/ui/Badge.jsx';
import Modal from '../../../components/ui/Modal.jsx';
import ConfirmDialog from '../../../components/ui/ConfirmDialog.jsx';
import { Input, Label, Select } from '../../../components/ui/Field.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table.jsx';
import { FullPageSpinner, ErrorBanner, EmptyState } from '../../../components/ui/Feedback.jsx';
import { formatDate, titleCase } from '../../../lib/format.js';

const STATUSES = ['needed', 'arranging', 'completed', 'notNeeded'];

export default function ChecksTab({ propertyId }) {
  const { data, isLoading, isError, error, refetch } = usePropertyChecks(propertyId);
  const updateCheck = useUpdatePropertyCheck(propertyId);
  const deleteCheck = useDeletePropertyCheck(propertyId);

  const [addOpen, setAddOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleStatusSave = async (check) => {
    const status = pendingStatus[check.id] ?? check.status;
    if (status === check.status) return;
    try {
      await updateCheck.mutateAsync({ checkId: check.id, body: { status }, etag: check._eTag });
      toast.success('Check updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCheck.mutateAsync(deleteTarget.id);
      toast.success('Check deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setAddOpen(true)}>+ Add check</Button>
      </div>

      {isLoading ? (
        <FullPageSpinner />
      ) : isError ? (
        <ErrorBanner message={error.message} onRetry={refetch} />
      ) : data.items.length === 0 ? (
        <EmptyState title="No checks recorded" message="Add a pre-instruction check to get started." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="h-10 px-4">Description</TableHead>
                <TableHead className="px-4">Type</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4">Updated</TableHead>
                <TableHead className="px-4" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((check) => {
                const currentStatus = pendingStatus[check.id] ?? check.status;
                const dirty = currentStatus !== check.status;
                return (
                  <TableRow key={check.id}>
                    <TableCell className="px-4 py-3 text-[13px] font-medium text-foreground">{check.description}</TableCell>
                    <TableCell className="px-4 py-3 text-[13px] text-muted-foreground">{titleCase(check.type)}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Select
                        className="w-36"
                        value={currentStatus}
                        onChange={(e) =>
                          setPendingStatus({ ...pendingStatus, [check.id]: e.target.value })
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[13px] text-muted-foreground">{formatDate(check.modified)}</TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {dirty && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusSave(check)}
                            loading={updateCheck.isPending}
                          >
                            Save
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-danger hover:bg-danger-bg"
                          onClick={() => setDeleteTarget(check)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AddCheckModal
        propertyId={propertyId}
        open={addOpen}
        onClose={() => setAddOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete check"
        message={`Delete the check “${deleteTarget?.description}”? This can't be undone.`}
        confirmLabel="Delete"
        loading={deleteCheck.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function AddCheckModal({ propertyId, open, onClose }) {
  const createCheck = useCreatePropertyCheck(propertyId);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('needed');

  const reset = () => {
    setDescription('');
    setStatus('needed');
  };

  const handleCreate = async () => {
    if (!description.trim()) {
      toast.error('Description is required');
      return;
    }
    try {
      await createCheck.mutateAsync({
        description: description.trim(),
        type: 'preInstruction',
        status,
      });
      toast.success('Check added');
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Add pre-instruction check"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={createCheck.isPending}>
            Add check
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="checkDescription">Description</Label>
          <Input
            id="checkDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Proof of ownership"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="checkStatus">Status</Label>
          <Select id="checkStatus" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {titleCase(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </Modal>
  );
}
