import PaymentMethod from "../models/PaymentMethod.js";

// Create a payment method (admin)
export const createPaymentMethod = async (req, res) => {
  try {
    const { name, details } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const newMethod = new PaymentMethod({ name, details });
    await newMethod.save();

    res.status(201).json(newMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all payment methods (for customers/admin)
export const getPaymentMethods = async (req, res) => {
  try {
    // If customer, only show active methods
    const query = req.user?.role === "admin" ? {} : { isActive: true };
    const methods = await PaymentMethod.find(query);
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update payment method (admin)
export const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, details } = req.body;

    const method = await PaymentMethod.findByIdAndUpdate(
      id,
      { name, details },
      { new: true }
    );

    if (!method)
      return res.status(404).json({ error: "Payment method not found" });

    res.json(method);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete payment method (admin)
export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await PaymentMethod.findByIdAndDelete(id);
    if (!method)
      return res.status(404).json({ error: "Payment method not found" });

    res.json({ message: "Payment method deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change payment method status (admin)
export const changePaymentMethodStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const method = await PaymentMethod.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!method)
      return res.status(404).json({ error: "Payment method not found" });

    res.json(method);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
