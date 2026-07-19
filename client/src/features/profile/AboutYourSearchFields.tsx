import { HOUSEHOLD_COMPOSITION_OPTIONS, PET_TYPE_OPTIONS } from '../onboarding/priorityQuestions';

interface AboutYourSearchFieldsProps {
  hasPets: boolean;
  onHasPetsChange: (value: boolean) => void;
  petTypes: string[];
  onPetTypesChange: (value: string[]) => void;
  petTypeOther: string;
  onPetTypeOtherChange: (value: string) => void;
  householdComposition: string | null;
  onHouseholdCompositionChange: (value: string) => void;
  householdCompositionOther: string;
  onHouseholdCompositionOtherChange: (value: string) => void;
}

export function AboutYourSearchFields({
  hasPets,
  onHasPetsChange,
  petTypes,
  onPetTypesChange,
  petTypeOther,
  onPetTypeOtherChange,
  householdComposition,
  onHouseholdCompositionChange,
  householdCompositionOther,
  onHouseholdCompositionOtherChange,
}: AboutYourSearchFieldsProps) {
  const togglePetType = (type: string) => {
    onPetTypesChange(petTypes.includes(type) ? petTypes.filter((t) => t !== type) : [...petTypes, type]);
  };

  return (
    <>
      <div className="card" style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Do you have a pet whose needs matter in this search?</p>
        <div style={{ display: 'flex', gap: 5, marginBottom: hasPets ? 12 : 0 }}>
          <button className={`tag${hasPets ? ' sb' : ''}`} onClick={() => onHasPetsChange(true)}>
            Yes
          </button>
          <button className={`tag${!hasPets ? ' sb' : ''}`} onClick={() => onHasPetsChange(false)}>
            No
          </button>
        </div>
        {hasPets && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
              {PET_TYPE_OPTIONS.map((type) => (
                <button key={type} className={`tag${petTypes.includes(type) ? ' sb' : ''}`} onClick={() => togglePetType(type)}>
                  {type}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Other pet (optional)"
              value={petTypeOther}
              onChange={(e) => onPetTypeOtherChange(e.target.value)}
            />
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Who are you searching for?</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: householdComposition === 'Other' ? 8 : 0 }}>
          {HOUSEHOLD_COMPOSITION_OPTIONS.map((option) => (
            <button
              key={option}
              className={`tag${householdComposition === option ? ' sb' : ''}`}
              onClick={() => onHouseholdCompositionChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {householdComposition === 'Other' && (
          <input
            type="text"
            placeholder="Tell us more"
            value={householdCompositionOther}
            onChange={(e) => onHouseholdCompositionOtherChange(e.target.value)}
          />
        )}
      </div>
    </>
  );
}
