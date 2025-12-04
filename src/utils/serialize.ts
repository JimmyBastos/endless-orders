import { instanceToPlain } from 'class-transformer'

/**
 * Serializes entity instances to plain objects using class-transformer
 * This ensures @Expose decorators and getters are properly handled
 */
export function serialize<T>(data: T): Record<string, unknown> | Record<string, unknown>[] {
  return instanceToPlain(data, {
    excludeExtraneousValues: true,
    enableCircularCheck: true
  }) as Record<string, unknown> | Record<string, unknown>[]
}
