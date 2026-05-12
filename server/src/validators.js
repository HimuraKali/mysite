import { z } from 'zod'

export const stagesSchema = z
  .array(
    z.object({
      id: z.string().optional(),
      title: z.string(),
      blocks: z.array(
        z.discriminatedUnion('type', [
          z.object({ id: z.string().optional(), type: z.literal('text'), text: z.string() }),
          z.object({
            id: z.string().optional(),
            type: z.literal('practice'),
            prompt: z.string(),
            hint: z.string().optional().default(''),
          }),
          z.object({
            id: z.string().optional(),
            type: z.literal('image'),
            src: z.string().optional().default(''),
            name: z.string().optional().default(''),
            mime: z.string().optional().default(''),
          }),
          z.object({
            id: z.string().optional(),
            type: z.literal('video'),
            src: z.string().optional().default(''),
            name: z.string().optional().default(''),
            mime: z.string().optional().default(''),
          }),
          z.object({
            id: z.string().optional(),
            type: z.literal('test'),
            question: z.string(),
            optionsText: z.string(),
            correctIndex: z.number().int().nonnegative(),
            wrongHint: z.string().optional().default(''),
          }),
        ]),
      ),
    }),
  )
  .min(1)

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export const createCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  category: z.string().min(1),
  coverImage: z.string().optional(),
  stages: stagesSchema,
})

export const updateCourseSchema = createCourseSchema

export const progressSchema = z.object({
  currentStageIdx: z.number().int().nonnegative(),
  completedStages: z.number().int().nonnegative(),
})

