import Address from "../models/Address.js";

/* ================= ADD ADDRESS ================= */
export const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      description,
      addressLine,
      apartment,
      city,
      state,
      country,
      postalCode,
      isDefault,
    } = req.body;

    if (!addressLine || !city || !state || !country) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = new Address({
      userId,
      description,
      addressLine,
      apartment,
      city,
      state,
      country,
      postalCode,
      isDefault,
    });

    await address.save();

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET USER ADDRESSES ================= */
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const addresses = await Address.find({ userId }).sort({
      isDefault: -1,
      createdAt: -1,
    });

    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE ADDRESS ================= */
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const update = req.body;

    if (update.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      update,
      { new: true },
    );

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE ADDRESS ================= */
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const address = await Address.findOneAndDelete({
      _id: addressId,
      userId,
    });

    if (!address) {
      return res.status(404).json({ error: "Address not found" });
    }

    res.json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
