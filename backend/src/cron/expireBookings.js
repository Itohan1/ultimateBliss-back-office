import ConsultationBooking from "../models/ConsultationBooking.js";
import ConsultationTimeSlot from "../models/ConsultationTimeSlot.js";

export const expirePendingBookings = async () => {
  const now = new Date();

  const expiredBookings = await ConsultationBooking.find({
    transactionStatus: "pending",
    paymentExpiresAt: { $lt: now },
    status: "pending",
  });

  for (const booking of expiredBookings) {
    booking.status = "cancelled";
    booking.transactionStatus = "failed";
    await booking.save();

    const slot = await ConsultationTimeSlot.findOne({
      timeSlotId: booking.timeSlotId,
    });

    if (slot) {
      slot.isAvailable = true;
      await slot.save();
    }
  }
};
