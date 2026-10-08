# Integrated training load and readiness for swim + strength (single masters athlete, no wearables)

Scope: how to quantify swimming and gym load, whether they can be combined into one number, what ACWR and its alternatives are worth, and readiness/autoregulation tools a phone app plus Google Sheets can compute. Injury and pain specifics are covered by another researcher; pain is mentioned only as an input flag.

Method note: web search was used (about 17 calls). Full-text fetches of PMC/Frontiers were blocked by the network proxy, so most findings are from abstracts or search-snippet summaries of primary papers. Items marked "[background, unverified here]" are standard field knowledge that I could not confirm against a source in this session. Treat them as needing a check before they are cited.

---

## 1. Session-RPE (Foster): validity in swimming and resistance training, and comparability across modalities

### Takeaway
sRPE (CR-10 RPE x minutes) has acceptable validity in swimming (vs HR-based TRIMP) and good reliability in resistance training. It is the only load metric that can be computed identically for both modalities without sensors, so it is the most defensible "common currency". There is no validated cross-modality weighting factor. Equal arbitrary units (AU) do not mean equal local or tissue stress, so modality-specific sub-budgets should be kept alongside the total.

### Cited Findings
- Wallace, Slattery & Coutts 2009 (J Strength Cond Res 23:33–38): 12 well-trained swimmers, 20 sessions. sRPE correlated with HR-based load at r = 0.55–0.94 (individual range), and less strongly with distance (r = 0.37–0.81). Coaches under-rated easy sessions and over-rated hard ones relative to swimmers. Conclusion: sRPE is a practical, non-invasive internal-load method in swimming — [UTS OPUS record](https://opus.lib.uts.edu.au/handle/10453/9495); [PDF](https://opus.lib.uts.edu.au/bitstream/10453/9495/1/2009001442OK.pdf)
- Paralympic swimmers (n = 4, 30 sessions): sRPE had high to very high correlations with three HR-based TRIMPs. Very small sample — [Sponet record](https://sponet.de/Record/4072085)
- Water polo (youth): r = 0.88 between Edwards HR TRIMP and sRPE — [PubMed 24231176](https://pubmed.ncbi.nlm.nih.gov/24231176/)
- Day, McGuigan, Brice & Foster 2004 (JSCR): 9 men and 10 women each did high-, moderate- and low-intensity resistance protocols twice to test sRPE reliability. Heavier loads with fewer reps were rated harder than lighter loads with more reps — [PDF via paulogentil.com](https://paulogentil.com/pdf/TREINO%20DE%20FORC%CC%A7A/Monitoring%20Exercise%20Intensity%20During%20Resistance%20Training%20Using%20the%20Session%20RPE%20Scale.pdf)
- McGuigan, Egan & Foster 2004 (J Sports Sci Med 3:8–15): high-intensity protocol (6 x 10 at 75% 1RM, Smith squat and bench) vs low-intensity protocol (3 x 10 at 30% 1RM), with salivary cortisol. Sessions were repeated to test reliability — [JSSM full text](https://jssm.org/jssm-03-8.xml-Fulltext)
- Sweet, Foster, McGuigan & Brice 2004, "Quantitation of resistance training using the session RPE method", JSCR 18:796–802. Citation confirmed; abstract not retrieved — [JSSM 2006 (Egan) reference list](https://www.jssm.org/jssm-05-289.xml-Fulltext)
- Egan et al. 2006 cite Day 2004 and McGuigan 2004 as evidence that a single session RPE reflects resistance-session intensity. They note that earlier studies did not test different techniques of the same exercise — [JSSM](https://www.jssm.org/jssm-05-289.xml-Fulltext)
- Haddad et al. 2017 mini-review (Front Neurosci, DOI 10.3389/fnins.2017.00612): about 950 papers cited Foster's method, and 36 studies tested its validity and reliability with the modified CR-10. They concluded that sRPE is valid, reliable and internally consistent across sports, ages and levels, and could work as a stand-alone load measure. Some authors recommend pairing it with HR. This is a mini-review, not a systematic review — [PMC5673663](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5673663/)
- [background, unverified here] Standard protocol: rate about 30 min after the session with the CR-10 ("How was your workout?"). In resistance training, Sweet 2004 reportedly found sRPE higher than the mean of per-set RPEs, and some authors note that duration choice (total time vs time under tension, whether rest is included) changes AU.

### Inferences
- In the app: `load_AU = sRPE(0–10) x duration_min` for every session, swim and gym alike. Use total session minutes, including rest between sets/reps, as Foster did. Use the same rule for both modalities so the AU stay internally consistent.
- Cross-modality comparability is assumed by convention, not validated. A 60-min swim at RPE 5 (300 AU) and a 60-min gym session at RPE 5 (300 AU) are not shown to cost the same recovery. Perceived exertion in resistance training reflects local muscular effort and is somewhat dissociated from cardiorespiratory strain. Recommended design:
  1. One total weekly sRPE number for global fatigue and illness risk, used with monotony/strain.
  2. Separate swim and gym sub-totals, each with its own chronic baseline and change limits.
  3. External-load sub-metrics per modality: metres and zone-weighted metres for swim; hard sets or volume-load per muscle region for gym.
- Do not invent a modality multiplier such as "gym x 1.2". No source supports one. If one is used, label it a user-tunable convention.
- Masters/50+ athlete: sRPE needs no HR, which suits a no-wearable setup. RPE drifts with sleep, stress and mood (see section 4). Logging wellness alongside it helps separate "session was hard" from "I was tired".

### Gaps
- No study found that validates sRPE comparability between swimming and resistance sessions in the same athlete, or that proposes a weighting.
- Could not retrieve full texts of Sweet 2004 and Day 2004, so their correlations and the sRPE-vs-mean-set-RPE detail are unconfirmed.
- No sRPE validation found specifically in masters (50+) swimmers or masters lifters.

---

## 2. Alternative load metrics (TRIMP, sTSS, zone-weighted metres, volume-load, RIR-based volume) and how to combine them

### Takeaway
Without HR, TRIMP is not computable. For swim, a CSS-based intensity factor (sTSS) or zone-weighted metres can be computed from pace logs. For gym, hard sets per muscle group, or volume-load, can be computed from logs. None of these share units across modalities. The pragmatic structure is sRPE as the shared total, plus modality-specific external metrics as separate budgets.

### Cited Findings
- Swim TSS (TrainingPeaks): uses Critical Swim Speed (CSS) as the swim "threshold". The intensity factor is cubed rather than squared because drag makes the physiological cost rise faster with speed. Their CSS example uses 200 m and 400 m test swims. Rest periods are excluded from duration — [TrainingPeaks: Calculating swimming TSS](https://www.trainingpeaks.com/learn/articles/calculating-swimming-tss-score/)
- The commonly used form (structure as described by TrainingPeaks; exact formula from background knowledge): `IF = session swim speed / CSS speed`; `sTSS = IF^3 x hours x 100`. This is a proprietary/commercial convention, not a peer-reviewed validated internal-load measure — [TrainingPeaks](https://www.trainingpeaks.com/blog/calculating-swimming-tss-score/)
- CSS test: `CSS (m/s) = (D2 − D1)/(T2 − T1)`. Ginn's version uses 50 m and 400 m maxima; CSS is about 80–85% of max 100 m speed and about 90–95% of 400 m speed. Swim Smooth popularised 400/200 — [Topend Sports CSS](https://www.topendsports.com/testing/tests/critical-swim-speed.htm); [Swim Smooth](https://www.swimsmooth.com/what-is-critical-swim-speed)
- Critical velocity in swimming has known limits, such as test-distance dependence (review "What is it important to know when using the critical velocity concept in swimming training?") — [LIDA record](https://lida.sport-iat.de/ta/Record/4041324?lng=en)
- Wallace 2009: distance alone correlated only r = 0.37–0.81 with HR-based load, so raw metres are a weaker internal-load proxy than sRPE — [UTS](https://opus.lib.uts.edu.au/handle/10453/9495)
- RIR-based RPE scale (Zourdos 2016, JSCR 30:267–275, n = 29, squat): RPE 10 = 0 RIR, RPE 9 = 1 RIR, and so on. RPE correlated strongly and inversely with bar velocity (r = −0.88 experienced, −0.77 novices). The authors call it a practical way to regulate daily load — [AUT repository](https://openrepository.aut.ac.nz/items/efef3b25-6701-4fb5-bb82-55fcd2a26027/full)
- RIR accuracy (2025 systematic review, 26 studies): accuracy is better closer to failure and at heavier loads, and worse with high-rep sets and lighter relative loads — [U. Évora record](https://dev.rdpc.dspace.uevora.pt/items/d6f78224-a6e5-4f67-b1b8-2c65c7e7f199)
- [background, unverified here] Common hypertrophy/strength-literature convention: count "hard sets" (sets ending within about 0–4 RIR) per muscle group per week. Volume-load (sets x reps x kg) is biased toward high-rep, light work and toward lower-body lifts, and it is not comparable across exercises.

### Inferences (app-computable rules)
- Swim external load: either
  (a) zone-weighted metres, e.g. metres in Z1 x 1, Z2 x 2, Z3 (~CSS) x 3, above CSS x 4–5 (weights are convention, not validated), or
  (b) per-set `IF = pace_CSS / pace_set` (pace in s/100 m, so the ratio is inverted), then `sTSS = Σ(IF_set^3 x set_time_h x 100)` with rest excluded.
  Option (b) needs per-set times, which a logging app already has. Re-test CSS every 6–8 weeks (convention). For a masters swimmer with shoulder impingement, track stroke mix too: freestyle/fly metres vs kick/back. A shoulder-specific budget (metres of overhead strokes, paddle metres) is more relevant than any global number. The injury researcher should confirm.
- Gym external load: hard sets per region per week (for example push / pull / hip-knee / trunk), with RIR logged per set. Volume-load can be tracked per exercise for progression only, never summed across exercises or with swim.
- Combining: do not convert sTSS and gym sets into one unit. Keep:
  - `Total_AU` (sRPE): drives ACWR-like trend, monotony and strain.
  - `Swim budget`: metres or sTSS, with week-over-week change limits.
  - `Gym budget`: hard sets per region, with change limits.
  - `Pain/irritability flags` for shoulder, hip and knee as overriding gates (from the other researcher).
- Ratio check: the sTSS-to-sRPE ratio in swim sessions shows whether perceived effort is rising for the same external work, which is an early fatigue signal. The same idea applies to gym: RPE for the same load and reps rising, or e1RM falling.

### Gaps
- No peer-reviewed validation of sTSS (the IF^3 formulation) as an internal-load measure was found.
- No validated zone weights for swim metres were found. Weights like 1–5 are coach conventions.
- No study combining swim sTSS and resistance-training load into one validated index was found.

---

## 3. Acute:Chronic Workload Ratio — original claims, critiques, 2022–2026 status, and safer alternatives

### Takeaway
ACWR (Gabbett 2016, endorsed in the IOC 2016 consensus) has been heavily criticised for mathematical coupling, arbitrary windows, ratio artefacts and weak predictive value. Impellizzeri et al. (2020/2021) call for it to be dismissed. Recent reviews (2020–2025) describe the evidence as inconsistent and low-certainty. For a single recreational athlete it should not be treated as an injury predictor. Simple descriptive rules are more defensible: week-to-week change, monotony/strain, and optionally a CTL/ATL trend, combined with subjective readiness.

### Cited Findings — original claims
- Gabbett 2016, "The training-injury prevention paradox" (BJSM 50:273–280): high chronic load is protective, and rapid spikes relative to chronic load raise injury risk. Athletes with more than 18 weeks of training before an initial injury had lower risk of subsequent injury — [PMC4789704](https://pmc.ncbi.nlm.nih.gov/articles/PMC4789704)
- "Sweet spot" ACWR 0.8–1.3 attributed to Gabbett 2016; risk above 1.5 attributed to Blanch & Gabbett 2016 (secondary source) — [Frontiers Physiol 2020](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2020.01034/pdf)
- IOC consensus (Soligard et al. 2016, BJSM, "How much is too much? Part 1") recommended ACWR-style monitoring for injury prevention — [PubMed 27535989](https://pubmed.ncbi.nlm.nih.gov/27535989/); context in [Frontiers editorial 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8138569/)
- Murray et al. 2017: EWMA-based ACWR was more sensitive than rolling averages in elite Australian football — [ACU research bank](https://acuresearchbank.acu.edu.au/item/8qv67/calculating-acute-chronic-workload-ratios-using-exponentially-weighted-moving-averages-provides-a-more-sensitive-indicator-of-injury-likelihood-than-rolling-averages)

### Cited Findings — critiques
- Lolli et al. 2019 (BJSM 53:921–922): in the coupled ACWR the acute week is part of the chronic window. This creates a spurious acute–chronic correlation of about 0.5 (r = 0.52 in 1000 simulated athletes). They propose an uncoupled ACWR — [Teesside record](https://research.tees.ac.uk/en/publications/mathematical-coupling-causes-spurious-correlation-within-the-conv-3/); [BJSM](https://bjsm.bmj.com/content/53/15/921)
- Lolli et al. 2018/2019 also argue that ACWR is "an inaccurate scaling index for an unnecessary normalisation process": ratios do not properly normalise for chronic load — [Lolli PDF (Catapult)](https://unleash.catapult.com/wp-content/uploads/research//Football%20(Soccer)/Lolli%20(2018)%20The%20acute-to-chronic%20workload%20ratio%20an%20inaccurate%20scaling%20index%20for%20an%20unnecessary%20normalisation%20process.pdf)
- Coupled and uncoupled ACWR were nearly identical in a cricket dataset (R² = 0.99), so uncoupling does not rescue the concept — [ECU record](https://ro.ecu.edu.au/ecuworkspost2013/7321/)
- Impellizzeri et al. 2020 (Sports Med): replacing chronic load with fixed or random values reproduced the injury associations. They argue the associations are statistical artefacts, that ACWR should be dismissed as a framework, and that consensus statements should be updated — [Frontiers editorial summary](https://pmc.ncbi.nlm.nih.gov/articles/PMC8138569/); [Impellizzeri 2021 Sports Med PDF](https://iris.univr.it/retrieve/e34cfb98-e922-4c2f-aab5-18583ab7e31b/Impellizzeri_What%20Role%20Do%20Chronic%20Workloads%20Play_SportMed_2021.pdf)
- Impellizzeri, Tenan, Kempton, Novak & Coutts 2020, "ACWR: conceptual issues and fundamental pitfalls", IJSPP 15:907–913 (citation only; full text not retrieved) — [Frontiers editorial](https://pmc.ncbi.nlm.nih.gov/articles/PMC8138569/)
- Wang, Shrier et al. (McGill), "The acute:chronic workload ratio: challenges and prospects for improvement" (2020). Problems listed: the ratio is used instead of modelling change; unweighted averages; poor fit for sports with tapers; categorising the ratio before modelling; sparse data; bias for injured athletes; unmeasured confounding; use for subsequent injuries — [arXiv 1907.05326](https://web3.arxiv.org/pdf/1907.05326)
- 2021 Frontiers editorial: heterogeneous load variables, arbitrary windows (7:28 has no rationale), and "training load is not mechanical/tissue load" — [PMC8138569](https://pmc.ncbi.nlm.nih.gov/articles/PMC8138569/)
- An elite soccer and pentathlon study found ACWR associated with injury but no support for a sweet spot — [Frontiers Physiol 2020](https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2020.01034/pdf)

### Cited Findings — reviews 2020–2025 (status)
- Maupin et al. 2020 (27 studies, quality 48–64%): high heterogeneity in variables, cut-offs and reference groups; method problems need addressing before confident use — [PMC7047972](https://pmc.ncbi.nlm.nih.gov/articles/PMC7047972)
- Griffin et al. 2020 (Sports Med, 22 studies): association with non-contact injury; EWMA possibly more sensitive; useful only within a broader monitoring system — [PMC7485291](https://pmc.ncbi.nlm.nih.gov/articles/PMC7485291); [Bond record](https://research.bond.edu.au/en/publications/the-relationship-between-acute-chronic-workload-ratios-and-injury/)
- Andrade et al. 2020 (Sports Med): systematic review of ACWR methodology in professional team sports — [USQ record](https://research.usq.edu.au/item/q6w80/is-the-acute-chronic-workload-ratio-acwr-associated-with-risk-of-time-loss-injury-in-professional-team-sports-a-systematic-review-of-methodology-variables-and-injury-risk-in-practical-situations)
- Michailidis 2024 (Applied Sciences, professional football): the relationship "remains inconclusive", and many supportive studies used a coupled GPS-based ACWR — [DOAJ](https://doaj.org/article/1e3fd3e95f4b4e26ad7288b9c619fa61)
- 2025 meta-analysis (BMC Sports Sci Med Rehabil, 22 single-arm cohorts): ACWR is "associated" with injury but "should be used with caution". Pooled estimates are incidence proportions with wide CIs — [PubMed 41029871](https://pubmed.ncbi.nlm.nih.gov/41029871/)
- Runners (2021): coupled and uncoupled ACWR gave similar associations with running injury — [RUG record](https://research.rug.nl/en/publications/the-association-between-the-acute-chronic-workload-ratio-and-runn/)
- No GRADE-rated certainty assessment of ACWR was found. A search summary judged that certainty would likely be low to very low; this is my inference, not a published rating.

### Cited Findings — alternatives
- Foster 1998 (MSSE, n = 25): sRPE logs; monotony = daily mean load / SD of daily load (weekly); strain = weekly load x monotony. Banal illness was related to load, monotony and strain — [LIDA record](https://lida.sport-iat.de/ta/Record/4001707?lng=en); [PubMed 9662690](https://0-www-ncbi-nlm-nih-gov.brum.beds.ac.uk/pubmed/9662690)
- "Monotony > 2.0 = risk" appears widely in coaching material attributed to Foster 1998, but it could not be confirmed in a primary source here — [TeamBuildr blog (secondary)](https://blog.teambuildr.com/how-to-monitor-practice-workload-without-gps-technology)
- Banister fitness–fatigue (impulse–response) model: limited by linearity, independence and deterministic assumptions (Swinton et al. review). In 9 elite swimmers the fit was good (R² = 0.79) but parameter CIs were wide and parameters inter-correlated, so individual parameters were uninterpretable. Fatigue from a given bout grows with training frequency, which the basic model does not capture — [Swinton RGU](https://rgu-repository.worktribe.com/OutputFile/1871154); [Sponet: limitations of the Banister model](https://sponet.de/sponet/Record/4010995); [INSERM](https://www.hal.inserm.fr/inserm-00149782)
- TrainingPeaks PMC (CTL = 42-day EWMA, ATL = 7-day EWMA, TSB = CTL − ATL) is a simplified Banister model. TrainingPeaks itself notes inherent limitations outside the lab — [TrainingPeaks: science of the PMC](https://www.trainingpeaks.com/learn/articles/the-science-of-the-performance-manager/)

### Inferences (app rules)
- Do not show ACWR as an injury-risk traffic light. If shown at all, describe it as "this week vs your usual" (descriptive). Prefer:
  - Week-over-week change in Total_AU and in each modality budget, shown as a percentage, plus a 4-week rolling mean (uncoupled: previous 4 weeks excluding the current week).
  - Foster monotony and strain on daily Total_AU, including rest days as 0. With about 5 sessions per week, monotony will usually be low. Flag it if it is high, labelled "convention-based threshold ~2.0".
  - Optional CTL/ATL/TSB on sRPE-AU as a visual trend only, e.g. EWMA λ = 2/(N+1) with N = 7 and 42. Do not claim it predicts performance or injury.
- For a single athlete with no team data, the statistical case for any injury-predicting threshold is essentially nil. Use thresholds as prompts to check pain and wellness, not as verdicts.

### Gaps
- No 2022–2026 formal consensus statement updating the IOC 2016 ACWR recommendation was found; I could not confirm whether one exists.
- Full Impellizzeri 2020 IJSPP and Lolli texts not retrieved.
- No ACWR or monotony data specific to masters swimmers or combined swim+gym athletes.

---

## 4. Readiness and autoregulation (wellness questionnaires, RIR/RPE, HRV)

### Takeaway
Short subjective wellness items (fatigue, sleep, soreness, stress, mood; Hooper/McLean style) respond to load better than objective markers do (Saw 2016) and cost nothing. They suit a phone app. RIR/RPE-based load autoregulation in the gym produces strength gains equal to or slightly better than %1RM programming (Helms 2018; Hickmott 2022 meta-analysis). HRV-guided training has small benefits in meta-analyses, mainly on vagal and submaximal markers rather than performance, and needs a reliable daily measurement. Without a wearable it is a low priority.

### Cited Findings — wellness
- Saw, Main & Gastin 2016 (BJSM systematic review, 56 studies): subjective and objective well-being measures generally did not correlate. Subjective measures reflected acute and chronic load with superior sensitivity and consistency. Subjective measures can stand alone or be used in a mixed approach — [OmicsDI/PMC4789708](https://www.omicsdi.org/dataset/biostudies-literature/S-EPMC4789708)
- McLean et al. 2010 (IJSPP 5:367–383) wellness questionnaire: 1–5 items for fatigue, sleep quality, muscle soreness, stress and mood. It is widely used as the default in monitoring software — [World Rugby Passport](https://passport.world.rugby/conditioning-for-rugby/introduction-to-conditioning-adult/managing-the-training-plan/monitoring-the-training-load/wellness-questionnaires/); [AthleteMonitoring](https://support.en.athletemonitoring.com/support/solutions/articles/13000105499-which-wellness-questionnaire-is-included-in-athletemonitoring-)
- World Rugby guidance: a bad wellness score may come from life stress rather than training but still matters for recovery — [World Rugby Passport](https://passport.world.rugby/conditioning-for-rugby/introduction-to-conditioning-adult/managing-the-training-plan/monitoring-the-training-load/wellness-questionnaires/)
- Hooper index: weak correlations with objective jump metrics in professional football (r = 0.11–0.17; R² = 3.7%); no correlation with RPE in junior soccer. Lower energy intake was associated with worse Hooper scores in handball. Conclusion: it tracks a perceived state, not an objective-capacity surrogate — [PMC9864321 and related results](https://pmc.ncbi.nlm.nih.gov/articles/PMC9864321)
- Fatigue, stress, soreness and sleep influence RPE during submaximal effort, so sRPE is partly confounded by wellness state — [LIDA record](https://lida.sport-iat.de/ta/Record/4031473?lng=en)
- Bourdon et al. 2017 IJSPP consensus (S2-161–S2-170): framework for internal/external load monitoring. Per a secondary summary, it stresses interpretation by qualified people over automatic red/green flags (not verified in full text) — [PubMed 28463642](https://pubmed.ncbi.nlm.nih.gov/28463642/); [Sonar blog (secondary)](https://www.sonarhealth.co/blog/athlete-monitoring/)

### Cited Findings — strength autoregulation
- Greig et al. 2020 (Sports Med, "Autoregulation in resistance training: addressing the inconsistencies") is a conceptual review, not a meta-analysis. It highlights inconsistent terminology and proposes a framework — [PMC7575491](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7575491/); [RGU](https://rgu-repository.worktribe.com/output/951117)
- Helms et al. 2018 (Front Physiol): 8 weeks of DUP squat and bench in trained men aged 19–35; RPE group n = 10 vs %1RM group n = 11. Both were effective, with a possible small 1RM advantage for RPE loading in most individuals (magnitude-based inference) — [PubMed 29628895](https://pubmed.ncbi.nlm.nih.gov/29628895/); [AUT](https://openrepository.aut.ac.nz/items/f609bea1-40fd-4841-a17f-4a5a1d6f8519/full)
- Hickmott et al. 2022 (Sports Med Open, 15 studies): autoregulated vs standardized load gave no significant 1RM difference (MD 2.07 kg, 95% CI −0.32 to 4.46; SMD 0.21). Velocity-loss thresholds ≤25% gave greater 1RM and less hypertrophy than >25% — [Springer](https://link.springer.com/article/10.1186/s40798-021-00404-9); [PMC8762534](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8762534/)
- Network meta-analysis on maximal strength (RPE, APRE, VBT, %1RM): no moderate or large differences for squat 1RM; for bench, %1RM beat APRE — [LIDA](https://lida.sport-iat.de/ta/Record/4094556)
- RIR accuracy is better near failure and with heavier loads, and worse at high reps and light loads (2025 systematic review) — [U. Évora](https://dev.rdpc.dspace.uevora.pt/items/d6f78224-a6e5-4f67-b1b8-2c65c7e7f199). Experienced lifters rate more accurately (Zourdos 2016) — [AUT](https://openrepository.aut.ac.nz/items/efef3b25-6701-4fb5-bb82-55fcd2a26027/full)

### Cited Findings — HRV
- Kiviniemi et al. 2007 (Eur J Appl Physiol 101:743–751): 4 weeks; the HRV-guided group reduced intensity when standing HF-HRV dropped. Max running speed improved more than under standardized training; VO2max changes were similar (secondary summaries). A blog figure of "+3.7% VO2max" is unverified — [Altini history of HRV-guided training](https://marcoaltini.substack.com/p/a-brief-history-of-heart-rate-variability)
- Meta-analysis (Granero-Gallegos et al. 2020, PMC7663087): small positive effect on VO2max (ES 0.402), larger in amateurs and women. The abstract also reports a between-group ES of 0.187 — [PMC7663087](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7663087/)
- Manresa-Rocamora et al. 2021 (searches to Oct 2020): HRV-guided training was superior for vagal HRV (SMD 0.50, 95% CI 0.09–0.91). Endurance performance effect was small and non-significant (SMD 0.20). Best practice for index, posture and baseline is unresolved — [PMC8507742](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8507742/)
- Düking et al. 2021, J Sci Med Sport (8 studies, n = 198): moderate effect on submaximal physiology (g = 0.296); performance (g = 0.079) and VO2peak (g = 0.171) were not significant. HRV groups did fewer moderate/high-intensity sessions and had fewer non-responders — [PubMed 34489178](https://pubmed.ncbi.nlm.nih.gov/34489178/)
- [background, unverified here] Plews et al. (2013) recommend a 7-day rolling mean of ln-rMSSD over single-day values, plus a smallest worthwhile change band. Smartphone camera PPG apps (e.g., HRV4Training) exist and have been validated against ECG in some studies, which is an option without a wearable.

### Inferences (app rules)
- Daily readiness: 5 items on 1–5 (fatigue, sleep, soreness, stress, mood), plus a sleep-hours field and joint-pain items (shoulder, hip, knee, 0–10; owned by the injury researcher). Compute `wellness_z = (today − 28-day personal mean)/SD`. Flag z < −1 on the total, or ≥2 items at their worst, as "reduce". Use individual baselines, not population cut-offs. This is a convention; no validated cut-off was found.
- Gym autoregulation: prescribe set targets as "reps @ RIR 2–3" (safer for a 50+ athlete with joint issues; RIR estimates are more accurate near failure, but training to failure is not needed). Use top-set RPE to adjust: if RIR is ≥1 below target, drop the load 5–10% (convention). Track e1RM from load, reps and RIR for trend. Fixed %1RM is not superior, and a 1RM test is undesirable given joint constraints.
- Swim autoregulation: an analogous rule is "if RPE for a standard CSS-pace set is ≥1–2 above its usual value, convert remaining hard sets to aerobic/technique". This is inferred, not studied.
- HRV: evidence of benefit is small and inconsistent, and it requires disciplined morning measurement. For a no-wearable athlete it is optional (camera-PPG app at most). Morning resting HR by manual pulse count is a cruder fallback with no specific evidence found here. Not a priority over wellness plus sRPE.

### Gaps
- No validation of wellness questionnaires specifically in masters swimmers or 50+ recreational athletes.
- Hooper index itself (Hooper & Mackinnon 1995) not retrieved; reliability data are lacking.
- No trials of HRV-guided training in masters swimmers or for concurrent swim+strength training.
- Plews 7-day rolling HRV and smartphone PPG validity not verified in this session.

---

## 5. Practical thresholds and decision rules — evidence vs convention

### Takeaway
No load-progression percentage, whether the "10% rule" or an ACWR band, is well supported by evidence, and none at all exists for swimming or masters athletes. Evidence from running suggests that large single-session spikes relative to recent maximum matter more than weekly percentages. Deload timing has no strong evidence base. The app should implement transparent, user-adjustable conventions, flagged as such, gated by pain and wellness.

### Cited Findings
- 10% rule, Buist et al. 2008: an RCT in novice runners compared a graded program (about 10%/week) with a standard one. Injury rates were similar (secondary summary). Sources conflict on the exact numbers (532 vs 886 runners; 10.5% vs 23.7% or about 30% progression), so verify against the primary paper — [Marathon Handbook (secondary)](https://marathonhandbook.com/the-10-rule-new-study-suggests-weve-been-doing-it-wrong-this-whole-time/); [TrainRight (secondary)](https://trainright.com/10-running-rule-reframed/)
- Nielsen et al. 2014 (JOSPT, Danish novice runners): increases above about 30%/week may be harmful; "no clear evidence for safe progression of weekly volume exists" (secondary summary; listed as a 2013/2014 JSCR/JOSPT-era study) — [Marathon Handbook](https://marathonhandbook.com/the-10-rule-new-study-suggests-weve-been-doing-it-wrong-this-whole-time/)
- Garmin-RUNSAFE (Nielsen group, BJSM 2025; 5,205 runners, 18 months): week-to-week percentage changes were barely related to injury. A single run more than 10% longer than the longest run of the previous 30 days increased injury risk markedly. Nielsen has suggested about 5% as a better rule of thumb — [Outside Run summary](https://run.outsideonline.com/training/injuries-and-prevention/a-single-run-could-put-you-at-risk-for-an-overuse-injury-a-new-study-suggests/?scope=anon); [Galaxus summary](https://www.galaxus.de/en/page/why-the-10-per-cent-rule-in-jogging-is-actually-wrong-40303)
- ACWR 0.8–1.3 / >1.5 thresholds come from team-sport cohorts and are contested (section 3) — [PMC8138569](https://pmc.ncbi.nlm.nih.gov/articles/PMC8138569/)
- Foster monotony > 2.0: widely quoted, not confirmed in a primary source here — [TeamBuildr (secondary)](https://blog.teambuildr.com/how-to-monitor-practice-workload-without-gps-technology)
- Banister/PMC models are not reliable enough at individual-parameter level to set precise thresholds — [Sponet](https://sponet.de/sponet/Record/4010995)

### Inferences — proposed rule set (all conventions, user-tunable, transparently labelled)
1. Weekly change caps vs the uncoupled 4-week mean:
   - Total_AU: amber above +15–20%, red above +30%. The 30% figure has some running support; others are convention.
   - Swim metres: amber above +10–15%. Session spike: no single swim more than 10% longer than the longest of the last 4 weeks (analogy from running; unvalidated for swimming).
   - Gym hard sets per region: add at most +1–2 sets per region per week. Add new exercises at RIR ≥3 for the first 1–2 weeks (convention).
2. Monotony/strain: flag weekly monotony above 2.0 (convention); keep at least 1–2 full rest days.
3. Readiness gate (overrides load rules): wellness z < −1 or a pain flag leads to a planned-easy session (lower intensity, same habit). Two consecutive weeks of declining wellness, rising RPE for the same work, or stalled e1RM/CSS leads to a deload week (−30–50% volume, intensity kept). This is a common coaching convention; I found no RCT evidence on deload frequency in this search.
4. Scheduled deload every 4–6 weeks is convention. Reactive (trigger-based) deloads fit the autoregulation evidence better and suit masters athletes.
5. Present ACWR and CTL/ATL as descriptive trend graphs only, never as risk predictions.
6. Masters (50+) context: recovery between hard sessions plausibly takes longer, so prefer reactive rules and lower progression caps. This is an inference; no masters-specific load-threshold evidence was found here.

### Gaps
- No evidence on safe weekly progression in swimming, in resistance training, or in masters athletes was found.
- No trial evidence on deload timing or frequency was retrieved.
- The Garmin-RUNSAFE details come from press summaries; the primary BJSM article was not retrieved.
- Buist 2008 numbers conflict across secondary sources.
