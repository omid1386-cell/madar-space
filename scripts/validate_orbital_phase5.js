'use strict';
global.window=global;
require('../public/orbital-phase5-math.js');
const M=global.MADAR_ORBIT_PHASE5_MATH;
const near=(actual,expected,tolerance,label)=>{if(!Number.isFinite(actual)||Math.abs(actual-expected)>tolerance)throw new Error(`${label}: ${actual} not within ${tolerance} of ${expected}`)};
const vectorNear=(actual,expected,tolerance,label)=>actual.forEach((value,index)=>near(value,expected[index],tolerance,`${label}[${index}]`));

const od=M.orbitDetermination({initial:[6800,1000,1100],sigma:.2});
vectorNear(od.estimate,[6999.984577771494,1200.0267559391061,1300.1402964046947],1e-8,'OD estimate');
near(od.rms,0.06644967622497226,1e-12,'OD residual RMS');
near(od.errorNorm,0.14365516551734459,1e-12,'OD position error');
if(od.history.length>7||od.history.at(-1).correctionNorm>1e-7)throw new Error('OD did not converge as expected');
if(od.degreesOfFreedom!==2)throw new Error('OD degrees of freedom mismatch');

const lambert=M.solveLambert({r1:[5000,10000,2100],r2:[-14600,2500,7000],time:3600,mu:398600.4418,prograde:true});
vectorNear(lambert.v1,[-5.9924950201,1.9253667142,3.2456380505],2e-9,'Lambert v1');
vectorNear(lambert.v2,[-3.3124585030,-4.1966190078,-0.3852890598],2e-9,'Lambert v2');
near(lambert.transferAngle,100.2925242073,1e-9,'Lambert transfer angle');
if(Math.abs(lambert.timeResidual)>1e-7||lambert.boundaryResidual>1e-9)throw new Error('Lambert residual acceptance failed');

const quarter=M.solveLambert({r1:[7000,0,0],r2:[0,8000,0],time:1800,mu:398600.4418,prograde:true});
near(quarter.transferAngle,90,1e-12,'Lambert quarter angle');
if(Math.abs(quarter.timeResidual)>1e-7)throw new Error('Lambert quarter-case time residual failed');

const mission=M.patchedConics({});
near(mission.transferTime/86400,258.865826767963,1e-9,'Earth-Mars transfer time');
near(mission.vInfDeparture,2.94469113284304,1e-12,'Departure v-infinity');
near(mission.c3,8.671205867844428,1e-12,'Earth departure C3');
near(mission.departureDv,3.611380743554264,1e-12,'Parking-orbit departure burn');
near(mission.vInfArrival,2.6488967223855973,1e-12,'Arrival v-infinity');
near(mission.captureDv,2.096222338116901,1e-12,'Ideal Mars capture burn');

const capstone=M.capstoneMission({});
near(capstone.period/60,95.64988025024664,1e-10,'Capstone period');
near(capstone.raanRate,0.9865584788994224,1e-12,'Capstone J2 RAAN rate');
near(capstone.capacity,205.62818645117827,1e-10,'Capstone delta-v capacity');
if(capstone.score!==100||!capstone.ready)throw new Error('Capstone reference design should pass all criteria');

const stumpff=M.stumpff(0);
near(stumpff.C,.5,1e-15,'Stumpff C(0)');
near(stumpff.S,1/6,1e-15,'Stumpff S(0)');

let rejected=0;
for(const run of [
  ()=>M.solveLambert({r1:[7000,0,0],r2:[-7000,0,0],time:3000,mu:398600.4418}),
  ()=>M.orbitDetermination({initial:[6800,1000,1100],sigma:0}),
  ()=>M.patchedConics({r1:1,r2:1}),
  ()=>M.capstoneMission({eccentricity:1.1})
]){try{run()}catch{rejected++}}
if(rejected!==4)throw new Error(`Invalid-input guards: expected 4 rejections, got ${rejected}`);

console.log(JSON.stringify({ok:true,od:{iterations:od.history.length,rms:od.rms,errorNorm:od.errorNorm},lambert:{v1:lambert.v1,v2:lambert.v2,timeResidual:lambert.timeResidual,boundaryResidual:lambert.boundaryResidual},patchedConics:{days:mission.transferTime/86400,vInfDeparture:mission.vInfDeparture,c3:mission.c3,departureDv:mission.departureDv,vInfArrival:mission.vInfArrival,captureDv:mission.captureDv},capstone:{periodMinutes:capstone.period/60,raanRate:capstone.raanRate,capacity:capstone.capacity,score:capstone.score},invalidGuards:rejected},null,2));
