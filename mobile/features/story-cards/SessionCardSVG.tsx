import React from 'react';
import { Svg, Rect, Defs, LinearGradient, RadialGradient, Stop, Text as SvgText, G, Circle, Line, Path, Pattern } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  username?: string;
  category?: string;
  duration?: string;
  xp?: number;
  level?: number;
  streak?: number;
  date?: string;
  note?: string;
  templateId?: 'cyber_hud' | 'aurora' | 'synthwave' | 'stealth' | 'strava_sport' | 'transparent';
};

export default function SessionCardSVG({
  width = 1080,
  height = 1920,
  username = 'You',
  category = 'Coding',
  duration = '45m',
  xp = 33,
  level = 3,
  streak = 5,
  date = new Date().toLocaleDateString(),
  note = '',
  templateId = 'cyber_hud'
}: Props) {
  
  const canvasWidth = 1080;
  const canvasHeight = 1920;

  const formattedCategory = category.toUpperCase();
  const displayNote = note.length > 45 ? `${note.substring(0, 42)}...` : note;
  
  const themeColors = {
    blue: { primary: '#7BE7FF', secondary: '#051020', accent: '#37B3FF' },
    purple: { primary: '#B77BFF', secondary: '#120520', accent: '#8E37FF' },
    teal: { primary: '#0DF5C4', secondary: '#021511', accent: '#05C39B' },
  };

  // Determine category theme
  const theme = category.toLowerCase() === 'coding' ? themeColors.blue : 
                category.toLowerCase() === 'study' ? themeColors.purple : 
                themeColors.teal;

  // Render Template 1: Cyber HUD (Default)
  const renderCyberHud = () => {
    return (
      <G>
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#040408" />
            <Stop offset="0.5" stopColor="#0B0D19" />
            <Stop offset="1" stopColor="#020306" />
          </LinearGradient>
          <LinearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.primary} />
            <Stop offset="1" stopColor={theme.accent} />
          </LinearGradient>
          <LinearGradient id="cardBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#141724" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#0A0B12" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        {/* Main Cosmic Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#bg)" />

        {/* Futuristic Background grid lines */}
        <G opacity={0.08}>
          {Array.from({ length: 9 }).map((_, i) => {
            const x = 120 + i * 105;
            return <Line key={`v-${i}`} x1={x} y1={200} x2={x} y2={1720} stroke="#FFF" strokeWidth={1} />;
          })}
          {Array.from({ length: 13 }).map((_, i) => {
            const y = 250 + i * 115;
            return <Line key={`h-${i}`} x1={80} y1={y} x2={1000} y2={y} stroke="#FFF" strokeWidth={1} />;
          })}
        </G>

        {/* Glow Rings in Center (Celestial / Flow State) */}
        <G opacity={0.4} transform={`translate(${canvasWidth/2}, ${canvasHeight/2 - 60})`}>
          <Circle r={280} fill="none" stroke={theme.primary} strokeWidth={1} strokeDasharray="5,15" />
          <Circle r={220} fill="none" stroke={theme.primary} strokeWidth={2} opacity={0.6} />
          <Circle r={160} fill="none" stroke="url(#accentGrad)" strokeWidth={1} strokeDasharray="10,8" />
          <Circle r={100} fill="none" stroke={theme.primary} strokeWidth={3} opacity={0.8} />
          
          {/* Futuristic angled HUD crosshairs */}
          <Line x1={-320} y1={0} x2={-290} y2={0} stroke={theme.primary} strokeWidth={3} />
          <Line x1={290} y1={0} x2={320} y2={0} stroke={theme.primary} strokeWidth={3} />
          <Line x1={0} y1={-320} x2={0} y2={-290} stroke={theme.primary} strokeWidth={3} />
          <Line x1={0} y1={290} x2={0} y2={320} stroke={theme.primary} strokeWidth={3} />
        </G>

        {/* Top HUD / Branding - Adjusted below the 240px safe zone */}
        <G transform="translate(100, 270)">
          <SvgText fill={theme.primary} fontSize={22} fontWeight={800} letterSpacing={6}>LEVELYN // CORE</SvgText>
          <SvgText fill="#4E546A" fontSize={18} x={0} y={30} letterSpacing={2}>SECURE PERSISTENT LOG</SvgText>
          
          {/* Top-Right aligned stats in HUD */}
          <SvgText fill="#FFF" fontSize={24} fontWeight={700} x={720} y={5} textAnchor="end">{date}</SvgText>
          <SvgText fill="#4E546A" fontSize={16} x={720} y={30} textAnchor="end" letterSpacing={1}>RECORD_TIMESTAMP</SvgText>
        </G>

        {/* Main Focus Accomplishment Text */}
        <G transform={`translate(${canvasWidth/2}, ${canvasHeight/2 - 95})`} textAnchor="middle">
          <SvgText fill="#FFF" fontSize={32} fontWeight={500} letterSpacing={8} opacity={0.5}>FOCUS STATE ACTIVE</SvgText>
          <SvgText fill="url(#accentGrad)" fontSize={110} fontWeight={900} y={110} letterSpacing={4}>{formattedCategory}</SvgText>
          {displayNote ? (
            <SvgText fill="#A8B0C2" fontSize={24} fontWeight={700} y={185} letterSpacing={2} opacity={0.95}>
              “{displayNote.toUpperCase()}”
            </SvgText>
          ) : (
            <SvgText fill="#4E546A" fontSize={20} fontWeight={600} y={180} letterSpacing={3}>SYS_FLOW_STATUS_OPTIMAL</SvgText>
          )}
        </G>

        {/* Bottom Main Content Card - Sits safely above the bottom 240px zone */}
        <G transform="translate(80, 1150)">
          {/* Neon Border Glass Card */}
          <Rect x={0} y={0} width={920} height={420} rx={32} fill="url(#cardBg)" stroke="#1F2330" strokeWidth={2} />
          <Rect x={4} y={4} width={912} height={412} rx={28} fill="none" stroke={theme.primary} strokeWidth={1.5} opacity={0.15} />

          {/* User Badge Section */}
          <G transform="translate(48, 56)">
            <Rect x={0} y={0} width={76} height={76} rx={22} fill={theme.secondary} stroke={theme.primary} strokeWidth={1.5} />
            
            {/* Inner custom star/node graphic inside avatar placeholder */}
            <Circle cx={38} cy={38} r={12} fill={theme.primary} />
            <Circle cx={38} cy={38} r={22} fill="none" stroke={theme.primary} strokeWidth={1.5} opacity={0.5} />

            <SvgText fill="#FFF" fontSize={36} fontWeight={800} x={108} y={48}>{username}</SvgText>
            <SvgText fill="#6C758A" fontSize={20} x={108} y={78} letterSpacing={1.5}>LEVEL {level} ACCOMPLISHED</SvgText>
          </G>

          {/* Horizontal Divider Line */}
          <Line x1={48} y1={170} x2={872} y2={170} stroke="#1F2330" strokeWidth={1.5} />

          {/* 3-Column Stats Grid */}
          {/* Column 1: Duration */}
          <G transform="translate(48, 215)">
            <SvgText fill="#6C758A" fontSize={18} fontWeight={700} letterSpacing={2}>DURATION</SvgText>
            <SvgText fill="#FFF" fontSize={56} fontWeight={900} y={64}>{duration}</SvgText>
            <SvgText fill={theme.primary} fontSize={16} fontWeight={600} y={98} letterSpacing={1}>STEADY STATE</SvgText>
          </G>

          {/* Column 2: XP Gained */}
          <G transform="translate(360, 215)">
            <SvgText fill="#6C758A" fontSize={18} fontWeight={700} letterSpacing={2}>XP EARNED</SvgText>
            <SvgText fill={theme.primary} fontSize={56} fontWeight={900} y={64}>+{xp} XP</SvgText>
            <SvgText fill="#6C758A" fontSize={16} y={98} letterSpacing={1}>TOTAL ADDED</SvgText>
          </G>

          {/* Column 3: Streak */}
          <G transform="translate(660, 215)">
            <SvgText fill="#6C758A" fontSize={18} fontWeight={700} letterSpacing={2}>DAILY STREAK</SvgText>
            <SvgText fill="#FFF" fontSize={56} fontWeight={900} y={64}>{streak}d</SvgText>
            <SvgText fill={theme.primary} fontSize={16} fontWeight={600} y={98} letterSpacing={1}>STREAK MULTIPLIER</SvgText>
          </G>
        </G>

        {/* Aesthetic viral bottom CTA branding safely in safe zones */}
        <SvgText fill="#4E546A" fontSize={16} x={canvasWidth/2} y={1650} textAnchor="middle" letterSpacing={5}>
          LEVELYN PROCESS PROTOCOL V55.24 // ENGAGE FLOW STATE
        </SvgText>
        <SvgText fill={theme.primary} fontSize={18} x={canvasWidth/2} y={1690} textAnchor="middle" fontWeight={800} letterSpacing={6}>
          JOIN THE ORBIT AT LEVELYN.APP
        </SvgText>

        {/* Decorative Outer Frame Borders - Slightly shifted inwards for Safe Zones */}
        {/* Top-Left */}
        <Path d="M 60 210 L 60 150 L 120 150" fill="none" stroke={theme.primary} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={60} cy={150} r={4} fill={theme.primary} />
        {/* Top-Right */}
        <Path d="M 1020 210 L 1020 150 L 960 150" fill="none" stroke={theme.primary} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={1020} cy={150} r={4} fill={theme.primary} />
        {/* Bottom-Left */}
        <Path d="M 60 1710 L 60 1770 L 120 1770" fill="none" stroke={theme.primary} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={60} cy={1770} r={4} fill={theme.primary} />
        {/* Bottom-Right */}
        <Path d="M 1020 1710 L 1020 1770 L 960 1770" fill="none" stroke={theme.primary} strokeWidth={4} strokeLinecap="round" />
        <Circle cx={1020} cy={1770} r={4} fill={theme.primary} />
      </G>
    );
  };

  // Render Template 2: Aurora Flow
  const renderAurora = () => {
    return (
      <G>
        <Defs>
          <LinearGradient id="auroraBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B0914" />
            <Stop offset="0.5" stopColor="#141125" />
            <Stop offset="1" stopColor="#05040A" />
          </LinearGradient>
          <RadialGradient id="auroraPink" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#FF7BE7" stopOpacity="0.32" />
            <Stop offset="100%" stopColor="#FF7BE7" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="auroraBlue" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#7BE7FF" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#7BE7FF" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="auroraPurple" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor="#B77BFF" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#B77BFF" stopOpacity="0" />
          </RadialGradient>
          <LinearGradient id="auroraGlass" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.08" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0.02" />
          </LinearGradient>
          <LinearGradient id="auroraTextGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="0.5" stopColor={theme.primary} />
            <Stop offset="1" stopColor="#FFFFFF" />
          </LinearGradient>
        </Defs>

        {/* Ambient Dark Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#auroraBg)" />

        {/* Glowing Aurora Spheres */}
        <Circle cx={canvasWidth * 0.2} cy={canvasHeight * 0.35} r={canvasWidth * 0.5} fill="url(#auroraPink)" />
        <Circle cx={canvasWidth * 0.8} cy={canvasHeight * 0.55} r={canvasWidth * 0.55} fill="url(#auroraBlue)" />
        <Circle cx={canvasWidth * 0.45} cy={canvasHeight * 0.8} r={canvasWidth * 0.6} fill="url(#auroraPurple)" />

        {/* Flow Wave Paths */}
        <Path d="M -100 850 C 300 620, 700 1080, 1180 850" fill="none" stroke="#7BE7FF" strokeWidth={3} opacity={0.15} />
        <Path d="M -100 880 C 250 660, 800 1030, 1180 880" fill="none" stroke="#B77BFF" strokeWidth={2} opacity={0.12} />

        {/* Branding header */}
        <G transform="translate(100, 270)">
          <SvgText fill="#A8B0C2" fontSize={18} fontWeight={500} letterSpacing={8}>LEVELYN APPS</SvgText>
          <SvgText fill="#6C758A" fontSize={14} x={0} y={24} letterSpacing={3}>INNER SPACE PROTOCOL</SvgText>

          <SvgText fill="#6C758A" fontSize={14} x={880} y={0} textAnchor="end" letterSpacing={3}>SYSTEM STATUS: LIGHT</SvgText>
          <SvgText fill="#FFF" fontSize={18} fontWeight={600} x={880} y={24} textAnchor="end" opacity={0.8}>{date}</SvgText>
        </G>

        {/* Floating Category focus name */}
        <G transform={`translate(${canvasWidth/2}, ${canvasHeight/2 - 120})`} textAnchor="middle">
          <SvgText fill="#A8B0C2" fontSize={26} fontWeight={400} letterSpacing={16} opacity={0.7}>LOGGING ACTIVE SESSION</SvgText>
          <SvgText fill="url(#auroraTextGrad)" fontSize={125} fontWeight={900} y={130} letterSpacing={6}>{formattedCategory}</SvgText>
          
          {displayNote ? (
            <SvgText fill="#FFF" fontSize={26} fontWeight={400} y={210} letterSpacing={4} opacity={0.85}>
              “{displayNote}”
            </SvgText>
          ) : (
            <SvgText fill="#6C758A" fontSize={18} fontWeight={400} y={200} letterSpacing={6}>IN HARMONIOUS ALIGNMENT</SvgText>
          )}
        </G>

        {/* Glassmorphic Rounded Stats Card */}
        <G transform="translate(80, 1140)">
          <Rect x={0} y={0} width={920} height={440} rx={48} fill="url(#auroraGlass)" stroke="#FFFFFF" strokeWidth={1.5} opacity={0.16} />
          
          {/* User profile identifier header */}
          <G transform="translate(60, 60)">
            {/* Elegant tiny ambient circle */}
            <Circle cx={40} cy={40} r={28} fill={theme.primary} opacity={0.2} />
            <Circle cx={40} cy={40} r={14} fill={theme.primary} />
            
            <SvgText fill="#FFF" fontSize={38} fontWeight={800} x={96} y={40}>{username}</SvgText>
            <SvgText fill="#A8B0C2" fontSize={18} fontWeight={500} x={96} y={68} letterSpacing={1}>LEVEL {level} CHAMBER EXPLORER</SvgText>
          </G>

          {/* Vertical dividers inside the stats card */}
          <Line x1={320} y1={200} x2={320} y2={370} stroke="#FFFFFF" strokeWidth={1} opacity={0.1} />
          <Line x1={610} y1={200} x2={610} y2={370} stroke="#FFFFFF" strokeWidth={1} opacity={0.1} />

          {/* Stats Grid */}
          {/* Col 1: Duration */}
          <G transform="translate(60, 210)">
            <SvgText fill="#A8B0C2" fontSize={16} fontWeight={700} letterSpacing={3}>FOCUS TIME</SvgText>
            <SvgText fill="#FFF" fontSize={60} fontWeight={900} y={70}>{duration}</SvgText>
            <SvgText fill={theme.primary} fontSize={14} fontWeight={500} y={105} letterSpacing={1.5}>PEAK ENERGY</SvgText>
          </G>

          {/* Col 2: XP Gained */}
          <G transform="translate(350, 210)">
            <SvgText fill="#A8B0C2" fontSize={16} fontWeight={700} letterSpacing={3}>XP YIELD</SvgText>
            <SvgText fill={theme.primary} fontSize={60} fontWeight={900} y={70}>+{xp}</SvgText>
            <SvgText fill="#A8B0C2" fontSize={14} y={105} letterSpacing={1.5}>REVENUE</SvgText>
          </G>

          {/* Col 3: Streak */}
          <G transform="translate(640, 210)">
            <SvgText fill="#A8B0C2" fontSize={16} fontWeight={700} letterSpacing={3}>STREAK</SvgText>
            <SvgText fill="#FFF" fontSize={60} fontWeight={900} y={70}>{streak} DAYS</SvgText>
            <SvgText fill={theme.primary} fontSize={14} fontWeight={500} y={105} letterSpacing={1.5}>CONSISTENCY</SvgText>
          </G>
        </G>

        {/* Minimal Bottom Footer */}
        <SvgText fill="#6C758A" fontSize={14} x={canvasWidth/2} y={1660} textAnchor="middle" letterSpacing={6}>
          CONCENTRATION HARBINGER // DESIGNED IN LEVELYN
        </SvgText>
        <SvgText fill="#A8B0C2" fontSize={16} x={canvasWidth/2} y={1700} textAnchor="middle" fontWeight={700} letterSpacing={4}>
          WWW.LEVELYN.APP
        </SvgText>
      </G>
    );
  };

  // Render Template 3: Retro Grid (Synthwave)
  const renderSynthwave = () => {
    const horizonY = 1000;
    return (
      <G>
        <Defs>
          {/* Neon Sunset Background Gradient */}
          <LinearGradient id="synthwaveBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0B0315" />
            <Stop offset="0.4" stopColor="#1C053A" />
            <Stop offset="0.65" stopColor="#4A0553" />
            <Stop offset="1" stopColor="#960A64" />
          </LinearGradient>

          {/* Striped Sunset Gradient */}
          <LinearGradient id="retroSun" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFEE32" />
            <Stop offset="0.5" stopColor="#FF007F" />
            <Stop offset="1" stopColor="#6C0573" />
          </LinearGradient>
          
          {/* Card Fill */}
          <LinearGradient id="synthCard" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F031E" stopOpacity="0.9" />
            <Stop offset="1" stopColor="#2D064A" stopOpacity="0.95" />
          </LinearGradient>
        </Defs>

        {/* Background Retro Sky */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#synthwaveBg)" />

        {/* Classic 80s Sun */}
        <G transform={`translate(${canvasWidth/2}, 600)`}>
          <Circle cx={0} cy={0} r={280} fill="url(#retroSun)" />
          {/* Sunset Horizon Stripes (layered on top) */}
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 30 + i * 26;
            const h = 5 + i * 3.5;
            return <Rect key={`sun-stripe-${i}`} x={-320} y={y} width={640} height={h} fill="#4A0553" />;
          })}
        </G>

        {/* 3D Perspective Grid */}
        <G>
          {/* Grid Horizon Glowing Flare */}
          <Line x1={0} y1={horizonY} x2={canvasWidth} y2={horizonY} stroke="#FF007F" strokeWidth={5} opacity={0.6} />
          
          {/* Vertical Converging Lines */}
          {Array.from({ length: 15 }).map((_, i) => {
            const xBottom = -300 + i * 120;
            return (
              <Line 
                key={`synth-v-${i}`} 
                x1={canvasWidth/2} 
                y1={horizonY} 
                x2={xBottom} 
                y2={canvasHeight} 
                stroke="#00F0FF" 
                strokeWidth={2} 
                opacity={0.35} 
              />
            );
          })}

          {/* Horizontal Accelerating Spacers */}
          {Array.from({ length: 14 }).map((_, i) => {
            const ratio = Math.pow(i / 13, 3); // exponential spacing towards horizon
            const y = horizonY + ratio * (canvasHeight - horizonY);
            return (
              <Line 
                key={`synth-h-${i}`} 
                x1={0} 
                y1={y} 
                x2={canvasWidth} 
                y2={y} 
                stroke="#FF007F" 
                strokeWidth={2.5} 
                opacity={0.15 + ratio * 0.4} 
              />
            );
          })}
        </G>

        {/* Header HUD */}
        <G transform="translate(100, 260)">
          <SvgText fill="#00F0FF" fontSize={26} fontWeight={900} fontStyle="italic" letterSpacing={4}>// RADICAL FLOW</SvgText>
          <SvgText fill="#FF007F" fontSize={16} x={0} y={28} fontWeight={700} letterSpacing={2}>ORBIT DECK COMPILATION</SvgText>
          
          {/* Timestamp */}
          <SvgText fill="#FFEE32" fontSize={18} fontWeight={800} x={880} y={15} textAnchor="end">{date}</SvgText>
        </G>

        {/* Massive Centered Synthwave Typography */}
        <G transform={`translate(${canvasWidth/2}, 580)`} textAnchor="middle">
          {/* Text Shadow Layer for glowing retro effect */}
          <SvgText fill="#FF007F" fontSize={130} fontWeight={900} fontStyle="italic" letterSpacing={8} opacity={0.6} dx={4} dy={4}>
            {formattedCategory}
          </SvgText>
          <SvgText fill="#00F0FF" fontSize={130} fontWeight={900} fontStyle="italic" letterSpacing={8}>
            {formattedCategory}
          </SvgText>

          {displayNote ? (
            <SvgText fill="#FFEE32" fontSize={26} fontWeight={800} fontStyle="italic" y={100} letterSpacing={2}>
              “{displayNote.toUpperCase()}”
            </SvgText>
          ) : (
            <SvgText fill="#FFF" fontSize={20} fontWeight={700} y={90} letterSpacing={6} opacity={0.8}>NEON CHAMBER OVERDRIVE</SvgText>
          )}
        </G>

        {/* Neon Stat Grid Card */}
        <G transform="translate(80, 1150)">
          <Rect x={0} y={0} width={920} height={420} rx={16} fill="url(#synthCard)" stroke="#FF007F" strokeWidth={3.5} />
          
          {/* Inner Cyan Glowing Border Accent */}
          <Rect x={8} y={8} width={904} height={404} rx={10} fill="none" stroke="#00F0FF" strokeWidth={1} opacity={0.5} />

          {/* User Details */}
          <G transform="translate(48, 48)">
            <Rect x={0} y={0} width={64} height={64} rx={8} fill="#120520" stroke="#FFEE32" strokeWidth={2} />
            <SvgText fill="#FFEE32" fontSize={26} fontWeight={900} x={18} y={42}>★</SvgText>

            <SvgText fill="#FFF" fontSize={34} fontWeight={900} fontStyle="italic" x={96} y={32}>{username.toUpperCase()}</SvgText>
            <SvgText fill="#00F0FF" fontSize={16} fontWeight={700} x={96} y={56} letterSpacing={2}>CHAMBER RIDER // LEVEL {level}</SvgText>
          </G>

          <Line x1={48} y1={140} x2={872} y2={140} stroke="#FF007F" strokeWidth={2} opacity={0.5} />

          {/* Stats Row */}
          {/* Duration */}
          <G transform="translate(48, 180)">
            <SvgText fill="#00F0FF" fontSize={16} fontWeight={900} letterSpacing={2}>SYSTEM LOCK</SvgText>
            <SvgText fill="#FFF" fontSize={64} fontWeight={900} fontStyle="italic" y={75}>{duration}</SvgText>
            <SvgText fill="#FF007F" fontSize={14} fontWeight={700} y={110} letterSpacing={1}>TIME DURATION</SvgText>
          </G>

          {/* XP */}
          <G transform="translate(360, 180)">
            <SvgText fill="#FF007F" fontSize={16} fontWeight={900} letterSpacing={2}>TOTAL XP</SvgText>
            <SvgText fill="#FFEE32" fontSize={64} fontWeight={900} fontStyle="italic" y={75}>+{xp}</SvgText>
            <SvgText fill="#00F0FF" fontSize={14} fontWeight={700} y={110} letterSpacing={1}>ENERGY EARNED</SvgText>
          </G>

          {/* Streak */}
          <G transform="translate(660, 180)">
            <SvgText fill="#FFEE32" fontSize={16} fontWeight={900} letterSpacing={2}>STREAK</SvgText>
            <SvgText fill="#FFF" fontSize={64} fontWeight={900} fontStyle="italic" y={75}>{streak} DAYS</SvgText>
            <SvgText fill="#FF007F" fontSize={14} fontWeight={700} y={110} letterSpacing={1}>STAY IN ORBIT</SvgText>
          </G>
        </G>

        {/* Vintage Bottom Brand */}
        <SvgText fill="#FF007F" fontSize={16} x={canvasWidth/2} y={1660} textAnchor="middle" fontWeight={800} fontStyle="italic" letterSpacing={5}>
          RETRO GRADE // LEVELYN PROTOCOL DETECTED
        </SvgText>
        <SvgText fill="#00F0FF" fontSize={18} x={canvasWidth/2} y={1700} textAnchor="middle" fontWeight={900} fontStyle="italic" letterSpacing={6}>
          GET BACK IN THE GAME AT LEVELYN.APP
        </SvgText>
      </G>
    );
  };

  // Render Template 4: Stealth Carbon (Minimalist Midnight Matte)
  const renderStealth = () => {
    return (
      <G>
        <Defs>
          <LinearGradient id="stealthBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#050506" />
            <Stop offset="0.5" stopColor="#0B0B0D" />
            <Stop offset="1" stopColor="#030304" />
          </LinearGradient>
          
          <LinearGradient id="goldAcc" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F3E5AB" />
            <Stop offset="0.5" stopColor="#D4AF37" />
            <Stop offset="1" stopColor="#AA7C11" />
          </LinearGradient>
          
          <LinearGradient id="stealthCard" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F0F12" />
            <Stop offset="1" stopColor="#08080A" />
          </LinearGradient>
        </Defs>

        {/* Matte Black Base Screen */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#stealthBg)" />

        {/* Carbon Fiber Diagonal Layout Accent Lines */}
        <G opacity={0.03}>
          {Array.from({ length: 42 }).map((_, i) => {
            const offset = i * 65;
            return (
              <Line 
                key={`stealth-carbon-${i}`} 
                x1={-200} 
                y1={offset} 
                x2={canvasWidth + 200} 
                y2={offset + canvasWidth} 
                stroke="#FFF" 
                strokeWidth={2} 
              />
            );
          })}
        </G>

        {/* Circular Chrono Dial Behind Header (Luxury look) */}
        <G opacity={0.12} transform={`translate(${canvasWidth/2}, 560)`}>
          <Circle r={340} fill="none" stroke="#D4AF37" strokeWidth={1} strokeDasharray="3,12" />
          <Circle r={280} fill="none" stroke="#D4AF37" strokeWidth={2} />
          <Circle r={240} fill="none" stroke="#D4AF37" strokeWidth={1} strokeDasharray="20,10" />
        </G>

        {/* Sleek Top Branding */}
        <G transform="translate(100, 260)">
          <SvgText fill="#D4AF37" fontSize={20} fontWeight={900} letterSpacing={10}>STEALTH ENGINE</SvgText>
          <SvgText fill="#4E546A" fontSize={14} x={0} y={24} letterSpacing={4}>LOG_SESSION_CLASSIFIED</SvgText>

          <SvgText fill="#4E546A" fontSize={14} x={880} y={0} textAnchor="end" letterSpacing={2}>SECURE KEY // SHIELD</SvgText>
          <SvgText fill="#FFF" fontSize={16} fontWeight={700} x={880} y={24} textAnchor="end" opacity={0.7}>{date}</SvgText>
        </G>

        {/* Elegant Centered Minimalist Typography */}
        <G transform={`translate(${canvasWidth/2}, 520)`} textAnchor="middle">
          <SvgText fill="#4E546A" fontSize={24} fontWeight={800} letterSpacing={12}>CURRENT DUST MODE</SvgText>
          <SvgText fill="url(#goldAcc)" fontSize={115} fontWeight={900} y={120} letterSpacing={6}>
            {formattedCategory}
          </SvgText>
          
          {displayNote ? (
            <SvgText fill="#FFF" fontSize={22} fontWeight={400} y={195} letterSpacing={3} opacity={0.8}>
              “{displayNote.toLowerCase()}”
            </SvgText>
          ) : (
            <SvgText fill="#4E546A" fontSize={16} fontWeight={600} y={185} letterSpacing={6}>SHADOW OPERATION COMPLETE</SvgText>
          )}
        </G>

        {/* Stealth Card Layout */}
        <G transform="translate(80, 1140)">
          {/* Card Border with fine luxury outline */}
          <Rect x={0} y={0} width={920} height={440} rx={8} fill="url(#stealthCard)" stroke="#1F2330" strokeWidth={2} />
          
          {/* Subtle gold tick marks at the corners */}
          <Path d="M 0 30 L 0 0 L 30 0" fill="none" stroke="#D4AF37" strokeWidth={3} />
          <Path d="M 920 30 L 920 0 L 890 0" fill="none" stroke="#D4AF37" strokeWidth={3} />
          <Path d="M 0 410 L 0 440 L 30 440" fill="none" stroke="#D4AF37" strokeWidth={3} />
          <Path d="M 920 410 L 920 440 L 890 440" fill="none" stroke="#D4AF37" strokeWidth={3} />

          {/* User Details */}
          <G transform="translate(56, 56)">
            {/* Hexagonal avatar border */}
            <Path d="M 28 0 L 56 16 L 56 48 L 28 64 L 0 48 L 0 16 Z" fill="#050506" stroke="#D4AF37" strokeWidth={1.5} />
            <Circle cx={28} cy={32} r={8} fill="#D4AF37" />

            <SvgText fill="#FFF" fontSize={34} fontWeight={800} x={90} y={32} letterSpacing={1}>{username.toUpperCase()}</SvgText>
            <SvgText fill="#6C758A" fontSize={16} fontWeight={700} x={90} y={56} letterSpacing={3}>STEALTH OPERATOR // LEVEL {level}</SvgText>
          </G>

          <Line x1={56} y1={155} x2={864} y2={155} stroke="#1F2330" strokeWidth={1.5} />

          {/* Circular gauges for stats */}
          {/* Stat 1: Duration */}
          <G transform="translate(130, 275)">
            <Circle cx={0} cy={0} r={65} fill="none" stroke="#1F2330" strokeWidth={2} />
            <Circle cx={0} cy={0} r={65} fill="none" stroke="#D4AF37" strokeWidth={3.5} strokeDasharray="300, 100" strokeDashoffset={75} />
            <SvgText fill="#FFF" fontSize={26} fontWeight={900} textAnchor="middle" y={8}>{duration}</SvgText>
            <SvgText fill="#6C758A" fontSize={12} fontWeight={800} textAnchor="middle" y={100} letterSpacing={2}>DURATION</SvgText>
          </G>

          {/* Stat 2: XP */}
          <G transform="translate(460, 275)">
            <Circle cx={0} cy={0} r={65} fill="none" stroke="#1F2330" strokeWidth={2} />
            <Circle cx={0} cy={0} r={65} fill="none" stroke="#D4AF37" strokeWidth={3.5} strokeDasharray="220, 200" strokeDashoffset={20} />
            <SvgText fill="url(#goldAcc)" fontSize={26} fontWeight={900} textAnchor="middle" y={8}>+{xp} XP</SvgText>
            <SvgText fill="#6C758A" fontSize={12} fontWeight={800} textAnchor="middle" y={100} letterSpacing={2}>XP YIELD</SvgText>
          </G>

          {/* Stat 3: Streak */}
          <G transform="translate(790, 275)">
            <Circle cx={0} cy={0} r={65} fill="none" stroke="#1F2330" strokeWidth={2} />
            <Circle cx={0} cy={0} r={65} fill="none" stroke="#D4AF37" strokeWidth={3.5} strokeDasharray="360, 40" strokeDashoffset={15} />
            <SvgText fill="#FFF" fontSize={26} fontWeight={900} textAnchor="middle" y={8}>{streak}D</SvgText>
            <SvgText fill="#6C758A" fontSize={12} fontWeight={800} textAnchor="middle" y={100} letterSpacing={2}>STREAK</SvgText>
          </G>
        </G>

        {/* Minimal Stealth Bottom Branding */}
        <SvgText fill="#4E546A" fontSize={14} x={canvasWidth/2} y={1660} textAnchor="middle" letterSpacing={8}>
          CLASSIFIED PROT. LOG // LEVEL {level} ENCRYPTION ACTIVE
        </SvgText>
        <SvgText fill="#D4AF37" fontSize={16} x={canvasWidth/2} y={1700} textAnchor="middle" fontWeight={800} letterSpacing={6}>
          LEVELYN SECURITY DECK // LEVELYN.APP
        </SvgText>
      </G>
    );
  };

  // Render Template 5: Strava Sport (High-Impact Athletic Orange)
  const renderStravaSport = () => {
    // Generate a beautiful, dynamic activity name if note is empty
    const timeOfDay = () => {
      const hours = new Date().getHours();
      if (hours < 12) return 'MORNING';
      if (hours < 17) return 'AFTERNOON';
      if (hours < 21) return 'EVENING';
      return 'NIGHT';
    };
    
    const activityName = note ? note.toUpperCase() : `${timeOfDay()} ${formattedCategory} SESSION`;
    const displayActivityName = activityName.length > 38 ? `${activityName.substring(0, 35)}...` : activityName;

    return (
      <G>
        <Defs>
          {/* Main Dark Slate Background */}
          <LinearGradient id="stravaBg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#08080A" />
            <Stop offset="0.5" stopColor="#111216" />
            <Stop offset="1" stopColor="#060608" />
          </LinearGradient>
          
          {/* Subtle Orange Glow for Chart Area */}
          <LinearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FC4C02" stopOpacity="0.22" />
            <Stop offset="1" stopColor="#FC4C02" stopOpacity="0.00" />
          </LinearGradient>
        </Defs>

        {/* Background Base */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#stravaBg)" />

        {/* 1. Topological Map / Elevation Style Lines (Sleek Orange Contours) */}
        <G opacity={0.04}>
          <Path d="M -50 400 C 200 450, 300 350, 500 500 C 700 650, 800 550, 1150 700" fill="none" stroke="#FC4C02" strokeWidth={3} />
          <Path d="M -50 430 C 200 480, 300 380, 500 530 C 700 680, 800 580, 1150 730" fill="none" stroke="#FC4C02" strokeWidth={1.5} />
          <Path d="M -50 370 C 200 420, 300 320, 500 470 C 700 620, 800 520, 1150 670" fill="none" stroke="#FC4C02" strokeWidth={1.5} />
          
          <Path d="M -50 1400 C 250 1350, 400 1500, 700 1420 C 900 1350, 1000 1480, 1150 1400" fill="none" stroke="#FC4C02" strokeWidth={3} />
          <Path d="M -50 1430 C 250 1380, 400 1530, 700 1450 C 900 1380, 1000 1510, 1150 1430" fill="none" stroke="#FC4C02" strokeWidth={1.5} />
        </G>

        {/* 2. Athletic GPS Route Overlay (Winding Focus Path) */}
        <G>
          {/* Outer glowing path */}
          <Path 
            d="M 850 420 C 650 500, 950 800, 550 1000 C 250 1150, 450 1500, 180 1620" 
            fill="none" 
            stroke="#FC4C02" 
            strokeWidth={14} 
            strokeLinecap="round" 
            opacity={0.05} 
          />
          {/* Core high-contrast path */}
          <Path 
            d="M 850 420 C 650 500, 950 800, 550 1000 C 250 1150, 450 1500, 180 1620" 
            fill="none" 
            stroke="#FC4C02" 
            strokeWidth={6} 
            strokeLinecap="round" 
            opacity={0.25} 
          />
          
          {/* Start Marker */}
          <Circle cx={850} cy={420} r={14} fill="#FC4C02" opacity={0.4} />
          <Circle cx={850} cy={420} r={8} fill="#FC4C02" />
          <Circle cx={850} cy={420} r={4} fill="#FFFFFF" />

          {/* End Marker */}
          <Circle cx={180} cy={1620} r={16} fill="#FC4C02" opacity={0.4} />
          <Circle cx={180} cy={1620} r={10} fill="#FC4C02" />
          <Circle cx={180} cy={1620} r={5} fill="#08080A" />
        </G>

        {/* 3. Top Branding Header */}
        <G transform="translate(100, 270)">
          {/* Sleek Levelyn Sport Brand Badge */}
          <Rect x={0} y={0} width={64} height={64} rx={16} fill="#FC4C02" />
          {/* Dynamic Mountain Peak Logo */}
          <Path d="M 18 46 L 32 20 L 46 46 Z" fill="#FFFFFF" />
          <Path d="M 28 46 L 38 29 L 48 46 Z" fill="#FFFFFF" opacity={0.6} />

          {/* Brand Name & Protocol Text */}
          <SvgText fill="#FFFFFF" fontSize={42} fontWeight={900} x={84} y={35} letterSpacing={2}>LEVELYN</SvgText>
          <SvgText fill="#FC4C02" fontSize={16} fontWeight={800} x={84} y={58} letterSpacing={5}>ATHLETIC ENGINE</SvgText>

          {/* Right Column Athlete Info */}
          <SvgText fill="#8E8E93" fontSize={16} fontWeight={800} x={880} y={22} textAnchor="end" letterSpacing={3}>FOCUS ATHLETE</SvgText>
          <SvgText fill="#FFFFFF" fontSize={26} fontWeight={900} x={880} y={54} textAnchor="end">{username.toUpperCase()}</SvgText>
        </G>

        {/* 4. Activity Title and Date Header */}
        <G transform="translate(100, 480)">
          {/* Date Stamp */}
          <SvgText fill="#FC4C02" fontSize={18} fontWeight={800} letterSpacing={4}>{date.toUpperCase()} // SESSION COMPLETE</SvgText>
          
          {/* Big Bold Activity Headline */}
          <SvgText fill="#FFFFFF" fontSize={48} fontWeight={900} y={55} letterSpacing={1}>{displayActivityName}</SvgText>
          
          {/* Category Tag & Status Pill */}
          <G transform="translate(0, 85)">
            <Rect x={0} y={0} width={160} height={36} rx={18} fill="#FC4C02" />
            <SvgText fill="#FFFFFF" fontSize={14} fontWeight={900} x={80} y={23} textAnchor="middle" letterSpacing={1}>{formattedCategory}</SvgText>
            
            <SvgText fill="#8E8E93" fontSize={16} fontWeight={700} x={180} y={24} letterSpacing={2}>STATUS: FLOW STATE LOCKED</SvgText>
          </G>
        </G>

        {/* 5. Hero Elapsed Time Stat */}
        <G transform="translate(100, 750)">
          {/* Subtitle Label */}
          <SvgText fill="#FC4C02" fontSize={22} fontWeight={800} letterSpacing={5}>ELAPSED FOCUS TIME</SvgText>
          {/* Massive high-impact digital numeric time */}
          <SvgText fill="#FFFFFF" fontSize={150} fontWeight={900} y={135} letterSpacing={-2}>{duration}</SvgText>
        </G>

        {/* Thick Horizontal Athlete Divider */}
        <Line x1={100} y1={950} x2={980} y2={950} stroke="#20222A" strokeWidth={3} />

        {/* 6. Telemetry Grid */}
        <G transform="translate(100, 1000)">
          {/* Column 1: XP GAINED */}
          <G>
            <SvgText fill="#8E8E93" fontSize={18} fontWeight={800} letterSpacing={2}>EST. ENERGY YIELD</SvgText>
            <SvgText fill="#FFFFFF" fontSize={56} fontWeight={900} y={60}>+{xp} XP</SvgText>
            <SvgText fill="#FC4C02" fontSize={14} fontWeight={800} y={92} letterSpacing={1.5}>CALORIC LEVEL REVENUE</SvgText>
          </G>

          {/* Vertical Divider 1 */}
          <Line x1={310} y1={5} x2={310} y2={100} stroke="#20222A" strokeWidth={1.5} />

          {/* Column 2: CURRENT LEVEL */}
          <G transform="translate(340, 0)">
            <SvgText fill="#8E8E93" fontSize={18} fontWeight={800} letterSpacing={2}>ATHLETIC CLASS</SvgText>
            <SvgText fill="#FFFFFF" fontSize={56} fontWeight={900} y={60}>LVL {level}</SvgText>
            <SvgText fill="#FC4C02" fontSize={14} fontWeight={800} y={92} letterSpacing={1.5}>CHAMBER RATING</SvgText>
          </G>

          {/* Vertical Divider 2 */}
          <Line x1={610} y1={5} x2={610} y2={100} stroke="#20222A" strokeWidth={1.5} />

          {/* Column 3: STREAK */}
          <G transform="translate(640, 0)">
            <SvgText fill="#8E8E93" fontSize={18} fontWeight={800} letterSpacing={2}>CONSISTENCY</SvgText>
            <SvgText fill="#FFFFFF" fontSize={56} fontWeight={900} y={60}>{streak} DAYS</SvgText>
            <SvgText fill="#FC4C02" fontSize={14} fontWeight={800} y={92} letterSpacing={1.5}>ACTIVE STREAK MULTIPLIER</SvgText>
          </G>
        </G>

        {/* 7. Focus Splits Analysis Graph */}
        <G transform="translate(100, 1190)">
          {/* Graph Grid Lines */}
          <Line x1={0} y1={0} x2={880} y2={0} stroke="#20222A" strokeWidth={1.5} opacity={0.6} />
          <Line x1={0} y1={80} x2={880} y2={80} stroke="#20222A" strokeWidth={1.5} strokeDasharray="6,6" opacity={0.5} />
          <Line x1={0} y1={160} x2={880} y2={160} stroke="#20222A" strokeWidth={2} />
          
          {/* Area Chart Path */}
          <Path 
            d="M 0 160 Q 110 90, 220 120 T 440 70 T 660 110 T 820 40 L 880 30 L 880 160 Z" 
            fill="url(#chartGrad)" 
          />
          {/* Glowing Stroke */}
          <Path 
            d="M 0 160 Q 110 90, 220 120 T 440 70 T 660 110 T 820 40 L 880 30" 
            fill="none" 
            stroke="#FC4C02" 
            strokeWidth={4.5} 
            strokeLinecap="round" 
          />
          
          {/* Split Node Coordinate dots */}
          <Circle cx={440} cy={70} r={6} fill="#FC4C02" />
          <Circle cx={880} cy={30} r={10} fill="#FC4C02" opacity={0.3} />
          <Circle cx={880} cy={30} r={6} fill="#FC4C02" />
          <Circle cx={880} cy={30} r={3} fill="#FFFFFF" />

          {/* Graph Labels */}
          <SvgText fill="#8E8E93" fontSize={16} fontWeight={800} x={0} y={195} letterSpacing={2}>FOCUS VELOCITY SPLITS</SvgText>
          <SvgText fill="#FC4C02" fontSize={16} fontWeight={800} x={880} y={195} textAnchor="end" letterSpacing={2}>PEAK INTENSITY: 196 FPM</SvgText>
        </G>

        {/* 8. Minimalist High-Contrast Brand Footer */}
        <G transform={`translate(${canvasWidth/2}, 1650)`} textAnchor="middle">
          <SvgText fill="#8E8E93" fontSize={16} fontWeight={800} letterSpacing={5}>ALL FOCUS EFFORT COUNTED // SECURED PORTAL</SvgText>
          
          {/* Centered Sport Icon Arrow */}
          <Path d="M -15 25 L 0 10 L 15 25" fill="none" stroke="#FC4C02" strokeWidth={3} strokeLinecap="round" />
          
          <SvgText fill="#FFFFFF" fontSize={24} fontWeight={900} y={65} letterSpacing={8}>LEVELYN.APP // SHARE THE DRIVE</SvgText>
        </G>
      </G>
    );
  };

  // Render Template 6: Transparent (Checkerboard preview, transparent export)
  const renderTransparent = () => {
    const isExport = width > 500;

    return (
      <G>
        <Defs>
          {/* Checkered pattern definitions */}
          <Pattern id="checkeredGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <Rect width="30" height="30" fill="#16171D" />
            <Rect x="30" width="30" height="30" fill="#0F1014" />
            <Rect y="30" width="30" height="30" fill="#0F1014" />
            <Rect x="30" y="30" width="30" height="30" fill="#16171D" />
          </Pattern>
          <LinearGradient id="transAccentGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={theme.primary} />
            <Stop offset="1" stopColor={theme.accent} />
          </LinearGradient>
        </Defs>

        {/* 1. Preview Checkerboard (only rendered if not exporting) */}
        {!isExport && (
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill="url(#checkeredGrid)" />
        )}

        {/* 2. Sleek Transparent crop indicators/crosshairs */}
        <G opacity={0.35}>
          {/* Top-Left Corner HUD */}
          <Path d="M 60 130 L 60 60 L 130 60" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          {/* Top-Right Corner HUD */}
          <Path d="M 1020 130 L 1020 60 L 950 60" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          {/* Bottom-Left Corner HUD */}
          <Path d="M 60 1790 L 60 1860 L 130 1860" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
          {/* Bottom-Right Corner HUD */}
          <Path d="M 1020 1790 L 1020 1860 L 950 1860" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
        </G>

        {/* 3. Transparent Mode badge (Only show in preview to guide user) */}
        {!isExport && (
          <G transform="translate(100, 160)">
            <Rect x={0} y={0} width={180} height={38} rx={6} fill="none" stroke={theme.primary} strokeWidth={1.5} opacity={0.6} />
            <SvgText fill={theme.primary} fontSize={12} fontWeight={900} x={90} y={24} textAnchor="middle" letterSpacing={3}>TRANSPARENT</SvgText>
          </G>
        )}

        {/* 4. Top HUD Header: App name Levelyn */}
        <G transform="translate(100, 270)">
          <SvgText fill="#FFFFFF" fontSize={26} fontWeight={900} letterSpacing={8}>LEVELYN</SvgText>
          <SvgText fill={theme.primary} fontSize={13} x={0} y={26} fontWeight={800} letterSpacing={4}>FOCUS COMPANION</SvgText>
          
          <SvgText fill={theme.primary} fontSize={22} fontWeight={800} x={720} y={0} textAnchor="end" letterSpacing={6}>{formattedCategory}</SvgText>
          <SvgText fill="#E2E4EB" fontSize={14} x={720} y={26} textAnchor="end" letterSpacing={2} opacity={0.5}>{date}</SvgText>
        </G>

        {/* 5. Central Hero Minimalist Focus Session display */}
        <G transform={`translate(${canvasWidth/2}, ${canvasHeight/2 - 50})`} textAnchor="middle">
          {/* Subtle background glow circle behind time */}
          <Circle r={260} fill={theme.primary} opacity={0.03} />
          
          <SvgText fill="#FFFFFF" fontSize={180} fontWeight={900} letterSpacing={-4}>{duration}</SvgText>
          <SvgText fill={theme.primary} fontSize={20} y={75} fontWeight={800} letterSpacing={10}>ELAPSED FOCUS TIME</SvgText>
          
          {displayNote ? (
            <SvgText fill="#FFF" fontSize={26} fontWeight={500} fontStyle="italic" y={150} letterSpacing={1} opacity={0.85}>
              “{displayNote}”
            </SvgText>
          ) : (
            <SvgText fill="#E2E4EB" fontSize={15} fontWeight={600} y={145} letterSpacing={4} opacity={0.4}>FLOW STATE ACTIVE</SvgText>
          )}
        </G>

        {/* 6. Clean minimal footer branding */}
        <G transform={`translate(${canvasWidth/2}, 1660)`} textAnchor="middle">
          {/* Small minimal custom levelyn geometric icon */}
          <Path d="M -12 -20 L 0 -32 L 12 -20 M -12 -12 L 0 -24 L 12 -12" fill="none" stroke={theme.primary} strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <SvgText fill="#FFFFFF" fontSize={20} y={15} fontWeight={900} letterSpacing={8} opacity={0.9}>LEVELYN.APP</SvgText>
          <SvgText fill="#E2E4EB" fontSize={11} y={35} fontWeight={600} letterSpacing={3} opacity={0.4}>CONQUER THE TARGETS</SvgText>
        </G>
      </G>
    );
  };

  // Switch rendering based on templateId
  switch (templateId) {
    case 'aurora':
      return <Svg width={width} height={height} viewBox="0 0 1080 1920">{renderAurora()}</Svg>;
    case 'synthwave':
      return <Svg width={width} height={height} viewBox="0 0 1080 1920">{renderSynthwave()}</Svg>;
    case 'stealth':
      return <Svg width={width} height={height} viewBox="0 0 1080 1920">{renderStealth()}</Svg>;
    case 'strava_sport':
      return <Svg width={width} height={height} viewBox="0 0 1080 1920">{renderStravaSport()}</Svg>;
    case 'transparent':
      return <Svg width={width} height={height} viewBox="0 0 1080 1920">{renderTransparent()}</Svg>;
    case 'cyber_hud':
    default:
      return <Svg width={width} height={height} viewBox="0 0 1080 1920">{renderCyberHud()}</Svg>;
  }
}
