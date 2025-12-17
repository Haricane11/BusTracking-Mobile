'use client';

import { ContextProvider } from './UseContext';

export default function ContextWrapper({ children, busStops, busLines }) {
  return (
    <ContextProvider busStopsContext={busStops} busLinesContext={busLines}>
      {children}
    </ContextProvider>
  );
}