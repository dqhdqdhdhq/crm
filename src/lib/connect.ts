// One-click connectivity helpers. Pure functions, no deps.
// Used by PersonRow, ConnectivityBar, and keyboard shortcuts.

const stripToDigits = (s: string) => s.replace(/\D/g, '');
const stripToTel = (s: string) => s.replace(/[^\d+]/g, '');

export function telHref(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const cleaned = stripToTel(phone);
  return cleaned ? `tel:${cleaned}` : undefined;
}

export function waHref(phone?: string | null, message?: string): string | undefined {
  if (!phone) return undefined;
  const digits = stripToDigits(phone);
  if (!digits) return undefined;
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export interface MailParts {
  subject?: string;
  body?: string;
}

export function mailtoHref(email?: string | null, parts?: MailParts): string | undefined {
  if (!email) return undefined;
  const params = new URLSearchParams();
  if (parts?.subject) params.set('subject', parts.subject);
  if (parts?.body) params.set('body', parts.body);
  const qs = params.toString();
  return `mailto:${email}${qs ? '?' + qs : ''}`;
}

export interface CalendarEventParts {
  title: string;
  start?: Date;
  durationMinutes?: number;
  details?: string;
  location?: string;
  attendees?: string[];
}

// Format a Date as YYYYMMDDTHHmmssZ (Google Calendar's `dates` param).
function fmtGcalDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

export function gcalHref({
  title,
  start,
  durationMinutes = 30,
  details,
  location,
  attendees,
}: CalendarEventParts): string {
  const params = new URLSearchParams({ action: 'TEMPLATE', text: title });
  if (start) {
    const end = new Date(start.getTime() + durationMinutes * 60_000);
    params.set('dates', `${fmtGcalDate(start)}/${fmtGcalDate(end)}`);
  }
  if (details) params.set('details', details);
  if (location) params.set('location', location);
  if (attendees && attendees.length) params.set('add', attendees.join(','));
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Read a list of files into base64 data URLs. Used by DocumentsSection's drop zone.
export function readFilesAsDataUrls(files: File[]): Promise<
  { name: string; mime: string; size: number; dataUrl: string }[]
> {
  return Promise.all(
    files.map(
      (f) =>
        new Promise<{ name: string; mime: string; size: number; dataUrl: string }>(
          (resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                name: f.name,
                mime: f.type || 'application/octet-stream',
                size: f.size,
                dataUrl: typeof reader.result === 'string' ? reader.result : '',
              });
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(f);
          },
        ),
    ),
  );
}

export function downloadDataUrl(name: string, dataUrl: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
