// The emulator's data is all Irish (Dublin addresses, Irish negotiators), so
// every date/time is shown and edited in Ireland time regardless of the
// viewer's own browser timezone.
const IRELAND_TZ = 'Europe/Dublin';

// Given a real instant, returns how far (in ms) the wall-clock time in
// `timeZone` is from UTC at that instant — e.g. +3_600_000 during Irish
// summer time (IST, UTC+1), 0 during winter (GMT, UTC+0).
function getTimeZoneOffsetMs(utcDate, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
    .formatToParts(utcDate)
    .reduce((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = Number(p.value);
      return acc;
    }, {});
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour % 24, parts.minute, parts.second);
  return asUtc - utcDate.getTime();
}

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
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: IRELAND_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...opts,
  }).format(d);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: IRELAND_TZ,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Formats a UTC instant as the "YYYY-MM-DDTHH:MM" shape a
// <input type="datetime-local"> needs — using Ireland's wall-clock time, not
// the viewer's own browser timezone.
export function toDateTimeLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IRELAND_TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
    .formatToParts(d)
    .reduce((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value;
      return acc;
    }, {});
  return `${parts.year}-${parts.month}-${parts.day}T${String(Number(parts.hour) % 24).padStart(2, '0')}:${parts.minute}`;
}

// The inverse of toDateTimeLocalInput: takes the "YYYY-MM-DDTHH:MM" value out
// of a datetime-local input — treated as Ireland wall-clock time — and
// returns the matching UTC instant as an ISO string.
export function dublinInputToIso(localValue) {
  if (!localValue) return undefined;
  const [datePart, timePart] = localValue.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = (timePart || '00:00').split(':').map(Number);
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMs = getTimeZoneOffsetMs(new Date(naiveUtcMs), IRELAND_TZ);
  return new Date(naiveUtcMs - offsetMs).toISOString();
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
  const attendee = appointment?.attendee;
  if (!attendee) return '—';
  // Older/seeded records inline the contact; the real appointments API just
  // references an existing applicant/contact/vendor by id + type.
  const contacts = attendee.contacts || [];
  const names = contacts.map((c) => c.name).filter(Boolean);
  if (names.length) return names.join(', ');
  if (attendee.id) return `${titleCase(attendee.type) || 'Attendee'} ${attendee.id}`;
  return '—';
}

export function titleCase(value) {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, (c) => c.toUpperCase());
}
