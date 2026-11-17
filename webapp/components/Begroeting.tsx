
'use client';

import { useEffect, useState } from 'react';

export function Begroeting() {
  const [greeting, setGreeting] = useState('Goedemorgen');

  useEffect(() => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting('Goedemorgen');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Goedemiddag');
    } else if (hour >= 18 && hour < 23) {
      setGreeting('Goedenavond');
    } else {
      setGreeting('Goedenacht');
    }
  }, []);

  return <>{greeting}</>;
}
