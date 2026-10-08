# How existing training apps model, plan and adapt multi-sport / hybrid (endurance + strength) training — lessons for idmanSK

Scope note: research done 2026-10-08 via web search; several vendor help-center domains (e.g. support.polar.com) were blocked for direct fetch, so some details come from search-result extracts of official pages. Vendor algorithms are mostly proprietary; where only inputs (not formulas) are public, this is stated. "idmanSK" = the user's own phone web app + Google Sheets (swim rep timing, CSS zones, gym logging with RPE + pain MSI 0–3, load = min × sRPE, weekly load target, joint health budgets, 4-week cycle, daily readiness, weekly planner with interference warnings).

## 1. Load models that combine sports: TrainingPeaks/WKO, intervals.icu, Golden Cheetah

### Takeaway
The dominant model is a per-session stress score normalised to "1 h at threshold = 100" (TSS family, incl. sTSS for swimming = IF³ × hours × 100), summed across sports into one Banister-type fitness/fatigue/form chart (CTL ≈ 42-day EWMA, ATL ≈ 7-day EWMA, TSB = CTL − ATL), with ramp-rate guard rails (~5–8 CTL/week) and colour-coded plan compliance. Strength work fits this model badly: intervals.icu by default lets HR-based strength load count toward fatigue only, not fitness — a strong precedent for idmanSK keeping gym load in a separate channel.

### Cited Findings
- sTSS (TrainingPeaks) is based on functional threshold swim pace (FTSP), total distance and total *moving* time (rest excluded); it is the default swim score when data allow and requires a threshold speed set in swim zones — [TrainingPeaks Help](https://help.trainingpeaks.com/hc/en-us/articles/204071944)
- Formula published by TrainingPeaks: IF = avg pace (m/min) ÷ threshold pace; sTSS = IF³ × duration (h) × 100. Worked example: 1600 m in 23:10 → 69 m/min vs FTSP 75 m/min → IF 0.92 → ~30 TSS. TP acknowledges the simplified time/distance method neglects rest periods — [TrainingPeaks blog: Calculating Swimming TSS](https://www.trainingpeaks.com/learn/articles/calculating-swimming-tss-score/)
- Threshold tests suggested by TP: farthest distance in 30 or 60 min (30-min result ×2 −2.5 % to approximate 1 h); practitioners commonly use 1000 m TT or CSS 400/200 test and enter it as threshold — [TrainingPeaks blog](https://www.trainingpeaks.com/blog/calculating-swimming-tss-score/); [Slowtwitch forum](https://forum.slowtwitch.com/t/training-peaks-stss/778964)
- Cross-platform inconsistency: a user reports WKO5 swim TSS consistently ~50 % lower than TrainingPeaks for the same session and same threshold; TP support reportedly said manual time+distance entry cannot give accurate swim TSS — [Slowtwitch: Swim TSS TP vs WKO5](https://forum.slowtwitch.com/t/swim-tss-trainingpeaks-vs-wko5/798092) (anecdotal)
- A third-party site gives a squared (not cubed) swim formula with CSS as baseline — conflicts with TP's published cubed IF — [ctyeh.com](https://ctyeh.com/articles/761?lang=en)
- intervals.icu: fitness = 42-day EWMA of load, fatigue = 7-day EWMA; form = fitness − fatigue; form colour bands (green rested, yellow in-between, red worn out, grey insufficient data); intervals.icu uses today's values while TP uses yesterday's, explaining small differences — [intervals.icu forum](https://forum.intervals.icu/t/fitness-fatigue-and-form-strava-training-peaks-and-intervals-icu/2803); [forum: CTL/ATL factors](https://forum.intervals.icu/t/change-fatigue-atl-and-fitness-ctl-factors/300/19) (time constants are user-adjustable)
- intervals.icu default for weight training: HR-based load counts 100 % toward fatigue but 0 % toward fitness ("since they are not cardio"), shown as "(0)" on calendar; user can set weight training to 100 % to mimic TrainingPeaks. No per-exercise load model — [intervals.icu forum: strength into fitness/fatigue](https://forum.intervals.icu/t/factoring-strength-workouts-into-training-load-fitness-fatigue/56500); [forum: strength loads](https://forum.intervals.icu/t/solved-strength-workout-loads-no-longer-counted/685/17)
- Ramp rate: TP says a safe 7-day ramp is ~4–8 CTL points, >8 often leads to injury for most athletes; TP mobile PMC shows ramp rate over 7/28/90/365 days; Joe Friel suggests 5–8/week, warns if above that "a few weeks in a row" — [TrainingPeaks blog: track triathlon training](https://www.trainingpeaks.com/blog/track-triathlon-training-trainingpeaks/); [TP: 4 new mobile features](https://www.trainingpeaks.com/blog/4-new-mobile-features-you-should-know-about/)
- TSB is typically negative during training, positive near races/after rest; no official TP TSB band found — [Triathlete](https://www.triathlete.com/gear/tech-wearables/which-trainingpeaks-metrics-should-you-actually-care-about/?scope=anon)
- TP compliance colours: Green = completed within ±20 % of planned; Yellow = 50–79 % or 121–150 %; Orange = >50 % off; Red = not completed; Grey = unplanned. Metric hierarchy TSS → duration → distance (configurable); indicator shows which metric and whether over/under; mobile shows a colour strip on the card — [TrainingPeaks Help](https://help.trainingpeaks.com/hc/en-us/articles/204861204)
- TrainingPeaks now supports athletes logging strength sessions that coaches review — [TP Help: Reviewing logged strength sessions](https://help.trainingpeaks.com/hc/en-us/articles/27972623640333-Reviewing-Your-Athletes-Logged-Strength-Sessions)

### Inferences
- idmanSK's swim load could be computed two ways in parallel: sRPE × min (current) and a CSS-based sTSS-like score (IF = pace/CSS, IF³ × h × 100, moving time only — idmanSK already times each rep, so it can exclude rest, avoiding TP's known weakness). Disagreement between the two flags mis-set CSS or RPE drift.
- Copy intervals.icu's "cardio vs non-cardio" split: gym load contributes to fatigue (ATL) and to a separate muscular/joint channel, but optionally not to swim "fitness". Show two curves rather than one blended number.
- Adopt a ramp-rate warning on 7-day vs 28-day load (e.g., week-over-week increase cap) as an explicit planner guard; also a TP-style ±20 % compliance colour on each planned session using idmanSK's own metric hierarchy (load → minutes → distance/sets).
- Since TSS-family numbers differ by up to 50 % between platforms for swimming, absolute values matter less than consistent self-referenced trends.

### Gaps
- Golden Cheetah's specific swim score (GOVSS/SwimScore/TriScore) not researched in this pass — no sources gathered.
- hrTSS formula details (TP) not verified in this pass.
- No official TP numbers for recommended TSB range.

## 2. AI / adaptive endurance planners (TrainerRoad, Humango, Athletica, MySwimPro, FORM)

### Takeaway
Adaptive planners do three things: (a) keep a per-zone ability score ("Progression Levels") updated from completed-workout difficulty and success; (b) treat unlogged sessions as skipped and propose adaptations the user must accept; (c) re-balance the week's load after a miss (move/delete/skip → recompute). Swim-specific apps are weaker: FORM serves pre-built workouts on AR goggles; MySwimPro's adaptation is only described by third parties.

### Cited Findings
- TrainerRoad Progression Levels: a 1–10 score per training zone describing ability at current FTP, set by the Workout Levels of recent workouts and how successfully they were completed — [TrainerRoad Support: Adaptive Training Overview](https://support.trainerroad.com/hc/en-us/articles/4404060687387-Adaptive-Training-Overview)
- TrainerRoad: for swim and run workouts, anything not marked completed is considered skipped and triggers adaptations for future workouts; adaptations appear as "Adaptations Pending" and the user accepts them in a Plan Adaptation Overview — [TrainerRoad Support](https://support.trainerroad.com/hc/en-us/articles/4404060687387-Adaptive-Training-Overview); [TrainerRoad blog: how to use Adaptive Training](https://www.trainerroad.com/blog/how-to-use-adaptive-training/)
- Users report that small FTP increases can sharply drop Progression Levels (e.g., "5 W ftp improvement shouldn't take you from a 3.7 to a 1"), and that missed workouts of a zone often reappear the next week — [TrainerRoad forum](https://www.trainerroad.com/forum/t/adaptive-training-is-now-out-of-beta-fully-available-to-all-trainerroad-athletes/62164?page=12) (anecdotal)
- Athletica: a missed workout can be moved later in the week, deleted or skipped; the coach recalculates "stress balance" and rebuilds load across the week. Morning colour-coded readiness from HRV and RHR; low readiness → lighter variants or substitution (e.g., swim/bike instead of run), high readiness unlocks quality sessions; S&C from a shared library — [Athletica: Sprint triathlon plan](https://athletica.ai/sprint-triathlon-training-plan/); [Athletica: half marathon](https://athletica.ai/half-marathon-training-plan-ai-powered-personalized-program-athletica-ai); [Athletica: HYROX](https://athletica.ai/smarter-hyrox-training/) (vendor marketing)
- Humango ("Hugo" AI coach): builds workouts around goals, fitness and *daily availability*; adapts plan when you miss a session, travel or are fatigued; swim/bike/run/strength in one plan; multiple races in one master calendar — [App Store listing](https://apps.apple.com/app/id1554430755); [Challenge Family](https://challengefamily.com/news/one-season-one-plan-how-humango-is-ending-the-spreadsheet-struggle-for-challenge-family-athletes/) (vendor/partner claims; mechanism undocumented)
- FORM goggles: guided workouts displayed in AR in real time; pre-built workouts downloaded to the goggles; Workouts membership $19.99/mo or $179.99/yr; core real-time metrics free — [BusinessWire 2021](https://www.businesswire.com/news/home/20210824005120/en/Fitness-Technology-Company-FORM-launches-First-of-its-kind-Guided-Workouts-Powered-by-the-FORM-Smart-Swim-Goggles); [VentureBeat](https://venturebeat.com/arvr/form-launches-workouts-feature-for-smart-swim-ar-goggles)
- MySwimPro: a third-party review says it builds adaptive sets, classifies strokes from accelerometer data and adjusts the plan on missed sessions — unverified against MySwimPro docs — [aitoolsbakery](https://aitoolsbakery.com/?p=10828)

### Inferences
- idmanSK could keep a per-domain "level" (e.g., swim aerobic / threshold / sprint; gym per movement pattern) updated after each session from planned vs achieved (rep paces vs target CSS zone, reps × load vs target, RPE vs target). This is TrainerRoad's idea applied without power data.
- Use "pending adaptation" UX: never silently rewrite the week; show a diff ("Thursday threshold set moved to Saturday; Friday gym trimmed 1 set") and an Accept button. Fits single-user control well.
- Missed-session rule set à la Athletica: move (if a slot exists without breaking interference rules), drop (if week load already ≥ target − tolerance), or merge partial. Recompute weekly load target and health budgets after each change.
- Readiness-driven substitution (Athletica swaps run for swim/bike) maps to idmanSK as: low readiness or shoulder pain → swap hard swim for kick/drill/technique; knee pain → swap breaststroke for freestyle/pull.

### Gaps
- No official documentation found for how TrainerRoad changes Progression Levels after a miss, nor Humango's rescheduling algorithm.
- MySwimPro and Swim.com adaptation logic not verified from primary sources.

## 3. Strength apps: progression algorithms and volume management

### Takeaway
Strength apps autoregulate at three time scales: within-session (RPE/RIR per set → next-set load), per-session/week (feedback on soreness, pump, workload, joint pain → add/hold/remove sets), and per-block (deload, volume reset). RP's MEV/MAV/MRV landmarks are per-muscle weekly set budgets, conceptually identical to idmanSK's joint health budgets. Fitbod exposes a per-muscle "recovery %" that decays over ~6–7 days and steers exercise selection.

### Cited Findings
- RP Hypertrophy: weight rises a few percent per week; if the next plate jump is too large it adds a rep per set instead; set counts come from feedback on pump, soreness and workload; weak pump + little soreness + "easy" → more sets; strong pump + normal soreness + "pushing limits" → volume unchanged. Exact thresholds unpublished — [RP Help Center](https://help.rpstrength.com/hc/en-us/articles/32600173777815-How-does-the-app-determine-when-to-add-weight-reps-and-sets)
- RP app uses real-time feedback on soreness, pump, *joint pain* and workload — [RP Hypertrophy app page](https://rpstrength.com/hypertrophy-app)
- RP volume landmarks: MEV = minimum weekly sets that produce gains; MAV = range of best gains between MEV and MRV; MRV = most volume you can recover from. Sample: start at MEV 12 sets, +2 sets/week toward MRV 20, deload week at ~6 sets; landmarks are individual and calibrated by experimentation — [RP: Training Volume Landmarks](https://rpstrength.com/training-volume-landmarks-muscle-growth/); [RP: Ab training](https://rpstrength.com/blogs/articles/ab-training)
- Third-party summary: mesocycle 4–6 accumulation weeks + 1 deload (~50 % volume); intermediates often 4 weeks; +1 set per muscle per week — [arvo.guru](https://arvo.guru/resources/methods/rp-training) (secondary)
- Juggernaut AI: pre-session readiness (official: sleep, mood, energy, soreness) modifies that day's volume or weight; per-set RPE adjusts subsequent sets in real time; end-of-session data feeds a running weighted-average readiness score; weekly and end-of-block adaptations — [JTS Help: how JuggernautAI is individualized](https://help.jtsstrength.com/en/articles/3-how-juggernautai-is-individualized-to-you); [JTS Help: RPE and RIR](https://help.jtsstrength.com/en/articles/2-all-about-rpe-and-rir)
- Review: Juggernaut asks 1–5 ratings (motivation, sleep, calories, soreness/fatigue) and per-muscle soreness; if quads/glutes are very sore it lowers that day's squat load only, not the whole block — [Garage Gym Reviews](https://garagegymreviews.com/juggernautai-review)
- Fitbod muscle recovery: estimated from logged sets, reps and load (plus body stats, synced cardio), score 0–100 %; muscles considered fully recovered after ~6 days (another Fitbod post says up to 7); app avoids muscles at 0 %; user can manually override % — [Fitbod Help: Muscle Recovery](https://help.fitbod.me/hc/en-us/articles/360006269014-Muscle-Recovery); [Fitbod blog](https://fitbod.me/blog/tracking-volume-intensity-and-recovery-with-fitbod/); [Fitbod blog: muscle recovery](https://fitbod.me/blog/muscle-recovery/)
- Alpha Progression: progression recommendations based on double progression (rep range; add weight once top of range is reached), RIR used to judge effort; autoregulation suggests raising/lowering weight or reps according to how strong/recovered you feel — [Alpha Progression glossary: double progression](https://alphaprogression.com/en/glossary/double-progression); [Alpha Progression: RIR](https://alphaprogression.com/en/blog/reps-in-reserve); [Alpha Progression: autoregulation](https://alphaprogression.com/en/glossary/autoregulative-training)
- Hevy logging UX: "previous values" shown inline (choose last performance anywhere vs last within this routine); RPE column optional per set (off by default; no RPE targets in routines); supersets/circuits with colour coding; per-exercise auto rest timer starting on set completion; editing a routine mid-session then "update the original routine?" prompt at finish — [Hevy: workout settings](https://www.hevyapp.com/features/workout-settings/); [Hevy: supersets](https://www.hevyapp.com/features/what-are-supersets/); [Hevy Help: build a program](https://help.hevyapp.com/hc/en-us/articles/34953606698903-Build-a-Workout-Program-Create-Organize-Routines)

### Inferences
- Map RP landmarks onto idmanSK health budgets: each budget (shoulder load, breaststroke %, knee-flexion sets) gets MEV-like floor, MAV-like target band and MRV-like ceiling, rising across Volume → Volume+ and dropping in Deload. The 4-week cycle already matches RP's 3 accumulation + 1 deload pattern.
- Add RP-style post-session feedback (2–3 taps: pump/"worked", soreness by next session, joint pain) and a deterministic rule table ("pain ≥2 or soreness persisting → hold/remove a set; easy + no soreness → +1 set next week"). idmanSK's MSI 0–3 already equals RP's joint-pain input; make it actionable on volume.
- Fitbod-style per-muscle/joint "recovery %" with a linear or exponential decay over ~3–6 days from the last loading session could drive the planner's interference warnings (e.g., shoulder recovery < 50 % → warn before a hard pull/fly swim set). Must count swim strokes as shoulder load (Fitbod only partly factors cardio).
- Double progression with RIR cap is the simplest transparent rule for idmanSK gym: rep range per exercise; when all sets hit top of range at RIR ≥ target → +load next time.
- Copy Hevy's "previous values inline" and "update template?" prompt — both reduce logging friction.

### Gaps
- Exact RP set-adjustment table, Juggernaut readiness weights, Fitbod recovery curve formula: not public.
- Strong app specifics not researched (assumed similar to Hevy).

## 4. Readiness: wearable scores vs subjective inputs

### Takeaway
All wearable readiness scores are baseline-relative composites of overnight physiology (HRV, RHR, temperature, sleep) plus recent load, binned into 3–5 coloured bands; none publish weights. Training-adaptive apps without wearables (Juggernaut) use a 4–5-item subjective questionnaire that directly scales the day's load — exactly idmanSK's approach, which session-RPE literature supports.

### Cited Findings
- Garmin Training Readiness inputs: last night's sleep score, recovery time, HRV status, acute load, sleep history (3 nights), stress history (3 days); continuously updated; bands Prime 95–100, High 75–94, Moderate 50–74, Low 25–49, Poor 1–24; weights unpublished — [Garmin manual: Training Readiness](https://www8.garmin.com/manuals/webhelp/GUID-31D23DBB-57C2-4DF7-A0C9-8D1A00AB4BE7/EN-US/GUID-C21BE0C8-A08E-4DA1-B6C6-2E0E2DDDB372.html)
- Garmin Training Load Focus: 7-day EPOC sum split into low aerobic / high aerobic / anaerobic with target ranges; states "below targets", shortage per category, balanced, focus, above targets; needs ~1 week of data, 4 weeks for detailed targets — [Garmin manual: Training Load Focus](https://www8.garmin.com/manuals/webhelp/GUID-FFD1507E-4334-4F3A-A927-C80BA10A9918/EN-US/GUID-C3205D96-DAB6-4C93-A225-5B8D7B5A5621.html); [Garmin manual: Training Status](https://www8.garmin.com/manuals-apac/webhelp/forerunner965/EN-SG/GUID-8224236E-D732-45DA-BE5B-620E9F0D370F-3127.html)
- WHOOP Recovery: 0–100 % each morning from RHR, HRV, respiratory rate, sleep, skin temp, SpO2; bands green 67–100, yellow 34–66, red 0–33; Strain on 0–21 scale — [WHOOP Developer: WHOOP 101](https://developer.whoop.com/docs/whoop-101); HRV most heavily weighted per a secondary explainer — [wearablebeat](https://wearablebeat.com/articles/how-does-whoop-work-sensors-recovery-scores-and-strain-explained/)
- Oura Readiness: 9 contributors (RHR, HRV balance, body temperature, recovery index, sleep, sleep balance, sleep regularity, previous-day activity, activity balance); bands Optimal 85–100, Good 70–84, Fair 60–69, Pay attention 0–59; activity balance = last 14 days (recent weighted) vs 2-month level; baselines take ~2 weeks to learn — [Oura Help](https://support.ouraring.com/hc/en-us/articles/360057791533); marketing page says 7 contributors — [Oura blog](https://ouraring.com/blog/readiness-score/)
- Session-RPE (Foster 2001) validity: 2017 review of 36 validity/reliability studies supports sRPE (CR-10 × min) as a stand-alone load method across sports — [Haddad et al. 2017, Front Neurosci](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5673663/)
- Swimming: in 12 well-trained swimmers over 20 sessions, sRPE correlated with HR-based load r = 0.55–0.94 and distance r = 0.37–0.81; coach RPE lower than athlete's for easy sessions and higher for hard ones — [Wallace, Slattery & Coutts 2009 (UTS)](https://opus.lib.uts.edu.au/handle/10453/9495)

### Inferences
- idmanSK's subjective readiness (sleep, soreness, energy, joint pain) is a defensible wearable-free equivalent; improve it with Oura-style *baseline-relative* scoring (compare to own 14–28-day rolling mean, not absolute) and a 2-week "learning" period flag.
- Add a load-derived component like Garmin's "acute load" and Oura's "activity balance": readiness = f(subjective items, yesterday's load vs 28-day mean). Show contributors as individual bars so "why" is visible.
- 3-band output (green/yellow/red) with explicit actions (WHOOP/Athletica): green → do plan; yellow → keep session, cut volume ~20–30 % or intensity one zone; red → technique/recovery swim or mobility only. Any joint pain ≥2 overrides to red for that joint's exercises only (Juggernaut "this session only" principle).
- A Garmin-style "load focus" split for swim (aerobic / threshold / sprint by CSS zone minutes) could show shortages across the 4-week cycle.

### Gaps
- No vendor publishes weightings; no validation found here for Garmin Training Readiness specifically.
- Validation of sRPE for resistance training not retrieved in this pass (known literature exists, e.g. Day et al. 2004, but not verified here).

## 5. Hybrid / concurrent-specific models: cardio vs muscular load and interference

### Takeaway
Two major wearables now explicitly separate load channels: Polar (Cardio Load / Muscle Load / Perceived Load; strain = 7-day avg vs tolerance = 28-day avg → detraining/maintaining/productive/overreaching) and WHOOP Strength Trainer (cardiovascular + muscular load merged into Strain). For interference, evidence on same-day order is mixed; the practical consensus is "prioritise the goal quality first, separate by hours, periodise the order".

### Cited Findings
- Polar Training Load Pro: Cardio Load = TRIMP from HR × duration (uses rest/max HR, sex); Muscle Load quantifies musculoskeletal load for short high-intensity work where HR lags (auto from running power); Perceived Load = subjective rating of session strain; designed to be used with Recovery Pro — [Polar Support: Training Load Pro](https://support.polar.com/en/training-load-pro)
- Polar Strain = 7-day average daily cardio load; Tolerance = 28-day average; Cardio Load Status = Strain/Tolerance → Overreaching (much higher than usual), Productive (slowly increasing), Maintaining (slightly lower), Detraining/Recovering (much lower) — [Polar Vantage V2 manual](https://support.polar.com/e_manuals/vantage-v2/polar-vantage-v2-user-manual-english/training-load-pro.htm); [Polar Ignite 3 manual](https://support.polar.com/e_manuals/ignite-3/polar-ignite-3-user-manual-english/training-load-pro.htm)
- WHOOP Strength Trainer (2023): Strain combines cardiovascular load (HR) and muscular load; muscular load = volume (moving body mass; squat > bench) × intensity (closeness to max); auto-estimated from activity type and duration, or more precisely from logged sets/reps/weights; built because lifting stresses muscles more than the heart so HR-only Strain under-counted it — [WHOOP: R&D behind Strength Trainer](https://www.whoop.com/us/en/thelocker/the-research-and-development-behind-strength-trainer/); [WHOOP: how WHOOP measures muscular load](https://www.whoop.com/gb/fr/thelocker/how-whoop-measures-muscular-load/); [BarBend](https://barbend.com/whoop-strength-trainer-feature)
- Interference: Hickson (1980) — concurrent group's strength plateaued and declined after ~7 weeks — summarised in [TrainingPeaks: Risks of concurrent training](https://trainingpeaks.com/blog/risks-of-concurrent-training/)
- Order: a 2020 PLOS One trial (sessions ~3 h apart, 9 weeks) found order affected some power measures but not strength, lean mass or aerobic fitness — [PMC7224562](https://pmc.ncbi.nlm.nih.gov/articles/PMC7224562); a thesis argues order can follow preference/readiness and be periodised to the cycle goal — [VU thesis](https://vuir.vu.edu.au/40029/)
- Mechanistic rationale (AMPK–mTOR, neural fatigue) for putting strength first or separating sessions is hypothesis-level, not outcome data — [Sports Performance Bulletin](https://www.sportsperformancebulletin.com/training/endurance-training/following-orders-make-concurrent-training-work-for-you)
- "Hybrid Performance Method", RYVOLVE, TrainHeroic: no primary documentation of load/interference algorithms found in this pass.

### Inferences
- idmanSK should keep three parallel channels like Polar: (1) cardio/systemic = min × sRPE (all sessions), (2) muscular/joint = per-region set counts or tonnage-weighted sets incl. swim stroke volume for shoulder, (3) perceived/readiness. Each gets its own 7-day vs 28-day ratio with Polar-style labels (detraining / maintaining / productive / overreaching) — trivial to compute in Sheets.
- WHOOP's "volume × intensity" muscular load suggests a simple gym formula: Σ sets × relative intensity (RIR-based) × movement weighting (whole-body > isolation).
- Interference rules for the planner (evidence-weighted, not strict): heavy lower-body day ≥6–24 h away from hard kick/breaststroke sets; on same day, put the phase's priority quality first; flag consecutive days that both load the same joint budget.

### Gaps
- No verified primary source on Hybrid Performance Method, RYVOLVE or TrainHeroic algorithms; Polar Muscle Load for strength sessions (vs running power) and Perceived Load formula not confirmed (Polar help site blocked).
- Recent meta-analyses on concurrent training order not retrieved from primary sources here.

## 6. UX patterns worth copying

### Takeaway
Leading apps converge on: one coloured daily state with a single recommended action; contributors shown so the "why" is visible; plan-vs-done colour coding at ±20 %; adaptation proposals the user accepts; and logging that pre-fills last values and only asks 1–3 subjective taps.

### Cited Findings
- Compliance colour strip with which-metric indicator and over/under arrow — [TrainingPeaks Help](https://help.trainingpeaks.com/hc/en-us/articles/204861204)
- "Adaptations Pending" → review & accept flow — [TrainerRoad Support](https://support.trainerroad.com/hc/en-us/articles/4404060687387-Adaptive-Training-Overview)
- Readiness shown with labelled contributors and 4–5 bands (Garmin, Oura) — [Garmin manual](https://www8.garmin.com/manuals/webhelp/GUID-31D23DBB-57C2-4DF7-A0C9-8D1A00AB4BE7/EN-US/GUID-C21BE0C8-A08E-4DA1-B6C6-2E0E2DDDB372.html); [Oura Help](https://support.ouraring.com/hc/en-us/articles/360057791533)
- Status after each session shows how much the session moved your load status — [Polar blog](https://polar.com/blog/?p=8580)
- Logging friction reducers: previous values inline, optional RPE column, auto rest timer, update-template prompt — [Hevy](https://www.hevyapp.com/features/workout-settings/)
- Manual override of algorithm estimates (Fitbod recovery %) — [Fitbod blog](https://fitbod.me/blog/tracking-volume-intensity-and-recovery-with-fitbod/)
- Morning colour-coded readiness + "traffic light" — [Athletica](https://athletica.ai/sprint-triathlon-training-plan/)

### Inferences
- "Today" card: band colour + one sentence action + top 2 reasons (e.g., "Yellow: shoulder budget 85 % used, sleep below your average → swap 200s threshold for 8×50 drill"). 
- Weekly view: planned vs done per day with ±20 % colour, weekly load bar vs target band, budgets as fuel gauges with MEV/MRV marks, and ramp-rate badge.
- Keep everything wearable-free: sRPE + rep times + subjective readiness already provide what Polar Perceived Load, Juggernaut readiness and TP sTSS approximate.
- Allow manual override of any computed state (recovery %, readiness) and log the override for later calibration.

### Gaps
- No usability studies found comparing these patterns; recommendations are design inference.
