import asyncio
from playwright import async_api

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:3002", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # Click on 'Code IDE' link to open the code editor.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/nav/div/div/div[2]/a[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Modify the code in the editor to change the UI output text from 'Welcome to Code IDE!' to 'Welcome to Live Preview!'.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div/div[2]/div/div/div/div/textarea').nth(0)
        await page.wait_for_timeout(3000); await elem.fill("export default function App() {\n  return (\n    <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center' }}>\n      <h1 style={{ color: '#0891B2' }}>🚀 Welcome to Live Preview!</h1>\n      <p>Start coding with the flow. Your vibe coding experience begins here.</p>\n      <button \n        onClick={() => alert('Vibe mode activated!')}\n        style={{\n          padding: '10px 20px',\n          backgroundColor: '#0891B2',\n          color: 'white',\n          border: 'none',\n          borderRadius: '8px',\n          cursor: 'pointer'\n        }}\n      >\n        Enter Vibe Mode\n      </button>\n    </div>\n  )\n}")
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div/div/div/div[2]/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        assert False, 'Test failed: Live Preview Builder did not update as expected.'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    