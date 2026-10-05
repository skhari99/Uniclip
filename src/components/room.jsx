export default function Room({sessionCode,setActive,handleDelete,handleSync,clips}){
  const formatTime = (time) => time ? new Date(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) : "";
    return(
        <>
                <div className="flex justify-between items-center gap-20 bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <span className="text-white-400 font-semibold text-xl">Room Code</span><span className="text-2xl font-sans font-bold text-emerald-400 tracking-wider"> {sessionCode}</span>
                </div>
                <div>
                  <button onClick={(e) => { setActive(false) }} className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold rounded-xl transition-all">
                    Leave
                  </button>
                </div>
                <div >
                  <button className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all" onClick={handleSync}>Sync Clipboard</button>
                </div>
                <div className="border-t border-slate-700 pt-4">
                  <h2 className="text-lg font-semibold text-slate-200 mb-3">Clipboard History</h2>
                  <div className="flex flex-col gap-10 bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-500 text-center text-sm">
                    <div className='flex flex-col gap-10' >{clips.map((clip) => {
                      return <div key={clip.id} className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-xl border-0 flex flex-col items-center"><span className='flex flex-row gap-8 items-center '>
                        <span className="text-slate-100 font-mono text-sm  text-left w-full bg-slate-950/40 p-3 rounded-lg border border-slate-800">{clip.content}</span>
                        <button className="w-full py-2.5 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-semibold rounded-xl transition-all" onClick={() => navigator.clipboard.writeText(clip.content)}>Copy</button>

                        <button className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold rounded-xl transition-all" onClick={() => { handleDelete(clip.id) }}>Delete</button>

                      </span>{/*add gap*/}
                        <div className='flex flex-row gap-10'>
                          <span>User: {clip.user_name}</span>
                          <span>Time: {formatTime(clip.time)}</span>
                        </div>

                      </div>
                    })}</div>
                  </div>
                </div>
        </>
    )
}
