type Props = {
  show: boolean;
};

const LoadingOverlay = ({ show }: Props) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white px-6 py-4 rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-black mx-auto" />
        <p className="mt-3 text-sm text-center">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
