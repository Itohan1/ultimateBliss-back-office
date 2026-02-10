import ConsultationBooking from "../models/ConsultationBooking.js";
import ConsultationTimeSlot from "../models/ConsultationTimeSlot.js";
import ConsultationPlan from "../models/ConsultationPlan.js";
import mongoose from "mongoose";

/* ================= CREATE BOOKING ================= */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { consultationPlanId, timeSlotId, date } = req.body;

    if (!consultationPlanId || !timeSlotId || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔒 Check if slot is already booked FOR THIS DATE
    const existingBooking = await ConsultationBooking.findOne({
      timeSlotId,
      date,
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res
        .status(400)
        .json({ error: "Time slot already booked for this date" });
    }

    const plan = await ConsultationPlan.findOne({ consultationPlanId });
    if (!plan) {
      return res.status(404).json({ error: "Consultation plan not found" });
    }

    const paymentExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

    const booking = await ConsultationBooking.create({
      userId,
      consultationPlanId,
      timeSlotId,
      date,
      status: "pending",
      transactionStatus: "pending",
      paymentExpiresAt,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET USER BOOKINGS ================= */
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 1️⃣ Get all bookings for this user
    const bookings = await ConsultationBooking.find({ userId }).sort({
      createdAt: -1,
    });

    // 2️⃣ Get all consultation plans and timeslots
    const plans = await ConsultationPlan.find({});
    const timeSlots = await ConsultationTimeSlot.find({});

    // 3️⃣ Map numeric IDs to full objects
    const enrichedBookings = bookings.map((b) => {
      const plan = plans.find(
        (p) => p.consultationPlanId === b.consultationPlanId,
      );
      const slot = timeSlots.find((t) => t.timeSlotId === b.timeSlotId);

      return {
        ...b.toObject(),
        consultationPlanId: plan,
        timeSlotId: slot,
      };
    });

    res.json(enrichedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= CANCEL BOOKING ================= */
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookingId } = req.params;

    const booking = await ConsultationBooking.findOne({
      _id: bookingId,
      userId,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    /*if (booking.transactionStatus === "successful") {
      return res
        .status(400)
        .json({ error: "Paid bookings cannot be cancelled" });
    }*/

    booking.status = "cancelled";
    await booking.save();

    // Free the time slot
    const timeSlot = await ConsultationTimeSlot.findOne({
      timeSlotId: booking.timeSlotId,
    });
    if (timeSlot) {
      timeSlot.isAvailable = true;
      await timeSlot.save();
    }

    res.json({ message: "Booking cancelled" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  const { bookingId } = req.params;
  const { transactionId, paymentMethodId } = req.body;

  let objectId;
  try {
    objectId = new mongoose.Types.ObjectId(bookingId);
  } catch {
    return res.status(400).json({ error: "Invalid booking ID" });
  }

  const booking = await ConsultationBooking.findById(objectId);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  booking.transactionId = transactionId;
  booking.paymentMethod = paymentMethodId;

  await booking.save();

  res.json({ message: "Payment confirmed" });
};

export const updateTransactionStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { transactionStatus } = req.body; // "pending" | "successful" | "failed"

    const booking = await ConsultationBooking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    booking.transactionStatus = transactionStatus;

    // ✅ Automatically confirm booking if payment succeeded
    if (transactionStatus === "successful" && booking.status === "pending") {
      booking.status = "confirmed";
    }

    await booking.save();

    res.json({
      message: `Transaction status updated to ${transactionStatus}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL BOOKINGS (ADMIN) ================= */
export const getAllBookings = async (req, res) => {
  try {
    // 1️⃣ Fetch all bookings (earliest → latest)
    const bookings = await ConsultationBooking.find({})
      .sort({ createdAt: 1 }) // earliest → latest
      .lean();

    // 2️⃣ Fetch plans & time slots once
    const plans = await ConsultationPlan.find({}).lean();
    const timeSlots = await ConsultationTimeSlot.find({}).lean();

    // 3️⃣ Enrich bookings
    const enrichedBookings = bookings.map((b) => {
      const plan = plans.find(
        (p) => p.consultationPlanId === b.consultationPlanId,
      );

      const slot = timeSlots.find((t) => t.timeSlotId === b.timeSlotId);

      return {
        ...b,
        consultationPlanId: plan
          ? {
              name: plan.name,
              amount: plan.amount,
              consultationPlanId: plan.consultationPlanId,
            }
          : null,
        timeSlotId: slot
          ? {
              label: slot.label,
              startTime: slot.startTime,
              endTime: slot.endTime,
              timeSlotId: slot.timeSlotId,
            }
          : null,
      };
    });

    res.json(enrichedBookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET BOOKING BY ID (ADMIN) ================= */
export const getBookingById = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await ConsultationBooking.findById(bookingId).lean();
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const plan = await ConsultationPlan.findOne({
      consultationPlanId: booking.consultationPlanId,
    }).lean();

    const slot = await ConsultationTimeSlot.findOne({
      timeSlotId: booking.timeSlotId,
    }).lean();

    res.json({
      ...booking,
      consultationPlanId: plan
        ? {
            consultationPlanId: plan.consultationPlanId,
            name: plan.name,
            amount: plan.amount,
            description: plan.description,
          }
        : null,
      timeSlotId: slot
        ? {
            timeSlotId: slot.timeSlotId,
            label: slot.label,
            startTime: slot.startTime,
            endTime: slot.endTime,
          }
        : null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE BOOKING STATUS (ADMIN) ================= */
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body; // pending | confirmed | completed | cancelled

    const booking = await ConsultationBooking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    /* 🚫 RULE 1: Cannot confirm if payment not successful */
    if (status === "confirmed" && booking.transactionStatus !== "successful") {
      return res.status(400).json({
        error: "Cannot confirm booking while transaction is not successful",
      });
    }

    /* 🚫 RULE 2: Cannot complete if not confirmed */
    if (status === "completed" && booking.status !== "confirmed") {
      return res.status(400).json({
        error: "Booking must be confirmed before it can be completed",
      });
    }

    /* 🚫 RULE 3: Cannot change cancelled booking */
    if (booking.status === "cancelled") {
      return res.status(400).json({
        error: "Cancelled booking cannot be modified",
      });
    }

    booking.status = status;
    await booking.save();

    res.json({ message: `Booking status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
