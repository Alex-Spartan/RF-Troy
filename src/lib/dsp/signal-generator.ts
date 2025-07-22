import { TimeSignal } from '@/types/rf';

export class SignalGenerator {
  /**
   * Creates a pure sine wave
   * @param frequency
   * @param amplitude
   * @param duration
   * @param sampleRate
   *
   */
  static createSineWave(
    frequency: number,
    amplitude: number = 1,
    duration: number = 1,
    sampleRate: number = 44100
  ): TimeSignal {
    console.log(sampleRate)
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);
    console.log(samples)

    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;

      samples[i] = amplitude * Math.sin(2 * Math.PI * frequency * time);
    }

    return {
      samples,
      sampleRate,
      timestamp: Date.now(),
      duration,
    };
  }

  /**
   * Creates a signal with multiple frequencies mixed together
   * Like hearing multiple musical notes played simultaneously
   */
  static createMultiTone(
    frequencies: number[],
    amplitudes: number[],
    duration: number = 1,
    sampleRate: number = 44100
  ): TimeSignal {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);

    // Generate each frequency component
    for (let freqIndex = 0; freqIndex < frequencies.length; freqIndex++) {
      const freq = frequencies[freqIndex];
      const amp = amplitudes[freqIndex] || 1;

      for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        // Add this frequency component to the total signal
        samples[i] += amp * Math.sin(2 * Math.PI * freq * time);
      }
    }

    return {
      samples,
      sampleRate,
      timestamp: Date.now(),
      duration,
    };
  }

  /**
   * Creates white noise - random signal across all frequencies
   * Like the "static" you hear between radio stations
   */
  static createWhiteNoise(
    amplitude: number = 0.1,
    duration: number = 1,
    sampleRate: number = 44100
  ): TimeSignal {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      samples[i] = amplitude * (2 * Math.random() - 1);
    }

    return {
      samples,
      sampleRate,
      timestamp: Date.now(),
      duration,
    };
  }

  /**
   * Creates a chirp signal - frequency that sweeps from low to high
   * Like a bird chirp or radar sweep
   */
  static createChirp(
    startFreq: number,
    endFreq: number,
    duration: number = 1,
    sampleRate: number = 44100
  ): TimeSignal {
    const numSamples = Math.floor(duration * sampleRate);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      // Frequency changes linearly over time
      const instantFreq = startFreq + (endFreq - startFreq) * (time / duration);

      samples[i] = Math.sin(2 * Math.PI * instantFreq * time);
    }

    return {
      samples,
      sampleRate,
      timestamp: Date.now(),
      duration,
    };
  }
}
