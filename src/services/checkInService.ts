/**
 * Check-In Service
 * Handles all check-in related database operations
 */

import { supabase } from '../lib/supabase';

export interface CheckInRequest {
  id: string;
  guestName: string;
  reservationId: string;
  roomNumber: string;
  roomType: string;
  checkInTime: string;
  checkOutTime: string;
  nights: number;
  adults: number;
  children: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  identityVerified: boolean;
  registrationSigned: boolean;
  depositCollected: boolean;
  paymentAuthorized: boolean;
  keyEncoded: boolean;
  balance: number;
  groupBookingId?: string | null;
  bookingGroupId?: string | null;
}

export interface CheckInStep {
  identityVerified: boolean;
  registrationSigned: boolean;
  depositCollected: boolean;
  paymentAuthorized: boolean;
  keyEncoded: boolean;
}

export interface CheckInStep {
  identityVerified: boolean;
  registrationSigned: boolean;
  depositCollected: boolean;
  paymentAuthorized: boolean;
  keyEncoded: boolean;
}

/**
 * Fetch pending check-ins from database
 */
export async function getPendingCheckIns(): Promise<CheckInRequest[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_number,
        check_in_date,
        check_out_date,
        adults,
        children,
        status,
        total_amount,
        deposit_amount,
        is_deposit_paid,
        payment_status,
        channel,
        group_booking_id,
        booking_group_id,
        created_at
      `)
      .in('status', ['Confirmed', 'CheckedIn'])
      .gte('check_in_date', today)
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((reservation: any) => {
      const checkInDate = new Date(reservation.check_in_date);
      const checkOutDate = new Date(reservation.check_out_date);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate balance
      const balance = reservation.total_amount - (reservation.deposit_amount || 0);
      
      // Determine status based on reservation status and check-in completion
      let status: 'pending' | 'in-progress' | 'completed' | 'failed' = 'pending';
      if (reservation.status === 'CheckedIn') {
        status = 'completed';
      } else if (reservation.is_deposit_paid) {
        status = 'in-progress';
      }

      return {
        id: `CI-${reservation.id}`,
        guestName: reservation.guest_name,
        reservationId: reservation.id,
        roomNumber: reservation.room_number || 'Unassigned',
        roomType: reservation.room_type,
        checkInTime: '14:00', // Default check-in time
        checkOutTime: '11:00', // Default check-out time
        nights,
        adults: reservation.adults,
        children: reservation.children,
        status,
        identityVerified: false, // Will be tracked separately
        registrationSigned: false, // Will be tracked separately
        depositCollected: reservation.is_deposit_paid || false,
        paymentAuthorized: reservation.payment_status === 'Paid',
        keyEncoded: false, // Will be tracked separately
        balance: balance > 0 ? balance : 0,
        groupBookingId: reservation.group_booking_id || null,
        bookingGroupId: reservation.booking_group_id || null,
      };
    });
  } catch (error) {
    console.error('Error fetching pending check-ins:', error);
    return [];
  }
}

/**
 * Search check-ins by reservation ID or guest name
 */
export async function searchCheckIns(searchTerm: string): Promise<CheckInRequest[]> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_number,
        check_in_date,
        check_out_date,
        adults,
        children,
        status,
        total_amount,
        deposit_amount,
        is_deposit_paid,
        payment_status,
        channel,
        group_booking_id,
        booking_group_id,
        created_at
      `)
      .or(`id.ilike.%${searchTerm}%,guest_name.ilike.%${searchTerm}%`)
      .in('status', ['Confirmed', 'CheckedIn'])
      .order('check_in_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((reservation: any) => {
      const checkInDate = new Date(reservation.check_in_date);
      const checkOutDate = new Date(reservation.check_out_date);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      const balance = reservation.total_amount - (reservation.deposit_amount || 0);
      
      let status: 'pending' | 'in-progress' | 'completed' | 'failed' = 'pending';
      if (reservation.status === 'CheckedIn') {
        status = 'completed';
      } else if (reservation.is_deposit_paid) {
        status = 'in-progress';
      }

      return {
        id: `CI-${reservation.id}`,
        guestName: reservation.guest_name,
        reservationId: reservation.id,
        roomNumber: reservation.room_number || 'Unassigned',
        roomType: reservation.room_type,
        checkInTime: '14:00',
        checkOutTime: '11:00',
        nights,
        adults: reservation.adults,
        children: reservation.children,
        status,
        identityVerified: false,
        registrationSigned: false,
        depositCollected: reservation.is_deposit_paid || false,
        paymentAuthorized: reservation.payment_status === 'Paid',
        keyEncoded: false,
        balance: balance > 0 ? balance : 0,
        groupBookingId: reservation.group_booking_id || null,
        bookingGroupId: reservation.booking_group_id || null,
      };
    });
  } catch (error) {
    console.error('Error searching check-ins:', error);
    return [];
  }
}

/**
 * Update check-in step status
 */
export async function updateCheckInStep(
  reservationId: string,
  step: keyof CheckInStep,
  completed: boolean
): Promise<boolean> {
  try {
    // For now, we'll store check-in steps in the reservation's notes or custom_fields
    // In a production system, you'd want a separate check_in_steps table
    
    const { data: existingReservation } = await supabase
      .from('reservations')
      .select('notes')
      .eq('id', reservationId)
      .single();

    if (existingReservation) {
      const notes = existingReservation.notes || '';
      const checkInData = parseCheckInData(notes);
      checkInData[step] = completed;
      
      const updatedNotes = updateCheckInDataInNotes(notes, checkInData);

      const { error } = await supabase
        .from('reservations')
        .update({ notes: updatedNotes })
        .eq('id', reservationId);

      if (error) throw error;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error updating check-in step:', error);
    return false;
  }
}

/**
 * Complete check-in process
 */
export async function completeCheckIn(reservationId: string, roomNumber: string): Promise<{ success: boolean; folioId?: string }> {
  try {
    // Get authentication token - most of the app uses auth_token
    const token = localStorage.getItem('auth_token') || 
                  localStorage.getItem('hotel_erp_session');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header if token exists (for production)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No authentication token found - proceeding without auth (development mode)');
    }

    const response = await fetch(`/api/${reservationId}/check-in`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ roomNumber })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error('Check-in API error:', errorData);
      return { success: false };
    }

    const data = await response.json();
    return { 
      success: data.success || false, 
      folioId: data.folioId 
    };
  } catch (error) {
    console.error('Error completing check-in:', error);
    return { success: false };
  }
}

/**
 * Process deposit collection
 */
export async function processDeposit(
  reservationId: string,
  amount: number,
  paymentMethod: string
): Promise<boolean> {
  try {
    // Update reservation deposit status
    const { error } = await supabase
      .from('reservations')
      .update({
        deposit_amount: amount,
        is_deposit_paid: true,
        payment_status: 'Partial',
        updated_at: new Date().toISOString()
      })
      .eq('id', reservationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error processing deposit:', error);
    return false;
  }
}

/**
 * Get check-in step data from reservation notes
 */
function parseCheckInData(notes: string): CheckInStep {
  try {
    const match = notes.match(/CHECK_IN_DATA:({.*?})/);
    if (match) {
      return JSON.parse(match[1]);
    }
  } catch (e) {
    console.error('Error parsing check-in data:', e);
  }
  
  return {
    identityVerified: false,
    registrationSigned: false,
    depositCollected: false,
    paymentAuthorized: false,
    keyEncoded: false,
  };
}

/**
 * Update check-in data in reservation notes
 */
function updateCheckInDataInNotes(notes: string, checkInData: CheckInStep): string {
  // Remove existing check-in data
  const cleanedNotes = notes.replace(/CHECK_IN_DATA:({.*?})/, '').trim();
  
  // Add updated check-in data
  const checkInString = `CHECK_IN_DATA:${JSON.stringify(checkInData)}`;
  
  return cleanedNotes ? `${cleanedNotes}\n${checkInString}` : checkInString;
}

/**
 * Get check-in status for a specific reservation
 */
export async function getCheckInStatus(reservationId: string): Promise<CheckInStep | null> {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select('notes')
      .eq('id', reservationId)
      .single();

    if (error || !data) return null;
    
    return parseCheckInData(data.notes || '');
  } catch (error) {
    console.error('Error getting check-in status:', error);
    return null;
  }
}

/**
 * Get reservation details for registration card
 */
export async function getReservationForRegistration(reservationId: string) {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        guest_name,
        guest_email,
        guest_phone,
        room_type,
        room_number,
        check_in_date,
        check_out_date,
        adults,
        children,
        total_amount,
        deposit_amount,
        rate,
        notes
      `)
      .eq('id', reservationId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching reservation for registration:', error);
    return null;
  }
}

/**
 * Print registration card
 */
export function printRegistrationCard(reservation: any) {
  if (!reservation) return;

  const checkInDate = new Date(reservation.check_in_date).toLocaleDateString();
  const checkOutDate = new Date(reservation.check_out_date).toLocaleDateString();
  const nights = Math.ceil(
    (new Date(reservation.check_out_date).getTime() - new Date(reservation.check_in_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Create a printable registration card
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print registration cards');
    return;
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Registration Card - ${reservation.guest_name}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        .registration-card {
          border: 2px solid #333;
          padding: 30px;
          margin-bottom: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .header p {
          margin: 5px 0 0;
          color: #666;
        }
        .section {
          margin-bottom: 20px;
        }
        .section h2 {
          font-size: 16px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .row {
          display: flex;
          margin-bottom: 10px;
        }
        .label {
          font-weight: bold;
          width: 150px;
          flex-shrink: 0;
        }
        .value {
          flex-grow: 1;
        }
        .signature-section {
          margin-top: 40px;
          display: flex;
          justify-content: space-between;
        }
        .signature-box {
          width: 45%;
          border-top: 1px solid #333;
          padding-top: 10px;
          text-align: center;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 12px;
          color: #666;
        }
        @media print {
          body { padding: 0; }
          .registration-card { border: none; }
        }
      </style>
    </head>
    <body>
      <div class="registration-card">
        <div class="header">
          <h1>HOTEL REGISTRATION CARD</h1>
          <p>Please complete this registration form</p>
        </div>

        <div class="section">
          <h2>GUEST INFORMATION</h2>
          <div class="row">
            <div class="label">Guest Name:</div>
            <div class="value">${reservation.guest_name}</div>
          </div>
          <div class="row">
            <div class="label">Email:</div>
            <div class="value">${reservation.guest_email || 'N/A'}</div>
          </div>
          <div class="row">
            <div class="label">Phone:</div>
            <div class="value">${reservation.guest_phone || 'N/A'}</div>
          </div>
        </div>

        <div class="section">
          <h2>RESERVATION DETAILS</h2>
          <div class="row">
            <div class="label">Reservation ID:</div>
            <div class="value">${reservation.id}</div>
          </div>
          <div class="row">
            <div class="label">Room Type:</div>
            <div class="value">${reservation.room_type}</div>
          </div>
          <div class="row">
            <div class="label">Room Number:</div>
            <div class="value">${reservation.room_number || 'To be assigned'}</div>
          </div>
          <div class="row">
            <div class="label">Check-In Date:</div>
            <div class="value">${checkInDate}</div>
          </div>
          <div class="row">
            <div class="label">Check-Out Date:</div>
            <div class="value">${checkOutDate}</div>
          </div>
          <div class="row">
            <div class="label">Number of Nights:</div>
            <div class="value">${nights}</div>
          </div>
          <div class="row">
            <div class="label">Guests:</div>
            <div class="value">${reservation.adults} Adults, ${reservation.children} Children</div>
          </div>
          <div class="row">
            <div class="label">Room Rate:</div>
            <div class="value">$${reservation.rate?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="row">
            <div class="label">Total Amount:</div>
            <div class="value">$${reservation.total_amount?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="row">
            <div class="label">Deposit Paid:</div>
            <div class="value">$${reservation.deposit_amount?.toFixed(2) || '0.00'}</div>
          </div>
        </div>

        <div class="section">
          <h2>HOTEL POLICIES</h2>
          <ul style="font-size: 12px; line-height: 1.6;">
            <li>Check-out time is 11:00 AM. Late check-out may incur additional charges.</li>
            <li>Please ensure all personal belongings are removed from the room upon check-out.</li>
            <li>The hotel is not responsible for lost or stolen items.</li>
            <li>Please observe quiet hours between 10:00 PM and 7:00 AM.</li>
            <li>Smoking is prohibited in all guest rooms and public areas.</li>
            <li>Pets are not allowed unless prior arrangements have been made.</li>
          </ul>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Guest Signature</div>
            <div style="font-size: 11px; margin-top: 5px;">Date: _______________</div>
          </div>
          <div class="signature-box">
            <div>Front Desk Signature</div>
            <div style="font-size: 11px; margin-top: 5px;">Date: _______________</div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing our hotel. We hope you enjoy your stay!</p>
          <p>For assistance, please contact the front desk.</p>
        </div>
      </div>

      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}

/**
 * Print group registration card — shows primary contact info + full guest list
 */
export function printGroupRegistrationCard(group: any, members: any[]) {
  if (!group || !members || members.length === 0) return;

  const checkInDate = members[0]?.check_in_date ? new Date(members[0].check_in_date).toLocaleDateString() : 'N/A';
  const checkOutDate = members[0]?.check_out_date ? new Date(members[0].check_out_date).toLocaleDateString() : 'N/A';
  const totalAmount = members.reduce((sum, m) => sum + (m.total_amount || 0), 0);
  const depositAmount = members.reduce((sum, m) => sum + (m.deposit_amount || 0), 0);
  const totalAdults = members.reduce((sum, m) => sum + (m.adults || 1), 0);
  const totalChildren = members.reduce((sum, m) => sum + (m.children || 0), 0);
  const groupName = group.group_name || group.name || group.id;
  const primaryContact = group.contact_name || members[0]?.guest_name || 'N/A';
  const contactEmail = group.contact_email || members[0]?.guest_email || 'N/A';
  const contactPhone = group.contact_phone || members[0]?.guest_phone || 'N/A';

  // Build guest list table rows
  const guestRows = members.map((m, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${m.guest_name || 'N/A'}</td>
      <td>${m.room_type || 'N/A'}</td>
      <td>${m.room_number || 'To be assigned'}</td>
      <td>${m.adults || 1}</td>
      <td>${m.children || 0}</td>
      <td>$${(m.total_amount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print registration cards');
    return;
  }

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Group Registration Card - ${groupName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; }
        .registration-card { border: 2px solid #333; padding: 30px; margin-bottom: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0; color: #666; }
        .section { margin-bottom: 20px; }
        .section h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
        .row { display: flex; margin-bottom: 10px; }
        .label { font-weight: bold; width: 180px; flex-shrink: 0; }
        .value { flex-grow: 1; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .signature-section { margin-top: 40px; display: flex; justify-content: space-between; }
        .signature-box { width: 45%; border-top: 1px solid #333; padding-top: 10px; text-align: center; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media print { body { padding: 0; } .registration-card { border: none; } }
      </style>
    </head>
    <body>
      <div class="registration-card">
        <div class="header">
          <h1>GROUP REGISTRATION CARD</h1>
          <p>${groupName} · ${members.length} room${members.length !== 1 ? 's' : ''}</p>
        </div>

        <div class="section">
          <h2>PRIMARY CONTACT INFORMATION</h2>
          <div class="row"><div class="label">Group Name:</div><div class="value">${groupName}</div></div>
          <div class="row"><div class="label">Primary Contact:</div><div class="value">${primaryContact}</div></div>
          <div class="row"><div class="label">Email:</div><div class="value">${contactEmail}</div></div>
          <div class="row"><div class="label">Phone:</div><div class="value">${contactPhone}</div></div>
          ${group.contact_company ? `<div class="row"><div class="label">Company:</div><div class="value">${group.contact_company}</div></div>` : ''}
        </div>

        <div class="section">
          <h2>STAY DETAILS</h2>
          <div class="row"><div class="label">Check-In Date:</div><div class="value">${checkInDate}</div></div>
          <div class="row"><div class="label">Check-Out Date:</div><div class="value">${checkOutDate}</div></div>
          <div class="row"><div class="label">Total Rooms:</div><div class="value">${members.length}</div></div>
          <div class="row"><div class="label">Total Guests:</div><div class="value">${totalAdults} Adults, ${totalChildren} Children</div></div>
          <div class="row"><div class="label">Total Amount:</div><div class="value">$${totalAmount.toFixed(2)}</div></div>
          <div class="row"><div class="label">Deposit Paid:</div><div class="value">$${depositAmount.toFixed(2)}</div></div>
        </div>

        <div class="section">
          <h2>GUEST LIST</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Guest Name</th>
                <th>Room Type</th>
                <th>Room No.</th>
                <th>Adults</th>
                <th>Children</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${guestRows}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>HOTEL POLICIES</h2>
          <ul style="font-size: 12px; line-height: 1.6;">
            <li>Check-out time is 11:00 AM. Late check-out may incur additional charges.</li>
            <li>Please ensure all personal belongings are removed from the room upon check-out.</li>
            <li>The hotel is not responsible for lost or stolen items.</li>
            <li>Please observe quiet hours between 10:00 PM and 7:00 AM.</li>
            <li>Smoking is prohibited in all guest rooms and public areas.</li>
            <li>Pets are not allowed unless prior arrangements have been made.</li>
          </ul>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div>Primary Contact Signature</div>
            <div style="font-size: 11px; margin-top: 5px;">Date: _______________</div>
          </div>
          <div class="signature-box">
            <div>Front Desk Signature</div>
            <div style="font-size: 11px; margin-top: 5px;">Date: _______________</div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing our hotel. We hope you enjoy your stay!</p>
          <p>For assistance, please contact the front desk.</p>
        </div>
      </div>

      <script>
        window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
}

/**
 * Upload ID document to Supabase storage
 */
export async function uploadIdDocument(
  file: File,
  guestId: string,
  side: 'front' | 'back'
): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${guestId}_${side}_${Date.now()}.${fileExt}`;
    const filePath = `${guestId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('id-cards')
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('id-cards')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading ID document:', error);
    return null;
  }
}

/**
 * Update guest ID card information
 */
export async function updateGuestIdCard(
  guestId: string,
  docType: string,
  docNumber: string,
  expiryDate: string,
  issueDate?: string,
  issuingCountry?: string,
  frontImageUrl?: string,
  backImageUrl?: string
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc('update_guest_id_card', {
      p_guest_id: guestId,
      p_doc_type: docType,
      p_doc_number: docNumber,
      p_expiry_date: expiryDate,
      p_issue_date: issueDate,
      p_issuing_country: issuingCountry,
      p_front_image_url: frontImageUrl,
      p_back_image_url: backImageUrl
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating guest ID card:', error);
    return false;
  }
}

/**
 * Get guest ID card information
 */
export async function getGuestIdCard(guestId: string) {
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('identification_doc')
      .eq('id', guestId)
      .maybeSingle();

    if (error) throw error;
    return data?.identification_doc || null;
  } catch (error) {
    console.error('Error getting guest ID card:', error);
    return null;
  }
}