import { renderHook, act } from '@testing-library/react-hooks';
import { useState } from "react";
import { useDeriveState } from "../index";

test('derived state', () => {
    const { result } = renderHook(() => {
        const [state, setState] = useState(0);

        const [derivedState, setDerivedState] = useDeriveState(state);

        return {state, derivedState, setState, setDerivedState};
    });

    expect(result.current.state).toBe(0);
    expect(result.current.derivedState).toBe(0);

    act(() => result.current.setState(1));
    expect(result.current.state).toBe(1);
    expect(result.current.derivedState).toBe(1);

    act(() => result.current.setDerivedState(2));
    expect(result.current.state).toBe(1);
    expect(result.current.derivedState).toBe(2);

    act(() => result.current.setDerivedState(3));
    expect(result.current.state).toBe(1);
    expect(result.current.derivedState).toBe(3);

    act(() => result.current.setState(2));
    expect(result.current.state).toBe(2);
    expect(result.current.derivedState).toBe(2);

    act(() => result.current.setDerivedState(3));
    expect(result.current.state).toBe(2);
    expect(result.current.derivedState).toBe(3);
});