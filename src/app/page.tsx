'use client';

import React, { useState, useCallback } from 'react';
import { TimeSignal, SpectrumData, DSPConfig } from '@/types/rf';
import { SignalGenerator } from '@/lib/dsp/signal-generator';
import { FFTProcessor } from '@/lib/dsp/fft';
import SpectrumDisplay from '@/components/visualizer/spectrum-display';

/**
 * Main RF Signal Analysis Application
 *
 * This ties together all our DSP concepts:
 * 1. Generate test signals
 * 2. Process them with FFT
 * 3. Display the results
 */
export default function RFAnalysisApp() {
  // Current spectrum data to display
  const [spectrumData, setSpectrumData] = useState<SpectrumData | null>(null);

  // Current signal being analyzed
  const [currentSignal, setCurrentSignal] = useState<TimeSignal | null>(null);

  // DSP configuration
  const [dspConfig, setDspConfig] = useState<DSPConfig>({
    fftSize: 1024,
    windowType: 'hanning',
    averagingCount: 1
  });

  // Signal generation parameters
  const [signalParams, setSignalParams] = useState({
    type: 'sine' as 'sine' | 'multitone' | 'noise' | 'chirp',
    frequency: 1000,
    amplitude: 1.0,
    duration: 1.0,
    sampleRate: 44100
  });

  /**
   * Generate a test signal and analyze it
   */
  const generateAndAnalyze = useCallback(() => {
    let signal: TimeSignal;

    // Generate the appropriate signal type
    switch (signalParams.type) {
      case 'sine':
        signal = SignalGenerator.createSineWave(
          signalParams.frequency,
          signalParams.amplitude,
          signalParams.duration,
          signalParams.sampleRate
        );
        break;

      case 'multitone':
        // Create a signal with multiple frequencies
        signal = SignalGenerator.createMultiTone(
          [signalParams.frequency, signalParams.frequency * 2, signalParams.frequency * 3],
          [signalParams.amplitude, signalParams.amplitude * 0.5, signalParams.amplitude * 0.3],
          signalParams.duration,
          signalParams.sampleRate
        );
        break;

      case 'noise':
        signal = SignalGenerator.createWhiteNoise(
          signalParams.amplitude,
          signalParams.duration,
          signalParams.sampleRate
        );
        break;

      case 'chirp':
        signal = SignalGenerator.createChirp(
          signalParams.frequency,
          signalParams.frequency * 4, // Sweep to 4x the base frequency
          signalParams.duration,
          signalParams.sampleRate
        );
        break;

      default:
        return;
    }

    // Store the generated signal
    setCurrentSignal(signal);

    // Process it with FFT
    const fftProcessor = new FFTProcessor(dspConfig);
    const spectrum = fftProcessor.processSignal(signal);

    // Display the results
    setSpectrumData(spectrum);
  }, [signalParams, dspConfig]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            RF Signal Analysis Platform
          </h1>
          <p className="text-gray-400">
            Learn DSP concepts through interactive signal generation and analysis
          </p>
        </header>

        {/* Controls Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl text-white mb-4">Signal Generator</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Signal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Signal Type
              </label>
              <select
                value={signalParams.type}
                onChange={(e) => setSignalParams(prev => ({
                  ...prev,
                  type: e.target.value as any
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="sine">Pure Sine Wave</option>
                <option value="multitone">Multiple Tones</option>
                <option value="noise">White Noise</option>
                <option value="chirp">Frequency Sweep</option>
              </select>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frequency (Hz)
              </label>
              <input
                type="number"
                value={signalParams.frequency}
                onChange={(e) => setSignalParams(prev => ({
                  ...prev,
                  frequency: Number(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            {/* Amplitude */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amplitude (0-1)
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={signalParams.amplitude}
                onChange={(e) => setSignalParams(prev => ({
                  ...prev,
                  amplitude: Number(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              />
            </div>

            {/* Sample Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sample Rate (Hz)
              </label>
              <select
                value={signalParams.sampleRate}
                onChange={(e) => setSignalParams(prev => ({
                  ...prev,
                  sampleRate: Number(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value={8000}>8 kHz</option>
                <option value={22050}>22.05 kHz</option>
                <option value={44100}>44.1 kHz</option>
                <option value={48000}>48 kHz</option>
              </select>
            </div>
          </div>

          {/* DSP Settings */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                FFT Size
              </label>
              <select
                value={dspConfig.fftSize}
                onChange={(e) => setDspConfig(prev => ({
                  ...prev,
                  fftSize: Number(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value={256}>256</option>
                <option value={512}>512</option>
                <option value={1024}>1024</option>
                <option value={2048}>2048</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Window Function
              </label>
              <select
                value={dspConfig.windowType}
                onChange={(e) => setDspConfig(prev => ({
                  ...prev,
                  windowType: e.target.value as any
                }))}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
              >
                <option value="rectangular">Rectangular</option>
                <option value="hanning">Hanning</option>
                <option value="hamming">Hamming</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={generateAndAnalyze}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
              >
                Generate & Analyze
              </button>
            </div>
          </div>
        </div>

        {/* Spectrum Display */}
        <SpectrumDisplay
          spectrumData={spectrumData}
          width={1000}
          height={500}
          title="Frequency Spectrum"
        />

        {/* Information Panel */}
        <div className="bg-gray-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg text-white mb-3">What's Happening?</h3>

          {currentSignal && spectrumData && (
            <div className="text-gray-300 space-y-2">
              <p>
                <strong>Signal Generated:</strong> {signalParams.type} wave with {currentSignal.samples.length.toLocaleString()} samples
              </p>
              <p>
                <strong>FFT Analysis:</strong> {spectrumData.frequencies.length} frequency bins, {spectrumData.binWidth.toFixed(1)} Hz resolution
              </p>
              <p>
                <strong>Frequency Range:</strong> 0 Hz to {(signalParams.sampleRate / 2 / 1000).toFixed(1)} kHz (Nyquist limit)
              </p>
            </div>
          )}

          {!currentSignal && (
            <p className="text-gray-400 italic">
              Click "Generate & Analyze" to create a test signal and see its frequency spectrum
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
