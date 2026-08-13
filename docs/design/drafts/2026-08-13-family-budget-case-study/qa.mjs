import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
const file=resolve('docs/design/drafts/2026-08-13-family-budget-case-study/family-budget-before-after-report.html');
const out=resolve('docs/design/drafts/2026-08-13-family-budget-case-study/qa'); await mkdir(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
for (const [name,width,height] of [['desktop',1440,1100],['mobile',390,844],['narrow200',360,844]]) {
 const page=await browser.newPage({viewport:{width,height}}); const errors=[]; page.on('console',m=>{if(m.type()==='error')errors.push(m.text())}); page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(file).href); await page.waitForLoadState('load'); if(name==='narrow200') await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 const r=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).length,badAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.querySelector(a.getAttribute('href'))).length,targets:[...document.querySelectorAll('a,button')].map(e=>({text:e.textContent.trim(),w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height})).filter(x=>x.w<44||x.h<44),first:document.body.innerText.slice(0,600)}));
 await page.screenshot({path:`${out}/${name}.png`,fullPage:true}); console.log(name,JSON.stringify({...r,errors})); await page.close();
}
await browser.close();
