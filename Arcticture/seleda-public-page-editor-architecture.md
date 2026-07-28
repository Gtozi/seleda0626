# SELEDA ERP — Public Page Editor
### Architecture Base Prompt

> Module: Guest Experience / Marketing
> Portal type: Admin (content authoring) → publishes to public-facing web
> Companion modules: Guest Portal, Sales & Events, System Admin Portal

---

### 1. Purpose & Scope
A drag-and-drop content builder for the property's public-facing pages (homepage, room types, dining, offers, policies) with a draft/publish workflow — lets non-technical staff update marketing content without touching code.

**In scope (Phase 1 base):**
- Block-based page builder (hero, text, image gallery, room card, offer card, contact)
- Draft/preview/publish workflow with version history
- Legal review gate for policy pages (terms, privacy, cancellation policy) before publish
- Basic SEO fields (title, meta description, slug) per page
- Media library for images used across pages

**Explicitly out of scope for base (later phases):**
- A/B testing of page variants
- Multi-language auto-translation (manual Amharic/Tigrinya content entry in Phase 1)

---

### 2. Core Data Model
```
Page
├── PageID, Slug, Title, Type (Home|RoomType|Dining|Offers|Policy|Custom), Status (Draft|InReview|Published|Archived), SEO (title, meta), CurrentVersionID

PageVersion
├── VersionID, PageID, Blocks[], CreatedBy, CreatedAt, ReviewStatus (nullable, PolicyPages only)

Block
├── BlockID, Type (Hero|Text|ImageGallery|RoomCard|OfferCard|Contact), Content (structured per type), OrderIndex

MediaItem
├── MediaID, FileName, URL, AltText, UploadedBy, UsedOnPages[]

LegalReview
├── ReviewID, PageVersionID, ReviewedBy, Status (Pending|Approved|Rejected), Comments
```

---

### 3. Module Breakdown

**Page Builder**
- Drag-and-drop block arrangement, live preview at desktop/mobile breakpoints
- Reusable block types with structured content fields (not free-form HTML) to keep output consistent and safe

**Draft/Publish Workflow**
- Draft → Preview → (Legal Review if Policy page) → Publish
- Version history retained; rollback to a prior published version supported
- Publishing a new version replaces the live page atomically — no partial-publish state visible to the public

**Legal Review Gate**
- Any page tagged `Type: Policy` cannot move to Published without an Approved LegalReview record tied to that specific version
- Rejected review sends the version back to Draft with comments

**SEO & Media**
- Per-page title/meta/slug fields
- Central media library so images are uploaded once and reused across pages (room galleries, offer banners)

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Marketing/Content Editor | Create/edit drafts, upload media, submit for review |
| Legal/Compliance Reviewer | Approve/reject policy page versions only — no general content edit rights |
| Marketing Manager | Publish non-policy pages, manage SEO fields, rollback versions |
| General Manager | Publish policy pages after legal approval |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Guest Portal | Outbound | Published page content rendered on the public site |
| Sales & Events | Inbound | Offer/package details surfaced as Offer Card blocks |
| System Admin Portal | Bidirectional | Role/permission config |

---

### 6. Non-Functional Requirements
- **Auditability**: every publish action and legal review decision logged with actor and timestamp
- **Safety**: policy pages must be structurally incapable of reaching Published without a recorded Approved review — this is a hard gate, not a checklist reminder
- **Localization**: block content fields support English + Amharic/Tigrinya per page, not just a single locale
- **Performance**: published pages must load fast on the public site regardless of admin-side builder complexity

---

### 7. Suggested Build Sequence
1. Block types + page builder UI
2. Draft/preview workflow
3. Publish workflow + version history/rollback
4. Legal review gate for policy pages
5. Media library
6. SEO fields
7. Guest Portal rendering integration

---

*Base architecture prompt — extend with the actual page inventory (which pages exist today) and legal reviewer assignment as confirmed.*
