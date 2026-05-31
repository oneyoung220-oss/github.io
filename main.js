/* ============================================================
   CHESS SITE — main.js
   네비게이션 + 서브섹션 드릴다운 + 체스 게임 (chess.js 기반)
   ============================================================ */

// ────────────────────────────────────────────────────────────
// 1. 네비게이션
// ────────────────────────────────────────────────────────────

function navigateTo(sectionId) {
  // 모든 섹션·nav 비활성화
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  // 대상 섹션 활성화
  const target = document.getElementById(sectionId);
  if (target) target.classList.add('active');

  // 대응 nav 활성화
  const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
  if (navItem) navItem.classList.add('active');

  // 서브섹션 초기화 (개요로 돌아가기)
  resetSectionToOverview(sectionId);

  // 모바일 메뉴 닫기
  closeMobileMenu();

  // 스크롤 최상단
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** 서브섹션 → 개요 상태로 초기화 */
function resetSectionToOverview(sectionId) {
  const overview  = document.getElementById('overview-' + sectionId);
  const backBar   = document.getElementById('back-bar-' + sectionId);
  const allSubs   = document.querySelectorAll(`#${sectionId} .sub-section`);

  if (overview) overview.classList.remove('hidden');
  if (backBar)  backBar.classList.add('hidden');
  allSubs.forEach(s => s.classList.add('hidden'));
}

/** 서브섹션으로 드릴다운 */
function navigateToSub(sectionId, subId) {
  const overview  = document.getElementById('overview-' + sectionId);
  const backBar   = document.getElementById('back-bar-' + sectionId);
  const target    = document.getElementById(sectionId + '-' + subId);
  const breadcrumb = document.getElementById('breadcrumb-' + sectionId);

  if (!target) return;

  // 개요 숨기기
  if (overview)  overview.classList.add('hidden');
  // 모든 서브섹션 숨기기
  document.querySelectorAll(`#${sectionId} .sub-section`).forEach(s => s.classList.add('hidden'));
  // 대상 서브섹션 표시
  target.classList.remove('hidden');
  // 백바 표시
  if (backBar)   backBar.classList.remove('hidden');
  // 브레드크럼 업데이트
  if (breadcrumb) {
    const heading = target.querySelector('h2');
    breadcrumb.textContent = heading ? heading.textContent : '';
  }

  // 전략 섹션: 체스보드 초기화
  if (sectionId === 'strategy') {
    const boardMap = { opening: 'opening', middlegame: 'middlegame', endgame: 'endgame' };
    if (boardMap[subId]) initChessBoard(boardMap[subId]);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** 서브섹션 → 개요로 복귀 */
function navigateBack(sectionId) {
  resetSectionToOverview(sectionId);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// nav-item 클릭 이벤트
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    navigateTo(item.getAttribute('data-section'));
  });
});

// ────────────────────────────────────────────────────────────
// 2. 모바일 메뉴
// ────────────────────────────────────────────────────────────

function toggleMobileMenu() {
  document.getElementById('sideNav').classList.toggle('open');
  document.getElementById('navOverlay').classList.toggle('active');
}

function closeMobileMenu() {
  document.getElementById('sideNav').classList.remove('open');
  document.getElementById('navOverlay').classList.remove('active');
}

// ────────────────────────────────────────────────────────────
// 3. 체스 게임
// ────────────────────────────────────────────────────────────

const PIECE_UNICODE = {
  wk:'♔', wq:'♕', wr:'♖', wb:'♗', wn:'♘', wp:'♙',
  bk:'♚', bq:'♛', br:'♜', bb:'♝', bn:'♞', bp:'♟'
};

// FEN 프리셋
const FEN_PRESETS = {
  opening: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  middlegame: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 4 5',
  endgame: '8/5k2/4p3/3pP3/3P2K1/8/8/8 w - - 0 1'
};

// 오프닝 FEN 선택지
const OPENING_FENS = {
  start:   { fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', desc: '초기 포지션입니다. 백이 먼저 두세요.' },
  e4:      { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', desc: '1.e4 — 가장 인기 있는 오프닝 수. 중앙을 차지하고 비숍과 퀸의 이동 경로를 엽니다.' },
  italian: { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK1NR b KQkq - 3 3', desc: '이탈리안 게임: 1.e4 e5 2.Nf3 Nc6 3.Bc4 — 비숍이 f7을 겨냥하며 빠른 공격을 준비합니다.' },
  sicilian:{ fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2', desc: '시실리안 디펜스: 1.e4 c5 — 흑이 비대칭 구조로 반격하는 공격적 방어 전략입니다.' },
  queens:  { fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', desc: '퀸즈 갬빗: 1.d4 d5 2.c4 — 백이 c-폰을 미끼로 중앙 통제를 노립니다.' }
};

// 보드 상태 관리 객체
const boards = {};

function initChessBoard(boardId) {
  try {
    if (typeof Chess === 'undefined') {
      throw new Error('chess.js 라이브러리를 불러올 수 없습니다.');
    }

    const fen = FEN_PRESETS[boardId] || FEN_PRESETS.opening;
    boards[boardId] = {
      game: new Chess(fen),
      initialFen: fen,
      selected: null,
      validMoves: [],
      isComputer: false
    };

    renderBoard(boardId);
    updateStatus(boardId);
  } catch (e) {
    const statusEl = document.getElementById('status-' + boardId);
    if (statusEl) {
      statusEl.textContent = '보드 초기화 실패: ' + e.message;
      statusEl.classList.add('check');
    }
    console.error('[Chess] 초기화 오류:', e);
  }
}

function renderBoard(boardId) {
  const el = document.getElementById('board-' + boardId);
  if (!el) return;
  const state = boards[boardId];
  const game  = state.game;

  el.innerHTML = '';

  // 랭크 8→1, 파일 a→h 순으로 렌더링 (백 기준 보드)
  for (let rank = 7; rank >= 0; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = String.fromCharCode(97 + file) + (rank + 1);
      const piece  = game.get(square);

      const cell = document.createElement('div');
      const isLight = (file + rank) % 2 === 1;
      cell.className = 'cell ' + (isLight ? 'light' : 'dark');
      cell.dataset.square = square;

      // 기물 표시
      if (piece) {
        cell.textContent = PIECE_UNICODE[piece.color + piece.type] || '';
      }

      // 선택 표시
      if (state.selected === square) {
        cell.classList.add('selected');
      }

      // 이동 가능 표시
      if (state.validMoves.includes(square)) {
        if (piece) {
          cell.classList.add('valid-capture');
        } else {
          cell.classList.add('valid-move');
        }
      }

      cell.addEventListener('click', () => handleCellClick(boardId, square));
      el.appendChild(cell);
    }
  }
}

function handleCellClick(boardId, square) {
  const state = boards[boardId];
  const game  = state.game;

  if (game.game_over()) return;

  const piece = game.get(square);

  if (state.selected) {
    // 이동 시도
    if (state.validMoves.includes(square)) {
      // 폰 프로모션 처리
      const promotion = needsPromotion(game, state.selected, square) ? 'q' : undefined;
      const move = game.move({ from: state.selected, to: square, promotion });

      if (move) {
        state.selected   = null;
        state.validMoves = [];
        renderBoard(boardId);
        updateStatus(boardId);

        // 컴퓨터 응수 (흑 차례)
        if (!game.game_over() && game.turn() === 'b') {
          setTimeout(() => computerMove(boardId), 450);
        }
        return;
      }
    }

    // 같은 색 기물 재선택
    if (piece && piece.color === game.turn()) {
      selectSquare(boardId, square);
      return;
    }

    // 선택 해제
    state.selected   = null;
    state.validMoves = [];
    renderBoard(boardId);

  } else {
    // 새 기물 선택 (플레이어 차례 기물만)
    if (piece && piece.color === game.turn()) {
      selectSquare(boardId, square);
    }
  }
}

function selectSquare(boardId, square) {
  const state = boards[boardId];
  state.selected = square;
  state.validMoves = state.game.moves({ square, verbose: true }).map(m => m.to);
  renderBoard(boardId);
}

function computerMove(boardId) {
  const state = boards[boardId];
  const game  = state.game;
  if (game.game_over()) return;

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return;

  // 포획 우선 + 랜덤 선택 (간단한 AI)
  const captures = moves.filter(m => m.flags.includes('c') || m.flags.includes('e'));
  const chosen   = captures.length > 0 && Math.random() < 0.6
    ? captures[Math.floor(Math.random() * captures.length)]
    : moves[Math.floor(Math.random() * moves.length)];

  game.move(chosen);
  state.selected   = null;
  state.validMoves = [];
  renderBoard(boardId);
  updateStatus(boardId);
}

function updateStatus(boardId) {
  const el   = document.getElementById('status-' + boardId);
  if (!el) return;
  const game = boards[boardId].game;

  el.className = 'game-status';

  if (game.in_checkmate()) {
    const winner = game.turn() === 'w' ? '흑' : '백';
    el.textContent = `체크메이트! ${winner}의 승리`;
    el.classList.add('over');
  } else if (game.in_stalemate()) {
    el.textContent = '스테일메이트 — 무승부';
    el.classList.add('over');
  } else if (game.in_draw()) {
    el.textContent = '무승부 (50수 규칙 / 반복)';
    el.classList.add('over');
  } else if (game.in_check()) {
    const turn = game.turn() === 'w' ? '백' : '흑';
    el.textContent = `체크! ${turn}의 차례`;
    el.classList.add('check');
  } else {
    const turn = game.turn() === 'w' ? '백' : '흑';
    el.textContent = `${turn}의 차례입니다`;
  }
}

function needsPromotion(game, from, to) {
  const piece = game.get(from);
  if (!piece || piece.type !== 'p') return false;
  const toRank = parseInt(to[1]);
  return (piece.color === 'w' && toRank === 8) || (piece.color === 'b' && toRank === 1);
}

/** 보드 초기화 */
function resetChessBoard(boardId) {
  if (!boards[boardId]) return;
  const fen = boards[boardId].initialFen;
  boards[boardId].game.load(fen);
  boards[boardId].selected   = null;
  boards[boardId].validMoves = [];
  renderBoard(boardId);
  updateStatus(boardId);
}

/** 한 수 되돌리기 (컴퓨터가 뒀다면 2수 되돌리기) */
function undoMove(boardId) {
  if (!boards[boardId]) return;
  const game = boards[boardId].game;

  // 흑 차례면 흑이 마지막에 둔 수도 되돌리기
  if (game.turn() === 'w' && game.history().length >= 2) {
    game.undo(); game.undo();
  } else if (game.history().length >= 1) {
    game.undo();
  }

  boards[boardId].selected   = null;
  boards[boardId].validMoves = [];
  renderBoard(boardId);
  updateStatus(boardId);
}

// ────────────────────────────────────────────────────────────
// 4. 체스 통계 fetch (D1: fetch / D2: async-await / D3: response.json)
// ────────────────────────────────────────────────────────────

async function fetchChessFacts() {
  const container = document.getElementById('homeStats');
  try {
    const response = await fetch('./chess-facts.json');
    if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
    const data = await response.json();          // D3: JSON 변환
    if (!container) return;
    container.innerHTML = '';
    data.stats.forEach(item => {                 // D4: DOM 동적 생성
      const card = document.createElement('div');
      card.className = 'stat-card';
      card.innerHTML =
        `<span class="stat-icon">${item.icon}</span>` +
        `<span class="stat-value">${item.value}</span>` +
        `<span class="stat-label">${item.label}</span>`;
      container.appendChild(card);
    });
  } catch (e) {                                  // D5: 오류 처리
    if (container) container.innerHTML = '<p class="stats-loading">데이터를 불러올 수 없습니다.</p>';
    console.error('[fetch] chess-facts.json 로드 실패:', e);
  }
}

fetchChessFacts();

// ────────────────────────────────────────────────────────────
// 5. 체스 명언 자동 순환 (U5: setInterval / U6: clearInterval)
// ────────────────────────────────────────────────────────────

const CHESS_QUOTES = [
  '"체스는 99%의 전술이다." — 리처드 테이크만',
  '"폰은 체스의 영혼이다." — 프랑수아-앙드레 필리도르',
  '"한 수를 두기 전에, 그 수가 왜 좋은지 물어보라." — 지그베르트 타라쉬',
  '"어떤 기물을 어디로 옮겨야 할지 모를 때, 가장 나쁜 위치의 기물을 찾아라." — 제레미 실먼',
  '"체스에서 승리는 상대의 실수를 기다리는 것이다." — 사비엘리 타르타코워',
];

let quoteIndex = 0;
let quoteInterval = null;

function startQuoteRotation() {
  const el = document.getElementById('heroQuote');
  if (!el) return;
  el.textContent = CHESS_QUOTES[quoteIndex];
  quoteInterval = setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % CHESS_QUOTES.length;
      el.textContent = CHESS_QUOTES[quoteIndex];
      el.style.opacity = '1';
    }, 400);
  }, 4500);
}

function toggleQuoteRotation() {
  const btn = document.getElementById('heroPauseBtn');
  if (quoteInterval) {
    clearInterval(quoteInterval);
    quoteInterval = null;
    if (btn) btn.textContent = '▶';
    if (btn) btn.setAttribute('aria-label', '명언 순환 재시작');
  } else {
    startQuoteRotation();
    if (btn) btn.textContent = '⏸';
    if (btn) btn.setAttribute('aria-label', '명언 순환 일시정지');
  }
}

startQuoteRotation();

/** 오프닝 FEN 로드 */
function loadOpeningFen(key) {
  const preset = OPENING_FENS[key];
  if (!preset) return;

  const descEl = document.getElementById('opening-desc');
  if (descEl) descEl.textContent = preset.desc;

  if (!boards['opening']) {
    initChessBoard('opening');
  }

  boards['opening'].game.load(preset.fen);
  boards['opening'].initialFen = preset.fen;
  boards['opening'].selected   = null;
  boards['opening'].validMoves = [];
  renderBoard('opening');
  updateStatus('opening');
}
