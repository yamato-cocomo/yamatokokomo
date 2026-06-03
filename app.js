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

// ステータス表示
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

// 会場切り替え
document.querySelectorAll('.venue-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.currentVenue = btn.dataset.venue;
    renderStatus();
  });
});

// 初期表示
window.addEventListener('load', () => {
  renderStatus();
});
