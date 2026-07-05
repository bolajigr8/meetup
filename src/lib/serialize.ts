// src/lib/serialize.ts
import { Types } from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

function isPopulatedUserDoc(value: unknown): value is AnyRecord {
  return (
    typeof value === 'object' &&
    value !== null &&
    !(value instanceof Types.ObjectId) &&
    !(value instanceof Date) &&
    '_id' in (value as AnyRecord)
  )
}

/**
 * Converts a populated sub-document's `_id` to `id`, matching the shape
 * the frontend's AssignedUser interface expects: { id, name, email, image }.
 * Mongoose's populate() keeps `_id` on sub-documents even with .lean(), so
 * without this the frontend silently receives `_id` instead of `id` and
 * every "is this user assigned to me" comparison fails without erroring.
 */
function serializePopulatedUser(user: AnyRecord) {
  const { _id, ...rest } = user
  return { id: _id?.toString?.() ?? String(_id), ...rest }
}

/**
 * Serializes a lean Mongoose document for API responses: converts the
 * top-level `_id` to `id`, drops `__v`, and recursively fixes `_id` -> `id`
 * on any populated `assignedTo` array so nested user objects match what
 * the frontend expects.
 */
export function serialize(doc: AnyRecord) {
  const { _id, __v, assignedTo, ...rest } = doc

  const serializedAssignedTo = Array.isArray(assignedTo)
    ? assignedTo.map((entry) =>
        isPopulatedUserDoc(entry)
          ? serializePopulatedUser(entry)
          : (entry?.toString?.() ?? entry),
      )
    : assignedTo

  return {
    id: (_id as { toString(): string }).toString(),
    ...rest,
    ...(assignedTo !== undefined ? { assignedTo: serializedAssignedTo } : {}),
  }
}
