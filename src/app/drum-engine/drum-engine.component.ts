import { Component, OnInit } from '@angular/core';

import * as Tone from 'tone';

@Component({
  selector: 'app-drum-engine',
  templateUrl: './drum-engine.component.html',
  styleUrls: ['./drum-engine.component.scss'],
})
export class DrumEngineComponent implements OnInit {
  Tone:any;
  drumSynth:any;

  loopBeat:any;
  BPM:number;

  crusher:any;
  bitrate:number;

  shifter:any;
  pitch:number;

  constructor() { 

  }
  ngOnInit() {

    this.bitrate=4;
    this.pitch=0;
    this.crusher = new Tone.BitCrusher(this.bitrate).toMaster();
    this.shifter = new Tone.PitchShift(this.pitch).connect(this.crusher);
    this.drumSynth = new Tone.MembraneSynth({oscillator:{type:'square'}}).connect(this.shifter);
    this.BPM=40;

  }
  setup(): void{
    this.updateBPM();
    
    Tone.Transport.start();
  
    this.loopBeat = new Tone.Loop((time)=>{this.drumSynth.triggerAttackRelease('c1','4n', time)}, '16n');
    this.loopBeat.start(0);
  }

  stopLoop(): void{
    this.loopBeat.stop(0);
  }

  updateBPM():void{
    Tone.Transport.bpm.value = this.BPM;
  }

  updateBit():void{
    this.crusher.bits=this.bitrate;
  }
  
  updatePitch():void{
    this.shifter.pitch=this.pitch;
  }

}
