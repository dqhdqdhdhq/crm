import { Phone, MessageCircle, Mail, CalendarPlus } from 'lucide-react';
import { Lead } from '../../types/crm';
import { telHref, waHref, mailtoHref, gcalHref } from '../../lib/connect';

type Size = 'sm' | 'md';

interface Props {
  lead: Lead;
  size?: Size;
  // When true, clicks bubble (so the row can still select the lead).
  // Default false: clicks are "act, don't navigate" — the lead is not selected.
  bubble?: boolean;
}

// Compact one-click row: tel · WhatsApp · email · Google Calendar.
// Each action opens externally. Disabled (greyed) when contact info is missing.
export function ConnectivityActions({ lead, size = 'sm', bubble = false }: Props) {
  const tel = telHref(lead.phone);
  const wa = waHref(lead.phone, `Hi ${lead.name.split(' ')[0]} — `);
  const mail = mailtoHref(lead.email, {
    subject: lead.offer ? `${lead.offer} — quick follow-up` : `Following up`,
  });
  const cal = gcalHref({
    title: `${lead.company} — call`,
    details: lead.offer || '',
    attendees: lead.email ? [lead.email] : undefined,
  });

  const stop = (e: React.MouseEvent) => {
    if (!bubble) e.stopPropagation();
  };

  const dims = size === 'md' ? 'w-8 h-8' : 'w-7 h-7';
  const icon = size === 'md' ? 14 : 13;

  return (
    <div className="flex items-center gap-1" onClick={stop}>
      <ConnectIcon
        href={tel}
        label="Call"
        dims={dims}
        iconSize={icon}
        tone="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20"
        muted="text-gray-300"
      >
        <Phone className="w-full h-full" strokeWidth={2} />
      </ConnectIcon>
      <ConnectIcon
        href={wa}
        label="WhatsApp"
        dims={dims}
        iconSize={icon}
        tone="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
        muted="text-gray-300"
        external
      >
        <MessageCircle className="w-full h-full" strokeWidth={2} />
      </ConnectIcon>
      <ConnectIcon
        href={mail}
        label="Email"
        dims={dims}
        iconSize={icon}
        tone="bg-violet-500/10 text-violet-700 hover:bg-violet-500/20"
        muted="text-gray-300"
      >
        <Mail className="w-full h-full" strokeWidth={2} />
      </ConnectIcon>
      <ConnectIcon
        href={cal}
        label="Schedule"
        dims={dims}
        iconSize={icon}
        tone="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20"
        muted="text-gray-300"
        external
      >
        <CalendarPlus className="w-full h-full" strokeWidth={2} />
      </ConnectIcon>
    </div>
  );
}

function ConnectIcon({
  href,
  label,
  dims,
  iconSize,
  tone,
  muted,
  external,
  children,
}: {
  href?: string;
  label: string;
  dims: string;
  iconSize: number;
  tone: string;
  muted: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  if (!href) {
    return (
      <span
        title={`${label} — not set`}
        className={`${dims} rounded-lg flex items-center justify-center ${muted} opacity-40 cursor-not-allowed`}
      >
        <span style={{ width: iconSize, height: iconSize }} className="block">
          {children}
        </span>
      </span>
    );
  }
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      title={label}
      className={`${dims} rounded-lg flex items-center justify-center transition ${tone} ios-press`}
    >
      <span style={{ width: iconSize, height: iconSize }} className="block">
        {children}
      </span>
    </a>
  );
}
