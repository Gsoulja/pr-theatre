import { MoveRegistry } from "@pr-theatre/engine";
import { rewriteScriptMove } from "./acts/behaviour-changed";
import { leaveStageMove } from "./acts/code-removed";
import { crateArrivesMove } from "./acts/dependency-added";
import { bowSnappedMove, speakUpMove } from "./acts/error-hidden";
import { joinCastMove } from "./acts/feature-added";
import { tieKnotMove, unspoolMove } from "./acts/missing-limit";
import { directorNodsMove, emptyChairMove } from "./acts/no-approval";
import { callTimeMove, sandForeverMove } from "./acts/no-timeout";
import { rehearseMove, rehearseNowMove, skipRehearsalMove } from "./acts/rehearsal";
import { keyOutsideMove, lockKeyMove } from "./acts/secret-exposed";
import { rulersAgreeMove, rulersDisagreeMove } from "./acts/unit-mismatch";
import { highlightMove, settleMove } from "./highlight";
import type { SvgMove } from "./move-context";

/** Adding a move: write it under acts/ and list it here. The theme names it; nothing else changes. */
export const SVG_MOVES: readonly SvgMove[] = [
  highlightMove,
  settleMove,
  joinCastMove,
  rewriteScriptMove,
  leaveStageMove,
  keyOutsideMove,
  lockKeyMove,
  unspoolMove,
  tieKnotMove,
  rulersDisagreeMove,
  rulersAgreeMove,
  bowSnappedMove,
  speakUpMove,
  sandForeverMove,
  callTimeMove,
  emptyChairMove,
  directorNodsMove,
  rehearseMove,
  skipRehearsalMove,
  rehearseNowMove,
  crateArrivesMove,
];

export function createSvgMoveRegistry(moves: readonly SvgMove[] = SVG_MOVES): MoveRegistry<SvgMove> {
  return moves.reduce((registry, move) => registry.register(move.name, move), new MoveRegistry<SvgMove>());
}
