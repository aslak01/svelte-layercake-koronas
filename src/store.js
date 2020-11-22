import { writable, derived } from "svelte/store";

export const absoluteMax = writable([]);
export const pMilMax = writable([]);
export const minidayStore = writable([]);
export const minidaySettings = writable({});
export const minidayCopy = derived(
  minidayStore,
  ($minidayStore) => $minidayStore
);
