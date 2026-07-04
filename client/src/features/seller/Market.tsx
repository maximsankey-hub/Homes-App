import { Icon } from '../../components/common/Icon';
import { useListingMarket } from './useListing';

const DIFF_STYLE: Record<string, { icon: string; className: string }> = {
  ABOVE: { icon: 'ti-arrow-up', className: 'cab' },
  BELOW: { icon: 'ti-arrow-down', className: 'cbl2' },
  WITHIN: { icon: 'ti-minus', className: 'cma' },
};

export function Market() {
  const { data, isLoading } = useListingMarket();

  if (isLoading || !data) return <div className="pad">Loading…</div>;

  const avgCompPrice = data.comps.length > 0 ? data.comps.reduce((s, c) => s + c.price, 0) / data.comps.length : 0;
  const vsAvg = data.listing.listPrice - avgCompPrice;

  return (
    <div className="pad">
      <div className="card" style={{ background: '#E1F5EE', borderColor: '#9FE1CB' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#085041' }}>Your home</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: '#085041', marginTop: 2 }}>${data.listing.listPrice.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: '#0F6E56', marginTop: 2 }}>
              ${data.listing.pricePerSqft}/sqft · {data.listing.sqft.toLocaleString()} sqft · {data.listing.beds}bd/{data.listing.baths}ba
            </div>
          </div>
          {data.comps.length > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#0F6E56' }}>vs avg comp</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#085041', marginTop: 2 }}>
                {vsAvg >= 0 ? '+' : '-'}${Math.abs(Math.round(vsAvg / 1000))}K
              </div>
              <div style={{ fontSize: 10, color: '#0F6E56' }}>{vsAvg >= 0 ? 'above market' : 'below market'}</div>
            </div>
          )}
        </div>
      </div>

      <div className="slbl">Recent comparable sales</div>
      {data.comps.map((comp) => {
        const style = DIFF_STYLE[comp.diffType];
        return (
          <div className="ccard" key={comp.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{comp.address}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
                  {comp.sqft.toLocaleString()} sqft · {new Date(comp.saleDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                </div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1D9E75', whiteSpace: 'nowrap' }}>${comp.price.toLocaleString()}</div>
            </div>
            <div>
              <span className={`cdiff ${style.className}`}>
                <Icon name={style.icon} size={10} /> You're ${Math.abs(comp.diffAmount / 1000).toFixed(0)}K {comp.diffType === 'ABOVE' ? 'above' : comp.diffType === 'BELOW' ? 'below' : 'within'}
              </span>
            </div>
            {comp.note && (
              <div className="chip" style={{ marginTop: 7, marginBottom: 0 }}>
                <Icon name="ti-info-circle" size={14} color="var(--text-muted)" />
                <span>{comp.note}</span>
              </div>
            )}
          </div>
        );
      })}

      <div className="div" />
      <div className="slbl">Tradeoff breakdown</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {data.tradeoffs.map((t) => (
          <div className="fb" key={t.label}>
            <span className="fl">{t.label}</span>
            <div className="ft">
              <div
                className="ff"
                style={{ width: `${t.value * 10}%`, background: t.value >= 7 ? '#1D9E75' : t.value >= 5 ? '#EF9F27' : '#E24B4A' }}
              />
            </div>
            <span className="fv" style={{ color: t.value >= 7 ? '#085041' : t.value >= 5 ? '#633806' : '#A32D2D' }}>
              {t.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
      {data.warningChip && (
        <div className="chip">
          <Icon name="ti-alert-triangle" size={15} color="var(--text-warning)" />
          <span>{data.warningChip}</span>
        </div>
      )}
    </div>
  );
}
