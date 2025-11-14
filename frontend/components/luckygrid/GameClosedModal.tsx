interface GameClosedModalProps {
  onClose: () => void;
}

export default function GameClosedModal({ onClose }: GameClosedModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Game Closed</h2>
        <p className="text-white mb-3">
          All numbers for this game have been picked.
        </p>
        <p className="text-white font-semibold">
          Please wait for the lucky number reveal.
        </p>

        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
