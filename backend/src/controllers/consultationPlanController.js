import ConsultationPlan from "../models/ConsultationPlan.js";

/* ================= CREATE PLAN ================= */
export const createConsultationPlan = async (req, res) => {
  try {
    const { name, description, amount } = req.body;

    if (!name || !description || amount === undefined) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // 🔹 Generate next consultationPlanId
    const lastPlan = await ConsultationPlan.findOne()
      .sort({ consultationPlanId: -1 })
      .select("consultationPlanId");

    const nextConsultationPlanId = lastPlan
      ? lastPlan.consultationPlanId + 1
      : 1;

    const plan = await ConsultationPlan.create({
      consultationPlanId: nextConsultationPlanId,
      name,
      description,
      amount,
    });

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL PLANS ================= */
export const getConsultationPlans = async (req, res) => {
  try {
    const plans = await ConsultationPlan.find({ isActive: true }).sort({
      amount: 1,
    });

    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET SINGLE PLAN ================= */
export const getConsultationPlanById = async (req, res) => {
  try {
    const { consultationPlanId } = req.params;

    const plan = await ConsultationPlan.findOne({
      consultationPlanId: Number(consultationPlanId),
    });

    if (!plan) {
      return res.status(404).json({ error: "Consultation plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= UPDATE PLAN ================= */
export const updateConsultationPlan = async (req, res) => {
  try {
    const { consultationPlanId } = req.params;

    const plan = await ConsultationPlan.findOneAndUpdate(
      { consultationPlanId: Number(consultationPlanId) },
      req.body,
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ error: "Consultation plan not found" });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE / DEACTIVATE PLAN ================= */
export const deactivateConsultationPlan = async (req, res) => {
  try {
    const { consultationPlanId } = req.params;

    const plan = await ConsultationPlan.findOneAndUpdate(
      { consultationPlanId: Number(consultationPlanId) },
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ error: "Consultation plan not found" });
    }

    res.json({ message: "Consultation plan deactivated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
