interface EnablePinModalProps {
  open: boolean;
  onAccept: () => void;
  onLater: () => void;
}

export default function EnablePinModal({ open, onAccept, onLater }: EnablePinModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-6 rounded-xl w-80 text-center">
        <h2 className="text-lg font-semibold mb-3">Protect Your Reborro</h2>
        <p className="text-sm text-neutral-300 mb-6">
          Add a 4-digit PIN to keep your items private.
        </p>

        <button
          className="w-full bg-purple-600 py-2 rounded-lg mb-3"
          onClick={onAccept}
        >
          Set PIN
        </button>

        <button
          className="w-full bg-neutral-700 py-2 rounded-lg"
          onClick={onLater}
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}

