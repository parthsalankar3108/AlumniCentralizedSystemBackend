import JobSchema from "../models/Job.js";

export const createJob = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);

    const job = await JobSchema.create({
      ...req.body,
      userId,
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to create job" });
  }
};

export const getJobs = async (req, res) => {
  try {
    const jobs = await JobSchema.find().populate("userId", "name email");
    res.json(jobs);
  } catch {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const job = await JobSchema.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (job.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await job.deleteOne();

    res.json({ message: "Job deleted" });
  } catch {
    res.status(500).json({ error: "Delete failed" });
  }
};
