# AgencyCloud Emulator Admin

A small static (no build step) admin UI for the AgencyCloud/Reapit emulator used by
this service (`AgencyCloudService` / `AGENCY_CLOUD_API_URL`). It talks directly to
the emulator's REST API from the browser — nothing in the Nest app is involved.

Open `index.html` directly in a browser (double-click, or `start index.html`).

- **Base URL** field defaults to `http://13.203.97.0:3001` (the shared dev emulator),
  saved to `localStorage`. Point it at `http://localhost:3002` for a local emulator.
- **Vendors** tab: paginated list (`GET /vendors/`), filter by email.
- **Properties** tab: paginated list (`GET /properties/`), filter by address, shows
  the assigned vendor and negotiator. "Edit" lets you change status, vendor and
  negotiator; "Checks" opens the Pre-Instruction Checks panel; "Offers" and
  "Viewings" jump to those tabs pre-filtered to the property.
- **Offers** tab: paginated list (`GET /offers/`), filter by property ID and status.
- **Viewings** tab: paginated list of `typeId=VW` appointments (`GET /appointments/`),
  filter by property ID.
- **Negotiators** tab: paginated list (`GET /negotiators/`), filter by name.
- **Checks** panel (`GET/POST/PATCH/DELETE /properties/:id/checks`):
  - **Add check**: `POST` with `{ description, type: "preInstruction", status: "needed" }`.
  - **Save** (💾): `PATCH` the row's `description`/`status`, using the `If-Match`
    header with the check's current `_eTag` (required by the emulator).
  - **Delete** (🗑): `DELETE` the check.

Status values supported by the emulator: `needed`, `completed`, `notNeeded`, `arranging`.
