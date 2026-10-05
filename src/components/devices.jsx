export default function Devices({devices}){
    return(
        <div className="flex flex-col gap-5 bg-slate-900 border border-slate-700 rounded-xl p-6 text-white-500 text-center text-sm">
            <h1>Devices</h1>
            <ul>
                {devices && devices.map((device)=>{return (<li key={device.id}>{device.user_name}</li>)})}
            </ul>
        </div>
    )
}