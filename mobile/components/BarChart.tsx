import React from 'react';
import { View, Text } from 'react-native';
import { Svg, Rect, Line, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useProfileStore } from '../store/profile';

export default function BarChart({ values, width = 320, height = 150 }:{values:number[]; width?:number; height?:number}){
  const max = Math.max(...values, 0.1);
  const barW = width / values.length;

  const profile = useProfileStore((s) => s.profile);
  const activeTheme = profile?.theme || 'blue';

  const themeColors = {
    blue: { primary: '#7BE7FF', secondary: '#235D7A' },
    purple: { primary: '#B77BFF', secondary: '#5A237A' },
    teal: { primary: '#0DF5C4', secondary: '#0A7A61' },
  };
  const theme = themeColors[activeTheme];

  const getWeekdayLabels = () => {
    const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      return labels[d.getDay()];
    });
  };

  const weekdayLabels = getWeekdayLabels();

  return (
    <View style={{ width, height: height + 24 }} className="items-center">
      <View style={{ width, height }}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={theme.primary} />
              <Stop offset="1" stopColor={theme.secondary} stopOpacity={0.2} />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line x1={0} y1={height * 0.25} x2={width} y2={height * 0.25} stroke="#1C1E26" strokeWidth={1} strokeDasharray="4,4" />
          <Line x1={0} y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#1C1E26" strokeWidth={1} strokeDasharray="4,4" />
          <Line x1={0} y1={height * 0.75} x2={width} y2={height * 0.75} stroke="#1C1E26" strokeWidth={1} strokeDasharray="4,4" />

          {/* Chart Bars */}
          {values.map((v, i) => {
            const h = (v / max) * (height - 20);
            const x = i * barW + 6;
            const y = height - Math.max(4, h);
            return (
              <Rect
                key={i}
                x={x}
                y={y}
                width={barW - 12}
                height={Math.max(4, h)}
                rx={6}
                fill="url(#barGrad)"
              />
            );
          })}

          {/* Glowing bottom line */}
          <Line x1={0} y1={height - 2} x2={width} y2={height - 2} stroke="#1F2330" strokeWidth={2} />
        </Svg>
      </View>

      {/* Weekday labels */}
      <View style={{ width }} className="flex-row justify-between px-2.5 mt-2">
        {weekdayLabels.map((lbl, idx) => {
          const isToday = idx === 6;
          return (
            <View key={idx} style={{ width: barW - 6 }} className="items-center">
              <Text 
                className="text-[10px] font-black tracking-wider"
                style={{ color: isToday ? theme.primary : '#4E546A' }}
              >
                {lbl}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
