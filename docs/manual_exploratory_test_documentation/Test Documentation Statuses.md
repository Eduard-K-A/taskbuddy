# **Mobile App PR Verification — Emulator and Physical-Device Limits**

**Scope:** The findings below reflect the PR audit provided. Emulator checks confirm only the states actually exercised; a code-present item is not automatically end-to-end verified.  
**Status:**   
✅ checked in emulator/current code;   
🟡 partial or not exercised end-to-end;   
⚠️ incomplete;   
⏸️ deferred.

**Device labels**:   
“Emulator OK” means no special hardware is needed for this check.   
“Phone QA” means a real phone is recommended to cover OEM-specific behavior.   
“Physical hardware” means an emulator can simulate inputs but cannot prove real camera/GPS behavior.  
Important: missing backend deployment, test records, account states, or email services are not emulator limitations; they remain blockers even on a physical phone.

> **2026-09-24 code-verification pass, updated later the same day with a follow-up pass.** Every
> item below was re-checked directly against the code (not re-run on device) on
> `fix/mobile-qa-round2`, now merged to `main`. Bracketed `[…]` notes are additions from that pass:
> `[Correction]` marks a status here that didn't match the actual code; `[Fixed 2026-09-24]` marks
> an item this pass closed. A same-day follow-up pass additionally closed four items previously
> left deferred (declined-job visibility, tutorial replay, push-tap routing groundwork, header
> inset refactor) — those notes are marked accordingly below. Full detail, file:line evidence and
> the backend/product items neither pass could touch are in `HANDOFF.md` and `mobile/README.md`'s
> "QA round 2" and "Follow-up pass" notes. Nothing below was re-verified on an emulator or device —
> that step is still owed, and is called out per-item where it specifically applies.

# **SHARED**

\#1 🟡 Android OAuth error-handling fix is present, but sign-in did not finish because the Chrome custom tab ANR’d.   
**Phone QA:** recommended with installed Chrome and a real Google account; emulator is still useful for reproducing it. Also needs a working auth configuration.  
\#2 🟡 Safe-area handling improved, but full-screen coverage is still open.   
**Phone QA:** recommended across real cutouts, status/navigation bars, gesture and 3-button navigation, and OEM layouts; emulator can simulate representative modes.  
**[Correction: this was worse than 🟡.** Every client (homeowner) tab screen was getting the bottom inset applied twice — once by `BottomNavBar` itself, once by an unnecessary wrapping `ScreenFrame` — and the sign-up code-entry step and the Google role-selection screen's top edge ignored insets entirely. **[Fixed 2026-09-24]** all three. **[Fixed 2026-09-24, follow-up pass]** the remaining 29 screen headers that used a fixed `Sizes.statusBarHeight` estimate instead of the real inset now use a new `useHeaderTop()` hook — real, rotation-reactive safe-area insets. Still open: a real-device visual check of that refactor (3-button nav, gesture nav, a notched device) — not emulator-provable. "No scrolling on any screen" (part of the original ask) also doesn't hold for long forms like sign-up — flagged as a product question in `HANDOFF.md`, not fixed.]  
\#3 ✅ Show/hide password was checked on both signup password fields for both roles. **Emulator OK.**  
\#4 ✅ Terms/privacy consent modal was checked. **Emulator OK.**  
\#5 ✅ Duplicate-email message was checked after the signup attempt.   
**Emulator OK;** use a disposable/test account for repeat runs.  
\#6 🟡 New-user tutorial/onboarding screens exist and were partly reviewed; not every account state or first-run path was checked. **Emulator OK** with fresh-account fixtures.  
**[Fixed 2026-09-24, follow-up pass]** a "View tutorial" row in Help & Support (both roles) now
replays the onboarding slides on demand, closing the "no way to replay it" gap. **Emulator OK.**  
\#7 🟡 Keyboard handling improved and selected forms were tested, but outside-tap dismissal is not proven on every input (some forms dismiss on drag).   
**Phone QA:** recommended with the device’s actual keyboard and resize behavior; emulator covers a standard Android keyboard.  
**[Fixed 2026-09-24]** for the remaining known gaps: the Decline Booking, Withdraw (both roles), and Add Money modals, the sign-up code-entry step, and the chat empty state now dismiss the keyboard on an outside tap. Real-device QA of the full matrix is still owed.]  
\#8 🟡 Role-specific onboarding screens exist; not every role/account state was exercised. **Emulator OK** with role-specific test accounts.  
\#9 ✅ Registration circles were removed and checked. **Emulator OK.**  
\#10 🟡 Change Password was redesigned, and its UI was partly checked; password-change submission was not completed.   
**Emulator OK** for UI; a working auth backend and test account are needed for submission.  
**[Fixed 2026-09-24]** a related bug: a wrong current password (401) was triggering a pointless token refresh and a duplicate re-send of the same wrong password before failing. Still open, backend: the 401 doesn't distinguish "wrong password" from "session expired," and there's no way to detect a Google-only account (see `HANDOFF.md` §3).]  
\#11 ✅ Job-detail cleanup is present.   
**Emulator OK** with seeded job records.  
\#12 ⏸️ Dark-mode switching remains deferred. A physical device isn't required to implement or verify the theme switch.  
\#13 ✅Notification deletion is present.   
**Emulator OK** with notification fixtures. This does not verify remote push delivery or background/lock-screen behavior.  
\#14 ✅ The user-facing “Homeowner” label changed to “Client” and was checked.   
**Emulator OK.**  
\#15 ⚠️ Required asterisks appear on consent rows, but required name/email/password fields appear unmarked if the requirement is to mark every required field.   
**Emulator OK;** confirm the intended required-field rule.  
**[Correction: this claim was aimed at the wrong screen.** Homeowner and provider Edit Profile already mark exactly the fields their Save button checks — no gap there. The real gap was the sign-up form (Full Name, Email, Password, Confirm Password, and Skill Category for providers), which had no asterisks at all. **[Fixed 2026-09-24]**]  
\#16 ✅ Duplicate logout entry was removed and checked. **Emulator OK.**  
\#17 🟡 Same keyboard-dismissal gap as \#7: selected forms only, not every keyboard input. **Phone QA** recommended for OEM keyboard/viewport differences; emulator can test common behavior. **[Fixed 2026-09-24 — see \#7.]**  
\#18 🟡 Forgot Password UI was redesigned and partly checked; the full reset request/email flow was not completed. **Emulator OK** for UI; working auth/email service and a test account are needed.

# **HOMEOWNER**

\#1 ✅ Post-a-Job step navigation/Next behavior was checked in the emulator. No hardware-specific dependency.  
\#2 ⏸️ User Story 12 is still undefined; this is a product/specification gap, not a device issue.  
**[Confirmed: genuinely undefined anywhere in the repo.** Two different, non-matching numbered story lists exist (`HANDOFF.md`'s "12 core user stories" vs. `BACKEND_SCHEMA.md`'s "backlog stories"), and neither names a Story 12. Raised as a product question in `HANDOFF.md`.]  
\#3 ✅ “Use default” is now shown only when the profile has a saved address (current-code behavior). Emulator OK; test both profiles with and without an address.  
**[Correction: this reason doesn't actually explain the fix.** The original bug — long location text overflowing the post-success card — was fixed separately, by `flexShrink`/`maxWidth` on that text. What was still open, a success screen that doesn't scroll and could still push its buttons off-screen with a very long title or address, is **[Fixed 2026-09-24]** (scrollable success screen, line caps added).]  
\#4 ✅ Back from New Job returns to My Jobs as intended. **Emulator checked.**  
**[Fixed 2026-09-24, non-functional]**: `App.tsx`'s comment near this logic claimed Create Job "clears the back stack," which is the opposite of what the code does (it pushes). Corrected the comment only; behavior was already right.]  
\#5 ✅ My Jobs filters are simplified in code.   
**Emulator OK** with jobs in multiple statuses.  
\#6 🟡 Job Details and Wallet UI updates are present; proposal/active-job states were unavailable to exercise.   
**Emulator OK** with safe test records; no real-money transaction is needed.  
**[Fixed 2026-09-24]** two gaps found in code review: "Confirm Completion" (which releases escrow to the provider) fired immediately with no confirmation step — now gated behind a dialog naming the amount. The schedule fact now shows date **and** time, not date only.]  
\#7 🟡 Provider-application notification routing to Proposals is present, but no application notification was available to tap.  
**[Fixed 2026-09-24, code-only]** a follow-up pass built the equivalent routing for a tapped **push**
notification (shared `resolveNotificationTarget` helper + `App.tsx` wiring), but it's dormant until
a push token can be obtained — still blocked on Firebase/FCM (see `HANDOFF.md` §4). A dev-build
manual tap test is owed once that unblocks; not reproducible on the emulator.  
\#8 ⚠️ Provider details and recent-work information are implemented, but a real photo portfolio is still missing. Not hardware-dependent.  
**[Confirmed: no portfolio table, bucket, or endpoint exists.** `BACKEND_SCHEMA.md` §14 explicitly defers it. Needs a product decision — see `HANDOFF.md` §4.]  
\#9 🟡 Proposal-card chat-button removal is present, but proposal cards were unavailable for a full-flow check. Emulator OK with proposal data.  
\#10 ✅ Accept/reject confirmation is present.  
 **Emulator OK** with test proposal data.  
**[Fixed 2026-09-24, cosmetic]**: the Reject confirm button is now styled red (destructive), matching that it can't be undone.]  
\#11 ✅ The empty-state message was moved below Find Service and checked. Emulator checked.  
**[Fixed 2026-09-24]** a flash: the empty-state card could briefly show while jobs were still loading (if the other three Home widgets had already resolved). Now waits on the jobs request specifically.]  
\#12 ✅ Duplicate/overlapping filter behavior was simplified.  
 Emulator OK with representative job data.  
\#13 ✅ Expired calendar dots are removed in the current logic.   
Emulator OK with expired and active job fixtures; check date/time-zone cases.  
\#14 ✅ Wallet crowding and the Transfer control were removed in the checked UI. Emulator checked; no real transaction needed.  
\#15 🟡 Withdrawal controls were reduced/renamed, but the non-zero withdrawal flow was not exercised. Emulator OK with a safe test balance; do not use real funds for QA.  
\#16 🟡 Post-a-Job button sizing was improved in code; the complete post flow was not available to exercise. Emulator OK; phone is optional for screen-size comparison.  
**[Fixed 2026-09-24]** the one button this pass missed the first time: "Post Another Job" on the success screen was still visibly larger than "View My Jobs" beside it. Now matches.]  
\#17 🟡 Discard Draft alignment was improved, but a draft flow was unavailable. Emulator OK with a saved test draft.  
**[Fixed 2026-09-24, cosmetic]**: "Discard & Exit" is now styled red (destructive).]  
\#18 ✅ Urgency is included on active-job cards  
Emulator OK with an active urgent-job fixture.  
\#19 ✅ At zero balance, Withdraw shows a toast and does not open the modal; this was observed in the emulator. Emulator is sufficient.  
**[Fixed 2026-09-24, edge case found in review]**: if the wallet request itself failed (network error, not an actual zero balance), the toast wrongly said "You have no funds available to withdraw." Now distinguishes "couldn't load" from "loaded at zero."]

# **SERVICE PROVIDER**

\#1 🟡 Government-document type selection was added. Emulator OK for the picker/UI; physical hardware is needed to validate a real camera capture and camera permission path.  
**[Correction, minor]**: only the selfie step uses the camera; the ID-photo step is gallery-only, so there's no "real camera capture" path to validate for the ID upload specifically.]  
\#2 🟡 Verification upload error handling was fixed and has backend MIME/signature test coverage, but no real upload or deployed API was tested. Emulator can test a selected sample image; physical hardware is needed only to validate actual camera capture/permissions. Backend redeploy and API verification remain separate requirements.  
**[Confirmed still blocking: needs migration `0034` and the current API deployed — see `HANDOFF.md` §0. Against an older API, verification submit 400s because `document_type` isn't whitelisted, which reproduces as the exact same symptom this item originally reported.]**  
\#3 🟡 Verification shortcut hides after successful verification in code; needs a provider account with a verified status to confirm. Emulator OK with the right account/backend state.  
**[Fixed 2026-09-24]** a related gap: verification is approved async by a backend webhook, and the app had no way to notice while backgrounded — the banner only cleared on an app restart or a revisit to the Verification screen. Now also refreshes on app foreground and once on mount while unverified.]  
\#4 🟡 Urgency filters are present; jobs with different urgency values are needed to exercise them. Emulator OK.  
**[Confirmed: filters only the 20 jobs already loaded into memory, not the full feed server-side. Backend fix needed for a real filter — see `HANDOFF.md` §2.]**  
\#5 ✅ Open/Urgent/Potential icons were moved beside their labels and were visible in the emulator.  
\#6 ✅ Availability switch was moved under status and was visible in the emulator.  
\#7 ✅ “Your status” header was visible in the emulator.  
\#8 🟡 Jobs Done, Rating, and Active statistics were moved to Profile in code; provider data was unavailable for a full check. Emulator OK with populated profile data.  
\#9 ✅ Jobs Done/Rating/Active placement in Profile was visible in the emulator.  
\#10 🟡 Selected My Work filter retention after returning from Job Details is implemented; needs jobs in multiple filters to verify. Emulator OK.  
\#11 🟡 The open QA job details were checked. “Verify to Apply” blocks proposal submission until identity verification is complete; the proposal popup and backend submission remain unverified. No proposal was submitted.  
**[Fixed 2026-09-24: a real bug, found in code review, not in this original item.** After a proposal was sent, only the job itself was reloaded, not the provider's applications list — so "Submit Proposal" stayed visible and a second tap failed with a 400 ("already applied"). Fixed by reloading both.]  
\#12 🟡 Hired/Booking Request/Accept Booking state correction is present; needs matching backend/job states to exercise. Emulator OK with test data.  
\#13 🟡 Accepted-job calendar entry creation/reload is present in code, but deployment and device verification remain. Emulator can verify app logic; physical phone is not inherently required.  
**[Confirmed: needs a one-time backfill for jobs accepted before this change — see `HANDOFF.md` §1.]**  
\#14 ⚠️ Acceptance-time location handling is only a partial match: provider profile still requires an address. Physical hardware is needed to validate genuine current GPS accuracy; emulator mock coordinates test logic only. Backend flow also needs test data.  
**[Fixed 2026-09-24]** the modal used to pre-fill the provider's home address, which defeated the point of asking (tapping Accept without editing just sent the home address back). Now starts empty, per an explicit product decision. Whether the profile address should stay required, and whether the client should ever see this location, are open product questions — see `HANDOFF.md`.]  
\#15 🟡 Skill-change requests to admins are present; the admin approval/backend path needs test data and a working service. Not phone-dependent.  
\#16 🟡 Admin service-request screen is present; end-to-end submission/approval needs the deployed backend and admin access. Not phone-dependent.  
\#17 ✅ Shared JobCard implementation is present and was checked in the emulator. Physical phone not required for the basic UI check.  
\#18 🟡 Profile scroll-position restoration was improved; verify with populated profile content and settings navigation. Emulator OK; Phone QA optional for real scrolling/screen-size differences.

**[Note: this list has no row for the "duplicate job across My Work filters" item from the original
QA doc (a job showing as both "Hired" under Applications and "Hiring Provider" under Active). It was
independently confirmed fixed in code this pass — Hired proposals are excluded from Applications,
and Active only shows jobs actually assigned to the provider. A related edge case found during that
check — a declined/cancelled booking disappearing from every My Work tab instead of showing
anywhere — was fixed in the same-day follow-up pass: a 4th "Cancelled" tab now shows it, and its
Job Detail screen shows a locked "Booking Cancelled" row instead of a blank action bar.]**

# **ADMIN**

**[New section, 2026-09-24 — the original QA doc's two admin items had no status rows here.]**

\#1 ✅ New-user filter exists in the web admin console (a "joined in the last N days" filter on the Users page). **[Confirmed in code.]** Only filters over the newest 200 users loaded; the backend already accepts a `created_after` query param the web app doesn't send yet — see `HANDOFF.md` §7.  
\#2 ✅ Verification status column, filter, and detail drawer exist. **[Confirmed in code, but depends on migration `0034` being deployed — without it every provider shows "Not submitted." See `HANDOFF.md` §0.]**
