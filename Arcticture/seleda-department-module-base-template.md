# SELEDA ERP — Department Module Base Template

> Use this as the starting skeleton for any department (Housekeeping, Front Office, Maintenance, HR, Procurement, Spa, etc.). Fill in each section, then trim what doesn't apply — the goal is a concise, consistent shape across every module, not an exhaustive document.

---

## [Department Name] Module
### Architecture Base Prompt

> Module: [Operations Core / Support / Compliance / etc.]
> Portal type: [Operational / Executive / Hybrid]
> Companion modules: [list 2–4 modules this one talks to most]

---

### 1. Purpose & Scope
One paragraph: what this department does and why it needs a system, in plain terms.

**In scope (Phase 1 base):**
- [3–6 bullets — the core jobs this module must do on day one]

**Explicitly out of scope for base (later phases):**
- [1–3 bullets — things deferred, with a one-line reason]

---

### 2. Core Data Model
The 4–8 entities that matter, in shorthand — not full field-level schema unless the module needs it.

```
Entity
├── Key fields
└── Sub-entity[] (if it has line items / children)
```

---

### 3. Module Breakdown
3–6 sub-sections, one per major capability. Each gets 3–6 bullets max:
- What the workflow is
- Who triggers it
- What state/status it moves through
- Any approval or threshold rule

(This is the section most likely to grow — keep each sub-section tight so the whole doc stays scannable.)

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| [Front-line role] | [What they can do — and can't] |
| [Supervisor role] | [Approval thresholds, overrides] |
| [Manager role] | [Config changes, reporting access] |
| [Cross-module read role] | [What other departments can see, read-only] |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Finance & Accounting Portal | Outbound/Inbound | [Cost postings, budget checks, etc.] |
| [Related operational module] | Bidirectional | [Shared entity or trigger] |
| Executive Portal | Outbound | [KPI tiles this module feeds] |
| System Admin Portal | Bidirectional | [Config, roles, codes] |

---

### 6. Non-Functional Requirements
Pick only what's actually distinctive for this department — don't restate generic boilerplate:
- **Auditability**: [what must be logged]
- **Offline/connectivity**: [does this module need to survive a dropped connection?]
- **Localization**: [Amharic/Tigrinya where guest- or staff-facing]
- **Performance**: [any real-time constraint — e.g. POS speed, housekeeping status refresh]

---

### 7. Suggested Build Sequence
Numbered list, 6–10 steps, ordered so each step is usable before the next depends on it.

---

*This is a base architecture prompt — paste into a fresh module design session and extend with property-specific detail (exact forms, thresholds, staffing structure) as they're confirmed.*

---

## How to use this across departments

- Keep the **shape identical** every time (same 7 sections, same order) — that consistency is what makes the set of module docs feel like one system instead of seven different documents.
- Only Sections 2 and 3 should really change length between departments; if Sections 4–7 balloon, it's usually a sign the module is trying to do too much and should split.
- When a department shares an entity with another module (e.g. "Guest" across Front Office, F&B, and Finance), define it once in whichever module owns it, and reference it by name elsewhere rather than redefining it.
- Suggested department list for SELEDA ERP, if working through them in order: Front Office → Housekeeping → F&B *(done)* → Finance & Accounting *(done)* → Maintenance/Engineering → HR & Payroll → Procurement/Stores (if not fully covered by Finance AP) → Spa/Wellness (if applicable) → Sales & Events (if BEO in F&B isn't sufficient) → Executive Portal *(done)* → System Admin Portal *(done)*.
