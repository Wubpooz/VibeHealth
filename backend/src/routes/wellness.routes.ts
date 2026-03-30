import { Hono } from 'hono';
import { prisma } from '../lib/prisma';
import { requireAuth } from '../middleware/auth.middleware';
import type { Session as AuthSession, User as AuthUser } from 'better-auth';
import type { MoodLog, JournalEntry } from '@prisma/client';
import { z } from 'zod';
import type { MoodEmoji } from '@prisma/client';

// =============================================================================
// Types
// =============================================================================

type AuthContext = {
  Variables: {
    user: AuthUser;
    session: AuthSession;
  };
};

// =============================================================================
// Validation Schemas
// =============================================================================

const moodEmojiEnum = ['VERY_SAD', 'SAD', 'NEUTRAL', 'HAPPY', 'VERY_HAPPY', 'EXCITED'] as const;

const moodLogUpsertSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  mood: z.enum(moodEmojiEnum),
  note: z.string().max(1000).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

const journalEntryCreateSchema = z.object({
  title: z.string().max(200).optional(),
  richText: z.string().min(1).max(10000),
  moodLogId: z.string().optional(),
});

const journalEntryUpdateSchema = z.object({
  title: z.string().max(200).optional(),
  richText: z.string().min(1).max(10000).optional(),
  moodLogId: z.string().optional().nullable(),
});

const mediaAttachmentSchema = z.object({
  type: z.enum(['IMAGE', 'AUDIO']),
  url: z.string().url(),
  mimeType: z.string().regex(/^[a-z]+\/[a-z0-9+\-.]+$/i),
  durationSeconds: z.number().int().positive().optional(),
});

// =============================================================================
// Rewards Service Stub
// =============================================================================

/**
 * Award carrots to a user (stub for integration with RewardsService).
 * Update this to call the actual RewardsService when available.
 */
async function awardCarrots(userId: string, amount: number): Promise<void> {
  try {
    // TODO: Integrate with actual RewardsService
    // Example: await rewardsService.awardCarrots(userId, amount);
    console.log(`[Rewards] Awarded ${amount} carrots to user ${userId}`);
  } catch (error) {
    console.error(`[Rewards] Failed to award carrots:`, error);
    // Non-blocking error — don't fail the request if rewards fail
  }
}

// =============================================================================
// Route Definitions
// =============================================================================

const wellnessRoutes = new Hono<AuthContext>();
wellnessRoutes.use('*', requireAuth);

// =============================================================================
// MOOD ROUTES: /api/v1/wellness/mood
// =============================================================================

/**
 * GET /mood
 * List recent mood logs for the authenticated user.
 * Query params: limit=30, offset=0
 */
wellnessRoutes.get('/mood', async (c) => {
  const user = c.get('user');
  const limitParam = c.req.query('limit') || '30';
  const offsetParam = c.req.query('offset') || '0';
  const limit = Math.min(Number.parseInt(limitParam), 365); // Max 1 year
  const offset = Number.parseInt(offsetParam);

  try {
    const [moodLogs, total] = await Promise.all([
      prisma.moodLog.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
        include: {
          journalEntries: {
            select: { id: true },
          },
        },
      }),
      prisma.moodLog.count({ where: { userId: user.id } }),
    ]);

    return c.json(
      {
        success: true,
        data: moodLogs.map((log: MoodLog & { journalEntries: Array<{ id: string }> }) => ({
          id: log.id,
          date: log.date,
          mood: log.mood,
          note: log.note,
          tags: log.tags,
          journalEntryCount: log.journalEntries.length,
          createdAt: log.createdAt,
          updatedAt: log.updatedAt,
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Mood] GET /mood error:', error);
    return c.json({ success: false, error: 'Failed to fetch mood logs' }, { status: 500 });
  }
});

/**
 * POST /mood
 * Upsert (create or update) a mood log for a given date.
 * One mood per user per day — enforced by unique constraint.
 */
wellnessRoutes.post('/mood', async (c) => {
  const user = c.get('user');

  try {
    const body = await c.req.json();
    const validated = moodLogUpsertSchema.parse(body);

    // Parse date and normalize to midnight UTC
    const [year, month, day] = validated.date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    dateObj.setUTCHours(0, 0, 0, 0);

    // Upsert: if mood exists for this date, update it; otherwise create
    const moodLog = await prisma.moodLog.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dateObj,
        },
      },
      update: {
        mood: validated.mood as MoodEmoji,
        note: validated.note || null,
        tags: validated.tags || [],
      },
      create: {
        userId: user.id,
        date: dateObj,
        mood: validated.mood as MoodEmoji,
        note: validated.note || null,
        tags: validated.tags || [],
      },
    });

    // Award carrots on creation (not on update)
    if (moodLog.createdAt === moodLog.updatedAt || !body.isUpdate) {
      await awardCarrots(user.id, 3);
    }

    return c.json(
      {
        success: true,
        data: {
          id: moodLog.id,
          date: moodLog.date,
          mood: moodLog.mood,
          note: moodLog.note,
          tags: moodLog.tags,
          createdAt: moodLog.createdAt,
          updatedAt: moodLog.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Mood] POST /mood error:', error);
    return c.json({ success: false, error: 'Failed to upsert mood log' }, { status: 500 });
  }
});

// =============================================================================
// JOURNAL ROUTES: /api/v1/wellness/journal
// =============================================================================

/**
 * GET /journal
 * List journal entries for the authenticated user (paginated).
 * Query params: limit=20, offset=0
 */
wellnessRoutes.get('/journal', async (c) => {
  const user = c.get('user');
  const limitParam = c.req.query('limit') || '20';
  const offsetParam = c.req.query('offset') || '0';
  const limit = Math.min(Number.parseInt(limitParam), 100);
  const offset = Number.parseInt(offsetParam);

  try {
    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          moodLog: {
            select: { id: true, date: true, mood: true },
          },
          mediaAttachments: {
            select: { id: true, type: true, url: true, mimeType: true, durationSeconds: true },
          },
        },
      }),
      prisma.journalEntry.count({ where: { userId: user.id } }),
    ]);

    return c.json(
      {
        success: true,
        data: entries.map((entry: JournalEntry & { moodLog: { id: string; date: Date; mood: string } | null; mediaAttachments: Array<{ id: string; type: string; url: string; mimeType: string | null; durationSeconds: number | null }> }) => ({
          id: entry.id,
          title: entry.title,
          richText: entry.richText,
          mood: entry.moodLog
            ? {
                id: entry.moodLog.id,
                date: entry.moodLog.date,
                mood: entry.moodLog.mood,
              }
            : null,
          media: entry.mediaAttachments,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        })),
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + limit < total,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Journal] GET /journal error:', error);
    return c.json({ success: false, error: 'Failed to fetch journal entries' }, { status: 500 });
  }
});

/**
 * GET /journal/:id
 * Retrieve a single journal entry with full details.
 */
wellnessRoutes.get('/journal/:id', async (c) => {
  const user = c.get('user');
  const journalId = c.req.param('id');

  try {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: journalId,
        userId: user.id, // Ensure ownership
      },
      include: {
        moodLog: true,
        mediaAttachments: true,
      },
    });

    if (!entry) {
      return c.json({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    return c.json(
      {
        success: true,
        data: {
          id: entry.id,
          title: entry.title,
          richText: entry.richText,
          moodLog: entry.moodLog,
          mediaAttachments: entry.mediaAttachments,
          createdAt: entry.createdAt,
          updatedAt: entry.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Journal] GET /journal/:id error:', error);
    return c.json({ success: false, error: 'Failed to fetch journal entry' }, { status: 500 });
  }
});

/**
 * POST /journal
 * Create a new journal entry with optional media attachments.
 * Accepts both application/json and multipart/form-data.
 */
wellnessRoutes.post('/journal', async (c) => {
  const user = c.get('user');

  try {
    // Parse request body - handle both JSON and multipart/form-data
    let body: Record<string, unknown>;
    const contentType = c.req.header('content-type') || '';

    console.log(`[Journal] POST /journal - Content-Type: ${contentType}`);

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart/form-data (with file uploads)
      console.log('[Journal] Parsing multipart/form-data...');
      const formData = await c.req.formData();
      body = {
        title: formData.get('title') || undefined,
        richText: formData.get('richText'),
        moodLogId: formData.get('moodLogId') || undefined,
        media: formData.getAll('media'),
      };
      console.log(`[Journal] Received ${(body.media as unknown[])?.length || 0} file(s)`);
    } else {
      // Handle application/json
      console.log('[Journal] Parsing application/json...');
      body = await c.req.json();
    }

    // Validate core fields
    const validated = journalEntryCreateSchema.parse({
      title: body.title,
      richText: body.richText,
      moodLogId: body.moodLogId,
    });

    // Verify mood log exists if provided
    if (validated.moodLogId) {
      const moodLog = await prisma.moodLog.findFirst({
        where: {
          id: validated.moodLogId,
          userId: user.id, // Ensure user owns this mood log
        },
      });

      if (!moodLog) {
        return c.json({ success: false, error: 'Mood log not found' }, { status: 404 });
      }
    }

    const entry = await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: validated.title || null,
        richText: validated.richText,
        moodLogId: validated.moodLogId || null,
      },
      include: {
        moodLog: true,
        mediaAttachments: true,
      },
    });

    // Process and store media files
    const media = body.media as File[] | undefined;
    if (media && Array.isArray(media) && media.length > 0) {
      console.log(`[Journal] Processing ${media.length} file(s) for entry ${entry.id}`);
      
      for (const file of media) {
        try {
          // Validate file type (images and audio only)
          const isValidImage = file.type.startsWith('image/');
          const isValidAudio = file.type.startsWith('audio/');
          
          if (!isValidImage && !isValidAudio) {
            console.warn(`[Journal] Skipping invalid file type: ${file.type}`);
            continue;
          }

          // Convert file to base64
          const buffer = await file.arrayBuffer();
          const base64Data = Buffer.from(buffer).toString('base64');
          const dataUrl = `data:${file.type};base64,${base64Data}`;

          // Determine media type
          const mediaType = isValidImage ? 'IMAGE' : 'AUDIO';

          // Create media attachment record
          await prisma.mediaAttachment.create({
            data: {
              journalEntryId: entry.id,
              type: mediaType,
              url: dataUrl,
              mimeType: file.type,
              durationSeconds: null, // TODO: Extract duration for audio files
            },
          });

          console.log(`[Journal] Created media attachment for entry ${entry.id}: ${file.name} (${mediaType})`);
        } catch (fileError) {
          console.error(`[Journal] Error processing file ${file.name}:`, fileError);
          // Continue with next file if one fails
        }
      }
    }

    // Fetch the entry again with updated media attachments
    const completedEntry = await prisma.journalEntry.findUnique({
      where: { id: entry.id },
      include: {
        moodLog: true,
        mediaAttachments: true,
      },
    });

    // Award carrots for creating journal entry
    await awardCarrots(user.id, 3);

    return c.json(
      {
        success: true,
        data: {
          id: completedEntry!.id,
          title: completedEntry!.title,
          richText: completedEntry!.richText,
          moodLog: completedEntry!.moodLog,
          mediaAttachments: completedEntry!.mediaAttachments || [],
          createdAt: completedEntry!.createdAt,
          updatedAt: completedEntry!.updatedAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Journal] POST /journal error:', error);
    return c.json({ success: false, error: 'Failed to create journal entry' }, { status: 500 });
  }
});

/**
 * PATCH /journal/:id
 * Update an existing journal entry.
 */
wellnessRoutes.patch('/journal/:id', async (c) => {
  const user = c.get('user');
  const journalId = c.req.param('id');

  try {
    // Verify ownership
    const existing = await prisma.journalEntry.findFirst({
      where: {
        id: journalId,
        userId: user.id,
      },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    const body = await c.req.json();
    const validated = journalEntryUpdateSchema.parse(body);

    // Verify mood log if provided
    if (validated.moodLogId) {
      const moodLog = await prisma.moodLog.findFirst({
        where: {
          id: validated.moodLogId,
          userId: user.id,
        },
      });

      if (!moodLog) {
        return c.json({ success: false, error: 'Mood log not found' }, { status: 404 });
      }
    }

    const updatedEntry = await prisma.journalEntry.update({
      where: { id: journalId },
      data: {
        title: validated.title ?? undefined,
        richText: validated.richText ?? undefined,
        moodLogId: validated.moodLogId === undefined ? undefined : validated.moodLogId,
      },
      include: {
        moodLog: true,
        mediaAttachments: true,
      },
    });

    return c.json(
      {
        success: true,
        data: {
          id: updatedEntry.id,
          title: updatedEntry.title,
          richText: updatedEntry.richText,
          moodLog: updatedEntry.moodLog,
          mediaAttachments: updatedEntry.mediaAttachments,
          createdAt: updatedEntry.createdAt,
          updatedAt: updatedEntry.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Journal] PATCH /journal/:id error:', error);
    return c.json({ success: false, error: 'Failed to update journal entry' }, { status: 500 });
  }
});

/**
 * DELETE /journal/:id
 * Delete a journal entry (cascades to media attachments).
 */
wellnessRoutes.delete('/journal/:id', async (c) => {
  const user = c.get('user');
  const journalId = c.req.param('id');

  try {
    // Verify ownership before delete
    const existing = await prisma.journalEntry.findFirst({
      where: {
        id: journalId,
        userId: user.id,
      },
    });

    if (!existing) {
      return c.json({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    // Delete cascade is handled by Prisma schema (onDelete: Cascade)
    await prisma.journalEntry.delete({
      where: { id: journalId },
    });

    return c.json(
      {
        success: true,
        message: 'Journal entry deleted',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Journal] DELETE /journal/:id error:', error);
    return c.json({ success: false, error: 'Failed to delete journal entry' }, { status: 500 });
  }
});

// =============================================================================
// MEDIA ATTACHMENT ROUTES: /api/v1/wellness/journal/:journalId/media
// =============================================================================

/**
 * POST /journal/:journalId/media
 * Add a media attachment (image or audio) to a journal entry.
 */
wellnessRoutes.post('/journal/:journalId/media', async (c) => {
  const user = c.get('user');
  const journalId = c.req.param('journalId');

  try {
    // Verify journal entry ownership
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id: journalId,
        userId: user.id,
      },
    });

    if (!journalEntry) {
      return c.json({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    const body = await c.req.json();
    const validated = mediaAttachmentSchema.parse(body);

    const attachment = await prisma.mediaAttachment.create({
      data: {
        journalEntryId: journalId,
        type: validated.type,
        url: validated.url,
        mimeType: validated.mimeType,
        durationSeconds: validated.durationSeconds || null,
      },
    });

    return c.json(
      {
        success: true,
        data: {
          id: attachment.id,
          type: attachment.type,
          url: attachment.url,
          mimeType: attachment.mimeType,
          durationSeconds: attachment.durationSeconds,
          createdAt: attachment.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('[Media] POST /journal/:journalId/media error:', error);
    return c.json({ success: false, error: 'Failed to attach media' }, { status: 500 });
  }
});

/**
 * DELETE /journal/:journalId/media/:mediaId
 * Delete a specific media attachment from a journal entry.
 */
wellnessRoutes.delete('/journal/:journalId/media/:mediaId', async (c) => {
  const user = c.get('user');
  const journalId = c.req.param('journalId');
  const mediaId = c.req.param('mediaId');

  try {
    // Verify journal entry ownership
    const journalEntry = await prisma.journalEntry.findFirst({
      where: {
        id: journalId,
        userId: user.id,
      },
    });

    if (!journalEntry) {
      return c.json({ success: false, error: 'Journal entry not found' }, { status: 404 });
    }

    // Verify media attachment belongs to this journal
    const mediaAttachment = await prisma.mediaAttachment.findFirst({
      where: {
        id: mediaId,
        journalEntryId: journalId,
      },
    });

    if (!mediaAttachment) {
      return c.json({ success: false, error: 'Media attachment not found' }, { status: 404 });
    }

    await prisma.mediaAttachment.delete({
      where: { id: mediaId },
    });

    return c.json(
      {
        success: true,
        message: 'Media attachment deleted',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[Media] DELETE /journal/:journalId/media/:mediaId error:', error);
    return c.json({ success: false, error: 'Failed to delete media attachment' }, { status: 500 });
  }
});

export default wellnessRoutes;
