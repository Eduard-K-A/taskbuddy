# Light-mode contrast audit for the TaskBuddy admin console.
# Logs in, switches to light theme, visits every page, screenshots each,
# and flags any visible text whose computed color is (near-)white while
# its effective background is light.
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
PAGES = ["Dashboard", "Verifications", "User Management", "Transactions", "Bookings", "Reports", "Settings"]
FAILS = []

CONTRAST_JS = """
() => {
  const problems = [];
  const isLight = (rgb) => {
    const m = rgb.match(/rgba?\\((\\d+), (\\d+), (\\d+)(?:, ([\\d.]+))?\\)/);
    if (!m) return null;
    const a = m[4] === undefined ? 1 : parseFloat(m[4]);
    if (a < 0.5) return null; // effectively transparent
    return (+m[1] + +m[2] + +m[3]) / 3 > 180;
  };
  const effBg = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const s = getComputedStyle(n);
      if (s.backgroundImage !== "none") return "image"; // gradients: assume intentional
      const l = isLight(s.backgroundColor);
      if (l !== null) return l ? "light" : "dark";
    }
    return "light"; // falls through to page bg (light theme)
  };
  document.querySelectorAll("body *").forEach((el) => {
    const text = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join("");
    if (!text) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.opacity === "0") return;
    const m = s.color.match(/rgba?\\((\\d+), (\\d+), (\\d+)/);
    if (!m) return;
    const bright = (+m[1] + +m[2] + +m[3]) / 3;
    if (bright > 215 && effBg(el) === "light") {
      problems.push(`"${text.slice(0, 40)}" color=${s.color}`);
    }
  });
  return problems;
}
"""

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()

    # Pre-seed light mode before the app boots.
    page.goto(BASE)
    page.evaluate("localStorage.setItem('tb-admin-prefs', JSON.stringify({ darkMode: false }))")
    page.reload()
    page.wait_for_load_state("networkidle")

    # Login (login page is always-dark by design — not audited).
    page.fill('input[type="email"]', "admin@taskbuddy.io")
    page.fill('input[type="password"]', "Admin123!")
    page.click('button:has-text("Sign In to Admin Console")')
    page.wait_for_selector("text=Platform Overview", timeout=8000)
    page.wait_for_timeout(800)

    theme = page.get_attribute("html", "data-theme")
    print(f"data-theme = {theme}")
    if theme != "light":
        FAILS.append("theme did not switch to light")

    for name in PAGES:
        page.click(f'button:has-text("{name}")')
        page.wait_for_timeout(700)
        slug = name.lower().replace(" ", "_")
        page.screenshot(path=f"D:/Thesis/taskbuddy/apps/web/scripts/light_{slug}.png", full_page=True)
        problems = page.evaluate(CONTRAST_JS)
        status = "PASS" if not problems else "FAIL"
        print(f"{status} {name}: {len(problems)} unreadable text nodes")
        for pr in problems[:8]:
            print(f"   - {pr}")
        if problems:
            FAILS.append(f"{name}: {problems[:8]}")

    # Also audit the notification dropdown (was hardcoded dark).
    page.locator("header button").filter(has=page.locator("svg")).nth(-1).click()
    page.wait_for_timeout(400)
    page.screenshot(path="D:/Thesis/taskbuddy/apps/web/scripts/light_notifications.png")
    problems = page.evaluate(CONTRAST_JS)
    print(f"{'PASS' if not problems else 'FAIL'} Notifications dropdown: {len(problems)}")
    for pr in problems[:8]:
        print(f"   - {pr}")
    if problems:
        FAILS.append(f"notifications: {problems[:8]}")

    browser.close()

print(f"\n{'ALL CLEAR' if not FAILS else str(len(FAILS)) + ' page(s) with issues'}")
sys.exit(1 if FAILS else 0)
