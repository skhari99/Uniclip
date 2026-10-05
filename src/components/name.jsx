
export default function Name({tempName,setTempName}){
    return(
     <div className='m-20'>
        <input className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        type="text" 
        value={tempName} 
        placeholder='Enter name' 
        onChange={(e)=>setTempName(e.target.value)} />
      </div>
    );
}