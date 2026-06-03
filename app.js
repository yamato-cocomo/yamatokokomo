// ココモのステップ（100 → 100 → 200 → 300 → 500 → 800）
const KOKOMO_STEPS = [100, 100, 200, 300, 500, 800];

// 会場ごとの状態
let state = {
  currentVenue: 'tokyo',
  venues: {
    tokyo: { stepIndex: 0, loseCount: 0, finished: false },
    kyoto: { stepIndex: 0, loseCount: 0, finished: false }
  }
};
function renderStatus() {
  const v = state.venues[state.currentVenue];
  const el = document.getElementById('status');

  let text = `
    会場: ${state.currentVenue === 'tokyo' ? '東京' : '京都'}<br>
    ステップ: ${v.stepIndex + 1} / ${KOKOMO_STEPS.length}<br>
    次の賭け金: ${KOKOMO_STEPS[v.stepIndex]} 円<br>
    連敗数: ${v.loseCount}<br>
    状態: ${v.finished ? '本日終了（勝ち逃げ or 損切り）' : '運用中'}
  `;

  el.innerHTML = text;
}
document.querySelectorAll('.venue-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.currentVenue = btn.dataset.venue;
    renderStatus();
  });
});
window.addEventListener('load', () => {
  renderStatus();
});
document.getElementById('checkBtn').addEventListener('click', () => {
  const raceNo = Number(document.getElementById('raceNo').value);
  const odds = Number(document.getElementById('odds').value);
  const v = state.venues[state.currentVenue];
  const judgeEl = document.getElementById('judge');

  if (!raceNo || !odds) {
    judgeEl.textContent = 'レース番号とオッズを入力してください。';
    return;
  }

  if (v.finished) {
    judgeEl.textContent = 'この会場は本日終了状態です（勝ち逃げ or 損切り）。';
    return;
  }

  if (odds < 2.7) {
    judgeEl.textContent = `オッズ ${odds}倍 → 条件NG（見送り）`;
    return;
  }

  judgeEl.innerHTML = `
    ✅ 条件OK！<br>
    レース: ${raceNo}R<br>
    2番人気オッズ: ${odds}倍<br>
    賭け金: ${KOKOMO_STEPS[v.stepIndex]} 円
  `;
});
document.getElementById('winBtn').addEventListener('click', () => {
  const v = state.venues[state.currentVenue];

  if (v.finished) return;

  // 勝ち逃げ：その会場は本日終了
  v.finished = true;
  v.loseCount = 0;
  v.stepIndex = 0;

  document.getElementById('judge').textContent = '的中！この会場は本日勝ち逃げ終了です。';
  renderStatus();
});
document.getElementById('loseBtn').addEventListener('click', () => {
  const v = state.venues[state.currentVenue];

  if (v.finished) return;

  v.loseCount++;

  if (v.loseCount >= 6) {
    // 損切り
    v.finished = true;
    document.getElementById('judge').textContent =
      '6連敗に到達。損切りでこの会場は本日終了です。';
  } else {
    // 次のステップへ
    if (v.stepIndex < KOKOMO_STEPS.length - 1) {
      v.stepIndex++;
    }
    document.getElementById('judge').textContent =
      `ハズレ。連敗数: ${v.loseCount} → 次の賭け金: ${KOKOMO_STEPS[v.stepIndex]} 円`;
  }

  renderStatus();
});
