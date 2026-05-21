import React from 'react';

interface Props {
  chambers: any[];
  selectedIndex: number;
  onSelectChamber: (index: number) => void;
}

export default function ChamberTransitionGraph({ chambers, selectedIndex, onSelectChamber }: Props) {
  return (
    <div className="chamber-transition-graph">
      <div className="chamber-nodes">
        {chambers.map((chamber, index) => (
          <div key={index} className={`chamber-node ${selectedIndex === index ? 'selected' : ''}`}>
            <button onClick={() => onSelectChamber(index)} className="chamber-button">
              <span className="chamber-name">{chamber.name}</span>
              <span className="chamber-coherence">{(chamber.metrics?.coherence_score * 100).toFixed(0)}%</span>
            </button>
            {index < chambers.length - 1 && <div className="transition-line" />}
          </div>
        ))}
      </div>
    </div>
  );
}
