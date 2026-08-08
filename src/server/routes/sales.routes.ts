import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// =====================
// Sales & Events API
// =====================
router.get('/leads', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('sales_leads').select('*, corporate_accounts(company_name)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/leads', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { leadName, company, contactPerson, contactEmail, contactPhone, source, stage, opportunityValue, expectedCloseDate, assignedTo, corporateAccountId, priority, notes } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const leadNum = `LEAD-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabaseAdmin.from('sales_leads')
      .insert({ lead_number: leadNum, lead_name: leadName, company, contact_person: contactPerson, contact_email: contactEmail, contact_phone: contactPhone, source: source || 'Direct', stage: stage || 'Prospect', opportunity_value: opportunityValue || 0, expected_close_date: expectedCloseDate, assigned_to: assignedTo, corporate_account_id: corporateAccountId, priority: priority || 'Medium', notes })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, lead: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/leads/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { stage, opportunityValue, expectedCloseDate, assignedTo, priority, notes, lostReason, conversionDate } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (stage) updateData.stage = stage;
    if (opportunityValue !== undefined) updateData.opportunity_value = opportunityValue;
    if (expectedCloseDate) updateData.expected_close_date = expectedCloseDate;
    if (assignedTo !== undefined) updateData.assigned_to = assignedTo;
    if (priority) updateData.priority = priority;
    if (notes !== undefined) updateData.notes = notes;
    if (lostReason !== undefined) updateData.lost_reason = lostReason;
    if (conversionDate) updateData.conversion_date = conversionDate;
    const { data, error } = await supabaseAdmin.from('sales_leads').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, lead: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Proposals
router.get('/proposals', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('sales_proposals').select('*, sales_leads(lead_name, company), corporate_accounts(company_name)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/proposals', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { leadId, corporateAccountId, title, eventType, eventDates, guestCount, roomNights, proposedRevenue, discountPercent, termsConditions, validUntil, notes } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const propNum = `PROP-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabaseAdmin.from('sales_proposals')
      .insert({ proposal_number: propNum, lead_id: leadId, corporate_account_id: corporateAccountId, title, event_type: eventType, event_dates: eventDates, guest_count: guestCount || 0, room_nights: roomNights || 0, proposed_revenue: proposedRevenue || 0, discount_percent: discountPercent || 0, terms_conditions: termsConditions, valid_until: validUntil, notes, created_by: req.user!.id, status: 'Draft' })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, proposal: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/proposals/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { status, sentDate, acceptedDate, rejectedDate } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (sentDate) updateData.sent_date = sentDate;
    if (acceptedDate) updateData.accepted_date = acceptedDate;
    if (rejectedDate) updateData.rejected_date = rejectedDate;
    const { data, error } = await supabaseAdmin.from('sales_proposals').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, proposal: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Contracts
router.get('/contracts', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('sales_contracts').select('*, sales_proposals(proposal_number, title), corporate_accounts(company_name)').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/contracts', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { proposalId, leadId, corporateAccountId, title, eventType, startDate, endDate, guestCount, roomNights, totalValue, depositAmount, terms, signedByClient, signedDate } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const contractNum = `CONTRACT-${Date.now().toString().slice(-6)}`;
    const { data, error } = await supabaseAdmin.from('sales_contracts')
      .insert({ contract_number: contractNum, proposal_id: proposalId, lead_id: leadId, corporate_account_id: corporateAccountId, title, event_type: eventType, start_date: startDate, end_date: endDate, guest_count: guestCount || 0, room_nights: roomNights || 0, total_value: totalValue || 0, deposit_amount: depositAmount || 0, terms, signed_by_client: signedByClient, signed_date: signedDate, status: 'Active', created_by: req.user!.id })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, contract: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/contracts/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { status, depositPaid, signedByClient, signedDate } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (depositPaid !== undefined) updateData.deposit_paid = depositPaid;
    if (signedByClient !== undefined) updateData.signed_by_client = signedByClient;
    if (signedDate) updateData.signed_date = signedDate;
    const { data, error } = await supabaseAdmin.from('sales_contracts').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, contract: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Create group block from contract
router.post('/contracts/:id/create-group-block', authenticate, requirePermission('sales:write'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('create_group_block_from_contract', { p_contract_id: req.params.id });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, block: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Create BEO from contract
router.post('/contracts/:id/create-beo', authenticate, requirePermission('sales:write'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('create_beo_from_contract', { p_contract_id: req.params.id });
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, beo: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Corporate Accounts
router.get('/corporate-accounts', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('corporate_accounts').select('*').order('company_name', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/corporate-accounts', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { companyName, contactPerson, contactEmail, contactPhone, discountPercent, creditLimit, creditTerms, billingAddress, taxId, industry, notes } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('corporate_accounts')
      .insert({ company_name: companyName, contact_person: contactPerson, contact_email: contactEmail, contact_phone: contactPhone, discount_percent: discountPercent || 0, credit_limit: creditLimit || 0, credit_terms: creditTerms || 'Net 30', billing_address: billingAddress, tax_id: taxId, industry, notes })
      .select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, account: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/corporate-accounts/:id', authenticate, requirePermission('sales:write'), async (req, res) => {
  const { companyName, contactPerson, contactEmail, contactPhone, discountPercent, creditLimit, creditTerms, billingAddress, taxId, industry, notes, activeBookings, unpaidBalance } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { updated_at: new Date().toISOString() };
    if (companyName !== undefined) updateData.company_name = companyName;
    if (contactPerson !== undefined) updateData.contact_person = contactPerson;
    if (contactEmail !== undefined) updateData.contact_email = contactEmail;
    if (contactPhone !== undefined) updateData.contact_phone = contactPhone;
    if (discountPercent !== undefined) updateData.discount_percent = discountPercent;
    if (creditLimit !== undefined) updateData.credit_limit = creditLimit;
    if (creditTerms !== undefined) updateData.credit_terms = creditTerms;
    if (billingAddress !== undefined) updateData.billing_address = billingAddress;
    if (taxId !== undefined) updateData.tax_id = taxId;
    if (industry !== undefined) updateData.industry = industry;
    if (notes !== undefined) updateData.notes = notes;
    if (activeBookings !== undefined) updateData.active_bookings = activeBookings;
    if (unpaidBalance !== undefined) updateData.unpaid_balance = unpaidBalance;
    const { data, error } = await supabaseAdmin.from('corporate_accounts').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, account: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Group Analytics
router.get('/analytics', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const [leads, contracts, proposals] = await Promise.all([
      supabaseAdmin.from('sales_leads').select('stage, opportunity_value, created_at'),
      supabaseAdmin.from('sales_contracts').select('total_value, status, created_at'),
      supabaseAdmin.from('sales_proposals').select('proposed_revenue, status'),
    ]);
    const totalLeads = leads.data?.length || 0;
    const wonLeads = leads.data?.filter(l => l.stage === 'Won').length || 0;
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;
    const totalPipelineValue = leads.data?.reduce((s, l) => s + Number(l.opportunity_value || 0), 0) || 0;
    const totalContractValue = contracts.data?.reduce((s, c) => s + Number(c.total_value || 0), 0) || 0;
    const totalProposedValue = proposals.data?.reduce((s, p) => s + Number(p.proposed_revenue || 0), 0) || 0;
    const stageCounts: Record<string, number> = {};
    leads.data?.forEach(l => { stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1; });
    return res.json({ totalLeads, wonLeads, conversionRate, totalPipelineValue, totalContractValue, totalProposedValue, stageCounts });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
