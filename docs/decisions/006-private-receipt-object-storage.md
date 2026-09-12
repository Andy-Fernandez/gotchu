# ADR 006: Private object storage for receipt claims

- Status: accepted
- Date: 2026-09-12
- Owners: Product founders

## Context

An uploaded QR receipt is evidence for a human-reviewed claim, not proof of payment. Receipt images can contain personal and financial information, may be replaced, and must remain linked to the review history. Storing them in PostgreSQL, on local application disk, or behind public URLs would create poor operational and privacy boundaries for a deployed Next.js application.

The pilot needs a simple upload limit, authorized review access, and a retention rule that does not delete the structured claim, payment, or audit history with the binary file.

## Decision

Store official receipt images in private, managed object storage. PostgreSQL stores the receipt claim, metadata, review decisions, links between replacements, and audit records; it does not store the image binary. The concrete object-storage provider remains open.

- The server validates MIME type and size, generates the object key, and never trusts a client filename or public URL.
- JPEG, PNG, WebP, and HEIC/HEIF are accepted up to 10 MB by default for the pilot.
- The server issues temporary signed upload/download URLs only for the intended flow and only grants review access to an owner or a manager with the explicit financial permission.
- A receipt claim is a separate record from a payment. Claims and review outcomes are append-only in business meaning; a replacement creates a linked claim and preserves the previous file and decision history.
- The default retention target is 180 days after the booking is completed, cancelled, or its refund is resolved. This is subject to legal validation before the paid pilot.
- Retention cleanup may remove the eligible binary object, but it must not remove the structured claim, payment, or audit data solely because the file was removed.

Uploads for files above the hosting function payload limit use a server-authorized direct-to-storage flow; the application does not proxy a 10 MB image through a function.

## Consequences

- Receipt images are not exposed through a public bucket or durable public URL.
- Review screens need short-lived access and must handle an object that has reached retention expiry.
- Replacement and retention jobs need idempotency, audit visibility, and a clear failure path.
- A provider-neutral storage adapter is required, and provider selection remains a pilot activation task.
- Legal review may change the retention period or deletion requirements without changing the distinction between the image and its structured history.

## Alternatives considered

### Store receipt images in PostgreSQL

Rejected because binary storage would couple database growth and backups to image handling and would not simplify private delivery.

### Store on application disk

Rejected because deployed function instances do not provide the durable, shared storage boundary required for evidence.

### Public object URLs

Rejected because receipt images can expose personal and financial information. Access must be temporary and authorized.

### Delete the whole claim after retention

Rejected because the claim, review history, payment facts, and audit records are required for operational and financial traceability.

## Links

- `docs/engineering/architecture.md`
- `docs/domain/domain-model.md`
- `docs/product/core-workflows.md`
- `docs/product/business-rules.md`
- `docs/decisions/004-configurable-booking-and-deposit-policies.md`
