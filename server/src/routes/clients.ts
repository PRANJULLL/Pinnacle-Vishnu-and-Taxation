import { Router, Request, Response } from "express";
import Client from "../models/Client";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const clients = await Client.find().lean();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch clients", error });
  }
});

export default router;
