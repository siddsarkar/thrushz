import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export function withModalProvider<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const WrappedComponent = (props: P) => (
    <BottomSheetModalProvider>
      <Component {...props} />
    </BottomSheetModalProvider>
  );

  WrappedComponent.displayName = `withModalProvider(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}
