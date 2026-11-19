import { useEffect, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, Check, ChevronLeft, Coins, Eraser, Grid2X2, Lightbulb, RotateCcw, Star, Trees, Bike, Trophy } from 'lucide-react'
import { HashRouter, Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { cellsFor, crossingLetters, getAttempt, makeBank, makeBoard, newProgress, normalize, readSave, starsFor, storageKey } from './game'
import type { Progress, Save } from './game'
import { levels } from './levels'
import type { Entry, Level } from './levels'

const number = new Intl.NumberFormat('ar-MA-u-nu-arab')
const levelIcons = [BookOpen, Trees, Bike]

function Stars({ count }: { count: number }) {
  return <span className="stars" aria-label={`${number.format(count)} من ٣ نجوم`}>
    {[1, 2, 3].map((star) => <Star key={star} size={19} fill={star <= count ? 'currentColor' : 'none'} aria-hidden />)}
  </span>
}

function Header() {
  return <header className="header">
    <div className="header-inner">
      <Link className="brand" to="/"><span className="brand-icon"><Grid2X2 size={19} aria-hidden /></span>حروف وكلمات</Link>
      <Link className="all-levels" to="/#levels">المستويات</Link>
    </div>
  </header>
}

function Home({ save }: { save: Save }) {
  const available = levels.find((level) => (save[level.id]?.solved.length ?? 0) < level.entries.length) ?? levels[0]
  const hasProgress = !!save[available.id]
  const { hash } = useLocation()
  useEffect(() => {
    if (hash === '#levels') document.getElementById('levels')?.scrollIntoView()
  }, [hash])
  return <main className="home" id="main">
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Grid2X2 size={16} aria-hidden /> لعبة كلمات متقاطعة</div>
        <h1>حروف وكلمات</h1>
        <p>أكمل العبارات، خمّن الصور، واملأ شبكة الكلمات حرفًا حرفًا.</p>
        <Link className="primary hero-button" to={`/level/${available.id}`}>{hasProgress ? 'تابع اللعب' : 'ابدأ اللعب'}<ArrowLeft size={19} aria-hidden /></Link>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="hero-grid" dir="ltr">
          {['', '', 'ح', '', '', 'ق', 'ا', 'ر', 'و', 'أ', '', '', 'و', '', '', '', '', 'ف', '', ''].map((letter, index) =>
            <span key={index} className={letter ? 'hero-tile' : ''}>{letter}</span>,
          )}
        </div>
        <Star className="hero-star" size={28} aria-hidden />
      </div>
    </section>

    <section id="levels" aria-labelledby="levels-heading" className="levels">
      <h2 id="levels-heading">اختر مستوى</h2>
      <div className="level-list">
        {levels.map((level, index) => {
          const Icon = levelIcons[index]
          const progress = save[level.id] ?? newProgress()
          const complete = progress.solved.length === level.entries.length
          return <Link to={`/level/${level.id}`} key={level.id} className="level-card">
            <span className={`level-icon tone-${index}`}><Icon size={25} aria-hidden /></span>
            <span className="level-caption">
              <span className="level-meta">المستوى {number.format(index + 1)}</span>
              <strong>{level.title}</strong>
              <span className="level-subtitle">{level.subtitle}</span>
            </span>
            <span className="level-end">{complete ? <Stars count={starsFor(progress.hints)} /> : <ChevronLeft size={22} aria-hidden />}</span>
          </Link>
        })}
      </div>
    </section>
    <footer className="footer">يُحفظ تقدّمك تلقائيًا على هذا الجهاز.</footer>
  </main>
}

function Board({ level, progress }: { level: Level; progress: Progress }) {
  const [selectedId, select] = useState<string | null>(null)
  const board = [...makeBoard(level).values()]
  const minX = Math.min(...board.map(({ x }) => x))
  const minY = Math.min(...board.map(({ y }) => y))
  const columns = Math.max(...board.map(({ x }) => x)) - minX + 1
  const complete = progress.solved.length === level.entries.length
  const selected = level.entries.find(({ id }) => id === selectedId)
    ?? level.entries.find(({ id }) => !progress.solved.includes(id)) ?? level.entries[0]
  const played = progress.solved.includes(selected.id)

  return <main className="game-page" id="main">
    <Link to="/" className="back"><ArrowRight size={18} aria-hidden /> المستويات</Link>
    <div className="page-title">
      <div><p className="level-meta">المستوى {number.format(levels.indexOf(level) + 1)}</p><h1>{level.title}</h1></div>
      <span className="counter"><Grid2X2 size={18} aria-hidden /> {number.format(progress.solved.length)} من {number.format(level.entries.length)}</span>
    </div>
    <div className="board-layout">
      <section className="board-card" aria-label="شبكة الكلمات">
        <div className="board" dir="ltr" style={{ '--columns': columns } as CSSProperties}>
          {board.map(({ x, y, entries, letter }) => {
            const solved = entries.some(({ id }) => progress.solved.includes(id))
            const active = entries.some(({ id }) => id === selected.id)
            const start = entries.find((entry) => entry.x === x && entry.y === y)
            return <button
              type="button"
              key={`${x},${y}`}
              className={`cell${active ? ' active' : ''}${solved ? ' solved' : ''}`}
              style={{ gridColumn: x - minX + 1, gridRow: y - minY + 1 }}
              aria-label={solved ? `الحرف ${letter}` : `خانة ${number.format(y + 1)}، ${number.format(x + 1)}`}
              aria-pressed={active}
              onClick={() => {
                const index = entries.findIndex(({ id }) => selected.id === id)
                select(entries[(index + 1) % entries.length].id)
              }}
            >{start && <small>{number.format(level.entries.indexOf(start) + 1)}</small>}{solved && letter}</button>
          })}
        </div>
      </section>
      <section className="clue-list" aria-labelledby="clues-heading">
        <h2 id="clues-heading">التلميحات</h2>
        {level.entries.map((entry, index) => (
          <button type="button" className="clue-row" key={entry.id}
            aria-pressed={entry.id === selected.id} onClick={() => select(entry.id)}>
            <span className="clue-number">{number.format(index + 1)}</span>
            <span><strong>{entry.clue.kind === 'picture' ? 'خمّن الصورة' : 'أكمل العبارة'}</strong>
              <small>{entry.direction === 'across' ? 'أفقي' : 'عمودي'} · {number.format(entry.answer.length)} حروف</small></span>
            {progress.solved.includes(entry.id) ? <Check size={20} aria-label="تم الحل" /> : <ChevronLeft size={18} aria-hidden />}
          </button>
        ))}
        {complete
          ? <Link className="primary" to={`/level/${level.id}/result`}>عرض النتيجة <ArrowLeft size={18} aria-hidden /></Link>
          : <Link className="primary" to={`/level/${level.id}/clue/${selected.id}`}>{played ? 'عرض الكلمة' : 'حلّ الكلمة'} <ArrowLeft size={18} aria-hidden /></Link>}
      </section>
    </div>
  </main>
}

function Clue({ level, entry, progress, update }: { level: Level; entry: Entry; progress: Progress; update: (progress: Progress) => void }) {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')
  const solved = progress.solved.includes(entry.id)
  const attempt = getAttempt(entry, progress)
  const bank = makeBank(entry)
  const letters = cellsFor(entry).map(({ letter }) => letter)
  const locked = crossingLetters(level, entry, progress).map((letter, index) =>
    solved || attempt.revealed.includes(index) ? letters[index] : letter,
  )
  const tiles = attempt.tiles.map((id, index) => locked[index] ? null : id)
  const answer = tiles.map((id, index) => locked[index] ?? bank.find((tile) => tile.id === id)?.letter ?? '')
  const empty = answer.indexOf('')
  const revealIndex = answer.findIndex((letter, index) => !locked[index] && letter !== letters[index])
  const distractor = bank.find((tile) => tile.distractor && !tiles.includes(tile.id) && !attempt.removed.includes(tile.id))
  const boardPath = `/level/${level.id}`

  function saveAttempt(next: typeof attempt, hintCost = 0) {
    update({
      ...progress,
      attempts: { ...progress.attempts, [entry.id]: next },
      credits: progress.credits - hintCost,
      hints: progress.hints + (hintCost > 0 ? 1 : 0),
    })
    setFeedback('')
  }

  function selectTile(id: string) {
    if (solved || empty < 0 || tiles.includes(id) || attempt.removed.includes(id)) return
    saveAttempt({ ...attempt, tiles: tiles.map((value, index) => index === empty ? id : value) })
  }

  function clearTile(index: number) {
    if (locked[index] || index < 0 || !tiles[index]) return
    saveAttempt({ ...attempt, tiles: tiles.map((value, slot) => index === slot ? null : value) })
  }

  function reveal() {
    if (progress.credits < 2 || revealIndex < 0 || solved) return
    saveAttempt({
      ...attempt,
      revealed: [...attempt.revealed, revealIndex],
      tiles: tiles.map((value, index) => index === revealIndex ? null : value),
    }, 2)
  }

  function remove() {
    if (progress.credits < 1 || !distractor || solved) return
    saveAttempt({ ...attempt, removed: [...attempt.removed, distractor.id], tiles }, 1)
  }

  function submit() {
    if (empty >= 0 || solved) return
    if (normalize(answer.join('')) !== normalize(entry.answer)) {
      setFeedback('الإجابة غير صحيحة. جرّب ترتيبًا آخر.')
      return
    }
    const next = [...progress.solved, entry.id]
    update({ ...progress, solved: next })
    navigate(next.length === level.entries.length ? `${boardPath}/result` : boardPath)
  }

  function handleKey(event: KeyboardEvent<HTMLElement>) {
    if (event.ctrlKey || event.altKey || event.metaKey || solved) return
    if (event.key === 'Backspace') {
      event.preventDefault()
      clearTile(tiles.findLastIndex(Boolean))
      return
    }
    if (event.key === 'Enter' && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault()
      submit()
      return
    }
    const tile = bank.find(({ id, letter }) => event.key === letter && !tiles.includes(id) && !attempt.removed.includes(id))
    if (tile) {
      event.preventDefault()
      selectTile(tile.id)
    }
  }

  return <main className="game-page clue-page" id="main" onKeyDown={handleKey}>
    <Link className="back" to={boardPath}><ArrowRight size={18} aria-hidden /> شبكة الكلمات</Link>
    <div className="page-title">
      <div><p className="level-meta">{level.title} · الكلمة {number.format(level.entries.indexOf(entry) + 1)}</p>
        <h1>{entry.clue.kind === 'picture' ? 'خمّن الصورة' : 'أكمل العبارة'}</h1></div>
      <span className="counter" aria-label={`رصيد التلميحات ${number.format(progress.credits)}`}><Coins size={19} aria-hidden /> {number.format(progress.credits)}</span>
    </div>

    <section className={`prompt-card ${entry.clue.kind}`} aria-label="التلميح">
      {entry.clue.kind === 'picture' ? <img src={entry.clue.image} alt={entry.prompt} /> : <p>{entry.prompt}</p>}
    </section>

    <div className="answer-slots" aria-label="خانات الإجابة">
      {answer.map((letter, index) => <button type="button" key={index}
        disabled={!!locked[index] || !letter}
        className={`answer-slot${locked[index] ? ' locked' : ''}${!solved && empty === index ? ' next' : ''}`}
        aria-label={letter ? `الخانة ${number.format(index + 1)}: ${letter}` : `الخانة ${number.format(index + 1)} فارغة`}
        onClick={() => clearTile(index)}>{letter}</button>)}
    </div>

    {solved ? <p className="solved-message"><Check size={19} aria-hidden /> أحسنت، تم حل هذه الكلمة.</p> : <>
      <div className="letter-bank" aria-label="الحروف المتاحة">
        {bank.map(({ id, letter }) => {
          const hidden = tiles.includes(id) || attempt.removed.includes(id)
          return <button type="button" key={id} disabled={hidden || empty < 0}
            className={hidden ? 'used' : ''} onClick={() => selectTile(id)}>{hidden ? '' : letter}</button>
        })}
      </div>
      <div className="hints">
        <button type="button" disabled={progress.credits < 2 || revealIndex < 0} onClick={reveal}><Lightbulb size={19} aria-hidden /> اكشف حرفًا <span>٢</span></button>
        <button type="button" disabled={progress.credits < 1 || !distractor} onClick={remove}><Eraser size={19} aria-hidden /> احذف حرفًا <span>١</span></button>
      </div>
      <p role="status" className="feedback">{feedback}</p>
      <button type="button" className="primary submit" disabled={empty >= 0} onClick={submit}>تحقّق من الإجابة <Check size={19} aria-hidden /></button>
    </>}
  </main>
}

function Result({ level, progress }: { level: Level; progress: Progress }) {
  const next = levels[levels.indexOf(level) + 1]
  return <main className="game-page" id="main">
    <Link className="back" to={`/level/${level.id}`}><ArrowRight size={18} aria-hidden /> شبكة الكلمات</Link>
    <section className="result">
      <span className="result-icon"><Trophy size={37} aria-hidden /></span>
      <h1>أحسنت!</h1>
      <p>أكملت مستوى «{level.title}».</p>
      <Stars count={starsFor(progress.hints)} />
      <Link className="primary" to={next ? `/level/${next.id}` : '/'}>{next ? 'المستوى التالي' : 'العودة للمستويات'} <ArrowLeft size={18} aria-hidden /></Link>
      <Link className="back" to={`/level/${level.id}`}><RotateCcw size={16} aria-hidden /> راجع الحل</Link>
    </section>
  </main>
}

function LevelRoute({ save, update, view }: { save: Save; update: (id: string, progress: Progress) => void; view: 'board' | 'clue' | 'result' }) {
  const { levelId, entryId } = useParams()
  const level = levels.find(({ id }) => id === levelId)
  if (!level) return <Navigate to="/" replace />
  const progress = save[level.id] ?? newProgress()
  const board = `/level/${level.id}`
  if (view === 'result') return progress.solved.length === level.entries.length
    ? <Result level={level} progress={progress} /> : <Navigate to={board} replace />
  if (view === 'clue') {
    const entry = level.entries.find(({ id }) => id === entryId)
    return entry ? <Clue key={`${level.id}/${entry.id}`} level={level} entry={entry} progress={progress} update={(next) => update(level.id, next)} />
      : <Navigate to={board} replace />
  }
  return <Board key={level.id} level={level} progress={progress} />
}

export default function App() {
  const [save, setSave] = useState<Save>(() => {
    try { return readSave(localStorage, levels) } catch { return {} }
  })
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(save)) } catch { /* Play continues for this session. */ }
  }, [save])
  const update = (id: string, progress: Progress) => setSave((previous) => ({ ...previous, [id]: progress }))
  return <HashRouter>
    <Header />
    <Routes>
      <Route path="/" element={<Home save={save} />} />
      <Route path="/level/:levelId" element={<LevelRoute save={save} update={update} view="board" />} />
      <Route path="/level/:levelId/clue/:entryId" element={<LevelRoute save={save} update={update} view="clue" />} />
      <Route path="/level/:levelId/result" element={<LevelRoute save={save} update={update} view="result" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </HashRouter>
}
