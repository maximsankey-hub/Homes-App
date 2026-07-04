import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../../components/common/Icon';
import { useProperty } from '../homes/useProperties';

const SUB_TABS = [
  { path: '', label: 'Overview' },
  { path: 'visit', label: 'Visit' },
  { path: 'partner', label: 'Partner' },
  { path: 'reno', label: 'Reno' },
  { path: 'nearby', label: 'Nearby' },
];

export function HomeDetailLayout() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { data: property } = useProperty(propertyId);

  return (
    <div>
      <div style={{ padding: '12px 16px 0', background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)' }}>
        <button className="bk" onClick={() => navigate('/buy/homes')}>
          <Icon name="ti-arrow-left" size={15} /> All homes
        </button>
        <div style={{ fontSize: 17, fontWeight: 500 }}>{property?.address ?? ' '}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, paddingBottom: 10 }}>
          {property ? `${property.city}, ${property.state} · $${property.listingPrice.toLocaleString()}` : ' '}
        </div>
      </div>
      <div className="dtb">
        {SUB_TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/buy/homes/${propertyId}${tab.path ? `/${tab.path}` : ''}`}
            end={tab.path === ''}
            className={({ isActive }) => `dt${isActive ? ' ba' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>
      <div className="tc active">
        <Outlet context={{ property }} />
      </div>
    </div>
  );
}
