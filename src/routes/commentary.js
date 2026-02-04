import { Router } from "express";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { commentary } from "../db/schema.js";
import { matchIdParamSchema } from "../validation/matches.js";
import {
  createCommentarySchema,
  listCommentaryQuerySchema,
} from "../validation/commentary.js";

// Need mergeParams: true so we can access :id from `/matches/:id/commentary`
export const commentaryRouter = Router({ mergeParams: true });

const MAX_LIMIT = 100;

// GET /matches/:id/commentary
commentaryRouter.get("/", async (req, res) => {
  // Validate route params (match id)
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res.status(400).json({
      error: "Invalid match id",
      details: paramsResult.error.issues,
    });
  }

  // Validate query params
  const queryResult = listCommentaryQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({
      error: "Invalid query",
      details: queryResult.error.issues,
    });
  }

  const matchId = paramsResult.data.id;
  const limit = Math.min(queryResult.data.limit ?? MAX_LIMIT, MAX_LIMIT);

  try {
    const data = await db
      .select()
      .from(commentary)
      .where(eq(commentary.matchId, matchId))
      .orderBy(desc(commentary.createdAt))
      .limit(limit);

    return res.json({ data });
  } catch (e) {
    return res.status(500).json({
      error: "Failed to fetch commentary",
      details: JSON.stringify(e),
    });
  }
});

commentaryRouter.post("/", async (req, res) => {
  // Validate route params (match id)
  const paramsResult = matchIdParamSchema.safeParse(req.params);
  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid match id", details: paramsResult.error.issues });
  }

  // Validate request body
  const bodyResult = createCommentarySchema.safeParse(req.body);
  if (!bodyResult.success) {
    return res
      .status(400)
      .json({ error: "Invalid payload", details: bodyResult.error.issues });
  }

  const matchId = paramsResult.data.id;
  const {minutes, ...rest} = bodyResult.data;

  try {
    const [row] = await db
      .insert(commentary)
      .values({
        matchId,
        minute: minutes,
        ...rest
      })
      .returning();

      if(res.app.locals.broadcastCommentary){
        res.app.locals.broadcastCommentary(row.matchId, row);
      }

    return res.status(201).json({ data: row });
  } catch (e) {
    return res.status(500).json({
      error: "Failed to create commentary",
      details: JSON.stringify(e),
    });
  }
});