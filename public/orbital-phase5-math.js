(()=>{
'use strict';
const MU_EARTH=398600.4418;
const R_EARTH=6378.137;
const J2_EARTH=1.08262668e-3;
const DAY=86400;
const DEG=Math.PI/180;
const G0=9.80665;
const dot=(a,b)=>a.reduce((sum,x,i)=>sum+x*b[i],0);
const sub=(a,b)=>a.map((x,i)=>x-b[i]);
const add=(a,b)=>a.map((x,i)=>x+b[i]);
const scale=(a,s)=>a.map(x=>x*s);
const norm=a=>Math.hypot(...a);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const clamp=(x,a=-1,b=1)=>Math.max(a,Math.min(b,x));

function invert3(matrix){
  const [a,b,c]=matrix[0],[d,e,f]=matrix[1],[g,h,i]=matrix[2];
  const A=e*i-f*h,B=-(d*i-f*g),C=d*h-e*g;
  const D=-(b*i-c*h),E=a*i-c*g,F=-(a*h-b*g);
  const G=b*f-c*e,H=-(a*f-c*d),I=a*e-b*d;
  const determinant=a*A+b*B+c*C;
  if(!Number.isFinite(determinant)||Math.abs(determinant)<1e-18)throw new Error('هندسه اندازه‌گیری برای برآورد سه‌بعدی کافی نیست.');
  return [[A,D,G],[B,E,H],[C,F,I]].map(row=>row.map(x=>x/determinant));
}
function matVec(matrix,vector){return matrix.map(row=>dot(row,vector))}

const DEFAULT_OD_STATIONS=[
  [6378.137,0,0],
  [0,6378.137,0],
  [-4510.024,4510.024,0],
  [0,-5523.629,3189.069],
  [-3189.069,-3189.069,4510.024]
];
const DEFAULT_OD_TRUE_POSITION=[7000,1200,1300];
const DEFAULT_OD_NOISE=[0.12,-0.08,0.05,-0.11,0.03];

function orbitDetermination(config={}){
  const stations=(config.stations||DEFAULT_OD_STATIONS).map(row=>row.map(Number));
  const truePosition=(config.truePosition||DEFAULT_OD_TRUE_POSITION).map(Number);
  const injectedNoise=(config.injectedNoise||DEFAULT_OD_NOISE).map(Number);
  const initial=(config.initial||[6800,1000,1100]).map(Number);
  const sigma=Number(config.sigma??0.2);
  const maxIterations=Math.max(2,Math.min(20,Math.trunc(config.maxIterations??10)));
  if(stations.length<4||stations.some(row=>row.length!==3||row.some(x=>!Number.isFinite(x))))throw new Error('حداقل چهار ایستگاه سه‌بعدی معتبر لازم است.');
  if(truePosition.length!==3||initial.length!==3||![...truePosition,...initial].every(Number.isFinite))throw new Error('بردارهای موقعیت باید سه مولفه عددی داشته باشند.');
  if(!(sigma>0))throw new Error('انحراف معیار Range باید مثبت باشد.');
  const observations=stations.map((station,index)=>norm(sub(truePosition,station))+(injectedNoise[index]||0));
  let estimate=[...initial],covariance=null,normal=null;
  const history=[];
  for(let iteration=0;iteration<maxIterations;iteration++){
    normal=Array.from({length:3},()=>[0,0,0]);
    const rhs=[0,0,0],residuals=[];
    stations.forEach((station,index)=>{
      const delta=sub(estimate,station),predicted=norm(delta);
      if(!(predicted>0))throw new Error('موقعیت تخمینی روی ایستگاه قرار گرفته و مشتق Range تعریف نمی‌شود.');
      const h=scale(delta,1/predicted),residual=observations[index]-predicted,weight=1/(sigma*sigma);
      residuals.push(residual);
      for(let row=0;row<3;row++){
        rhs[row]+=h[row]*weight*residual;
        for(let col=0;col<3;col++)normal[row][col]+=h[row]*weight*h[col];
      }
    });
    const inverse=invert3(normal),correction=matVec(inverse,rhs);
    estimate=add(estimate,correction);
    history.push({iteration,estimate:[...estimate],correction:[...correction],correctionNorm:Math.hypot(...correction),rmsBefore:Math.sqrt(residuals.reduce((sum,x)=>sum+x*x,0)/residuals.length)});
    covariance=inverse;
    if(Math.hypot(...correction)<1e-9)break;
  }
  const residuals=stations.map((station,index)=>observations[index]-norm(sub(estimate,station)));
  const rms=Math.sqrt(residuals.reduce((sum,x)=>sum+x*x,0)/residuals.length);
  const weightedRms=Math.sqrt(residuals.reduce((sum,x)=>sum+(x/sigma)**2,0)/residuals.length);
  const error=sub(estimate,truePosition);
  return{
    stations,observations,truePosition,initial,estimate,error,errorNorm:norm(error),residuals,rms,weightedRms,
    covariance,sigmaPosition:covariance.map((row,index)=>Math.sqrt(Math.max(0,row[index]))),history,
    degreesOfFreedom:Math.max(0,observations.length-3),model:'simultaneous-range snapshot WLS'
  };
}

function stumpff(z){
  if(Math.abs(z)<1e-8){
    const z2=z*z,z3=z2*z;
    return{C:1/2-z/24+z2/720-z3/40320,S:1/6-z/120+z2/5040-z3/362880};
  }
  if(z>0){const root=Math.sqrt(z);return{C:(1-Math.cos(root))/z,S:(root-Math.sin(root))/(root**3)}}
  const root=Math.sqrt(-z);return{C:(Math.cosh(root)-1)/(-z),S:(Math.sinh(root)-root)/(root**3)};
}

function solveLambert(config={}){
  const r1=(config.r1||[]).map(Number),r2=(config.r2||[]).map(Number),time=Number(config.time),mu=Number(config.mu??MU_EARTH);
  const prograde=config.prograde!==false;
  if(r1.length!==3||r2.length!==3||![...r1,...r2].every(Number.isFinite))throw new Error('هر بردار موقعیت باید سه مولفه عددی داشته باشد.');
  if(!(time>0)||!(mu>0))throw new Error('زمان پرواز و پارامتر گرانشی باید مثبت باشند.');
  const r1mag=norm(r1),r2mag=norm(r2);
  if(!(r1mag>0&&r2mag>0))throw new Error('اندازه بردار موقعیت باید مثبت باشد.');
  const cosine=clamp(dot(r1,r2)/(r1mag*r2mag));
  let transferAngle=Math.acos(cosine);
  const crossZ=cross(r1,r2)[2];
  if(prograde&&crossZ<0)transferAngle=2*Math.PI-transferAngle;
  if(!prograde&&crossZ>=0)transferAngle=2*Math.PI-transferAngle;
  const oneMinusCos=1-Math.cos(transferAngle);
  if(oneMinusCos<1e-12||Math.abs(Math.sin(transferAngle))<1e-12)throw new Error('هندسه هم‌خط یا زاویه انتقال نزدیک صفر/۱۸۰ درجه با این حل‌گر آموزشی پشتیبانی نمی‌شود.');
  const A=Math.sin(transferAngle)*Math.sqrt(r1mag*r2mag/oneMinusCos);
  if(Math.abs(A)<1e-12)throw new Error('پارامتر هندسی Lambert نزدیک صفر است.');
  const evaluate=z=>{
    const {C,S}=stumpff(z);
    if(!(C>0))return null;
    const y=r1mag+r2mag+A*(z*S-1)/Math.sqrt(C);
    if(!(y>0))return null;
    const x=Math.sqrt(y/C);
    const tof=(x*x*x*S+A*Math.sqrt(y))/Math.sqrt(mu);
    if(!Number.isFinite(tof))return null;
    return{z,C,S,y,tof,residual:tof-time};
  };
  const zMin=-4*Math.PI*Math.PI,zMax=4*Math.PI*Math.PI-1e-7,samples=2400;
  let previous=null,bracket=null,best=null;
  for(let index=0;index<=samples;index++){
    const z=zMin+(zMax-zMin)*index/samples,current=evaluate(z);
    if(!current)continue;
    if(!best||Math.abs(current.residual)<Math.abs(best.residual))best=current;
    if(previous&&previous.residual*current.residual<=0){bracket=[previous,current];break}
    previous=current;
  }
  if(!bracket){
    if(best&&Math.abs(best.residual)<1e-7)bracket=[best,best];
    else throw new Error('برای این هندسه و زمان، ریشه صفر‌دور Lambert در بازه آموزشی پیدا نشد.');
  }
  let left=bracket[0],right=bracket[1],solution=best,iterations=0;
  if(left!==right){
    for(iterations=0;iterations<100;iterations++){
      const middle=evaluate((left.z+right.z)/2);
      if(!middle)throw new Error('حل Lambert وارد ناحیه نامعتبر شد.');
      solution=middle;
      if(Math.abs(middle.residual)<1e-10||Math.abs(right.z-left.z)<1e-13)break;
      if(left.residual*middle.residual<=0)right=middle;else left=middle;
    }
  }else solution=left;
  const f=1-solution.y/r1mag,g=A*Math.sqrt(solution.y/mu),gdot=1-solution.y/r2mag;
  if(Math.abs(g)<1e-12)throw new Error('ضریب g برای این هندسه نزدیک صفر است.');
  const v1=scale(sub(r2,scale(r1,f)),1/g);
  const v2=scale(sub(scale(r2,gdot),r1),1/g);
  const reconstructed=add(scale(r1,f),scale(v1,g));
  const boundaryResidual=norm(sub(reconstructed,r2));
  const energy=dot(v1,v1)/2-mu/r1mag;
  const h=cross(r1,v1),eVector=sub(scale(cross(v1,h),1/mu),scale(r1,1/r1mag)),eccentricity=norm(eVector);
  const semiMajor=Math.abs(energy)<1e-14?Infinity:-mu/(2*energy);
  return{r1,r2,time,mu,prograde,transferAngle:transferAngle/DEG,A,z:solution.z,y:solution.y,v1,v2,f,g,gdot,tof:solution.tof,timeResidual:solution.residual,boundaryResidual,iterations:iterations+1,energy,eccentricity,semiMajor};
}

function patchedConics(config={}){
  const muCentral=Number(config.muCentral??1.32712440018e11),r1=Number(config.r1??149597870.7),r2=Number(config.r2??227939200);
  const muDeparture=Number(config.muDeparture??MU_EARTH),radiusDeparture=Number(config.radiusDeparture??R_EARTH),parkingDeparture=Number(config.parkingDeparture??200);
  const muArrival=Number(config.muArrival??42828.375214),radiusArrival=Number(config.radiusArrival??3396.19),parkingArrival=Number(config.parkingArrival??250);
  const values=[muCentral,r1,r2,muDeparture,radiusDeparture,parkingDeparture,muArrival,radiusArrival,parkingArrival];
  if(values.some(x=>!Number.isFinite(x))||muCentral<=0||r1<=0||r2<=0||muDeparture<=0||muArrival<=0||radiusDeparture<=0||radiusArrival<=0||parkingDeparture<0||parkingArrival<0||Math.abs(r2-r1)<1e-9)throw new Error('پارامترهای مأموریت وصله مخروطی معتبر نیستند.');
  const transferA=(r1+r2)/2;
  const planetV1=Math.sqrt(muCentral/r1),planetV2=Math.sqrt(muCentral/r2);
  const transferV1=Math.sqrt(muCentral*(2/r1-1/transferA)),transferV2=Math.sqrt(muCentral*(2/r2-1/transferA));
  const vInfDeparture=Math.abs(transferV1-planetV1),vInfArrival=Math.abs(planetV2-transferV2),c3=vInfDeparture*vInfDeparture;
  const rpDeparture=radiusDeparture+parkingDeparture,rpArrival=radiusArrival+parkingArrival;
  const circularDeparture=Math.sqrt(muDeparture/rpDeparture),hyperbolicDeparture=Math.sqrt(vInfDeparture*vInfDeparture+2*muDeparture/rpDeparture),departureDv=hyperbolicDeparture-circularDeparture;
  const circularArrival=Math.sqrt(muArrival/rpArrival),hyperbolicArrival=Math.sqrt(vInfArrival*vInfArrival+2*muArrival/rpArrival),captureDv=Math.max(0,hyperbolicArrival-circularArrival);
  const transferTime=Math.PI*Math.sqrt(transferA**3/muCentral);
  const soiDeparture=r1*(muDeparture/muCentral)**(2/5),soiArrival=r2*(muArrival/muCentral)**(2/5);
  return{muCentral,r1,r2,transferA,planetV1,planetV2,transferV1,transferV2,vInfDeparture,vInfArrival,c3,rpDeparture,rpArrival,circularDeparture,hyperbolicDeparture,departureDv,circularArrival,hyperbolicArrival,captureDv,transferTime,soiDeparture,soiArrival};
}

function capstoneMission(config={}){
  const altitude=Number(config.altitude??550),eccentricity=Number(config.eccentricity??0.001),inclination=Number(config.inclination??97.6),missionYears=Number(config.missionYears??5);
  const dryMass=Number(config.dryMass??120),propellantMass=Number(config.propellantMass??12),isp=Number(config.isp??220),annualDv=Number(config.annualDv??12),disposalDv=Number(config.disposalDv??80),marginPercent=Number(config.marginPercent??20);
  if(![altitude,eccentricity,inclination,missionYears,dryMass,propellantMass,isp,annualDv,disposalDv,marginPercent].every(Number.isFinite)||altitude<=0||eccentricity<0||eccentricity>=1||inclination<0||inclination>180||missionYears<=0||dryMass<=0||propellantMass<0||isp<=0||annualDv<0||disposalDv<0||marginPercent<0)throw new Error('ورودی‌های پروژه جامع معتبر نیستند.');
  const a=R_EARTH+altitude,n=Math.sqrt(MU_EARTH/a**3),period=2*Math.PI/n,speed=Math.sqrt(MU_EARTH/a),p=a*(1-eccentricity*eccentricity);
  const raanRate=-1.5*J2_EARTH*n*(R_EARTH/p)**2*Math.cos(inclination*DEG)/DEG*DAY;
  const solarRate=360/365.2422,ssoError=Math.abs(raanRate-solarRate);
  const capacity=G0*isp*Math.log((dryMass+propellantMass)/dryMass);
  const nominalRequired=annualDv*missionYears+disposalDv,requiredWithMargin=nominalRequired*(1+marginPercent/100),remaining=capacity-requiredWithMargin;
  const criteria=[
    {id:'altitude',label:'ارتفاع در بازه متعارف مأموریت رصد زمین',passed:altitude>=400&&altitude<=900},
    {id:'geometry',label:'میل برای پوشش عرض‌های بالا مناسب است',passed:inclination>=90&&inclination<=105},
    {id:'sso',label:'نرخ J2 به هدف خورشیدآهنگ نزدیک است',passed:ssoError<=0.05},
    {id:'propellant',label:'ظرفیت Delta-v با حاشیه، عملیات و دفع را پوشش می‌دهد',passed:remaining>=0},
    {id:'disposal',label:'بودجه دفع پایان مأموریت صریح است',passed:disposalDv>0},
    {id:'lifetime',label:'مدت مأموریت و بودجه سالانه تعریف شده‌اند',passed:missionYears>0&&annualDv>=0},
    {id:'uncertainty',label:'حاشیه طراحی حداقل بیست درصد است',passed:marginPercent>=20}
  ];
  const passed=criteria.filter(item=>item.passed).length,score=Math.round(passed/criteria.length*100);
  return{altitude,eccentricity,inclination,missionYears,dryMass,propellantMass,isp,annualDv,disposalDv,marginPercent,a,n,period,speed,orbitsPerDay:DAY/period,raanRate,solarRate,ssoError,capacity,nominalRequired,requiredWithMargin,remaining,criteria,score,ready:score>=80&&remaining>=0};
}

window.MADAR_ORBIT_PHASE5_MATH={
  orbitDetermination,solveLambert,patchedConics,capstoneMission,stumpff,
  constants:{muEarth:MU_EARTH,earthRadius:R_EARTH,j2Earth:J2_EARTH,day:DAY,g0:G0},
  presets:{odStations:DEFAULT_OD_STATIONS,odTruePosition:DEFAULT_OD_TRUE_POSITION,odNoise:DEFAULT_OD_NOISE}
};
})();
