import { describe, it, expect } from 'vitest';
import {
  labelForStatus,
  labelForImportance,
  labelForEvidence,
  labelForExperimentMethod,
  labelForExperimentResult,
  labelForEffort,
  labelForArtifactType,
} from './enums';

describe('lib/enums', () => {
  it('labels idea status with multi-word names', () => {
    expect(labelForStatus('idea', 'READY_FOR_BUILD')).toBe('Ready for Build');
    expect(labelForStatus('idea', 'BUILDING')).toBe('Building');
    expect(labelForStatus('idea', 'DRAFT')).toBe('Draft');
  });

  it('labels status per artifact type', () => {
    expect(labelForStatus('objective', 'ACHIEVED')).toBe('Achieved');
    expect(labelForStatus('opportunity', 'RESOLVED')).toBe('Resolved');
    expect(labelForStatus('assumption', 'INVALIDATED')).toBe('Invalidated');
    expect(labelForStatus('experiment', 'COMPLETE')).toBe('Complete');
  });

  it('labels experiment method and result', () => {
    expect(labelForExperimentMethod('FAKE_DOOR')).toBe('Fake Door');
    expect(labelForExperimentMethod('AB_TEST')).toBe('A/B Test');
    expect(labelForExperimentMethod('USER_INTERVIEW')).toBe('User Interview');
    expect(labelForExperimentResult('VALIDATED')).toBe('Validated');
    expect(labelForExperimentResult('INCONCLUSIVE')).toBe('Inconclusive');
  });

  it('labels importance and evidence', () => {
    expect(labelForImportance('HIGH')).toBe('High');
    expect(labelForEvidence('LOW')).toBe('Low');
  });

  it('labels effort level', () => {
    expect(labelForEffort('MEDIUM')).toBe('Medium');
  });

  it('falls back to title case for unknown values rather than raw snake case', () => {
    expect(labelForStatus('idea', 'NEW_WEIRD_STATUS')).toBe('New Weird Status');
    expect(labelForExperimentMethod('SOMETHING_NEW')).toBe('Something New');
  });

  it('returns an empty string for null / undefined', () => {
    expect(labelForStatus('idea', null)).toBe('');
    expect(labelForImportance(undefined)).toBe('');
  });

  it('provides artifact type labels', () => {
    expect(labelForArtifactType('objective')).toBe('Objective');
    expect(labelForArtifactType('assumption')).toBe('Assumption');
  });
});
