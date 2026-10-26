/** Which version of a scene is playing: as the PR wrote it, or after the fix. */
export type SceneVariant = "before" | "fix";

export interface PlaybackEvents {
  "scene:start": { sceneId: string; index: number; variant: SceneVariant };
  "scene:end": { sceneId: string; index: number; variant: SceneVariant };
  "show:end": { sceneCount: number };
  "playback:state": { playing: boolean };
  "prop:tapped": { sceneId: string };
  "fix:requested": { sceneId: string };
}

export type PlaybackEventName = keyof PlaybackEvents;

type Listener<T> = (payload: T) => void;

/** A typed observer: UI, narration and VR controllers react without knowing each other. */
export class EventBus<Events extends object = PlaybackEvents> {
  private readonly listeners = new Map<keyof Events, Set<Listener<never>>>();

  on<K extends keyof Events>(name: K, listener: Listener<Events[K]>): () => void {
    const set = this.listeners.get(name) ?? new Set();
    set.add(listener as Listener<never>);
    this.listeners.set(name, set);
    return () => set.delete(listener as Listener<never>);
  }

  emit<K extends keyof Events>(name: K, payload: Events[K]): void {
    for (const listener of this.listeners.get(name) ?? []) {
      (listener as Listener<Events[K]>)(payload);
    }
  }
}
