import { useState } from 'react';
import type { PropertyDetail } from 'shared';
import { useUiStore } from '../../store/uiStore';
import { Icon } from '../../components/common/Icon';
import { useCreateProperty, useLookupPropertyDetails, useUpdateProperty } from './useProperties';

export function AddPropertyModal() {
  const closeModal = useUiStore((s) => s.closeModal);
  const activeModal = useUiStore((s) => s.activeModal);
  const modalContext = useUiStore((s) => s.modalContext) as { property: PropertyDetail } | null;
  const isEdit = activeModal === 'editProperty';
  const existing = isEdit ? modalContext?.property : undefined;

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty(existing?.id ?? '');
  const saveProperty = isEdit ? updateProperty : createProperty;
  const lookup = useLookupPropertyDetails();

  const [address, setAddress] = useState(existing?.address ?? '');
  const [city, setCity] = useState(existing?.city ?? '');
  const [state, setState] = useState(existing?.state ?? '');
  const [listingPrice, setListingPrice] = useState(existing ? String(existing.listingPrice) : '');
  const [sqft, setSqft] = useState(existing ? String(existing.sqft) : '');
  const [beds, setBeds] = useState(existing ? String(existing.beds) : '');
  const [baths, setBaths] = useState(existing ? String(existing.baths) : '');
  const [yearBuilt, setYearBuilt] = useState(existing?.yearBuilt ? String(existing.yearBuilt) : '');
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);

  const canSubmit = address.trim().length > 0 && Number(listingPrice) > 0;

  const handleAutoFill = async () => {
    setLookupMessage(null);
    const fullAddress = [address, city, state].filter(Boolean).join(', ');
    const result = await lookup.mutateAsync(fullAddress);
    if (!result) {
      setLookupMessage("Couldn't find details for that address — check it and try again, or enter manually.");
      return;
    }
    if (result.sqft) setSqft(String(result.sqft));
    if (result.beds) setBeds(String(result.beds));
    if (result.baths) setBaths(String(result.baths));
    if (result.yearBuilt) setYearBuilt(String(result.yearBuilt));
    setLookupMessage(
      result.estValue
        ? `Filled in what we found. Estimated value: $${result.estValue.toLocaleString()} (list price is still yours to enter).`
        : 'Filled in what we found.',
    );
  };

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
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
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
        <button
          className="btn btns"
          style={{ marginBottom: 8 }}
          disabled={!address.trim() || lookup.isPending}
          onClick={handleAutoFill}
        >
          <Icon name="ti-sparkles" size={13} /> {lookup.isPending ? 'Looking up…' : 'Auto-fill from address'}
        </button>
        {lookupMessage && (
          <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>{lookupMessage}</p>
        )}
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
        <input
          type="text"
          placeholder="Year built"
          value={yearBuilt}
          onChange={(e) => setYearBuilt(e.target.value.replace(/[^0-9]/g, ''))}
        />
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
