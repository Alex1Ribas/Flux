import { MAX_HORIZON, usePlanHorizonStore } from '../plan-horizon-store';

describe('When extending the plan horizon', () => {
  it('should grow six months at a time up to the maximum', () => {
    usePlanHorizonStore.getState().setMonths(12);
    usePlanHorizonStore.getState().extend();
    expect(usePlanHorizonStore.getState().months).toEqual(18);

    usePlanHorizonStore.getState().setMonths(MAX_HORIZON);
    usePlanHorizonStore.getState().extend();
    expect(usePlanHorizonStore.getState().months).toEqual(MAX_HORIZON);
  });
});
