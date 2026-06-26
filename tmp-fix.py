import re

path = r'c:\Users\zeray\OneDrive\Desktop\SELEDA\SELEDA 0610\src\components\FrontDesk\ReservationsModule.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update updateReservation call
old_update = r"""      updateReservation(editingReservation.id, {
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
      });"""

new_update = r"""      updateReservation(editingReservation.id, {
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
      });"""

if old_update in content:
    content = content.replace(old_update, new_update)
    print("Updated updateReservation")
else:
    print("updateReservation block not found")

# Update addReservation call
old_add = r"""      const resId = addReservation({
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
      });"""

new_add = r"""      const groupId = data.bookingGroupId || (data.bookingType !== 'Individual' ? 'GRP-' + Math.floor(1000 + Math.random() * 9000) : undefined);

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
      });"""

if old_add in content:
    content = content.replace(old_add, new_add)
    print("Updated addReservation")
else:
    print("addReservation block not found")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
