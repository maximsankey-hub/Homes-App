import { useState } from 'react';
import type { PropertyDetail } from 'shared';
import { useUiStore } from '../../store/uiStore';
import { useCreateProperty, useUpdateProperty } from './useProperties';

export function AddPropertyModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const activeModal = useUiStore((s) => s.activeModal);
  const modalContext = useUiStore((s) => s.modalContext) as { property: PropertyDetail } | null;
  const isEdit = activeModal === 'editProperty';
  const existing = isEdit ? modalContext?.property : undefined;

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty(existing?.id ?? '');
  const saveProperty = isEdit ? updateProperty : createProperty;

  const [address, setAddress] = useState(existing?.address ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [state, setState] = useState(existing?.state ?? '');
  const [listingPrice, setListingPrice] = useState(existing ? String(existing.listingPrice) : '');
  const [sqft, setSqft] = useState(existing ? String(existing.sqft) : '');
  const [beds, setBeds] = useState(existing ? String(existing.beds) : '');
  const [baths, setBaths] = useState(existing ? String(existing.baths) : '');

  const canSubmit = address.trim().length > 0 && Number(listingPrice) > 0;

  const submit = () => {
    if (!canSubmit) return;
    saveProperty.mutate(
      {
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        listingPrice: Number(listingPrice),
        sqft: sqft ? Number(sqft) : undefined,
        beds: beds ? Number(beds) : undefined,
        baths: baths ? Number(baths) : undefined,
      },
      { onSuccess: () => closeModal() },
    );
  };

  return (
    <div className="mover open" onClick={closeModal}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? 'Edit property' : 'Add a property'}</h3>
        <input
          type="text"
          placeholder="Address, e.g. 123 Main Street"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} style={{ flex: 1 }} />
          <input type="text" placeholder="State" value={state} onChange={(e) => setState(e.target.value)} style={{ width: 70 }} />
        </div>
        <input
          type="text"
          placeholder="Listing price, e.g. 650000"
          value={listingPrice}
          onChange={(e) => setListingPrice(e.target.value.replace(/[^0-9]/g, ''))}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" placeholder="Sq ft" value={sqft} onChange={(e) => setSqft(e.target.value.replace(/[^0-9]/g, ''))} />
          <input type="text" placeholder="Beds" value={beds} onChange={(e) => setBeds(e.target.value.replace(/[^0-9]/g, ''))} />
          <input type="text" placeholder="Baths" value={baths} onChange={(e) => setBaths(e.target.value.replace(/[^0-9]/g, ''))} />
        </div>
        {saveProperty.isError && (
          <p style={{ fontSize: 12, color: 'var(--text-danger)', marginBottom: 8 }}>
            Couldn't {isEdit ? 'save' : 'add'} property. Try again.
          </p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btnp"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!canSubmit || saveProperty.isPending}
            onClick={submit}
          >
            {isEdit ? (saveProperty.isPending ? 'Saving…' : 'Save changes') : saveProperty.isPending ? 'Adding…' : 'Add home'}
          </button>
        </div>
      </div>
    </div>
  );
}
