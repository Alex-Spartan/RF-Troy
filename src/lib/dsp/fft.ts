import { WindowFunctions } from '@/lib/dsp/windowing';
import { DSPConfig, SpectrumData, TimeSignal } from '@/types/rf';

/**
 * FFT (Fast Fourier Transform) Processor
 *
 * This is a transformer:
 * "time singnal" → "frequency signal"
 *
 */
export class FFTProcessor {
  private config: DSPConfig;

  constructor(config: DSPConfig) {
    this.config = config;
  }

  /**
   * Main function: Convert a time-domain signal to frequency spectrum
   *
   * @param signal - The input signal (amplitude vs time)
   * @returns SpectrumData - The output spectrum (amplitude vs frequency)
   */
  processSignal(signal: TimeSignal): SpectrumData {
    // Step 1: Take a chunk of the signal for analysis
    const chunk = this.extractChunk(signal.samples, this.config.fftSize);

    // Step 2: Apply windowing to reduce artifacts
    const windowedChunk = WindowFunctions.applyWindow(chunk, this.config.windowType);

    // Step 3: Perform the FFT transformation
    const fftResult = this.computeFFT(windowedChunk);

    // Step 4: Convert complex numbers to magnitudes (signal strength)
    const magnitudes = this.computeMagnitudes(fftResult);

    // Step 5: Convert to dB scale and create frequency axis
    const frequencies = this.createFrequencyAxis(signal.sampleRate);
    const magnitudesDB = this.convertToDecibels(magnitudes);

    return {
      frequencies,
      magnitudes: magnitudesDB,
      timestamp: Date.now(),
      binWidth: signal.sampleRate / this.config.fftSize
    };
  }

  /**
   * Extract a chunk of samples for FFT processing
   * We can only analyze a fixed-size chunk at a time
   */
  private extractChunk(samples: Float32Array, chunkSize: number): Float32Array {
    const chunk = new Float32Array(chunkSize);

    // Copy samples, pad with zeros if needed
    for (let i = 0; i < chunkSize; i++) {
      chunk[i] = i < samples.length ? samples[i] : 0;
    }

    return chunk;
  }

  /**
   * Simplified FFT implementation
   * In a real application, you'd use a library like fft-js
   * This is for educational purposes to show the concept
   */
  private computeFFT(samples: Float32Array): ComplexNumber[] {
    const N = samples.length;
    const result: ComplexNumber[] = [];

    // This is the mathematical definition of DFT (Discrete Fourier Transform)
    // FFT is just a fast algorithm to compute the same thing
    for (let k = 0; k < N / 2; k++) { // Only need first half due to symmetry
      let realSum = 0;
      let imagSum = 0;

      // Sum up all the signal samples with complex exponential weights
      for (let n = 0; n < N; n++) {
        const angle = -2 * Math.PI * k * n / N;
        realSum += samples[n] * Math.cos(angle);
        imagSum += samples[n] * Math.sin(angle);
      }

      result.push({
        real: realSum,
        imag: imagSum
      });
    }

    return result;
  }

  /**
   * Convert complex FFT results to signal magnitudes
   * Complex numbers represent both amplitude and phase
   * For spectrum display, we usually only care about amplitude
   */
  private computeMagnitudes(complexData: ComplexNumber[]): Float32Array {
    const magnitudes = new Float32Array(complexData.length);

    for (let i = 0; i < complexData.length; i++) {
      const { real, imag } = complexData[i];
      // Magnitude = sqrt(real² + imag²)
      magnitudes[i] = Math.sqrt(real * real + imag * imag);
    }

    return magnitudes;
  }

  /**
   * Create frequency axis labels
   * Each FFT bin corresponds to a specific frequency
   */
  private createFrequencyAxis(sampleRate: number): Float32Array {
    const numBins = this.config.fftSize / 2;
    const frequencies = new Float32Array(numBins);

    for (let i = 0; i < numBins; i++) {
      // Each bin represents (sampleRate / fftSize) Hz
      frequencies[i] = (i * sampleRate) / this.config.fftSize;
    }

    return frequencies;
  }

  /**
   * Convert linear magnitudes to decibel scale
   * dB scale compresses the huge dynamic range of signals
   *
   * Why dB? Signals can vary by millions in amplitude
   * dB makes this manageable: 0dB, -20dB, -40dB, etc.
   */
  private convertToDecibels(magnitudes: Float32Array): Float32Array {
    const dB = new Float32Array(magnitudes.length);

    for (let i = 0; i < magnitudes.length; i++) {
      // Avoid log(0) which is undefined
      const mag = Math.max(magnitudes[i], 1e-10);
      // dB = 20 * log10(magnitude)
      dB[i] = 20 * Math.log10(mag);
    }

    return dB;
  }
}

/**
 * Helper interface for complex numbers
 * FFT works with complex numbers (real + imaginary parts)
 */
interface ComplexNumber {
  real: number;
  imag: number;
}
