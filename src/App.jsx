import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowUpRight, Check, ChevronDown, Factory, Gauge, LayoutDashboard, Maximize2, MonitorPlay, Plus, Save, Settings2, ShieldCheck, Trash2, Wrench, X } from 'lucide-react'

const seedLines = [
  { id: 'L-01', name: 'Assembly 01', part: 'AX-4407', target: 42, status: 'Running', shift: 'A', color: 'mint' },
  { id: 'L-02', name: 'Assembly 02', part: 'AX-4412', target: 36, status: 'Running', shift: 'A', color: 'blue' },
  { id: 'L-03', name: 'Final Test', part: 'FT-9018', target: 28, status: 'Changeover', shift: 'A', color: 'amber' },
  { id: 'L-04', name: 'Pack-out', part: 'PK-2204', target: 50, status: 'Running', shift: 'A', color: 'coral' },
]
const seedOutput = { 'L-01': [40, 44, 42, 38, 46, 41, 43, 39], 'L-02': [34, 36, 33, 38, 35, 37, 31, 0], 'L-03': [27, 29, 25, 0, 0, 0, 0, 0], 'L-04': [49, 52, 48, 51, 50, 47, 53, 0] }
const defaultCopy = { brand: 'FORGEBOARD', overviewTitle: 'Production overview', lineControl: 'Line control', floorTitle: 'Today on the floor', operatorNav: 'Record output', engineerNav: 'Engineer setup', adminNav: 'Admin wording', recordTitle: 'Record hourly output', recordHint: 'Enter the total pieces made in each hour.', saveButton: 'Save hour', targetLabel: 'Target UPH', liveLabel: 'Live floor data' }

function App() {
  const [lines, setLines] = useState(() => JSON.parse(localStorage.getItem('forge-lines') || 'null') || seedLines)
  const [output, setOutput] = useState(() => JSON.parse(localStorage.getItem('forge-output') || 'null') || seedOutput)
  const [selectedLine, setSelectedLine] = useState('L-01')
  const [screen, setScreen] = useState('overview')
  const [popup, setPopup] = useState(null)
  const [copy, setCopy] = useState(() => JSON.parse(localStorage.getItem('forge-copy') || 'null') || defaultCopy)
  const [showForm, setShowForm] = useState(false)
  const [kiosk, setKiosk] = useState(() => new URLSearchParams(window.location.search).get('kiosk') === '1')

  useEffect(() => localStorage.setItem('forge-lines', JSON.stringify(lines)), [lines])
  useEffect(() => localStorage.setItem('forge-output', JSON.stringify(output)), [output])
  useEffect(() => localStorage.setItem('forge-copy', JSON.stringify(copy)), [copy])

  const activeLine = lines.find((line) => line.id === selectedLine) || lines[0]
  const totals = useMemo(() => lines.reduce((sum, line) => sum + output[line.id].reduce((a, b) => a + b, 0), 0), [lines, output])
  const targetTotal = useMemo(() => lines.reduce((sum, line) => sum + line.target * 8, 0), [lines])
  const attainment = Math.round((totals / targetTotal) * 100)
  const activeOutput = output[activeLine.id]
  const activeAverage = activeOutput.filter(Boolean).length ? Math.round(activeOutput.reduce((a, b) => a + b, 0) / activeOutput.filter(Boolean).length) : 0

  function updateHour(hour, value) {
    const next = [...output[selectedLine]]
    next[hour] = Math.max(0, Number(value) || 0)
    setOutput({ ...output, [selectedLine]: next })
  }

  function addLine(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const line = { id: `L-${String(lines.length + 1).padStart(2, '0')}`, name: form.get('name'), part: form.get('part'), target: Number(form.get('target')), status: 'Running', shift: 'A', color: 'mint' }
    setLines([...lines, line])
    setOutput({ ...output, [line.id]: Array(8).fill(0) })
    setSelectedLine(line.id)
    setShowForm(false)
    event.currentTarget.reset()
  }

  function removeLine(id) {
    if (lines.length === 1) return
    const nextLines = lines.filter((line) => line.id !== id)
    const nextOutput = { ...output }
    delete nextOutput[id]
    setLines(nextLines)
    setOutput(nextOutput)
    setSelectedLine(nextLines[0].id)
  }

  function openRecord(lineId = selectedLine, role = 'operator') {
    setSelectedLine(lineId)
    setPopup(role)
  }

  function updateCopy(key, value) {
    setCopy({ ...copy, [key]: value })
  }

  function enterKiosk() {
    setKiosk(true)
    window.history.replaceState({}, '', `${window.location.pathname}?kiosk=1`)
    document.documentElement.requestFullscreen?.().catch(() => {})
  }

  function exitKiosk() {
    setKiosk(false)
    window.history.replaceState({}, '', window.location.pathname)
    document.exitFullscreen?.().catch(() => {})
  }

  if (kiosk) {
    return <div className="kiosk-shell">
      <header className="kiosk-header"><div className="kiosk-brand"><span className="brand-mark"><Factory size={22} /></span><strong>{copy.brand}</strong><span className="kiosk-divider" /> <span>Plant 04 · Shift A</span></div><div className="kiosk-live"><span className="pulse" /> {copy.liveLabel} <button className="kiosk-exit" onClick={exitKiosk} title="Exit kiosk display"><Maximize2 size={16} /></button></div></header>
      <section className="kiosk-summary"><div><p className="eyebrow light">Current shift output</p><strong>{totals.toLocaleString()} <small>units</small></strong><span><ArrowUpRight size={16} /> 6.8% above yesterday's pace</span></div><div className="kiosk-attainment"><strong>{attainment}%</strong><span>attainment</span></div><div className="kiosk-stat"><span>Active lines</span><strong>{lines.filter((line) => line.status === 'Running').length}<small> / {lines.length}</small></strong></div><div className="kiosk-stat"><span>Shift elapsed</span><strong>06:42</strong></div></section>
      <div className="kiosk-heading"><div><p className="eyebrow">{copy.lineControl}</p><h1>{copy.floorTitle}</h1></div><span>Tap the top-right icon to leave display mode</span></div>
      <section className="kiosk-grid">{lines.map((line) => { const current = output[line.id][7] || output[line.id][6]; const percentage = Math.min(100, Math.round((current / line.target) * 100)); return <article className="kiosk-line" key={line.id}><div className="kiosk-line-top"><div><span className={`kiosk-line-icon ${line.color}`}><Gauge size={22} /></span><div><strong>{line.name}</strong><small>{line.id} · {line.part}</small></div></div><span className={`state ${line.status === 'Running' ? 'running' : 'changeover'}`}><span />{line.status}</span></div><div className="kiosk-value"><strong>{current}</strong><span>/ {line.target} UPH</span><b>{percentage}%</b></div><div className="kiosk-progress"><span style={{ width: `${percentage}%` }} /></div><div className="kiosk-line-bottom"><span>Current hour</span><span>{copy.targetLabel} <b>{line.target} UPH</b></span></div></article> })}</section>
      <footer><span>{copy.brand} Operations OS</span><span>Read-only display · Updates live from operator entries</span></footer>
    </div>
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Factory size={19} /></span><span>{copy.brand}</span></div>
        <div className="site-select"><span className="status-dot" /> Plant 04 <ChevronDown size={14} /></div>
        <nav>
          <button className={`nav-item ${screen === 'overview' && !popup ? 'active' : ''}`} onClick={() => { setScreen('overview'); setPopup(null) }}><LayoutDashboard size={17} /> Overview</button>
          <button className="nav-item" onClick={() => openRecord()}><MonitorPlay size={17} /> {copy.operatorNav}</button>
          <button className={`nav-item ${screen === 'setup' ? 'active' : ''}`} onClick={() => { setScreen('setup'); setPopup(null) }}><Settings2 size={17} /> {copy.engineerNav}</button>
          <button className="nav-item" onClick={() => setPopup('admin')}><ShieldCheck size={17} /> {copy.adminNav}</button>
        </nav>
        <div className="sidebar-foot"><div className="sync"><span className="status-dot" /> All systems synced</div><div className="user"><span className="avatar">MS</span><div><strong>Mina Sato</strong><small>Shift supervisor</small></div><ChevronDown size={14} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div><p className="eyebrow">Thursday · 20 August 2026 · Shift A</p><h1>{screen === 'overview' ? copy.overviewTitle : copy.engineerNav}</h1></div><div className="top-actions"><div className="live-pill"><span className="pulse" /> {copy.liveLabel}</div>{screen === 'overview' && <button className="kiosk-button" onClick={enterKiosk}><Maximize2 size={16} /> TV display</button>}<button className="icon-button" title="Admin wording" onClick={() => setPopup('admin')}><Wrench size={18} /></button></div></header>

        <section className="hero-strip"><div><p className="eyebrow light">Current shift performance</p><div className="hero-number">{totals.toLocaleString()} <span>units</span></div><p className="hero-caption"><ArrowUpRight size={15} /> 6.8% above yesterday's pace</p></div><div className="hero-ring"><div><strong>{attainment}%</strong><span>attainment</span></div></div><div className="hero-meta"><div><span>Shift elapsed</span><strong>06<span>:</span>42</strong></div><div><span>Active lines</span><strong>{lines.filter((line) => line.status === 'Running').length}<small> / {lines.length}</small></strong></div></div></section>

        {screen === 'overview' && <div className="section-heading"><div><p className="eyebrow">{copy.lineControl}</p><h2>{copy.floorTitle}</h2></div><button className="primary-button" onClick={() => openRecord()}><MonitorPlay size={17} /> {copy.operatorNav}</button></div>}

        {screen === 'overview' ? <section className="line-grid">{lines.map((line) => { const current = output[line.id][7] || output[line.id][6]; const percentage = Math.min(100, Math.round((current / line.target) * 100)); return <button className={`line-card ${selectedLine === line.id ? 'chosen' : ''}`} key={line.id} onClick={() => openRecord(line.id)}><div className="line-card-top"><span className={`line-icon ${line.color}`}><Gauge size={18} /></span><span className={`state ${line.status === 'Running' ? 'running' : 'changeover'}`}><span />{line.status}</span></div><div className="line-title"><strong>{line.name}</strong><span>{line.id}</span></div><div className="line-part">Part <b>{line.part}</b><span>{copy.targetLabel} <b>{line.target} UPH</b></span></div><div className="progress"><span style={{ width: `${percentage}%` }} /></div><div className="line-footer"><span><strong>{current}</strong> / {line.target} this hour</span><span>{percentage}%</span></div><em>Tap to record</em></button> })}</section> : <section className="engineer-panel"><div className="panel-heading"><div><p className="eyebrow">Configuration</p><h2>UPH targets by line</h2></div><div className="panel-actions"><button className="primary-button" onClick={() => openRecord(selectedLine, 'engineer')}><MonitorPlay size={17} /> Open engineer entry</button><button className="secondary-button" onClick={() => setShowForm(true)}><Plus size={17} /> Add line</button></div></div><p className="panel-intro">Set the expected units per hour for each part number. Open engineer entry to review hourly output with target context.</p><div className="target-table"><div className="table-head"><span>Line</span><span>Part number</span><span>Target UPH</span><span>Status</span><span /></div>{lines.map((line) => <div className="table-row" key={line.id}><div><strong>{line.name}</strong><small>{line.id}</small></div><div className="part-code">{line.part}</div><div className="target-input"><input type="number" value={line.target} onChange={(event) => setLines(lines.map((item) => item.id === line.id ? { ...item, target: Math.max(1, Number(event.target.value) || 1) } : item))} /><span>units/hr</span></div><div><span className={`state ${line.status === 'Running' ? 'running' : 'changeover'}`}><span />{line.status}</span></div><button className="delete-button" title="Remove line" onClick={() => removeLine(line.id)}><Trash2 size={16} /></button></div>)}</div></section>}
        <footer><span>Forgeboard Operations OS</span><span>Last updated just now · Data stored locally</span></footer>
      </main>
      {popup && <div className="modal-backdrop" onMouseDown={() => setPopup(null)}><div className={`modal ${popup === 'admin' ? 'admin-modal' : 'record-modal'}`} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setPopup(null)}><X size={18} /></button>{popup === 'admin' ? <><p className="eyebrow">Administrator</p><h2>Customize page wording</h2><p className="modal-intro">Change the labels operators and supervisors see. Updates are saved on this device.</p><div className="copy-fields">{Object.entries({ brand: 'Brand name', overviewTitle: 'Overview title', lineControl: 'Section label', floorTitle: 'Floor heading', operatorNav: 'Operator button', engineerNav: 'Engineer button', adminNav: 'Admin button', recordTitle: 'Recording title', recordHint: 'Recording helper text', saveButton: 'Save button', targetLabel: 'Target label', liveLabel: 'Live status label' }).map(([key, label]) => <label key={key}>{label}<input value={copy[key]} onChange={(event) => updateCopy(key, event.target.value)} /></label>)}</div><button className="save-button" onClick={() => setPopup(null)}><Save size={17} /> Save wording</button></> : <><p className="eyebrow">{popup === 'engineer' ? 'Engineer entry' : 'Operator entry'}</p><h2>{copy.recordTitle}</h2><p className="modal-intro">{copy.recordHint}</p><div className="record-line-select"><span>Production line</span><select value={selectedLine} onChange={(event) => setSelectedLine(event.target.value)}>{lines.map((line) => <option value={line.id} key={line.id}>{line.name} · {line.part}</option>)}</select></div><div className="record-current"><div><span>Current hour</span><strong>{String(13).padStart(2, '0')}:00</strong></div><label>Pieces made<input type="number" min="0" value={activeOutput[7]} onChange={(event) => updateHour(7, event.target.value)} /></label><div><span>{copy.targetLabel}</span><strong>{activeLine.target} <small>UPH</small></strong></div></div><div className="quick-keypad">{[0, 1, 2, 3, 4, 5].map((number) => <button key={number} onClick={() => updateHour(7, Number(activeOutput[7]) + number * 5)}>{number * 5}</button>)}</div><button className="save-button" onClick={() => setPopup(null)}><Check size={17} /> {copy.saveButton}</button></>}</div></div>}
      {showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onSubmit={addLine} onMouseDown={(event) => event.stopPropagation()}><button type="button" className="modal-close" onClick={() => setShowForm(false)}><X size={18} /></button><p className="eyebrow">New production line</p><h2>Set a new target</h2><label>Line name<input required name="name" placeholder="e.g. Assembly 05" /></label><label>Part number<input required name="part" placeholder="e.g. AX-4407" /></label><label>UPH target<input required name="target" type="number" min="1" placeholder="42" /></label><button className="save-button" type="submit"><Check size={17} /> Add line</button></form></div>}
    </div>
  )
}

export default App
