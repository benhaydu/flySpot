const FISH = {
  // ── Chinook / King Salmon ─────────────────────────────────────────────────
  CK: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#1a6b3a" />
      <polygon points="10,14 6,20 10,26" fill="#145c30" />
      <polygon points="10,26 6,32 10,38" fill="#145c30" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#6aaa88" />
      <ellipse cx="46" cy="22" rx="26" ry="8" fill="#1a6b3a" />
      <ellipse cx="46" cy="31" rx="24" ry="7" fill="#c8e8d4" />
      <polygon points="36,12 46,4 56,12" fill="#145c30" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#4a9a68" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#145c30" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <path d="M 74 23 Q 76 26 74 29" stroke="#1a6b3a" strokeWidth="2" fill="none" />
      <circle cx="42" cy="18" r="2" fill="#0a4a20" opacity="0.7" />
      <circle cx="52" cy="16" r="2" fill="#0a4a20" opacity="0.7" />
      <circle cx="58" cy="20" r="1.5" fill="#0a4a20" opacity="0.7" />
      <circle cx="36" cy="20" r="1.5" fill="#0a4a20" opacity="0.7" />
    </g>
  ),

  // ── Coho Salmon ───────────────────────────────────────────────────────────
  CO: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#1a4a7a" />
      <polygon points="10,14 6,20 10,26" fill="#143a6a" />
      <polygon points="10,26 6,32 10,38" fill="#143a6a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#7ab4d8" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#2a5a9a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#daf0ff" />
      <line x1="18" y1="26" x2="65" y2="26" stroke="#ff9999" strokeWidth="2.5" strokeDasharray="3,2" />
      <polygon points="36,12 46,3 56,12" fill="#1a4a7a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#5a94b8" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#1a4a7a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <path d="M 74 23 Q 76 26 74 29" stroke="#2a5a9a" strokeWidth="2" fill="none" />
    </g>
  ),

  // ── Cutthroat Trout ───────────────────────────────────────────────────────
  CT: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#7a5a10" />
      <polygon points="10,14 6,20 10,26" fill="#6a4a08" />
      <polygon points="10,26 6,32 10,38" fill="#6a4a08" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#c8a84a" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#7a6020" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#f0e0a0" />
      <polygon points="36,12 46,3 56,12" fill="#7a5a10" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#a88830" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#7a5a10" strokeWidth="2" fill="none" />
      <rect x="66" y="27" width="8" height="3" rx="1" fill="#cc2200" />
      <rect x="66" y="31" width="6" height="2" rx="1" fill="#cc2200" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="38" cy="22" r="2" fill="#4a3000" opacity="0.8" />
      <circle cx="48" cy="19" r="2" fill="#4a3000" opacity="0.8" />
      <circle cx="56" cy="22" r="1.5" fill="#4a3000" opacity="0.8" />
      <circle cx="44" cy="28" r="1.5" fill="#4a3000" opacity="0.8" />
      <circle cx="32" cy="24" r="1.5" fill="#4a3000" opacity="0.8" />
    </g>
  ),

  // ── Rainbow Trout ─────────────────────────────────────────────────────────
  RB: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#2a7a3a" />
      <polygon points="10,14 6,20 10,26" fill="#1a6a2a" />
      <polygon points="10,26 6,32 10,38" fill="#1a6a2a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#88cc99" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#2a7a3a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#e8f8ec" />
      <ellipse cx="44" cy="26" rx="22" ry="5" fill="#e060a0" opacity="0.7" />
      <polygon points="36,12 46,3 56,12" fill="#2a7a3a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#60aa70" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#2a7a3a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="40" cy="21" r="1.5" fill="#1a4a20" opacity="0.8" />
      <circle cx="50" cy="19" r="1.5" fill="#1a4a20" opacity="0.8" />
      <circle cx="57" cy="22" r="1.5" fill="#1a4a20" opacity="0.8" />
      <circle cx="34" cy="24" r="1.5" fill="#1a4a20" opacity="0.8" />
      <circle cx="46" cy="29" r="1.5" fill="#1a4a20" opacity="0.8" />
    </g>
  ),

  // ── Steelhead ─────────────────────────────────────────────────────────────
  ST: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#3a5a7a" />
      <polygon points="10,14 6,20 10,26" fill="#2a4a6a" />
      <polygon points="10,26 6,32 10,38" fill="#2a4a6a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#a8c8e0" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#3a5a7a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#eef6fc" />
      <ellipse cx="42" cy="26" rx="20" ry="4" fill="#cc7799" opacity="0.5" />
      <polygon points="36,12 46,3 56,12" fill="#3a5a7a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#7a9ab8" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#3a5a7a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="42" cy="21" r="1.5" fill="#2a3a5a" opacity="0.6" />
      <circle cx="52" cy="19" r="1.5" fill="#2a3a5a" opacity="0.6" />
      <circle cx="59" cy="23" r="1.5" fill="#2a3a5a" opacity="0.6" />
    </g>
  ),

  // ── Sockeye Salmon ────────────────────────────────────────────────────────
  SK: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#8a1a1a" />
      <polygon points="10,14 6,20 10,26" fill="#6a0808" />
      <polygon points="10,26 6,32 10,38" fill="#6a0808" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#cc3030" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#aa2020" />
      <ellipse cx="46" cy="33" rx="24" ry="6" fill="#dd6060" />
      <ellipse cx="58" cy="24" rx="14" ry="10" fill="#2a5a2a" />
      <polygon points="36,12 46,3 56,12" fill="#8a1a1a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#aa2020" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#4a8a4a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <path d="M 74 22 Q 77 26 74 30" stroke="#2a5a2a" strokeWidth="2" fill="none" />
    </g>
  ),

  // ── Pink Salmon ───────────────────────────────────────────────────────────
  PK: ({ s }) => (
    <g>
      <polygon points="10,16 20,26 10,36" fill="#5a7a9a" />
      <polygon points="10,16 6,21 10,26" fill="#4a6a8a" />
      <polygon points="10,26 6,31 10,36" fill="#4a6a8a" />
      <ellipse cx="44" cy="26" rx="25" ry="12" fill="#a8c4dc" />
      <ellipse cx="44" cy="20" rx="23" ry="7" fill="#5a7a9a" />
      <ellipse cx="44" cy="31" rx="21" ry="6" fill="#e8f4fc" />
      <ellipse cx="38" cy="18" rx="12" ry="5" fill="#4a6a8a" />
      <polygon points="34,12 42,5 50,12" fill="#5a7a9a" />
      <ellipse cx="52" cy="33" rx="6" ry="3" fill="#7a9ab8" transform="rotate(-20 52 33)" />
      <path d="M 57 18 Q 61 26 57 34" stroke="#5a7a9a" strokeWidth="2" fill="none" />
      <circle cx="63" cy="23" r="3.5" fill="#111" />
      <circle cx="64.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="40" cy="22" r="2.5" fill="#2a4a6a" opacity="0.8" />
      <circle cx="50" cy="20" r="2.5" fill="#2a4a6a" opacity="0.8" />
      <circle cx="56" cy="24" r="2" fill="#2a4a6a" opacity="0.8" />
      <circle cx="34" cy="24" r="2" fill="#2a4a6a" opacity="0.8" />
    </g>
  ),

  // ── Chum Salmon ───────────────────────────────────────────────────────────
  CM: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#5a6a2a" />
      <polygon points="10,14 6,20 10,26" fill="#4a5a1a" />
      <polygon points="10,26 6,32 10,38" fill="#4a5a1a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#9aaa50" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#5a6a2a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#d4dca0" />
      <rect x="20" y="16" width="5" height="20" rx="2" fill="#8a4a6a" opacity="0.6" />
      <rect x="30" y="15" width="5" height="22" rx="2" fill="#8a4a6a" opacity="0.6" />
      <rect x="40" y="15" width="5" height="22" rx="2" fill="#8a4a6a" opacity="0.6" />
      <rect x="50" y="16" width="5" height="20" rx="2" fill="#8a4a6a" opacity="0.6" />
      <polygon points="36,12 46,3 56,12" fill="#5a6a2a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#7a8a40" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#5a6a2a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
    </g>
  ),

  // ── Dolly Varden ──────────────────────────────────────────────────────────
  DV: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#1a3a5a" />
      <polygon points="10,14 6,20 10,26" fill="#0a2a4a" />
      <polygon points="10,26 6,32 10,38" fill="#0a2a4a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#2a5a7a" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#1a3a5a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#7aaac0" />
      <polygon points="36,12 46,3 56,12" fill="#1a3a5a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#2a4a6a" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#1a3a5a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="36" cy="22" r="3" fill="#ff7700" />
      <circle cx="46" cy="20" r="3" fill="#ff7700" />
      <circle cx="55" cy="22" r="2.5" fill="#ff7700" />
      <circle cx="30" cy="26" r="2.5" fill="#ff4444" />
      <circle cx="42" cy="28" r="2.5" fill="#ff4444" />
      <circle cx="52" cy="27" r="2" fill="#ff4444" />
      <circle cx="40" cy="23" r="2" fill="#ff7700" />
    </g>
  ),

  // ── Bull Trout ────────────────────────────────────────────────────────────
  BT: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#2a4a1a" />
      <polygon points="10,14 6,20 10,26" fill="#1a3a0a" />
      <polygon points="10,26 6,32 10,38" fill="#1a3a0a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#4a7a2a" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#2a4a1a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#aad080" />
      <polygon points="36,12 46,3 56,12" fill="#2a4a1a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#3a6a1a" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#2a4a1a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="36" cy="22" r="3" fill="#f0d060" />
      <circle cx="46" cy="20" r="3" fill="#f0d060" />
      <circle cx="55" cy="22" r="2.5" fill="#f0d060" />
      <circle cx="30" cy="27" r="2.5" fill="#f09030" />
      <circle cx="42" cy="28" r="2.5" fill="#f09030" />
      <circle cx="52" cy="27" r="2" fill="#f09030" />
    </g>
  ),

  // ── Brown Trout ───────────────────────────────────────────────────────────
  BN: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#6b3a1f" />
      <polygon points="10,14 6,20 10,26" fill="#5a2e14" />
      <polygon points="10,26 6,32 10,38" fill="#5a2e14" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#b5763a" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#6b3a1f" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#e8c98a" />
      <polygon points="36,12 46,3 56,12" fill="#6b3a1f" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#8a5228" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#6b3a1f" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
      <circle cx="38" cy="21" r="3" fill="#1a1a00" opacity="0.8" />
      <circle cx="48" cy="19" r="3" fill="#1a1a00" opacity="0.8" />
      <circle cx="56" cy="22" r="2.5" fill="#1a1a00" opacity="0.8" />
      <circle cx="33" cy="25" r="2.5" fill="#cc4400" opacity="0.8" />
      <circle cx="43" cy="28" r="2.5" fill="#cc4400" opacity="0.8" />
      <circle cx="53" cy="27" r="2" fill="#cc4400" opacity="0.8" />
    </g>
  ),

  // ── Default / Unknown ─────────────────────────────────────────────────────
  DEFAULT: ({ s }) => (
    <g>
      <polygon points="10,14 22,26 10,38" fill="#3a5a7a" />
      <polygon points="10,14 6,20 10,26" fill="#2a4a6a" />
      <polygon points="10,26 6,32 10,38" fill="#2a4a6a" />
      <ellipse cx="46" cy="26" rx="28" ry="14" fill="#5a8aaa" />
      <ellipse cx="46" cy="20" rx="26" ry="8" fill="#3a5a7a" />
      <ellipse cx="46" cy="32" rx="24" ry="7" fill="#c0daea" />
      <polygon points="36,12 46,3 56,12" fill="#3a5a7a" />
      <ellipse cx="54" cy="34" rx="7" ry="3" fill="#4a7a9a" transform="rotate(-20 54 34)" />
      <path d="M 60 18 Q 64 26 60 34" stroke="#3a5a7a" strokeWidth="2" fill="none" />
      <circle cx="67" cy="23" r="4" fill="#111" />
      <circle cx="68.5" cy="21.5" r="1.5" fill="#fff" />
    </g>
  ),
};

// Species code aliases — map variant codes to the right sprite
const ALIASES = {
  CH:  'CK',  // Chinook alias
  SS:  'SK',  // Sockeye alias
  PKS: 'PK',
  CHS: 'CM',
  SKS: 'SK',
  GB:  'BN',  // Brown Trout (BC code)
  AGB: 'BN',  // Anadromous Brown Trout → Brown Trout sprite
  ACT: 'CT',  // Anadromous Cutthroat → Cutthroat sprite
  CCT: 'CT',  // Coastal Cutthroat → Cutthroat sprite
  EB:  'RB',  // Brook Trout → closest sprite
  KO:  'SK',  // Kokanee → Sockeye sprite (both red)
  AS:  'CO',  // Atlantic Salmon → Coho sprite
};

export default function FishSprite({ code = 'DEFAULT', size = 80, locked = false }) {
  const resolvedCode = ALIASES[code] || code;
  const FishArt = FISH[resolvedCode] || FISH.DEFAULT;

  return (
    <svg
      viewBox="0 0 80 52"
      width={size}
      height={size * 0.65}
      style={{
        imageRendering: 'pixelated',
        filter: locked ? 'brightness(0) invert(0.15)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
        transition: 'filter 0.3s ease',
        overflow: 'visible',
      }}
    >
      <FishArt />
    </svg>
  );
}
