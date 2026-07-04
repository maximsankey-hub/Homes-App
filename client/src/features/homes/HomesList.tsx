import { Icon } from '../../components/common/Icon';
import { useUiStore } from '../../store/uiStore';
import { HomeCard } from './HomeCard';
import { useProperties } from './useProperties';

export function HomesList() {
  const { data, isLoading, error } = useProperties();
  const openModal = useUiStore((s) => s.openModal);

  if (isLoading) {
    return <div className="pad">Loading…</div>;
  }
  if (error) {
    return <div className="pad">Couldn't load properties.</div>;
  }

  return (
    <div className="pad">
      {data?.map((property) => (
        <HomeCard key={property.id} property={property} />
      ))}
      <button className="addbtn" onClick={() => openModal('addProperty')}>
        <Icon name="ti-plus" size={16} />
        Add a property
      </button>
    </div>
  );
}
