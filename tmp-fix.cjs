const fs = require('fs');
const path = 'c:\\Users\\zeray\\OneDrive\\Desktop\\SELEDA\\SELEDA 0610\\src\\components\\FrontDesk\\ReservationsModule.tsx';
let c = fs.readFileSync(path, 'utf8');

const oldUpdate = `      updateReservation(editingReservation.id, {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || '',
        roomType: data.roomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        adults: data.adults,
        children: data.children,
        rate: calculateDailyRate(data.roomType, data.ratePlanId || 'RP-STD', ratePlans, promotions, data.promoCode),
        channel: data.channel as BookingChannel,
        status: editingReservation.status,
        notes: data.notes,
        depositAmount: data.depositAmount,
        isDepositPaid: data.isDepositPaid,
        ratePlanId: data.ratePlanId,
        packageIds: data.packageIds,
        additionalGuestIds: data.additionalGuestIds,
        guestTin: data.guestTin,
        guestVatNo: data.guestVatNo,
        guestVatDate: data.guestVatDate
      });`;

const newUpdate = `      updateReservation(editingReservation.id, {
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || '',
        roomType: data.roomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        adults: data.adults,
        children: data.children,
        rate: calculateDailyRate(data.roomType, data.ratePlanId || 'RP-STD', ratePlans, promotions, data.promoCode),
        channel: data.channel as BookingChannel,
        status: editingReservation.status,
        notes: data.notes,
        depositAmount: data.depositAmount,
        isDepositPaid: data.isDepositPaid,
        ratePlanId: data.ratePlanId,
        packageIds: data.packageIds,
        additionalGuestIds: data.additionalGuestIds,
        guestTin: data.guestTin,
        guestVatNo: data.guestVatNo,
        guestVatDate: data.guestVatDate,
        isGroup: data.bookingType === 'Group',
        bookingGroupId: data.bookingGroupId || undefined,
        groupBookingId: data.groupName || undefined,
        corporateAccountId: data.corporateAccountId || undefined
      });`;

c = c.replace(oldUpdate, newUpdate);

const oldAdd = `      const resId = addReservation({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || '',
        guestStatus: 'Regular',
        roomType: data.roomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        adults: data.adults,
        children: data.children,
        status: data.channel === 'Walk-In' ? 'Confirmed' : 'Waitlisted',
        rate: typeRate,
        totalAmount,
        channel: data.channel as BookingChannel,
        paymentStatus: 'Unpaid',
        notes: data.notes,
        depositAmount: data.depositAmount,
        isDepositPaid: data.isDepositPaid,
        ratePlanId: data.ratePlanId,
        packageIds: data.packageIds,
        additionalGuestIds: data.additionalGuestIds,
        guestTin: data.guestTin,
        guestVatNo: data.guestVatNo,
        guestVatDate: data.guestVatDate
      });`;

const newAdd = `      const groupId = data.bookingGroupId || (data.bookingType !== 'Individual' ? 'GRP-' + Math.floor(1000 + Math.random() * 9000) : undefined);

      const resId = addReservation({
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone || '',
        guestStatus: 'Regular',
        roomType: data.roomType,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        adults: data.adults,
        children: data.children,
        status: data.channel === 'Walk-In' ? 'Confirmed' : 'Waitlisted',
        rate: typeRate,
        totalAmount,
        channel: data.channel as BookingChannel,
        paymentStatus: 'Unpaid',
        notes: data.notes,
        depositAmount: data.depositAmount,
        isDepositPaid: data.isDepositPaid,
        ratePlanId: data.ratePlanId,
        packageIds: data.packageIds,
        additionalGuestIds: data.additionalGuestIds,
        guestTin: data.guestTin,
        guestVatNo: data.guestVatNo,
        guestVatDate: data.guestVatDate,
        isGroup: data.bookingType === 'Group',
        bookingGroupId: groupId,
        groupBookingId: data.groupName || undefined,
        corporateAccountId: data.corporateAccountId || undefined
      });`;

c = c.replace(oldAdd, newAdd);

fs.writeFileSync(path, c, 'utf8');
console.log('done');
