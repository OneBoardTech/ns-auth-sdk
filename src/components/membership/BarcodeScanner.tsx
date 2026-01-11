import { useState } from 'react';
import { useZxing } from 'react-zxing';

interface BarcodeScannerProps {
  /** Called when a code is successfully read */
  onDecode: (value: string) => void;
  /** Optional flag to hide the scanner */
  active?: boolean;
}

export const BarcodeScanner = ({ onDecode, active = true }: BarcodeScannerProps) => {
  const [error, setError] = useState<string | null>(null);
  const { ref } = useZxing({
    onDecodeResult: (result) => {
      onDecode(result.getText());
    },
    onError: (e: unknown) => {
      const errorMessage = e instanceof Error ? e.message : 'Camera error';
      setError(errorMessage);
    },
  });

  if (!active) return null;

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <video
        ref={ref as React.LegacyRef<HTMLVideoElement>}
        style={{ width: '100%', borderRadius: '8px' }}
        playsInline
        muted
      />
      {error && (
        <p style={{ color: 'red', marginTop: '0.5rem' }}>
          {error}
        </p>
      )}
    </div>
  );
};

