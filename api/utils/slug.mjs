export function sanitizeSlug(raw) {
  if (!raw) return '';
  try {
    // Attempt to decode in case it's double-encoded
    raw = decodeURIComponent(raw);
  } catch (e) {
    // Ignore if not a valid URI component
  }

  return raw
    .toLowerCase()
    .normalize('NFD') // Decompose accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove all non-alphanumeric except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens into one
    .replace(/^-|-$/g, ''); // Trim hyphens from start and end
}
