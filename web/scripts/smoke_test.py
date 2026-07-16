# Smoke test for the TaskBuddy admin console (mock-data mode).
# Drives the real UI: login, all 7 pages, mutations, settings persistence.
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
PASS, FAIL = [], []
console_errors = []


def check(name, cond, detail=""):
    (PASS if cond else FAIL).append(f"{name}{' — ' + detail if detail and not cond else ''}")
    print(("PASS " if cond else "FAIL ") + name + (f" — {detail}" if detail and not cond else ""))


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)

    # ── Login ──
    page.goto(BASE)
    page.wait_for_load_state("networkidle")
    check("login page renders", page.locator("text=Admin Sign In").count() == 1)

    # client-side validation: empty form
    page.click('button:has-text("Sign In to Admin Console")')
    page.wait_for_timeout(300)
    check("empty login form validated", page.locator("text=Admin email is required").count() == 1)

    # client-side validation: malformed email
    page.fill('input[type="email"]', "not-an-email")
    page.fill('input[type="password"]', "whatever1")
    page.click('button:has-text("Sign In to Admin Console")')
    page.wait_for_timeout(300)
    check("malformed email validated", page.locator("text=Admin email must be a valid email").count() == 1)

    # wrong password shows an error
    page.fill('input[type="email"]', "admin@taskbuddy.io")
    page.fill('input[type="password"]', "wrong")
    page.click('button:has-text("Sign In to Admin Console")')
    page.wait_for_timeout(600)
    check("wrong password rejected", page.locator("text=Invalid email or password").count() == 1)

    # correct credentials
    page.fill('input[type="password"]', "Admin123!")
    page.click('button:has-text("Sign In to Admin Console")')
    page.wait_for_selector("text=Platform Overview", timeout=8000)
    check("login works", True)

    # ── Dashboard ──
    page.wait_for_timeout(800)  # allow mock services to resolve
    check("dashboard stats load", page.locator("text=Total Users").count() >= 1)
    pending_txt = page.locator("div:below(:text('Pending Verifications'))").first
    # dashboard pending count should be 5 (live from mock db)
    check("dashboard pending = 5", page.locator("text=Pending Verifications").locator("xpath=preceding-sibling::div[1]").inner_text() == "5")
    # sidebar badge should also read 5
    check("sidebar badge = 5", page.locator(".nav-badge").first.inner_text() == "5")

    # ── Verifications: approve updates everything ──
    page.click('button:has-text("Verifications")')
    page.wait_for_selector("text=Provider Verification Queue")
    before = page.locator('button:text-is("Approve")').count()
    check("pending verifications listed", before == 5, f"got {before}")
    page.locator('button:text-is("Approve")').first.click()
    page.wait_for_timeout(800)
    after = page.locator('button:text-is("Approve")').count()
    check("approve removes from pending", after == before - 1, f"{before}->{after}")
    check("sidebar badge updates to 4", page.locator(".nav-badge").first.inner_text() == "4")

    # dashboard reflects the change too
    page.click('button:has-text("Dashboard")')
    page.wait_for_selector("text=Platform Overview")
    check("dashboard pending updates to 4", page.locator("text=Pending Verifications").locator("xpath=preceding-sibling::div[1]").inner_text() == "4")

    # ── Users: search, banned filter, status change ──
    page.click('button:has-text("User Management")')
    page.wait_for_selector("text=View, manage, and moderate")
    rows = page.locator("table.data-table tbody tr").count()
    check("users table has 10 rows", rows == 10, f"got {rows}")
    page.click('button:has-text("Banned")')  # stat card filter
    page.wait_for_timeout(300)
    banned_rows = page.locator("table.data-table tbody tr").count()
    check("banned filter shows 1 user", banned_rows == 1, f"got {banned_rows}")
    page.click('button:has-text("Total Users")')
    page.wait_for_timeout(300)
    page.fill('input[placeholder*="Search by name"]', "casey")
    page.wait_for_timeout(300)
    check("user search works", page.locator("table.data-table tbody tr").count() == 1)
    # suspend->activate Casey
    page.locator('button[title="Activate"]').first.click()
    page.wait_for_timeout(800)
    check("user status change works", page.locator("table.data-table tbody tr .badge-active").count() == 1)

    # ── Transactions ──
    page.click('button:has-text("Transactions")')
    page.wait_for_selector("text=Monitor all platform transactions")
    check("transactions volume computed", page.locator("text=₱11,230").count() == 1)
    page.click('button:has-text("Disputed")')
    page.wait_for_timeout(300)
    check("transaction filter works", page.locator("table.data-table tbody tr").count() == 1)

    # ── Bookings: disputed tab + cancel ──
    page.click('button:has-text("Bookings")')
    page.wait_for_selector("text=Track all service bookings")
    check("BK-0088 shows Disputed", page.locator("tr:has-text('BK-0088') .badge").inner_text() == "Disputed")
    cancels = page.locator('button:text-is("Cancel")').count()
    check("cancellable bookings = 3", cancels == 3, f"got {cancels}")  # PENDING + CONFIRMED + IN_PROGRESS
    page.locator('button:text-is("Cancel")').first.click()
    page.wait_for_timeout(800)
    check("cancel booking works", page.locator('button:text-is("Cancel")').count() == cancels - 1)

    # ── Reports ──
    page.click('button:has-text("Reports")')
    page.wait_for_selector("text=Reports & Analytics")
    check("reports renders top providers", page.locator("text=Marcus Rivera").count() >= 1)

    # ── Settings: toggles persist + compact sidebar works ──
    page.click('button:has-text("Settings")')
    page.wait_for_selector("text=Configure your admin console")
    # flip "Daily summary report" on
    page.locator("div:has(> div > div:text-is('Daily summary report')) > button").last.click()
    page.wait_for_timeout(300)
    # navigate away and back — toggle should stay on (persisted, not reset)
    page.click('button:has-text("Dashboard")')
    page.wait_for_selector("text=Platform Overview")
    page.click('button:has-text("Settings")')
    page.wait_for_selector("text=Configure your admin console")
    prefs = page.evaluate("() => JSON.parse(localStorage.getItem('tb-admin-prefs'))")
    check("settings persist to localStorage", bool(prefs and prefs["settings"]["dailySummary"] is True))

    # validation: weak new password (no number)
    page.fill('input[placeholder="Required to change password"]', "Admin123!")
    page.fill('input[placeholder="Min. 8 characters, letters & numbers"]', "weakpassword")
    page.fill('input[placeholder="Re-enter the new password"]', "weakpassword")
    page.click('button:has-text("Save Changes")')
    page.wait_for_timeout(400)
    check("weak password rejected", page.locator("text=must contain at least one number").count() == 1)

    # validation: confirm mismatch
    page.fill('input[placeholder="Min. 8 characters, letters & numbers"]', "NewPass123!")
    page.fill('input[placeholder="Re-enter the new password"]', "Different123!")
    page.click('button:has-text("Save Changes")')
    page.wait_for_timeout(400)
    check("password mismatch rejected", page.locator("text=Passwords do not match").count() == 1)

    # password change: wrong current fails
    page.fill('input[placeholder="Required to change password"]', "nope")
    page.fill('input[placeholder="Min. 8 characters, letters & numbers"]', "NewPass123!")
    page.fill('input[placeholder="Re-enter the new password"]', "NewPass123!")
    page.click('button:has-text("Save Changes")')
    page.wait_for_timeout(600)
    check("wrong current password rejected", page.locator("text=Current password is incorrect").count() == 2)
    # correct current works
    page.fill('input[placeholder="Required to change password"]', "Admin123!")
    page.click('button:has-text("Save Changes")')
    page.wait_for_timeout(600)
    check("password change succeeds", page.locator("text=Settings saved successfully").count() == 1)

    # re-login with the NEW password
    page.locator('button[title="Sign out"]').click()
    page.wait_for_selector("text=Admin Sign In")
    page.fill('input[type="email"]', "admin@taskbuddy.io")
    page.fill('input[type="password"]', "NewPass123!")
    page.click('button:has-text("Sign In to Admin Console")')
    page.wait_for_selector("text=Platform Overview", timeout=8000)
    check("login with changed password works", True)

    page.screenshot(path="D:/Thesis/taskbuddy/apps/web/scripts/smoke_dashboard.png", full_page=False)
    browser.close()

real_errors = [e for e in console_errors if "ResponsiveContainer" not in e and "Download the React DevTools" not in e]
check("no browser console errors", len(real_errors) == 0, "; ".join(real_errors[:3]))

print(f"\n{len(PASS)} passed, {len(FAIL)} failed")
sys.exit(1 if FAIL else 0)
