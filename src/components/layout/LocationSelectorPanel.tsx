import React, { lazy, Suspense } from 'react';
import { useLocationStore } from '../../context/LocationContext';

const OLXLocationPickerModal = lazy(() =>
  import('./OLXLocationPickerModal').then((m) => ({ default: m.OLXLocationPickerModal }))
);

interface LocationSelectorPanelProps {
  onClose: () => void;
}

export const LocationSelectorPanel: React.FC<LocationSelectorPanelProps> = ({ onClose }) => {
  const { isLocationPickerOpen } = useLocationStore();

  if (!isLocationPickerOpen) return null;

  return (
    <Suspense fallback={null}>
      <OLXLocationPickerModal isOpen={isLocationPickerOpen} onClose={onClose} />
    </Suspense>
  );
};
