import { Component, OnInit } from '@angular/core';

import * as Tone from 'tone';
import { TimeInterval } from 'rxjs';

@Component({
  selector: 'app-drum-engine',
  templateUrl: './drum-engine.component.html',
  styleUrls: ['./drum-engine.component.scss']
})
export class DrumEngineComponent implements OnInit {
  // declare variables
  chainList: AudioNode[];

  // filter scope variables
  FScope:any;
  FScopeCtx: any;
  FScopeInterval:any;

  // oscilloscope variables
  myOscilloscope: any;
  myOscCtx: any;
  myOscLen: number;
  myOscInterval: any;
  myOscIntervalNew: number;
  myOscResolution: number;
  myOscResolutions: number[];
  myOscResolutionsIndex: number;
  myOscVisible: boolean;
  myOscSmoothing: number;
  myOscOffsetScope: boolean;

  analyser: Tone.Analyser;

  VIEW_DEFAULT = 'Drum';
  selectedView: string;

  effectsHidden: boolean;
  activeView: number;
  Tone: any;
  drumSynth: any;

  loopBeat: any;
  BPM: number;
  trSwing: number;

  looping: boolean;

  // --------------------bitcrusher variables
  crusher: any;
  bitrate: number;
  bcWetness: number;

  // --------------------pitch shifter variables
  shifter: any;
  pitch: number;
  psWindowSize: number;
  psDelayTime: number;
  psFeedback: number;
  psWetness: number;

  // --------------------filter variables
  filter: Tone.Filter;
  filterToggle: boolean;
  filterTypeIndex: number;
  filterTypesList: string[];
  filterFrequency: number;
  filterQ: number;
  filterGain: number;
  filterDetune: number;
  filterRolloffList: number[];
  filterRolloffIndex: number;

  envDecay: number;
  envPitchDecay: number;

  loopInterval: string[];
  intervalIndex: number;

  waveList: string[];
  waveIndex: number;

  notes: string[];
  noteIndex: number;

  arpInterval: number;

  bitCrusherToggle: boolean;
  pitchShifterToggle: boolean;

  constructor() { }
  ngOnInit() {
    // initialize variables
    this.effectsHidden = true;
    this.activeView = 0;
    this.bitrate = 4;
    this.bcWetness = 0.5;
    this.pitch = 0;
    this.psDelayTime = 0;
    this.psFeedback = 0;
    this.psWetness = 0.5;
    this.arpInterval = 0;
    this.looping = false;

    this.selectedView = this.VIEW_DEFAULT;

    this.myOscResolutions = [
      16,
      32,
      64,
      128,
      256,
      512,
      1024,
      2048,
      4096,
      8192,
      16384
    ];
    this.myOscResolutionsIndex = this.myOscResolutions.length - 1;
    this.myOscVisible = true;
    this.myOscSmoothing = 1;
    this.myOscResolution = this.myOscResolutions[this.myOscResolutionsIndex];
    this.myOscOffsetScope = true;

    this.waveList = [
      'fmsine',
      'fmsawtooth',
      'fmsquare',
      'fmtriangle',
      'amsine',
      'amsawtooth',
      'amsquare',
      'amtriangle',
      'fatsine',
      'fatsawtooth',
      'fatsquare',
      'fattriangle',
      'pwm'
    ];
    this.waveIndex = this.waveList.length - 1;
    this.drumSynth = new Tone.MembraneSynth({
      oscillator: { type: this.waveList[this.waveIndex] }
    });
    this.BPM = 120;
    this.trSwing = 0;
    this.envDecay = 1.5;
    this.envPitchDecay = 1;
    this.loopInterval = [
      '1n',
      '2n',
      '2t',
      '3n',
      '3t',
      '4n',
      '4t',
      '8n',
      '8t',
      '16n',
      '16t',
      '32n',
      '32t',
      '64n',
      '64t'
    ];
    this.intervalIndex = 6;
    this.noteIndex = 0;
    this.populateNotes();
    this.bitCrusherToggle = false;
    this.pitchShifterToggle = false;
    this.psWindowSize = 0.1;

    this.shifter = new Tone.PitchShift(this.pitch);
    this.crusher = new Tone.BitCrusher(this.bitrate);

    // ------------------------------ filter initialization
    this.filterToggle = true;
    this.filterTypesList = [
      'lowpass',
      'highpass',
      'bandpass',
      'allpass',
      'notch',
      'lowshelf',
      'highshelf',
      'peaking'
    ];
    this.filterRolloffList = [-12, -24, -48, -96];
    this.filterTypeIndex = 0;
    this.filterRolloffIndex = 0;
    this.filterFrequency = 1000;
    this.filterGain = 1;
    this.filterQ = 1;
    this.filterDetune = 0;
    this.filter = new Tone.Filter();

    // ------------------------------ analyzer initialization
    this.analyser = new Tone.Analyser({
      type: 'waveform',
      size: this.myOscResolution,
      smoothing: this.myOscSmoothing
    });
    this.myOscilloscope = document.getElementById('myOscilloscope');
    this.myOscCtx = this.myOscilloscope.getContext('2d');
    this.myOscLen = this.analyser.getValue().length;


    
    this.myOscIntervalNew = 1;
    this.myOscInterval = setInterval(() => {
      this.draw();
    }, this.myOscIntervalNew);

    // FScope initialization
    this.FScope = document.getElementById('FScope');
    this.FScopeCtx = this.FScope.getContext('2d');
    this.FScopeInterval = setInterval(() => {
      this.drawFScope();
    }, 16);


    

    // construct initial signal chain
    this.updateChain();
  }

  setup(): void {
    this.updateBPM();

    Tone.Transport.start();

    this.loopBeat = new Tone.Loop(time => {
      this.drumSynth.triggerAttackRelease(this.notes[this.noteIndex], time);
      this.noteIndex += this.arpInterval;
      if (this.noteIndex >= this.notes.length) {
        this.noteIndex -= this.notes.length;
      } else if (this.noteIndex < 0) {
        this.noteIndex += this.notes.length;
      }
      //console.log(this.analyser.getValue());
    }, this.loopInterval[this.intervalIndex]);
    this.loopBeat.start(0);
  }

  stopLoop(): void {
    this.loopBeat.stop(0);
  }
  updateLooping() {
    if (this.looping) {
      this.setup();
    } else {
      this.stopLoop();
    }
  }

  updateOscilloscopeResolution() {
    this.myOscResolution = this.myOscResolutions[this.myOscResolutionsIndex];
    this.analyser.size = this.myOscResolution;
  }

  updateOscilloscopeInterval() {
    clearInterval(this.myOscInterval);

    this.myOscInterval = setInterval(() => {
      this.draw();
    }, this.myOscIntervalNew);
  }
  updateOscilloscopeVisible() {
    if (this.myOscVisible) {
      this.myOscInterval = setInterval(() => {
        this.draw();
      }, this.myOscIntervalNew);
    } else {
      clearInterval(this.myOscInterval);
    }
  }

  updateOscilloscopeSmoothing() {
    this.analyser.smoothing = this.myOscSmoothing;
  }

  updateBPM(): void {
    Tone.Transport.bpm.value = this.BPM;
  }
  updateTrSwing(): void {
    Tone.Transport.swing = this.trSwing;
  }
  // ------------------ bit crusher parameters
  updateBit(): void {
    this.crusher.bits = this.bitrate;
  }

  updateBcWetness() {
    this.crusher.wet.value = this.bcWetness;
  }

  // ----------------- pitch shifter parameters
  // pitch
  updatePitch(): void {
    this.shifter.pitch = this.pitch;
  }
  // window size
  updateWindowSize() {
    this.shifter.windowSize = this.psWindowSize;
  }

  // delay time
  updatePsDelayTime() {
    this.shifter.delayTime.value = this.psDelayTime;
  } // feedback
  updatePsFeedback() {
    this.shifter.feedback.value = this.psFeedback;
  }
  updatePsWetness() {
    this.shifter.wet.value = this.psWetness;
  }

  // ----------------------

  updateEnvelope(): void {
    this.drumSynth.envelope.decay = this.envDecay;
  }
  updatePitchEnvelope(): void {
    this.drumSynth.pitchDecay = this.envPitchDecay;
  }
  updateInterval(): void {
    this.loopBeat.interval = this.loopInterval[this.intervalIndex];
  }

  updateWave(): void {
    this.drumSynth.oscillator.set({ type: this.waveList[this.waveIndex] });
  }

  // create array of notes
  populateNotes(): void {
    this.notes = [];
    for (let x = 1; x <= 6; x++) {
      this.notes.push('c' + x);
      this.notes.push('d' + x);
      this.notes.push('e' + x);
      this.notes.push('f' + x);
      this.notes.push('g' + x);
      this.notes.push('a' + x);
      this.notes.push('b' + x);
    }
   // console.log('notes:' + this.notes);
  }

  // update current note
  updateNote(): void {
    this.drumSynth.oscillator.frequency.value = this.notes[this.noteIndex];
  }

  // ----------------------------------CHAIN UPDATER ---------------------------------------------
  // check for enabled modules and construct signal chain
  updateChain() {
    this.drumSynth.disconnect(0);
    // construct chain route array, beginning with source
    this.chainList = [this.drumSynth];

    // add pitch shifter?
    if (this.pitchShifterToggle) {
      this.chainList.push(this.shifter);
    } else {
      this.shifter.disconnect(0);
    }
    // add bitcrusher?
    if (this.bitCrusherToggle) {
      this.chainList.push(this.crusher);
    } else {
      this.crusher.disconnect(0);
    }

    // add filter?
    if (this.filterToggle) {
      this.chainList.push(this.filter);
    } else {
      this.filter.disconnect(0);
    }
    // add analyser
    this.chainList.push(this.analyser);
    // add master
    this.chainList.push(Tone.Master);
    // console.log('inside updateChain : ' + this.chainList.length);

    // connect
    for (let i = 1; i < this.chainList.length; i++) {
      // console.log('value of i : ' + i);
      this.chainList[i - 1].connect(this.chainList[i]);
    }
  }

  // --------------------- FILTER METHODS -------------------------------------------------------------
  // filter type
  updateFilterType() {
    this.filter.type = this.filterTypesList[this.filterTypeIndex];
  }
  // cutoff frequency
  updateFilterFrequency() {
    this.filter.frequency.value = this.filterFrequency;
    console.log(this.filter.getFrequencyResponse());
  }
  // filter gain
  updateFilterGain() {
    this.filter.gain.value = this.filterGain;
  }
  // filter Q
  updateFilterQ() {
    this.filter.Q.value = this.filterQ;
  }
  // filter detune
  updateFilterDetune() {
    this.filter.detune.value = this.filterDetune;
  }
  // filter rolloff
  updateFilterRolloff(){
    this.filter.rolloff=this.filterRolloffList[this.filterRolloffIndex];
  }

  // -----------------------------------------------------------------------------------------------

  // ---------------- OSCILLOSCOPE--------------------------------------------------------------------
  draw() {
    // let drawOsc = requestAnimationFrame(draw);
    // console.log("DRAWING IN");
    this.myOscCtx.clearRect(
      0,
      0,
      this.myOscilloscope.width,
      this.myOscilloscope.height
    );
    const dataArray = this.analyser.getValue();
    //const dataArray = this.filter.getFrequencyResponse();

    // console.log(dataArray);
    this.myOscCtx.lineWidth = 2;
    this.myOscCtx.strokeStyle = 'rgb(0,0,0)';
    this.myOscCtx.beginPath();
    // store length of dataArray
    this.myOscLen = dataArray.length;

    // scale x interval to canvas width
    const sliceWidth = this.myOscilloscope.width / (this.myOscLen - 1);
    let x = 0;
    let y: number;
    const scopeOffset = this.myOscilloscope.height / 2;
    const scopeScale = this.myOscilloscope.height/4;

    dataArray.map(i=>
    {
      if (this.myOscOffsetScope) {
        y = i * scopeScale + scopeOffset;
      } else {
        //y = (dataArray[i] * this.myOscilloscope.height;
        y = i*scopeScale;
      }

      if (i === 0) {
        this.myOscCtx.moveTo(x, y);
      } else {
        this.myOscCtx.lineTo(x, y);
      }
      x += sliceWidth;
    });
    this.myOscCtx.stroke();

    // console.log("DRAWING OUT");
  }

  // ---------------- FILTER SCOPE--------------------------------------------------------------------
  drawFScope() {
    // let drawOsc = requestAnimationFrame(draw);
    // console.log("DRAWING IN");
    this.FScopeCtx.clearRect(
      0,
      0,
      this.FScope.width,
      this.FScope.height
    );
    //const dataArray = this.analyser.getValue();
    const dataArray = this.filter.getFrequencyResponse();

    // console.log(dataArray);
    this.FScopeCtx.lineWidth = 2;
    this.FScopeCtx.strokeStyle = 'rgb(0,0,0)';
    this.FScopeCtx.beginPath();
    // store length of dataArray
    const frameLength = dataArray.length;

    // scale x interval to canvas width
    const sliceWidth = this.myOscilloscope.width / (frameLength - 1);
    let x = 0;
    let y: number;
    const scopeOffset = this.FScope.height / 2;
    const scopeScale = this.FScope.height/4;

    dataArray.map(i=>
    {
        y = i*scopeScale;

      if (i === 0) {
        this.FScopeCtx.moveTo(x, y);
      } else {
        this.FScopeCtx.lineTo(x, y);
      }
      x += sliceWidth;
    });
    this.FScopeCtx.stroke();

    // console.log("DRAWING OUT");
  }
}
