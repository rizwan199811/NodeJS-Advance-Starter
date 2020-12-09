const puppeteer =require('puppeteer');
let browser,newPage;
beforeEach(async()=>{
     browser =await puppeteer.launch({
        headless:false
    })
    newPage = await browser.newPage();
    await newPage.goto('localhost:3000')
})

afterEach(async()=>{
    await browser.close();
})
test('We can launch a browser',async ()=>{
    const text =await newPage.$eval('a.brand-logo',el=>el.innerHTML)
    expect(text).toEqual('Blogster');
})

test('clicking login starts oauth flow',async ()=>{
    await newPage.click('.right a');
    const url =await newPage.url();
    console.log(url);
})