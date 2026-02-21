# Building Block Template & Quality Checklist

This document defines the standards for writing high-quality building blocks for the Prompt Library.

---

## Block Writing Standards

### Writer Blocks Template
```
You are a [ROLE] with [X years/level] experience in [DOMAIN]. Your core strengths are [SKILL_1], [SKILL_2], and [SKILL_3]. You prioritize [VALUE_1] and [VALUE_2] in your work. When approaching tasks, you [METHODOLOGY/APPROACH].
```

**Quality Checklist:**
- [ ] Includes specific experience level or seniority
- [ ] Lists 3+ concrete competencies
- [ ] Describes working methodology
- [ ] Mentions 2+ priorities/values
- [ ] Uses natural, professional language (avoid "seasoned" repetition)

---

### Task Blocks Template
```
[ACTION VERB] for [CONTEXT]. Follow these steps:
1. [STEP 1 with input requirement]
2. [STEP 2 with process description]
3. [STEP 3 with validation criteria]
4. [STEP N with output specification]

Deliver a [OUTPUT_TYPE] that includes: [SECTION_1], [SECTION_2], [SECTION_3], and [SECTION_4].

[Optional: Success criteria or quality checks]
```

**Quality Checklist:**
- [ ] Starts with clear action verb (Create, Analyze, Design, Review, etc.)
- [ ] Lists required inputs explicitly
- [ ] Provides 3-7 numbered process steps
- [ ] Specifies output format clearly
- [ ] Includes success criteria or quality checks
- [ ] Uses constraint parameters (brackets with examples: `[TERM, e.g., "example"]`)
- [ ] Actionable - user knows exactly what to do

---

### Context Blocks Template
```
[CONTEXT_TYPE]: [DESCRIPTION with specific dimensions].

[Dimension 1]: [PLACEHOLDER, e.g., "example value 1", "example value 2"]
[Dimension 2]: [PLACEHOLDER, e.g., "example value 3", "example value 4"]
[Dimension 3]: [PLACEHOLDER, e.g., "example value 5", "example value 6"]

[Optional: Scope boundaries or exclusions]
```

**Quality Checklist:**
- [ ] Uses self-documenting placeholders with examples
- [ ] Provides 3+ example values per placeholder
- [ ] Covers scope/boundaries clearly
- [ ] Relevant to 2+ user groups

---

### Example Blocks Template
```
[GOOD/BAD] Example: [TITLE]

[Concrete instance of the example - actual content, not just description]

Why this [works/fails]:
- [Reason 1]
- [Reason 2]
- [Reason 3]

[What to learn from this example]
```

**Quality Checklist:**
- [ ] Shows concrete instance (not abstract description)
- [ ] Explains why it's good/bad with 2+ reasons
- [ ] Includes specific details from the example
- [ ] Provides actionable takeaway

---

### Instruction Blocks Template
```
[FORMAT_TYPE]: [OUTPUT_STRUCTURE_DESCRIPTION]

Structure your response as:
1. [SECTION_1]: [Description of what goes here]
2. [SECTION_2]: [Description of what goes here]
3. [SECTION_N]: [Description of what goes here]

Formatting rules:
- [RULE_1]
- [RULE_2]
- [RULE_3]

[Optional: Example skeleton or template]
```

**Quality Checklist:**
- [ ] Combines format + structure guidance
- [ ] Provides numbered sections or template skeleton
- [ ] Lists 2+ specific formatting rules
- [ ] Clear about what content belongs where

---

### Best Practice Blocks Template
```
[METHOD_NAME]: [BRIEF_DESCRIPTION]

Apply this method when: [CONTEXT/SITUATION]

Process:
1. [STEP_1]
2. [STEP_2]
3. [STEP_N]

Quality check: Verify that your output [CRITERIA_1], [CRITERIA_2], and [CRITERIA_3].

[Optional: Warning about when NOT to use this method]
```

**Quality Checklist:**
- [ ] Describes actionable method/framework
- [ ] Explains when to use it
- [ ] Provides process steps
- [ ] Includes verification criteria
- [ ] Warns about misuse if applicable

---

### Coding Blocks Template
```
[TASK_DESCRIPTION] for [CONTEXT/TECHNOLOGY].

Requirements:
- [REQUIREMENT_1]
- [REQUIREMENT_2]
- [REQUIREMENT_3]

Deliverables:
1. [DELIVERABLE_1, e.g., "Code implementation in [LANGUAGE]"]
2. [DELIVERABLE_2, e.g., "Unit tests covering edge cases"]
3. [DELIVERABLE_3, e.g., "Documentation (inline + README)"]

Quality standards:
- [STANDARD_1, e.g., "Include error handling"]
- [STANDARD_2, e.g., "Follow [STYLE_GUIDE]"]
- [STANDARD_3, e.g., "Validate with [TEST_APPROACH]"]
```

**Quality Checklist:**
- [ ] Specifies programming language/framework
- [ ] Lists 3+ clear requirements
- [ ] Defines deliverables (code + tests + docs)
- [ ] Mentions error handling
- [ ] Includes validation/testing approach
- [ ] Relevant to modern development workflows

---

## Placeholder Format Standards

### Self-Documenting Placeholders
Always use the format: `[PLACEHOLDER_NAME, e.g., "example1", "example2"]`

**Good:**
- `[INDUSTRY, e.g., "Healthcare", "FinTech", "E-commerce"]`
- `[TIMEFRAME, e.g., "Q1 2026", "Next 12 months", "By end of year"]`
- `[USER_TYPE, e.g., "Admin user", "Customer", "Developer"]`

**Bad:**
- `[INDUSTRY]` (no examples - user doesn't know what to put)
- `[INSERT_TIMEFRAME_HERE]` (awkward, not natural)
- `industry` (not clearly marked as placeholder)

---

## User Group Targeting

Tag blocks mentally for user groups (future feature):

- **office**: Office/Admin staff
- **pm**: Agile PMs / Scrum Masters
- **dev**: Developers & Engineers
- **ux**: UX/UI Experts
- **mgmt**: Management / Leadership
- **ops**: DevOps / IT Operations
- **qa**: QA / Test Engineers
- **all**: Universal (applies to everyone)

Aim for blocks that serve 2+ user groups where possible.

---

## Testing New Blocks

Before adding a block to `blocks.json`:

1. **Read Test:** Read the block aloud. Does it sound natural?
2. **Placeholder Test:** Can you fill the placeholders in <1 minute?
3. **Specificity Test:** Does it guide toward a specific output, not generic advice?
4. **User Test:** Would someone in the target role find this useful?
5. **Generation Test:** Test with AI mode - does it select this block appropriately?

---

## Common Pitfalls to Avoid

❌ **Too Generic:** "Analyze the data and provide insights"
✅ **Specific:** "Analyze [DATASET] for trends in [METRIC]. Identify top 3 patterns with statistical significance, flag anomalies, and recommend 2-3 actionable interventions."

❌ **Robotic Language:** "You are a seasoned professional who excels at..."
✅ **Natural:** "You are a Senior Developer with 8+ years building scalable web applications..."

❌ **Missing Examples:** `[PLACEHOLDER]`
✅ **With Examples:** `[PLACEHOLDER, e.g., "option1", "option2"]`

❌ **No Process:** "Create a good design document"
✅ **Process Defined:** "Create a design doc with: 1) Problem statement, 2) Proposed solution, 3) Alternatives considered, 4) Implementation plan, 5) Risks"

❌ **Vague Success:** "Make sure it's high quality"
✅ **Measurable:** "Verify: (a) all edge cases covered, (b) follows style guide, (c) includes tests, (d) documented"

---

## Version Control

When updating blocks:
- Use semantic versioning for major content changes
- Document what changed in git commit message
- Test both AI and manual modes after updates
- Validate that existing prompts still work

---

**Last Updated:** February 9, 2026
**Version:** 1.0
