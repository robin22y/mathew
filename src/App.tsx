import { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { AddItemSheet } from './components/AddItemSheet';
import { ItemList } from './components/ItemList';
import { ItemDetailPanel } from './components/ItemDetailPanel';
import { LockScreen } from './components/LockScreen';
import EnablePinModal from './components/EnablePinModal';
import { SettingsSheet } from './components/SettingsSheet';
import { AdBanner } from './components/AdBanner';
import { FullscreenAd } from './components/FullscreenAd';
import { useBorrboxStore } from './hooks/useBorrboxStore';
import { usePWAInstall } from './hooks/usePWAInstall';
import { usePinLock } from './hooks/usePinLock';
import type { BorrboxItem } from './types';

function App() {
  const { locked, hasPin, requestUnlock, setNewPin, lockNow, disablePin, resetAllData } = usePinLock();
  const { items, addItem, updateItem, deleteItem, markReturned, overdueCount, dueThisWeekCount, moneyOwedToMe, moneyIOwe } = useBorrboxStore();
  const {
    canInstall,
    showHint,
    isIos,
    isStandalone,
    triggerInstall,
    hideInstallHint,
  } = usePWAInstall();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BorrboxItem | null>(null);
  const [editingItem, setEditingItem] = useState<BorrboxItem | null>(null);
  const [pinError, setPinError] = useState(false);
  const [showEnablePin, setShowEnablePin] = useState(false);
  const [forcePinSetup, setForcePinSetup] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isFullscreenAdOpen, setIsFullscreenAdOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track app open date on first render
  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    localStorage.setItem("borrbox-last-open-date", todayStr);
  }, []);

  function shouldShowFullscreenAd() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastAd = localStorage.getItem("borrbox-last-fullscreen-ad");
    const lastOpen = localStorage.getItem("borrbox-last-open-date");

    // NEVER show ad if hasn't opened in 14+ days
    if (lastOpen) {
      const lastOpenDate = new Date(lastOpen);
      const diffDays = (Date.now() - lastOpenDate.getTime()) / 86400000;
      if (diffDays >= 14) return false;
    }

    // Already showed ad today?
    if (lastAd === todayStr) return false;

    return true;
  }

  const handleAddClick = () => {
    setEditingItem(null);
    setIsAddSheetOpen(true);
  };

  const handleItemClick = (item: BorrboxItem) => {
    setSelectedItem(item);
    setIsDetailPanelOpen(true);
  };

  const handleSave = (id: string | null, item: Partial<BorrboxItem> | BorrboxItem) => {
    if (id === null) {
      addItem(item as BorrboxItem);
      if (!hasPin) {
        setShowEnablePin(true);
      }
      // Block fullscreen ad on very first use
      if (!localStorage.getItem("borrbox-first-use-block")) {
        localStorage.setItem("borrbox-first-use-block", "1");
      } else {
        if (shouldShowFullscreenAd()) {
          setIsFullscreenAdOpen(true);
          const todayStr = new Date().toISOString().slice(0, 10);
          localStorage.setItem("borrbox-last-fullscreen-ad", todayStr);
        }
      }
    } else {
      updateItem(id, item);
    }
    setIsAddSheetOpen(false);
    setEditingItem(null);
  };

  const handleEdit = () => {
    if (selectedItem) {
      setEditingItem(selectedItem);
      setIsDetailPanelOpen(false);
      setIsAddSheetOpen(true);
    }
  };

  const handleMarkReturned = () => {
    if (selectedItem) {
      markReturned(selectedItem.id);
      setIsDetailPanelOpen(false);
      setSelectedItem(null);
    }
  };

  const handleDelete = () => {
    if (selectedItem && window.confirm('Are you sure you want to delete this item?')) {
      deleteItem(selectedItem.id);
      setIsDetailPanelOpen(false);
      setSelectedItem(null);
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'borrbox-backup.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      
      if (!Array.isArray(parsed)) {
        alert('Invalid file format. Expected an array of items.');
        return;
      }

      const isValid = parsed.every((item: unknown) => {
        if (typeof item !== 'object' || item === null) return false;
        const i = item as Record<string, unknown>;
        return (
          typeof i.id === 'string' &&
          typeof i.type === 'string' &&
          (i.type === 'money' || i.type === 'object') &&
          typeof i.personName === 'string' &&
          typeof i.borrowedAt === 'string' &&
          typeof i.dueDate === 'string' &&
          typeof i.returned === 'boolean' &&
          typeof i.direction === 'string' &&
          (i.direction === 'they_borrowed' || i.direction === 'i_borrowed')
        );
      });

      if (!isValid) {
        alert('Invalid file format. Items do not match expected structure.');
        return;
      }

      localStorage.setItem('borrbox-items', JSON.stringify(parsed));
      window.location.reload();
    } catch (error) {
      alert('Failed to import data. Please check the file format.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handlePinSubmit = async (pin: string): Promise<boolean> => {
    const success = await requestUnlock(pin);
    setPinError(!success);
    return success;
  };

  const handleNewPinSubmit = async (pin: string): Promise<void> => {
    await setNewPin(pin);
    setPinError(false);
    setForcePinSetup(false);
  };

  if (forcePinSetup) {
    return (
      <LockScreen
        requireSetup={true}
        onSubmitPin={handlePinSubmit}
        onSubmitNewPin={handleNewPinSubmit}
        error={pinError}
        allowReset={false}
        onResetRequest={resetAllData}
      />
    );
  }

  if (hasPin && locked) {
    return (
      <LockScreen
        requireSetup={false}
        onSubmitPin={handlePinSubmit}
        onSubmitNewPin={handleNewPinSubmit}
        error={pinError}
        allowReset={true}
        onResetRequest={resetAllData}
      />
    );
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-sm mx-auto bg-neutral-950">
        <Header 
          canInstall={canInstall} 
          onInstallClick={() => {
            if (!isIos) {
              triggerInstall();
            }
          }} 
          onLock={lockNow} 
          onOpenSettings={() => setSettingsOpen(true)} 
        />

        <main className="pb-20">
          <div className="px-4 pt-0.5 pb-2 space-y-2">
            <button
              onClick={handleAddClick}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-600 text-white font-medium rounded-xl transition-colors"
            >
              + Add Borrowed Item
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Export Data
              </button>
              <button
                onClick={handleImport}
                className="flex-1 py-2 text-xs font-medium text-neutral-300 bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Import Data
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFilePicked}
              className="hidden"
            />
          </div>

          <div className="px-4 py-2 grid grid-cols-2 gap-2.5">
            <div className="bg-neutral-900/80 rounded-2xl p-2 border border-neutral-800 shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                Overdue
              </div>
              <div className="text-base font-semibold text-neutral-100">{overdueCount}</div>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-2 border border-neutral-800 shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                This Week
              </div>
              <div className="text-base font-semibold text-neutral-100">{dueThisWeekCount}</div>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-2 border border-neutral-800 shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                Money Owed to Me
              </div>
              <div className="text-base font-semibold text-emerald-400">£{moneyOwedToMe.toFixed(2)}</div>
            </div>
            <div className="bg-neutral-900/80 rounded-2xl p-2 border border-neutral-800 shadow-sm shadow-black/20">
              <div className="text-[11px] uppercase tracking-wide text-neutral-400 mb-1">
                Money I Owe
              </div>
              <div className="text-base font-semibold text-neutral-100">£{moneyIOwe.toFixed(2)}</div>
            </div>
          </div>

          {/* SINGLE PREMIUM AD SLOT */}
          <div className="px-4 pb-3">
            <AdBanner placement="main" />
          </div>

          <ItemList items={items} onItemClick={handleItemClick} />
        </main>

        <AddItemSheet
          open={isAddSheetOpen}
          onClose={() => {
            setIsAddSheetOpen(false);
            setEditingItem(null);
          }}
          editingItem={editingItem}
          onSave={handleSave}
        />

        <ItemDetailPanel
          open={isDetailPanelOpen}
          onClose={() => {
            setIsDetailPanelOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onEdit={handleEdit}
          onMarkReturned={handleMarkReturned}
          onDelete={handleDelete}
        />

        <EnablePinModal
          open={showEnablePin}
          onAccept={() => {
            setShowEnablePin(false);
            setForcePinSetup(true);
          }}
          onLater={() => setShowEnablePin(false)}
        />

        <SettingsSheet
          open={settingsOpen}
          hasPin={hasPin}
          onEnablePin={() => {
            setForcePinSetup(true);
            setSettingsOpen(false);
          }}
          onChangePin={() => {
            disablePin();
            setForcePinSetup(true);
            setSettingsOpen(false);
          }}
          onDisablePin={() => {
            disablePin();
            setSettingsOpen(false);
          }}
          onClose={() => setSettingsOpen(false)}
        />

        {showHint && !isStandalone && (
          <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-4">
            <div className="w-full max-w-sm bg-neutral-900/95 border border-neutral-800 rounded-2xl px-3.5 py-3 flex items-center gap-3 shadow-lg">
              <div className="flex-1">
                <div className="text-xs font-semibold text-neutral-100 mb-0.5">
                  {isIos ? "Add Borrbox to your Home Screen" : "Install Borrbox"}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {isIos
                    ? "Tap the Share icon, then 'Add to Home Screen'."
                    : "Install for faster access and offline use."}
                </div>
              </div>
              {!isIos && (
                <button
                  onClick={() => {
                    triggerInstall();
                  }}
                  className="px-2.5 py-1.5 rounded-full bg-neutral-100 text-[11px] text-neutral-900 font-semibold"
                >
                  Install
                </button>
              )}
              <button
                onClick={hideInstallHint}
                className="ml-1 text-neutral-500 hover:text-neutral-300 text-xs"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <FullscreenAd open={isFullscreenAdOpen} onClose={() => setIsFullscreenAdOpen(false)} />
      </div>
    </div>
  );
}

export default App;
