jest.mock(
  'file-type',
  () => ({
    fileTypeFromBuffer: jest.fn(),
  }),
  { virtual: true },
);
