import { describe, expect, it } from "vitest";

import {
  advance,
  nextRound,
  type Progress,
  type Random,
  shuffle,
} from "./order";

type Card = { id: number; front: string; back: string };

/** 決まった値を順に返す乱数（最後まで使ったら最初に戻る） */
function sequence(values: number[]): Random {
  let i = 0;
  return () => values[i++ % values.length];
}

/** いつも同じ値を返す乱数 */
function constant(value: number): Random {
  return () => value;
}

/** 種から決まった列を作る乱数（何度も試すために使う） */
function seeded(seed: number): Random {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function ids(cards: Card[]) {
  return cards.map((card) => card.id);
}

function sorted(values: number[]) {
  return [...values].sort((a, b) => a - b);
}

/** 最初のカードを含めて count 枚ぶん、表示されるカードを順に集める */
function shown(start: Progress<Card>, count: number, random: Random): Card[] {
  const result: Card[] = [];
  let progress = start;
  for (let i = 0; i < count; i += 1) {
    result.push(progress.round[progress.position]);
    progress = advance(progress, random);
  }
  return result;
}

function card(id: number, front = `front-${id}`, back = `back-${id}`): Card {
  return { id, front, back };
}

describe("shuffle", () => {
  it("UT1: 乱数によって異なる順番になり、どの順番も 5 枚すべてをちょうど 1 回ずつ含む", () => {
    const cards = [1, 2, 3, 4, 5].map((id) => card(id));
    const randoms = [
      constant(0),
      constant(0.5),
      constant(0.999),
      sequence([0.1, 0.9, 0.3, 0.7]),
      seeded(1),
      seeded(2),
    ];

    const orders = randoms.map((random) => ids(shuffle(cards, random)));

    for (const order of orders) {
      expect(sorted(order)).toEqual([1, 2, 3, 4, 5]);
    }
    const distinct = new Set(orders.map((order) => order.join(",")));
    expect(distinct.size).toBeGreaterThan(1);
    // 乱数が同じなら順番も同じ（順番は乱数だけで決まる）
    expect(ids(shuffle(cards, constant(0)))).toEqual(orders[0]);
    expect(orders[0]).not.toEqual(orders[2]);
  });

  it("元の配列を変えない", () => {
    const cards = [1, 2, 3].map((id) => card(id));
    shuffle(cards, constant(0));
    expect(ids(cards)).toEqual([1, 2, 3]);
  });

  it("カードが 0 枚・1 枚でもそのまま返す", () => {
    expect(shuffle([], constant(0))).toEqual([]);
    expect(ids(shuffle([card(1)], constant(0)))).toEqual([1]);
  });
});

describe("advance", () => {
  it("UT2: 一巡で、文字が同じカードも含めてすべてのカードを id ごとに 1 回ずつ表示する", () => {
    const cards = [
      card(1, "same", "同じ"),
      card(2, "same", "同じ"),
      card(3),
      card(4),
    ];
    for (const seed of [1, 2, 3, 4, 5]) {
      const random = seeded(seed);
      const start = { round: shuffle(cards, random), position: 0 };

      const seen = shown(start, 4, random);

      expect(sorted(ids(seen))).toEqual([1, 2, 3, 4]);
    }
  });

  it("UT3: 次の一巡の最初が前の一巡の最後と同じになる乱数でも、続けて同じカードを表示しない", () => {
    const cards = [card(1), card(2), card(3)];
    // この乱数では、shuffle は最初と最後を入れ替える。
    // 何もしなければ、次の一巡は前の一巡の最後のカードから始まってしまう
    expect(ids(shuffle(cards, sequence([0, 0.999])))).toEqual([3, 2, 1]);
    // 3 つ目の値は、最初のカードを入れ替える相手を選ぶのに使われる
    const random = sequence([0, 0.999, 0]);
    const start = { round: cards, position: 0 };

    const seen = ids(shown(start, 9, random));

    expect(seen).toEqual([1, 2, 3, 2, 3, 1, 3, 1, 2]);

    for (let i = 1; i < seen.length; i += 1) {
      expect(seen[i]).not.toBe(seen[i - 1]);
    }
    for (const round of [seen.slice(0, 3), seen.slice(3, 6), seen.slice(6)]) {
      expect(sorted(round)).toEqual([1, 2, 3]);
    }
  });

  it("UT3: いろいろな乱数で 3 巡ぶん進めても、続けて同じカードを表示しない", () => {
    const cards = [card(1), card(2), card(3)];
    for (let seed = 1; seed <= 50; seed += 1) {
      const random = seeded(seed);
      const start = { round: shuffle(cards, random), position: 0 };

      const seen = ids(shown(start, 9, random));

      for (let i = 1; i < seen.length; i += 1) {
        expect(seen[i]).not.toBe(seen[i - 1]);
      }
      for (const round of [seen.slice(0, 3), seen.slice(3, 6), seen.slice(6)]) {
        expect(sorted(round)).toEqual([1, 2, 3]);
      }
    }
  });

  it("UT4: カードがちょうど 2 枚なら、乱数がどの値でも A → B → A → B → A → B の順になる", () => {
    const a = card(1, "A");
    const b = card(2, "B");
    const randoms = [
      constant(0),
      constant(0.25),
      constant(0.5),
      constant(0.75),
      constant(0.999),
      sequence([0, 0.999]),
      sequence([0.999, 0]),
      ...Array.from({ length: 20 }, (_, i) => seeded(i + 1)),
    ];
    for (const random of randoms) {
      const start = { round: [a, b], position: 0 };

      const seen = ids(shown(start, 6, random));

      expect(seen).toEqual([1, 2, 1, 2, 1, 2]);
    }
  });

  it("カードが 1 枚だけなら、同じカードを繰り返す", () => {
    const start = { round: [card(1)], position: 0 };
    expect(ids(shown(start, 3, constant(0.5)))).toEqual([1, 1, 1]);
  });

  it("一巡の途中では乱数を使わず、順番も変えない", () => {
    const round = [card(1), card(2), card(3)];
    const random: Random = () => {
      throw new Error("乱数は使わないはず");
    };
    expect(advance({ round, position: 0 }, random)).toEqual({
      round,
      position: 1,
    });
  });
});

describe("nextRound", () => {
  it("最初のカードが前の一巡の最後と同じなら、2 枚目以降のどれかと入れ替える", () => {
    const cards = [card(1), card(2), card(3)];
    // shuffle は [1, 2, 3] のまま。入れ替える相手は乱数で決まる
    expect(ids(nextRound(cards, 1, constant(0.999)))).toEqual([3, 2, 1]);
    expect(ids(nextRound(cards, 1, sequence([0.999, 0.999, 0])))).toEqual([
      2, 1, 3,
    ]);
  });

  it("最初のカードが前の一巡の最後と違えば、そのままにする", () => {
    const cards = [card(1), card(2), card(3)];
    expect(ids(nextRound(cards, 3, constant(0.999)))).toEqual([1, 2, 3]);
    expect(ids(nextRound(cards, null, constant(0.999)))).toEqual([1, 2, 3]);
  });
});
