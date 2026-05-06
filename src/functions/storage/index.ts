import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { corsOrigin } from "../../utils";
import { MAX_REQUEST_BODY_SIZE } from "../../constants";
import { router } from "./router";

const app = express();

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(
  bodyParser.urlencoded({ limit: MAX_REQUEST_BODY_SIZE, extended: true })
);
app.use("/", router);
app.disable("x-powered-by");

export { app };
export const handler = serverless(app);
