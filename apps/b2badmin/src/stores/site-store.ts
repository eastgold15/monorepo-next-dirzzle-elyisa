// store/useSiteStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SiteStore {
    currentSiteId: string | null;
    setCurrentSiteId: (id: string) => void;
}

export const useSiteStore = create<SiteStore>()(
    persist(
        (set) => ({
            currentSiteId: null,
            setCurrentSiteId: (id) => set({ currentSiteId: id }),
        }),
        { name: 'app-site-storage' } // 自动存入 localStorage
    )
);