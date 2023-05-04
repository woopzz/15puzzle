(()=>{var m="0123456789ABCDEF",c="F",a=class{constructor(e,t=[]){this.state=e,this.path=t,this.blankTileIndex=e.indexOf(c)}canBeMoved(e){return e<0||e>15?!1:e-4===this.blankTileIndex||e+4===this.blankTileIndex||e-1===this.blankTileIndex&&e%4!==0||e+1===this.blankTileIndex&&e%4!==3}move(e){let t=this.blankTileIndex<e?this.blankTileIndex:e,s=this.blankTileIndex>e?this.blankTileIndex:e;return new a(this.state.slice(0,t)+this.state[s]+this.state.slice(t+1,s)+this.state[t]+this.state.slice(s+1),[...this.path,e])}};function b(n){return n.state===m}function g(n){let e=L(n)&1,t=M(n)&1;return!!(e^t)}function L(n){let e=n.state.indexOf(c);return 4-Math.floor(e/4)}function M(n){let e=0;for(let t=0;t<n.state.length-1;t++)for(let s=t+1;s<n.state.length;s++)n.state[t]!==c&&n.state[s]!==c&&n.state[t]>n.state[s]&&e++;return e}var T=class{constructor(e){this.board=e}execute(){for(;this.shuffle(),!(g(this.board)&&!b(this.board)););return this.board}shuffle(){let e=Array.from(this.board.state);for(let t=e.length-1;t>0;t--){let s=Math.floor(Math.random()*t),o=e[t];e[t]=e[s],e[s]=o}this.board=new a(e.join(""))}};var v=class{constructor(){this.queue=new Map}insert(e,t){this.queue.has(t)?this.queue.get(t).push(e):this.queue.set(t,[e])}extractMin(){this.throwErrorIfEmpty();let e=this.findSmallestPriority(),t=this.queue.get(e),s=t[0];return t.length===1?this.queue.delete(e):t.shift(),s}throwErrorIfEmpty(){if(this.queue.size===0)throw new Error("The queue is empty.")}findSmallestPriority(){let e=1/0;return this.queue.forEach(function(t,s){s<e&&(e=s)}),e}};var x=class{constructor(){this.state=new Array(16).fill(!1)}locked(e){return this.state[e]}lock(e){this.state[e]=!0}unlock(e){this.state[e]=!1}};var B=n=>n.blankTileIndex-4,w=n=>n.blankTileIndex-1,k=n=>n.blankTileIndex+4,y=n=>n.blankTileIndex+1;function d(n,e){return e.filter(t=>n.state.indexOf(t)!==m.indexOf(t)).length===0}var I=class{constructor(e){this.initialBoard=new a(e.state),this.lockedTiles=new x}execute(){let e=this.initialBoard;return d(e,["0"])||(e=this.bfs(e,new f("0",0))),this.lockedTiles.lock(0),d(e,["1"])||(e=this.bfs(e,new f("1",1))),this.lockedTiles.lock(1),d(e,["4"])||(e=this.bfs(e,new f("4",4))),this.lockedTiles.lock(4),d(e,["5"])||(e=this.bfs(e,new f("5",5))),this.lockedTiles.lock(5),d(e,["2","3"])||(e=this.bfs(e,new p([["2",3],["3",10],[c,6]])),e=this.applyFormula(e)),this.lockedTiles.lock(2),this.lockedTiles.lock(3),d(e,["6","7"])||(e=this.bfs(e,new p([["6",7],["7",14],[c,10]])),e=this.applyFormula(e)),this.lockedTiles.lock(6),this.lockedTiles.lock(7),d(e,["8","9","A","B","C","D","E","F"])||(e=this.bfs(e,new p([["8",8],["9",9],["A",10],["B",11],["C",12],["D",13],["E",14],["F",15]]))),e}bfs(e,t){let s=new v;s.insert(e,t.calcHeuristic(e));let o=new Set,i;for(;;)if(i=s.extractMin(),!o.has(i.state)){if(t.solved(i))break;for(let r of[B(i),w(i),k(i),y(i)])if(i.canBeMoved(r)&&!this.lockedTiles.locked(r)){let l=i.move(r);o.has(l.state)||s.insert(l,t.calcHeuristic(l))}o.add(i.state)}return i}applyFormula(e){return e=e.move(k(e)),e=e.move(y(e)),e=e.move(B(e)),e=e.move(B(e)),e=e.move(w(e)),e=e.move(k(e)),e=e.move(y(e)),e=e.move(B(e)),e=e.move(w(e)),e=e.move(k(e)),e}},f=class{constructor(e,t){this.tile=e,this.destIndex=t}solved(e){return e.state[this.destIndex]===this.tile}calcHeuristic(e){return this.calcManhattanDistance(e)+e.path.length}calcManhattanDistance(e){let t=e.state.indexOf(c),s=e.state.indexOf(this.tile),o=u(s),i=h(s),r,l;return D(s,t)||this.tile==c?(r=u(this.destIndex),l=h(this.destIndex)):(r=u(t),l=h(t)),Math.abs(o-r)+Math.abs(i-l)}},p=class{constructor(e){this.listOfTileAndDestIndex=e}solved(e){return this.listOfTileAndDestIndex.every(t=>e.state[t[1]]===t[0])}calcHeuristic(e){return this.calcManhattanDistance(e)+e.path.length}calcManhattanDistance(e){let t=0;for(let s of this.listOfTileAndDestIndex){let o=e.state.indexOf(s[0]),i=u(o),r=h(o),l=u(s[1]),O=h(s[1]);t+=Math.abs(i-l)+Math.abs(r-O)}return t}};function D(n,e){let t=u(n),s=h(n),o=u(e),i=h(e);return Math.abs(t-o)==1&&s===i||Math.abs(s-i)==1&&t===o}function u(n){return Math.floor(n/4)}function h(n){return n%4}var S=new Map([["1","0"],["2","1"],["3","2"],["4","3"],["5","4"],["6","5"],["7","6"],["8","7"],["9","8"],["10","9"],["11","A"],["12","B"],["13","C"],["14","D"],["15","E"],["0","F"]]),R=new Map([["0","1"],["1","2"],["2","3"],["3","4"],["4","5"],["5","6"],["6","7"],["7","8"],["8","9"],["9","10"],["A","11"],["B","12"],["C","13"],["D","14"],["E","15"],["F","0"]]);function q(n,e){let t=document.querySelector(".field"),s=document.querySelector(".won-msg"),o=t.children;for(let i=0;i<n.state.length;i++){let r=o[i];r.dataset.number=R.get(n.state[i]),r.style.backgroundColor=""}if(e.length){let i=o[e.at(-1)];i.style.backgroundColor="#bbb"}s.style.display=b(n)?"block":"none"}var E=()=>new T(new a(m,[])).execute();function A(){let n=E(),e=[],t=()=>q(n,e);document.querySelector(".field").addEventListener("click",function(s){let o=s.target;if(!o.classList.contains("box"))return;let i=S.get(o.dataset.number);if(i===void 0)return;let r=n.state.indexOf(i);n.canBeMoved(r)&&(n=n.move(r)),e.length&&(n.path.length&&n.path.at(-1)===e.at(-1)?e.pop():e=[]),t()}),document.querySelector(".hint").addEventListener("click",function(){e=new I(n).execute().path.reverse(),t()}),document.querySelector(".shuffle").addEventListener("click",function(){n=E(),e=[],t()}),t()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",A):A();})();
