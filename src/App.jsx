
import { useEffect, useState } from 'react'
import { supabase } from './supabase';
import './App.css'

function App() {
  const [active,setActive]=useState(false);
  const [inputCode,setInputCode]=useState("");
  const [sessionCode,setSessionCode]=useState("");

  const [clips,setClips]=useState([]);
  const [tempName,setTempName]=useState("");
  const [userName,setUserName]=useState("Guest");


  const handleName=(e)=>{
    e.preventDefault();
    if(tempName.trim()!=""){
      setUserName(tempName);
    }
  }
  const handleSync=async()=>{
    try{
      const copyText=await navigator.clipboard.readText();
      if(!copyText.trim()){
        alert("Clipboard empty")
        return;
      }
      console.log("read text from clipboard:",copyText);
      const {error}= await supabase.from('clips').insert([{roomCode:sessionCode, content:copyText, device:userName}]);//insert to the db
      if(error){
        console.error("Error inserting clip",error);
        alert("Failed to sync");
      }
    }catch(err){
      console.error("Error reading from clipboard");
      alert("Failed to read clipboard");
    }
  }
  //handle duplicate codes by checking database

  const checkRoomExist=async(code)=>{
    const {data,error}= await supabase.from('clips').select('roomCode').eq('roomCode',code).limit(1);
    if(error){
      console.error("Error finding Session Code",error);
      throw new Error("Error finding Session code");
    }
    return data.length>0;
  }
  
  const handleCreateSession=async(e)=>{ //create session room
    try{
      let code="";
      let check=true;
      while(check){
        code=String(Math.floor(Math.random()*10000)).padStart(4,"0");
        check=await checkRoomExist(code);
      }
      if(!check){
        setSessionCode(code);
        const {error}= await supabase.from('clips').insert([{roomCode:code}]);//insert to the db.setSession is an asynchronous task. so use code itself
        if(error){
          throw new Error(error);                                  //bug: an empty slot appears while creating room. it is caused by the empty content field which gets pushed into database while creating a room
        }
        setActive(true);
      }

    }catch(error){
      alert("Failed to create session.");
      console.error("Error: ",error);
    }
    
  }

  const handleJoinButton=async(e)=>{
    e.preventDefault();
    setInputCode(inputCode.trim());
    if(inputCode.length!=4){
      alert("Enter a valid code");
      return;
    }
    //accept code and do the logic
    try {
      const check=await checkRoomExist(inputCode);
      if(check){
        setSessionCode(inputCode);
        setActive(true);//only if the code exists
      }
      else{
        alert("Room does not exist");
        console.log("invaid room code");
      }
    } catch (error) {
      alert("Failed to join session.");
      console.error("Error: ",error);
    }
    
  }
  const handleDelete=async(id)=>{
    const {error}=await supabase.from('clips').delete().eq('id',id);
    if(error){
      console.error("Error deleting the clip",error);
      alert("Failed to delete");
    }
    console.log("deleted");
  }
  useEffect(()=>{
    if(!active){
      return;
    }

    //load the existing syncs 
    const loadExistingSyncs= async()=>{
      const {data,error}=await supabase.from('clips').select('*').eq('roomCode',sessionCode).order('time',{ascending:false});
      if(error){
        console.error("Error loading",error)
      }
      else if(!error && data){
        console.log(clips);
        setClips(data);
      }
    };
    loadExistingSyncs();
    //set up real time channel
    const channel=  supabase.channel(`room-${sessionCode}`)
    .on(
      'postgres_changes',
      {
        event:'INSERT', schema:'public',table:'clips',filter:`roomCode=eq.${sessionCode}`, 
      },
      (payload)=> {
        console.log(payload.new);
        setClips((prevClips)=>[payload.new,...prevClips])}//newly inserted entry accessed using .new, .old if deleted
    )
    .on(
      'postgres_changes',
      {
        event:'DELETE',schema:'public',table:'clips',
      },
      (payload)=>{
        console.log("Delete on the way")//remove the console.log
        setClips((prevClips)=>prevClips.filter((clip)=>clip.id!==payload.old.id))
      } 
    )
    .subscribe((status,error)=>{
      if(status === 'SUBSCRIBED'){
        console.log(' Real-time channel connected!');
      }
      if (status === 'CHANNEL_ERROR') {
        console.error(' Real-time channel error:',error);
      }
      if (status === 'TIMED_OUT') {
      console.warn(' Real-time connection timed out.');
    }

    });
    
    return ()=>{
      supabase.removeChannel(channel);//clean up function. runs when 
    }

  },[active,sessionCode]);
 

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 ">
    <h1 className="text-3xl font-extrabold text-center text-white mb-8 tracking-wide">UniClip</h1>
    <div className="flex flex-col gap-10 bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-500 text-center text-sm">
    <div className='m-20'>
      <form className='flex flex-row gap-5 md:gap-10' onSubmit={handleName}>
        <input className="flex-grow bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
        type="text" 
        value={tempName} 
        placeholder='Enter name' 
        onChange={(e)=>setTempName(e.target.value)} >
        </input>
        {/* <button type="submit" className="py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400">Submit</button> */}
      </form>
      </div>
    <div className="dashboard">
        {(!active)? 
        (<div className="flex flex-col items-center gap-6">
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
            
        </div>):(
        <div className="flex flex-col gap-5 w-full">
          <div className="flex justify-between items-center gap-20 bg-slate-900 border border-slate-700 rounded-xl p-4">
            <span className="text-slate-400 font-medium">Room Code</span><span className="text-2xl font-mono font-bold text-emerald-400 tracking-wider"> {sessionCode}</span>
          </div>
          <div>
            <button onClick={(e)=>{setActive(false)}} className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold rounded-xl transition-all">
              {/* manage leaving */}
              Leave
            </button>
          </div>
          <div >
            <button className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl shadow-lg transition-all" onClick={handleSync}>Sync Clipboard</button>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <h2 className="text-lg font-semibold text-slate-200 mb-3">Clipboard History</h2>
            <div className="flex flex-col gap-10 bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-500 text-center text-sm"> 
                  {clips.length>0 ? (<div className='flex flex-col gap-10' >{clips.map((clip)=>{
                    return <div key={clip.id} className="bg-white/15 backdrop-blur-md rounded-2xl p-6 shadow-xl border-0 flex flex-col items-center"><span className='flex flex-row gap-8 items-center '>
                      <span className="text-slate-100 font-mono text-sm  text-left w-full bg-slate-950/40 p-3 rounded-lg border border-slate-800">{clip.content}</span>
                      <button className="w-full py-2.5 px-4 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 font-semibold rounded-xl transition-all" onClick={()=>navigator.clipboard.writeText(clip.content)}>Copy</button>
                      
                      <button className="w-full py-2.5 px-4 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 font-semibold rounded-xl transition-all" onClick={()=>{handleDelete(clip.id)}}>Delete</button>
                      
                      </span>{/*add gap*/}
                      <div className='flex flex-row gap-10'>
                        <span>User: {clip.device}</span>
                        <span>Time: {clip.time}</span>
                      </div>

                    </div>
                  })}</div>):
                  (<div>Empty</div>)
                }
            </div>
          </div>

        </div>
        ) 
        }
      </div>
    </div>
    <div className="flex flex-col gap-10 bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-500 text-center text-sm">
        <h1>Devices</h1>

    </div>
    </div>
  )
  
}

export default App
