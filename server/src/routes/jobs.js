import express from "express";
import prisma from "../prisma.js";

const router = express.Router();

const ALLOWED_STATUSES = new Set(["Applied", "Interviewing", "Rejected", "Offer"]);

// GET /jobs?status=Applied
router.get("/", async (req, res) => {
  const userId = req.userId;
  const { status } = req.query;

  const where = { userId };
  if (status) {
    if (!ALLOWED_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid status filter." });
    }
    where.status = status;
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  res.json(jobs);
});

// POST /jobs
router.post("/", async (req, res) => {
  const userId = req.userId;
  const { companyName, jobTitle, status, applicationDate, notes } = req.body;

  if (!companyName || !jobTitle || !status) {
    return res.status(400).json({ message: "companyName, jobTitle, and status are required." });
  }

  if (!ALLOWED_STATUSES.has(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const job = await prisma.job.create({
    data: {
      companyName,
      jobTitle,
      status,
      applicationDate: applicationDate ? new Date(applicationDate) : null,
      notes: notes ?? null,
      userId,
    },
  });

  res.status(201).json(job);
});

// PUT /jobs/:id
router.put("/:id", async (req, res) => {
  const userId = req.userId;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid job id." });

  // ensure it belongs to user
  const existing = await prisma.job.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ message: "Job not found." });

  const { companyName, jobTitle, status, applicationDate, notes } = req.body;

  if (status !== undefined && !ALLOWED_STATUSES.has(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  const updated = await prisma.job.update({
    where: { id },
    data: {
      companyName: companyName ?? undefined,
      jobTitle: jobTitle ?? undefined,
      status: status ?? undefined,
      applicationDate:
        applicationDate === undefined
          ? undefined
          : applicationDate
          ? new Date(applicationDate)
          : null,
      notes: notes === undefined ? undefined : notes ?? null,
    },
  });

  res.json(updated);
});

// DELETE /jobs/:id
router.delete("/:id", async (req, res) => {
  const userId = req.userId;
  const id = Number(req.params.id);

  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid job id." });

  const existing = await prisma.job.findFirst({ where: { id, userId } });
  if (!existing) return res.status(404).json({ message: "Job not found." });

  await prisma.job.delete({ where: { id } });
  res.status(204).send();
});

export default router;
