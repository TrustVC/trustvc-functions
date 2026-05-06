import { app } from "./functions/storage/index";

const PORT = process.env.PORT || 5080;

app.listen(PORT, () => {
  console.log(`Storage server running on http://localhost:${PORT}`);
});
