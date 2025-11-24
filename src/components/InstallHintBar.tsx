interface InstallHintBarProps {
  onInstall: () => void;
  onClose: () => void;
}

export default function InstallHintBar({ onInstall, onClose }: InstallHintBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-900 border-t border-zinc-800 p-3 flex items-center justify-between animate-fade-in">
      <div className="text-zinc-300 text-sm">
        Install Borrbox for faster access
      </div>

      <div className="flex gap-2">
        <button
          onClick={onInstall}
          className="px-3 py-1 rounded-lg bg-amber-600 text-white text-sm font-medium"
        >
          Install
        </button>

        <button
          onClick={onClose}
          className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-sm"
        >
          Later
        </button>
      </div>
    </div>
  );
}

