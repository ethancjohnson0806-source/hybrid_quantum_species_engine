import React, { useState } from 'react';

export default function CorrectionFilterBar() {
  const [filterChamber, setFilterChamber] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  return (
    <div className="correction-filter-bar">
      <div className="filter-group">
        <label>Filter by Chamber:</label>
        <select value={filterChamber} onChange={(e) => setFilterChamber(e.target.value)}>
          <option value="">All Chambers</option>
          <option value="Surface">Surface</option>
          <option value="Descent">Descent</option>
          <option value="Compression">Compression</option>
          <option value="Expansion">Expansion</option>
          <option value="Return">Return</option>
        </select>
      </div>
      <div className="filter-group">
        <label>Filter by Severity:</label>
        <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          <option value="minor">Minor</option>
          <option value="moderate">Moderate</option>
          <option value="major">Major</option>
        </select>
      </div>
    </div>
  );
}
