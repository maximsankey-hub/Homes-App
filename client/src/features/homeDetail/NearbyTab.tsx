import { useParams } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { useProperty } from '../homes/useProperties';
import { useNearbyPlaces } from './useNearbyPlaces';

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'grocery', label: 'Grocery' },
  { key: 'parks', label: 'Parks' },
  { key: 'schools', label: 'Schools' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'gyms', label: 'Gyms' },
];

export function NearbyTab() {
  const { propertyId } = useParams();
  const { data: property } = useProperty(propertyId);
  const { nearbySearch, nearbyCategory, setNearbySearch, setNearbyCategory } = useUiStore();
  const { data: places, isLoading } = useNearbyPlaces(propertyId, nearbyCategory, nearbySearch);

  if (!property) return <div>Loading…</div>;

  return (
    <div>
      <div className="mph">
        <div style={{ position: 'absolute', top: '35%', left: '43%' }}>
          <Icon name="ti-map-pin" size={24} color="#E24B4A" />
        </div>
      </div>
      <div className="ns">
        <input
          type="text"
          placeholder="Search nearby — coffee, parks, schools..."
          value={nearbySearch}
          onChange={(e) => setNearbySearch(e.target.value)}
        />
        <button onClick={() => setNearbySearch(nearbySearch)}>
          <Icon name="ti-search" size={15} />
        </button>
      </div>
      <div className="schips">
        {CATEGORIES.map((c) => (
          <button key={c.key} className={`sch${nearbyCategory === c.key ? ' on' : ''}`} onClick={() => setNearbyCategory(c.key)}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="sres">
        {isLoading ? (
          <div style={{ padding: 12 }}>Loading…</div>
        ) : places && places.length > 0 ? (
          places.map((p) => (
            <div className="srow" key={p.id}>
              <div className="gi" style={{ background: p.iconBg }}>
                <Icon name={p.icon} size={16} color={p.iconColor} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{p.distanceText}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1D9E75' }}>{p.score}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.category.toLowerCase()}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: 12, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No results.</div>
        )}
      </div>

      <div className="slbl" style={{ marginTop: 4 }}>
        Walkability
      </div>
      <div className="card" style={{ padding: '10px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, textAlign: 'center' }}>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px' }}>
            <div style={{ fontSize: 19, fontWeight: 500, color: '#1D9E75' }}>{property.walkScore ?? '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Walk</div>
          </div>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px' }}>
            <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-accent)' }}>{property.transitScore ?? '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Transit</div>
          </div>
          <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '8px 4px' }}>
            <div style={{ fontSize: 19, fontWeight: 500, color: 'var(--text-warning)' }}>{property.bikeScore ?? '—'}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Bike</div>
          </div>
        </div>
      </div>

      <div className="slbl">Neighborhood character</div>
      <div className="card" style={{ padding: '10px 12px' }}>
        {property.neighborhoodCharacter.map((n) => (
          <div className="fb" key={n.label}>
            <span className="fl">{n.label}</span>
            <div className="ft">
              <div className="ff" style={{ width: `${n.value}%`, background: n.color }} />
            </div>
            <span className="fv" style={{ color: n.textColor }}>
              {(n.value / 10).toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
