# Reapit Emulator Console

A production-style React + Tailwind admin console for the local Reapit/AgencyCloud
emulator (`http://localhost:3002`, docs at `/api/docs`).

## Stack

- React 18 + React Router (SPA, client-side auth gate)
- Tailwind CSS
- TanStack Query (caching, mutations, optimistic-ish refetching)
- `react-hot-toast` for notifications
- Vite

## Getting started

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. Sign in with the hardcoded demo credentials:

- **Email:** `admin@soleshire.com`
- **Password:** `Emulator@123`

(This gate only protects the admin UI itself — the emulator API has no
authentication, matching the live server.)

The sidebar footer shows the emulator base URL with a live health dot; click it
to point the app at a different emulator instance (defaults to
`http://localhost:3002`, persisted in `localStorage`).

## Features

- **Vendors** — paginated list, filter by email, edit call dates / type /
  selling reason / solicitor (`PATCH /vendors/{id}` with `If-Match`).
- **Properties** — paginated list with address/status filters; detail page with:
  - **Overview** — structured summary of every major field, plus a collapsible
    raw JSON viewer of the full API response.
  - **Checks** — list, add, inline status edit, delete
    (`GET/POST/PATCH/DELETE /properties/{id}/checks`).
  - **Offers** — list, make offer, edit, withdraw.
  - **Viewings** — list, book, edit, cancel (appointments with `typeId=VW`).
  - Edit core property fields (status, price, specification, description).
- **Negotiators** — list, create, edit (used to staff viewings/properties).

### API coverage note

The emulator does not expose `DELETE`/`POST` for every resource:

| Resource    | Create | Update | Delete                                  |
| ----------- | ------ | ------ | ---------------------------------------- |
| Vendors     | ❌ no endpoint | ✅ PATCH | ❌ no endpoint |
| Properties  | ✅ (not wired in UI) | ✅ PATCH | ❌ no endpoint |
| Checks      | ✅ POST | ✅ PATCH | ✅ **DELETE** |
| Offers      | ✅ POST | ✅ PATCH | ❌ — the UI "Withdraw" action sets `status: withdrawn` instead |
| Viewings    | ✅ POST | ✅ PATCH | ❌ — the UI "Cancel" action sets `cancelled: true` instead |
| Negotiators | ✅ POST | ✅ PATCH | ❌ no endpoint |

This mirrors the real Foundations API: vendors/properties/negotiators are
archived rather than hard-deleted, and offers/appointments are
withdrawn/cancelled rather than deleted.

## Project layout

```
src/
  api/            fetch client, ETag handling, base-URL context
  auth/           hardcoded login gate
  components/     shared layout + UI primitives (Modal, Button, Badge, …)
  features/       one file per resource: React Query hooks (list/get/create/update/delete)
  pages/
    vendors/
    properties/   list, detail, edit modal, and checks/offers/viewings tabs
    negotiators/
```
