**MOBILE APPLICATION**

> **Updated 2026-09-24.** Each item below now carries a status line, added after: (1) verifying
> what PR #65 (merged before this pass) actually fixed in code, (2) the QA-round-2 mobile-only fix
> pass on `fix/mobile-qa-round2`, and (3) a `/code-review` pass on that branch and the regression
> fixes it turned up. Legend: ✅ Fixed and verified in code · 🟡 Partially fixed / needs a live
> deploy or device check to confirm · ⏸️ Deferred, not attempted · 🔧 Needs backend work or a
> product decision, tracked in `HANDOFF.md`. Full detail, file:line evidence, and backend/product
> asks live in `HANDOFF.md` and `mobile/README.md`'s "QA round 2" note; the companion
> `Test Documentation Statuses.md` has the fuller narrative for each item. Nothing here has been
> committed yet — everything sits on `fix/mobile-qa-round2` for review.

**SHARED**

1. Google Authentication not working. \- "Cannot read property 'catch' of undefined.  
   🟡 **Fixed in code** (Android custom-tab/session-claim fix). No mobile-side blocking path found
   on review. Still needs a real-device sign-in and a check of the Google OAuth config (Render env
   vars, redirect URI, migration `0033`) — see `HANDOFF.md`.

2. Log in Screen Android safe area insets. The screen and its content should be scalable and should not superimpose on the android devices with navigation button enabled. same also with the navigation dropdown from the top(the one showing wifi, battery,time etc.). The output I'm expecting is that the stuff in the screen should not exceed safe area insets and should be scalable in any android device screens, and that everything should be shown without having to scroll. Keep this consistent on every screen 
   🟡 **Partially fixed.** QA round 2 fixed a real double-padding bug (every client tab screen was
   getting the bottom inset applied twice) and two auth screens that ignored insets entirely.
   **Still open, deferred:** ~30 other screen headers use a fixed estimate instead of the real
   inset (a larger, separate pass), and "no scrolling on any screen" doesn't hold for long forms
   like sign-up — raised as a product question in `HANDOFF.md`.

3. On the sign up page when signing up, there is no show password in both “password” and “confirm password” fields. On both homeowner and provider.  
   ✅ **Fixed** (`PasswordInput` component, both fields, both roles).

4. Consents and Agreements when trying to read the policy or terms and conditions. Instead of being taken into a separate screen, make it like a pop up modal instead.  
   ✅ **Fixed** (`TermsAndConditions` is a real modal now).

5. Error message UI improvement of the error message when signing up a duplicate email.  
   ✅ **Fixed in code** (409 `EMAIL_TAKEN` → inline "Log in instead" card). Needs a deploy check to
   confirm the live API matches.

6. Tutorial for new users  
   🟡 **Fixed, partial.** Onboarding slides exist per role. Still missing: a way to replay the
   tutorial from Settings/Help, and it's device-local (resets on reinstall) rather than
   account-level. Depth/scope is a product question, not bundled into this pass.

7. Keyboard dismissal when tapping on outside input fields 
   ✅ **Fixed** for every gap identified this round: the Decline Booking, Withdraw (both roles), and
   Add Money modals, the sign-up code-entry step, and the chat empty state now dismiss the keyboard
   on an outside tap, matching the pattern already used elsewhere (`ChangePasswordModal`, etc.).

8. Onboarding should be different and appropriate for the role chosen.  
   ✅ **Fixed** (separate slide sets per role, already wired).

9. Remove the circles on the bottom part of the container of the Registration Page.  
   ✅ **Fixed.**

10. Redesign the Change Password Screen.  
    ✅ **UI redesigned.** QA round 2 additionally fixed a real bug (a wrong current password was
    triggering a pointless token refresh and a duplicate re-send of the same wrong password), and a
    follow-up regression that fix introduced (a genuinely expired session on this screen no longer
    silently self-healing) — both now fixed. Backend still can't distinguish "wrong password" from
    "your session expired" by status code alone; flagged in `HANDOFF.md`.

11.  Improve Job Detail Screen for both roles  
    ✅ **Fixed**, plus QA round 2 added a confirmation dialog before "Confirm Completion" (which
    releases escrow — it fired immediately before) and shows the scheduled date **and** time, not
    just the date.

12. Dark mode is not yet implemented  
    ⏸️ **Still deferred**, by explicit decision this round — not attempted, no theme applied.

13. No delete notification implemented  
    ✅ **Fixed in code.** Needs a deploy check to confirm the live API matches.

14. Think of what we can call the users instead of calling it a Homeowner. (It is possible that the end user will not be a homeowner)  
    ✅ **Fixed** — renamed to "Client" everywhere user-visible; no leftover "Homeowner" text found.

15. Not all profile information field in the Edit Profile Screen will be required. Place red asterisks only at the required fields.  
    ✅ **Fixed** — but the original miss was actually on the **sign-up form** (Name, Email,
    Password, Confirm Password, Skill Category), not Edit Profile. Both Edit Profile screens
    already matched their own validation correctly; that part needed no change.

16. Remove the logout button on settings tab because its redundant, logout is already in profile tab.  
    ✅ **Fixed.**

17. Keyboard dismissal add every inputs, where everytime that it needs to open the keyboard.  
    ✅ **Fixed** — see item 7 above (same fix, same gaps closed).

18. Redesign the forgot password screen.  
    🟡 **UI redesigned.** Full reset request/email round trip still needs the Supabase "Reset
    Password" email template confirmed to render `{{ .Token }}` (backend/dashboard config, not
    code) — see `docs/password-reset-setup.md` and `HANDOFF.md`.

**HOMEOWNER**

1. In the posting job the next button is directed to the bottom view not the top view.  
   ✅ **Fixed** — the form scrolls to top on every step change.

2. User story 12 is not yet implemented.  
   ⏸️ **Still undefined.** Confirmed: no "Story 12" exists anywhere in the repo, and there are two
   different, non-matching numbered story lists (`HANDOFF.md`'s vs. `BACKEND_SCHEMA.md`'s). Raised
   as an open product question in `HANDOFF.md` — this needs an answer from whoever owns the
   backlog, not more searching.

3. After posting the job, the location text is overlapping outside.  
   ✅ **Fixed.** QA round 2 also made the success screen scroll (so a long title/address can't push
   the buttons off-screen) and initially added a defensive line cap that turned out to truncate the
   message on a normal post — caught by `/code-review` and removed; the scroll fix alone was
   sufficient.

4. In my job there is a post at the top right corner. When you click it and try to go back it's going to the “home” nav tab instead of the “my job” nav tab.  
   ✅ **Fixed** — back from New Job correctly returns to My Jobs. (A stale code comment describing
   the opposite behavior was also corrected this round; no functional change was needed.)

5. Simplify the filters in the My Jobs tab.  
   ✅ **Fixed** (All / Active / Completed / Cancelled).

6. Modify the Job Details Screen and Wallet Screen.  
   ✅ **Fixed**, plus QA round 2 added the Confirm Completion dialog and date+time display (see
   Shared #11) and decluttered the Wallet screen (see item 14 below).

7. When opening a notification that a SP has applied to the job, it should navigate to the Proposals screen.  
   ✅ **Fixed** for the in-app notification list. 🔧 Tapping a **push** notification still doesn't
   route anywhere — blocked on Firebase/FCM credentials (backend/infra), tracked in `HANDOFF.md`.

8. In the proposals the homeowner should have access viewing the profile of the maestro provider, like a portfolio.  
   🟡 **Partially fixed.** Tapping a proposal opens the provider's profile with an ID-verified badge,
   bio, recent-work list, and reviews. 🔧 A real **photo** portfolio doesn't exist — no table,
   bucket, or endpoint (`BACKEND_SCHEMA.md` explicitly defers it) — needs a product decision before
   any backend work, tracked in `HANDOFF.md`.

9. Remove the chat button in the SP card in the Proposal Screen.  
   ✅ **Fixed.**

10. Add confirmation that prompts the HO if they are sure to reject or accept the proposal of the SP.  
    ✅ **Fixed.** QA round 2 also styled the Reject confirm button red (destructive), since
    rejecting can't be undone.

11. The “need something done?” In the home navigation should be just in an empty state and put it below the find service.  
    ✅ **Fixed.** QA round 2 also fixed a flash where this card could briefly appear while jobs were
    still loading (caught it would flash even with jobs present, fixed to wait on the jobs request
    specifically).

12. My job's filtering should be less.  
    ✅ **Fixed** — same fix as item 5 above.

13. In the calendar screen the dot on the calendar should be removed if the job is expired.  
    ✅ **Fixed.**

14. Wallet too crowded, remove transfer button and some fields.  
    ✅ **Fixed** — Transfer, the spent/added stats, the trust banner, and the duplicate "Request"
    link are gone; Add Money and Withdraw only.

15. Buttons in the withdrawal modal are big, should be small and change the “request withdrawal” to withdrawal only.  
    ✅ **Fixed** — buttons are smaller, and the label reads "Withdraw."

16. Buttons in post a job is too big, less the font size.  
    ✅ **Fixed.** QA round 2 found and fixed one button this had missed — "Post Another Job" on the
    success screen was still visibly larger than "View My Jobs" beside it; now matches.

17. Discard Job Draft, buttons are too big and not aligned.  
    ✅ **Fixed** — equal-width, properly sized buttons. QA round 2 also styled "Discard & Exit" red
    (destructive).

18. In active jobs the job card should show the urgency level.  
    ✅ **Fixed.**

19. The withdrawal modal should not be opened if you dont have money to withdraw add toast.  
    ✅ **Fixed**, and hardened twice more this round: QA round 2 fixed the toast showing "no funds"
    even when the real problem was a failed wallet load (not an actual zero balance); a
    `/code-review` pass then caught that *that* fix over-corrected and could block a withdrawal
    even when a valid, correct balance was already on screen (a background refresh failing
    shouldn't discard good cached data) — also fixed, with a regression test covering the exact
    scenario.

**PROVIDER**

1. Add what type of government document will be uploaded through the Provider verification.   
   ✅ **Fixed in code** (5-option ID type picker, required before proceeding). 🔧 Needs migration
   `0034` deployed — see item 0 in `HANDOFF.md`'s "QA round 2 backend asks."

2. Verification won't proceed.  After all the steps. (Error: Image is not recognizable)  
   ✅ **Fixed in code** (typed multipart upload + a backend MIME-signature fallback). 🔧 Needs a
   live deploy and a real upload test to confirm — same blocker as item 1.
   1. If successful verification, check if the verification shortcut disappears in the Provider Homescreen.  
      🟡 **Fixed in code**, and QA round 2 closed a real gap: verification is approved by an async
      backend webhook, and the app had no way to notice while backgrounded, so the banner used to
      stay stale until an app restart or a revisit to Verification. Now also refreshes on app
      foreground.

3. Add filters for Job urgency  
   🟡 **Partially fixed.** Urgent/Normal/Flexible chips exist, but only filter the 20 jobs already
   loaded into memory — not a real server-side filter. 🔧 Needs a backend `urgency` query param,
   tracked in `HANDOFF.md`.

4. Icon in the hero/header section (SP HomeScreen), specifically the icons in Open, Urgent, and Potential shall be moved beside the label.  
   ✅ **Fixed.**

5. Move the Active Status (Switch for Availability; “Available for Jobs”:”Not Available”)  
   ✅ **Fixed** — moved under its own status section.
   1. Add Header if magstay sa HomeScreen)  
      ✅ **Fixed** ("Your status" header).

6. Move the Jobs Done, Rating, and Active in the Profile Screen (if displayed in the SP HomeScreen it will be redundant since it is already displayed in the Profile Screen)  
   ✅ **Fixed** — removed from Home, shown only on Profile.

7. In My work tab, inconsistent filtering is present which duplicates the job. For example, in the Applications filter, the current status on the job is “Hired” but the same job is also existing under the Active filter with the current job status as “Hiring Provider”.  
   ✅ **Fixed** — Hired proposals no longer appear under Applications, and Active only shows jobs
   actually assigned to the provider, so the duplication is structurally impossible now (a job can
   only be assigned via an accepted application). One related, unfixed edge case: a **declined**
   booking currently disappears from every My Work tab instead of showing as
   Cancelled/Declined — noted as a follow-up in `HANDOFF.md`, not fixed this round.

8. My Work tab \-\> Select a filter (other than Applications filter) \-\> Select a listed job in the filter \-\> Use the return button at the top of the Job Details Screen. After using the return button, it returns to the Applications filter instead of the selected filter before.  
   ✅ **Fixed** — the selected filter and scroll position are now retained.

9. When using the "Submit Proposal”, the popup for proposing to the Homeowner is not appearing / displaying. (Maybe like sending a message to the homeowner)  
   ✅ **Fixed** — the popup (`ProposalModal`) exists and works. QA round 2 also fixed a real bug
   this introduced: after sending, only the job was reloaded, not the provider's own applications
   list, so "Submit Proposal" stayed visible and a second tap failed as a duplicate application.

10. The Job is already tagged as Hired in the Applications filter in the My Work tab. The same job is still displayed in the Booking Request in the HomeScreen. Additionally, the same job has the “Accept Booking” button in the Job Details Screen.  
    🟡 **Partially fixed.** The "Hired" contradiction in Applications is gone (see item 7). The job
    still appearing in Home's Booking Request with an Accept Booking button after being hired via a
    proposal is **intentional** current behavior (the provider still confirms the booking) — whether
    that confirmation step should be skipped for a proposal-based hire is an open product question,
    tracked in `HANDOFF.md`.

11. In the Calendar tab, the accepted job by the provider is still not appearing in the Calendar (as a dot).  
    🟡 **Fixed in code** — accepting now always creates a calendar booking. 🔧 Needs a one-time
    backfill for jobs that were accepted *before* this change (they still have no booking row), and
    a live deploy — tracked in `HANDOFF.md`.

12. In the edit profile the address is not required, it should be required when accepting the job so the current location will be put instead of default. For example if the provider is not in their home the address will not be the same proximity so it needs to be required again where they are currently.  
    🟡 **Partially fixed.** Accepting a booking now asks for a location, with a GPS option. QA round
    2 fixed the modal pre-filling the provider's home address by default (which defeated the point
    of asking) — it now starts empty. 🔧 Whether the *profile* address should stay required, and
    whether the client should ever see this accept-time location, are open product questions —
    tracked in `HANDOFF.md`.

13. Changing the SP skill will only be allowed when the SP requests the admins for changing it. They can also request for adding secondary service if they are qualified.   
    ✅ **Fixed** — editing the service is locked in the app and refused by the backend; skill-change
    requests work end to end. 🔧 An approved secondary service doesn't yet affect job matching —
    tracked in `HANDOFF.md`.
    1. Add a screen where they can send requests to the Admins.  
       ✅ **Fixed** (both the provider-side request screen and the admin-side review screen exist).

14. Change the Job Cards. Should be similar to the Job Cards used in Homeowner.  
    ✅ **Mostly fixed** — a shared `JobCard` is used across both roles' main lists. Booking-request
    cards on the provider Home screen are still a separate, custom layout (not urgent).

15. In the profile part when you scroll and click some fields on the bottom like settings, when you go back it's going back to the top.  
    ✅ **Fixed** — scroll position is retained and restored.

**ADMIN**

1. User filter for new users  
   ✅ **Fixed** ("joined in the last N days" filter). Currently filters only over the newest 200
   users loaded rather than querying the backend directly for it — the backend already accepts the
   right param; wiring it through is an easy, optional follow-up, tracked in `HANDOFF.md`.

2. There is no status for the user verification.  
   ✅ **Fixed in code** (status column, filter, and detail drawer). 🔧 Needs migration `0034`
   deployed — without it every provider shows "Not submitted," the same blocker as Provider items 1
   and 2 above.
