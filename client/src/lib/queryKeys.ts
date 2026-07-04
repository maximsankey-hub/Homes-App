export const queryKeys = {
  properties: ['properties'] as const,
  property: (id: string) => ['properties', id] as const,
};
