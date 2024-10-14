import { z } from "zod"
import type { JwtPayload } from "jsonwebtoken"
import type { Room } from "@@/types"

export const ACCESS_TOKEN_TTL = 60 * 60
export const REFRESH_TOKEN_TTL = 60 * 60 * 24

export const credentialsSchema = z.object({
  user: z.string().min(3),
  room: z.string().min(3)
})

export type CredentialsSchema = z.infer<typeof credentialsSchema>

export type VerifiedToken = Room & JwtPayload