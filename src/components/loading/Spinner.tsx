// src/components/loading/Spinner.tsx
export default function Spinner() {
  return (
    <div
      style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #0070f3',
        borderRadius: '50%',
        width: '30px',
        height: '30px',
        animation: 'spin 1s linear infinite',
      }}
    >
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
