import express from "express";
import {
  createConsultationPlan,
  getConsultationPlans,
  getConsultationPlanById,
  updateConsultationPlan,
  deactivateConsultationPlan,
} from "../controllers/consultationPlanController.js";

import {
  verifyToken,
  adminMiddleware,
  authMiddleware,
} from "../middleware/auth.js";
import { protect, adminOnly } from "../middleware/adminAuth.js";

const router = express.Router();

/* Public */
router.get("/", getConsultationPlans);
router.get("/:consultationPlanId", getConsultationPlanById);

/* Admin only */
router.post("/", protect, adminOnly, createConsultationPlan);
router.patch(
  "/:consultationPlanId",
  protect,
  adminOnly,
  updateConsultationPlan
);
router.delete(
  "/:consultationPlanId",
  protect,
  adminOnly,
  deactivateConsultationPlan
);

export default router;
