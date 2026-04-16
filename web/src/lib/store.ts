import { writable } from 'svelte/store';
import { defaultData, type BusinessCardData } from './types';

function createStore() {
	const { subscribe, set, update } = writable<BusinessCardData>(loadFromStorage());

	function loadFromStorage(): BusinessCardData {
		if (typeof window === 'undefined') return { ...defaultData };
		try {
			const saved = sessionStorage.getItem('businessCardData');
			if (saved) return { ...defaultData, ...JSON.parse(saved) };
		} catch {}
		return { ...defaultData };
	}

	return {
		subscribe,
		set: (data: BusinessCardData) => {
			if (typeof window !== 'undefined') {
				sessionStorage.setItem('businessCardData', JSON.stringify(data));
			}
			set(data);
		},
		update: (fn: (data: BusinessCardData) => BusinessCardData) => {
			update((data) => {
				const next = fn(data);
				if (typeof window !== 'undefined') {
					sessionStorage.setItem('businessCardData', JSON.stringify(next));
				}
				return next;
			});
		},
		reset: () => {
			if (typeof window !== 'undefined') {
				sessionStorage.removeItem('businessCardData');
			}
			set({ ...defaultData });
		}
	};
}

export const cardStore = createStore();
