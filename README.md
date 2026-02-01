# A React Hook that Creates a Derived State from a Reactive Value (Fixing the Cascading Updates Issue)

## Highlights
- Offers a hook called useDeriveState
- No extra renders
- Removes the Cascading Updates Problem
- Same API as useState
- No extra dependencies
- Written in React with Typescript
- Typescript support
- Small bundle size

## Install

```sh
    yarn add use-derive-state
```
or
```sh
    npm install use-derive-state
```

## Usage

### Derive state from prop

```typescript jsx
import { useState } from 'react';

function ParentComponent() {
  const [parentState, setParentState] = useState(0);

  return (
    <div>
      <button onClick={() => {setParentState(prev => prev + 1);}}>
        increment parentState
      </button>
      <div>parentState = {parentState}</div>
      <ChildComponent parentState={parentState} />
    </div>
  );
}

import { useDeriveState } from 'use-derive-state';

function ChildComponent({ parentState }: { parentState: number }) {
  // this derivedState is derived from parentState (has the same API as useState)
  const [derivedState, setDerivedState] = useDeriveState(parentState);
  
  return (
    <div>
      <button onClick={() => {setDerivedState(prev => prev + 1);}}>
        increment derivedState
      </button>
      <div>derivedState = {derivedState}</div>
    </div>
  );
}
```

### Derived state from memoized value

```typescript jsx
import { useMemo } from 'react';
import { useDeriveState } from 'use-derive-state';

function ChildComponent({ parentState }: { parentState: number }) {
  // compute a value based on parentState
  const complexState = useMemo(() => parentState + 1, [parentState]);
  
  // derivedState is derived from complexState (has the same API as useState)
  const [derivedState, setDerivedState] = useDeriveState(complexState);

  return (
    <div>
      <button onClick={() => {setDerivedState(prev => prev + 1);}}>
        increment derivedState
      </button>
      <div>derivedState = {derivedState}</div> 
    </div>
  );
}
```

## Description
This hook creates a derived state while avoiding the cascading updates issue.
In our case, derived means:
- When there is a change in the reactive value that we derived our state from,
the returned state changes to the same value, but it can also change independently when the returned setState is called.
- It manages to derive the values without any extra re-renders (only one when the arguments change)


### Let's see a small example

This illustrates how this behavior was achieved in the past:

```typescript jsx
function ChildComponent({ parentState }: { parentState: number }) {
  const [derivedState, setDerivedState] = useDeriveState(parentState);

  useEffect(() => {
    setDerivedState(parentState)
  }, [parentState]);
  // ...
}
```

This is doing its job, but we now have another problem called "cascading updates" (which will be spotted by the
React Performance tracks). You can read the docs at the following link
https://react.dev/reference/dev-tools/react-performance-tracks#cascading-updates.

To explain why this happens, we first have to know that React Fiber algorithm has two phases: the render phase and
the commit phase. All you need to know, to understand the issue, is that React will call useEffect after the entire
virtual dom is rendered.

So, in our case, after the first render will complete parentState and derivedState will have both the value 0
(the initial value of parentState). Setting parentState to a new value (let's say 1), React will render the
ChildComponent with the parentState props as 1, but the derivedState will still have the previous value 0.
Once the useEffect runs (calling setDerivedState with 1), we will have another render that has both values equal to 1.
This is the cascading updates problem in all its glory, instead of having one render, you ended up having two
(having also a performance penalty).


What React docs tell us to do in this case can be found here
https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
The above example has been changed to match the docs. It still rerenders the ChildComponent twice, which still causes a
performance penalty, is hard to reason about and works only for states defined in the same component
(if derivedState was a prop, it wouldn't work). Also, the parentState and derivedState will be equal only starting with
the second render.

```typescript jsx
function ChildComponent({ parentState }: { parentState: number }) {
  const [derivedState, setDerivedState] = useState(parentState);

  // Better: Adjust the state while rendering
  const [prevState, setPrevState] = useState(parentState);
  if (parentState !== prevState) {
    setPrevState(parentState);
    setDerivedState(parentState);
  }
  // ...
}
```

The 'use-derive-state' library fixes all these issues in an easier and more consistent manner. It derives the state without
any unnecessary renders (you will have only one, when the parentState changes). Also, the API is easy to use and it 
works for any reactive value.

In the below example, if the reactive value changes (for example setParentState(1) is called), both parentState and 
derivedState will have the same value from the very first render (after the setParentState) and there will be no 
additional render (only the needed one).


```typescript jsx
import { useDeriveState } from 'use-derive-state';

function ChildComponent({ parentState }: { parentState: number }) {
  const [derivedState, setDerivedState] = useDeriveState(parentState);
  // ...
}
```

## Caveats
- Do not call the returned setter during rendering (it uses useEffectEvent under the hood)
- The hook only works with React versions greater than or equal to 19.2.0 (where useEffectEvent is defined)

## License
MIT