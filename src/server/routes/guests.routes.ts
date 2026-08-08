import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sessionService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Guest CRUD (uses supabaseAdmin to bypass RLS) ──────────────────

// GET /api/guests — list all guests (raw DB rows, snake_case)
router.get('/', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { data, error } = await supabaseAdmin
      .from('guests')
      .select('*')
      .order('name', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ guests: data || [] });
  } catch (error) {
    console.error('Guests fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch guests' });
  }
});

// POST /api/guests — upsert a guest (accepts snake_case from mapGuestToDb)
router.post('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const payload = req.body;

    // Validate required fields
    if (!payload.id || !payload.name || !payload.email) {
      return res.status(400).json({ error: 'id, name, and email are required' });
    }

    const { error } = await supabaseAdmin
      .from('guests')
      .upsert(payload, { onConflict: 'id' });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true });
  } catch (error) {
    console.error('Guest upsert error:', error);
    return res.status(500).json({ error: 'Failed to upsert guest' });
  }
});

// ID Card Upload for Check-In
router.post('/:id/id-card', authenticate, requirePermission('reservation:check_in'), async (req, res) => {
  const guestId = req.params.id;
  const { docType, docNumber, expiryDate, issueDate, issuingCountry, frontImageBase64, backImageBase64 } = req.body;

  if (!docType || !docNumber || !expiryDate) {
    return res.status(400).json({ error: 'docType, docNumber, and expiryDate are required' });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    let frontImageUrl = null;
    let backImageUrl = null;

    // Upload front image if provided
    if (frontImageBase64) {
      const frontBuffer = Buffer.from(frontImageBase64, 'base64');
      const frontFileName = `${guestId}-front-${Date.now()}.jpg`;
      const frontFilePath = `id-cards/${frontFileName}`;
      
      const { error: frontError } = await supabaseAdmin
        .storage
        .from('id-cards')
        .upload(frontFilePath, frontBuffer, { contentType: 'image/jpeg' });

      if (frontError) {
        console.error('Error uploading front ID card:', frontError);
        return res.status(500).json({ error: 'Failed to upload front ID card image' });
      }

      const { data: { publicUrl: frontPublicUrl } } = supabaseAdmin
        .storage
        .from('id-cards')
        .getPublicUrl(frontFilePath);
      
      frontImageUrl = frontPublicUrl;
    }

    // Upload back image if provided
    if (backImageBase64) {
      const backBuffer = Buffer.from(backImageBase64, 'base64');
      const backFileName = `${guestId}-back-${Date.now()}.jpg`;
      const backFilePath = `id-cards/${backFileName}`;
      
      const { error: backError } = await supabaseAdmin
        .storage
        .from('id-cards')
        .upload(backFilePath, backBuffer, { contentType: 'image/jpeg' });

      if (backError) {
        console.error('Error uploading back ID card:', backError);
        return res.status(500).json({ error: 'Failed to upload back ID card image' });
      }

      const { data: { publicUrl: backPublicUrl } } = supabaseAdmin
        .storage
        .from('id-cards')
        .getPublicUrl(backFilePath);
      
      backImageUrl = backPublicUrl;
    }

    // Update guest identification_doc using the database function
    const { data, error } = await supabaseAdmin.rpc('update_guest_id_card', {
      p_guest_id: guestId,
      p_doc_type: docType,
      p_doc_number: docNumber,
      p_expiry_date: expiryDate,
      p_issue_date: issueDate || null,
      p_issuing_country: issuingCountry || null,
      p_front_image_url: frontImageUrl || null,
      p_back_image_url: backImageUrl || null
    });

    if (error) {
      console.error('Error updating guest ID card:', error);
      return res.status(500).json({ error: error.message });
    }

    await writeAuditEvent({ 
      req, 
      user: req.user, 
      action: 'id_card_uploaded', 
      entityType: 'Guest', 
      entityId: guestId,
      module: 'check_in',
      details: { docType, docNumber, expiryDate, hasFrontImage: !!frontImageUrl, hasBackImage: !!backImageUrl }
    });

    return res.json({ success: true, identificationDoc: data });
  } catch (error) {
    console.error('Error in ID card upload:', error);
    return res.status(500).json({ error: 'Failed to upload ID card' });
  }
});

export default router;
