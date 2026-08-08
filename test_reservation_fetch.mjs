// Test script to verify reservation data fetching
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testReservationFetch() {
  console.log('Testing reservation data fetch...');
  
  try {
    // Test 1: Check if reservations table exists and has data
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('*')
      .limit(5);
    
    if (error) {
      console.error('Error fetching reservations:', error);
      return;
    }
    
    console.log('Found reservations:', reservations?.length || 0);
    
    if (reservations && reservations.length > 0) {
      console.log('Sample reservation:', reservations[0]);
    } else {
      console.log('No reservations found. Creating sample data...');
      
      // Create sample reservation
      const sampleReservation = {
        id: `RES-${Date.now()}`,
        guest_name: 'John Smith',
        guest_email: 'john@example.com',
        guest_phone: '+251911234567',
        guest_status: 'Regular',
        room_type: 'Deluxe King',
        room_number: '301',
        check_in_date: '2026-08-05',
        check_out_date: '2026-08-08',
        adults: 2,
        children: 0,
        status: 'Confirmed',
        rate: 150,
        total_amount: 450,
        channel: 'Direct Website',
        payment_status: 'Unpaid',
        notes: JSON.stringify({
          groupName: 'Smith Family Vacation',
          primaryContact: 'John Smith - +251911234567',
          travelAgency: null,
          corporation: null
        }),
        deposit_amount: 100,
        is_deposit_paid: true,
        group_booking_id: 'Smith Family Vacation',
        is_group: true
      };
      
      const { error: insertError } = await supabase
        .from('reservations')
        .insert(sampleReservation);
      
      if (insertError) {
        console.error('Error creating sample reservation:', insertError);
      } else {
        console.log('Sample reservation created successfully');
      }
    }
    
    // Test 2: Fetch with the API endpoint structure
    const { data: apiReservations, error: apiError } = await supabase
      .from('reservations')
      .select(`
        id,
        check_in_date,
        check_out_date,
        status,
        adults,
        children,
        total_amount,
        deposit_amount,
        channel as source,
        room_type,
        room_number,
        notes,
        group_booking_id,
        booking_group_id,
        corporate_account_id,
        is_group
      `)
      .order('check_in_date', { ascending: true });
    
    if (apiError) {
      console.error('API structure fetch error:', apiError);
    } else {
      console.log('API structure fetch successful:', apiReservations?.length || 0, 'reservations');
      
      // Transform data as the API would
      const transformed = apiReservations?.map((res) => {
        const nights = Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
        
        let groupName = null;
        let primaryContact = null;
        let travelAgency = null;
        let corporation = null;
        
        if (res.group_booking_id || res.booking_group_id || res.is_group) {
          try {
            const notesObj = typeof res.notes === 'string' ? JSON.parse(res.notes || '{}') : (res.notes || {});
            groupName = notesObj.groupName || res.group_booking_id || res.booking_group_id;
            primaryContact = notesObj.primaryContact;
            travelAgency = notesObj.travelAgency;
            corporation = notesObj.corporation || res.corporate_account_id;
          } catch (e) {
            groupName = res.group_booking_id || res.booking_group_id;
          }
        }
        
        return {
          id: res.id,
          guestName: res.guest_name,
          rooms: [{
            roomType: res.room_type,
            roomNumber: res.room_number,
            adults: res.adults,
            children: res.children,
            amount: res.total_amount
          }],
          checkIn: res.check_in_date,
          checkOut: res.check_out_date,
          nights: nights,
          totalAdults: res.adults,
          totalChildren: res.children,
          source: res.source,
          status: res.status.toLowerCase(),
          totalAmount: res.total_amount,
          deposit: res.deposit_amount,
          balance: res.total_amount - (res.deposit_amount || 0),
          groupName,
          primaryContact,
          travelAgency,
          corporation
        };
      });
      
      console.log('Transformed data sample:', transformed[0]);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testReservationFetch();
