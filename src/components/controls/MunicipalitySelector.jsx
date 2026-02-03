export function MunicipalitySelector({ value, onChange, municipalities }) {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Municipality / Sélectionner commune / Selecteer gemeente
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">-- Select a municipality --</option>
        {municipalities.map(m => (
          <option key={m.id} value={m.id}>
            {m.name_fr} / {m.name_nl}
          </option>
        ))}
      </select>
    </div>
  );
}
