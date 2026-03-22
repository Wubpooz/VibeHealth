import { Component, Input, OnChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type BunnyMood = 'wave' | 'curious' | 'thinking' | 'excited' | 'celebrate' | 'idle' | 'sad' | 'happy';

@Component({
  selector: 'app-bunny-mascot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bunny-container" [class]="'bunny-' + currentMood()">
      <!-- Bunny SVG -->
      <svg
        class="bunny-svg"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        [style.width.px]="size"
        [style.height.px]="size"
      >
        <!-- Background glow -->
        <circle cx="100" cy="100" r="85" class="bunny-glow"/>

        <!-- Left Ear -->
        <path
          class="bunny-ear bunny-ear-left"
          d="M65 45 Q55 10, 70 35 Q75 20, 80 45 Q75 50, 70 47 Q67 48, 65 45"
          fill="#FFF5F7"
          stroke="#FFB6C1"
          stroke-width="2"
        />
        <path
          d="M70 42 Q68 30, 72 38"
          fill="#FFD1DC"
        />

        <!-- Right Ear -->
        <path
          class="bunny-ear bunny-ear-right"
          d="M135 45 Q145 10, 130 35 Q125 20, 120 45 Q125 50, 130 47 Q133 48, 135 45"
          fill="#FFF5F7"
          stroke="#FFB6C1"
          stroke-width="2"
        />
        <path
          d="M130 42 Q132 30, 128 38"
          fill="#FFD1DC"
        />

        <!-- Body shadow -->
        <ellipse cx="103" cy="148" rx="42" ry="15" fill="#E8D4D9" opacity="0.3"/>

        <!-- Body -->
        <ellipse
          class="bunny-body"
          cx="100" cy="130" rx="38" ry="32"
          fill="#FFF9FA"
          stroke="#FFD1DC"
          stroke-width="2"
        />

        <!-- Head -->
        <circle
          class="bunny-head"
          cx="100" cy="90" r="42"
          fill="#FFF9FA"
          stroke="#FFD1DC"
          stroke-width="2"
        />

        <!-- Cheek blush left -->
        <ellipse cx="68" cy="98" rx="10" ry="7" fill="#FFCCD5" opacity="0.6"/>

        <!-- Cheek blush right -->
        <ellipse cx="132" cy="98" rx="10" ry="7" fill="#FFCCD5" opacity="0.6"/>

        <!-- Eyes -->
        <g class="bunny-eyes">
          <!-- Left eye -->
          <ellipse cx="80" cy="85" rx="8" ry="9" fill="#4A3728"/>
          <ellipse cx="82" cy="83" rx="3" ry="3.5" fill="white"/>

          <!-- Right eye -->
          <ellipse cx="120" cy="85" rx="8" ry="9" fill="#4A3728"/>
          <ellipse cx="122" cy="83" rx="3" ry="3.5" fill="white"/>
        </g>

        <!-- Closed eyes for blinking / celebration -->
        <g class="bunny-eyes-closed" opacity="0">
          <path d="M72 86 Q80 90, 88 86" stroke="#4A3728" stroke-width="3" stroke-linecap="round" fill="none"/>
          <path d="M112 86 Q120 90, 128 86" stroke="#4A3728" stroke-width="3" stroke-linecap="round" fill="none"/>
        </g>

        <!-- Nose -->
        <ellipse
          class="bunny-nose"
          cx="100" cy="95" rx="5" ry="4"
          fill="#FFB6C1"
        />

        <!-- Mouth expressions -->
        <g class="bunny-mouth-happy">
          <path
            d="M92 103 Q100 112, 108 103"
            stroke="#E8A0B0"
            stroke-width="2.5"
            stroke-linecap="round"
            fill="none"
          />
        </g>

        <g class="bunny-mouth-open" opacity="0">
          <ellipse cx="100" cy="107" rx="8" ry="6" fill="#FF8FAB"/>
          <ellipse cx="100" cy="109" rx="5" ry="3" fill="#FF6B8A"/>
        </g>

        <!-- Whiskers -->
        <g class="bunny-whiskers" stroke="#E8C4CE" stroke-width="1.5" stroke-linecap="round">
          <line x1="60" y1="93" x2="45" y2="88"/>
          <line x1="60" y1="98" x2="43" y2="98"/>
          <line x1="60" y1="103" x2="45" y2="108"/>
          <line x1="140" y1="93" x2="155" y2="88"/>
          <line x1="140" y1="98" x2="157" y2="98"/>
          <line x1="140" y1="103" x2="155" y2="108"/>
        </g>

        <!-- Paws -->
        <g class="bunny-paws">
          <ellipse cx="75" cy="155" rx="12" ry="8" fill="#FFF5F7" stroke="#FFD1DC" stroke-width="1.5"/>
          <ellipse cx="125" cy="155" rx="12" ry="8" fill="#FFF5F7" stroke="#FFD1DC" stroke-width="1.5"/>
        </g>

        <!-- Waving arm (for wave mood) -->
        <g class="bunny-arm-wave" opacity="0">
          <ellipse cx="155" cy="110" rx="10" ry="15" fill="#FFF5F7" stroke="#FFD1DC" stroke-width="1.5" transform="rotate(-30 155 110)"/>
        </g>

        <!-- Sparkles for celebration -->
        <g class="bunny-sparkles" opacity="0">
          <path d="M45 60 L48 55 L51 60 L56 57 L51 60 L48 65 L45 60 L40 57 Z" fill="#FFD700"/>
          <path d="M150 55 L153 50 L156 55 L161 52 L156 55 L153 60 L150 55 L145 52 Z" fill="#FFD700"/>
          <path d="M165 90 L167 86 L169 90 L173 88 L169 90 L167 94 L165 90 L161 88 Z" fill="#FFD700"/>
          <path d="M35 85 L37 81 L39 85 L43 83 L39 85 L37 89 L35 85 L31 83 Z" fill="#FFD700"/>
        </g>

        <!-- Question mark for thinking -->
        <g class="bunny-thinking" opacity="0">
          <text x="145" y="55" font-size="28" fill="#FF6B8A">?</text>
        </g>

        <!-- Exclamation for excited -->
        <g class="bunny-excited" opacity="0">
          <text x="148" y="50" font-size="28" fill="#FF6B8A">!</text>
        </g>
      </svg>

      <!-- Speech bubble -->
      @if (message) {
        <div class="speech-bubble">
          <p>{{ message }}</p>
          <div class="speech-bubble-tail"></div>
        </div>
      }
    </div>
  `,
  styles: [`
    .bunny-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .bunny-svg {
      transition: transform 0.3s ease;
    }

    .bunny-glow {
      fill: rgba(255, 182, 193, 0.15);
      animation: glow-pulse 3s ease-in-out infinite;
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.3; r: 85; }
      50% { opacity: 0.5; r: 88; }
    }

    /* Ear animations */
    .bunny-ear {
      transform-origin: center bottom;
    }

    .bunny-ear-left {
      animation: ear-twitch-left 4s ease-in-out infinite;
    }

    .bunny-ear-right {
      animation: ear-twitch-right 4s ease-in-out infinite;
      animation-delay: 0.5s;
    }

    @keyframes ear-twitch-left {
      0%, 90%, 100% { transform: rotate(0deg); }
      93% { transform: rotate(-8deg); }
      96% { transform: rotate(3deg); }
    }

    @keyframes ear-twitch-right {
      0%, 85%, 100% { transform: rotate(0deg); }
      88% { transform: rotate(8deg); }
      91% { transform: rotate(-3deg); }
    }

    /* Body bounce */
    .bunny-body, .bunny-head {
      animation: body-bounce 2s ease-in-out infinite;
    }

    @keyframes body-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }

    /* Blink animation */
    .bunny-eyes {
      animation: blink 4s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 95%, 100% { opacity: 1; }
      97% { opacity: 0; }
    }

    /* Nose wiggle */
    .bunny-nose {
      transform-origin: center;
      animation: nose-wiggle 1.5s ease-in-out infinite;
    }

    @keyframes nose-wiggle {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    /* MOOD: Wave */
    .bunny-wave .bunny-arm-wave {
      opacity: 1;
      animation: wave-arm 0.8s ease-in-out infinite;
    }

    @keyframes wave-arm {
      0%, 100% { transform: rotate(-30deg) translateX(0); }
      50% { transform: rotate(-10deg) translateX(-5px); }
    }

    /* MOOD: Curious */
    .bunny-curious .bunny-head {
      animation: curious-tilt 2s ease-in-out infinite;
    }

    @keyframes curious-tilt {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      50% { transform: rotate(8deg) translateY(-2px); }
    }

    /* MOOD: Thinking */
    .bunny-thinking .bunny-thinking {
      opacity: 1;
      animation: thinking-bob 1.5s ease-in-out infinite;
    }

    .bunny-thinking .bunny-eyes {
      transform: translateY(-3px);
    }

    @keyframes thinking-bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    /* MOOD: Excited */
    .bunny-excited .bunny-excited {
      opacity: 1;
      animation: excited-bounce 0.5s ease-in-out infinite;
    }

    .bunny-excited .bunny-svg {
      animation: excited-jump 0.6s ease-in-out infinite;
    }

    @keyframes excited-bounce {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.1); }
    }

    @keyframes excited-jump {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-8px) scale(1.02); }
    }

    /* MOOD: Celebrate */
    .bunny-celebrate .bunny-sparkles {
      opacity: 1;
      animation: sparkle-dance 1s ease-in-out infinite;
    }

    .bunny-celebrate .bunny-eyes {
      opacity: 0;
    }

    .bunny-celebrate .bunny-eyes-closed {
      opacity: 1;
    }

    .bunny-celebrate .bunny-mouth-happy {
      opacity: 0;
    }

    .bunny-celebrate .bunny-mouth-open {
      opacity: 1;
    }

    .bunny-celebrate .bunny-svg {
      animation: celebrate-bounce 0.5s ease-in-out infinite;
    }

    @keyframes sparkle-dance {
      0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
      50% { transform: scale(1.2) rotate(15deg); opacity: 0.8; }
    }

    @keyframes celebrate-bounce {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-10px) rotate(2deg); }
    }

    /* Speech bubble */
    .speech-bubble {
      position: absolute;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 12px 20px;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 2px solid #FFE4E8;
      max-width: 220px;
      text-align: center;
      animation: bubble-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .speech-bubble p {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #4A3728;
      line-height: 1.4;
    }

    .speech-bubble-tail {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 10px solid transparent;
      border-right: 10px solid transparent;
      border-top: 12px solid white;
    }

    .speech-bubble-tail::before {
      content: '';
      position: absolute;
      bottom: 2px;
      left: -12px;
      width: 0;
      height: 0;
      border-left: 12px solid transparent;
      border-right: 12px solid transparent;
      border-top: 14px solid #FFE4E8;
      z-index: -1;
    }

    @keyframes bubble-pop {
      0% { transform: translateX(-50%) scale(0.8); opacity: 0; }
      100% { transform: translateX(-50%) scale(1); opacity: 1; }
    }
  `],
})
export class BunnyMascotComponent implements OnChanges {
  @Input() mood: BunnyMood = 'idle';
  @Input() message?: string;
  @Input() size = 160;

  currentMood = signal<BunnyMood>('idle');

  ngOnChanges() {
    this.currentMood.set(this.mood);
  }

}
