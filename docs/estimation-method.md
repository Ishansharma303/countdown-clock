# Countdown Clock Estimation Method

Status: Method specification; not an approved clinical or actuarial model  
Output: Illustrative population-based planning range  
Required reviewers before public accuracy claims: Biostatistician/epidemiologist, privacy counsel, and product-safety reviewer

## Executive decision

The Kickstarter MVP may calculate a transparent range from public life tables. It must not claim that the questionnaire predicts an exact lifespan for a global 18+ audience until a model has been selected, licensed, recalibrated, and externally validated for that use.

The questionnaire can collect candidate factors and show a factual input summary. It may personalize the range only when every scored factor and coefficient comes from a suitable published model. Repeated annual answers improve freshness; they do not prove accuracy.

## What the product estimates

The product estimates a distribution of age at death for a population with selected characteristics. It does not estimate the date or cause of an individual's death.

Terms used in the product:

- **Current age:** Exact elapsed time from a supplied birth date/time.
- **Population baseline:** Conditional survival distribution from a selected life table.
- **Illustrative range:** Two quantiles from that distribution, recommended as the 10th and 90th percentiles of age at death.
- **Central horizon:** Median age at death, where the modeled conditional probability of surviving beyond that age reaches 50%.
- **Life expectancy at current age:** Mean remaining years in the life table. This is not the same as the median horizon and must be labelled separately if shown.
- **Personalized model:** A validated model that changes the baseline using supported individual predictors.
- **Scenario:** A non-predictive comparison showing how a model responds to hypothetical inputs. It must never be presented as years a user will gain or lose.

The physical clock may count to one user-selected point, but it must keep an `EST` indicator and the companion experience must show the range and method.

## Estimation tiers

### Tier 0 — Exact chronological modes

No mortality data is involved.

- Time lived
- Time to a custom goal
- Time since a habit or project started
- Time to birthday or milestone

These modes calculate directly from timestamps and should remain available if all health data is declined or deleted.

### Tier 1 — Population life-table range

Inputs:

- Current age
- Reference country/region
- Selected life-table category: female, male, or blended
- Life-table data year and type

Output:

- Conditional age-at-death distribution
- 10th percentile age
- Median age
- 90th percentile age
- Source, period, category, and fallback disclosures

This is the recommended minimum Kickstarter implementation.

### Tier 2 — Validated survey personalization

Additional inputs may include only variables required by a selected model, using its exact definitions and response categories. The model must pass the acceptance gates in this document.

Output must preserve Tier 1 alongside the personalized distribution so users can see what changed. Do not show a single number without its baseline and uncertainty.

### Tier 3 — Wearable-informed personalization

This is future scope. It requires a separately validated longitudinal model and data-quality handling. Steps, sleep, or heart rate cannot be inserted into a survey model merely because they are available.

## Life-table source policy

Preferred source order:

1. A current, official national complete life table when its definitions, licence, and update policy are suitable.
2. A comparable WHO life table for the selected country or region.
3. A named WHO regional or global fallback.

The MVP should support one reviewed source family consistently before mixing national sources. WHO publishes age- and sex-specific life expectancy and mortality estimates through the [Global Health Observatory](https://www.who.int/data/gho/data/indicators/indicator-details/GHO/life-expectancy). The latest available observation may lag the product year; always display the source year.

### Period versus cohort tables

A period life table applies mortality rates observed during a period as if they continued through the user's remaining life. It does not forecast medical progress, wars, pandemics, migration, or future policy. Label a period-table result accordingly.

Do not add an unsupported “future medicine” bonus. A cohort projection may be used only when the source supplies one and its assumptions are documented.

### Required source metadata

Store with each imported table:

- Publisher
- Dataset and table name
- Jurisdiction
- Publication date
- Observation/reference year
- Period or cohort designation
- Age intervals
- Category definitions
- Source URL
- Licence and attribution
- Retrieval date
- File checksum
- Importer version
- Known quality notes

Never overwrite a published table in place. Import a new immutable version.

## Conditional survival calculation

Let:

- `a` be the user's exact current age.
- `l(x)` be the life-table number surviving to exact age `x` from a conventional radix.
- `S_a(t)` be the probability, conditional on survival to age `a`, of surviving at least `t` more years.

For ages represented in the table:

`S_a(t) = l(a + t) / l(a)`

This conditional calculation matters: life expectancy at birth is not the correct value for a person who has already reached adulthood.

### Abridged life tables

When only interval death probabilities `nqx` are available, calculate a constant interval hazard for interpolation unless the source specifies another method:

`mu_x = -ln(1 - nqx) / n`

Survival across a partial interval of duration `d` is then:

`exp(-mu_x × d)`

Accumulate interval hazards from current age to each candidate age. Do not linearly interpolate life expectancy values or apply one mortality rate to all future ages.

The open-ended final age interval needs an explicit source-approved extrapolation. Prefer a table that supplies complete old-age survival. If a reliable upper tail is unavailable, do not report a high percentile that depends on it; widen or truncate the output and explain why.

### Distribution outputs

Define conditional cumulative probability of death by future age `y` as:

`F_a(y) = 1 - l(y) / l(a)`, for `y >= a`

Recommended outputs:

- Lower age: first age where `F_a(y) >= 0.10`
- Central age: first age where `F_a(y) >= 0.50`
- Upper age: first age where `F_a(y) >= 0.90`

Interpolate within an age interval using the same hazard assumption. These are statistical quantiles, not confidence intervals around a known individual date.

If mean remaining life is needed, use the life-table person-years definition, commonly `e(a) = T(a) / l(a)`, according to the source. Do not label this mean as the median countdown target.

### Exact countdown timestamp

After the user deliberately selects a central, lower, or upper illustrative age:

1. Convert the selected age to a calendar timestamp relative to the birth timestamp.
2. Preserve calendar semantics for leap years; do not multiply decimal years by a fixed 365 days for long horizons.
3. Use the user's timezone for display.
4. Count down with device time only; the statistical estimate does not recalculate each second.
5. Persist which quantile and model version produced the timestamp.

If the calculated point is earlier than the current time because of a data or model edge case, do not show zero or a negative death countdown. Suppress the result and flag it for review.

## Blended and fallback baselines

### Blended category

Do not average male and female life expectancies. Blend survival curves at each age:

`S_blend(t) = w × S_female(t) + (1 - w) × S_male(t)`

Use documented population weights or equal weights if the product explicitly says so. Recalculate quantiles from the blended curve.

### Multiple-country history

Do not average country life expectancies based on guessed years of residence. If the user cannot select a representative country, use a named regional/global fallback and widen the disclosure. A future migration-aware model would require validated exposure assumptions.

### Missing source

If no suitable table exists:

- Explain that a country-specific estimate is unavailable.
- Offer a named regional/global baseline.
- Let the user continue in goal-only mode.
- Never substitute a neighbouring country silently.

## Personalized model acceptance gates

A candidate model must satisfy all of the following before it changes a user's horizon:

1. **Relevant outcome:** All-cause mortality or age-at-death distribution appropriate to the displayed claim.
2. **Relevant horizon:** The model's prediction horizon supports the intended extrapolation. A validated 4- or 10-year mortality model does not automatically support lifetime projection.
3. **Relevant ages:** The user is inside the development or external-validation age range.
4. **Relevant population:** Geography, calendar period, and care setting are reasonably applicable or the model has been recalibrated using representative data.
5. **Available specification:** Coefficients, baseline hazard/survival, centering, transformations, interactions, and missing-data rules are fully available.
6. **Input fidelity:** Questionnaire wording and categories match the model variables.
7. **External validation:** Discrimination and calibration were assessed outside the development sample.
8. **Subgroup review:** Performance and harm are reviewed across age, sex category, location, disability, and other relevant groups.
9. **Licence:** Product use, implementation, and attribution are permitted.
10. **Independent review:** A qualified statistician signs off on implementation and claim language.

A published association, hazard ratio, wellness guideline, or risk-factor meta-analysis is not enough to build an individual lifetime prediction.

## Why coefficients cannot simply be combined

A proportional-hazards model may have a form such as:

`linear_predictor = beta_1 × x_1 + ... + beta_p × x_p`

and:

`S(t | x) = S_0(t) ^ exp(linear_predictor - centering)`

This equation is usable only with the model's own baseline survival, coefficients, transformations, centering, time origin, and target population. Applying its relative risks directly to a WHO survival curve can:

- Double-count country, age, or sex effects
- Break calibration
- Extrapolate beyond the validated time horizon
- Produce impossible or misleading lifetime tails

Recalibration must be specified and tested by a statistician. Until then, the product should show the life-table baseline and treat questionnaire factors as context, not covert adjustments.

## Candidate model note

A published [Lifestyle Mortality Index](https://doi.org/10.1038/s41598-018-24778-1) uses age, sex, smoking, alcohol, exercise, restless sleep, and BMI and was evaluated across ageing cohorts in the United States, United Kingdom, and Europe. Its reported population was age 50 and older, and its main outcome was mortality over follow-up rather than a universal lifetime date.

It is useful evidence that a short lifestyle questionnaire can stratify risk in some older populations. It is not evidence for a global 18+ exact lifespan calculator. Scientific review should evaluate this and other models without implying that one has already been selected.

## MVP personalization rule

Until a candidate passes all gates:

- Calculate Tier 1 from the life table.
- Show the user's health answers as a private review summary.
- Label all lifestyle comparisons as educational scenarios.
- Do not move the central horizon based on unvalidated weights.
- Do not claim that completing more questions increases accuracy.

If the campaign requires a demonstrated personalized estimate, narrow eligibility to the validated age/population and disclose that boundary prominently. Do not broaden the model for marketing convenience.

## Missing data

For each model, implement exactly one reviewed missing-data policy:

- Decline personalization and return Tier 1 when required variables are absent; or
- Use the model's validated imputation procedure and clearly disclose which values were imputed.

Never:

- Treat “prefer not to answer” as “no,” “never,” or healthy
- Carry a stale answer forward without showing it during annual review
- Infer a sensitive answer from unrelated device or account data
- Use a population average imputation unless the model validation included that method

Return a machine-readable list of used, missing, declined, and context-only fields.

## Output contract

Each calculation should produce an immutable result snapshot similar to:

```json
{
  "calculationId": "local-random-id",
  "calculatedAt": "ISO-8601 timestamp",
  "questionnaireVersion": "semver",
  "methodTier": "population-baseline",
  "model": {
    "id": "who-life-table",
    "version": "dataset/importer version",
    "validatedForUser": true,
    "limitations": ["period table", "survey factors not applied"]
  },
  "source": {
    "jurisdiction": "selected or fallback region",
    "referenceYear": 2021,
    "category": "female|male|blended",
    "url": "source URL"
  },
  "inputs": {
    "usedFieldIds": ["birthDate", "referenceRegion", "baselineCategory"],
    "missingFieldIds": [],
    "declinedFieldIds": [],
    "contextOnlyFieldIds": []
  },
  "result": {
    "currentAgeYears": 0,
    "lowerAgeP10": 0,
    "centralAgeP50": 0,
    "upperAgeP90": 0,
    "selectedDisplayQuantile": "p50",
    "selectedDisplayTimestamp": "ISO-8601 timestamp"
  }
}
```

The sample numbers are placeholders, not defaults. Raw health answers should be stored separately from the result so the user can delete them without corrupting ordinary clock settings.

## Result explanation

Always show:

- “This result describes a statistical distribution, not your personal date of death.”
- Lower, central, and upper ages together
- Source publisher and year
- Period/cohort type
- Whether questionnaire factors changed the baseline
- Whether the model was validated for the user's age and population
- Missing or imputed inputs
- Calculation and questionnaire versions
- Link to delete or switch to goal-only mode

Do not show:

- Accuracy to the day or second in explanatory copy
- A health grade, leaderboard, or comparison with named people
- A claim that one changed answer caused a fixed number of added years
- Disease-specific advice
- Probability claims not produced by the model

## Annual refresh

### Inputs

On the chosen annual date, ask the user to confirm or change only relevant fields. Birth date and historical answers remain visible but are not needlessly re-entered.

### Version comparison

Create immutable snapshots for:

- `A`: old inputs with old model
- `B`: old inputs with new model, if the model or life table changed
- `C`: new inputs with new model

When calculations are comparable:

- `B - A` represents the effect of updated population data/model.
- `C - B` represents the model's response to changed answers.

Call the latter a **modeled difference**, not added or lost life. If the old inputs cannot run on the new model, state that the changes cannot be separated.

### User control

- Do not update the physical countdown until the user reviews and confirms the new range.
- Allow the user to retain the previous horizon with its older source label.
- Allow deletion of all snapshots.
- Send no annual reminder without opt-in.
- Never create urgent alerts from a changed horizon.

## Wearable extension rules

Wearable personalization needs a new method version and validation dataset. Before using any signal:

- Define the exact data type, unit, source, minimum wear time, aggregation window, and missingness threshold.
- Deduplicate records from multiple devices.
- Detect implausible values without converting them into health conclusions.
- Use a minimum 30–90-day window for stable summaries unless the validated model specifies otherwise.
- Recalculate monthly or quarterly, not second-by-second.
- Show whether the result used sufficient data.
- Keep survey-only and wearable-informed results separately identifiable.

Candidate read-only signals for research are steps, sleep duration, and resting heart rate. Availability alone is not evidence that these improve lifetime prediction.

## Software verification

### Unit tests

- Conditional survival at exact and fractional ages
- Leap-year and timezone conversion
- Quantile interpolation
- Open-ended age handling
- Blended survival curves
- Missing and declined inputs
- Power-loss timestamp recovery
- Model and source version persistence
- Annual A/B/C decomposition

### Data tests

- Monotonic non-increasing survival
- Death probabilities within `[0, 1]`
- No negative person-years or remaining time
- Quantiles ordered `p10 <= p50 <= p90`
- Source age intervals contiguous and non-duplicated
- Checksums and expected row counts

### Statistical validation

For every personalized model, report at minimum:

- Sample characteristics and event count
- External-validation population
- Calibration-in-the-large and calibration slope
- Calibration plots at supported horizons
- Discrimination such as C-index or time-dependent AUC
- Overall error such as Brier score where appropriate
- Performance by relevant subgroups
- Missing-data sensitivity
- Decision on acceptable use and known failure modes

Do not use discrimination alone; a model can rank risk while giving badly calibrated absolute probabilities.

## Governance

Assign named owners for:

- Source-data updates
- Statistical model approval
- Questionnaire versioning
- Privacy review
- Safety copy
- Incident response
- Campaign claims

Any change to coefficients, source tables, imputation, question wording, or displayed quantiles requires a new version and regression test. Material changes require renewed scientific and privacy review.

## Go/no-go checklist for a personalized Kickstarter claim

A personalized claim is **no-go** unless:

- A specific model and permitted implementation are documented
- The target backer population falls inside its validated use
- Absolute calibration has been checked on representative external data
- The full range is more prominent than the single horizon
- Missing-answer behavior is tested
- Users understand the uncertainty in comprehension testing
- A qualified reviewer has approved the method and copy
- The working prototype demonstrates the same method promised in the campaign

If any item fails, launch with the Tier 1 population range and goal-focused modes. That product remains coherent and honest without an unsupported accuracy claim.
