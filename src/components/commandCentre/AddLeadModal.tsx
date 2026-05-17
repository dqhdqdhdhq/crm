import { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import {
  Lead,
  LeadStage,
  NextActionType,
  STAGE_DEFAULT_PROBABILITY,
  STAGE_LABELS,
  STAGE_ORDER,
  NEXT_ACTION_LABELS,
  DealType,
  DEAL_TYPE_LABELS,
  AwarenessSource,
  AWARENESS_SOURCE_LABELS,
  VenueEnvironment,
  VENUE_ENV_LABELS,
  ReferrerType,
  REFERRER_TYPE_LABELS,
  SocialInboundType,
  SOCIAL_INBOUND_LABELS,
  ColdOutreachChannel,
  COLD_CHANNEL_LABELS,
  ProofAsset,
  CommercialDetails,
} from '../../types/crm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  defaultIsClient?: boolean;
  proofAssets: ProofAsset[];
}

export function AddLeadModal({
  isOpen,
  onClose,
  onSave,
  defaultIsClient = false,
  proofAssets,
}: Props) {
  const [mode, setMode] = useState<'lead' | 'client'>(defaultIsClient ? 'client' : 'lead');
  const [dealType, setDealType] = useState<DealType>('ai-commercial');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [offer, setOffer] = useState('');
  const [oneTimeValue, setOneTimeValue] = useState<number>(0);
  const [monthlyValue, setMonthlyValue] = useState<number>(0);
  const [stage, setStage] = useState<LeadStage>('new');
  const [nextAction, setNextAction] = useState<NextActionType | ''>('call');
  const [nextActionNote, setNextActionNote] = useState('');
  const [nextActionDueDate, setNextActionDueDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // ── AI Commercial specific ──────────────────────────────────────────────
  const [country, setCountry] = useState('');
  const [industry, setIndustry] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [website, setWebsite] = useState('');

  const [awarenessSource, setAwarenessSource] = useState<AwarenessSource>('in-person-networking');
  const [awarenessDate, setAwarenessDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );

  // Networking
  const [netCity, setNetCity] = useState('');
  const [netVenue, setNetVenue] = useState('');
  const [netEnv, setNetEnv] = useState<VenueEnvironment>('luxury-hotel');
  const [netShowed, setNetShowed] = useState<boolean>(true);
  const [netAssetId, setNetAssetId] = useState<string>('');

  // Referral
  const [refName, setRefName] = useState('');
  const [refType, setRefType] = useState<ReferrerType>('existing-client');
  const [refCompany, setRefCompany] = useState('');

  // Social
  const [socAssetId, setSocAssetId] = useState<string>('');
  const [socUrl, setSocUrl] = useState('');
  const [socInboundType, setSocInboundType] = useState<SocialInboundType>('dm');

  // Website inbound
  const [webHowFound, setWebHowFound] = useState('');
  const [webPage, setWebPage] = useState('');

  // Cold outreach
  const [coldChannel, setColdChannel] = useState<ColdOutreachChannel>('email');
  const [coldCampaign, setColdCampaign] = useState('');
  const [coldSpecId, setColdSpecId] = useState<string>('');
  const [coldAngle, setColdAngle] = useState('');

  if (!isOpen) return null;

  const isCommercial = dealType === 'ai-commercial';
  const showSource = (...s: AwarenessSource[]) => s.includes(awarenessSource);

  const reset = () => {
    setDealType('ai-commercial');
    setName('');
    setCompany('');
    setOffer('');
    setOneTimeValue(0);
    setMonthlyValue(0);
    setStage(mode === 'client' ? 'won' : 'new');
    setNextAction('call');
    setNextActionNote('');
    setNextActionDueDate(new Date().toISOString().slice(0, 10));
    setEmail('');
    setPhone('');
    setNotes('');
    setCountry('');
    setIndustry('');
    setInstagram('');
    setLinkedin('');
    setWebsite('');
    setAwarenessSource('in-person-networking');
    setAwarenessDate(new Date().toISOString().slice(0, 10));
    setNetCity('');
    setNetVenue('');
    setNetEnv('luxury-hotel');
    setNetShowed(true);
    setNetAssetId('');
    setRefName('');
    setRefType('existing-client');
    setRefCompany('');
    setSocAssetId('');
    setSocUrl('');
    setSocInboundType('dm');
    setWebHowFound('');
    setWebPage('');
    setColdChannel('email');
    setColdCampaign('');
    setColdSpecId('');
    setColdAngle('');
  };

  const canSave =
    name.trim() &&
    company.trim() &&
    (!isCommercial || (country.trim() && industry.trim() && awarenessSource && awarenessDate));

  const handleSave = () => {
    if (!canSave) return;
    const isClient = mode === 'client';
    const finalStage: LeadStage = isClient ? 'won' : stage;
    const probability =
      finalStage === 'won' ? 100 : finalStage === 'lost' ? 0 : STAGE_DEFAULT_PROBABILITY[finalStage];

    let commercial: CommercialDetails | undefined;
    if (isCommercial) {
      commercial = {
        firstAwarenessSource: awarenessSource,
        firstAwarenessDate: new Date(awarenessDate),
        instagram: instagram.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        website: website.trim() || undefined,
      };
      if (awarenessSource === 'in-person-networking') {
        commercial.networking = {
          city: netCity.trim() || undefined,
          venue: netVenue.trim() || undefined,
          metAt: awarenessDate ? new Date(awarenessDate) : undefined,
          environment: netEnv,
          showedWorkInPerson: netShowed,
          firstAssetShownId: netAssetId || undefined,
        };
        if (netAssetId) commercial.firstAssetSeenId = netAssetId;
      } else if (awarenessSource === 'referral') {
        commercial.referral = {
          referrerName: refName.trim() || undefined,
          referrerType: refType,
          referrerCompany: refCompany.trim() || undefined,
        };
      } else if (
        awarenessSource === 'instagram-inbound' ||
        awarenessSource === 'linkedin-inbound' ||
        awarenessSource === 'x-inbound'
      ) {
        commercial.social = {
          triggerAssetId: socAssetId || undefined,
          triggerUrl: socUrl.trim() || undefined,
          inboundType: socInboundType,
        };
        if (socAssetId) commercial.firstAssetSeenId = socAssetId;
      } else if (awarenessSource === 'website-inbound') {
        commercial.websiteInbound = {
          howFound: webHowFound.trim() || undefined,
          pageOrProject: webPage.trim() || undefined,
        };
      } else if (awarenessSource === 'cold-outreach') {
        commercial.coldOutreach = {
          channel: coldChannel,
          campaignName: coldCampaign.trim() || undefined,
          specSentId: coldSpecId || undefined,
          messageAngle: coldAngle.trim() || undefined,
        };
        if (coldSpecId) commercial.assetShownId = coldSpecId;
      }
    }

    const lead: Lead = {
      id: crypto.randomUUID(),
      name: name.trim(),
      company: company.trim(),
      offer:
        offer.trim() ||
        (isCommercial ? 'AI Commercial — to be scoped' : 'Untitled offer'),
      stage: finalStage,
      temperature: finalStage === 'verbal-yes' || finalStage === 'proposal-sent' ? 'hot' : 'warm',
      probability,
      oneTimeValue: Number(oneTimeValue) || 0,
      monthlyValue: Number(monthlyValue) || 0,
      nextAction: isClient ? 'follow-up' : ((nextAction || null) as NextActionType | null),
      nextActionNote: nextActionNote.trim(),
      nextActionDueDate: nextActionDueDate ? new Date(nextActionDueDate) : null,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'note',
          description: isClient ? 'Client added' : 'Lead added',
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      isClient,
      deliveryStatus: isClient ? 'not-started' : undefined,
      startDate: isClient ? new Date() : undefined,
      dealType,
      country: country.trim() || undefined,
      industry: industry.trim() || undefined,
      source: isCommercial ? AWARENESS_SOURCE_LABELS[awarenessSource] : undefined,
      commercial,
      stageHistory: [
        {
          id: crypto.randomUUID(),
          from: null,
          to: finalStage,
          enteredAt: new Date(),
        },
      ],
    };
    onSave(lead);
    reset();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <aside className="fixed top-0 right-0 h-screen w-full max-w-[480px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 animate-fade-in">
        <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Lead / Client</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        <div className="grid grid-cols-2 px-6 pt-4 gap-2 border-b border-gray-100">
          {(['lead', 'client'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === 'client') setStage('won');
                else setStage('new');
              }}
              className={`pb-3 text-sm font-bold border-b-2 transition ${
                mode === m
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'lead' ? 'Lead' : 'Client'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* ── Deal Type ── */}
          <FieldGroup label="Deal Type *">
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(DEAL_TYPE_LABELS) as DealType[]).map((d) => {
                const active = dealType === d;
                const isAC = d === 'ai-commercial';
                return (
                  <button
                    key={d}
                    onClick={() => setDealType(d)}
                    className={`px-3 py-2 rounded-xl text-[12.5px] font-semibold transition flex items-center justify-center gap-1.5 ${
                      active
                        ? isAC
                          ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_2px_8px_rgba(99,102,241,0.35)]'
                          : 'bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)]'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {isAC && <Sparkles className="w-3.5 h-3.5" />}
                    {DEAL_TYPE_LABELS[d]}
                  </button>
                );
              })}
            </div>
          </FieldGroup>

          {/* ── Identity ── */}
          <FieldGroup label="Full Name *">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter contact name"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>

          <FieldGroup label={isCommercial ? 'Company / Brand *' : 'Company *'}>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder={isCommercial ? 'Brand or company' : 'Enter company name'}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>

          {/* ── Country & Industry (AI Commercial — required) ── */}
          {isCommercial && (
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Country *">
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Spain, UAE, UK"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>
              <FieldGroup label="Industry / Vertical *">
                <input
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Hospitality, CPG"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>
            </div>
          )}

          {!isCommercial && (
            <FieldGroup label="Offer / Service">
              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="e.g. Website + booking system"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
          )}

          {isCommercial && (
            <FieldGroup label="Offer / Project (optional)">
              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                placeholder="e.g. Hero brand film + asset pack"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label={isCommercial ? 'Project Budget (€)' : 'One-Time (€)'}>
              <input
                type="number"
                value={oneTimeValue || ''}
                onChange={(e) => setOneTimeValue(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
            {!isCommercial && (
              <FieldGroup label="Monthly (€)">
                <input
                  type="number"
                  value={monthlyValue || ''}
                  onChange={(e) => setMonthlyValue(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>
            )}
            {isCommercial && mode === 'lead' && (
              <FieldGroup label="Stage *">
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LeadStage)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                >
                  {STAGE_ORDER.filter((s) => s !== 'won' && s !== 'lost').map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </select>
              </FieldGroup>
            )}
          </div>

          {mode === 'lead' && !isCommercial && (
            <FieldGroup label="Stage *">
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as LeadStage)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              >
                {STAGE_ORDER.filter((s) => s !== 'won' && s !== 'lost').map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </FieldGroup>
          )}

          {/* ── First Awareness (AI Commercial — required) ── */}
          {isCommercial && (
            <div className="rounded-2xl bg-gradient-to-br from-indigo-50/60 to-violet-50/40 border border-indigo-100/80 p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Attribution — how they found you
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-gray-600 uppercase">
                    First Awareness Source *
                  </label>
                  <select
                    value={awarenessSource}
                    onChange={(e) => setAwarenessSource(e.target.value as AwarenessSource)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm focus:border-indigo-400 focus:outline-none"
                  >
                    {(Object.keys(AWARENESS_SOURCE_LABELS) as AwarenessSource[]).map((s) => (
                      <option key={s} value={s}>
                        {AWARENESS_SOURCE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-600 uppercase">Date *</label>
                  <input
                    type="date"
                    value={awarenessDate}
                    onChange={(e) => setAwarenessDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              {showSource('in-person-networking') && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Mini label="City">
                      <input
                        value={netCity}
                        onChange={(e) => setNetCity(e.target.value)}
                        placeholder="Madrid, Skopje…"
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      />
                    </Mini>
                    <Mini label="Venue / place met">
                      <input
                        value={netVenue}
                        onChange={(e) => setNetVenue(e.target.value)}
                        placeholder="e.g. Hotel Santo Mauro bar"
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      />
                    </Mini>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Mini label="Environment">
                      <select
                        value={netEnv}
                        onChange={(e) => setNetEnv(e.target.value as VenueEnvironment)}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      >
                        {(Object.keys(VENUE_ENV_LABELS) as VenueEnvironment[]).map((v) => (
                          <option key={v} value={v}>
                            {VENUE_ENV_LABELS[v]}
                          </option>
                        ))}
                      </select>
                    </Mini>
                    <Mini label="Showed work in person?">
                      <div className="grid grid-cols-2 gap-1">
                        {[true, false].map((b) => (
                          <button
                            key={String(b)}
                            onClick={() => setNetShowed(b)}
                            className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition ${
                              netShowed === b
                                ? 'bg-indigo-500 text-white'
                                : 'bg-white text-gray-600 border border-indigo-200'
                            }`}
                          >
                            {b ? 'Yes' : 'No'}
                          </button>
                        ))}
                      </div>
                    </Mini>
                  </div>
                  <Mini label="First asset shown">
                    <select
                      value={netAssetId}
                      onChange={(e) => setNetAssetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    >
                      <option value="">— none —</option>
                      {proofAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </Mini>
                </div>
              )}

              {showSource('referral') && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Mini label="Referred by">
                      <input
                        value={refName}
                        onChange={(e) => setRefName(e.target.value)}
                        placeholder="Name"
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      />
                    </Mini>
                    <Mini label="Referrer type">
                      <select
                        value={refType}
                        onChange={(e) => setRefType(e.target.value as ReferrerType)}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      >
                        {(Object.keys(REFERRER_TYPE_LABELS) as ReferrerType[]).map((r) => (
                          <option key={r} value={r}>
                            {REFERRER_TYPE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </Mini>
                  </div>
                  <Mini label="Referrer company (if any)">
                    <input
                      value={refCompany}
                      onChange={(e) => setRefCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    />
                  </Mini>
                </div>
              )}

              {(showSource('instagram-inbound') ||
                showSource('linkedin-inbound') ||
                showSource('x-inbound')) && (
                <div className="space-y-3 pt-1">
                  <Mini label="Trigger asset / post">
                    <select
                      value={socAssetId}
                      onChange={(e) => setSocAssetId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    >
                      <option value="">— pick or leave empty —</option>
                      {proofAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </Mini>
                  <div className="grid grid-cols-2 gap-3">
                    <Mini label="URL (optional)">
                      <input
                        value={socUrl}
                        onChange={(e) => setSocUrl(e.target.value)}
                        placeholder="Link to post"
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      />
                    </Mini>
                    <Mini label="Inbound type">
                      <select
                        value={socInboundType}
                        onChange={(e) => setSocInboundType(e.target.value as SocialInboundType)}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      >
                        {(Object.keys(SOCIAL_INBOUND_LABELS) as SocialInboundType[]).map((s) => (
                          <option key={s} value={s}>
                            {SOCIAL_INBOUND_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </Mini>
                  </div>
                </div>
              )}

              {showSource('website-inbound') && (
                <div className="space-y-3 pt-1">
                  <Mini label="How did they say they found the website?">
                    <input
                      value={webHowFound}
                      onChange={(e) => setWebHowFound(e.target.value)}
                      placeholder="Google, IG bio, referral…"
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    />
                  </Mini>
                  <Mini label="Page / project referenced">
                    <input
                      value={webPage}
                      onChange={(e) => setWebPage(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    />
                  </Mini>
                </div>
              )}

              {showSource('cold-outreach') && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-2 gap-3">
                    <Mini label="Channel">
                      <select
                        value={coldChannel}
                        onChange={(e) => setColdChannel(e.target.value as ColdOutreachChannel)}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      >
                        {(Object.keys(COLD_CHANNEL_LABELS) as ColdOutreachChannel[]).map((c) => (
                          <option key={c} value={c}>
                            {COLD_CHANNEL_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </Mini>
                    <Mini label="Campaign name">
                      <input
                        value={coldCampaign}
                        onChange={(e) => setColdCampaign(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                      />
                    </Mini>
                  </div>
                  <Mini label="Spec / sample sent">
                    <select
                      value={coldSpecId}
                      onChange={(e) => setColdSpecId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    >
                      <option value="">— none —</option>
                      {proofAssets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  </Mini>
                  <Mini label="Message angle">
                    <input
                      value={coldAngle}
                      onChange={(e) => setColdAngle(e.target.value)}
                      placeholder="Hook / opener used"
                      className="w-full px-3 py-2 rounded-lg border border-indigo-200 bg-white text-sm"
                    />
                  </Mini>
                </div>
              )}
            </div>
          )}

          {/* ── Contact ── */}
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Email">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
            <FieldGroup label={isCommercial ? 'Phone / WhatsApp' : 'Phone'}>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+…"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
              />
            </FieldGroup>
          </div>

          {isCommercial && (
            <div className="grid grid-cols-3 gap-2">
              <FieldGroup label="Instagram">
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@handle"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </FieldGroup>
              <FieldGroup label="LinkedIn">
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="profile"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </FieldGroup>
              <FieldGroup label="Website">
                <input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="domain.com"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </FieldGroup>
            </div>
          )}

          {/* ── Next action ── */}
          {mode === 'lead' && (
            <>
              <FieldGroup label="Next Action *">
                <select
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value as NextActionType)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                >
                  {(Object.keys(NEXT_ACTION_LABELS) as NextActionType[]).map((a) => (
                    <option key={a} value={a}>
                      {NEXT_ACTION_LABELS[a]}
                    </option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup label="What needs to happen?">
                <input
                  value={nextActionNote}
                  onChange={(e) => setNextActionNote(e.target.value)}
                  placeholder={
                    isCommercial
                      ? 'e.g. Send reel + book 30-min concept call'
                      : 'e.g. Send pricing options + book demo'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>

              <FieldGroup label="Due Date *">
                <input
                  type="date"
                  value={nextActionDueDate}
                  onChange={(e) => setNextActionDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-400 focus:outline-none"
                />
              </FieldGroup>
            </>
          )}

          <FieldGroup label="Notes">
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isCommercial
                  ? 'Anything worth remembering — what they responded to, who else is in the room…'
                  : 'Anything worth remembering…'
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none focus:border-blue-400 focus:outline-none"
            />
          </FieldGroup>
        </div>

        <footer className="px-6 py-4 border-t border-gray-100 flex gap-2 justify-end bg-gray-50/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save {mode === 'client' ? 'Client' : 'Lead'}
          </button>
        </footer>
      </aside>
    </>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-bold text-gray-600 uppercase">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
