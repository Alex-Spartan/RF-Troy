export interface TimeSignal {
  samples: Float32Array;
  sampleRate: number;
  timestamp: number;
  duration: number;
}

export interface SpectrumData {
  frequencies: Float32Array;
  magnitudes: Float32Array;
  timestamp: number;
  binWidth: number;
}

export interface DSPConfig {
  fftSize: number;
  windowType: 'rectangular' | 'hanning' | 'hamming';
  averagingCount: number;
}
