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
        # Click on 'Settings' link to open Theme Customizer or relevant UI for theme customization.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/nav/div/div/div[2]/a[6]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click on 'Light Mode' button to change theme from Dark Mode to Light Mode and verify immediate UI update.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Reload the application page to verify if Light Mode theme persists after reload.
        await page.goto('http://localhost:3002/settings', timeout=10000)
        

        # Click on 'Light Mode' button to change theme again to Light Mode.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Click on 'Save Settings' button to save the theme change.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Reload the application page at http://localhost:3002/settings to verify theme persistence after saving.
        await page.goto('http://localhost:3002/settings', timeout=10000)
        

        # Test changing the theme to 'Auto' explicitly, save settings, and reload to verify if persistence works for the 'Auto' theme option.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div/div/button[3]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        await page.goto('http://localhost:3002/settings', timeout=10000)
        

        # Verify if the UI updates immediately when switching from 'Dark Mode' to 'Light Mode' again, then reload to confirm persistence behavior once more.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        await page.goto('http://localhost:3002/settings', timeout=10000)
        

        # Click 'Save Settings' button to save the Light Mode theme again and then reload to verify persistence once more.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # Test if other settings like font size persist after reload to isolate if the issue is specific to theme persistence or a broader settings persistence problem.
        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div[3]/div/button[2]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        frame = context.pages[-1]
        elem = frame.locator('xpath=html/body/div/div/div/div[3]/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        await page.goto('http://localhost:3002/settings', timeout=10000)
        

        # Assert immediate UI update after changing to Light Mode theme
        frame = context.pages[-1]
        light_mode_button = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div/div/button[2]').nth(0)
        await expect(light_mode_button).to_be_visible()
        # Check if body or main container has class or style indicating Light Mode theme
        body = frame.locator('body')
        body_class = await body.get_attribute('class')
        assert 'light-mode' in (body_class or '').lower(), 'Light Mode theme not applied immediately'
        # Reload the page to verify persistence
        await page.goto('http://localhost:3002/settings', timeout=10000)
        frame = context.pages[-1]
        # Verify Light Mode theme persists after reload
        body = frame.locator('body')
        body_class = await body.get_attribute('class')
        assert 'light-mode' in (body_class or '').lower(), 'Light Mode theme did not persist after reload'
        # Verify theme button state reflects Light Mode after reload
        light_mode_button = frame.locator('xpath=html/body/div/div/div/div[2]/div/div/div/div/button[2]').nth(0)
        await expect(light_mode_button).to_be_visible()
        # Optionally check if the button is in active state (e.g., has 'active' class)
        button_class = await light_mode_button.get_attribute('class')
        assert 'active' in (button_class or '').lower(), 'Light Mode button not active after reload'
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    