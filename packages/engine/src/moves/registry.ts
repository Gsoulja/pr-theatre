import type { MoveName } from "@pr-theatre/schema";

/** Every renderer must provide this move; it is what an unknown move falls back to. */
export const FALLBACK_MOVE: MoveName = "highlight";

export class MissingFallbackMoveError extends Error {
  constructor(requested: MoveName) {
    super(`Move "${requested}" is not registered and neither is the "${FALLBACK_MOVE}" fallback. Register a "${FALLBACK_MOVE}" move in the renderer.`);
    this.name = "MissingFallbackMoveError";
  }
}

/** Name → move lookup. Generic so each renderer stores its own kind of move. */
export class MoveRegistry<TMove> {
  private readonly moves = new Map<MoveName, TMove>();

  register(name: MoveName, move: TMove): this {
    this.moves.set(name, move);
    return this;
  }

  has(name: MoveName): boolean {
    return this.moves.has(name);
  }

  /** Unknown names fall back to `highlight`, so any valid scene file still plays. */
  resolve(name: MoveName): TMove {
    const move = this.moves.get(name) ?? this.moves.get(FALLBACK_MOVE);
    if (move === undefined) throw new MissingFallbackMoveError(name);
    return move;
  }
}
