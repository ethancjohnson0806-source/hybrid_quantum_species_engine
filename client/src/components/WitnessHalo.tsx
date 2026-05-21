import React from 'react';

interface Props {
  witnessState: any;
}

export default function WitnessHalo({ witnessState }: Props) {
  return (
    <div className="witness-halo">
      <div className="halo-center">
        <div className="halo-ring" />
        <div className="halo-core">👁</div>
      </div>
      <p className="halo-label">The Witness Observes</p>
    </div>
  );
}
