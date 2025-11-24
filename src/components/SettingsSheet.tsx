import { BackupRestore } from "./BackupRestore";

interface SettingsSheetProps {
  open: boolean;
  hasPin: boolean;
  onEnablePin: () => void;
  onChangePin: () => void;
  onDisablePin: () => void;
  onClose: () => void;
}

export function SettingsSheet({
  open,
  hasPin,
  onEnablePin,
  onChangePin,
  onDisablePin,
  onClose,
}: SettingsSheetProps) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 rounded-t-2xl z-50 max-w-sm mx-auto max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-neutral-100 mb-6">Settings</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200 mb-3">PIN & Privacy</h3>
              <div className="space-y-3">
                {hasPin ? (
                  <>
                    <button
                      onClick={onChangePin}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                    >
                      Change PIN
                    </button>
                    <button
                      onClick={onDisablePin}
                      className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors"
                    >
                      Disable PIN
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onEnablePin}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                  >
                    Enable PIN
                  </button>
                )}
              </div>
            </div>

            <BackupRestore />

            <button
              onClick={onClose}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

