interface HeaderProps {
  canInstall?: boolean;
  onInstallClick?: () => void;
  onLock?: () => void;
  onOpenSettings?: () => void;
}

export function Header({ canInstall = false, onInstallClick, onLock, onOpenSettings }: HeaderProps) {
  return (
    <header className="flex items-center justify-between pt-2 pb-3 px-3 border-b border-neutral-800">
      <h1 className="text-xl font-bold text-neutral-100 tracking-wide">
        BORRBOX
      </h1>
      <div className="flex items-center gap-3">
        {onLock && (
          <button
            onClick={onLock}
            className="p-2 text-neutral-400 hover:text-neutral-100 transition-colors"
            aria-label="Lock"
          >
            🔒
          </button>
        )}
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            className="text-neutral-300 hover:text-white text-lg transition-colors"
            aria-label="Open settings"
          >
            ⚙
          </button>
        )}
        {canInstall && onInstallClick && (
          <button
            type="button"
            onClick={onInstallClick}
            className="px-3 py-1.5 rounded-full bg-neutral-800 text-xs text-neutral-100 hover:bg-neutral-700"
          >
            Install
          </button>
        )}
      </div>
    </header>
  );
}
