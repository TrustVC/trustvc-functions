import express, { Request, Response } from "express";
import { checkApiKey, originReferrerGuard } from "../../utils";
import {
  uploadDocument,
  uploadDocumentAtId,
  getQueueNumber,
  getDocument,
} from "./helpers";

const router = express.Router();

router.post(
  "/",
  checkApiKey,
  originReferrerGuard,
  async (req: Request, res: Response) => {
    const {
      body: { document },
    } = req;
    try {
      const result = await uploadDocument(document);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json(err);
    }
  },
);

router.post(
  "/:id",
  checkApiKey,
  originReferrerGuard,
  async (req: Request, res: Response) => {
    const {
      body: { document, key },
      params: { id },
    } = req;

    try {
      const result = await uploadDocumentAtId(document, id, key);
      res.status(200).json(result);
    } catch (err) {
      const status =
        typeof err === "object" &&
        err !== null &&
        "status" in err &&
        typeof (err as { status?: unknown }).status === "number"
          ? (err as { status: number }).status
          : 400;
      const message = err instanceof Error ? err.message : "Document invalid.";
      res.status(status).json({ message });
    }
  },
);

router.get("/queue", checkApiKey, async (_req: Request, res: Response) => {
  try {
    const result = await getQueueNumber();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
});

// lets omit checkApiKey for trustvc web to retrieve document easily
router.get("/:id", async (req: Request, res: Response) => {
  const {
    params: { id },
  } = req;

  try {
    const { document } = await getDocument(id);

    res.status(200).json(document);
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

export { router };
