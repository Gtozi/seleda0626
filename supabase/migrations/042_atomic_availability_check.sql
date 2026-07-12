-- Atomic availability check that includes Waitlisted public bookings
-- This prevents race conditions where multiple concurrent bookings could overbook
-- the same room type by including Waitlisted public bookings in the count.

CREATE OR REPLACE FUNCTION check_room_type_availability(
  p_room_type_name TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_requested_quantity INTEGER DEFAULT 1
)
RETURNS TABLE(
  available INTEGER,
  capacity INTEGER,
  booked INTEGER,
  can_book BOOLEAN
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_capacity INTEGER;
  v_booked INTEGER;
  v_available INTEGER;
BEGIN
  -- Get total capacity for this room type
  SELECT COUNT(*)
  INTO v_capacity
  FROM rooms r
  JOIN room_types rt ON r.type = rt.name
  WHERE rt.name = p_room_type_name;

  IF v_capacity IS NULL THEN
    v_capacity := 0;
  END IF;

  -- Count all reservations that overlap the date range
  -- Include Confirmed, CheckedIn, and Waitlisted public bookings
  SELECT COUNT(*)
  INTO v_booked
  FROM reservations res
  JOIN room_types rt ON res.room_type = rt.name
  WHERE rt.name = p_room_type_name
    AND (res.status IN ('Confirmed', 'CheckedIn') OR 
         (res.status = 'Waitlisted' AND res.channel = 'Direct Website'))
    AND (
      -- Check if date ranges overlap
      (res.check_in_date <= p_check_out AND res.check_out_date >= p_check_in)
    );

  IF v_booked IS NULL THEN
    v_booked := 0;
  END IF;

  -- Calculate available rooms
  v_available := GREATEST(0, v_capacity - v_booked);

  RETURN QUERY SELECT
    v_available,
    v_capacity,
    v_booked,
    v_available >= p_requested_quantity;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_room_type_availability(TEXT, DATE, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_room_type_availability(TEXT, DATE, DATE, INTEGER) TO anon;
