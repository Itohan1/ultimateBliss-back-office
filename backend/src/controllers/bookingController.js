import Booking from "../models/booking.js";

const getDaysRemaining = (scheduledDate) => {
  const today = new Date();
  const schedule = new Date(scheduledDate);
  const diff = Math.ceil((schedule - today) / (1000 * 60 * 60 * 24));
  return diff < 0 ? "Expired" : `${diff} days`;
};

export const createBooking = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      message: "Please sign in to make a booking",
    });
  }

  try {
    const lastBooking = await Booking.findOne().sort({ bookingId: -1 });
    const nextBookingId = lastBooking ? lastBooking.bookingId + 1 : 1;

    const { name, email, phone, plan, price, scheduledDate, time } = req.body;

    const booking = await Booking.create({
      bookingId: nextBookingId,
      userId: req.user.userId,
      name,
      email,
      phone,
      plan,
      price,
      scheduledDate,
      time,
      status: "New",
      createdOn: new Date(),
      daysRemaining: getDaysRemaining(scheduledDate),
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("userId", "email");
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.bookingId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { bookingId: req.params.bookingId },
      req.body,
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.daysRemaining = getDaysRemaining(booking.scheduledDate);
    await booking.save();

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndDelete({
      bookingId: req.params.bookingId,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
