import { SessionEvent } from '../../store/events';

export function hoursByWeek(events: SessionEvent[]){
  const now = new Date();
  const days = Array.from({length:7}).map((_,i)=>0);
  for(const ev of events){
    if(!ev.endedAt) continue;
    const start = new Date(ev.startedAt);
    const end = new Date(ev.endedAt);
    const seconds = (end.getTime() - start.getTime())/1000;
    const dayIdx = Math.floor((now.getTime() - end.getTime())/(24*3600*1000));
    if(dayIdx>=0 && dayIdx<7) days[6-dayIdx] += seconds/3600;
  }
  return days;
}
