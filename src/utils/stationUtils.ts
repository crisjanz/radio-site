import type { Station } from '../types/Station';

export type TransmissionType = 'am' | 'fm' | 'net' | 'unknown';

export const getTransmissionType = (station: Station): TransmissionType => {
  if (!station.frequency || station.frequency.trim() === '') {
    return 'unknown';
  }
  
  const freq = station.frequency.toLowerCase().trim();
  
  // Check for NET (online) stations
  if (freq.includes('net')) {
    return 'net';
  }
  
  // Check for FM stations (frequency with decimal or "fm")
  if (freq.includes('fm') || /\d+\.\d+/.test(freq)) {
    return 'fm';
  }
  
  // Check for AM stations
  if (freq.includes('am') || /^\d{3,4}(?:\s*am)?$/i.test(freq)) {
    return 'am';
  }
  
  return 'unknown';
};

export const getTransmissionTypeLabel = (type: TransmissionType): string => {
  switch (type) {
    case 'am':
      return 'AM';
    case 'fm':
      return 'FM';
    case 'net':
      return 'Online';
    case 'unknown':
    default:
      return 'Unknown';
  }
};

export const getTransmissionTypeIcon = (type: TransmissionType): string => {
  switch (type) {
    case 'am':
      return '📻';
    case 'fm':
      return '📡';
    case 'net':
      return '🌐';
    case 'unknown':
    default:
      return '';
  }
};