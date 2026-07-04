import { useNavigate } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useProfile, useUpdateProfile } from './useProfile';

export function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const navigate = useNavigate();

  if (isLoading || !profile) return <div className="pad">Loading…</div>;

  return (
    <div className="pad">
      <div className="slbl">Active profile</div>
      <div className="card">
        <div style={{ lineHeight: 2.2 }}>
          {profile.tags.length === 0 ? (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No preferences set yet.</span>
          ) : (
            profile.tags.map((tag) => (
              <span className={`ppill ${tag.source === 'AI_MAPPED' ? 'ppm' : 'ppe'}`} key={tag.id}>
                {tag.source === 'AI_MAPPED' && <Icon name="ti-writing" size={10} />}
                {tag.label}
              </span>
            ))
          )}
        </div>
      </div>

      {profile.patterns.length > 0 && (
        <>
          <div className="slbl">Patterns noticed</div>
          {profile.patterns.map((pattern) => (
            <div className="ppc" key={pattern.title}>
              <div className="pper">
                <div className="ppic" style={{ background: pattern.iconBg }}>
                  <Icon name={pattern.icon} size={18} color={pattern.iconColor} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{pattern.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>{pattern.subtitle}</div>
                </div>
              </div>
              {pattern.barValues && pattern.barLabels && (
                <>
                  <div className="sb-bar">
                    {pattern.barValues.map((v, i) => (
                      <div key={i} style={{ height: `${(v / 10) * 100}%` }} className={v >= 7 ? 'hi' : ''} />
                    ))}
                  </div>
                  <div className="tr">
                    {pattern.barLabels.map((l) => (
                      <span key={l}>{l}</span>
                    ))}
                  </div>
                </>
              )}
              {pattern.chip && (
                <div className="chip" style={{ marginTop: 4 }}>
                  <Icon name={pattern.chip.icon} size={15} color={pattern.chip.color} />
                  <span>{pattern.chip.text}</span>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div className="div" />

      <div className="card">
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Score weighting</p>
        {(
          [
            { key: 'weightEmotional' as const, label: 'Emotional fit' },
            { key: 'weightStorage' as const, label: 'Storage' },
            { key: 'weightLight' as const, label: 'Natural light' },
          ]
        ).map(({ key, label }) => (
          <div className="fr" key={key}>
            <span className="frl">{label}</span>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={profile[key]}
              style={{ flex: 1 }}
              onChange={(e) => updateProfile.mutate({ [key]: Number(e.target.value) })}
            />
            <span className="frv">{profile[key]}</span>
          </div>
        ))}
      </div>
      <button className="btn btnp btnf" style={{ marginBottom: 8 }} onClick={() => navigate('/buy/onboarding')}>
        <Icon name="ti-refresh" size={15} /> Update profile
      </button>
    </div>
  );
}
