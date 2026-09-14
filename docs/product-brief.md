# Countdown Clock Product Brief

Status: Kickstarter concept specification  
Audience: Adults 18+  
Working category: Motivational desk object / connected clock

## Product in one sentence

Countdown Clock is an always-on desk clock that makes a person's time visible: it can show time already lived, time until meaningful goals, and an optional illustrative life-planning horizon.

## Positioning

### Core promise

Make your time visible.

The product should encourage reflection and action without claiming to know when a person will die. The clock turns abstract time into a concrete, glanceable display and lets each owner choose whether that means a birthday, a habit, a personal goal, time lived, or an illustrative lifespan horizon.

### Product category

Call it an **adult motivational desk clock**, not a toy, medical device, health monitor, or death predictor.

### Suggested campaign copy

> Every second is real. Countdown Clock helps you see the time you have lived, focus on what comes next, and keep the goals that matter in sight.

### Language boundaries

Use:

- Illustrative planning horizon
- Population-based estimate
- Estimated range
- Motivational or reflective display
- General wellness
- Not medical advice

Do not use:

- Your death date
- Accurate lifespan prediction
- Clinically proven, unless a specific claim has suitable evidence
- Diagnoses risk or disease
- Adds years to your life
- Prevents illness or death

## Audience

### Primary audience

- Adults interested in productivity, intentional living, quantified-self products, or minimalist desk objects
- People who use goal trackers, habit tools, journaling, or time-management systems
- Gift buyers looking for a distinctive but configurable product

### Not an appropriate audience

- People under 18
- Anyone who reports that a persistent mortality reminder is likely to cause distress
- People seeking medical prognosis or treatment guidance

Goal-only and count-up modes must remain fully usable without completing health questions.

## User problem

Long-term time is difficult to perceive. Calendars and normal clocks organize appointments, but they do not make progress toward a life goal or the passage of a lifetime emotionally concrete. Existing death-countdown concepts often rely on shock value or false precision. Countdown Clock should provide the same visual impact with user control, utility, and honest uncertainty.

## MVP principles

1. **Useful without health data.** Goals, milestones, habits, and time-lived modes require no health questionnaire.
2. **Mortality display is opt-in.** It is never the factory default and can be hidden or deleted.
3. **Private by default.** The first version calculates locally and does not require an account or cloud storage.
4. **Glanceable.** A user should understand the active mode in under two seconds.
5. **Honest about uncertainty.** The display may tick every second; the estimate behind it is not second-level knowledge.
6. **Calm, not alarming.** No red warning states, death notifications, streak punishment, or fear-based prompts.
7. **Reliable as a clock.** It must recover correctly from power loss and work without an internet connection.

## Physical product

### Industrial design target

- Simple rectangular enclosure suitable for a desk or shelf
- Approximate target envelope: 160–200 mm wide, 55–75 mm high, and 20–35 mm deep
- High-contrast display readable from approximately 2–3 metres
- Stable weighted or non-slip base
- Neutral front face with no permanent mortality-related wording
- Replaceable cable and standard USB-C power input

Exact dimensions, materials, colours, and display technology remain prototype decisions. The production choice must support at least ten numeric positions or an equivalent graphical layout because adult age in seconds normally exceeds one billion.

### Electronics requirements

- USB-C 5 V power
- Real-time clock with backup power so short outages do not lose time
- Non-volatile local settings storage
- Automatic time calculation with user-selected timezone and daylight-saving handling
- Adjustable brightness and an optional night schedule
- No microphone, camera, GPS, or unnecessary sensors
- Physical reset that can erase all personal settings

Battery operation is not an MVP promise. An always-on display updating every second is better served by wired power; battery claims should be made only after measured prototype testing.

### Controls

Minimum physical controls:

- Previous mode
- Next mode
- Select / pause
- Brightness or settings shortcut

A single rotary control with press action may replace multiple buttons if it is reliable and accessible. All essential display switching and deletion functions must work without an active phone connection.

### Companion setup

The companion experience may be a mobile app or a compatible local web flow, but it must:

- Work without creating an account
- Explain each permission before requesting it
- Calculate the selected horizon locally where technically possible
- Transfer only the final clock configuration to the device
- Let the user export, update, or delete answers
- Show when an estimate was calculated and which model version was used

Bluetooth setup is preferred over Wi-Fi for the MVP because the clock does not need continuous internet access. A manual setup path should exist for birth date, custom goals, and basic clock modes.

## Display modes

### 1. Time lived

Shows exact elapsed time since the supplied birth date and time:

`current time - birth date/time`

If the birth time is unknown, use local noon and label the result as approximate until the user supplies a time. Formats:

- Total seconds
- Years, days, hours, minutes, seconds
- Weeks and days

### 2. Illustrative horizon

Shows time between now and a selected point within the estimate:

- Central estimate
- Conservative bound
- Optimistic bound

The user chooses which point is displayed. The mode label must include `EST` or an equivalent persistent indicator. The companion experience must always show the range, source year, and limitations even when the physical clock displays one compact number.

### 3. Life percentage

Shows:

`elapsed time / selected illustrative horizon × 100`

This is an estimate, not a health score. Avoid celebratory or punitive language as the percentage rises.

### 4. Weeks view

Shows weeks lived and illustrative weeks remaining. This mode can use a simple numeric display in the MVP and a grid only if the selected production display supports it clearly.

### 5. Milestone countdown

Counts down to a birthday, anniversary, graduation, trip, launch, retirement target, or another user-entered date.

### 6. Custom goal

Counts down to any date and lets the user assign a short local label. The product should support several saved goals but display only one at a time.

### 7. Habit / project count-up

Shows elapsed time since a user-selected start date. This supports sobriety, creative work, exercise, study, and other personal uses without asking why the date matters.

### 8. Finite moments

Converts a user-selected planning horizon into recurring opportunities:

`remaining time × user-entered frequency`

Examples include weekends, family meals, books, trips, or practice sessions. Frequencies are chosen by the user; the product must not pretend to know how often an event will occur.

## Mode defaults

Factory and first-run order:

1. Current date/time
2. Time lived
3. Custom goal
4. Habit count-up
5. Optional modes selected during setup

The illustrative-horizon modes appear only after separate consent and can be hidden at any time.

## Key experience flows

### First use

1. Power on and show a neutral welcome.
2. Set timezone manually or pair locally.
3. Choose goal-only setup or optional illustrative-horizon setup.
4. Preview selected modes before saving them to the clock.
5. Confirm brightness, quiet hours, and default mode.
6. Display a short explanation of physical reset and deletion.

### Annual refresh

1. Send at most one opt-in reminder.
2. Prefill prior answers locally.
3. Ask the user to review only fields that can change.
4. Present old and new ranges side by side.
5. Explain which inputs changed without saying those changes caused a specific gain or loss of life.
6. Require confirmation before replacing the clock's displayed horizon.

### Delete

The user can remove health answers and the horizon while retaining ordinary clock and goal modes. A physical factory reset removes all configuration from the clock.

## Differentiators

- A real, always-visible object rather than another phone notification
- Multiple constructive time perspectives, not a single shock-oriented death date
- Local-first setup with no required subscription or account
- Transparent source, model version, range, and uncertainty
- User-controlled tone: reflective, goal-focused, or purely chronological
- Annual review rather than opaque continuous manipulation of the estimate

## MVP scope

### Included

- Working rectangular clock prototype
- Timekeeping and offline recovery
- Time-lived, custom-goal, count-up, weeks, percentage, and finite-moment modes
- Optional questionnaire and illustrative range
- Local pairing and update flow
- Brightness, quiet hours, mode order, and full reset

### Not included

- Medical diagnosis, disease-risk alerts, or treatment advice
- A guaranteed or clinically precise age-at-death prediction
- Proprietary wearable hardware
- Continuous cloud monitoring
- Social feeds, public profiles, or comparison leaderboards
- Paid subscription required for basic operation
- Child accounts

## Roadmap boundaries

Potential post-launch work:

1. Read-only Apple HealthKit and Android Health Connect integrations
2. Additional display faces and accessibility settings
3. Optional encrypted sync across a user's devices
4. Localized questionnaires and country-specific life-table sources
5. A separately evaluated wearable concept only after demand and scientific feasibility are established

Roadmap features must not appear as included rewards unless they are demonstrated and budgeted before launch.

## Product success criteria

Before campaign launch:

- At least 80% of test users correctly explain that the horizon is an estimate, not a prediction
- At least 80% can change modes and delete the horizon without assistance
- The clock recovers from power interruption without losing settings or meaningful time accuracy
- No serious unresolved distress or coercion pattern emerges in user testing
- A working hardware/software setup flow is recorded without simulated functionality
- Target retail price and delivery date are supported by supplier quotes, prototype BOM, assembly yield assumptions, taxes, and fulfillment estimates

## Open prototype decisions

These decisions require measured prototypes or supplier quotes:

- Segmented LCD, LED, or another display technology
- Final enclosure process and material
- Number and type of physical controls
- Bluetooth module and companion platform
- Brightness range and power draw
- Serviceability and backup-cell replacement
- Final manufacturing region, certifications, and packaging
