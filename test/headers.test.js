const puppeteer =require('puppeteer');
test('Add two numbers',()=>{    
const sum =1+2;
expect(sum).toEqual(3);
})

test('We can launch a browser',async ()=>{
    const browser =await puppeteer.launch({
        headless:false
    })
    const newPage = await browser.newPage();
})