import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function SkillRadarChart({ currentSkills, targetSkills }) {
  // targetSkills might be an array of { skill_name, required_level, current_level } from gap analysis

  const data = (targetSkills || []).map(gap => {
    return {
      subject: gap.skill_name || gap.skill_id,
      Current: gap.current_level || 0, // Current
      Target: gap.required_level || 5, // Target
      fullMark: 5,
    };
  });

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 border border-slate-200 rounded-xl">
        <p className="text-slate-500 text-sm font-medium">Not enough data to generate chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-center font-bold text-slate-800 mb-2 font-outfit text-lg">Skill Readiness Radar</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
          <Radar name="Current Skill" dataKey="Current" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
          <Radar name="Target Role" dataKey="Target" stroke="#059669" fill="#10b981" fillOpacity={0.2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
