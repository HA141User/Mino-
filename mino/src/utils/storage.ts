export function parseBoundedPositiveInt(
  raw: string | null,
  max: number,
  min = 1,
): number | null {
  if (!raw) {
    return null
  }
  const trimmed = raw.trim()
  if (!/^\d{1,9}$/.test(trimmed)) {
    return null
  }
  const value = Number(trimmed)
  return Number.isSafeInteger(value) && value >= min && value <= max
    ? value
    : null
}

export function readStoredBoundedInt(
  key: string,
  max: number,
  fallbackKey?: string,
  min = 1,
): number | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const primary = parseBoundedPositiveInt(
      window.localStorage.getItem(key),
      max,
      min,
    )
    if (primary !== null) {
      return primary
    }
    return fallbackKey
      ? parseBoundedPositiveInt(
          window.localStorage.getItem(fallbackKey),
          max,
          min,
        )
      : null
  } catch {
    return null
  }
}
