import { z } from 'zod/v4'

const MessageFields = z.object({
  content: z.string().min(1).max(4000)
})

const UserId = z.uuid()

export const SendDirectMessageValidator = z.object({
  senderId: UserId,
  recipientId: UserId,
  content: MessageFields.shape.content
})

export const EditMessageValidator = z.object({
  editorId: UserId,
  content: MessageFields.shape.content
})

export const DeleteMessageValidator = z.object({
  requesterId: UserId
})

export const ReplyMessageValidator = z.object({
  senderId: UserId,
  content: MessageFields.shape.content
})
