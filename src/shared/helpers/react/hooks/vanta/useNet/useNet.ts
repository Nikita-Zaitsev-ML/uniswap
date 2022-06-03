import { useState, useEffect, useRef, CSSProperties } from 'react';
import Net from 'vanta/dist/vanta.net.min';

type Options = {
  mouseControls?: boolean;
  touchControls?: boolean;
  gyroControls?: boolean;
  minHeight?: number;
  minWidth?: number;
  scale?: number;
  scaleMobile?: number;
  color?: CSSProperties['color'];
  backgroundColor?: CSSProperties['color'];
  points?: number;
  maxDistance?: number;
  spacing?: number;
  showDots?: boolean;
};

// Tip: THREE should be defined on window, see https://github.com/tengbao/vanta#usage-with-react-hooks-requires-react-168

const useNet = (options: Options = {}) => {
  const [vantaEffect, setVantaEffect] = useState<any>(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        Net({
          el: ref.current,
          ...options,
        })
      );
    }

    return () => {
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return ref;
};

export type { Options };

export { useNet };
