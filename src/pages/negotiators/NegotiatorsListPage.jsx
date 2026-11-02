import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCount } from "../../api/useCount.js";
import { BadgeIcon, PencilIcon } from "../../components/icons.jsx";
import ListCard from "../../components/ListCard.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Avatar from "../../components/ui/Avatar.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button, { IconButton } from "../../components/ui/Button.jsx";
import {
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "../../components/ui/Feedback.jsx";
import { Input, Label } from "../../components/ui/Field.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table.jsx";
import {
  useCreateNegotiator,
  useNegotiatorsList,
  useUpdateNegotiator,
} from "../../features/negotiators/api.js";

const PAGE_SIZE = 15;

export default function NegotiatorsListPage() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingNegotiator, setEditingNegotiator] = useState(null);

  const { data, isLoading, isError, error, refetch } = useNegotiatorsList({
    page,
    pageSize: PAGE_SIZE,
    name,
  });
  const { count: totalCount, isLoading: totalLoading } = useCount(
    "/negotiators/?pageSize=1",
  );
  const { count: activeCount, isLoading: activeLoading } = useCount(
    "/negotiators/?pageSize=1&active=true",
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <PageHeader
        title="Negotiators"
        subtitle="Agents used to staff properties, offers and viewings."
        actions={
          <Button onClick={() => setCreateOpen(true)}>+ New negotiator</Button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          icon={BadgeIcon}
          label="Total negotiators"
          value={totalCount ?? "—"}
          loading={totalLoading}
        />
        <StatCard
          icon={BadgeIcon}
          label="Active"
          value={activeCount ?? "—"}
          loading={activeLoading}
        />
      </div>

      <ListCard
        title="Negotiator list"
        searchValue={name}
        onSearchChange={(v) => {
          setName(v);
          setPage(1);
        }}
        searchPlaceholder="Search by name…"
      >
        {isLoading ? (
          <FullPageSpinner />
        ) : isError ? (
          <div className="p-5">
            <ErrorBanner message={error.message} onRetry={refetch} />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No negotiators found" />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="h-10 px-5">Negotiator</TableHead>
                  <TableHead className="px-5">Job title</TableHead>
                  <TableHead className="px-5">Active</TableHead>
                  <TableHead className="px-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((negotiator) => (
                  <TableRow key={negotiator.id} className="h-16">
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={negotiator.name} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-foreground">
                            {negotiator.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {negotiator.email || "No email on file"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] text-muted-foreground">
                      {negotiator.jobTitle || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <Badge color={negotiator.active ? "success" : "neutral"}>
                        {negotiator.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex justify-end">
                        <IconButton
                          className="h-8 w-8"
                          title="Edit negotiator"
                          onClick={() => setEditingNegotiator(negotiator)}
                        >
                          <PencilIcon
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                        </IconButton>
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
          </>
        )}
      </ListCard>

      <NegotiatorFormModal
        mode="create"
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <NegotiatorFormModal
        mode="edit"
        negotiator={editingNegotiator}
        open={!!editingNegotiator}
        onClose={() => setEditingNegotiator(null)}
      />
    </div>
  );
}

function NegotiatorFormModal({ mode, negotiator, open, onClose }) {
  const isEdit = mode === "edit";
  const createNegotiator = useCreateNegotiator();
  const updateNegotiator = useUpdateNegotiator();
  const saving = isEdit
    ? updateNegotiator.isPending
    : createNegotiator.isPending;

  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    if (isEdit && negotiator && open) {
      setForm({
        name: negotiator.name || "",
        jobTitle: negotiator.jobTitle || "",
        email: negotiator.email || "",
        officeId: negotiator.officeId || "",
        active: negotiator.active ?? true,
      });
    } else if (!isEdit && open) {
      setForm(emptyForm());
    }
  }, [isEdit, negotiator, open]);

  function emptyForm() {
    return { name: "", jobTitle: "", email: "", officeId: "", active: true };
  }

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (isEdit) {
        await updateNegotiator.mutateAsync({
          id: negotiator.id,
          etag: negotiator._eTag,
          body: {
            name: form.name,
            jobTitle: form.jobTitle || undefined,
            email: form.email || undefined,
            active: form.active,
          },
        });
        toast.success("Negotiator updated");
      } else {
        if (!form.officeId.trim()) {
          toast.error("Office ID is required");
          return;
        }
        await createNegotiator.mutateAsync({
          name: form.name,
          jobTitle: form.jobTitle || undefined,
          email: form.email || undefined,
          officeId: form.officeId.trim(),
          active: form.active,
        });
        toast.success("Negotiator created");
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
      title={isEdit ? "Edit negotiator" : "New negotiator"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? "Save changes" : "Create negotiator"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="jobTitle">Job title</Label>
            <Input
              id="jobTitle"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
        </div>
        {!isEdit && (
          <div>
            <Label htmlFor="officeId">Office ID</Label>
            <Input
              id="officeId"
              value={form.officeId}
              onChange={(e) => setForm({ ...form, officeId: e.target.value })}
              placeholder="e.g. OFF01"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 rounded border-border text-foreground focus:ring-ring/30"
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>
    </Modal>
  );
}
