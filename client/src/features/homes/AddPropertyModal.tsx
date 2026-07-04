import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useCreateProperty } from './useProperties';

export function AddPropertyModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const createProperty = useCreateProperty();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [sqft, setSqft] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');

  const canSubmit = address.trim().length > 0 && Number(listingPrice) > 0;

  const submit = () => {
    if (!canSubmit) return;
    createProperty.mutate(
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
        <h3>Add a property</h3>
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
        {createProperty.isError && (
          <p style={{ fontSize: 12, color: 'var(--text-danger)', marginBottom: 8 }}>Couldn't add property. Try again.</p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={closeModal}>
            Cancel
          </button>
          <button
            className="btn btnp"
            style={{ flex: 1, justifyContent: 'center' }}
            disabled={!canSubmit || createProperty.isPending}
            onClick={submit}
          >
            {createProperty.isPending ? 'Adding…' : 'Add home'}
          </button>
        </div>
      </div>
    </div>
  );
}
