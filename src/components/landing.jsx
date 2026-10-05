export default function Landing({active,handleCreateSession,handleJoinButton,inputCode,setInputCode}){
    return(
        <div className="flex flex-col items-center gap-6">
          <button value={active} 
            onClick={handleCreateSession}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400" >
            Create Session
          </button>
          <span className="px-3 text-xs uppercase tracking-widest text-slate-400 font-medium">OR Join Session</span>
          <form className="flex flex-row items-center gap-4" onSubmit={handleJoinButton}>
            <input type="text" 
              placeholder="Enter code" 
              value={inputCode} 
              className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              maxLength={4} 
              onChange={(e)=>{setInputCode(e.target.value)}}/>
            <button type="submit" className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">Join</button>
          </form>
        </div>
    );
}