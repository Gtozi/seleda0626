-- ======================================================================================
-- SEED INVENTORY DEMO DATA
-- Populates all inventory portal tables with realistic hotel ERP data
-- ======================================================================================

-- Suppliers (aligned with frontend defaults)
insert into inventory_suppliers (id, code, name, contact_person, phone, email, status, rating) values
('S-001', 'SUP-001', 'Global Foods Ltd', 'Account Manager', '+1 234 567 890', 'sales@globalfoods.com', 'Active', 5),
('S-002', 'SUP-002', 'Luxe Hospitality Supplies', 'Operations Lead', '+1 987 654 321', 'orders@luxesupplies.pro', 'Active', 5),
('S-003', 'SUP-003', 'Prime Meats & Poultry', 'Sales Representative', '+1 555 123 456', 'sales@primemeats.com', 'Active', 4),
('S-004', 'SUP-004', 'Metro Office Solutions', 'Client Services', '+1 444 888 999', 'support@metro-office.com', 'Inactive', 3),
('S-005', 'SUP-005', 'Technical Maintenance Parts', 'Fleet Supervisor', '+1 222 333 444', 'service@techmaintenance.net', 'Active', 5)
on conflict (id) do nothing;

-- Inventory Items (diverse categories, all mapped columns)
insert into inventory_items (
  id, code, name, category, subcategory, unit, brand, supplier_id,
  max_stock, reorder_level, last_cost, avg_cost, current_stock,
  location, barcode, store_id, stock, price, min_stock,
  retail_price, sale_price, guest_portal_active, image_url, dietary_tags
) values
('I-001', 'FVG-001', 'Fresh Organic Tomatoes', 'Food & Beverage', 'Fresh Produce', 'kg', 'GreenFields', 'S-001', 500, 50, 12.50, 12.50, 120, 'Central Warehouse', '8901234567890', 'ST-MAIN', 120, 12.50, 30, 0.00, 0.00, false, null, '{}'),
('I-002', 'FVG-002', 'Chicken Breast Fillet', 'Food & Beverage', 'Meat & Poultry', 'kg', 'Prime Farms', 'S-003', 300, 40, 45.00, 45.00, 85, 'Central Warehouse', '8901234567891', 'ST-MAIN', 85, 45.00, 20, 0.00, 0.00, false, null, '{}'),
('I-003', 'FVB-003', 'Mineral Water 500ml', 'Food & Beverage', 'Beverages', 'pcs', 'AquaPure', 'S-001', 2000, 200, 3.50, 3.50, 450, 'Bar Store', '8901234567892', 'ST-BAR', 450, 3.50, 100, 8.00, 6.00, true, null, array['Vegetarian','Vegan']),
('I-004', 'HKG-001', 'Luxury Shampoo 30ml', 'Housekeeping', 'Guest Amenities', 'pcs', 'LuxeScent', 'S-002', 5000, 500, 1.20, 1.20, 1200, 'Housekeeping Central', '8901234567893', 'ST-HK', 1200, 1.20, 200, 5.00, 4.00, true, null, '{}'),
('I-005', 'HKC-002', 'All-Purpose Cleaner', 'Housekeeping', 'Cleaning Chemicals', 'ltr', 'CleanMax', 'S-002', 200, 30, 18.00, 18.00, 45, 'Housekeeping Central', '8901234567894', 'ST-HK', 45, 18.00, 10, 0.00, 0.00, false, null, array['Eco-Friendly']),
('I-006', 'ENG-001', 'LED Bulb 9W', 'Engineering', 'Electrical', 'pcs', 'BrightLight', 'S-005', 300, 50, 8.50, 8.50, 95, 'Engineering Plant Store', '8901234567895', 'ST-ENG', 95, 8.50, 20, 0.00, 0.00, false, null, '{}'),
('I-007', 'ENP-002', 'PVC Pipe 20mm', 'Engineering', 'Plumbing', 'mtr', 'FlowTech', 'S-005', 500, 60, 6.00, 6.00, 130, 'Engineering Plant Store', '8901234567896', 'ST-ENG', 130, 6.00, 25, 0.00, 0.00, false, null, '{}'),
('I-008', 'OFF-001', 'A4 Copy Paper Ream', 'Office Supplies', 'Stationery', 'pcs', 'PaperMills', 'S-004', 100, 20, 12.00, 12.00, 35, 'Central Warehouse', '8901234567897', 'ST-MAIN', 35, 12.00, 10, 0.00, 0.00, false, null, '{}'),
('I-009', 'OFF-002', 'Ink Cartridge HP-63', 'Office Supplies', 'Printing', 'pcs', 'HP', 'S-004', 50, 10, 45.00, 45.00, 18, 'Central Warehouse', '8901234567898', 'ST-MAIN', 18, 45.00, 5, 0.00, 0.00, false, null, '{}'),
('I-010', 'GFT-001', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 200, 30, 8.00, 8.00, 60, 'Gift Store', '8901234567899', 'ST-GIFT', 60, 8.00, 15, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),
('I-011', 'GFT-002', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 100, 10, 2.00, 2.00, 40, 'Gift Store', '8901234567900', 'ST-GIFT', 40, 2.00, 5, 5.00, 0.00, true, null, '{}'),
('I-012', 'FVB-004', 'Ethiopian Coffee Beans 1kg', 'Food & Beverage', 'Beverages', 'kg', 'Habesha Roast', 'S-001', 100, 15, 35.00, 35.00, 28, 'Restaurant Store', '8901234567901', 'ST-REST', 28, 35.00, 10, 45.00, 40.00, true, null, array['Organic','Fair Trade']),
('I-013', 'FVD-005', 'Mozzarella Cheese Block', 'Food & Beverage', 'Dairy', 'kg', 'DairyGold', 'S-001', 80, 10, 28.00, 28.00, 22, 'Restaurant Store', '8901234567902', 'ST-REST', 22, 28.00, 8, 0.00, 0.00, false, null, array['Vegetarian']),
('I-014', 'HKL-003', 'Linen Bed Sheets King', 'Housekeeping', 'Laundry Supplies', 'pcs', 'SoftThread', 'S-002', 150, 25, 65.00, 65.00, 40, 'Housekeeping Central', '8901234567903', 'ST-HK', 40, 65.00, 15, 0.00, 0.00, false, null, '{}'),
('I-015', 'ENG-003', 'Air Filter 16x25x1', 'Engineering', 'HVAC', 'pcs', 'FilterPro', 'S-005', 80, 15, 22.00, 22.00, 18, 'Engineering Plant Store', '8901234567904', 'ST-ENG', 18, 22.00, 8, 0.00, 0.00, false, null, '{}'),
('I-016', 'OFC-001', 'Ballpoint Pen Black', 'Office Supplies', 'Stationery', 'pcs', 'WriteWell', 'S-004', 200, 30, 1.50, 1.50, 45, 'Front Office Store', '8901234567905', 'ST-OFC', 45, 1.50, 15, 0.00, 0.00, false, null, '{}'),
('I-017', 'OFC-002', 'Sticky Notes 3x3 Yellow', 'Office Supplies', 'Stationery', 'pcs', 'Post-it', 'S-004', 100, 20, 4.00, 4.00, 30, 'Front Office Store', '8901234567906', 'ST-OFC', 30, 4.00, 10, 0.00, 0.00, false, null, '{}'),
('I-018', 'OFC-003', 'Thermal Paper Roll 80mm', 'Office Supplies', 'Printing', 'pcs', 'PrintTech', 'S-004', 80, 15, 12.00, 12.00, 22, 'Front Office Store', '8901234567907', 'ST-OFC', 22, 12.00, 8, 0.00, 0.00, false, null, '{}'),
('I-019', 'OFC-004', 'Room Key Cards Pack', 'Office Supplies', 'Consumables', 'pcs', 'SecureKey', 'S-005', 500, 50, 3.00, 3.00, 120, 'Front Office Store', '8901234567908', 'ST-OFC', 120, 3.00, 30, 0.00, 0.00, false, null, '{}'),
('I-020', 'GFT-003', 'Hotel Branded Mug', 'Gift Shop', 'Souvenirs', 'pcs', 'CeramicCraft', 'S-002', 300, 40, 8.00, 8.00, 80, 'Central Warehouse', '8901234567909', 'ST-MAIN', 80, 8.00, 20, 18.00, 15.00, true, 'https://example.com/mug.jpg', '{}'),
('I-021', 'GFT-004', 'Spa Voucher Card', 'Gift Shop', 'Souvenirs', 'pcs', 'InHouse', 'S-002', 150, 20, 2.00, 2.00, 60, 'Central Warehouse', '8901234567910', 'ST-MAIN', 60, 2.00, 10, 5.00, 0.00, true, null, '{}'),
('I-022', 'GFT-005', 'Local Coffee Blend', 'Gift Shop', 'Souvenirs', 'pcs', 'Habesha Roast', 'S-003', 200, 30, 10.00, 10.00, 55, 'Central Warehouse', '8901234567911', 'ST-MAIN', 55, 10.00, 15, 24.00, 20.00, true, null, '{}'),
('I-023', 'GFT-006', 'Crystal Keepsake', 'Gift Shop', 'Souvenirs', 'pcs', 'ArtisanGlass', 'S-002', 80, 15, 40.00, 40.00, 25, 'Central Warehouse', '8901234567912', 'ST-MAIN', 25, 40.00, 8, 95.00, 80.00, true, null, '{}')
on conflict (id) do nothing;

-- Requisitions
insert into inventory_requisitions (id, number, department, requested_by, request_date, priority, status, items) values
('REQ-001', 'REQ-0001', 'Housekeeping', 'Alice Johnson', '2026-06-01', 'Normal', 'Issued', '[{"itemId":"I-004","name":"Luxury Shampoo 30ml","requestedQty":200,"issuedQty":200,"unit":"pcs","cost":1.20},{"itemId":"I-005","name":"All-Purpose Cleaner","requestedQty":10,"issuedQty":10,"unit":"ltr","cost":18.00}]'::jsonb),
('REQ-002', 'REQ-0002', 'Restaurant', 'Chef Marco', '2026-06-05', 'High', 'Approved', '[{"itemId":"I-001","name":"Fresh Organic Tomatoes","requestedQty":50,"issuedQty":0,"unit":"kg","cost":12.50},{"itemId":"I-012","name":"Ethiopian Coffee Beans 1kg","requestedQty":5,"issuedQty":0,"unit":"kg","cost":35.00}]'::jsonb),
('REQ-003', 'REQ-0003', 'Engineering', 'Tom Bradley', '2026-06-08', 'Urgent', 'Pending', '[{"itemId":"I-006","name":"LED Bulb 9W","requestedQty":20,"issuedQty":0,"unit":"pcs","cost":8.50},{"itemId":"I-015","name":"Air Filter 16x25x1","requestedQty":10,"issuedQty":0,"unit":"pcs","cost":22.00}]'::jsonb),
('REQ-004', 'REQ-0004', 'Front Office', 'Sarah Lee', '2026-06-10', 'Normal', 'Received', '[{"itemId":"I-003","name":"Mineral Water 500ml","requestedQty":100,"issuedQty":100,"unit":"pcs","cost":3.50}]'::jsonb)
on conflict (id) do nothing;

-- Stock Movements
insert into inventory_stock_movements (id, date, item_id, item_name, type, quantity, cost, reference, "user", store_from, store_to) values
('M-001', '2026-06-01', 'I-001', 'Fresh Organic Tomatoes', 'Purchase', 120, 12.50, 'GRN-0001', 'John Storekeeper', null, 'Central Warehouse'),
('M-002', '2026-06-01', 'I-004', 'Luxury Shampoo 30ml', 'Purchase', 500, 1.20, 'GRN-0001', 'John Storekeeper', null, 'Housekeeping Central'),
('M-003', '2026-06-02', 'I-004', 'Luxury Shampoo 30ml', 'Issue', -200, 1.20, 'REQ-0001', 'Alice Johnson', 'Housekeeping Central', null),
('M-004', '2026-06-03', 'I-006', 'LED Bulb 9W', 'Purchase', 50, 8.50, 'GRN-0002', 'John Storekeeper', null, 'Engineering Plant Store'),
('M-005', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', -50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),
('M-006', '2026-06-04', 'I-003', 'Mineral Water 500ml', 'Transfer', 50, 3.50, 'ST-TX-001', 'Tom Bradley', 'Bar Store', 'Restaurant Store'),
('M-007', '2026-06-05', 'I-012', 'Ethiopian Coffee Beans 1kg', 'Adjustment', -2, 35.00, 'ADJ-001', 'System', 'Restaurant Store', null),
('M-008', '2026-06-06', 'I-010', 'Hotel Branded Mug', 'Damage', -3, 8.00, 'DMG-001', 'Gift Shop Supervisor', 'Gift Store', null),
('M-009', '2026-06-07', 'I-002', 'Chicken Breast Fillet', 'Purchase', 40, 45.00, 'GRN-0003', 'John Storekeeper', null, 'Central Warehouse')
on conflict (id) do nothing;

-- Goods Received Notes (GRNs)
insert into inventory_grns (id, number, supplier_id, supplier_name, purchase_order_id, delivery_note, invoice_number, received_date, receiver, items, total_value) values
('GRN-001', 'GRN-2026-0001', 'S-001', 'Global Foods Ltd', 'PO-5023', 'DN-12345', 'INV-4001', '2026-06-01', 'John Storekeeper',
'[{"itemId":"I-001","name":"Fresh Organic Tomatoes","receivedQty":120,"unitCost":12.50,"batchNumber":"B-105","expiryDate":"2027-04-15"},{"itemId":"I-004","name":"Luxury Shampoo 30ml","receivedQty":500,"unitCost":1.20,"batchNumber":"B-203","expiryDate":"2028-01-01"}]'::jsonb, 2100.00),
('GRN-002', 'GRN-2026-0002', 'S-005', 'Technical Maintenance Parts', 'PO-5024', 'DN-12346', 'INV-4002', '2026-06-03', 'John Storekeeper',
'[{"itemId":"I-006","name":"LED Bulb 9W","receivedQty":50,"unitCost":8.50,"batchNumber":"B-301","expiryDate":"2030-12-31"},{"itemId":"I-015","name":"Air Filter 16x25x1","receivedQty":10,"unitCost":22.00,"batchNumber":"B-302","expiryDate":"2030-12-31"}]'::jsonb, 645.00),
('GRN-003', 'GRN-2026-0003', 'S-003', 'Prime Meats & Poultry', 'PO-5025', 'DN-12347', 'INV-4003', '2026-06-07', 'John Storekeeper',
'[{"itemId":"I-002","name":"Chicken Breast Fillet","receivedQty":40,"unitCost":45.00,"batchNumber":"B-401","expiryDate":"2026-06-14"}]'::jsonb, 1800.00)
on conflict (id) do nothing;
