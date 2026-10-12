const BYTES_PER_KILOBYTE = 1024;
const BYTES_PER_MEGABYTE = BYTES_PER_KILOBYTE * BYTES_PER_KILOBYTE;
const MEGABYTE_THRESHOLD = 1000 * BYTES_PER_KILOBYTE;

export function formatFileSize(size: number) {
  if (size > MEGABYTE_THRESHOLD) {
    return `${(size / BYTES_PER_MEGABYTE).toFixed(1)} MB`;
  }

  return `${(size / BYTES_PER_KILOBYTE).toFixed(1)} KB`;
}
