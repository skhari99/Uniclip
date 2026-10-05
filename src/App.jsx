
import { useEffect, useState } from 'react'
import { supabase } from './supabase';
import Name from './components/name'
import Landing from './components/landing';
import Room from './components/room';
import Devices from './components/devices';
import './App.css'

function App() {
  const [active, setActive] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const [sessionCode, setSessionCode] = useState("");

  const [clips, setClips] = useState([]);
  const [tempName, setTempName] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [devices, setDevices] = useState([]);


  const handleName = async (code) => {
    if (tempName.trim() != "") {
      setUserName(tempName);
      const { error } = await supabase.from('users').insert([{ room_code: code, user_name: tempName }]);
      if (error) {
        throw new Error("Error giving username.Try again");
      }
    }
  }
  const handleSync = async () => {
    try {
      const copyText = await navigator.clipboard.readText();
      if (!copyText.trim()) {
        alert("Clipboard empty")
        return;
      }
      console.log("read text from clipboard:", copyText);
      const { data, err } = await supabase.from('clips').select('content').eq('content', copyText);
      if (data.length > 0) {
        throw new Error("Already copied")
      }
      else if (err) {
        throw new Error("Error checking database");
      }
      const { error } = await supabase.from('clips').insert([{ room_code: sessionCode, content: copyText, user_name: userName }]);//insert to the db
      if (error) {
        console.error("Error inserting clip", error);
        alert("Failed to sync");
      }
    } catch (err) {
      console.error("Error reading from clipboard", err);
      alert("Failed to read clipboard" + err.message);
    }
  }
  //handle duplicate codes by checking database

  const checkRoomExist = async (code) => {
    const { data, error } = await supabase.from('rooms').select('room_code').eq('room_code', code);
    if (error) {
      console.error("Error finding Session Code", error);
      throw new Error("Error finding Session code");
    }
    return data.length > 0;
  }

  const handleCreateSession = async (e) => { //create session room
    try {
      let code = "";
      let check = true;
      while (check) {
        code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
        check = await checkRoomExist(code);
      }
      if (!check) {
        const { error } = await supabase.from('rooms').insert([{ room_code: code }]);//insert to the db.setSession is an asynchronous task. so use code itself
        if (error) {
          throw new Error(error);                                  //bug: an empty slot appears while creating room. it is caused by the empty content field which gets pushed into database while creating a room
        }
        await handleName(code);
        setSessionCode(code);
        setActive(true);
      }

    } catch (error) {
      alert("Failed to create session" + error.message);
      console.error("Error: ", error);
    }

  }

  const handleJoinButton = async (e) => {
    e.preventDefault();
    setInputCode(inputCode.trim());
    if (inputCode.length != 4) {
      alert("Enter a valid code");
      return;
    }
    //accept code and do the logic
    try {
      const check = await checkRoomExist(inputCode);
      if (check) {
        await handleName(inputCode);
        setSessionCode(inputCode);
        setActive(true);//only if the code exists
      }
      else {
        alert("Room does not exist");
        console.log("invaid room code");
      }
    } catch (error) {
      alert("Failed to join session." + error.message);
      console.error("Error: ", error);
    }

  }
  const handleDelete = async (id) => {
    const { error } = await supabase.from('clips').delete().eq('room-code',sessionCode).eq('id', id);
    if (error) {
      console.error("Error deleting the item", error);
      alert("Failed to delete");
    }
    else{
      console.log("deleted");
    }
  }
  useEffect(() => {
    if (!active) {
      return;
    }

    //load the existing syncs 
    const loadExistingSyncs = async () => {
      const { data, error } = await supabase.from('clips').select('*').eq('room_code', sessionCode).order('time', { ascending: false });
      if (error) {
        console.error("Error loading", error);
      }
      else if (!error && data) {
        console.log(clips);
        setClips(data);
      }
    };
    loadExistingSyncs();
    //set up real time channel
    const channel = supabase.channel(`room-${sessionCode}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT', schema: 'public', table: 'clips', filter: `room_code=eq.${sessionCode}`,
        },
        (payload) => {
          console.log(payload.new);
          setClips((prevClips) => [payload.new, ...prevClips])
        }//newly inserted entry accessed using .new, .old if deleted
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE', schema: 'public', table: 'clips',
        },
        (payload) => {
          console.log("Delete on the way")//remove the console.log
          setClips((prevClips) => prevClips.filter((clip) => clip.id !== payload.old.id))
        }
      )
      .subscribe((status, error) => {
        if (status === 'SUBSCRIBED') {
          console.log(' Real-time channel connected!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(' Real-time channel error:', error);
        }
        if (status === 'TIMED_OUT') {
          console.warn(' Real-time connection timed out.');
        }
      });


    return () => {
      supabase.removeChannel(channel);//clean up function
    }
  }, [active, sessionCode]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 ">
      <h1 className="text-3xl font-extrabold text-center text-white mb-8 tracking-wide">UniClip</h1>
      <div className="flex flex-col gap-10 bg-slate-900 border border-slate-700 rounded-xl p-6 text-slate-500 text-center text-sm">
        {!active ?
          (<Name tempName={tempName} setTempName={setTempName} />) :
          (<div>{userName}</div>)
        }
        <div className="dashboard">
          {(!active) ?
            (
              <Landing active={active} handleCreateSession={handleCreateSession} handleJoinButton={handleJoinButton} inputCode={inputCode} setInputCode={setInputCode} />
            ) : (
              <div className="flex flex-col gap-5 w-full">
                <Room sessionCode={sessionCode} setActive={setActive} handleDelete={handleDelete} handleSync={handleSync} clips={clips} />
                <Devices />
              </div>
            )
          }
        </div>
      </div>

    </div>
  )

}

export default App
