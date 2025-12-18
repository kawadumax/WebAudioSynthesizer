// // AudioContextのモックを作成
// window.AudioContext = jest.fn(() => ({
//   createOscillator: jest.fn(() => ({
//     start: jest.fn(),
//     connect: jest.fn(),
//     frequency: { value: 0 },
//   })),
//   createGain: jest.fn(() => ({
//     gain: { value: 0, setValueAtTime: jest.fn() },
//     connect: jest.fn(),
//   })),
//   close: jest.fn(),
// })) as any;
