import { useState } from 'react';
import { toast } from 'sonner';
import { useVendorsList } from '../../features/vendors/api.js';
import { useCount } from '../../api/useCount.js';
import PageHeader from '../../components/PageHeader.jsx';
import ListCard from '../../components/ListCard.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Avatar from '../../components/ui/Avatar.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import { IconButton } from '../../components/ui/Button.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { FullPageSpinner, ErrorBanner, EmptyState } from '../../components/ui/Feedback.jsx';
import { CopyIcon, PencilIcon, UsersIcon } from '../../components/icons.jsx';
import { downloadCsv } from '../../lib/csv.js';
import { vendorDisplayName, vendorEmail, formatDate, titleCase } from '../../lib/format.js';
import VendorEditModal from './VendorEditModal.jsx';

const PAGE_SIZE = 15;

export default function VendorsListPage() {
  const [page, setPage] = useState(1);
  const [email, setEmail] = useState('');
  const [editingVendorId, setEditingVendorId] = useState(null);

  const { data, isLoading, isError, error, refetch } = useVendorsList({
    page,
    pageSize: PAGE_SIZE,
    email,
  });
  const { count: totalVendors, isLoading: countLoading } = useCount('/vendors/?pageSize=1');

  const handleExport = () => {
    if (!data?.items.length) return;
    downloadCsv(
      'vendors.csv',
      data.items.map((v) => ({
        id: v.id,
        name: vendorDisplayName(v),
        email: vendorEmail(v),
        type: v.typeId,
        negotiatorId: v.negotiatorId,
        created: v.created,
      })),
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Vendors"
        subtitle="Property owners instructing a sale, sourced from the emulator."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={UsersIcon} label="Total vendors" value={totalVendors ?? '—'} loading={countLoading} />
        <StatCard
          icon={UsersIcon}
          label="On this page"
          value={data?.items.length ?? '—'}
          loading={isLoading}
        />
        <StatCard
          icon={UsersIcon}
          label="With email on file"
          value={data ? data.items.filter((v) => vendorEmail(v)).length : '—'}
          loading={isLoading}
          sublabel="this page"
        />
      </div>

      <ListCard
        title="Vendor list"
        searchValue={email}
        onSearchChange={(v) => {
          setEmail(v);
          setPage(1);
        }}
        searchPlaceholder="Search by email…"
        onExport={handleExport}
      >
        {isLoading ? (
          <FullPageSpinner />
        ) : isError ? (
          <div className="p-5">
            <ErrorBanner message={error.message} onRetry={refetch} />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No vendors found" message="Try clearing the email filter." />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="h-10 px-5">Vendor</TableHead>
                  <TableHead className="px-5">Type</TableHead>
                  <TableHead className="px-5">Created</TableHead>
                  <TableHead className="px-5">ID</TableHead>
                  <TableHead className="px-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((vendor) => (
                  <TableRow key={vendor.id} className="h-16">
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={vendorDisplayName(vendor)} />
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-foreground">
                            {vendorDisplayName(vendor)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {vendorEmail(vendor) || 'No email on file'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      {vendor.typeId ? (
                        <Badge color="info">{titleCase(vendor.typeId)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] text-muted-foreground">{formatDate(vendor.created)}</TableCell>
                    <TableCell className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{vendor.id}</TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <IconButton
                          className="h-8 w-8"
                          title="Copy vendor ID"
                          onClick={() => {
                            navigator.clipboard?.writeText(vendor.id);
                            toast.success('Vendor ID copied');
                          }}
                        >
                          <CopyIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </IconButton>
                        <IconButton className="h-8 w-8" title="Edit vendor" onClick={() => setEditingVendorId(vendor.id)}>
                          <PencilIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
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

      <VendorEditModal
        vendorId={editingVendorId}
        onClose={() => setEditingVendorId(null)}
      />
    </div>
  );
}
