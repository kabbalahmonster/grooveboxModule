import { Component, OnInit } from '@angular/core';

import * as Tone from 'tone';

@Component({
  selector: 'app-drum-engine',
  templateUrl: './drum-engine.component.html',
  styleUrls: ['./drum-engine.component.scss']
})
export class DrumEngineComponent implements OnInit {
  // declare variables
  effectsHidden: boolean;
  activeView: number;
  Tone: any;
  drumSynth: any;

  loopBeat: any;
  BPM: number;

  looping:boolean;

  crusher: any;
  bitrate: number;

  shifter: any;
  pitch: number;

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

  constructor() {}
  ngOnInit() {
    // initialize variables
    this.effectsHidden = true;
    this.activeView = 0;
    this.bitrate = 4;
    this.pitch = 0;
    this.arpInterval = 0;
    this.looping=false;

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
    this.waveIndex = 0;
    this.drumSynth = new Tone.MembraneSynth({
      oscillator: { type: this.waveList[this.waveIndex] }
    }).toMaster();
    this.BPM = 40;
    this.envDecay = 0.4;
    this.envPitchDecay = 0.05;
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
    this.intervalIndex = 5;
    this.noteIndex = 0;
    this.populateNotes();
    this.bitCrusherToggle = false;
    this.pitchShifterToggle = false;
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
    }, this.loopInterval[this.intervalIndex]);
    this.loopBeat.start(0);
  }

  stopLoop(): void {
    this.loopBeat.stop(0);
  }

  updateBPM(): void {
    Tone.Transport.bpm.value = this.BPM;
  }

  updateBit(): void {
    this.crusher.bits = this.bitrate;
  }

  updatePitch(): void {
    this.shifter.pitch = this.pitch;
  }

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
    console.log('notes:' + this.notes);
  }

  // update current note
  updateNote(): void {
    this.drumSynth.oscillator.frequency.value = this.notes[this.noteIndex];
  }

  // connect bitcrusher
  updateBitCrusherToggle() {
    if (this.bitCrusherToggle) {
      this.crusher = new Tone.BitCrusher(this.bitrate);
      if (this.pitchShifterToggle) {
        this.shifter.connect(this.crusher);
      } else {
        this.drumSynth.connect(this.crusher);
      }
      this.crusher.toMaster();
    } else {
      if (this.pitchShifterToggle) {
        this.shifter.toMaster();
      } else {
        this.drumSynth.toMaster();
      }
      this.crusher.dispose();
    }
  }
  // connect pitch shifter
  updatePitchShifterToggle() {
    if (this.pitchShifterToggle) {
      this.shifter = new Tone.PitchShift(this.pitch);

      this.drumSynth.connect(this.shifter);
      if (this.bitCrusherToggle) {
        this.shifter.connect(this.crusher);
      } else {
        this.shifter.toMaster();
      }
    } else {
      if (this.bitCrusherToggle) {
        this.drumSynth.connect(this.crusher);
      } else {
        this.drumSynth.toMaster();
      }
      this.shifter.dispose();
    }
  }
}
