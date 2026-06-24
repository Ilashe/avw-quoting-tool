import type { DependencyRule } from '@/types/equipment'

export type SeedRule = Pick<
  DependencyRule,
  'rule_name' | 'trigger_field' | 'trigger_value' | 'action_type' | 'target_field' | 'target_value'
>

/**
 * Mirrors supabase/migrations/0003_equipment_conveyor_belt_entrance_presoak_hp.sql.
 * Kept in sync by hand — the DB row is the source of truth at runtime, this is the
 * code-reviewable copy referenced by decision #2 in PROJECT_STATUS.md.
 */
export const defaultRules: SeedRule[] = [
  {
    rule_name: 'eq_conveyor_belt_seed_cta_type_show',
    trigger_field: 'cta',
    trigger_value: 'yes',
    action_type: 'show',
    target_field: 'cta_type',
    target_value: null,
  },
  {
    rule_name: 'eq_conveyor_belt_seed_flight_spacing_hide',
    trigger_field: 'flight_size',
    trigger_value: 'no',
    action_type: 'hide',
    target_field: 'flight_spacing',
    target_value: null,
  },
  {
    rule_name: 'eq_conveyor_belt_seed_flight_spacing_exclude_1',
    trigger_field: 'flight_size',
    trigger_value: '1in',
    action_type: 'exclude',
    target_field: 'flight_spacing',
    target_value: '1_5in',
  },
  {
    rule_name: 'eq_conveyor_belt_seed_flight_spacing_exclude_2',
    trigger_field: 'flight_size',
    trigger_value: '1in',
    action_type: 'exclude',
    target_field: 'flight_spacing',
    target_value: '2in',
  },
  {
    rule_name: 'eq_conveyor_belt_seed_flight_spacing_exclude_3',
    trigger_field: 'flight_size',
    trigger_value: '1_25in',
    action_type: 'exclude',
    target_field: 'flight_spacing',
    target_value: '1_5in',
  },
  {
    rule_name: 'eq_conveyor_belt_seed_flight_spacing_exclude_4',
    trigger_field: 'flight_size',
    trigger_value: '1_25in',
    action_type: 'exclude',
    target_field: 'flight_spacing',
    target_value: '2in',
  },
  {
    rule_name: 'eq_conveyor_belt_seed_flight_spacing_exclude_5',
    trigger_field: 'flight_size',
    trigger_value: '1_5in',
    action_type: 'exclude',
    target_field: 'flight_spacing',
    target_value: '2in',
  },
]
