import asyncio
from playwright.async_api import async_playwright
import os

async def html_to_png():
    html_file = os.path.abspath("poster.html")
    output_file = os.path.abspath("poster.png")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        # 设置视口大小
        await page.set_viewport_size({"width": 800, "height": 1400})
        
        # 加载HTML文件
        await page.goto(f"file://{html_file}")
        
        # 等待页面完全加载
        await page.wait_for_load_state("networkidle")
        
        # 等待一段时间确保渲染完成
        await asyncio.sleep(1)
        
        # 截图
        await page.screenshot(path=output_file, full_page=True)
        
        await browser.close()
        print(f"海报已生成: {output_file}")

if __name__ == "__main__":
    asyncio.run(html_to_png())
