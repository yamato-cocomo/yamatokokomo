// 初期ユニット候補
const UNIT_LIST = [100, 200, 300, 400, 500];
let baseUnit = 100;

// ココモステップ生成
function getKokomoSteps() {
  return [
    baseUnit,
    baseUnit,
    baseUnit * 2,
    Math.round(baseUnit * 3),
    Math.round(baseUnit * 5),
    Math.round(baseUnit * 8)
  ];
}

// 会場ごとの状態
let state = {
  currentVenue: 'tokyo',
  venues: {
    tokyo: { stepIndex: 0, loseCount: 0, finished: false },
    kyoto: { stepIndex: 0, loseCount: 0, finished: false }
  }
};

let lastBetAmount = null;

// ステータス表示
function renderStatus() {
  const v = state.venues[state.currentVenue];
  const steps = getKokomoSteps();
  const el = document.getElementById('status');

  el.innerHTML = `
    会場: ${state.currentVenue === 'tokyo' ? '東京' : '京都'}<br>
    ステップ: ${v.stepIndex + 1} / ${steps.length}<br>
    次の賭け金: ${steps[v.stepIndex]} 円<br>
    連敗数: ${v.loseCount}<br>
    状態: ${v.finished ? '本日終了（勝ち逃げ or 損切り）' : '運用中'}
  `;

  renderBetButtons();
}

// 初期ユニットボタン
function renderUnitButtons() {
  const container = document.getElementById('unitButtons');
  container.innerHTML = "";

  UNIT_LIST.forEach(unit => {
    const btn = document.createElement('button');
    btn.textContent = `${unit}円スタート`;
    btn.className = "unit-btn";

    btn.addEventListener('click', () => {
      baseUnit = unit;
      alert(`初期ユニットを ${unit}円 に設定しました`);
      renderStatus();
    });

    container.appendChild(btn);
  });
}

// レース番号自動生成
function renderRaceButtons() {
  const container = document.getElementById('raceButtons');
  container.innerHTML = "";

  for (let i = 1; i <= 12; i++) {
    const btn = document.createElement('button');
    btn.textContent = `${i}R`;
    btn.className = "race-btn";

    btn.addEventListener('click', () => {
      document.getElementById('raceNo').value = i;
    });

    container.appendChild(btn);
  }
}

// オッズ候補ボタン
document.querySelectorAll('.odds-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.getElementById('odds').value = btn.dataset.odds;
  });
});

// 賭け金候補（ユニット連動）
function renderBetButtons() {
  const container = document.getElementById('betButtons');
  container.innerHTML = "";

  const steps = getKokomoSteps();

  steps.forEach(amount => {
    const btn = document.createElement('button');
    btn.textContent = `${amount}円`;
    btn.className = "bet-btn";

    btn.addEventListener('click', () => {
      document.getElementById('manualBet').value = amount;
    });

    container.appendChild(btn);
  });
}

// 条件判定
document.getElementById('checkBtn').addEventListener('click', () => {
  const raceNo = Number(document.getElementById('raceNo').value);
  const odds = Number(document.getElementById('odds').value);
  const v = state.venues[state.currentVenue];
  const judgeEl = document.getElementById('judge');

  document.getElementById('buyBtn').style.display = 'none';

  if (!raceNo || !odds) {
    judgeEl.textContent = 'レース番号とオッズを入力してください。';
    return;
  }

  if (v.finished) {
    judgeEl.textContent = 'この会場は本日終了状態です。';
    return;
  }

  if (odds < 2.7) {
    judgeEl.textContent = `オッズ ${odds}倍 → 条件NG（見送り）`;
    return;
  }

  const steps = getKokomoSteps();
  const bet = steps[v.stepIndex];

  judgeEl.innerHTML = `
    ✅ 条件OK！<br>
    レース: ${raceNo}R<br>
    2番人気オッズ: ${odds}倍<br>
    賭け金: ${bet} 円
  `;

  lastBetAmount = bet;
  document.getElementById('buyBtn').style.display = 'block';
});

// 賭け金コピー
document.getElementById('copyBetBtn').addEventListener('click', async () => {
  if (!lastBetAmount) {
    alert('まず条件判定をしてください。');
    return;
  }

  try {
    await navigator.clipboard.writeText(String(lastBetAmount));
    alert(`賭け金 ${lastBetAmount}円 をコピーしました。`);
  } catch (e) {
    alert('コピーに失敗しました。');
  }
});

// 購入ボタン
document.getElementById('buyBtn').addEventListener('click', () => {
  window.open("https://www.ipat.jra.go.jp/", "_blank");
});

// 的中
document.getElementById('winBtn').addEventListener('click', () => {
  const v = state.venues[state.currentVenue];
  v.finished = true;
  v.loseCount = 0;
  v.stepIndex = 0;

  document.getElementById('judge').textContent =
    '🎉 的中！この会場は本日終了です。';

  document.getElementById('buyBtn').style.display = 'none';
  renderStatus();
});

// ハズレ
document.getElementById('loseBtn').addEventListener('click', () => {
  const v = state.venues[state.currentVenue];
  const steps = getKokomoSteps();

  v.loseCount++;

  if (v.loseCount >= 6) {
    v.finished = true;
    document.getElementById('judge').textContent =
      '❌ 6連敗 → 損切りで本日終了';
    renderStatus();
    return;
  }

  if (v.stepIndex < steps.length - 1) {
    v.stepIndex++;
  }

  document.getElementById('judge').textContent =
    `ハズレ → 次の賭け金: ${steps[v.stepIndex]}円`;

  renderStatus();
});

// 初期表示
window.addEventListener('load', () => {
  renderUnitButtons();
  renderRaceButtons();
  renderStatus();
});
