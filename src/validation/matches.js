import { z } from 'zod';

// Match status constants
export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

// List matches query schema
export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

// Match ID parameter schema
export const matchIdParamSchema = z.object({
  id: z.coerce
    .number()
    .int()
    .positive(),
});

// Create match schema
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'Sport must be a non-empty string'),
    homeTeam: z.string().min(1, 'Home team must be a non-empty string'),
    awayTeam: z.string().min(1, 'Away team must be a non-empty string'),
    startTime: z.iso.datetime(),
    endTime: z.iso.datetime(),
    homeScore: z.coerce
      .number()
      .int()
      .min(0)
      .optional(),
    awayScore: z.coerce
      .number()
      .int()
      .min(0)
      .optional(),
  })
  .superRefine((data, ctx) => {
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    if (endTime <= startTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'endTime must be chronologically after startTime',
        path: ['endTime'],
      });
    }
  });

// Update score schema
export const updateScoreSchema = z.object({
  homeScore: z.coerce
    .number()
    .int()
    .min(0),
  awayScore: z.coerce
    .number()
    .int()
    .min(0),
});
