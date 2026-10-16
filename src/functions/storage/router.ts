import express, { Request, Response } from "express";
import { checkApiKey, originReferrerGuard } from "../../utils";
import {
  uploadDocument,
  uploadDocumentAtId,
  getQueueNumber,
  getDocument,
} from "./helpers";

const router = express.Router();

const responseStatus = (err: unknown): number => {
  if (typeof err === "object" && err !== null && "status" in err) {
    const status = (err as { status: unknown }).status;
    if (typeof status === "number") return status;
  }
  return 400;
};

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
      body: { document },
      params: { id },
    } = req;

    try {
      const result = await uploadDocumentAtId(document, id);
      res.status(200).json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Document invalid.";
      res.status(responseStatus(err)).json({ message });
    }
  },
);

router.get("/queue", checkApiKey, async (_req: Request, res: Response) => {
  try {
    const result = await getQueueNumber();
    res.status(200).json(result);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unable to retrieve queue number.";
    res.status(responseStatus(err)).json({ message });
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
  } catch (err) {
    const message = err instanceof Error ? err.message : "Document invalid.";
    res.status(responseStatus(err)).json({ message });
  }
});

export { router };
