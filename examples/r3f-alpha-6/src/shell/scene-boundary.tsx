import { Component, type ReactNode } from "react";

/** Reports scene failures to the page so it can switch to the static announcement. */
export class SceneBoundary extends Component<
  { children: ReactNode; onError: (error: unknown) => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }
  render() {
    return this.state.error ? null : this.props.children;
  }
}
