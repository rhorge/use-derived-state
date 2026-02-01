import { Dispatch, SetStateAction, useEffectEvent, useMemo, useState } from 'react';

/**
 * This hook creates a Derived State from propsState while avoiding the Cascading Updates Issue.
 * In our case, derived means that when there is a change in propsState,
 * the returned state changes to the same value,
 * but the derived state can also change independently when the returned setState is called.
 *
 * Caveats:
 * - Do not call the returned setter during rendering
 *
 * @param propsState - a reactive value (e.g. state, props) from which our returned state will be derived
 * @returns the exact same output as useState: [state, setState], where state is the derived state from the propsState
 */
export function useDeriveState<T>(propsState: T) {
    const propsId = useMemo(() => ({}), [propsState]);
    const [state, setState] = useState({ propsId, value: propsState });

    const derivedState = state.propsId === propsId ? state.value : propsState;

    const setDerivedState = useEffectEvent((value: SetStateAction<T>) => {
        const newValue = value instanceof Function ? value(derivedState) : value;
        setState(prev => derivedState !== newValue ? { propsId, value: newValue } : prev)
    })

    return [derivedState, setDerivedState] as [T, Dispatch<SetStateAction<T>>];
}