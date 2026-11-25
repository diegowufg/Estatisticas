(function(){
  var $=function(s){return document.querySelector(s)};
  var clamp=function(x,a,b){return Math.min(b,Math.max(a,x))};
  function num(id,d){var v=parseFloat(document.getElementById(id).value);return isNaN(v)?d:v}
  function fmt(x,a,b){return x.toLocaleString('pt-BR',{minimumFractionDigits:a,maximumFractionDigits:b==null?a:b})}
  function pr(x){return fmt(x,4)}
  function set(id,t){document.getElementById(id).textContent=t}

  var logF=[0];for(var i=1;i<=1100;i++)logF[i]=logF[i-1]+Math.log(i);
  function binP(n,p,k){if(k<0||k>n)return 0;if(p<=0)return k===0?1:0;if(p>=1)return k===n?1:0;
    return Math.exp(logF[n]-logF[k]-logF[n-k]+k*Math.log(p)+(n-k)*Math.log(1-p))}
  function poiP(l,k){if(k<0)return 0;if(l<=0)return k===0?1:0;return Math.exp(-l+k*Math.log(l)-logF[k])}
  function erf(x){var s=x<0?-1:1;x=Math.abs(x);var t=1/(1+0.3275911*x);
    var y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return s*y}
  function Phi(z){return 0.5*(1+erf(z/Math.SQRT2))}

  /* gráfico de barras com pontos e curva opcionais */
  function bars(svg,vals,o){
    o=o||{};var W=640,H=o.h||260,L=o.noY?12:48,R=12,T=14,B=32,n=vals.length;
    var all=vals.concat(o.dots||[],o.curve||[]);var max=Math.max.apply(null,all)*1.12||1;
    var bw=(W-L-R)/n,ph=H-T-B,s='';
    function y(v){return T+ph*(1-v/max)}
    if(!o.noY){for(var g=0;g<=4;g++){var gv=max*g/4,gy=y(gv);
      s+='<line class="ax" x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'"/><text class="tx" x="'+(L-6)+'" y="'+(gy+4)+'" text-anchor="end">'+fmt(gv,2)+'</text>'}}
    else{s+='<line class="ax" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(0)+'" y2="'+y(0)+'"/>'}
    var step=Math.max(1,Math.ceil(n/14));
    for(var i=0;i<n;i++){var x=L+i*bw+bw*0.14,h=ph*vals[i]/max;
      s+='<rect class="b'+(o.hi&&o.hi(i)?' hi':'')+'" x="'+x.toFixed(2)+'" y="'+y(vals[i]).toFixed(2)+'" width="'+(bw*0.72).toFixed(2)+'" height="'+Math.max(h,0).toFixed(2)+'"/>';
      if(i%step===0)s+='<text class="tx" x="'+(x+bw*0.36).toFixed(2)+'" y="'+(H-12)+'" text-anchor="middle">'+i+'</text>'}
    if(o.curve){var pts=o.curve.map(function(v,i){return (L+i*bw+bw*0.5).toFixed(2)+','+y(v).toFixed(2)}).join(' ');
      s+='<polyline class="curve" points="'+pts+'"/>'}
    if(o.dots){for(var j=0;j<o.dots.length;j++)s+='<circle class="dot" r="3.6" cx="'+(L+j*bw+bw*0.5).toFixed(2)+'" cy="'+y(o.dots[j]).toFixed(2)+'"/>'}
    svg.setAttribute('viewBox','0 0 '+W+' '+H);svg.innerHTML=s}

  /* hero */
  function hero(){var n=20,p=.4,v=[],c=[],m=n*p,sd=Math.sqrt(n*p*(1-p));
    for(var k=0;k<=n;k++){v.push(binP(n,p,k));c.push(Math.exp(-Math.pow(k-m,2)/(2*sd*sd))/(sd*Math.sqrt(2*Math.PI)))}
    bars($('#hero-chart'),v,{curve:c,noY:true,h:230,hi:function(i){return i===8}})}

  /* variáveis */
  function variaveis(){
    var p=[0,1,2,3].map(function(i){return clamp(num('v-p'+i,0),0,1)});
    var sum=0,e=0,e2=0;p.forEach(function(q,x){sum+=q;e+=x*q;e2+=x*x*q});
    var v=e2-e*e,okSum=Math.abs(sum-1)<1e-6;
    set('v-sum',fmt(sum,2,4));set('v-e',fmt(e,2,4));set('v-e2',fmt(e2,2,4));set('v-var',fmt(v,2,4));set('v-sd',fmt(Math.sqrt(Math.max(v,0)),2,4));
    var m=$('#v-msg');m.innerHTML=okSum?'<span class="ok">Função de probabilidade válida:</span> as probabilidades somam 1.':'<span class="bad">Soma diferente de 1:</span> ajuste os valores até totalizarem 1 para que seja uma função de probabilidade.';
    var a=num('v-a',2),b=num('v-b',3);set('v-ey',fmt(a*e+b,2,4));set('v-vy',fmt(a*a*v,2,4))}

  /* binomial */
  function binomial(){
    var n=Math.round(clamp(num('b-n',12),1,200)),p=clamp(num('b-p',.35),0,1),k=Math.round(clamp(num('b-k',4),0,n)),vals=[],le=0,ge=0;
    for(var i=0;i<=n;i++)vals.push(binP(n,p,i));
    for(i=0;i<=k;i++)le+=vals[i];for(i=k;i<=n;i++)ge+=vals[i];
    set('b-eq',pr(vals[k]));set('b-le',pr(Math.min(le,1)));set('b-ge',pr(Math.min(ge,1)));
    set('b-mean',fmt(n*p,2,4));set('b-var',fmt(n*p*(1-p),2,4));
    bars($('#b-chart'),vals,{hi:function(i){return i<=k}})}

  /* poisson */
  function poisson(){
    var l=clamp(num('l-l',4),0.1,50),k=Math.round(clamp(num('l-k',6),0,100)),
        m=Math.min(120,Math.ceil(l+5*Math.sqrt(l)+6)),vals=[],le=0,lt=0;
    for(var i=0;i<m;i++)vals.push(poiP(l,i));
    for(i=0;i<=k;i++){le+=poiP(l,i);if(i<k)lt+=poiP(l,i)}
    set('l-eq',pr(poiP(l,k)));set('l-le',pr(Math.min(le,1)));set('l-ge',pr(Math.max(0,1-lt)));set('l-mean',fmt(l,2,4));
    bars($('#l-chart'),vals,{hi:function(i){return i<=k}})}

  /* aproximação */
  function aprox(){
    var n=Math.round(clamp(num('a-n',100),1,1000)),p=clamp(num('a-p',.03),0.001,0.999),l=n*p;
    var kmax=Math.min(n,Math.max(6,Math.ceil(l+4*Math.sqrt(l)+2))),b=[],q=[],rows='';
    for(var k=0;k<=kmax;k++){b.push(binP(n,p,k));q.push(poiP(l,k))}
    var md=0,top=Math.min(n,1000);for(k=0;k<=top;k++){md=Math.max(md,Math.abs(binP(n,p,k)-poiP(l,k)))}
    b.forEach(function(v,i){rows+='<tr><td>'+i+'</td><td>'+fmt(v,5)+'</td><td>'+fmt(q[i],5)+'</td><td>'+fmt(Math.abs(v-q[i]),5)+'</td></tr>'});
    $('#a-tbody').innerHTML=rows;
    set('a-lam',fmt(l,2,4));set('a-diff',fmt(md,5));
    var ok=n>=50&&p<=0.1;
    $('#a-msg').innerHTML=ok?'<span class="ok">Dentro dos critérios</span> (n ≥ 50 e p ≤ 0,1): a diferença entre os modelos é pequena.':'<span class="bad">Fora dos critérios</span> (n ≥ 50 e p ≤ 0,1): repare que as barras e os círculos se afastam mais.';
    bars($('#a-chart'),b,{dots:q})}

  /* normal */
  function normal(){
    var mu=num('n-m',170),sd=Math.max(0.01,num('n-s',10)),a=num('n-a',160),b=num('n-b',185);
    if(a>b){var t=a;a=b;b=t}
    var za=(a-mu)/sd,zb=(b-mu)/sd;
    set('n-za',fmt(za,2));set('n-zb',fmt(zb,2));set('n-p',fmt(Phi(zb)-Phi(za),4));set('n-r',fmt(1-Phi(zb),4));
    var W=640,H=250,L=14,R=14,T=14,B=34,lo=mu-4*sd,hi=mu+4*sd,ymax=1/(sd*Math.sqrt(2*Math.PI))*1.12;
    function sx(x){return L+(x-lo)/(hi-lo)*(W-L-R)}
    function sy(v){return H-B-v/ymax*(H-B-T)}
    function f(x){return Math.exp(-Math.pow(x-mu,2)/(2*sd*sd))/(sd*Math.sqrt(2*Math.PI))}
    var d='',i,N=160;for(i=0;i<=N;i++){var x=lo+(hi-lo)*i/N;d+=(i?'L':'M')+sx(x).toFixed(1)+' '+sy(f(x)).toFixed(1)}
    var xa=Math.max(a,lo),xb=Math.min(b,hi),sh='';
    if(xa<xb){sh='M'+sx(xa).toFixed(1)+' '+sy(0);for(i=0;i<=60;i++){var xx=xa+(xb-xa)*i/60;sh+='L'+sx(xx).toFixed(1)+' '+sy(f(xx)).toFixed(1)}sh+='L'+sx(xb).toFixed(1)+' '+sy(0)+'Z'}
    var s='<line class="ax" x1="'+L+'" x2="'+(W-R)+'" y1="'+sy(0)+'" y2="'+sy(0)+'"/>';
    if(sh)s+='<path class="shade" d="'+sh+'"/>';
    s+='<path class="curve" d="'+d+'"/><line class="mu" x1="'+sx(mu)+'" x2="'+sx(mu)+'" y1="'+T+'" y2="'+sy(0)+'"/>';
    for(var j=-3;j<=3;j++){var tx=mu+j*sd;s+='<text class="tx" x="'+sx(tx)+'" y="'+(H-12)+'" text-anchor="middle">'+fmt(tx,0,1)+'</text>'}
    $('#n-chart').setAttribute('viewBox','0 0 '+W+' '+H);$('#n-chart').innerHTML=s}

  /* mapa mental */
  function mapa(){
    var cx=450,cy=350,rb=160,rl=300,s='';
    var br=[
      {r:'variaveis',a:-90,t:['Variáveis aleatórias','discretas'],l:['função p(x)','E(X) e Var(X)','propr. lineares']},
      {r:'binomial',a:-18,t:['Distribuição','binomial'],l:['n tentativas','P(X ≤ k)','E = np']},
      {r:'aproximacao',a:54,t:['Aproximação','binomial → Poisson'],l:['n grande, p pequeno','λ = n·p','usa a Poisson']},
      {r:'poisson',a:126,t:['Distribuição','de Poisson'],l:['taxa por intervalo','E = Var = λ','ajuste de λ']},
      {r:'normal',a:198,t:['Distribuição','normal'],l:['Z = (X−μ)/σ','tabela Z','área sob a curva']}];
    function pt(a,r){var q=a*Math.PI/180;return [cx+r*Math.cos(q),cy+r*Math.sin(q)]}
    br.forEach(function(b){b.p=pt(b.a,rb)});
    br.forEach(function(b){s+='<line class="edge" x1="'+cx+'" y1="'+cy+'" x2="'+b.p[0]+'" y2="'+b.p[1]+'"/>';
      [-20,0,20].forEach(function(o,i){var lp=pt(b.a+o,rl);s+='<line class="edge" x1="'+b.p[0]+'" y1="'+b.p[1]+'" x2="'+lp[0]+'" y2="'+lp[1]+'"/>'})});
    function rel(i,j){var A=br[i].p,B=br[j].p,mx=(A[0]+B[0])/2,my=(A[1]+B[1])/2,dx=mx-cx,dy=my-cy,k=0.35;
      return '<path class="rel" d="M'+A[0]+' '+A[1]+' Q'+(mx+dx*k)+' '+(my+dy*k)+' '+B[0]+' '+B[1]+'"/>'}
    s+=rel(2,1)+rel(2,3);
    br.forEach(function(b){[-20,0,20].forEach(function(o,i){var lp=pt(b.a+o,rl),t=b.l[i],w=t.length*7+22;
      s+='<g class="leaf"><rect x="'+(lp[0]-w/2)+'" y="'+(lp[1]-14)+'" width="'+w+'" height="28" rx="14"/><text x="'+lp[0]+'" y="'+(lp[1]+4)+'">'+t+'</text></g>'})});
    br.forEach(function(b){s+='<a href="'+b.r+'.html" class="br"><rect x="'+(b.p[0]-80)+'" y="'+(b.p[1]-25)+'" width="160" height="50" rx="8"/><text x="'+b.p[0]+'" y="'+(b.p[1]-3)+'">'+b.t[0]+'</text><text x="'+b.p[0]+'" y="'+(b.p[1]+15)+'">'+b.t[1]+'</text></a>'});
    s+='<g class="core"><ellipse cx="'+cx+'" cy="'+cy+'" rx="92" ry="38"/><text x="'+cx+'" y="'+(cy-3)+'">Modelos de</text><text x="'+cx+'" y="'+(cy+16)+'">probabilidade</text></g>';
    $('#mm').innerHTML=s}

  function all(){if($('#v-p0'))variaveis();if($('#b-n'))binomial();if($('#l-l'))poisson();if($('#a-n'))aprox();if($('#n-m'))normal()}
  document.querySelectorAll('.lab input').forEach(function(el){el.addEventListener('input',all)});

  if($('#hero-chart'))hero();if($('#mm'))mapa();all();

})();
