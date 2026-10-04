const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const p=await b.newPage({viewport:{width:794,height:1123},deviceScaleFactor:2});
await p.goto('file://'+__dirname+'/cover.html');await p.waitForTimeout(800);
await p.screenshot({path:'capa-cardapio-balerion.png'});
await p.pdf({path:'capa-cardapio-balerion.pdf',width:'794px',height:'1123px',printBackground:true});
await b.close()})();
