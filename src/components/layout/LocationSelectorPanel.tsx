import React from 'react';
import { OLXLocationPickerModal } from './OLXLocationPickerModal';
import { useLocationStore } from '../../context/LocationContext';

interface LocationSelectorPanelProps {
  onClose: () => void;
}

export const LocationSelectorPanel: React.FC<LocationSelectorPanelProps> = ({ onClose }) => {
  const { isLocationPickerOpen } = useLocationStore();
  return <OLXLocationPickerModal isOpen={isLocationPickerOpen} onClose={onClose} />;
};

