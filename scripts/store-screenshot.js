import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

// Adds a presentation outside the unchanged, running extension UI.
export async function storeScreenshot(page,name,title,description) {
  if (!process.env.STORE_ASSETS) return;
  const viewport = page.viewportSize();
  const directory = resolve('store/assets');
  mkdirSync(directory,{recursive:true});
  await page.setViewportSize({width:1280,height:800});
  const style = await page.addStyleTag({content:`
    html{background:#e8f1f5}body.popup{margin:100px 80px 100px 760px;
    box-shadow:0 24px 70px #18334426;border-radius:14px;overflow:hidden}
    #store-caption{position:fixed;left:80px;top:185px;width:580px;color:#183344;
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    #store-caption .label{font-size:15px;letter-spacing:normal;color:#155e75;font-weight:400}
    #store-caption h2{font-size:64px;line-height:1.06;letter-spacing:-3px;margin:26px 0}
    #store-caption p{font-size:23px;line-height:1.6;max-width:500px;color:#526b7c}
    #store-caption small{display:block;margin-top:48px;font-size:14px;color:#526b7c}
  `});
  try {
    await page.evaluate(({title,description}) => {
      const panel=document.createElement('aside');panel.id='store-caption';
      const label=document.createElement('div');label.className='label';label.textContent='PublicIPTV';
      const heading=document.createElement('h2');heading.textContent=title;
      const copy=document.createElement('p');copy.textContent=description;
      const note=document.createElement('small');note.textContent='Actual extension UI · Local demo streams';
      panel.append(label,heading,copy,note);document.body.append(panel);
    },{title,description});
    await page.screenshot({path:resolve(directory,`${name}.png`)});
  } finally {
    await page.locator('#store-caption').evaluate(el=>el.remove());
    await style.evaluate(el=>el.remove());
    await page.setViewportSize(viewport);
  }
}
