# SELEDA ERP — Procurement & Stores Module
### Architecture Base Prompt

> Module: Support / Cross-department
> Portal type: Operational
> Companion modules: Finance & Accounting Portal (AP), F&B, Maintenance/Engineering, Housekeeping

---

### 1. Purpose & Scope
Centralizes purchasing across all departments (F&B, Housekeeping, Maintenance, general) and manages the main store — the single point where goods are received, stocked, and requisitioned out to department stores, feeding both departmental inventory and Finance AP.

**In scope (Phase 1 base):**
- Purchase requisition (from any department) → PO → Goods Receipt
- Supplier/vendor master (shared with Finance AP vendor record)
- Main store inventory (non-F&B general goods: cleaning supplies, guest amenities, office supplies, engineering spares)
- Requisition fulfillment to department stores
- Goods receipt discrepancy handling

**Explicitly out of scope for base (later phases):**
- Live supplier price feed / EDI
- Multi-property centralized procurement (Phase 3)
- E-tendering/RFQ workflow — direct PO in Phase 1

---

### 2. Core Data Model
```
Supplier
├── SupplierID, Name, TIN, Category, PaymentTerms, ContactInfo (shared reference with Finance AP Vendor)

PurchaseRequisition
├── RequisitionID, RaisedBy, Department, Lines[], Status (Draft|Approved|Rejected|ConvertedToPO)

PurchaseOrder
├── POID, SupplierID, RequisitionID(nullable), Lines[], Status (Draft|Sent|PartiallyReceived|Received|Closed)

GoodsReceipt
├── ReceiptID, POID, Lines[] (QtyOrdered vs QtyReceived, QualityCheck), DiscrepancyNotes, ReceivedBy

StoreItem (Main Store Inventory)
├── ItemID, Name, Category (Cleaning|Amenity|Office|EngineeringSpare|General), UnitOfMeasure, ParLevel, CurrentQty, CostAtReceipt

StoreRequisition (Main Store → Department Store)
├── RequisitionID, FromDepartment, Lines[], Status (Draft|Approved|Fulfilled)
```

---

### 3. Module Breakdown

**Purchase Requisition**
- Any department raises a requisition for goods not held in their own store
- Approval threshold by value (department manager vs. General Manager for high-value)

**Purchase Order & Supplier Management**
- Requisition converts to PO against a selected supplier (price list reference, manual update)
- Supplier master shared with Finance AP — one record, not duplicated

**Goods Receipt**
- Receive against PO with quantity/quality check; discrepancy (short-received, damaged, wrong item) logged and routed to supplier follow-up
- Successful receipt updates main store stock and triggers AP bill draft in Finance

**Main Store Inventory**
- Par level and reorder point per item; low-stock alert to Procurement Officer
- Physical stock count workflow (mirrors F&B stock count pattern)

**Store-to-Department Requisition**
- Departments (Housekeeping, Maintenance, general office) requisition from main store; F&B has its own store chain and typically bypasses this for food/beverage-specific items (see F&B module)

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Department Staff | Raise requisition for own department |
| Department Manager | Approve requisition up to threshold |
| Procurement Officer | Create/send PO, receive goods, manage supplier master, main store stock |
| Procurement Manager | Approve PO above threshold, approve high-value requisitions, discrepancy resolution sign-off |
| Finance (cross-module) | Receive goods-receipt-triggered bill drafts, shared supplier master read/write |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Finance & Accounting Portal (AP) | Outbound | Goods receipt → bill draft; shared supplier/vendor master |
| F&B | Bidirectional | Shared supplier master; F&B-specific purchasing may route through its own store chain |
| Maintenance/Engineering | Outbound | Spare parts requisition fulfillment |
| Housekeeping | Outbound | Linen/amenity/cleaning supply requisition fulfillment |
| Executive Portal | Outbound | Purchase spend by category, main store stock value |

---

### 6. Non-Functional Requirements
- **Auditability**: PO approvals and goods receipt discrepancies logged with actor and reason
- **Costing precision**: stock value tracked as fixed-decimal, consistent with Finance and F&B costing approach
- **Localization**: PO documents and requisition forms in English + Amharic/Tigrinya
- **Data consistency**: supplier/vendor record must be a single shared source between this module and Finance AP — no duplicate vendor records

---

### 7. Suggested Build Sequence
1. Supplier master (shared with Finance AP)
2. Purchase requisition + approval workflow
3. PO creation and sending
4. Goods receipt + discrepancy handling
5. Main store inventory + par levels
6. Store-to-department requisition
7. AP bill-draft handoff to Finance
8. Physical stock count + reporting

---

*Base architecture prompt — extend with confirmed supplier list, approval thresholds, and main store item catalog.*
