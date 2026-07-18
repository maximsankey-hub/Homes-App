import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { PolaritySlider } from '../../components/common/PolaritySlider';
import { useAiMap, useProfile, useUpdateProfile, type UpdateProfileInput } from '../profile/useProfile';
import { PriorityGroupCard } from '../profile/PriorityGroupCard';
import { PRESET_TAGS, SWIPE_STYLES } from './onboardingData';
import { PRIORITY_GROUPS } from './priorityQuestions';

type Method = 'BOTH' | 'TAGS' | 'FREE_TEXT';

export function OnboardingWizard() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const aiMap = useAiMap();
  const updateProfile = useUpdateProfile();

  const [initialized, setInitialized] = useState(false);
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<Method>('BOTH');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(
    new Set(PRESET_TAGS.filter((t) => t.defaultOn).map((t) => t.label)),
  );
  const [extraText, setExtraText] = useState('');
  const [extraMapped, setExtraMapped] = useState<string[]>([]);
  const [describeText, setDescribeText] = useState('');
  const [describeMapped, setDescribeMapped] = useState<string[]>([]);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [likedStyle, setLikedStyle] = useState<string | null>(null);
  const [weightEmotional, setWeightEmotional] = useState(5);
  const [weightStorage, setWeightStorage] = useState(5);
  const [weightLight, setWeightLight] = useState(5);
  const [weightNeighborhood, setWeightNeighborhood] = useState(5);

  const [priorityStage, setPriorityStage] = useState<'intro' | number | null>(null);
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [introHasPets, setIntroHasPets] = useState(false);
  const [introBudgetVsDream, setIntroBudgetVsDream] = useState(5);
  const [introMoveInVsReno, setIntroMoveInVsReno] = useState(5);

  const activeGroups = useMemo(() => PRIORITY_GROUPS.filter((g) => g.key !== 'pets' || introHasPets), [introHasPets]);

  useEffect(() => {
    if (initialized || !profile) return;
    const hasSavedProfile = profile.tags.length > 0 || !!profile.freeText || !!profile.aestheticStyle;
    if (hasSavedProfile) {
      setMethod(profile.method);
      setSelectedTags(new Set(profile.tags.map((t) => t.label)));
      setDescribeText(profile.freeText ?? '');
      setLikedStyle(profile.aestheticStyle ?? null);
    }
    setWeightEmotional(profile.weightEmotional);
    setWeightStorage(profile.weightStorage);
    setWeightLight(profile.weightLight);
    setWeightNeighborhood(profile.weightNeighborhood);
    setIntroHasPets(profile.hasPets);
    setIntroBudgetVsDream(profile.priorityBudgetVsDream);
    setIntroMoveInVsReno(profile.priorityMoveInReadyVsReno);
    setInitialized(true);
  }, [profile, initialized]);

  if (profileLoading || !initialized) return <div className="pad">Loading…</div>;

  const toggleTag = (label: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const runAiMap = async (text: string, setMapped: (labels: string[]) => void) => {
    if (!text.trim()) return;
    const result = await aiMap.mutateAsync(text);
    setMapped(result.matched.map((m) => m.label));
  };

  const handleSwipe = (direction: 'l' | 'r') => {
    if (direction === 'r') setLikedStyle(SWIPE_STYLES[swipeIndex % SWIPE_STYLES.length].title);
    setSwipeIndex((i) => i + 1);
  };

  const saveBaseProfile = (extra: Partial<UpdateProfileInput>, onSuccess: () => void) => {
    const aiMappedLabels = [...new Set([...extraMapped, ...describeMapped])].filter((label) => !selectedTags.has(label));
    const allTags = [
      ...[...selectedTags].map((label) => ({ label, source: 'MANUAL' as const })),
      ...aiMappedLabels.map((label) => ({ label, source: 'AI_MAPPED' as const })),
    ];
    updateProfile.mutate(
      {
        method,
        freeText: describeText || undefined,
        aestheticStyle: likedStyle ?? undefined,
        tags: allTags,
        weightEmotional,
        weightStorage,
        weightLight,
        weightNeighborhood,
        ...extra,
      },
      { onSuccess },
    );
  };

  const finish = () => saveBaseProfile({}, () => navigate('/buy/homes'));

  const goDeeper = () => saveBaseProfile({}, () => setPriorityStage('intro'));

  const saveIntroAndContinue = () => {
    saveBaseProfile(
      { hasPets: introHasPets, priorityBudgetVsDream: introBudgetVsDream, priorityMoveInReadyVsReno: introMoveInVsReno },
      () => (activeGroups.length > 0 ? setPriorityStage(0) : navigate('/buy/homes')),
    );
  };

  const advanceGroup = () => {
    const nextIndex = typeof priorityStage === 'number' ? priorityStage + 1 : 0;
    if (nextIndex >= activeGroups.length) {
      navigate('/buy/homes');
    } else {
      setPriorityStage(nextIndex);
      setShowContinuePrompt(false);
    }
  };

  const front = SWIPE_STYLES[swipeIndex % SWIPE_STYLES.length];
  const behind = SWIPE_STYLES[(swipeIndex + 1) % SWIPE_STYLES.length];

  return (
    <div className="pad">
      {priorityStage === null && (
        <div className="obp">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`obd${i < step ? ' d' : i === step ? ' c' : ''}`} />
          ))}
        </div>
      )}

      {step === 0 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.4, marginBottom: 5 }}>How do you want to build your profile?</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>Tags, your own words, or both.</div>
          {(
            [
              { key: 'BOTH' as Method, icon: 'ti-sparkles', title: 'Both — recommended', sub: 'Tags plus your own words.' },
              { key: 'TAGS' as Method, icon: 'ti-tags', title: 'Pick from common preferences', sub: '' },
              { key: 'FREE_TEXT' as Method, icon: 'ti-writing', title: 'Describe in your own words', sub: 'AI maps it to your profile.' },
            ]
          ).map((opt) => (
            <div key={opt.key} className={`mco${method === opt.key ? ' sel' : ''}`} onClick={() => setMethod(opt.key)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    background: method === opt.key ? 'var(--fill-accent)' : 'var(--surface-0)',
                    border: method === opt.key ? 'none' : '0.5px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name={opt.icon} size={14} color={method === opt.key ? '#fff' : 'var(--text-secondary)'} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: method === opt.key ? 'var(--text-accent)' : undefined }}>{opt.title}</div>
                  {opt.sub && (
                    <div style={{ fontSize: 11, color: method === opt.key ? 'var(--text-accent)' : 'var(--text-secondary)', opacity: method === opt.key ? 0.8 : 1, marginTop: 2 }}>
                      {opt.sub}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button className="btn btnp btnf" style={{ marginTop: 6 }} onClick={() => setStep(1)}>
            Continue <Icon name="ti-arrow-right" size={14} />
          </button>
        </div>
      )}

      {step === 1 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>What matters most to you?</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>Select anything that resonates.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
            {PRESET_TAGS.map((tag) => (
              <button key={tag.label} className={`tag${selectedTags.has(tag.label) ? ' sb' : ''}`} onClick={() => toggleTag(tag.label)}>
                {tag.label}
              </button>
            ))}
          </div>
          {(method === 'BOTH' || method === 'FREE_TEXT') && (
            <div>
              <div className="div" />
              <p style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>Anything not in the list?</p>
              <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Describe it — AI will map it to your profile.</p>
              <textarea
                className="ft2"
                style={{ minHeight: 65 }}
                placeholder="e.g. I need an art studio, two large dogs so yard matters a lot..."
                value={extraText}
                onChange={(e) => setExtraText(e.target.value)}
              />
              <button className="btn btns" style={{ marginTop: 5 }} disabled={aiMap.isPending} onClick={() => runAiMap(extraText, setExtraMapped)}>
                <Icon name="ti-sparkles" size={13} /> {aiMap.isPending ? 'Mapping…' : 'Map with AI'}
              </button>
              {extraMapped.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div className="slbl">Matched to your profile</div>
                  {extraMapped.map((label) => (
                    <span key={label} className="tag mp" style={{ cursor: 'default', fontSize: 11, marginRight: 5 }}>
                      {label} <Icon name="ti-check" size={9} />
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn btns" onClick={() => setStep(0)}>
              <Icon name="ti-arrow-left" size={13} />
            </button>
            <button className="btn btnp btnf" onClick={() => setStep(2)}>
              Continue <Icon name="ti-arrow-right" size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>Tell us in your own words</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
            What does your ideal home feel like? What's non-negotiable?
          </div>
          <textarea
            className="ft2"
            style={{ minHeight: 100 }}
            placeholder="e.g. I work from home so I need a real office. I love to cook and entertain so a big open kitchen is huge..."
            value={describeText}
            onChange={(e) => setDescribeText(e.target.value)}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI maps your words to traits</span>
            <button className="btn btns btnp" disabled={aiMap.isPending} onClick={() => runAiMap(describeText, setDescribeMapped)}>
              <Icon name="ti-sparkles" size={13} /> {aiMap.isPending ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>
          {describeMapped.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div className="slbl">Matched to your profile</div>
              {describeMapped.map((label) => (
                <span key={label} className="tag mp" style={{ cursor: 'default', fontSize: 11, marginRight: 5 }}>
                  {label} <Icon name="ti-check" size={9} />
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button className="btn btns" onClick={() => setStep(1)}>
              <Icon name="ti-arrow-left" size={13} />
            </button>
            <button className="btn btnp btnf" onClick={() => setStep(3)}>
              Continue <Icon name="ti-arrow-right" size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>Which kitchen feels like you?</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Swipe right to like, left to pass.</div>
          <div className="sw-stack">
            <div className="sw-c behind">
              <div className="sw-img" style={{ background: behind.bg }}>
                {behind.emoji}
              </div>
              <div className="sw-lbl">
                <p>{behind.title}</p>
                <span>{behind.subtitle}</span>
              </div>
            </div>
            <div className="sw-c front">
              <div className="sw-img" style={{ background: front.bg }}>
                {front.emoji}
              </div>
              <div className="sw-lbl">
                <p>{front.title}</p>
                <span>{front.subtitle}</span>
              </div>
            </div>
          </div>
          <div className="sw-btns">
            <button className="sw-btn sno" onClick={() => handleSwipe('l')}>
              <Icon name="ti-x" size={18} />
            </button>
            <button className="sw-btn sye" onClick={() => handleSwipe('r')}>
              <Icon name="ti-heart" size={18} />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>
            {Math.min(swipeIndex + 1, 4)} of 4
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btns" onClick={() => setStep(2)}>
              <Icon name="ti-arrow-left" size={13} />
            </button>
            <button className="btn btnp btnf" onClick={() => setStep(4)}>
              Continue <Icon name="ti-arrow-right" size={14} />
            </button>
          </div>
        </div>
      )}

      {step === 4 && priorityStage === null && (
        <div style={{ textAlign: 'center', padding: '14px 0' }}>
          <Icon name="ti-check" size={40} color="#1D9E75" />
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 8, marginBottom: 6 }}>Profile ready</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            Scores and visit prompts are now tailored to you.
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
            {[...selectedTags].slice(0, 3).map((label) => (
              <span className="badge bb" key={label}>
                {label}
              </span>
            ))}
            {likedStyle && <span className="badge bg">{likedStyle}</span>}
          </div>
          <div className="card" style={{ textAlign: 'left', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Score weighting</p>
            {(
              [
                { label: 'Emotional fit', value: weightEmotional, setter: setWeightEmotional },
                { label: 'Storage', value: weightStorage, setter: setWeightStorage },
                { label: 'Natural light', value: weightLight, setter: setWeightLight },
                { label: 'Neighborhood appeal', value: weightNeighborhood, setter: setWeightNeighborhood },
              ]
            ).map(({ label, value, setter }) => (
              <div className="fr" key={label}>
                <span className="frl">{label}</span>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={value}
                  style={{ flex: 1 }}
                  onChange={(e) => setter(Number(e.target.value))}
                />
                <span className="frv">{value}</span>
              </div>
            ))}
          </div>
          <button className="btn btnp btnf" style={{ marginBottom: 8 }} disabled={updateProfile.isPending} onClick={finish}>
            {updateProfile.isPending ? 'Saving…' : 'Start exploring homes'}
          </button>
          <button className="btn btns btnf" disabled={updateProfile.isPending} onClick={goDeeper}>
            <Icon name="ti-sparkles" size={13} /> Go deeper on priorities
          </button>
        </div>
      )}

      {step === 4 && priorityStage === 'intro' && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 5 }}>About your search</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14 }}>
            A few quick ones before we get into specifics.
          </div>
          <div className="card" style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Do you have a pet whose needs matter in this search?</p>
            <div style={{ display: 'flex', gap: 5 }}>
              <button className={`tag${introHasPets ? ' sb' : ''}`} onClick={() => setIntroHasPets(true)}>
                Yes
              </button>
              <button className={`tag${!introHasPets ? ' sb' : ''}`} onClick={() => setIntroHasPets(false)}>
                No
              </button>
            </div>
          </div>
          <div className="card" style={{ marginBottom: 12 }}>
            <PolaritySlider
              leftLabel="Financial flexibility"
              rightLabel="Dream house"
              value={introBudgetVsDream}
              onChange={setIntroBudgetVsDream}
            />
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <PolaritySlider
              leftLabel="Move-in ready"
              rightLabel="Open to renovations"
              value={introMoveInVsReno}
              onChange={setIntroMoveInVsReno}
            />
          </div>
          <button className="btn btnp btnf" disabled={updateProfile.isPending} onClick={saveIntroAndContinue}>
            Continue <Icon name="ti-arrow-right" size={14} />
          </button>
        </div>
      )}

      {step === 4 && typeof priorityStage === 'number' && !showContinuePrompt && (
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>
            Topic {priorityStage + 1} of {activeGroups.length}
          </div>
          <PriorityGroupCard group={activeGroups[priorityStage]} />
          <button className="btn btnp btnf" onClick={() => setShowContinuePrompt(true)}>
            Continue <Icon name="ti-arrow-right" size={14} />
          </button>
        </div>
      )}

      {step === 4 && typeof priorityStage === 'number' && showContinuePrompt && (
        <div style={{ textAlign: 'center', padding: '14px 0' }}>
          <Icon name="ti-sparkles" size={32} color="var(--text-accent)" />
          <div style={{ fontSize: 15, fontWeight: 500, marginTop: 10, marginBottom: 6 }}>Want to keep going?</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>
            You can always finish the rest later from your profile.
          </div>
          <button className="btn btnp btnf" style={{ marginBottom: 8 }} onClick={advanceGroup}>
            Keep going
          </button>
          <button className="btn btns btnf" onClick={() => navigate('/buy/homes')}>
            I'll finish later
          </button>
        </div>
      )}
    </div>
  );
}
