import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import {
  getOAuthRedirectUrl,
  exchangeCodeForSessionToken,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";

const app = new Hono<{ Bindings: Env }>();

// OAuth redirect URL
app.get("/api/oauth/google/redirect_url", async (c) => {
  const redirectUrl = await getOAuthRedirectUrl("google", {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

// Exchange code for session token
app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

// Get current user
app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

// Logout
app.get("/api/logout", async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === "string") {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Activity schema
const activitySchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum(["Work", "Study", "Sleep", "Entertainment", "Exercise", "Other"]),
  duration: z.number().int().min(1).max(1440),
  activity_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Goal schema
const goalSchema = z.object({
  category: z.enum(["Work", "Study", "Sleep", "Entertainment", "Exercise", "Other"]),
  target_minutes: z.number().int().min(1).max(1440),
});

// Get activities for a specific date
app.get(
  "/api/activities/:date",
  authMiddleware,
  zValidator("param", z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })),
  async (c) => {
    const user = c.get("user");
    const { date } = c.req.valid("param");

    const { results } = await c.env.DB.prepare(
      "SELECT * FROM activities WHERE user_id = ? AND activity_date = ? ORDER BY created_at DESC"
    )
      .bind(user!.id, date)
      .all();

    return c.json(results);
  }
);

// Get activities for a date range
app.get(
  "/api/activities/range/:start_date/:end_date",
  authMiddleware,
  zValidator("param", z.object({ 
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
  })),
  async (c) => {
    const user = c.get("user");
    const { start_date, end_date } = c.req.valid("param");

    const { results } = await c.env.DB.prepare(
      "SELECT * FROM activities WHERE user_id = ? AND activity_date >= ? AND activity_date <= ? ORDER BY activity_date ASC, created_at ASC"
    )
      .bind(user!.id, start_date, end_date)
      .all();

    return c.json(results);
  }
);

// Get total duration for a specific date
app.get(
  "/api/activities/:date/total",
  authMiddleware,
  zValidator("param", z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })),
  async (c) => {
    const user = c.get("user");
    const { date } = c.req.valid("param");

    const result = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(duration), 0) as total FROM activities WHERE user_id = ? AND activity_date = ?"
    )
      .bind(user!.id, date)
      .first<{ total: number }>();

    return c.json({ total: result?.total || 0 });
  }
);

// Create activity
app.post(
  "/api/activities",
  authMiddleware,
  zValidator("json", activitySchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    // Check total duration for the date
    const totalResult = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(duration), 0) as total FROM activities WHERE user_id = ? AND activity_date = ?"
    )
      .bind(user!.id, data.activity_date)
      .first<{ total: number }>();

    const currentTotal = totalResult?.total || 0;

    if (currentTotal + data.duration > 1440) {
      const remaining = 1440 - currentTotal;
      return c.json(
        { error: `You only have ${remaining} minutes left for this day.` },
        400
      );
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO activities (user_id, activity_date, name, category, duration, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
      .bind(user!.id, data.activity_date, data.name, data.category, data.duration)
      .run();

    const activity = await c.env.DB.prepare(
      "SELECT * FROM activities WHERE id = ?"
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(activity, 201);
  }
);

// Update activity
app.put(
  "/api/activities/:id",
  authMiddleware,
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", activitySchema),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    // Check if activity exists and belongs to user
    const existing = await c.env.DB.prepare(
      "SELECT * FROM activities WHERE id = ? AND user_id = ?"
    )
      .bind(id, user!.id)
      .first<{ duration: number; activity_date: string }>();

    if (!existing) {
      return c.json({ error: "Activity not found" }, 404);
    }

    // Check total duration (excluding current activity)
    const totalResult = await c.env.DB.prepare(
      "SELECT COALESCE(SUM(duration), 0) as total FROM activities WHERE user_id = ? AND activity_date = ? AND id != ?"
    )
      .bind(user!.id, data.activity_date, id)
      .first<{ total: number }>();

    const currentTotal = totalResult?.total || 0;

    if (currentTotal + data.duration > 1440) {
      const remaining = 1440 - currentTotal;
      return c.json(
        { error: `You only have ${remaining} minutes left for this day.` },
        400
      );
    }

    await c.env.DB.prepare(
      `UPDATE activities 
       SET name = ?, category = ?, duration = ?, activity_date = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    )
      .bind(data.name, data.category, data.duration, data.activity_date, id, user!.id)
      .run();

    const activity = await c.env.DB.prepare(
      "SELECT * FROM activities WHERE id = ?"
    )
      .bind(id)
      .first();

    return c.json(activity);
  }
);

// Delete activity
app.delete(
  "/api/activities/:id",
  authMiddleware,
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    const result = await c.env.DB.prepare(
      "DELETE FROM activities WHERE id = ? AND user_id = ?"
    )
      .bind(id, user!.id)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ error: "Activity not found" }, 404);
    }

    return c.json({ success: true });
  }
);

// Get all goals for user
app.get("/api/goals", authMiddleware, async (c) => {
  const user = c.get("user");

  const { results } = await c.env.DB.prepare(
    "SELECT * FROM goals WHERE user_id = ? ORDER BY category ASC"
  )
    .bind(user!.id)
    .all();

  return c.json(results);
});

// Create goal
app.post(
  "/api/goals",
  authMiddleware,
  zValidator("json", goalSchema),
  async (c) => {
    const user = c.get("user");
    const data = c.req.valid("json");

    // Check if goal already exists for this category
    const existing = await c.env.DB.prepare(
      "SELECT id FROM goals WHERE user_id = ? AND category = ?"
    )
      .bind(user!.id, data.category)
      .first();

    if (existing) {
      return c.json(
        { error: `A goal for ${data.category} already exists. Please update or delete the existing goal.` },
        400
      );
    }

    const result = await c.env.DB.prepare(
      `INSERT INTO goals (user_id, category, target_minutes, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`
    )
      .bind(user!.id, data.category, data.target_minutes)
      .run();

    const goal = await c.env.DB.prepare(
      "SELECT * FROM goals WHERE id = ?"
    )
      .bind(result.meta.last_row_id)
      .first();

    return c.json(goal, 201);
  }
);

// Update goal
app.put(
  "/api/goals/:id",
  authMiddleware,
  zValidator("param", z.object({ id: z.string() })),
  zValidator("json", goalSchema),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    // Check if goal exists and belongs to user
    const existing = await c.env.DB.prepare(
      "SELECT * FROM goals WHERE id = ? AND user_id = ?"
    )
      .bind(id, user!.id)
      .first<{ category: string }>();

    if (!existing) {
      return c.json({ error: "Goal not found" }, 404);
    }

    // If changing category, check if another goal exists for new category
    if (existing.category !== data.category) {
      const duplicate = await c.env.DB.prepare(
        "SELECT id FROM goals WHERE user_id = ? AND category = ? AND id != ?"
      )
        .bind(user!.id, data.category, id)
        .first();

      if (duplicate) {
        return c.json(
          { error: `A goal for ${data.category} already exists.` },
          400
        );
      }
    }

    await c.env.DB.prepare(
      `UPDATE goals 
       SET category = ?, target_minutes = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    )
      .bind(data.category, data.target_minutes, id, user!.id)
      .run();

    const goal = await c.env.DB.prepare(
      "SELECT * FROM goals WHERE id = ?"
    )
      .bind(id)
      .first();

    return c.json(goal);
  }
);

// Delete goal
app.delete(
  "/api/goals/:id",
  authMiddleware,
  zValidator("param", z.object({ id: z.string() })),
  async (c) => {
    const user = c.get("user");
    const { id } = c.req.valid("param");

    const result = await c.env.DB.prepare(
      "DELETE FROM goals WHERE id = ? AND user_id = ?"
    )
      .bind(id, user!.id)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ error: "Goal not found" }, 404);
    }

    return c.json({ success: true });
  }
);

// Get progress towards goals for a specific date
app.get(
  "/api/goals/progress/:date",
  authMiddleware,
  zValidator("param", z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })),
  async (c) => {
    const user = c.get("user");
    const { date } = c.req.valid("param");

    // Get all goals
    const { results: goals } = await c.env.DB.prepare(
      "SELECT * FROM goals WHERE user_id = ?"
    )
      .bind(user!.id)
      .all();

    // Get activity totals by category for the date
    const { results: activityTotals } = await c.env.DB.prepare(
      `SELECT category, SUM(duration) as total_minutes 
       FROM activities 
       WHERE user_id = ? AND activity_date = ?
       GROUP BY category`
    )
      .bind(user!.id, date)
      .all();

    const activityMap = activityTotals.reduce((acc: any, row: any) => {
      acc[row.category] = row.total_minutes;
      return acc;
    }, {});

    const progress = goals.map((goal: any) => ({
      ...goal,
      current_minutes: activityMap[goal.category] || 0,
      percentage: Math.round(((activityMap[goal.category] || 0) / goal.target_minutes) * 100),
    }));

    return c.json(progress);
  }
);

export default app;
