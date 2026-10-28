const durationDefinitions = [
  ["duration/0", "0", 0],
  ["duration/120", "120", 120],
  ["duration/200", "200", 200],
  ["duration/320", "320", 320],
  ["duration/480", "480", 480],
];

export const referenceDurations = Object.freeze(
  durationDefinitions.map(([id, cssSuffix, milliseconds]) =>
    Object.freeze({
      id,
      type: "duration",
      milliseconds,
      cssVariable: `--ref-duration-${cssSuffix}`,
      webValue: `${milliseconds}ms`,
      sourceTask: "SAVI-73",
      lifecycle: "admitted",
    }),
  ),
);

export const referenceDurationsById = Object.freeze(
  Object.fromEntries(referenceDurations.map((token) => [token.id, token])),
);

const semanticDurationDefinitions = [
  ["motion/duration/instant", "instant", "duration/0"],
  ["motion/duration/feedback", "feedback", "duration/120"],
  ["motion/duration/transition", "transition", "duration/200"],
  ["motion/duration/reveal", "reveal", "duration/320"],
  ["motion/duration/emphasis", "emphasis", "duration/480"],
];

export const semanticDurations = Object.freeze(
  semanticDurationDefinitions.map(([id, cssSuffix, referenceId]) => {
    const reference = referenceDurationsById[referenceId];

    if (!reference) {
      throw new Error(`Missing duration reference: ${referenceId}`);
    }

    return Object.freeze({
      id,
      cssVariable: `--motion-duration-${cssSuffix}`,
      referenceId,
      resolvedMilliseconds: reference.milliseconds,
      resolvedWebValue: reference.webValue,
    });
  }),
);

export const semanticDurationsById = Object.freeze(
  Object.fromEntries(semanticDurations.map((token) => [token.id, token])),
);

function defineUsage(intent, guidance) {
  return Object.freeze({ intent, guidance });
}

const motionUsageByDurationId = Object.freeze({
  "motion/duration/instant": defineUsage(
    "immediate-state",
    "Use when interpolation would delay clarity: focus, direct state replacement and reduced spatial motion.",
  ),
  "motion/duration/feedback": defineUsage(
    "direct-feedback",
    "Use for an immediate response to direct input, such as a control fill or foreground change.",
  ),
  "motion/duration/transition": defineUsage(
    "routine-transition",
    "Use for a routine state change or exit that should remain perceptible without slowing the task.",
  ),
  "motion/duration/reveal": defineUsage(
    "enter-or-reveal",
    "Use for content entering or revealing a new spatial relationship within an admitted component recipe.",
  ),
  "motion/duration/emphasis": defineUsage(
    "rare-emphasis",
    "Reserve for evidenced expressive or landing-page emphasis; never use it for routine product feedback.",
  ),
});

const easingDefinitions = [
  ["motion/easing/linear", "linear", "linear"],
  ["motion/easing/standard", "standard", "cubic-bezier(0.2, 0, 0, 1)"],
  ["motion/easing/enter", "enter", "cubic-bezier(0, 0, 0.2, 1)"],
  ["motion/easing/exit", "exit", "cubic-bezier(0.4, 0, 1, 1)"],
];

export const motionEasings = Object.freeze(
  easingDefinitions.map(([id, cssSuffix, webValue]) =>
    Object.freeze({
      id,
      type: "cubic-bezier",
      cssVariable: `--motion-easing-${cssSuffix}`,
      webValue,
      sourceTask: "SAVI-73",
      lifecycle: "admitted",
    }),
  ),
);

export const motionEasingsById = Object.freeze(
  Object.fromEntries(motionEasings.map((token) => [token.id, token])),
);

const motionUsageByEasingId = Object.freeze({
  "motion/easing/linear": defineUsage(
    "continuous-progress",
    "Use only when constant velocity communicates continuous progress or time.",
  ),
  "motion/easing/standard": defineUsage(
    "same-context-change",
    "Use for routine feedback and state changes that remain in the same spatial context.",
  ),
  "motion/easing/enter": defineUsage(
    "incoming-content",
    "Use when content arrives and settles into its destination.",
  ),
  "motion/easing/exit": defineUsage(
    "outgoing-content",
    "Use when content leaves; pair it with a duration no longer than the corresponding enter.",
  ),
});

const motionPropertyPolicy = Object.freeze({
  preferredSpatialProperties: Object.freeze(["opacity", "transform"]),
  feedbackProperties: Object.freeze([
    "color",
    "background-color",
    "border-color",
    "box-shadow",
    "opacity",
  ]),
  transitionAll: "prohibited",
  layoutAffectingProperties:
    "component-specific-evidence-and-performance-validation-only",
  transformDistance: "component-recipe-owned",
  focusIndicator: "immediate",
  meaningOnlyInMotion: "prohibited",
});

const motionTransitionPolicy = Object.freeze({
  enter: Object.freeze({
    durationId: "motion/duration/reveal",
    easingId: "motion/easing/enter",
  }),
  exit: Object.freeze({
    durationId: "motion/duration/transition",
    easingId: "motion/easing/exit",
  }),
  exitMustNotExceedEnter: true,
  spatialOrigin: "trigger-edge-or-source-context",
  interruptionFinalState: "required",
  componentRecipes: "deferred-to-admitted-component-contract",
  mountUnmountLifecycle: "component-owned",
});

export const reducedMotionPolicy = Object.freeze({
  preference: "prefers-reduced-motion: reduce",
  viewportMode: false,
  spatialDurationId: "motion/duration/instant",
  orientationFadeDurationId: "motion/duration/feedback",
  orientationFadeEasingId: "motion/easing/standard",
  orientationFadeProperty: "opacity-only",
  spatialMotion: "remove",
  scaleMotion: "remove",
  parallax: "remove",
  decorativeContinuousMotion: "stop",
  essentialProgress: "retain-with-semantic-and-aria-state",
  focusIndicator: "immediate",
  globalReferenceOverride: "prohibited",
  informationOnlyInAnimation: "prohibited",
});

export const motionPolicy = Object.freeze({
  defaultDurationId: "motion/duration/transition",
  defaultEasingId: "motion/easing/standard",
  viewportResponsive: false,
  componentConsumption: "semantic-role-composition",
  propertyDurationEasingMatrix: "prohibited",
  linearRestriction: "continuous-progress-only",
  emphasisRestriction: "evidenced-expressive-or-landing-consumer",
  deferredPhysics: Object.freeze(["bounce", "elastic", "spring"]),
  durationUsage: motionUsageByDurationId,
  easingUsage: motionUsageByEasingId,
  property: motionPropertyPolicy,
  transition: motionTransitionPolicy,
});
