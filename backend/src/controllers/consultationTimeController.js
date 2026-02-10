import ConsultationTimeSlot from "../models/ConsultationTimeSlot.js";
import ConsultationBooking from "../models/ConsultationBooking.js";
/* ================= CREATE TIME SLOT ================= */
export const createTimeSlot = async (req, res) => {
  try {
    const { startTime, endTime, label } = req.body;

    if (!startTime || !endTime || !label) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 🔹 Generate next timeSlotId
    const lastSlot = await ConsultationTimeSlot.findOne()
      .sort({ timeSlotId: -1 })
      .select("timeSlotId");

    const nextTimeSlotId = lastSlot ? lastSlot.timeSlotId + 1 : 1;

    const slot = await ConsultationTimeSlot.create({
      timeSlotId: nextTimeSlotId,
      startTime,
      endTime,
      label,
    });

    res.status(201).json(slot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET AVAILABLE SLOTS ================= */
export const getAvailableTimeSlots = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const slots = await ConsultationTimeSlot.find().sort({ timeSlotId: 1 });

    const bookedSlots = await ConsultationBooking.find({
      date: { $gte: start, $lte: end },
      status: { $ne: "cancelled" },
    }).select("timeSlotId");

    const bookedIds = new Set(bookedSlots.map((b) => b.timeSlotId));

    const availableSlots = slots.map((slot) => ({
      ...slot.toObject(),
      isAvailable: !bookedIds.has(slot.timeSlotId),
    }));

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE SLOT ================= */
export const updateTimeSlot = async (req, res) => {
  try {
    const { timeSlotId } = req.params;

    const slot = await ConsultationTimeSlot.findOneAndUpdate(
      { timeSlotId: Number(timeSlotId) },
      req.body,
      { new: true },
    );

    if (!slot) {
      return res.status(404).json({ error: "Time slot not found" });
    }

    res.json(slot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= BOOK / LOCK SLOT ================= */
export const bookTimeSlot = async (req, res) => {
  try {
    const { timeSlotId } = req.params;

    const slot = await ConsultationTimeSlot.findOne({
      timeSlotId: Number(timeSlotId),
    });

    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ error: "Time slot not available" });
    }

    slot.isAvailable = false;
    await slot.save();

    res.json({ message: "Time slot booked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTimeSlots = async (req, res) => {
  try {
    const slots = await ConsultationTimeSlot.find().sort({ timeSlotId: 1 });
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE TIME SLOT ================= */
export const deleteTimeSlot = async (req, res) => {
  try {
    const { timeSlotId } = req.params;

    const slotId = Number(timeSlotId);
    if (Number.isNaN(slotId)) {
      return res.status(400).json({ error: "Invalid timeSlotId" });
    }

    // 🔒 Prevent deleting a slot that has bookings
    /*const hasBookings = await ConsultationBooking.exists({
      timeSlotId: slotId,
      status: { $ne: "cancelled" },
    });

    if (hasBookings) {
      return res.status(409).json({
        error: "Cannot delete time slot with active bookings",
      });
    }*/

    const deletedSlot = await ConsultationTimeSlot.findOneAndDelete({
      timeSlotId: slotId,
    });

    if (!deletedSlot) {
      return res.status(404).json({ error: "Time slot not found" });
    }

    res.json({
      message: "Time slot deleted successfully",
      timeSlotId: slotId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
