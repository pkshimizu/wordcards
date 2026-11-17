// 採点：前後の空白を除いて、裏と完全に一致すれば正解（あいまいな採点はしない）
export function isCorrect(answer: string, back: string): boolean {
  return answer.trim() === back.trim();
}
