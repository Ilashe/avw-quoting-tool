import type { RuleActionType } from '@/types/equipment'
import type { SelectionValue } from '@/store/selectionsStore'

export interface EvaluableRule {
  trigger_field: string
  trigger_value: string
  action_type: RuleActionType
  target_field: string
  target_value: string | null
}

export type SelectionsMap = Record<string, SelectionValue>

function ruleMatches(rule: EvaluableRule, selections: SelectionsMap): boolean {
  const current = selections[rule.trigger_field]
  return current !== null && current !== undefined && String(current) === rule.trigger_value
}

function rulesFor(
  rules: EvaluableRule[],
  targetField: string,
  actionType: RuleActionType
): EvaluableRule[] {
  return rules.filter((r) => r.target_field === targetField && r.action_type === actionType)
}

/** Default-visible unless a matching `hide` rule fires; if `show` rules exist for this
 *  field, it's default-hidden and only visible when one of them fires. */
export function isFieldVisible(
  rules: EvaluableRule[],
  selections: SelectionsMap,
  fieldKey: string
): boolean {
  const showRules = rulesFor(rules, fieldKey, 'show')
  const hideRules = rulesFor(rules, fieldKey, 'hide')

  let visible = showRules.length === 0 || showRules.some((r) => ruleMatches(r, selections))
  if (visible && hideRules.some((r) => ruleMatches(r, selections))) {
    visible = false
  }
  return visible
}

export function isFieldRequired(
  rules: EvaluableRule[],
  selections: SelectionsMap,
  fieldKey: string
): boolean {
  return rulesFor(rules, fieldKey, 'require').some((r) => ruleMatches(r, selections))
}

/** Option values that should be removed from a field's choices given current selections. */
export function getExcludedOptionValues(
  rules: EvaluableRule[],
  selections: SelectionsMap,
  fieldKey: string
): Set<string> {
  const excluded = new Set<string>()
  for (const rule of rulesFor(rules, fieldKey, 'exclude')) {
    if (rule.target_value && ruleMatches(rule, selections)) {
      excluded.add(rule.target_value)
    }
  }
  return excluded
}

/** A `set_value` rule forces a field to a specific value when its trigger fires. */
export function getForcedValue(
  rules: EvaluableRule[],
  selections: SelectionsMap,
  fieldKey: string
): string | null {
  const match = rulesFor(rules, fieldKey, 'set_value').find((r) => ruleMatches(r, selections))
  return match?.target_value ?? null
}
