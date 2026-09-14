# Countdown Clock Questionnaire

Status: Draft for cognitive testing, localization, scientific review, and privacy review  
Intended completion time: 8–10 minutes  
Eligibility: Adults 18+  
Purpose: Configure clock modes and, only when requested, calculate an illustrative population-based planning horizon

## Important implementation rule

This questionnaire is not itself a validated lifespan model. Each answer is tagged by purpose:

- **Baseline**: selects an appropriate population life table.
- **Candidate estimate input**: may be used only if the final published model explicitly includes and validates it for this user.
- **Context only**: may be shown back to the user but must not alter the estimate without validation.
- **Preference**: configures the product and never affects the estimate.

Do not assign homemade “years gained” or “years lost” values. Missing or declined answers must never be silently treated as a healthy response.

## Opening screen

### Title

Choose how you want to see your time

### Body copy

> Countdown Clock can show exact time you have lived, time until goals, and an optional illustrative life-planning horizon. A horizon is a statistical estimate based on population data and selected health factors. It cannot predict how long you will live or when you will die, and it is not medical advice.
>
> You can use every goal and count-up feature without answering health questions. You can stop, skip optional questions, delete your answers, or remove the horizon at any time.

Links on this screen:

- How the estimate works
- What stays on this device
- Delete my data
- Use goal-only setup

## Section 1 — Eligibility, consent, and comfort

Estimated time: 45 seconds

### Q1. Age eligibility

**Question:** Are you 18 years old or older?

**Required:** Yes  
**Purpose:** Eligibility

Responses:

- Yes
- No

Branching:

- **No:** End the health flow. Offer ordinary clock, goal, milestone, and count-up modes only.
- **Yes:** Continue.

### Q2. Setup path

**Question:** What would you like to set up?

**Required:** Yes  
**Purpose:** Preference

Responses:

- Goals and time-lived modes only
- An estimated lifespan range
- An estimated range and an optional single illustrative horizon

Branching:

- **Goals only:** Skip Sections 2–9 and continue to Section 10.
- **Estimated range:** Continue; do not enable a single-horizon clock face.
- **Range plus horizon:** Continue; the result screen must show the range before allowing the single-horizon display.

### Q3. Informed acknowledgement

**Question:** Please confirm all three statements.

**Required:** All three for an estimated mode  
**Purpose:** Consent

Checkboxes:

- I understand this is an uncertain statistical illustration, not a prediction of my death.
- I understand this is not medical advice and should not guide treatment or emergency decisions.
- I choose to use my answers to calculate the result on this device.

If any statement is not selected, offer goal-only setup. Consent for optional research or cloud sync must not be bundled here.

### Q4. Comfort check

**Question:** How do you think seeing an estimated lifetime countdown regularly would feel?

**Required:** Yes  
**Purpose:** Safety routing; not an estimate input

Responses:

- Motivating or meaningful
- Neutral
- I am not sure
- Uncomfortable
- Distressing or harmful to me

Branching:

- **Distressing or harmful:** Do not enable the lifespan display in this session. Offer goals, milestones, count-up, and time-lived modes. Provide a neutral message: “This display may not be useful for you. You can still use the clock without it.”
- **Uncomfortable / not sure:** Default to range-only preview. Let the user leave without pressure and remind them the mode can be hidden instantly.
- **Motivating / neutral:** Continue.

Do not ask about suicidal thoughts, psychiatric diagnoses, or self-harm in the MVP. Collecting those answers would create responsibilities the product is not designed to meet.

## Section 2 — Population baseline

Estimated time: 45 seconds

### Q5. Date of birth

**Question:** What is your date of birth?

**Required:** Yes for time-lived or estimated modes  
**Purpose:** Baseline

Response:

- Date picker with typed-entry alternative

Rules:

- Validate age 18+.
- Do not infer a date from another account.
- Ask for birth time only as an optional setting for a more precise time-lived counter; it must not affect the health estimate.

### Q6. Reference location

**Question:** Which country or region best represents where you have lived most of your adult life?

**Required:** Yes for a country-specific baseline  
**Purpose:** Baseline

Responses:

- Searchable country/region list
- I have lived in several countries about equally
- Prefer not to answer

Help text:

> Population life tables differ by location. This answer selects a statistical baseline; it does not describe your identity or citizenship.

Fallback:

- If mixed or declined, use a clearly named regional or global fallback and widen the uncertainty range. Show the fallback before calculation.

### Q7. Life-table category

**Question:** Many public life tables are published using sex recorded at birth. Which baseline should we use?

**Required:** No  
**Purpose:** Baseline

Responses:

- Female baseline
- Male baseline
- A blended baseline
- Prefer not to answer

Help text:

> This choice is used only to match available population statistics. It does not ask for or define your gender identity. Choosing “blended” or declining may make the estimate less specific.

Do not force intersex or transgender users into an identity category. If a data source later supports additional validated categories, update the wording and method version.

## Section 3 — Body measures and general health

Estimated time: 50 seconds

### Q8. Height

**Question:** What is your height without shoes?

**Required:** No  
**Purpose:** Candidate estimate input when BMI is in the selected model

Responses:

- Centimetres, or feet and inches
- I do not know
- Prefer not to answer

Validation: Accept plausible adult values and ask for confirmation outside them; do not block accessibility-related cases.

### Q9. Weight

**Question:** About how much do you weigh in light clothing?

**Required:** No  
**Purpose:** Candidate estimate input when BMI is in the selected model

Responses:

- Kilograms or pounds
- I do not know
- Prefer not to answer

Help text: “An estimate is fine. Weight can change, and you can update it later.”

### Q10. Waist measurement

**Question:** If you know it, what is your waist measurement at about navel level?

**Required:** No  
**Purpose:** Context only unless included in a validated model

Responses:

- Centimetres or inches
- I do not know
- Prefer not to answer

This item should be hidden in the shortest questionnaire variant unless scientific review selects a model that uses it.

### Q11. Self-rated health

**Question:** In general, how would you rate your health today?

**Required:** No  
**Purpose:** Candidate estimate input

Responses:

- Excellent
- Very good
- Good
- Fair
- Poor
- Prefer not to answer

Use this wording consistently; self-rated health categories are not interchangeable across models without recalibration.

## Section 4 — Tobacco and nicotine

Estimated time: 60 seconds

Intro: “The next questions distinguish combustible tobacco from other nicotine products because their evidence is not the same.”

### Q12. Combustible tobacco history

**Question:** Which best describes your use of cigarettes, cigars, pipes, bidis, or other burned tobacco?

**Required:** No  
**Purpose:** Candidate estimate input

Responses:

- Never used regularly
- Used in the past, not now
- Use now, but not every day
- Use every day
- Prefer not to answer

Branching:

- **Never / prefer not:** Skip Q13–Q15.
- **Former:** Ask Q13 and Q15.
- **Current:** Ask Q13 and Q14.

### Q13. Years used

**Question:** For about how many years in total have you used burned tobacco regularly?

**Required:** No  
**Purpose:** Candidate estimate input only if the selected model uses duration

Response:

- Whole years
- I do not know
- Prefer not to answer

### Q14. Current amount

**Question:** On days you use burned tobacco, about how many cigarette-equivalents do you use?

**Required:** No  
**Purpose:** Candidate estimate input only if supported by the model

Responses:

- Numeric amount per day with localized conversion help
- I do not know
- Prefer not to answer

Do not invent universal equivalence across cigarettes, cigars, pipes, hookah, and other products. Preserve product type for interpretation when needed.

### Q15. Time since quitting

**Question:** About how long ago did you stop using burned tobacco?

**Required:** No  
**Purpose:** Candidate estimate input only if supported by the model

Responses:

- Less than 1 year
- 1–4 years
- 5–9 years
- 10–19 years
- 20 years or more
- I do not know
- Prefer not to answer

### Q16. Other nicotine use

**Question:** Do you currently use vaping products, smokeless tobacco, heated tobacco, or nicotine pouches?

**Required:** No  
**Purpose:** Context only unless a validated model supports the product and exposure

Responses, select all:

- Vaping product
- Smokeless tobacco
- Heated tobacco
- Nicotine pouch or replacement product
- None
- Prefer not to answer

Do not combine this answer with combustible smoking or apply cigarette coefficients to it.

## Section 5 — Alcohol

Estimated time: 45 seconds

Before asking, show a localized visual definition of one standard drink. The definition must match the model and country guidance; serving size is not universal.

### Q17. Drinking frequency

**Question:** How often do you have a drink containing alcohol?

**Required:** No  
**Purpose:** Candidate estimate input

Responses:

- Never
- Monthly or less
- 2–4 times a month
- 2–3 times a week
- 4 or more times a week
- Prefer not to answer

Branching: If never, skip Q18 and Q19.

### Q18. Typical quantity

**Question:** On a typical day when you drink, how many standard drinks do you have?

**Required:** No  
**Purpose:** Candidate estimate input

Responses:

- 1–2
- 3–4
- 5–6
- 7–9
- 10 or more
- Prefer not to answer

### Q19. Heavy-quantity frequency

**Question:** How often do you have six or more standard drinks on one occasion?

**Required:** No  
**Purpose:** Context or candidate input only if the model uses this item

Responses:

- Never
- Less than monthly
- Monthly
- Weekly
- Daily or almost daily
- Prefer not to answer

Do not imply that starting alcohol use improves longevity. Observational associations are not a recommendation to drink.

## Section 6 — Movement, sitting, and sleep

Estimated time: 75 seconds

Use examples adapted to the user's region and include paid work, household work, transport, and recreation.

### Q20. Moderate activity

**Question:** In a typical week, on how many days do you do at least 10 minutes of activity that noticeably raises your breathing, such as brisk walking or steady cycling?

**Required:** No  
**Purpose:** Candidate estimate input

Responses:

- 0–7 days
- Prefer not to answer

Branch: If greater than 0, ask average minutes on one of those days.

### Q21. Vigorous activity

**Question:** In a typical week, on how many days do you do at least 10 minutes of activity that makes you breathe much harder, such as running, fast cycling, or heavy physical work?

**Required:** No  
**Purpose:** Candidate estimate input

Responses:

- 0–7 days
- Prefer not to answer

Branch: If greater than 0, ask average minutes on one of those days.

### Q22. Sitting time

**Question:** On a typical day, about how much time do you spend sitting or reclining while awake?

**Required:** No  
**Purpose:** Context only unless the selected model includes it

Responses:

- Less than 4 hours
- 4 to less than 6 hours
- 6 to less than 8 hours
- 8 to less than 10 hours
- 10 hours or more
- I do not know
- Prefer not to answer

### Q23. Sleep duration

**Question:** During the past month, about how many hours of actual sleep did you get in a typical 24-hour period?

**Required:** No  
**Purpose:** Candidate estimate input when supported

Responses:

- Less than 5 hours
- 5 to less than 6 hours
- 6 to less than 7 hours
- 7 to less than 8 hours
- 8 to less than 9 hours
- 9 hours or more
- I do not know
- Prefer not to answer

### Q24. Sleep quality

**Question:** During the past month, how often was your sleep restless or unrefreshing?

**Required:** No  
**Purpose:** Candidate estimate input only when wording matches the selected model

Responses:

- Never or rarely
- Sometimes
- Often
- Almost always
- Prefer not to answer

## Section 7 — Food pattern

Estimated time: 45 seconds

These broad items support reflection and future research. They should not alter the MVP estimate unless a selected model validates the exact item and response categories.

### Q25. Fruit and vegetables

**Question:** In a typical week, on how many days do you eat fruit or vegetables, not counting juice?

**Required:** No  
**Purpose:** Context only by default

Responses:

- 0–7 days
- Prefer not to answer

Branch: Ask the usual total servings on one of those days. Include localized serving pictures and examples.

### Q26. Sugary drinks

**Question:** How often do you usually drink sugar-sweetened beverages?

**Required:** No  
**Purpose:** Context only by default

Responses:

- Never or less than monthly
- 1–3 times a month
- 1–6 times a week
- Once a day
- Two or more times a day
- Prefer not to answer

### Q27. Highly processed food

**Question:** How often are packaged snacks, processed meats, fast food, or ready-made meals a main part of what you eat?

**Required:** No  
**Purpose:** Context only by default

Responses:

- Rarely or never
- Less than once a week
- 1–3 days a week
- 4–6 days a week
- Every day
- Prefer not to answer

Localize examples carefully. Do not characterize culturally specific staple foods as unhealthy without evidence.

## Section 8 — Known health and daily function

Estimated time: 60 seconds

### Q28. Clinician-diagnosed conditions

**Question:** Has a doctor or other qualified health professional ever told you that you have any of the following?

**Required:** No  
**Purpose:** Candidate estimate input only when included by the selected model

Responses, select all:

- High blood pressure
- Diabetes
- Heart disease or heart failure
- Stroke or transient ischemic attack
- Cancer, excluding non-melanoma skin cancer
- Chronic lung disease, including COPD or emphysema
- Chronic kidney disease
- None of these
- I do not know
- Prefer not to answer

Rules:

- Do not ask the user to self-diagnose.
- Do not score all cancers or disease stages as equivalent unless the model does so.
- Never display treatment advice or a disease-specific prognosis.

### Q29. Walking ability

**Question:** Because of your health, how much difficulty do you have walking about 100 metres or one city block without help?

**Required:** No  
**Purpose:** Candidate estimate input for models that include functional ability

Responses:

- No difficulty
- Some difficulty
- A lot of difficulty
- Cannot do it
- Not applicable to how I move
- Prefer not to answer

Provide an equivalent, validated mobility item for wheelchair users rather than treating “not applicable” as impairment.

### Q30. Everyday tasks

**Question:** Because of your health, how much difficulty do you have doing your usual household or daily tasks?

**Required:** No  
**Purpose:** Candidate estimate input for models that include functional ability

Responses:

- No difficulty
- Some difficulty
- A lot of difficulty
- Cannot do them
- Prefer not to answer

## Section 9 — Family and social context

Estimated time: 60 seconds

### Q31. Parent or biological parent history

**Question:** If you know, what is the current age or age at death of each biological parent?

**Required:** No  
**Purpose:** Context only unless the selected model validates these items

For each parent:

- Living, current age
- Deceased, age at death
- Unknown
- Prefer not to answer

Do not assume the cause of death or a genetic relationship from age alone.

### Q32. Premature cardiovascular family history

**Question:** Has a biological parent or sibling had a heart attack or stroke at an unusually young age?

**Required:** No  
**Purpose:** Context only unless supported by the model

Responses:

- Yes
- No
- I do not know
- Prefer not to answer

The implementation must define “unusually young” using the selected clinical or model source and localize the explanation; it must not invent a threshold.

### Q33. Meaningful contact

**Question:** How often do you have meaningful contact with friends, family, neighbours, or a community group?

**Required:** No  
**Purpose:** Context only unless the selected model validates the exact item

Responses:

- Daily or almost daily
- Several times a week
- About weekly
- A few times a month
- Monthly or less
- Prefer not to answer

“Contact” can be in person, by voice, or digital when it feels meaningful to the user.

### Q34. Loneliness

**Question:** How often do you feel lonely?

**Required:** No  
**Purpose:** Context only unless supported by the selected model

Responses:

- Never or hardly ever
- Some of the time
- Often
- Prefer not to answer

Do not infer a mental-health diagnosis from this answer.

### Q35. Perceived stress

**Question:** During the past month, how often have you felt unable to manage the important things in your life?

**Required:** No  
**Purpose:** Context only unless the complete validated scale is used according to its scoring rules

Responses:

- Never
- Almost never
- Sometimes
- Fairly often
- Very often
- Prefer not to answer

A single stress item is not the Perceived Stress Scale and must not be labelled or scored as that scale.

## Section 10 — Clock preferences

Estimated time: 45 seconds

These answers never affect the estimate.

### Q36. Modes

**Question:** Which views would you like on your clock?

**Purpose:** Preference

Responses, select all:

- Current time
- Total seconds lived
- Time lived in years, days, hours, minutes, and seconds
- Weeks lived
- Illustrative range summary, if completed
- Single illustrative horizon, if separately enabled
- Birthday or milestone
- Custom goal countdown
- Habit or project count-up
- Finite moments

### Q37. Default view

**Question:** Which view should appear when the clock starts?

**Purpose:** Preference

Responses: Any enabled mode. Do not preselect a lifespan mode.

### Q38. Brightness and quiet hours

**Question:** When should the display dim?

**Purpose:** Preference

Responses:

- Never automatically
- Use a start and end time
- Follow my phone's schedule when paired

Also provide a brightness preview and timezone selection.

### Q39. Annual review reminder

**Question:** Would you like one reminder each year to review your answers?

**Purpose:** Preference and consent for reminders

Responses:

- Yes, around this date each year
- Yes, choose a date
- No reminder

No reminder may be sent unless the user opts in. Marketing consent must be separate.

## Review screen

Before calculation, group answers into:

- Population baseline
- Potential model inputs
- Context and preferences
- Skipped answers

Required controls:

- Edit any section
- Continue with available data
- Use goal-only mode instead
- Delete answers and exit

Display the exact model inputs that will be used. An answer collected for context must never quietly become a model input after an app update; request new consent if its purpose changes.

## Result screen

### Required content

1. **Range first:** Show the selected uncertainty interval as ages and approximate calendar years.
2. **Central illustration second:** Explain that it is one point inside a broad distribution, not a prediction.
3. **Source:** Name the life table, data year, model, model version, and calculation date.
4. **Applicability:** State whether the model was validated for the user's age and reference population.
5. **Missing data:** List unavailable inputs and how the model handled them.
6. **Main factors:** Show only factors actually used, in neutral language.
7. **Controls:** Preview, enable range-only, enable a single illustrative horizon, edit answers, goal-only mode, or delete.

### Suggested result copy

> This is an illustrative planning range based on population statistics and the answers shown below. People with the same answers can have very different lifespans. Accidents, future health, medical care, environment, and chance cannot be predicted here. Do not use this result for medical, financial, or end-of-life decisions.

### Comprehension check

Before enabling a single-horizon countdown, ask:

**Which statement is correct?**

- This clock knows approximately when I will die.
- This is an uncertain statistical illustration and my actual lifespan may be very different. **(Correct)**
- This is medical advice based on my health.

An incorrect answer returns to the explanation. It must not shame the user or block goal-only features.

## Annual refresh questionnaire

Do not repeat the full onboarding by default. Show prior answers and ask the user to review:

- Current country/region baseline, if changed
- Weight
- Self-rated health
- Tobacco use and time since quitting
- Alcohol frequency and quantity
- Physical activity and sitting
- Sleep
- Food pattern
- Newly clinician-diagnosed conditions
- Walking and daily-task ability
- Social contact, loneliness, and stress
- Display comfort and preferences

Date of birth and stable history remain visible but are not re-asked unless edited. Present the previous and new result with model versions. If the model changed, separate the effect of the model update from changed answers wherever possible.

## Timing target

Target median completion by section:

- Consent and baseline: 1.5 minutes
- Body and general health: 0.75 minute
- Tobacco and alcohol: 1.75 minutes
- Movement and sleep: 1.25 minutes
- Food: 0.75 minute
- Known health and function: 1 minute
- Family and social context: 1 minute
- Preferences and review: 1 minute

Total target: approximately 9 minutes with typical branching. Test timing with users; do not claim “10 minutes” solely from internal reading speed.

## Accessibility and localization

- Use plain language and a reading level appropriate to the launch market.
- Make every question keyboard- and screen-reader-accessible.
- Never encode meaning by colour alone.
- Provide metric and imperial units without changing stored canonical units.
- Localize standard-drink and food-serving visuals with qualified review.
- Translate through forward translation, expert review, and back-translation for scored items.
- Preserve the exact wording required by any validated model and record questionnaire version.
- Allow save-and-return locally without creating an account.

## Quality and validation checklist

Before release:

- A biostatistician or epidemiologist maps every candidate input to a published coefficient and response category.
- A clinician reviews wording for ambiguity without turning the product into a diagnostic tool.
- A privacy reviewer verifies purpose, consent, retention, and deletion for every field.
- At least 15 cognitive interviews cover different ages, education levels, countries, abilities, and health statuses.
- At least 50 unmoderated tests measure completion time, drop-off, missingness, comprehension, and discomfort.
- Scored translations are tested rather than assumed equivalent.
- Unit conversion, branching, “none” exclusivity, impossible dates, and missing-answer behavior have automated tests.
- The campaign discloses which questions are context only and which actually affect the result.

## Source framework

Question domains and phrasing should be reconciled with:

- [WHO STEPwise approach to noncommunicable disease surveillance](https://www.who.int/teams/noncommunicable-diseases/surveillance/systems-tools/steps/instrument)
- [WHO life expectancy and life-table definitions](https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy)
- [Lifestyle mortality index developed in older cohorts](https://doi.org/10.1038/s41598-018-24778-1), noting that its validation population was age 50+ and does not establish validity for all adults

The final model documentation must identify the source for every scored item. Borrowing familiar health questions does not validate a new combined score.
