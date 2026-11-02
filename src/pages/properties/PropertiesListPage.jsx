import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCount } from "../../api/useCount.js";
import { ChevronRightIcon, HomeIcon } from "../../components/icons.jsx";
import ListCard from "../../components/ListCard.jsx";
import PageHeader from "../../components/PageHeader.jsx";
import Badge from "../../components/ui/Badge.jsx";
import { IconButton } from "../../components/ui/Button.jsx";
import {
  EmptyState,
  ErrorBanner,
  FullPageSpinner,
} from "../../components/ui/Feedback.jsx";
import { Select } from "../../components/ui/Field.jsx";
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
import { usePropertiesList } from "../../features/properties/api.js";
import { useVendorOptions } from "../../features/vendors/api.js";
import {
  formatAddress,
  formatCurrency,
  formatDate,
  titleCase,
  vendorDisplayName,
} from "../../lib/format.js";

const PAGE_SIZE = 15;

const SELLING_STATUSES = [
  "preAppraisal",
  "valuation",
  "paidValuation",
  "forSale",
  "forSaleUnavailable",
  "underOffer",
  "reserved",
  "exchanged",
  "completed",
  "soldExternally",
  "withdrawn",
];

export default function PropertiesListPage() {
  const [page, setPage] = useState(1);
  const [address, setAddress] = useState("");
  const [sellingStatus, setSellingStatus] = useState("");
  const [vendorId, setVendorId] = useState("");
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } = usePropertiesList({
    page,
    pageSize: PAGE_SIZE,
    address,
    sellingStatus,
    vendorId,
  });
  const { data: vendorOptions } = useVendorOptions();

  const { count: totalCount, isLoading: totalLoading } = useCount(
    "/properties/?pageSize=1",
  );
  const { count: forSaleCount, isLoading: forSaleLoading } = useCount(
    "/properties/?pageSize=1&sellingStatus=forSale",
  );
  const { count: underOfferCount, isLoading: underOfferLoading } = useCount(
    "/properties/?pageSize=1&sellingStatus=underOffer",
  );
  const { count: completedCount, isLoading: completedLoading } = useCount(
    "/properties/?pageSize=1&sellingStatus=completed",
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <PageHeader
        title="Properties"
        subtitle="Instructed properties, their checks, offers and viewings."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard
          icon={HomeIcon}
          label="Total properties"
          value={totalCount ?? "—"}
          loading={totalLoading}
        />
        <StatCard
          icon={HomeIcon}
          label="For sale"
          value={forSaleCount ?? "—"}
          loading={forSaleLoading}
        />
        <StatCard
          icon={HomeIcon}
          label="Under offer"
          value={underOfferCount ?? "—"}
          loading={underOfferLoading}
        />
        <StatCard
          icon={HomeIcon}
          label="Completed"
          value={completedCount ?? "—"}
          loading={completedLoading}
        />
      </div>

      <ListCard
        title="Property list"
        searchValue={address}
        onSearchChange={(v) => {
          setAddress(v);
          setPage(1);
        }}
        searchPlaceholder="Search by address…"
        filters={
          <>
            <Select
              value={vendorId}
              onChange={(e) => {
                setVendorId(e.target.value);
                setPage(1);
              }}
              className="h-9 w-40 rounded-full py-1.5 text-xs"
              placeholder="All vendors"
            >
              <option value="">All vendors</option>
              {(vendorOptions?.items || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {vendorDisplayName(v)}
                </option>
              ))}
            </Select>
            <Select
              value={sellingStatus}
              onChange={(e) => {
                setSellingStatus(e.target.value);
                setPage(1);
              }}
              className="h-9 w-40 rounded-full py-1.5 text-xs"
            >
              <option value="">All statuses</option>
              {SELLING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </>
        }
      >
        {isLoading ? (
          <FullPageSpinner />
        ) : isError ? (
          <div className="p-5">
            <ErrorBanner message={error.message} onRetry={refetch} />
          </div>
        ) : data.items.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No properties found"
              message="Try adjusting the filters."
            />
          </div>
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead className="h-10 px-5">Address</TableHead>
                  <TableHead className="px-5">Status</TableHead>
                  <TableHead className="px-5">Price</TableHead>
                  <TableHead className="px-5">Beds</TableHead>
                  <TableHead className="px-5">Created</TableHead>
                  <TableHead className="px-5 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((property) => (
                  <TableRow
                    key={property.id}
                    className="h-16 cursor-pointer"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <TableCell className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
                          <HomeIcon className="h-4 w-4" strokeWidth={1.5} />
                        </span>
                        <div className="min-w-0">
                          <p
                            className="truncate text-[13px] font-medium text-foreground"
                            title={formatAddress(property.address)}
                          >
                            {formatAddress(property.address)}
                          </p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground">
                            {property.id}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      {property.selling?.status ? (
                        <Badge status={property.selling.status}>
                          {titleCase(property.selling.status)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] font-medium tabular-nums text-foreground">
                      {formatCurrency(
                        property.selling?.price,
                        property.currency,
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] text-muted-foreground">
                      {property.bedrooms ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-3 text-[13px] text-muted-foreground">
                      {formatDate(property.created)}
                    </TableCell>
                    <TableCell className="px-5 py-3">
                      <div className="flex justify-end">
                        <IconButton
                          title="View property"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/properties/${property.id}`);
                          }}
                        >
                          <ChevronRightIcon
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
    </div>
  );
}
