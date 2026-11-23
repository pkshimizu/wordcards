/** 0 以上 1 未満の乱数を返す関数（ふつうは Math.random。テストでは決まった値に差し替える） */
export type Random = () => number;

/** 一巡の順番と、その中で今表示しているカードの位置 */
export type Progress<T> = { round: T[]; position: number };

/**
 * 一巡の順番を決める。すべての項目をちょうど 1 回ずつ含む、ランダムな順の新しい配列を返す。
 * 元の配列は変えない。
 */
export function shuffle<T>(items: readonly T[], random: Random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = randomIndex(i + 1, random);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 次の一巡の順番を決める。
 * カードが 2 枚以上あるとき、最初のカードが前の一巡の最後のカード（lastId）と同じにならないようにする。
 * 「同じカード」かどうかは id で決める。
 */
export function nextRound<T extends { id: number }>(
  cards: readonly T[],
  lastId: number | null,
  random: Random,
): T[] {
  const round = shuffle(cards, random);
  if (round.length >= 2 && round[0].id === lastId) {
    // 最初のカードを、2 枚目以降のどれか 1 枚と入れ替える
    const j = 1 + randomIndex(round.length - 1, random);
    [round[0], round[j]] = [round[j], round[0]];
  }
  return round;
}

/**
 * 次のカードへ進む。一巡の途中なら次の位置へ、一巡の最後なら順番を決め直して次の一巡の最初へ進む。
 */
export function advance<T extends { id: number }>(
  progress: Progress<T>,
  random: Random,
): Progress<T> {
  const { round, position } = progress;
  if (position + 1 < round.length) {
    return { round, position: position + 1 };
  }
  const last = round[round.length - 1];
  return { round: nextRound(round, last?.id ?? null, random), position: 0 };
}

/** 0 以上 count 未満の整数を選ぶ（乱数が範囲の外の値を返しても、範囲に収める） */
function randomIndex(count: number, random: Random): number {
  const index = Math.floor(random() * count);
  return Math.min(Math.max(index, 0), count - 1);
}
