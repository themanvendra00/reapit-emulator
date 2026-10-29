export function formatAddress(address) {
  if (!address) return '—';
  return [
    address.buildingNumber,
    address.buildingName,
    address.line1,
    address.line2,
    address.line3,
    address.postcode,
  ]
    .filter(Boolean)
    .join(', ');
}

export function formatDate(value, opts = {}) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function toDateTimeLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export function formatCurrency(amount, currency = 'GBP') {
  if (amount === undefined || amount === null || amount === '') return '—';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function vendorPrimaryContact(vendor) {
  return (vendor?.related || [])[0] || null;
}

export function vendorDisplayName(vendor) {
  const contact = vendorPrimaryContact(vendor);
  return contact?.name || vendor?.id || 'Unnamed vendor';
}

export function vendorEmail(vendor) {
  const contact = vendorPrimaryContact(vendor);
  return contact?.email || '';
}

export function offerApplicantName(offer) {
  return ((offer?.related || [])[0] || {}).name || offer?.applicantId || '—';
}

export function attendeeNames(appointment) {
  const contacts = appointment?.attendee?.contacts || [];
  const names = contacts.map((c) => c.name).filter(Boolean);
  return names.length ? names.join(', ') : '—';
}

export function titleCase(value) {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}
